# What the guard suite would owe a routines migration

Ground truth for the sweep of the routines proposal at
[2026-09-03-routines/README.md](../../2026-09-03-routines/README.md). Companion to
[fragment-mechanism.md](fragment-mechanism.md), which counts the constructs a routine would retire;
this one counts the machinery that would have to grade the retirement.

Server tooling at `9ca71c19` on `main`; corpus at `2b8b7215` on the `workflows` branch; planning
artifacts on the `.engineering` branch, which is a third repository again. Every figure below was
taken from the repository. Where a figure disagrees with the proposal, or with a comment in the
code, this document says so and gives its own.

**Nothing in the design is built.** `find workflows -maxdepth 2 -type d -name routines` prints
nothing, `grep -rn "kind: routine" workflows/` prints nothing, and `grep -rln routine src/` prints
nothing. So every guard below is one that stands today, and the risk column says what a routine
would do to it.

The suite is green as it stands. `npx tsx scripts/check-all.ts` reports **40 guards in 3.0 seconds
— 40 pass, 0 fail, 0 unmeasured**.

---

## The registry, and the scripts it does not name

`scripts/guards.ts:28-347` holds one `GUARDS` array. It has **40 entries**, which reproduces the
figure the task carried. Split two ways:

| Split | Count | Where |
|---|---|---|
| `scope: 'corpus'` | 36 | `scripts/guards.ts:349` derives `CORPUS_GUARDS` from this |
| `scope: 'repo'` | 4 | `lockfile-denylist`, `site-links`, `source-encoding`, `svg-layout`, pinned by `tests/guard-registry.test.ts:47-48` |
| `json: true` — speaks the finding protocol | 22 | a per-finding delta in `check:delta` |
| no finding protocol | 18 | compared by exit code and new output lines only (`scripts/check-delta.ts:19-21`) |

**44 scripts on disk match `^(check|validate)-.*\.ts$`**, which also reproduces. The four the
registry does not name are excused by name and reason at `tests/guard-registry.test.ts:77-86`:

| Script | Recorded reason | Reproduced? |
|---|---|---|
| `scripts/check-all.ts` | the runner that walks the registry | yes |
| `scripts/check-delta.ts` | the runner that diffs a walk against the merge-base | yes |
| `scripts/check-session-contract.ts` | needs a live session, so it has no corpus-wide form | yes |
| `scripts/check-message-binding.ts` | "holds at 107 findings the engine could not have avoided" | **no — 106** |

44 minus 4 is 40, so the reconciliation closes exactly. The test that closes it starts from the
files on disk rather than from the registry, which is what makes a forgotten guard visible
(`tests/guard-registry.test.ts:67-76`), and it also reports a reason whose script has been deleted
(`:103-104`).

Three line counts, because the proposal quotes both a script count and a line count and the two
rules that would produce them disagree. `wc -l` over the 40 registered scripts is **7,699 lines**;
over the 42 files matching `scripts/check-*.ts` it is **8,198**; over all 44 check and validate
scripts it is **8,896**. The proposal says "a 35-script,
6,749-line guard suite" (README:611) and "a suite of thirty-seven scripts" (README:1020). Neither
reproduces under any of the three rules.

`check:delta` never runs on a corpus pull request, because it materialises the merge-base in a
throwaway worktree with the submodule pinned to the commit that tree recorded
(`scripts/check-delta.ts:8-12`) and the corpus branch carries no submodule. So on the corpus side
every ledger-bearing guard is graded **absolutely**, with no ratchet.

---

## How to read the risk column

Four things put a guard in the blast radius, and a guard can be in more than one.

- **(a) second definition directory.** It reads activity files, and a routine body is an activity
  file's worth of steps living somewhere else. Unless it walks `routines/` the rules it enforces
  stop applying to the content that moved there.
- **(b) content that changes.** Stages 5 and 6 move declared reads and writes at live sites, so the
  guard reports on different ground even when its rules do not change.
- **(c) ledger goes stale.** Its findings are recorded in a file whose entries name sites the
  migration renames or deletes.
- **(d) violated by construction.** A routine body's authored form breaks one of its rules for
  reasons intrinsic to the construct, not to any particular routine.

**Nothing else.** A guard with no letter is one the migration leaves alone, and several of those are
guards a reader would expect to be affected — they are called out below rather than left to
inference.

---

## Every registered guard

Rows in registry order. "Zero or ledger" says whether a finding is a hard failure or is admissible
with a recorded verdict, and for a ledger names the file, its entry count, and **which branch it
lives on** — because a ledger on `main` cannot be edited by a corpus-only pull request.

| Guard / script | What it demands | Zero or ledger | Exemption surface | Form it reads | Routines risk |
|---|---|---|---|---|---|
| `binding-fidelity` · `scripts/check-binding-fidelity.ts` | every `step.technique` input/output key is in the bound operation's composed signature; every `{token}` and condition variable resolves to a producible bag name **in its own workflow's scope**; no declared output goes unconsumed outside its file; no bound operation's own input lacks a producer (`:4-33`) | ledger — `scripts/binding-fidelity-triage.json`, **72 entries collapsing to 70 distinct finding keys, on `main`**; all 72 verdict `harmless`; stale and misplaced entries are themselves reported (`:892`, `:910`) | 7 named rationales in the ledger; `#### artifact` outputs exempt from `dead-output` (`:24-25`); `(optional)` markings exempt from `orphan-input` (`:29-31`) | activity YAML **as written**, plus technique markdown; it resolves checkpoint fragments itself (`:61-62`, `:529`) and recurses into `activities/` subdirectories (`:496-506`) | **(a)(b)(c)(d)** — the heaviest row. See the (d) sweep below |
| `activity-variables` · `scripts/check-activity-variables.ts` | every activity's declared reads and writes match what its steps do, every declared read has a writer on every path, every declared write has a reader (`:9-23`) | **hard zero, no ledger** — stated at `:25` | none | the **loader's** materialised activities (`loadWorkflowWithDiagnostics`, `:34`, `:97`) | **(b)(d)** — the sharpest (d), because it bites at stage 3 with no column move |
| `artifact-status-once` · `scripts/check-artifact-status-once.ts` | no fenced artifact template carries a lifecycle value in its blockquote header and a closing `**Status:**` field (`:2-12`) | hard zero | none | every `.md` under the corpus root, recursively (`:45-55`) | none |
| `canonical-home-map` · `scripts/check-canonical-home-map.ts` | every row of a bound canonical-home map names a filename some technique declares under `#### artifact` in the same workflow or in `meta` (`:16-18`) | ledger — `scripts/canonical-home-map-triage.json`, **4 entries, on `main`**, 1 rationale | `README.md`, and a `{token}` template on either side (`:20-23`) | activity YAML by regex, to find `canonical_home_map` bindings (`:86-90`, non-recursive), then resources and technique markdown | **(a)** — a routine body binding the map is invisible to it |
| `nested-output-home` · `scripts/check-nested-output-home.ts` | no nested `####` output component is declared both by a technique container and by one of its operations, and none is a container component plus a sibling's top-level output (`:9-18`) | ledger — `scripts/nested-output-home-triage.json`, **2 entries, on `main`**; stale entries reported (`:165`) | the triage only | technique markdown | none |
| `inherited-inputs` · `scripts/check-inherited-inputs.ts` | no technique redeclares an input a container `TECHNIQUE.md` already composes into it (`:1-10`) | hard zero | a leaf entry adding a `#### default` or an optionality marker is an override, not a redeclaration (`:12-14`) | technique markdown | none |
| `section-framing` · `scripts/check-section-framing.ts` | no resource carries ≥100 characters of body above its first `##` while at least one other file cites it by anchor (`:15-17`, `MIN_FRAMING` at `:53`) | ledger — **`workflows/section-framing-triage.json`, 102 entries, on the `workflows` branch**, 2 rationales; stale entries reported (`:140`) | the triage only | resource markdown | none |
| `citation-grain` · `scripts/check-citation-grain.ts` | no technique cites one resource both bare and by anchor elsewhere in the same file (`:8-11`, `:20-24`) | hard zero | structural: a single-section resource, and a bare-and-anchored pair inside one line (`:15-24`) | technique markdown | none |
| `identifier-qualification` · `scripts/check-identifier-qualification.ts` | every technique top-level I/O id under `## Inputs`/`## Outputs` is a qualified noun phrase (`:4-8`) | hard zero, no baseline — stated at `:23` | `EXEMPT_DATA_IDS`, **57 ids, `src/schema/identifiers.ts:30-47`, on `main`**, shared with `VariableNameSchema` | technique markdown headings only; `####` sub-descriptors out of scope (`:10-11`) | none — but the same rule reaches routine ids through `VariableNameSchema` on the YAML side, so a routine's schema has to use it |
| `review-mode-gating` · `scripts/check-review-mode-gating.ts` | no checkpoint reachable under `is_review_mode == true`, not itself mode-aware, auto-advances to a `defaultOption` carrying an effect (`:6-13`) | hard zero **with an in-code acceptance list** — `ACCEPTED_HEADLESS_AUTO_ADVANCE`, **3 entries, `scripts/check-review-mode-gating.ts:52-62`, on `main`**; stale entries reported (`:236-242`) | that list, each entry with its reason | activity YAML **as written**, non-recursive (`:198-206`); scoped to the 2 workflows declaring `is_review_mode` — `work-package` and `remediate-vuln` | **(b)** — reachability over both scopes, and `remediate-vuln` borrows all 14 migration-touched activities |
| `audience` · `scripts/check-audience.ts` | every output declaring an `#### artifact` declares an `#### audience`, and every `audience: agent` artifact filename ends `.json` (`:4-15`) | hard zero, no baseline — stated at `:25-26` | outputs with no `#### artifact` are out of scope | technique markdown through the **markdown technique loader** (`:35`, `:74-101`) — it never opens an activity file | none |
| `artifact-guides` · `scripts/check-artifact-guides.ts` | every technique output declaring an `#### artifact` filename resolves to a creation guide, by a `## Planning artifact to guide map` row or by a resource naming it and carrying a `## Template` (`:10-18`) | ledger — `scripts/artifact-guide-baseline.json`, **absent, 0 entries, would live on `main`** (`:26-27`); stale entries reported (`:29-31`) | that absent baseline | technique markdown plus `resources/` (`:38`, `:91`, `:195-211`) — it never opens an activity file | none — a technique file does not move when its binding site does. The proposal reads it as the guard that holds a routine body's artifact-declaring technique to a guide (README:1031); it would already do that unchanged, and the once-per-activity artifact limit (README:1143-1147) is a new check rather than this one |
| `description-hygiene` · `scripts/check-description-hygiene.ts` | an activity, step or `set` description is not a procedure essay — ≥3 sentences, >160 characters, and a sequence verb (`:57-58`); a `kind: technique` step carries no `description` or `name` (`:6-7`) | hard zero; it says of itself that it is a net rather than a Detect walk (`:9-11`) | the phrase set and the two thresholds are the carve-out | activity YAML **as written**, recursive (`:138-147`) | **(a)** |
| `checkpoint-entry` · `scripts/check-checkpoint-entry.ts` | `steps[0].kind != "checkpoint"` in every activity; a gate does not exempt a first step (`:16-18`) | hard zero | none | activity YAML **as written**, non-recursive (`:38-45`) | **(b)**, and a latent **(d)** — see below |
| `checkpoint-presentation` · `scripts/check-checkpoint-presentation.ts` | no rule text outside `meta/techniques/workflow-engine/present-checkpoint-to-user.md` asserts whether a checkpoint is presented (`:16-17`) | hard zero, no acceptance list — stated at `:16-18` | fenced example rule headings are skipped | `rules.workflow`/`activity`/`universal` and `fragments.rules` in every `workflow.yaml`, activity `rules[]` (recursive, `:129`, `:166-168`), and every technique `## Rules` (`:23-25`) | none — a routine declares no rules |
| `decision-order` · `scripts/check-decision-order.ts` | no checkpoint decides a value a step **before** it is already gated on (`:4-6`) | hard zero | the keying rules and their reasons live in `docs/checkpoint-model.md`, not in a list | activity YAML **as written**, non-recursive **and top-level steps only** (`:172-184`) | **(b)** |
| `bootstrap-self-contained` · `scripts/check-bootstrap-self-contained.ts` | `meta/resources/bootstrap-protocol.md` carries no corpus markdown link, no dotted rule address the corpus declares, and no backticked bare rule name (`:11-20`) | hard zero, no baseline — stated at `:42` | a client-resolved URI, a same-document anchor, a `group::operation` label (`:22-26`) | one named resource, plus the corpus's rule index to resolve addresses | none |
| `set-action-values` · `scripts/check-set-action-values.ts` | every `set` action has a `target`; a `value` shaped like a name is braced; a literal is inside the target's declared value set (`:8-26`) | hard zero, no baseline — stated at `:27-28` | shape: booleans, numbers, null, empty collections and hyphenated prose are literals | activity YAML **as written**, recursive (`:158-180`); value sets come from `declaredVariables` (`:171-172`) | **(a)** — and inside a routine `value-outside-declared-set` goes **silent**, the target being an output rather than a workflow variable |
| `harness-adapter-set` · `scripts/check-harness-adapter-set.ts` | every harness kind in `resolve-harness-operation`'s map resolves to an adapter whose `## Rules` expose exactly the operation kinds callers ask for, and the two enumerations agree (`:4-12`) | hard zero, no baseline — stated at `:30` | fenced example rule headings; an unparseable name is reported rather than skipped (`:24-25`) | technique markdown under `meta/techniques/harness-compat`, read from inside the owning Protocol step (`:45-46`, `:252`) | none — it reads variable values, not steps |
| `launched-workflows` · `scripts/check-launched-workflows.ts` | every `triggers[]` launch is performed by a step binding `workflow-engine::handle-sub-workflow`, every such step is declared, and both name a workflow the corpus holds (`:12-16`) | hard zero, all three rules | whether a launch's result is consumed is out of scope (`:18-20`) | activity YAML **as written**, non-recursive (`:132-142`) | **(a)** — latent: the declaration sits on the host and the step would sit in the routine. No corpus site today |
| `self-provisioned-input` · `scripts/check-self-provisioned-input.ts` | no step interpolates its own `set` target into that same step's `technique.inputs` (`:13-15`) | hard zero, no baseline — stated at `:16-17` | none | activity YAML **as written**, non-recursive (`:75-85`) | **(a)** |
| `self-composed-set` · `scripts/check-self-composed-set.ts` | no `set` action interpolates its own target into surrounding text (`:1-3`, `:16-19`) | hard zero — stated at `:21` | an accumulator append: the value that **is** the target, or the target inside a JSON array or object literal (`:16-19`) | activity YAML **as written**, non-recursive (`:97-107`) | **(a)** |
| `branch-as-step` · `scripts/check-branch-as-step.ts` | no dash sub-bullet in a technique Protocol carries a conditional caveat, fallback, error path or prohibition (`:1-9`, `:15-18`) | hard zero, and it declines a triage on principle (`:22-23`) | genuine enumerations and ordered sub-actions; top-level peer bullets and indented numbered sub-items are out of scope (`:20-28`) | technique markdown (`:118-121`) | none |
| `activity-technique-overlap` · `scripts/check-activity-technique-overlap.ts` | an activity's top-level `techniques[]` may not re-list a technique any of its steps binds, top-level or in a loop body (`:4-11`) | hard zero, no baseline — stated at `:10` | none | activity YAML **as written**, non-recursive (`:57-66`) | **(a)** — and the authored form is not sufficient by itself: the overlap test has to resolve a reference step to the routine's own bindings (README:1041-1050) |
| `prism-lens-reachability` · `scripts/check-prism-lens-reachability.ts` | every lens resource under `prism/resources/` is goal-routable, pipeline-internal or a declared template, and every `slug (NN)` pair in the catalog resolves with a matching index (`:11-21`) | two hard-zero checks, no baseline — stated at `:10` | `type: template` in the resource's own frontmatter, read from the file rather than listed (`:15-17`) | `prism` resources and techniques (`:36`) | none |
| `resource-anchors` · `scripts/check-resource-anchors.ts` | every relative `.md#anchor` link resolves to a rendered heading, and every markdown fence closes (`:4-7`) | hard zero — stated at `:15` | headings inside fences, external schemes, non-`.md` targets; `bootstrap-protocol.md` is delegated (`:82-96`) | **every `.md` and `.yaml` under the corpus root, recursively** (`:72-79`) | none — **the one guard that reaches `routines/` for free**, needing no change at all |
| `technique-template` · `scripts/check-technique-template.ts` | every technique file follows the normative template: frontmatter with `metadata.version` only, no H1, the canonical five H2s in order, snake_case I/O ids, kebab-case rule names, filenameable `#### artifact` bodies (`:6-22`) | hard zero — stated at `:27` | `techniques/README.md`; headings and sigils inside fences (`:24-25`) | technique markdown (`:199-200`) | none |
| `variable-model` · `scripts/check-variable-model.ts` | five rules: `exists-on-defaulted`, `default-type-mismatch`, `setvariable-type-mismatch`, `setvariable-undeclared`, `setvariable-outside-value-set` (`:8-21`, union at `:47-52`) | hard zero — stated at `:28` | `{name}` template passthroughs on the two literal rules; only structured conditions are walked; dotted targets never match a name (`:16-26`) | `workflow.yaml` plus activity YAML **as written**, non-recursive (`:168-174`) | **(a)(b)(d)** — the (d) the proposal names |
| `fragments` · `scripts/check-fragments.ts` | nine rules over the shared-body mechanism (`:11-28`, union at `:57-65`) | hard zero — stated at `:30` | none | `workflow.yaml` `fragments` blocks plus activity YAML **as written**, non-recursive (`:169-171`) | **REMOVE** — 7 of its 9 rules die with stage 5; see below |
| `stealth-isolation` · `scripts/check-stealth-isolation.ts` | in `remediate-vuln`, every disclosure-capable step carries a gate definitively false under seeded defaults, the push remote is not `origin` with the verification step reachable first, and no reachable step's composed technique invokes a public write endpoint (`:6-19`) | hard zero for the static half; the runtime half is opt-in via `--target` (`:21-26`) | the disclosure-operation catalog in the script | the **loader's** materialised graph for one workflow (`:38`, `:144`), plus composed technique text | **(b)** — `remediate-vuln` borrows all 14 migration-touched activities (`workflows/remediate-vuln/workflow.yaml:202-216`) |
| `when-expression` · `scripts/check-when-expression.ts` | every `when:` gate parses under the reference dialect, and a bare mixture of `&&` and `\|\|` at one nesting depth is refused without parentheses (`:4-5`) | hard zero | none | activity YAML **as written**, non-recursive (`:57-66`) | **(a)** — parse-only, so no (d): a routine's `when` names an input or output id and still parses |
| `loop-shape` · `scripts/check-loop-shape.ts` | a `forEach` declares `over` and `variable` and no `continueWhile`; a repeat-until declares `continueWhile` and neither `over`, `variable` nor `breakCondition` (`:10-14`, rules at `:56-100`) | hard zero, no baseline — stated at `:28-29` | none | activity YAML **as written**, recursive (`:124-139`) | **(a)(b)** — field presence only, so no (d) |
| `refs` · `scripts/check-all-refs.ts` | every `techniques[]` entry in every activity and `workflow.yaml` resolves through the real loader (`:1-6`) | hard zero | none | the **loader** (`:11`, `:34`) | **(b)** — a shared run's technique references move into a routine file |
| `activities` · `scripts/validate-activities.ts` | every activity file validates against the activity schema | hard zero | none | activity YAML **as written**, **non-recursive** (`:110`) | **(a)** — a routine needs its own schema and its own discovery pass, and this validator does not even reach a nested activity directory. Unassigned by the proposal |
| `workflow-yaml` · `scripts/validate-workflow-yaml.ts` | every `workflow.yaml` validates against the workflow schema, and its activities and technique references validate (`:3-4`) | hard zero | none | `workflow.yaml` through the **loader** (`:17`, `:130`), activity files non-recursively (`:141`) | **(a)** — same as above. Unassigned by the proposal |
| `site-links` · `scripts/check-site-links.ts` | every internal `href`/`src` under `site/` resolves, every fragment names an existing element id, and every GitHub blob link into this repo names a file in the tree (`:2-8`) | hard zero | external hosts are not fetched | `site/**/*.html` in this repo | none |
| `svg-layout` · `scripts/check-svg-layout.ts` | no text element in a hand-authored site SVG crosses a rect border, intersects an arrow line, overlaps sibling text, or escapes the viewBox (`:2-10`) | hard zero | the glyph-width factors are deliberately conservative (`:11-13`) | inline SVG in `site/` | none |
| `source-encoding` · `scripts/check-source-encoding.ts` | no text source in this repo carries a C0 control character other than tab, newline or carriage return (`:2-13`, `ALLOWED` at `:36`) | hard zero | `SKIP_DIRS` at `:33`, which **excludes `workflows`** (`:18-19`) | this repo's own sources | none |
| `pinned-corpus-paths` · `scripts/check-pinned-corpus-paths.ts` | every corpus path a TypeScript source **reads** as a string literal still resolves in the pinned corpus (`:2-9`) | hard zero; both skip counts print on a clean run (`:16-18`) | a path a test authors into a synthetic tree, and a literal whose leading segment is not a workflow directory; `SKIP_DIRS` at `:32`; JSON ledgers are deliberately out of scope (`:20-21`) | this repo's TypeScript | none — but a routine's path pinned in TypeScript would be covered by it, unchanged |
| `lockfile-denylist` · `scripts/check-lockfile-denylist.ts` | no `package-lock.json` entry resolves to a version in `known-bad-versions.json` (`:2-13`) | hard zero | the denylist itself — `scripts/known-bad-versions.json`, **1 campaign, on `main`** | this repo's lockfile (`:24-25`) | none |

The clean run of `pinned-corpus-paths` prints its reach: **15 corpus paths pinned in TypeScript all
resolve; 5 authored into a fixture tree, 5 illustrating a shape in a comment, and 12 naming a
non-corpus id were not checked.** None of the 15 names a migration-touched activity.

---

## The (d) sweep: what a routine body breaks by construction

The task names one case and asks for the others. There are **four**, and the proposal names one.

### 1. `check-variable-model` · `setvariable-undeclared` — named by the proposal

`scripts/check-variable-model.ts:118` pushes a finding when a checkpoint option's `setVariable`
target "has no declaration in `workflow.yaml` variables[]". Inside a routine the target is a
declared **output id** or an **internal**, and an internal never enters the workflow's variable set
at all (README:196-198). So every gate in every routine violates the rule as authored. The proposal
settles it by giving the guard a name scope (README:1052-1065), which is a rule change rather than a
column move. Reproduced.

The guard's other four rules do **not** produce a second instance, and it is worth saying why each
does not, because each looked like one:

- `setvariable-outside-value-set` and `setvariable-type-mismatch` resolve the target's declared
  `values` and `type` from the workflow. A routine output declares a type but no value set
  (README:1090-1094), and an internal declares neither (README:200-205), so both rules go **silent**
  inside a routine rather than firing. Silence is a coverage loss, not a violation.
- `default-type-mismatch` compares a declaration's `defaultValue` to its own declared `type`. A
  routine input takes the shape a technique's inputs take (README:224-228), which carries no type,
  so there is nothing to compare.
- `exists-on-defaulted` needs the extension the proposal states (README:1064-1065); an `exists` gate
  on a defaulted input is constant for the same reason, but no routine has to write one.

### 2. `check-activity-variables` · `undeclared-use` — the sharpest, and unnamed

`scripts/check-activity-variables.ts` is **hard zero with no ledger** (`:25`) and it already consumes
the loader (`:34`, `:97`), which is why the proposal leaves it alone. That is what makes it the
problem. `deriveActivityContract` (`src/utils/activity-variables.ts:417`) computes what an activity
actually reads and writes by walking its steps through `flattenActivitySteps`. A materialised
internal — `implement_reconcile_assumptions_assumption_presentation` in the proposal's own example
(README:194-196) — is written and read by materialised steps and declared in no activity contract,
so it is `undeclared-use` twice over.

This fires at **stage 3**, the moment materialisation splices anything, with no column move and no
unscoped work in front of it. The proposal's stage-4 criterion covers `check-variable-model` and
internals (README:876) and says nothing about this guard; its stage-5 criterion removes the eight
host declarations (README:886-888) without saying what stops the derived side reporting them. The
mechanism — the loader excluding internals from the derivation, or the derivation learning the
category — is unspecified.

### 3. `check-binding-fidelity` · `read-resolution`, `dead-output`, `orphan-input`

The read-resolution rule requires every `{token}` to resolve "to a producible bag name **in its own
workflow's scope**" (`:12-18`, pushed at `:762` and `:773`). A routine body reads its own input ids,
which are neither workflow variables, nor technique-declared ids, nor `{$local}`s, nor set targets.
So every routine-input read is unresolvable by construction, every routine output consumed only from
a reference site reads as `dead-output` (`:785`), and every input supplied only at a reference site
reads as `orphan-input` (`:740`).

The proposal escapes this by putting the guard in the materialised column
(README:1013). **It is not there.** Its imports are `parseDefinition` and a fragment resolver
(`scripts/check-binding-fidelity.ts:55`, `:61-62`); it reads raw activity YAML at `:522-529`. The
proposal admits the gap — "that column states where four guards *should* sit, and moving each one
there is unscoped work" (README:1069) — and I confirm it independently: **none of
`check-checkpoint-entry`, `check-decision-order`, `check-review-mode-gating` or
`check-binding-fidelity` consumes the loader.** So the (d) is live until unscoped work lands.

What the guard already does is the shape of the answer: it materialises the fragment mechanism itself
before reading, via `injectCheckpointFragmentBodies` at `:529`. A routines-aware version of the same
move is materialisation at guard time.

### 4. `check-checkpoint-entry` — latent, and avoided rather than absent

`steps[0].kind != "checkpoint"` (`:16-18`, `:46-47`). The assumption routine's first step is a
checkpoint (README:248-250), so if the guard walked `routines/` as first-class activity files it
would fail on that file by construction. The proposal forecloses it by putting the guard in the
materialised column and says so plainly (README:1073-1076). Recorded here because the foreclosure
is the only thing preventing it, and the foreclosure is the unscoped loader move of instance 3.

### Two more that read like (d) and are not

`check-set-action-values` looked like one: a routine body's `set` writes to an output or internal.
But `set-without-target` is structural, `unbraced-reference` is satisfied by `"{internal_id}"`, and
`value-outside-declared-set` resolves the target's value set from `declaredVariables` (`:171-172`)
and simply finds nothing. No finding, only silence.

`check-description-hygiene` looked like one: the proposal's example routine carries a three-clause
`description` (README:221). But `isProcedureEssay` needs ≥3 sentences **and** >160 characters **and**
a sequence verb (`:57-58`), and that description is one sentence of about 110 characters. It passes.
The shape is at risk; the rule is not violated by construction.

---

## Class (a): the second definition directory, measured

**Twenty-one of the 40 registered guards open an activity file.** That is my figure; the proposal
says "Nineteen open activity files, out of a suite of thirty-seven scripts" (README:1020). Neither
half reproduces. Eighteen read the file as written; three reach it through the loader.

The eighteen split on something the proposal never mentions, and it decides how much work
`routines/` is:

**Five recurse into `activities/` subdirectories**, so they already handle a nested definition
directory and would extend to a sibling one cheaply: `check-binding-fidelity`
(`scripts/check-binding-fidelity.ts:496-506`), `check-loop-shape` (`:124-139`),
`check-set-action-values` (`:158-180`), `check-description-hygiene` (`:138-147`),
`check-checkpoint-presentation` (`:129`, `:166-168`).

**Thirteen do not**: `check-activity-technique-overlap` (`:57-66`), `check-decision-order`
(`:172-184`), `check-fragments` (`:169-171`), `check-review-mode-gating` (`:198-206`),
`check-variable-model` (`:168-174`), `check-when-expression` (`:57-66`), `check-launched-workflows`
(`:132-142`), `check-checkpoint-entry` (`:38-45`), `check-canonical-home-map` (`:86-90`),
`check-self-provisioned-input` (`:75-85`), `check-self-composed-set` (`:97-107`),
`validate-activities` (`:110`), `validate-workflow-yaml` (`:141`).

The consequence is measurable today. The corpus holds **122 activity YAML files**: 117 at
`<workflow>/activities/*.yaml` and **5 at `meta/activities/patterns/`**. `npm run check:activities`
prints "Total: 117 passed" — the five nested pattern activities **never validate against the
activity schema at all**. Nor are they in any loaded graph: `loadActivitiesFromDir`
(`src/loaders/workflow-loader.ts:72-107`) is non-recursive, no `workflow.yaml` in the corpus
references them, and the corpus documents the fact itself —
"meta pattern activities live under `meta/activities/patterns/` (subdirectory — not part of meta's
lifecycle graph)" (`workflows/workflow-design/resources/schema-construct-inventory.md:37`).

**Those five files are stage 8's site.** `01-orchestrator-workers`, `04-isolated-fan-out` and
`05-lead-researcher` are exactly where the fan-out routine lands (README:936-938). So the stage that
looks cheapest lands in the part of the corpus the loader never loads, the schema never validates,
and every loader-consuming guard never sees.

One guard needs no change whatever. `check-resource-anchors` walks every `.md` **and `.yaml`** under
the corpus root recursively (`:72-79`), so `routines/*.yaml` arrives in its scan the day the
directory exists.

Also uncovered by the proposal's own classification table: `check-canonical-home-map`,
`check-launched-workflows`, `validate-activities` and `validate-workflow-yaml` are in the (a) class
and the proposal assigns none of them a column. Its table covers eleven guards plus
`check-harness-adapter-set`, then eight more, then two it sets outside the classification
(README:1008-1039). Counting the repeat once, that is **twenty-one of forty** guards placed
anywhere; nineteen are unplaced.

---

## Class (b): what the migrations move

**Stage 5** converges four hosts — `work-package/activities/04-research.yaml`,
`05-implementation-analysis.yaml`, `07-assumptions-review.yaml`, `08-implement.yaml` — and removes
the `fragments` block from `work-package/workflow.yaml`.

**Stage 6** converges seven sites: those four plus `02-design-philosophy.yaml`,
`06-plan-prepare.yaml`, `15-codebase-comprehension.yaml`.

Reproduced from the corpus: **ten names are declared as writes at all four stage-5 hosts.** Seven of
them are the assumption run's — `assumption_outcome`, `assumption_review_presentation`,
`current_assumption`, `has_deferred_assumptions`, `has_open_assumptions`,
`needs_individual_interview`, `open_assumptions` — which is **28 declarations of 7 names**, exactly
as the proposal states (README:37-38). The other three belong to the convergence run:
`assumptions_log`, `challenge_findings`, `has_resolvable_assumptions`. Declared write totals per
host are 15, 11, 12 and 17.

`challenge_findings` is a declared activity-level write at **seven** sites, not six: all seven
convergence activities carry `- name: challenge_findings`. The proposal says six at README:208,
README:905 and `re-derivation.md:257`. `fragment-mechanism.md` reaches the same seven independently.

None of the three convergence names appears in `workflows/work-package/workflow.yaml` `variables[]`,
so all three are activity-owned today.

What that does to the guards, measured rather than argued:

| Guard | What stages 5 and 6 move under it |
|---|---|
| `activity-variables` | 28 + 21 declarations at 7 files change direction or disappear; hard zero, no ledger |
| `binding-fidelity` | the four hosts' step bindings move into two routine files, taking their reads and writes with them |
| `variable-model` | the four batch gates' `setVariable` effects move into a routine body |
| `decision-order`, `checkpoint-entry`, `review-mode-gating` | all three read the four hosts as written and none consumes the loader |
| `stealth-isolation` | `remediate-vuln` borrows **14** work-package activities, including all four stage-5 hosts and all seven stage-6 sites |
| `refs`, `workflow-yaml` | both resolve through the loader, so a declaration disagreement introduced by output injection takes them down |
| `loop-shape` | the `doWhile` at six sites and the `while` at the seventh move into routine files |
| `activities` | the host files shrink; the routine files validate against nothing |

The proposal's own conversion rerun corroborates the loader set exactly. With the corpus converted
and the server unchanged, **four guards failed — `activity-variables`, `stealth-isolation`, `refs`
and `workflow-yaml`** — all on one message, because a declaration disagreement is a load failure and
takes down every loader-based guard at once (`conversion-rerun.md:234-241`). That is precisely the
four registered loader consumers measured here, independently arrived at.

`remediate-vuln/workflow.yaml:202-216` lists 14 borrowed activities. The proposal says thirteen
(README:574).

**Stages 7 and 8 move no gate at all.** The three prism per-unit activities
(`prism/activities/02-adversarial-pass.yaml`, `03-synthesis-pass.yaml`,
`05-behavioral-synthesis-pass.yaml`) declare **zero** `kind: checkpoint` steps and one `action: set`
each. The three fan-out pattern activities declare **zero** checkpoints. So neither stage touches
option coverage, and the accumulating `set` is the only guard-visible construct crossing into a
routine there.

---

## Class (c): ledger staleness, measured rather than feared

Eight recorded-verdict surfaces exist. **Seven are on `main`; one is on the `workflows` branch.**

| Surface | Entries | Branch | Entries naming a site stages 5-8 rename or delete |
|---|---|---|---|
| `scripts/binding-fidelity-triage.json` | 72 (70 distinct keys) | `main` | **0** |
| `workflows/section-framing-triage.json` | 102 | **`workflows`** | **0** |
| `src/schema/identifiers.ts` `EXEMPT_DATA_IDS` | 57 | `main` | 0 |
| `scripts/canonical-home-map-triage.json` | 4 | `main` | 0 |
| `scripts/check-review-mode-gating.ts` `ACCEPTED_HEADLESS_AUTO_ADVANCE` | 3 | `main` | **0** |
| `scripts/nested-output-home-triage.json` | 2 | `main` | 0 |
| `scripts/known-bad-versions.json` | 1 campaign | `main` | 0 |
| `scripts/artifact-guide-baseline.json` | absent | `main` | 0 |

**The staleness risk is smaller than it looks, and the reason is structural.** The binding-fidelity
ledger's 21 `orphan-input` entries are keyed on `<binding workflow> :: <operation>` rather than on a
step, deliberately — "the same unsupplied input bound at N steps is one seam defect, and the
baseline stays stable when steps move" (`scripts/check-binding-fidelity.ts:31-32`). Its 43
`dead-output` and 8 `read-resolution` entries all name technique markdown or a `workflow.yaml`, not
an activity. So a wholesale rename of activity step identifiers moves none of them.

The three `ACCEPTED_HEADLESS_AUTO_ADVANCE` keys are
`work-package::codebase-comprehension::comprehension-sufficient`,
`::requirements-elicitation::elicitation-complete` and `::research::context-scope-declaration`. The
first sits at `15-codebase-comprehension.yaml:128`, inside the `while` loop stage 6 converges — but
`re-derivation.md:52-56` puts the sufficiency gate **outside** the routine, with the activity. So all
three keys survive.

The section-framing ledger's 102 entries are all `<workflow>/resources/*.md`. One of them names
`work-package/resources/assumption-reconciliation.md`, the guide for the run stage 5 converges; the
entry describes the resource's prose, which the migration does not touch.

**What does go stale is not a guard ledger.** It is the option-coverage expectation, below.

The binding-fidelity ledger carries a live drift signal of its own kind:
`scripts/check-binding-fidelity.ts:831-843` prints "triage verdicts were made against corpus
`f37337098012`, the checkout is at `2b8b7215a8b7` — 35 corpus commit(s) since". That note fires
today, before any routine exists.

---

## One. The option-coverage walk

**It does not run in `test:ci`.** `tests/e2e/option-coverage.test.ts:93` is
`describe.skipIf(process.env.WF_OPTION_COVERAGE !== '1')`, so `npm run test:ci` — plain `vitest run`
(`package.json:22`) — skips the whole block. It is invoked as
`npm run test:coverage-walk` = `WF_OPTION_COVERAGE=1 vitest run tests/e2e/option-coverage.test.ts`
(`package.json:23`), and in CI by a job of its own, `.github/workflows/coverage.yml:104`, with
`timeout-minutes: 70` (`:46`) over the test's own 3,600-second timeout
(`tests/e2e/option-coverage.test.ts:218`).

**The roster** is `WALKED` in `tests/e2e/walked-workflows.ts:20-35` — 14 workflows, ordered slowest
first, `work-package` at the top and accounting for the whole wall clock. `NOT_WALKED` (`:51-55`)
carries the 3 the corpus declares and the walk leaves out, each with its reason. The corpus holds
**17** `workflow.yaml` files, and 14 + 3 = 17 closes.

**The uncovered-option expectation** is `tests/e2e/option-coverage.json`, read at
`tests/e2e/option-coverage.test.ts:74`. It holds **3 groups carrying 113 options** — 90 gated on a
value only the agent or environment produces, 16 on a run mode the enumerator does not set, 7
declared only by `remediate-vuln`. The list can only shrink: an unlisted uncovered option fails
(`:193-197`), a listed option that becomes covered fails (`:198-202`), and a listed option no
definition declares fails — but only on an unscoped run (`:182`, `:187-191`).

**What adding a corpus workflow does.** `tests/e2e/coverage-roster.test.ts:22-35` fails if a corpus
workflow is on neither list, and fails again if the roster names one the corpus does not hold. That
test is deliberately in the cheap suite ("this check costs nothing, so it belongs in the suite every
change runs", `:11-13`), so it runs in `test:ci` — **on `main` only**. A corpus pull request never
runs it.

**What converting a workflow does.** An option key is
`checkpoint:${activityId}:${checkpointId}=${optionId}` (`tests/e2e/coverage.ts:22`), built from the
**loaded** activities via `flattenActivitySteps` (`:39`). Materialised routine steps therefore
arrive in the denominator automatically — under **prefixed** identifiers. Measured against the
committed expectation: **12 of the 113 listed options name a gate stage 5 renames** —

```
checkpoint:research:research-assumption-interview={accept-agent-positions,defer-all,interview-individually}
checkpoint:implementation-analysis:analysis-assumption-interview={…same three…}
checkpoint:assumptions-review:residual-assumption-batch={…same three…}
checkpoint:implement:implementation-assumption-interview={…same three…}
```

Every one becomes `…:reconcile-assumptions.batch-gate=…` or the site's equivalent. So stage 5 fails
the walk **twice over the same twelve options**: as 12 stale entries and as 12 newly unreached keys.
Stages 6, 7 and 8 move **zero** option keys, for the reasons measured above.

**The dry-walk plateau.** `DRY_WALKS` defaults to **50**, overridable by `WF_DRY_WALKS`
(`tests/e2e/option-coverage.test.ts:57`). The recorded measurement of the plateau is in the same
comment (`:41-56`): 50 covers 154 of 275 declared options across 14 workflows in 1,144 seconds; the
plateau is a property of the graph and has to be re-measured whenever the graph grows; on
`workflow-design` a value of **30** ends the streak before three `batch-review-attested` options are
reached and **36 is the lowest value that clears**, with 50 sitting above it rather than on it. The
enumerator also runs with `maxVisits: 3, maxWalks: 120` (`:134`).

**A routine file changes coverage and the walk does not run.** `classifyChange`
(`scripts/coverage-scope.ts:55-64`) recognises exactly two path shapes: `<wf>/workflow.yaml`, and
`<wf>/activities/**.ya?ml`. A change to `<wf>/routines/<name>.yaml` matches neither, so the scope
comes out empty, `.github/workflows/coverage.yml` writes `scope=none` (`:96`), and the walk step is
skipped outright by `if: steps.scope.outputs.scope != 'none'` (`:101`). A change to a shared
routine's gate options would therefore be graded by nothing — while its steps are materialised into
every referring activity in every workflow that holds one. `tests/coverage-scope.test.ts:32-41` pins
the "ignores what cannot move option coverage" behaviour, so the omission is asserted rather than
accidental.

---

## Two. The committed artifacts a corpus-moving change invalidates

Five, and every one is on `main`.

| Artifact | What it records | Regenerated by | Exposure to stages 5-6 |
|---|---|---|---|
| `tests/e2e/__snapshots__/corpus-sha.json` | the corpus commit the walk baselines were generated against (`tests/corpus-stamp.ts:17`, `:37-44`) | `npm run baseline:stamp` (`package.json:63`, `scripts/stamp-corpus-baseline.ts`) | always — any corpus bump |
| `tests/e2e/__snapshots__/snapshot.test.ts.snap` | 7 committed `work-package` walk manifests, one per policy plus the declared-step check | `npm run test:ci -- -u` (`tests/e2e/snapshot.test.ts:56`) | **96 occurrences** of the three convergence step ids: `reconcile-assumptions` 34, `combine-assumption-challenges` 31, `challenge-assumptions` 31 |
| `scripts/fixtures/token-benchmark-baseline.json` | 1,421,070 delivered characters over the twelve-activity `work-package` walk at `workflows@95660422` | `npm run bench:token -- --label=rerecord --context-mode=fresh --no-compare` (`scripts/run-token-benchmark.ts:20-21`) | always — stages 5 and 6 change delivery at four and seven sites |
| `tests/e2e/walked-workflows.ts` | the 14 walked and 3 not-walked workflows | hand-edited; policed by `tests/e2e/coverage-roster.test.ts` | only if the migration adds or removes a workflow |
| `tests/e2e/option-coverage.json` | 113 options in 3 reasoned groups | hand-edited; re-derived from a `npm run test:coverage-walk` log | **12 entries**, stage 5 |

The delivery gate is `npm run --silent bench:token -- --label=ci --context-mode=fresh --gate`
(`.github/workflows/verify.yml:70`), and the gate percentage is **1%** —
`DEFAULT_MAX_REGRESSION_PCT = 1` at `scripts/run-token-benchmark.ts:175`, overridable by
`--max-regression-pct`. A comparison across mismatched context modes is reported and can never pass
the gate (`:38-42`, `:348`). The proposal predicts 5,263 characters moving out of eager delivery
(README:481-483) against a 1,421,070-character baseline, which is 0.37% — under the gate, and in the
direction the gate does not police, since the gate fails on a **regression** only.

The stamp is currently stale in this working tree: it names `cc09d641` while the corpus checkout is
at `2b8b7215`, and the parent's committed gitlink is `a904da93`. That is a normal mid-branch state,
and it is exactly why the pull-request check in `.github/actions/workflows-corpus:38-53` compares two
gitlinks instead of reading the stamp — the stamp is "a file recording the provenance of sibling
files, so a merge can take it from one parent and the baselines it speaks for from the other"
(`tests/e2e/snapshot.test.ts:47-52`).

One more generated artifact, and it has no gate at all. `schemas/` holds **6** generated JSON
schemas, written by `scripts/generate-schemas.ts` (`:20`). There is no `--check` mode, and
`npm run build:schemas` appears in neither `test:ci` nor `verify.yml`. So a forgotten regeneration
passes continuous integration while authors see spurious errors on valid definitions. Stage 3's
criterion asks for the verifying variant (README:846-848), and adds a **seventh** schema to forget.

---

## Three. The two-branch mechanics, and what stage 5's criterion actually needs

### Which job grades what

**A corpus pull request** — base `workflows` — is graded by `.github/workflows/verify-corpus.yml`,
which lives on the corpus branch because "GitHub reads a pull-request workflow file from the head
ref" (`:12-13`). It checks out **`main`'s tooling** (`:38-41`), then the **corpus branch tip**
(`:53-58`, the tip and not the merge result, for a stated reason at `:44-52`), and runs exactly one
thing: `npm run check:all` (`:70`).

**Guards only.** The file says so and says why: "Guards only, not the test suite. The walk snapshots
are stamped against one corpus commit, so running them here would compare a pull request's corpus to
a baseline generated from a different one and fail on the difference rather than on a defect"
(`:16-19`). So a corpus pull request runs **no** `test:ci`, **no** walk snapshot, **no** coverage
walk, **no** token gate, and **no** `check:delta`. It also runs the four `scope: 'repo'` guards
against `main`'s files rather than the corpus — `check:all` accepts `--corpus-only`
(`scripts/check-all.ts:8`) and `verify-corpus.yml` does not pass it.

**A server pull request** — base `main` — is graded by `.github/workflows/verify.yml`: `typecheck`
(`:49`), `test:ci` (`:54`), `check:all` (`:59`), and the delivery gate (`:70`); plus
`.github/workflows/coverage.yml` for the option walk. Both resolve the corpus by
`git rev-parse HEAD:workflows` (`.github/actions/workflows-corpus:19`) — **the gitlink the merge
tree adopts**, checked out separately because the submodule sits behind an SSH URL the default token
cannot use (`:8-13`). A pull request additionally has to prove that the branch's gitlink and the
merge's gitlink agree (`:38-53`), or it fails with instructions to merge the base in and re-baseline.

### What a change needing both halves has to do

The corpus job borrows `main`'s tooling from `ref: main` — not from the paired server branch. So a
corpus pull request converting activities to routines is graded by a `check:all` that has no
`routines/` discovery, no `kind: routine` in `StepSchema`, and no materialisation pass. Every
converted activity fails `check:activities` on an unknown step kind, and every routine file is
invisible. **The corpus half cannot be green until the server half is on `main`.** The ordering is
forced:

1. **Server pull request into `main`** carrying stages 3 and 4 — the construct, the boundary, the
   `routines/` discovery, the schema, and every guard change. It is graded against the gitlink's
   **un-migrated** corpus, so it must leave delivery byte-identical for an activity carrying no
   routine (README:863) and change no committed baseline.
2. **Corpus pull request into `workflows`** carrying stages 5 and 6. Now `ref: main` has the tooling.
   It gets `check:all` and nothing else.
3. **Submodule-bump pull request into `main`** moving the gitlink to the merged corpus, re-recording
   the stamp, the 7 walk snapshots, the token baseline and the 12 option-coverage entries in one
   commit — which is what `.github/actions/workflows-corpus:38-53` demands and what
   `tests/e2e/snapshot.test.ts:53-57` tells you to do.

### Can continuous integration satisfy stage 5's criterion?

The criterion is: "The full guard suite **and the walker** pass over the migrated corpus, not over a
scratch copy" (README:889), repeated for stage 6 (README:908), with the standing rule that "a
migration that changes behaviour at a live site is walked before merge" (README:815-818).

**No, not at the point it matters.** Stated plainly:

- **The guard-suite half is satisfiable on the corpus pull request.** `verify-corpus.yml` runs
  `npm run check:all` against the branch tip, which is the migrated corpus and not a scratch copy.
  That half is genuinely covered — once step 1 has merged.
- **The walker half is not.** No job that runs the walker ever points at a corpus branch tip. The
  walk snapshots and the coverage walk both live in the `main`-side jobs, both resolve the corpus
  from `HEAD:workflows`, and the corpus job excludes the test suite on purpose. So the earliest
  automated walk over the migrated corpus is **step 3**, a pull request opened after the corpus has
  already merged. "Before merge" is unachievable for the merge that carries the change.

**What does satisfy it** is a local run in a worktree with the corpus checked out at the branch tip,
which the tooling already supports and which the guards are written for: every corpus guard takes
`--root <path>` or `WORKFLOWS_DIR` (`scripts/check-audience.ts:29-31` states the convention),
`npm run worktree:provision` exists (`package.json:62`), the walk harness reads the corpus through
`tests/corpus-root.ts`, and `npm run test:coverage-walk` plus `npm run test:ci -- -u` and
`npm run baseline:stamp` are the three commands that produce the evidence. The criterion is a
**human-run gate**, and the migration plan should say so rather than reading as something a job will
enforce.

Two further consequences worth carrying:

- **A corpus pull request cannot edit a ledger on `main`.** Seven of the eight recorded-verdict
  surfaces are there. If stage 5 or 6 turned a `main`-side ledger entry stale, the corpus pull
  request would be red with no fix available inside it. Measured above: **zero entries in any of the
  eight name a site the migration renames**, so this hazard does not fire. It is the reason the
  `section-framing` ledger was put on the corpus branch in the first place — "The triage lives with
  the corpus. Its entries are judgements about corpus prose"
  (`scripts/check-section-framing.ts:35-36`) — and the reason any new routines-era ledger belongs
  there too.
- **A corpus pull request gets no ratchet.** `check:delta` cannot run there, so a guard that would
  have accepted a pre-existing finding as "not mine" grades absolutely instead.

---

## Counts, so a later reader can re-take them

**Registry and disk.** 40 registered guards; 44 `check|validate` scripts on disk; 4 excused by name
and reason; 36 corpus-scoped, 4 repo-scoped; 22 speaking the finding protocol, 18 not. 7,699 lines
across the 40 registered scripts.

**Risk classes.** A guard can hold more than one letter, so the class counts sum above 40; the
last row is the number of distinct guards carrying at least one letter.

| Class | Count | Guards |
|---|---|---|
| (a) would have to walk `routines/` | **12** | `activity-technique-overlap`, `canonical-home-map`, `description-hygiene`, `launched-workflows`, `loop-shape`, `self-composed-set`, `self-provisioned-input`, `set-action-values`, `variable-model`, `when-expression`, `activities`, `workflow-yaml` — plus `binding-fidelity` if it stays authored, and `fragments` which retires instead |
| (b) reports on content stages 5-6 move | **11** | `activity-variables`, `binding-fidelity`, `checkpoint-entry`, `decision-order`, `fragments`, `loop-shape`, `refs`, `review-mode-gating`, `stealth-isolation`, `variable-model`, `workflow-yaml` |
| (c) ledger entries could go stale | **8 surfaces, 0 entries at risk** | measured entry-by-entry above |
| (d) violated by a routine's authored form | **4** | `variable-model` (named), `activity-variables` (unnamed, fires at stage 3), `binding-fidelity` (unnamed, conditional on the loader move), `checkpoint-entry` (latent, foreclosed by the same loader move) |
| **In the blast radius at all** | **20 of 40** | the union of (a), (b) and (d); (d) adds no guard the other two do not already hold |
| **Untouched** | **20 of 40** | `artifact-status-once`, `nested-output-home`, `inherited-inputs`, `section-framing`, `citation-grain`, `identifier-qualification`, `audience`, `artifact-guides`, `checkpoint-presentation`, `bootstrap-self-contained`, `harness-adapter-set`, `branch-as-step`, `prism-lens-reachability`, `resource-anchors`, `technique-template`, `site-links`, `svg-layout`, `source-encoding`, `pinned-corpus-paths`, `lockfile-denylist` |

**Guards that walk `routines/`, by the proposal's own assignment: 9** — `variable-model`,
`loop-shape`, `activity-technique-overlap`, `fragments`, `when-expression`, `set-action-values`,
`self-composed-set`, `self-provisioned-input`, `description-hygiene` (README:1008-1028). **By this
measurement: 12**, adding `canonical-home-map`, `launched-workflows` and a routine-schema sibling for
the two validators, and subtracting `fragments`, which retires. `check-resource-anchors` makes 13
without being changed.

**Guards that consume the workflow loader: 4 of the 40 registered** — `activity-variables`
(`scripts/check-activity-variables.ts:34`), `stealth-isolation` (`:38`), `refs`
(`scripts/check-all-refs.ts:11`) and `workflow-yaml` (`scripts/validate-workflow-yaml.ts:17`) —
plus `check-session-contract` outside the registry (`:31`). The proposal names six
(README:1066-1068), including `check-audience` and `check-artifact-guides`; both read technique
markdown through the **markdown technique loader** (`scripts/check-audience.ts:35`,
`scripts/check-artifact-guides.ts:38`) and never open an activity file, and it omits
`validate-workflow-yaml`, which does consume the workflow loader.

**Corpus figures.** 17 workflows; 122 activity YAML files, of which 117 validate and 5 do not; 113
distinct declared checkpoints; 285 distinct declared option keys; 22 checkpoint occurrences inside a
loop body; 8 fragment reference sites in 4 activity files against 2 declared fragment bodies.

---

## Figures stated in the repository or the proposal that could not be reproduced

| Figure | Where | Measured here | Cause |
|---|---|---|---|
| `check-message-binding` "holds at 107 findings" | `tests/guard-registry.test.ts:83` | **106** | corpus movement since the reason was written |
| "155 of the corpus's 276 options are taken, and of the 121 that are not…" | `tests/e2e/option-coverage.test.ts:26-28` | **285 declared** by a direct parse of all 122 activity files; the expectation file lists **113**, not 121 | corpus movement; the list shrank by 8 |
| "50 covers 154 of 275 declared options" | `tests/e2e/option-coverage.test.ts:44` | 275 in one comment, 276 in another, 285 by parse | two figures in one file, neither current |
| "Nineteen open activity files, out of a suite of thirty-seven scripts" | README:1020 | **21 of 40 registered**, 18 as written and 3 through the loader | different denominator, and movement |
| "a 35-script, 6,749-line guard suite" | README:611 | 40 registered / 7,699 lines; 42 `check-*.ts` / 8,198; 44 check and validate scripts / 8,896 | no rule reproduces it |
| "Six guards consume the loader today" | README:1066 | **4 registered** plus one unregistered; two of the named six read technique markdown instead, and one real consumer is unnamed. `conversion-rerun.md:234-235` reaches the same four | misclassification |
| "a 30-guard registered suite; there are now 37 `check-*` scripts and 19 of them read activity files, five of which the proposal's classification does not reach" | `conversion-rerun.md:476-478` | 40 registered, 42 `check-*.ts`, **21** reading activity files, and the classification places 21 of the 40 | corpus and suite movement |
| `check-binding-fidelity`, `check-decision-order`, `check-review-mode-gating`, `check-checkpoint-entry` read "the materialised activity" | README:1008-1013 | **none** consumes the loader; all four parse raw activity YAML | the proposal admits it at README:1069, the table does not |
| "`challenge_findings` is a declared activity-level write at six sites" | README:208, README:905 | **seven** — all seven convergence activities | taken mid-flight, never re-taken |
| "one workflow borrows thirteen activities from another" | README:574 | **14** — `remediate-vuln/workflow.yaml:202-216` | arithmetic or movement |
| "26 maximal windows, five of them nested" (stage 1) vs "Fourteen maximal shared windows" | README:825 vs `drift-census.md:37` | two searches in one folder; `fragment-mechanism.md` reproduces the 26/21/5 figure under the corrected rule | the census predates the corrected search |

Reproduced without change: 40 registry entries; 44 scripts on disk closing to 40 through 4 recorded
reasons; 4 repo-scoped guards; 9 fragment rules partitioning 7-and-2; 28 declarations of the
assumption run's 7 names at the 4 hosts; the 1% delivery gate; `DRY_WALKS = 50`; 14 walked plus 3
not-walked equalling the corpus's 17 workflows.

---

## Re-taking every figure

```
# the registry and the scripts on disk
npx tsx scripts/check-all.ts
ls scripts/ | grep -cE '^(check|validate)-.*\.ts$'
wc -l scripts/check-*.ts | tail -1
npx vitest run tests/guard-registry.test.ts

# ledgers: entry counts and branch
python3 -c "import json;print(len(json.load(open('scripts/binding-fidelity-triage.json'))['entries']))"
python3 -c "import json;print(len(json.load(open('workflows/section-framing-triage.json'))['entries']))"
python3 -c "import json;print(len(json.load(open('scripts/canonical-home-map-triage.json'))['entries']))"
python3 -c "import json;print(len(json.load(open('scripts/nested-output-home-triage.json'))['entries']))"
git -C workflows ls-tree HEAD --name-only
npx tsx scripts/check-binding-fidelity.ts | tail -3

# which guards open an activity file, and which recurse
grep -rn "'activities'" scripts/check-*.ts scripts/validate-*.ts
grep -n "loadWorkflow\|loadWorkflowWithDiagnostics" scripts/check-*.ts scripts/validate-*.ts

# the five activity files nothing validates
find workflows -path '*/activities/*.yaml' -print | wc -l
find workflows -path '*/activities/*/*.yaml' -print
npm run check:activities | tail -3

# option coverage
python3 -c "import json;d=json.load(open('tests/e2e/option-coverage.json'));print(sum(len(g['options']) for g in d['groups']))"
grep -n "DRY_WALKS\|skipIf\|EXPECTED_PATH" tests/e2e/option-coverage.test.ts
grep -n "parts\[1\] === 'activities'" scripts/coverage-scope.ts

# committed artifacts
cat tests/e2e/__snapshots__/corpus-sha.json
grep -o "reconcile-assumptions\|challenge-assumptions\|combine-assumption-challenges" \
  tests/e2e/__snapshots__/snapshot.test.ts.snap | sort | uniq -c
grep -n "DEFAULT_MAX_REGRESSION_PCT" scripts/run-token-benchmark.ts
ls schemas/

# two-branch mechanics
cat workflows/.github/workflows/verify-corpus.yml
cat .github/actions/workflows-corpus/action.yml
grep -n "run:" .github/workflows/verify.yml .github/workflows/coverage.yml

# the migration's own surface
grep -rn "challenge_findings" workflows/work-package/activities/
grep -n "activities:" -A 20 workflows/remediate-vuln/workflow.yaml
grep -c "kind: checkpoint" workflows/meta/activities/patterns/*.yaml workflows/prism/activities/0*.yaml
```

The per-host declaration tallies, the corpus-wide option-key count and the ledger cross-reference
against the migration's sites were taken with throwaway scripts whose rules are stated in full
above: declarations are read from each activity's `variables.writes[].name`; an option key is
`checkpoint:<activity id>:<checkpoint id>=<option id>` over every `kind: checkpoint` step at any loop
depth in all 122 activity files, with a `ref:` checkpoint resolved against
`workflow.yaml` `fragments.checkpoints`; a ledger entry counts as touched when its serialised JSON
contains any stage-5, stage-6, stage-7 or stage-8 site path or activity filename.
