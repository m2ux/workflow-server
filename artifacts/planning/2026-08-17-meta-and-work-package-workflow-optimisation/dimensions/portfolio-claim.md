---
Lens: 07 — claim ("What assumptions hide?")
Dimension: Change Economics
Target: /home/mike1/projects/dev/workflow-server — workflows/meta/**, workflows/work-package/**; implementation surface src/**, scripts/**
Input priced: mechanisation-potential/DEFINITIVE-FINDINGS.md and mechanisation-potential/REPORT.md (MECH-01 … MECH-12)
Evaluation Date: 2026-08-17
---

# Portfolio Lens 07 — `claim` over the mechanisation candidate set

Lens `claim` (expose hidden assumptions about timing, causality, resources and human behaviour), serving the **Change Economics** dimension, run against the twelve mechanisation opportunities recorded for `workflows/meta` and `workflows/work-package` and against the change surface those opportunities imply.

The artifact under the lens is the candidate set itself. Every one of the twelve items carries a price — "a convention", "a single rename", "a script", "one atomic operation" — and every price rests on empirical claims about when a change can land, what causes a mechanised step to actually execute, what resources are present at the moment of execution, and how authors and readers behave afterwards. This lens extracts those claims, assumes each false, and prices the corruption.

Guard runs and file measurements below were executed read-only against the working checkout: server repo at `/home/mike1/projects/dev/workflow-server`, `workflows` submodule checked out at `34cd5429`, superproject pointer at `acbbf1bc`.

---

## 1. Claim inventory

Fifteen empirical claims are load-bearing for the candidate set's pricing. Class is the lens's own partition: **T**iming, **C**ausality, **R**esource, **H**uman behaviour.

| ID | Claim the candidate set embeds | Class | Where it is asserted | Verified status |
|----|-------------------------------|-------|----------------------|-----------------|
| K1 | A protocol step naming a repo script causes that script to run at run time | C | MECH-01; REPORT Corrections #1 | **False for meta / work-package.** Zero references to a server checkout, `WORKFLOWS_DIR` or a repo root exist anywhere in those two workflows |
| K2 | The capability is "already shipped and in use", so the enabling change is a convention not machinery | C, R | REPORT Executive Summary; MECH-01 adversarial note | **Half false.** 6 invocation lines exist across 3 files; **2 of the 6 are defective** and nothing detects it |
| K3 | The convention closes MECH-04, 05, 07, 08 and 11 "as a class" | C | REPORT Corrections #1 | **False.** MECH-05 is a race no invocation closes; MECH-04's implementation surface is the planning folder, not the corpus |
| K4 | Definition, script and tool are interchangeable implementation surfaces, chosen by convenience | R | Classification column throughout | **False.** Only one of the three is guaranteed present when a `work-package` run executes |
| K5 | A guard "in the style of the existing 26" is a cheap adjunct to the convention | R | MECH-01 Recommendation | Partly true — 88–151 LOC precedent — but the guard must check a CLI surface, which no existing guard does |
| K6 | MECH-02 is "a single `step.technique.inputs` rename" | C | MECH-02 Recommendation | **True for the edit, false for the effect.** The renamed input reads a bag value written before the edit existed |
| K7 | Pointing the anchor guard at the planning folder with `--root` is the cheap part | R | MECH-07 Recommendation | **False.** `check-resource-anchors.ts` skips every target resolving outside its root and never asserts it scanned anything |
| K8 | The saving is measurable with `record_usage` and the three benchmark scripts | R, T | Analysis brief; implied throughout | **False for eleven of twelve.** The `bench:token` gate cannot resolve anything under 13,555 chars; the largest candidate is 3,979 |
| K9 | The 26 guards are a resource already paid for, "reachable but unreached" | R | MECH-01 Impact | Reachable from CI and from a `workflow-design` run; **not** from a `work-package` run in a user repo |
| K10 | MECH-11 and MECH-12 should be "sequenced last" because their value is lowest | T | MECH-11, MECH-12 Recommendation | **Inverted by the fixed per-landing cost.** Deferring a cheap definition edit costs a second full re-baseline |
| K11 | An author handed the convention in `TECHNIQUE.md` will follow it | H | MECH-01 Recommendation | **Contradicted by the sample.** 33% of existing invocation sites drifted from the script they name |
| K12 | A triage entry is a human judgement that stays true | H | Contract Restatement Conservation | 69 entries, **all 69 "harmless"**, stamped `corpusSha 3569e937` — matching neither the recorded pointer nor the checkout |
| K13 | A reader consults Progress cells first, so a wrong cell has a reader | H | MECH-04 Impact | Asserted, not measured; nothing in the run re-reads them, which the finding itself concedes |
| K14 | `check-binding-fidelity` polices the binding class these fixes belong to | R | MECH-02 framing; MECH-01 Conservation Law | **False at the boundary.** `{type}` in `naming-conventions.md:45` has no producer anywhere and the guard runs green with 0 untriaged |
| K15 | Sessions already running are not part of the change's cost | T, H | Silence across all twelve items | **False.** `seedDefaults` fires only at session creation; the resume path checks four drift kinds and never workflow version |

### The measurements behind the status column

**K1 / K9 — the invocation surface, measured.** Every script invocation in the whole 21-workflow corpus:

```
workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:22,23
workflows/workflow-design/techniques/yaml-authoring.md:52
workflows/workflow-design/techniques/audit-schema-validation.md:24,30,34
```

Six lines, three files, two workflows — both of which take this repository as their subject. `workflows/meta` and `workflows/work-package` contain zero. Each invocation is a bare relative path (`npx tsx scripts/…`), so each assumes the executing agent's working directory is a `workflow-server` checkout with `node_modules` installed and the `workflows` submodule populated. Neither workflow binds any variable naming such a checkout: a corpus-wide search of both for `server_root`, `WORKFLOWS_DIR` and `repo_root` returns nothing.

**K2 / K11 — the exemplar is itself drifted.** `DEFINITIVE-FINDINGS` cites `workflow-design/techniques/audit-schema-validation.md` step 3 as "the low-cost form, restating a signature and an escape hatch in roughly 40 words while the algorithm stays in TypeScript". The escape hatch it restates is `--update-baseline`. That flag does not exist in `scripts/check-binding-fidelity.ts` (825 LOC); the script's argument surface is `--emit-untriaged` / `--emit-all`, and `scripts/binding-fidelity-triage.json` states in its own note: *"There is no regenerate flag — an entry is a human judgement."* Step 2 of the same file runs `check-all-refs.ts` with no `--root`, and that guard calls `requireWorkflowsRoot(DEFAULT_ROOT)` where the default is the server's own `../workflows` — so an authoring run reviewing a worktree validates the stale main copy. `scripts/workflows-root.ts` carries the docstring for exactly that bug (*"the guards would validate the stale main copy, not the change under review (issue #160 follow-up #1)"*). Two of six sites wrong; drift rate 33%; detection zero.

**K8 — the instruments, measured against the candidates.** `scripts/fixtures/token-benchmark-a0-reference.json` records the reference 12-activity `work-package` walk: `get_activity` 687,936 chars, `get_resource` 448,084, `get_technique` 160,057, `get_workflow` 59,455 — **1,355,532 delivered chars**, over 12 `get_activity`, 26 `get_technique` and 128 `get_resource` calls. `run-token-benchmark.ts` gates at `--max-regression-pct` default 1, so its resolution floor is **13,555 chars**. Every candidate, measured:

| Candidate | Whole file, bytes | As % of the 1,355,532-char reference walk | Visible to `bench:token --gate`? |
|---|---|---|---|
| MECH-04 `sync-progress-status.md` | 3,979 | 0.29% | No |
| MECH-09 `verify-artifact-conforms.md` | 5,443 | 0.40% | No |
| MECH-06 `review-mode-detection.md` | 2,955 | 0.22% | No |
| MECH-03 `naming-conventions.md` | 2,649 | 0.20% | No |
| MECH-05 `write-artifact.md` | 2,587 | 0.19% | No |
| MECH-07 `verify-artifact-links.md` | 2,490 | 0.18% | No |
| MECH-10 `select-target-component.md` + `create-worktree.md` | 3,975 | 0.29% | No |
| MECH-08 `three-dot-name-status.md` | 1,117 | 0.08% | No |
| MECH-11 all six files | 7,378 | 0.54% | No |
| **All ten, deleted entirely** | **32,573** | **2.40%** | Only as a whole, and only if deleted rather than replaced |

Deleting the *entire text* of every candidate technique registers at 2.40%. The candidates do not propose deletion — MECH-11 explicitly prices its saving at "30 to 60 words per step" because the technique is delivered either way, which is **1,620–2,200 chars, 0.12–0.16%, eight times below the gate's floor**.

`bench:dispatch` varies dispatch count (5,416 tok/call multi-dispatch against 3,093 single-dispatch, its docstring's measured figures) — no candidate changes dispatch count. `bench:batch` prices `dispatchesAvoided × spawnSeconds` at a default 87s (the mean of four measured dispatches: 77, 65, 42, 165) — no candidate avoids a dispatch. `record_usage` writes one `activity_usage` history event per activity, and `run-profile.ts` documents that main-plus-worker figures reconcile at **2.09x** and the worker startup window at **2.42x** depending on whether usage is reduced or summed across transcript records. A saving of roughly two hand-applications of a decision table per activity (MECH-04's ~30 applications over 15 activities) sits inside a 2x counting ambiguity.

**K14 — the guard's boundary, measured by running it.** `naming-conventions.md` declares inputs `issue_type`, `issue_title`, `issue_number`, `component_name`, `is_review_mode` and outputs `branch_name`, `target_path`. Step 2 derives the prefix from `{issue_type}`; step 4 reads `{type}` and the `branch_name` output description names `{type}`. `{type}` is not a declared input, not a declared output, not a `$`-prefixed step-local, not a `work-package` workflow variable and not a set-target. `npx tsx scripts/check-binding-fidelity.ts` against this checkout prints:

```
binding-fidelity: 69 violation(s) — 69 harmless, 0 fix-later, 0 live bug(s), 0 untriaged
binding-fidelity: OK — no live or untriaged binding defects (69 triaged as accepted debt)
```

`{type}` is not among the 69. MECH-03's severity is therefore understated in one direction and its remedy misdescribed: the table is not merely missing an `epic` row, the prefix has no producer under any of the five inputs the corpus's own `signature-is-the-contract` rule admits — and the guard the candidate set leans on to police definition edits does not see it. The same file declares `component_name` "used as the first path segment of the personal-layout worktree path" and step 6 never reads it.

**K15 — the session boundary, measured in code.** `seedDefaults(wf.variables)` is called from exactly two sites, `src/tools/resource-tools.ts:327` (fresh `start_session`) and `:454` (`dispatch_child`). The resume branch of `start_session` (`src/tools/resource-tools.ts:253-299`) checks four drift kinds — `pathDrift`, `agentDrift`, `modeDrift`, `requestDrift` — plus a repo bind, and never compares the loaded workflow's version against `state.workflowVersion`. `effectiveWorkflowVersion` is computed on every call and consumed only by the fresh-creation and `dispatch_child` paths. A resumed session therefore executes today's definitions while its file still records the version it opened under, with no signal to either party.

---

## 2. Corruption traces — each claim assumed false

### K1 false — no repo checkout is present when a `work-package` run executes

A step reading `Run npx tsx scripts/check-artifact-guides.ts` in `workflows/work-package/techniques/manage-artifacts/verify-artifact-links.md` is delivered to a worker whose working directory is the user's product repo. `npx` walks up the tree, finds no `tsx`, falls through to the registry, and in a network-restricted environment dies with `EAI_AGAIN`. The worker is holding a protocol step with a declared output (`broken_artifact_links`) and no way to produce it. Two behaviours follow, and both are worse than the prose the candidate replaced: the worker reports the step blocked, halting a run that previously completed; or — the likelier one, since the technique's Capability still describes the check in words — the worker re-derives the check by hand and reports `broken_artifact_links` as if the script had run. The corpus now states a mechanised contract and produces a hand-derived value, and `rows_updated`-style count outputs make the two indistinguishable. Corruption class: **a mechanisation that increases confidence without increasing determinism.**

The corruption is not hypothetical at the CI boundary either. `check-all-refs.ts` invoked without `--root` in `workflow-design`'s own audit step already validates the wrong tree. That is the same failure with the checkout *present* — which means the failure survives fixing K1.

### K2 false — the shipped capability does not work

If the exemplar is broken, the adversarial pass's promotion of MECH-01 loses its ground. `DEFINITIVE-FINDINGS` records the promotion explicitly: *"The finding was originally recorded as a schema gap requiring four new pieces of machinery — a determinism declaration, a guard for it, a `compute` MCP tool and a `kind: compute` step. The adversarial pass produced the counter-example and the remedy collapsed to a convention."* The counter-example is `audit-schema-validation.md`, whose step 2 targets the wrong tree and whose step 3 documents a removed flag. The collapse from four pieces of machinery to one sentence was justified by text that reads correct and executes wrong. Corruption class: **a cost estimate reduced by an order of magnitude on evidence of the wrong kind** — existence of prose taken as evidence of working prose.

### K3 false — the convention closes nothing as a class

Taking the five claimed closures one at a time against what a script invocation can do:

- **MECH-04** writes `{planning_folder_path}/README.md`. That folder is created by the server (`ensurePlanningFolder`), named by the server (`presentPlanningPath`), and holds the server's own `session.json` and `.session-token`. A script invoked from the corpus must be told the folder path and must be present; the server already knows it and already is. The invocation convention routes the work to the least-privileged surface.
- **MECH-05** is a two-tool-call race. Invoking a script does not make scan-and-create atomic — it makes it a *different* non-atomic pair, since the agent must still decide to call the script.
- **MECH-07** needs a capability no script currently has (resolution against `{artifact_publish_ref}` via `git cat-file -e {ref}:{path}`), which the finding itself classifies as unwritten.
- **MECH-08** is genuinely closed by a script, given a checkout.
- **MECH-11** yields 0.12–0.16% of a walk's delivery and is invisible to every instrument.

One of five is closed. Corruption class: **a portfolio priced as a single enabling change is in fact one enabler plus four independent builds.**

### K4 false — the three surfaces are not interchangeable

`src/tools/` is two files: `workflow-tools.ts` (1,877 LOC, 14 registrations) and `resource-tools.ts` (944 LOC, 4 registrations) — **18 registration sites**, all session control-plane. (The brief's grounding says 16; the measured count of `server.tool(` plus `server.registerTool(` call sites is 18.) `scripts/` is 45 TypeScript files, 9,503 LOC, of which 26 are registry-listed guards; the shell scripts bring the directory to the brief's larger figure. The corpus is a git submodule on branch `workflows`, 907 KB across the two subjects.

Presence at execution time orders them strictly: the **server** is present by definition, since the run is a sequence of calls to it; the **corpus** is present because the server reads it; the **checkout** is present only when the subject of the run happens to be this repository. The candidate set's classification column chooses by where the algorithm is easiest to write. Ordering by reachability inverts several assignments — MECH-04 and MECH-05 belong in `src/tools/`, not `scripts/`. Corruption class: **cost estimated against ease of authorship rather than against reachability, so the cheapest-looking surface is the one that silently does not run.**

### K6 false — the rename lands, the effect does not

The MECH-02 edit is one line in an activity YAML `step.technique.inputs` block, and activity definitions are loaded fresh on every `get_activity`, so a running session picks the edit up immediately. What it cannot pick up is a producer. `{written_artifact}` must be in the session variable bag, put there by a worker's `variables_changed` on the `write-artifact` step. A session that already ran that step before the edit existed has no `written_artifact` in its bag. On resume, step 7 of `sync-progress-status` branches on an unbound `delivered_artifact` and takes the unset path — which is byte-for-byte the pre-fix behaviour, on an arbitrary subset of sessions, with no diagnostic. Corruption class: **a fix that is silently inert for exactly the population that motivated it.**

### K7 false — the anchor guard cannot be repointed by a flag

`scripts/check-resource-anchors.ts` (151 LOC; its test file is 15 lines) resolves `ROOT` at module load via `resolveWorkflowsRoot` — **not** `requireWorkflowsRoot` — and never calls `assertScanned`. Two consequences for `--root <planning-folder>`:

1. Line 124: `if (relative(ROOT, targetPath).startsWith('..' + sep)) continue; // outside the corpus`. Planning-folder artifacts link outward by nature — to `src/`, to sibling planning folders, to the workflows corpus. The repointed guard silently skips precisely the class of link most likely to break.
2. No `assertScanned` and no corpus assertion means a wrong or empty `--root` prints `resource-anchors: OK — every relative .md#anchor link resolves…`. That is the green-because-empty failure `scripts/workflows-root.ts` documents as issue #327 S2, re-opened by handing the root to a runtime-supplied path.

So the "cheap part" of MECH-07 is: relax the outside-root escape, add a scanned-count assertion, and add a root-shape assertion that admits a planning folder — three edits to a guard with a 15-line test, not a flag. Corruption class: **a check that reports clean over the surface it was pointed at least meaningfully.**

### K8 false — nothing here is measurable, so the ordering has no evidence

If no instrument can resolve any candidate's saving, then the entire build order rests on the two conservation laws (contract restatement, blast radius) reasoned from the corpus, with no possibility of confirmation after the fact. The corruption is specific and slow: a mechanisation lands, the benchmarks stay flat because a flat result is what they would report either way, and flatness is read as "no regression" rather than as "no measurement". The candidate set is then judged by whether the prose looks tighter. Corruption class: **an optimisation programme with an unfalsifiable success criterion, whose instruments confirm nothing while appearing to confirm safety.**

### K10 false — deferring the cheap items costs more than doing them

The per-landing ceremony for a definition edit, measured:

- `workflows` and `.engineering` are submodules of the superproject on separate branches of the same GitHub repository. A change touching a definition and a script is a minimum of two commits plus a pointer bump, and cannot be atomic.
- `tests/e2e/snapshot.test.ts` holds **six committed `work-package` walk snapshots**, one per policy (`default`, `skipOptional`, `full`, `researchOnly`, `elicitationOnly`, `reviewMode`), plus `tests/e2e/__snapshots__/corpus-sha.json`. Its stamp assertion names the remedy: *"Confirm the corpus change is intended, re-baseline with `npm run test:ci -- -u`, then run `npm run baseline:stamp` in the same commit."* The stamp records `acbbf1bc`, matching the superproject's recorded submodule pointer; the local submodule checkout sits at `34cd5429`, an ancestor, so the assertion fires locally until the submodule is synced.
- `tests/e2e/definition-lint.test.ts` asserts the unresolved-reference set across all six policy walks equals an empty baseline.
- `scripts/check-delta.ts` (350 LOC) materialises the merge-base in a throwaway worktree with the workflows submodule pinned to the commit that tree recorded, and runs the whole guard registry against **both** trees, cached per (base commit, base corpus commit).
- `tests/e2e/budgets.ts` sets `PER_WALK_MS = 45_000`; a six-walk hook budgets 270s, and its docstring records `definition-lint` already going 60s → 120s → timing out on a runner "roughly 4x slower than a local machine".

Every one of these costs is **per landing, not per edit**. MECH-12's three literal string tests and MECH-04's protocol rewrite pay the identical re-baseline. Sequencing the twelve items across twelve landings multiplies a fixed cost by twelve; the correct economics is one corpus landing carrying every definition edit, with the code changes staged behind it. Corruption class: **an ordering derived from per-item value against a cost structure that is per-commit, so following the recommendation multiplies the dominant cost term.**

### K11 / K12 false — conventions and judgements decay, and the decay is unobserved

Sample evidence for K11: 2 of 6 existing invocation sites drifted from the scripts they name, undetected. For K12: `scripts/binding-fidelity-triage.json` is 28,404 bytes, 69 entries, **69 of 69 verdict `harmless`**, across 12 named rationales, stamped `corpusSha 3569e937` — which matches neither the recorded submodule pointer (`acbbf1bc`) nor the working checkout (`34cd5429`). Its own note distinguishes `harmless` / `fix-later` / `live-bug` precisely so that "harmless" and "live bug" stop being the same silence, and one rationale, `undeclared-seed`, explicitly says *"it is debt to close — declare and seed it — not a false positive."* Every entry sits under `harmless` regardless. Corruption class: **a mechanism built to keep judgements honest, populated entirely with one verdict, so the distinction it exists to draw is not being drawn.** The candidate set's Contract Restatement shift prediction — "the triage file grows before it shrinks" — is confirmed as a direction and understated as a risk: growth into a single verdict is indistinguishable from suppression.

### K5, K9, K13 and K14 false — four shorter traces

**K5 false — a guard "in the style of the existing 26" cannot do this job cheaply.** All 26 registry guards are static readers of definition text or repo text; not one parses a command-line argument surface. A conformance guard proving "this step names a script that exists on disk" is 80–120 LOC and catches **neither** live defect: `--update-baseline` names a flag that vanished, and the missing `--root` is a flag that was never there. Catching those needs either executing each script with `--help` (no registry script implements one) or restating each script's `argv` parsing inside the guard — a third statement of the same contract, which the candidate set's own Contract Restatement law identifies as the cost rather than the saving. Corruption: the guard lands, runs green, and the defect class that motivated the convention stays exactly as invisible as before.

**K9 false — the guards are a CI asset, not a run-time resource.** Then MECH-01's Impact sentence ("the corpus re-derives in prose what it already computes in tested code") describes a relationship between the corpus and CI, not between the corpus and a run. Read that way the finding is a **duplication** finding, not a reachability one, and its remedy inverts: delete the restated procedure in favour of a CI gate, rather than invoke the guard from prose. That remedy's value is measurable only in aggregate — 2.40% of the reference walk if every candidate technique's text were removed outright — and it removes the K1 problem entirely, because nothing at run time invokes anything.

**K13 false — nobody reads the Progress cells.** Then MECH-04's Impact loses its consequence and the item drops from a correctness finding to a cost finding, landing beside MECH-11 in value rather than above it. The finding supplies the disconfirming half itself ("nothing in the run re-reads them"), and the repository supplies no readership evidence either way. This matters beyond MECH-04: the Blast-Radius law defines tier 2 as "an artifact a reader outside the run consumes", so **every tier-2 placement in the candidate set — `written_artifact`, `rows_updated`, `broken_artifact_links` — inherits K13's unmeasured status**, and tier 2 is the tier the law promotes above every git one-liner.

**K14 false — the binding guard does not reach the class these fixes belong to.** Then the 69-of-69-harmless triage result is not evidence of a clean corpus but of a clean *scan boundary*, and every definition edit in the set lands without a binding check that reads technique protocol steps. The measured instance is `{type}` at `naming-conventions.md:45`, which resolves to nothing and is reported by nothing. Corruption: MECH-02 and MECH-03 are declared fixed by edits whose correctness is vouched for by a guard that could not see the defect before the edit and cannot see its absence after.

### K15 false — running sessions are part of every one of these changes

Six of the twelve remedies are definition edits to files a running session re-reads: MECH-02, 03, 06, 07 (technique half), 09, 10. Each one lands into sessions whose variable bags were written under the prior definitions, with no version check on resume and no census run. Named cases:

- **MECH-03**: a session already past `naming-conventions` holds a branch name minted with an invented prefix. The finding itself notes the corpus calls this value expensive to change once a PR is open. The fix cannot repair it and leaves no record that it was invented.
- **MECH-06**: `is_review_mode` is set by a checkpoint effect in `01-start-work-package.yaml`. Adding the contradiction assertion changes nothing for the 11 activities of a session already past activity 01 — and 85 references across 11 of 15 activities is the exposure the fix does not reach.
- **MECH-02**: the inert-fix trace above.

`scripts/count-workflow-sessions.ts` (127 LOC) exists for exactly this question and its docstring names it *"the retirement trigger for a drain-to-zero migration"*, walking embedded `triggeredWorkflows[i].state` at any depth because child sessions are nested rather than separate files. It is invoked by none of the twelve remedies and by no guard in the registry. Corruption class: **a migration cost that is already instrumented, already understood by the repository, and absent from every estimate.**

---

## 3. Three inversions

### Inversion A — invert K1: the server is the only surface guaranteed present

**Design.** No protocol step in `meta` or `work-package` names a shell command. Every mechanisation that must run inside a run lands as an MCP tool in `src/tools/`, joining the 18 existing registrations. `scripts/` keeps only what runs in CI.

**Concrete results.**

| Item | Landing under Inversion A | Sized against | Estimated build |
|---|---|---|---|
| MECH-05 (atomic find-or-update) | new `write_artifact` tool in `workflow-tools.ts` | `record_usage` block ~50 LOC; `respond_checkpoint` ~170 | ~110–140 LOC + zod schema; `O_CREAT|O_EXCL` open closes the race in one syscall |
| MECH-04 (Progress status policy) | new `sync_progress` tool, same file | `check-review-mode-gating.ts` 236 LOC as a policy-table comparator | ~150–200 LOC encoding the 5x5 matrix, the 3-row item-link table and the `allow_overwrite_na` defaults |
| MECH-07 (non-anchored + ref-relative links) | folded into a `verify_links` tool or the artifact tool's response | `check-resource-anchors.ts` 151 LOC | ~120 LOC plus a `git cat-file -e` child process |
| MECH-08 (name-status ⋈ numstat) | stays a `scripts/` join — its consumer is a review activity in a checkout that has git anyway | `check-when-expression.ts` 88 LOC | ~60–90 LOC |

Two facts make the server the cheap surface rather than the expensive one. First, **`verifySeal` covers `session.json` bytes only** (`src/utils/session/store.ts:366-394`): it reads the session file, computes the HMAC over those bytes, and compares. Writing `README.md` or an artifact into the planning folder does not touch the seal. The intuition that the planning folder is expensive to write because the server owns it is false. Second, the server already resolves the folder canonically (`ensurePlanningFolder`, `presentPlanningPath`, `resolveSessionRoot`) and already authenticates by `session_index`, so a tool needs no new path plumbing and no new trust boundary.

The real cost of Inversion A is not the tool. It is `tests/mcp-server.test.ts` at 2,708 LOC, `tests/docs-drift.test.ts` walking 11 product globs (`setup.md`, `http.md`, `stdio.md`, `AGENTS.md`, `CLAUDE.md`, `docs`, `site`, `examples/cursor-workspace`, `.claude/rules`, `.cursor/rules`, `scripts/generate-site-data.ts`) and failing on stale inventory tallies, and `tests/bootstrap-budget.test.ts` with `BUDGET = 110_000` chars of pre-decision content — a new tool's description and schema land inside that budget.

**Result that decides it.** Under Inversion A, MECH-05 becomes the cheapest item in the set rather than a "fixable only in code" outlier, because `O_CREAT|O_EXCL` is one line and the server is the only party that can hold it. Under the original framing MECH-05 is unclassifiable — it has no surface, since a script cannot make an agent's two calls into one.

### Inversion B — invert K8: assume no candidate's saving is measurable, and design for what the instruments can see

**Design.** Admit the four instruments' actual resolution and re-derive the portfolio from it. `bench:token` resolves ≥13,555 chars of delivery. `bench:dispatch` resolves dispatch count. `bench:batch` resolves `dispatchesAvoided × 87s`. `record_usage` resolves per-activity token deltas at 2.09–2.42x counting ambiguity. Only three levers clear those floors: **delivered chars in bulk, dispatch count, and activity count.**

**Concrete results.** The reference walk delivers 448,084 chars over 128 `get_resource` calls — 3,501 chars per fetch, and the largest single delivery category after activity payloads. `sync-progress-status.md` (3,979 bytes) references **eight distinct anchors** into `planning-readme.md` (15,690 bytes, 187 lines, 20 headings): `#status-vocabulary`, `#row-ownership-map`, `#matching`, `#status-transition-policy`, `#progress-table`, `#icon-key`, `#progress-status-call-sites`, plus the policy row cited by MECH-02. Every one of the ~30 applications MECH-04 counts is a step whose execution requires that resource in context. Mechanising the policy into a tool removes the *reason to fetch the resource*, not merely the prose — and 128 fetches at 3,501 chars is a surface where a double-digit reduction clears the 13,555-char floor by an order of magnitude.

Under Inversion B the portfolio's headline saving is restated: not "a decision table stops being applied by hand" (unmeasurable, ~2 applications per activity inside a 2x ambiguity) but "a 15,690-byte policy resource stops being a run-time dependency of the highest-frequency orchestrator hook" (measurable, gated, and attributable to a single commit by `bench:token --gate --context-mode=persistent`).

**Result that decides it.** MECH-04's saving is real and its stated saving is unmeasurable. The same build, described against the instrument that exists, becomes the only item in the set with a gateable number.

### Inversion C — invert K2/K11: assume authors do not follow conventions and prose invocations rot

**Design.** Since 33% of existing invocation sites are wrong and nothing detects it, do not add 262 files' worth of free-text commands policed by a conformance guard. Make a wrong invocation unrepresentable: the invoked procedure becomes a declared construct the loader resolves at load time, so an unknown script name or a removed flag is a load error surfaced by `check-all-refs`-class machinery, not a run-time surprise in a user's repo.

**Concrete results.** This is precisely the machinery the adversarial pass withdrew — "a determinism declaration, a guard for it, a `compute` MCP tool and a `kind: compute` step". Reinstating it costs: a schema addition in `src/schema/technique.schema.ts` (114 LOC) or `activity.schema.ts` (354 LOC); resolution in `src/loaders/technique-loader.ts` (650 LOC); a registry entry in `scripts/guards.ts`; one guard of the existing shape (88–151 LOC precedent); and `npm run build:schemas` plus `tests/generated-schemas.test.ts`. Call it 400–600 LOC across four files with one new guard — five to eight times the "one sentence in `TECHNIQUE.md`" the candidate set prices, and roughly one-fifth the size of `check-binding-fidelity.ts` alone.

Against that: it is the only design in which K11 does not need to be true. A convention plus a conformance guard proves that a step *names* a script. Nothing proves the named script *still accepts the arguments the prose passes* — that requires parsing a CLI surface, which no guard in the registry does, and which is why both defects in the exemplar are invisible today.

**Result that decides it.** The withdrawal of the four-piece remedy was justified by a counter-example that does not execute. Restore the counter-example's true status and the withdrawal's premise fails. The remedy does not have to be reinstated in full — but its cost cannot be booked at one sentence.

---

## 4. What each inversion reveals

**Inversion A reveals that the surface taxonomy is a taxonomy of authorship, not of execution.** "New tool / script / definition edit" reads as three options priced by build effort. Ordered by presence at the moment of execution, they are a strict hierarchy — server always, corpus always, checkout sometimes — and the candidate set's default choice (`scripts/`) is the only one that is conditional. The hidden assumption is that the run happens in this repository. It does for `workflow-design`, which is why the invocation exemplars all live there, and the candidate set generalises from that sample without testing whether the sample's defining property travels.

**Inversion B reveals that the candidate set and the repository do not share a cost model.** The candidate set prices agent cognition: procedures re-derived, tables applied by hand, judgement fused with computation. The repository's four measurement tools price delivery: `deliveredChars` (`src/utils/batch.ts`), payload characters, dispatch counts, and per-activity harness token deltas with a documented 2x reconciliation gap. Both are legitimate cost models and they barely intersect. The hidden assumption is that "expensive for the agent" and "measurable by the server" are the same axis. They are orthogonal, which is why eleven of twelve savings are real and unfalsifiable at once.

**Inversion C reveals that the adversarial pass promoted a remedy on the wrong class of evidence.** It found a counter-example, checked that the counter-example's prose had the right shape, and collapsed a four-piece estimate to one sentence. It did not execute the counter-example. The hidden assumption is that a working example exists because a written example exists — the same conflation the candidate set's own Core Finding identifies in the corpus ("the corpus renders 'a procedure nobody has scripted' and 'a procedure that cannot be scripted' as identical protocol prose"). The Core Finding is correct and the evaluation reproduced the error it names, one level up: it rendered "an invocation that works" and "an invocation that is written" as identical evidence.

---

## 5. Change-economics ledger

Surface, cost and risk per candidate, after the three inversions. LOC figures are estimates anchored to the named comparator in this repository; corpus figures are measured.

| ID | Reachable surface | Estimated build | Guard / test blast | Running-session exposure | Measurable? |
|----|-------------------|-----------------|--------------------|--------------------------|-------------|
| MECH-01 | Definition edit in `workflows/meta/techniques/TECHNIQUE.md` **plus** new guard in `scripts/` **plus** `guards.ts` entry — spans two repositories | Convention 1 paragraph; conformance guard ~100–150 LOC (cf. `check-resource-anchors.ts` 151); CLI-surface check has **no precedent** and is the expensive half | 26-guard registry grows to 27; `check-delta` re-runs the whole registry against the base tree; 6 walk snapshots + stamp | Low — a convention changes no bag value | No. Delivery-neutral by construction |
| MECH-02 | Definition edit, one `step.technique.inputs` line in a `work-package` activity YAML | 1 line | 6 walk snapshots + stamp; `definition-lint` empty-baseline; `check-binding-fidelity` (69/69 harmless, will re-run) | **High and silent** — inert for every session past the `write-artifact` step | No |
| MECH-03 | Definition edit, `naming-conventions.md` (2,649 B): complete the enum **and** give `{type}` a producer (declare it as an output, or read `{issue_type}` directly) | ~10 lines across Outputs + steps 2 and 4 | Same as MECH-02. `check-binding-fidelity` does **not** currently see `{type}` — the guard gains a finding only if its read-resolution reaches technique protocol steps | Medium — branch names already minted are unfixable, per the corpus's own note | No |
| MECH-04 | **`src/tools/workflow-tools.ts`** (1,877 LOC, 14 registrations), not `scripts/` — the planning folder is server-resolved and the seal does not cover it | ~150–200 LOC + zod schema (cf. `check-review-mode-gating.ts` 236 as a policy comparator) | `mcp-server.test.ts` 2,708 LOC; `docs-drift.test.ts` 11 globs; `bootstrap-budget.test.ts` 110,000-char budget; `session-store.test.ts` 452 LOC | Low — a new tool is additive; old sessions keep applying by hand | **Yes, under Inversion B** — removes `planning-readme.md` (15,690 B) as a run-time dependency of the highest-frequency hook; clears the 13,555-char gate |
| MECH-05 | **`src/tools/workflow-tools.ts`** only. A script cannot make an agent's two calls one; `O_CREAT\|O_EXCL` in the server can | ~110–140 LOC + schema | Same tool-addition set; plus `write-artifact.md` (2,587 B) definition edit and its 87 corpus references | Low, additive | Partly — a mint conflict is countable in the assumptions-log, but the *avoided* duplicate is not |
| MECH-06 | Definition edit, `01-start-work-package.yaml` checkpoint condition (assert `is_review_mode && review_pr_missing`) or make the confirm unconditional | ~3 lines | `check-review-mode-gating.ts` (236 LOC) already proves no review-reachable checkpoint auto-advances into unapproved mutating work — this change is inside its remit; `review-mode-gating.test.ts` 30 lines; `reviewModePolicy` walk snapshot | **High** — reaches none of the 11 activities of a session already past activity 01; 85 references unprotected in flight | No. An unconditional confirm adds a checkpoint, which `bench:dispatch` *would* see as a cost |
| MECH-07 | Split. Cheap half: 3 edits to `check-resource-anchors.ts` (151 LOC, 15-line test) — relax the outside-root skip, add `assertScanned`, admit a non-corpus root. Unwritten half: ref-relative resolution, `src/tools/` or `scripts/` | ~40 LOC of guard changes + ~120 LOC of new capability | Anchor guard test is 15 lines — thin protection for a semantics change; `verify-artifact-links.md` (2,490 B) definition edit | Medium — a check that silently passed keeps silently passing until the guard is fixed | Partly — broken-link counts are countable once the check runs |
| MECH-08 | `scripts/` — consumer is a review activity in a git checkout, so the checkout assumption holds here | ~60–90 LOC (cf. `check-when-expression.ts` 88) | Registry entry if guarded; `three-dot-name-status.md` (1,117 B) definition edit | Low | No — 0.08% of a walk |
| MECH-09 | Split at the detect/correct seam: detection + 3 mechanical corrections in `scripts/` or `src/tools/`; condensation and register rewriting stay prose | ~150 LOC | `verify-artifact-conforms.md` (5,443 B) definition edit; 25 corpus references; `check-artifact-guides.ts` (307 LOC) and its 267-line test are the neighbours | Medium — in-place correction of already-persisted artifacts, with no diff recorded either before or after | No |
| MECH-10 | Definition edit lifting the ranking tiers out as computed inputs to the existing gate — `select-target-component.md` (1,881 B), `create-worktree.md` (2,094 B) | ~15 lines | Snapshots + stamp; `check-self-provisioned-input.ts` will police the new bindings | Low — output is a recommendation at a user gate | No |
| MECH-11 | Definition edits, 6 files, 7,378 B total across `meta` (3 files) and `work-package` (3) | ~6 × 10 lines | Snapshots + stamp — **the same ceremony as MECH-04** | Low | **No — 0.12–0.16%, eight times below the gate floor** |
| MECH-12 | Definition edit, `meta/techniques/version-control/TECHNIQUE.md:40-42` | 3 lines | Snapshots + stamp — again the same ceremony | None | No |

---

## 6. Scarcity test — which costs are immovable

### Immovable regardless of redesign

1. **Two-repository non-atomicity.** `workflows` (branch `workflows`) and `.engineering` (branch `engineering`) are submodules of the superproject, all three on the same GitHub remote. Any change pairing a definition with code is ≥2 commits plus a pointer bump, and there is necessarily a window in which one half is landed and the other is not. No redesign of the twelve items removes it. It is the reason MECH-01's convention and MECH-01's guard cannot arrive together, and the reason a "convention first" landing is a period during which the convention is unenforced.
2. **The re-baseline ceremony, fixed per landing.** Six committed `work-package` walk snapshots across six policies, plus `corpus-sha.json`, plus `definition-lint`'s empty unresolved-set baseline. `npm run test:ci -- -u` and `npm run baseline:stamp` in the same commit. Independent of edit size — three string literals (MECH-12) pay what a protocol rewrite (MECH-04) pays.
3. **The delta double-run.** `check-delta.ts` materialises the merge-base in a throwaway worktree, pins the submodule to the corpus commit that tree recorded, and runs the registry twice; `.guard-cache/` amortises it per (base, base-corpus) pair, so it is re-paid on every rebase.
4. **Walk wall-clock scaling with corpus size.** `PER_WALK_MS = 45_000`; six-walk hooks; CI runners ~4x slower than local; `definition-lint` already went 60s → 120s → timeout. Adding protocol text costs CI time; the candidates that remove text buy a little back, and none of them changes the shape of the scaling.
5. **Contract restatement.** The candidate set's own conservation law, confirmed by the triage file: 69 entries, no regenerate flag, every entry a standing human judgement. Mechanisation does not reduce the number of places a contract is stated; it makes the relationship checkable where a guard exists.
6. **The 2x usage-counting ambiguity.** `run-profile.ts` reconciles main-plus-worker at 2.09x and the worker startup window at 2.42x, because the harness repeats one response's usage object on every content-block record. This is a property of how transcripts are written, not of the workflow, and it puts a hard floor under what `record_usage` can attribute to any single change.

### Claimed scarce, measurably not

7. **The seal.** `verifySeal` hashes `session.json` bytes only. Writing `README.md` or artifacts into the planning folder costs nothing in seal terms, so MECH-04 and MECH-05 can write there from a tool or a script without a trust-boundary argument.
8. **"The 26 guards are unreachable from a run."** They are reachable from CI, and from any run whose subject is this repository. What is scarce is the *checkout*, not the guard — and that distinction changes MECH-01's remedy from "state a convention" to "state a convention plus provide the checkout, or move the work to the server".
9. **"A new server tool is expensive."** Two files hold 18 registrations in one uniform pattern (`withAuditLog(withSessionStoreErrors(handler))`, zod schema, `_meta.session_index`, `buildValidation()`). The tool body is the small part. The expensive parts are `mcp-server.test.ts` (2,708 LOC), `docs-drift.test.ts` (11 product globs), and the 110,000-char bootstrap budget — all of which are one-time per tool, not per capability.
10. **"Sessions holding the old shape are somebody else's problem."** `count-workflow-sessions.ts` (127 LOC) already answers the census question, including nested `triggeredWorkflows[i].state` at any depth. The migration cost is instrumented; it is simply unbooked.

---

## 7. Sequencing dependencies

Reading the dependency graph against the immovable costs rather than against per-item value:

- **Nothing depends on MECH-01 that the report claims does.** The class-closure claim (K3) fails, so MECH-04, 05, 07 and 08 are independently buildable and MECH-01 is not a prerequisite. It remains worth doing for the 262-file convention, but it is not a gate.
- **MECH-01 must be preceded by fixing its own exemplar.** Both defects in `workflow-design/techniques/audit-schema-validation.md` — the removed `--update-baseline` flag at line 34, the missing `--root` at line 30 — must land before the file is held up as the pattern for 262 others, or the convention propagates a broken form.
- **MECH-05 strictly precedes MECH-02.** The candidate set states the compounding correctly ("once MECH-02 is fixed the consequence compounds: the wrong instance path lands in a Progress item link"). Under Inversion A, MECH-05 is also the cheaper of the two to *land*, since it is additive rather than a bag-dependent rewire.
- **MECH-03's producer fix precedes its enum fix.** Completing the table to five members is inert while `{type}` has no producer; the epic row would join four rows that also never resolve by name.
- **All definition-only edits — MECH-02, 03, 06, 10, 11, 12 — belong in one corpus landing.** Six landings pay the fixed ceremony six times. This directly reverses "sequence these last" for MECH-11 and MECH-12: their value is genuinely lowest and their marginal cost inside a batched landing is genuinely near zero, which makes *now* their cheapest possible moment and *later* their most expensive.
- **The census precedes every definition landing.** `npx tsx scripts/count-workflow-sessions.ts --workflow work-package --status running --list` costs one command and converts K15 from an assumption into a number. If the count is zero, the whole running-session exposure column collapses and six remedies get materially cheaper. If it is not zero, the landing needs a drain or a version check.
- **A resume-time version check gates nothing and enables everything.** Comparing the loaded workflow version against `state.workflowVersion` in the resume branch of `start_session` (~10 LOC beside the four existing drift checks) turns every silent definition-edit hazard into a reported one. It is the smallest change in this entire analysis with the largest effect on the safety of the other eleven.

---

## 8. The core impossibility

The candidate set tries to move deterministic work out of an agent's context and into code, while the only code guaranteed to be present when the agent runs is a server that has been designed — carefully, across 18 tools and 12,343 LOC — to hold no domain plane at all. Every tool is session control-plane; not one performs a domain operation. That is a deliberate architecture, and it is exactly what makes mechanisation homeless.

So each candidate must resolve into one of three positions, and each position surrenders something the design was built to protect:

- **Put it in the server.** The server acquires a domain plane. `sync_progress` knows what a Progress table is; `write_artifact` knows what an artifact is. The corpus stops being the sole home of domain knowledge, and the server can no longer be replaced or versioned independently of the workflows it serves.
- **Put it in a script.** The definitions acquire an unbindable dependency on a checkout that no variable names and no producer supplies. This is the same defect class as MECH-02 — an input with no producer — raised one level, from a variable to an entire execution environment. It is the position the candidate set chose by default, and it is why MECH-01's remedy reproduces MECH-02's defect.
- **Leave it in prose.** The agent re-derives it, at a cost no instrument in this repository can measure.

The impossibility is not that mechanisation is hard. It is that **the corpus is the only universally-reachable place to state a procedure, and prose is the only thing a corpus can hold** — so any procedure moved out of prose moves into something that is either present-but-domain-blind or domain-capable-but-conditionally-present. The candidate set never names this choice, which is why it can price twelve items without once asking where the code will be standing when the step executes.

The instrument gap is the same impossibility seen from the other side. The repository measures what it can control: characters it delivers, dispatches it composes, activities it advances. It cannot measure what it hands off. So the cost the candidate set wants to reduce is precisely the cost the architecture puts out of reach of measurement — and a programme to reduce it has no feedback loop, which is why eleven of twelve savings can be simultaneously real and unconfirmable.

---

## 9. The slowest, most invisible failure

**Prediction: K15 — "a definition edit reaches the sessions that are running."**

Not K1. K1 fails loudly and immediately: `npx` cannot find `tsx`, the command errors, the worker reports blocked, someone looks. Not K8 either — an unmeasurable saving is invisible but harmless; it wastes attention, not correctness.

K15 fails in a way that produces no error, no warning, no guard finding and no benchmark movement, and it fails on a population nobody enumerates. The mechanism, measured in code:

1. `seedDefaults` runs at `resource-tools.ts:327` (fresh `start_session`) and `:454` (`dispatch_child`) — nowhere else. A declared variable with a default added by a definition edit never appears in the bag of a session created before the edit.
2. The resume branch (`resource-tools.ts:253-299`) checks `pathDrift`, `agentDrift`, `modeDrift`, `requestDrift` and a repo bind, and never compares the loaded workflow's version against `state.workflowVersion`. The stored version string persists unchanged while the definitions underneath it change.
3. Activity and technique definitions are loaded fresh on every `get_activity` and `get_technique`. So a resumed session runs **new protocol against an old bag under an old recorded version**, and every one of those three facts is individually correct and jointly silent.

The concrete failure, MECH-02 as the instance: the `step.technique.inputs` rename lands. A `work-package` session opened last week resumes. `sync-progress-status` step 7 branches on `delivered_artifact`, which is unbound because `written_artifact` was never in that session's bag. The branch takes the unset path — byte-identical to the pre-fix behaviour. The Progress item link stays pointed at the seeded target while the deliverable sits elsewhere, which is the exact defect MECH-02 exists to fix, now occurring **after** the fix, on an unknown fraction of runs, with the session file asserting a workflow version that no longer describes what it is executing.

Why it is the slowest of the fifteen:

- **No instrument can see it.** `bench:token`, `bench:dispatch` and `bench:batch` all walk fresh synthetic sessions. `record_usage` records tokens, not bindings. The six walk snapshots replay from a fresh start. `definition-lint` resolves references, not bag contents. Every measurement surface in the repository begins a session at the beginning.
- **No guard can see it.** All 26 guards are static readers of the corpus or the repo. None reads a `session.json`. The one script that does — `count-workflow-sessions.ts` — is not in the registry and is invoked by nothing.
- **The success signal and the failure signal are the same value.** An unbound optional input taking its unset path is normal operation. There is no state in which the system can tell "this session predates the fix" from "this session's deliverable landed at the seeded target".
- **It is self-concealing across landings.** Six of the twelve remedies are definition edits with this exposure. Each one lands, each one appears to work on fresh runs, and each accumulates a cohort of sessions running new prose over old state. `MECH-06`'s 85 references across 11 of 15 activities is the largest such cohort, and the cohort grows with the number of remedies shipped.
- **It gets worse exactly as the programme succeeds.** The more of the twelve that land, the wider the divergence between what a resumed session's file records and what it is executing — and the recorded `workflowVersion` is the field a future investigator would trust first.

The remedy is small and it is not in the candidate set: compare the loaded workflow version against `state.workflowVersion` in the resume branch, beside the four drift checks already there, and report the mismatch. Roughly 10 LOC in `src/tools/resource-tools.ts`, one test in `tests/session-schema.test.ts` or `tests/mcp-server.test.ts`, no corpus change, no re-baseline, no submodule bump. It converts the slowest invisible failure in the portfolio into a line of output, and it is the only item in this analysis that makes the other eleven safer to land.
