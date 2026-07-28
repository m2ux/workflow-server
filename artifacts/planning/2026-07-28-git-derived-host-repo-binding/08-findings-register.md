# Findings Register — git-derived host-repo binding

Canonical home for audit findings, coverage divergences and accepted exclusions for this run.

- **Base ref**: `f84fe02b12f9617f401767b9b96f329d8c13225c` (merge base of `workflow/meta-git-derived-host-repo-binding` with `origin/workflows`)
- **Edit surface**: `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-28-git-derived-host-repo-binding`
- **Targets**: `meta` (153 surface files, 16 changed) · `work-package` (162 surface files, 3 changed)
- **Criteria units walked**: 50 (46 `walked`, 4 `not-applicable`, 0 `blocked`)
- **Guard suite**: 16 of 17 pass; `binding-fidelity` rejects 3 definition files after resolution
- **Known findings excluded from the decision surface**: 74 keys, 0 matched

Severity: `Critical` = schema-invalid or structurally broken construct. Attribution is measured
against the base ref: `new` arrived with this change, `pre` pre-existed it.

---

## Target: `meta`

Consumer surface: 435 references from 115 files across 15 other workflow directories reach 78
`meta` files; 11 resolve into a file this run changed. Those 11 sites were walked as part of the
surface.

### Critical

**MC-1 · `unproduced-value-read` · `meta/techniques/cargo-operations/preflight.md` `## Inputs`**
The change replaced preflight's single input `target_path` with `host_repo_path` + `component_path`.
Its only bind site in the library is the bare-string bind `technique: cargo-operations::preflight`
at `work-package/activities/11-validate.yaml:28` — no `inputs` deviation, no `#### default` on
either input, and neither name declared in `work-package/workflow.yaml` (which declares
`target_path` at :92, the id that satisfied this bind at the base ref). Guard-confirmed: two
untriaged `orphan-input` rejections. `11-validate.yaml` appears in neither the scope manifest nor
the approved out-of-scope list.
*Fix*: declare and seed both ids in `work-package/workflow.yaml`, or supply them via a
`step.technique.inputs` deviation at the bind site. **new**

### High

**MH-1 · `stale-restatement-after-change` · `meta/README.md:81`**
The row still cites `` `target-path-scope` ``; the rule was renamed to
`orchestrator-component-path-scope` (`meta/techniques/agent-conduct.md:96`). A tree-wide grep
returns exactly two occurrences — the renamed rule and this one. The citation now dangles, and
`meta/README.md` is itself in the rename co-change set and was edited by this change. The
`resource-anchors` guard misses it because it is bare text, not an `.md#anchor` link.
*Fix*: update the surviving occurrence, or delete the inventory (see MM-4). **new**

**MH-2 · `stale-restatement-after-change` + `technique-inputs-declared` ·
`meta/techniques/version-control/detect-repo-type.md:8,22-24`**
Capability still asserts "whether **the working directory** is a regular repo or a submodule
monorepo" and Protocol step 1 still anchors `.gitmodules` at "**the repo root**", with no
`## Inputs` section at all — after this change made `host_repo_path` the authoritative root and
rewrote `02-resolve-target.yaml:7` to "component_path is relative to host_repo_path". The diff did
edit this file (renaming `### target_path` → `### component_path` on 16, 22, 24), so the anchor
claim was in the edit's scope and was left behind. Same claim survives at
`meta/techniques/version-control/list-submodules.md:8,18`.
*Consequence*: a session opened inside a component (`is_monorepo_host == true`) detects the
component's own structure and emits `component_path` relative to the wrong root — the exact
failure this change exists to prevent.
*Fix*: declare `host_repo_path` as an input on both techniques and anchor both `.gitmodules` reads
to it. **new**

**MH-3 · `complete-bootstrap-path` · `meta/resources/bootstrap-protocol.md:14-18`**
Step 2 instructs applying `resolve-host-repo`, and its third bullet instructs carrying the
divergence to the `host-binding-mismatch` gate. Neither hop is reachable from what the prior tools
actually return, read off the harness directly: `discover`
(`src/tools/workflow-tools.ts:320-331`) emits only `server`/`version`/`repo_binding` plus the raw
bootstrap body; `get_technique` and `get_resource` both require `session_index`, which does not
exist until step 3; the MCP resource listing exposes only six `schemas/*` URIs. `start_session`'s
input schema is a strict object of `{workflow_id, planning_folder, repo, user_request, agent_id,
context_mode}` — there is no channel for a derived gate variable. The gate fires at runtime only
because `00-discover-session` re-derives independently. The inline one-line summary also omits the
origin-URL forms that `owner/repo` correctness depends on.
*Fix*: make every hop discoverable from the prior tool's real return — inline the operative
derivation on the pre-session surface, and drop the unactionable carry instruction. **new**

**MH-4 · `no-duplicated-guidance` · git-derivation fallback rule in four definition homes plus
three stale harness homes**
The rule is stated in full at `resolve-host-repo.md:20`, `bootstrap-protocol.md:17`,
`start-session.md:22` and `meta/workflow.yaml:40`. More seriously, the three harness-side homes
this change did not touch still teach the retired provenance:
`src/tools/resource-tools.ts:106` ("from the user or workspace AGENTS.md"),
`src/tools/workflow-tools.ts:326` (same, inside the `discover` return) and
`src/utils/session/scope.ts:239`. Verified live: `discover` prepends that stale line immediately
above the bootstrap body, so the first surface an orchestrator reads teaches the superseded rule.
This is a co-change gap reaching outside the workflows submodule.
*Fix*: keep `resolve-host-repo.md` as the one home, reduce the definition duplicates to pointers,
and update the three server-side strings. **new**

**MH-5 · `io-id-shape` · `resolve-host-repo.md:22` vs `work-package/techniques/repo-root-resolution.md:18`**
Synonym drift for one concept: `host_repo_path` and `repo_root` hold the same value, and
`repo-root-resolution.md:29` states the computation is identical. The drift repeats one level down
between `component_hint` and `component_name`. `02-resolve-target.yaml:58` asserts the equality at
runtime, which is the tell — a single id removes the need for the assertion. The `-path` suffix on
one of the pair while its synonym carries none makes the suffix representation encoding rather than
the noun.
*Fix*: hoist one concept to one shared id and drop the representation suffix. **new**

**MH-6 · `no-activity-prose-rules` + `no-rule-protocol-restatement` · `meta/activities/02-resolve-target.yaml:6-8`**
`grep -l '^rules:'` over every `*/activities/*.yaml` in the library returns exactly this one file —
no sibling activity anywhere carries an activity-level `rules:` block. Entry 1 restates the
`validate-git-tree` step already present at :63 and the relativity already declared in
`meta/workflow.yaml`'s `component_path` description; entry 2 restates a rule the bound techniques
already carry.
*Fix*: delete entry 1, migrate or delete entry 2, leaving no activity `rules:` block. **new**
(entry 1; the block and entry 2 are **pre**)

**MH-7 · `bind-protocol-locals` · `meta/techniques/agent-conduct.md:98`**
The renamed rule now reads "inside the component directory `{host_repo_path}/{component_path}`".
`agent-conduct.md` declares no `## Inputs` and is delivered into client-workflow contexts — seven
consumer-surface sites in `work-package` and `workflow-design`. In none of those workflows is
either name declared or ambient. The pre-change designator `{target_path}` *was* declared
(`work-package/workflow.yaml:92`), so the rename converted one resolving read into two
non-resolving ones on a shared surface.
*Fix*: read a `{name}` that is declared or ambient at each consuming workflow, or drop the
designator for role prose. **new**

**MH-8 · dead-output `is_monorepo_host` + `14-single-source-of-truth` · `meta/workflow.yaml:44`**
Declared and produced (`resolve-host-repo` Protocol step 3) but read by nothing anywhere in the
library — verified by grep across all 18 workflow directories; the only occurrences are the
declaration, the Output heading and the Protocol set. Every gate still compares `is_monorepo`
(`02-resolve-target.yaml:21,25,32`), produced by `detect-repo-type`, whose root is undeclared (see
MH-2). The monorepo fact now has two variables and the gates read the one whose root is wrong.
Guard-confirmed: untriaged `dead-output`.
*Fix*: keep one authoritative variable — bind `detect-repo-type` to the derived host root and gate
on the survivor, or delete the unread declaration and its Output. **new**

### Medium

| # | Entry | Site(s) | Note | Attr |
|---|---|---|---|---|
| MM-1 | `no-rationale-in-description` | `meta/workflow.yaml:56`; `bootstrap-protocol.md:16,18`; `match-saved-session.md:28`; `extract-identifying-context.md:24`; `start-session.md:22`; `00-discover-session.yaml:17,28` | rationale / consequence / gating tails after the WHAT clause; the gating facts are already encoded by adjacent structure | new |
| MM-2 | `variable-description-one-line` | `meta/workflow.yaml:40,43,46,50,53,56` | each is multi-sentence with a producer, consumer or gate tail ("Set by …", "read by …", "so this gates …") | new |
| MM-3 | `validate-message-economy` | `02-resolve-target.yaml:58` | trailing consequence paragraph after the cause, and no fix command at all | new |
| MM-4 | `readme-orients-not-transcribes` | `meta/README.md:3,81`; `meta/activities/README.md:5,15,31` | rule-key inventory, checkpoint roster with firing conditions, near-verbatim activity `rules` restatement, activity count + prose sequence duplicating the index table | new |
| MM-5 | `stale-restatement-after-change` | `meta/README.md:20,40` | row 00's role and the `DS → INI` mermaid edge label left at the pre-change duty set, while sibling row 02 and the `RT` edge label *were* updated in the same diff | new |
| MM-6 | `technique-ref-in-io-contract` | `preflight.md:14`; `commit-and-persist.md:22`; `select-target-component.md:22,26`; `extract-identifying-context.md:24`; `start-session.md:22`; `resolve-host-repo.md:28` | seven I/O descriptions hyperlink a producing/consuming technique, sending the reader into another Protocol to interpret the slot | new |
| MM-7 | `procedure-in-io-contract` | `start-session.md:22`; `resolve-host-repo.md:36`; `select-target-component.md:22`; `extract-identifying-context.md:24`; `preflight.md:18` | sequencing, gating, ranking and prohibition duties inside I/O entries | new |
| MM-8 | `io-agnostic-contract` | `preflight.md:14`; `commit-and-persist.md:22`; `select-target-component.md:22,32,36`; `start-session.md:22`; `detect-repo-type.md:18` | I/O entries naming a workflow-internal producer technique or the consuming `submodule-selection` checkpoint | new / pre |
| MM-9 | `no-bind-mechanics-as-prose` | `start-session.md:22`; `resolve-host-repo.md:20` | fallback resolution written as prose where it belongs in `variable-binding` or a declared `default` | new |
| MM-10 | `dotted-rule-address` | `resolve-host-repo.md:8,28,41`; `select-target-component.md:26`; `extract-identifying-context.md:24` | five new sites cite a `## Rules` entry with `::`, which invokes an operation; the correct dotted form is in use at `start-session.md:56` | new |
| MM-11 | `brace-declared-ids` | `02-resolve-target.yaml:7,39,43,58`; `preflight.md:30`; `detect-repo-type.md:18`; `meta/workflow.yaml:88,101` | declared ids as bare words or backticked without braces; the same file braces correctly at :58/:63 | new / pre |
| MM-12 | `boolean-id-shape` | `meta/workflow.yaml:54`; `resolve-host-repo.md:34` | `host_binding_mismatch` names the prohibited state; approving the binding is expressed as `setVariable: … false`. Sibling booleans in the same activity family are predicate-shaped | new |
| MM-13 | `technique-stage-agnostic` | `select-target-component.md:41` | technique Protocol names the `submodule-selection` checkpoint the activity owns | new |
| MM-14 | `session-interaction-in-technique` | `select-target-component.md:41`; `preflight.md:30` | Protocol prescribes human-facing option ordering that no declared output carries, and "surface it to the user" where the activity's `validate` message already owns delivery | new / pre |
| MM-15 | `contract-not-procedure` | `resolve-host-repo.md:43,45` | Protocol steps 4 and 6 are pure projections of already-produced outputs, verbatim restatements of their own Output descriptions | new |
| MM-16 | `pass-orchestration-in-technique` | `commit-and-persist.md:34,38,39` | three numbered phases whose work is an `Apply`/`::` op invoke; the technique is bound as a step, so each op can be its own step | pre |
| MM-17 | `constraint-as-blockquote` | `commit-and-persist.md:35` | indented sub-bullet loads as a disconnected peer step — the loader regex at `src/loaders/markdown-technique-loader.ts:192` discards indentation. The correct `>` form is in the same changed set at `start-session.md:53` | pre |
| MM-18 | `no-duplicated-guidance` | `extract-identifying-context.md:24`; `match-saved-session.md:28`; `select-target-component.md:25`; `meta/workflow.yaml:53` | `TECHNIQUE.md:42` is the declared home, yet all four carry pointer *and* full restatement, two of them bidirectionally | new |
| MM-19 | `no-false-resource-delivery` | `bootstrap-protocol.md:24` | claims the response carries "the workflow definition"; the tool returns metadata plus activity stubs | pre |
| MM-20 | `describe-tool-value` | `bootstrap-protocol.md:24`; `start-session.md:36-48` | mechanics in place of value; Outputs omit `repo_unbound` — precisely the signal that this change's derivation-plus-fallback contract failed to bind — plus `planning_slug` and the workflow metadata block | pre |
| MM-21 | `no-technique-resource-dual-home` | `start-session.md:52-56` | Protocol step 2 is character-for-character `bootstrap-protocol.md` step 3; step 3 restates its step 4 | pre |
| MM-22 | `statement-not-question` | `00-discover-session.yaml:96` | `resume-session` message ends in `?` and re-asks what the option labels already carry | pre |
| MM-23 | `structure-backed-constraints` | `agent-conduct.md:96-98` | MUST/NEVER commit-location rule with no checkpoint, condition or validate action backing it; `commit-and-persist.md::commit-after-activity` restates it, also unbacked | new |
| MM-24 | `no-invented-naming` | `agent-conduct.md:96` | the rule rename is outside the approval record — manifest row 12 authorizes repointing the assertion, judgement 3 "repoint all three readers"; neither names a rename. The incomplete search is evidenced by MH-1 | new |
| MM-25 | `hoist-shared-inputs` | `preflight.md:12,16`; `commit-and-persist.md:20,24` | the pair is declared identically on two techniques in two different groups while the root container `meta/techniques/TECHNIQUE.md` declares no I/O despite claiming to hold shared inputs | new |
| MM-26 | `27-state-contract-contribution` | `version-control/TECHNIQUE.md:8` | the group gained a domain invariant (`host-is-derived-component-is-named`) but the Capability is unchanged, while the non-authoritative `meta/README.md:36` already advertises the new contract | new |
| MM-27 | step-gate-as-prose (`steps[].when`/`condition`) | `02-resolve-target.yaml:58` | "and **on a resume** the saved client `repo_root` MUST name that same directory" is a conditional in an unconditional `validate`; `is_resuming` is declared at `meta/workflow.yaml:82` and sibling steps in the same file use the formal gate | new |
| MM-28 | `no-next-step-narration` | `00-discover-session.yaml:22,28`; `02-resolve-target.yaml:39` | routing narrated in option descriptions and messages that `transitions` / `effect.transitionTo` / labels already own. **Also factually wrong**: `:28` claims aborting means "no session … is created", but bootstrap step 3's `start_session` has already created and bound the meta session before this activity runs | new |
| MM-29 | `no-user-env-mutation` | `preflight.md:24,29`; `work-package/activities/11-validate.yaml:33` | the technique prescribes `apt-get install -y protobuf-compiler` as its product and the bind site's message directs the install; the same workflow declares the opposite boundary at `work-package/workflow.yaml:20` | pre |

### Low

| # | Entry | Site(s) | Attr |
|---|---|---|---|
| ML-1 | `avoidance-voice-in-definitions` | `00-discover-session.yaml:125` outcome; `meta/README.md:9,14` | new / pre |
| ML-2 | `procedure-in-capability` | `resolve-host-repo.md:8` — Protocol imperatives restated plus a hyperlink in Capability | new |
| ML-3 | `technique-outputs-declared` | `preflight.md:30` returns `missing-prerequisites`; the declared output is `missing_prerequisites` | pre |
| ML-4 | `paren-invocation-args` | `commit-and-persist.md:34,38` — argument lists outside parentheses with backticked parameter names | pre |
| ML-5 | `no-one-step-rules` | `commit-and-persist.md:56-58` — `no-stale-remote` names the single step it constrains | pre |
| ML-6 | `role-rules-not-description` | `meta/workflow.yaml:53,88` — agent-behaviour prescriptions inside variable descriptions | new / pre |
| ML-7 | `11-complete-documentation-structure` | `meta/techniques/` has no `README.md`; 11 of 14 reference workflows carry one | pre |

### Resolved during this activity

**MR-1 · input optionality and default form · `resolve-host-repo.md:12-18`** — `workspace_path`
carried its default as trailing description prose with no optionality marker, diverging from the
group sibling form (`push-branch.md:22`) and from the `#### default` sub-section used across the
reference workflows. Rewritten to `*(optional)*` plus a `#### default` sub-section. This also
cleared the guard's `orphan-input workspace_path` rejection, since the loader recognises
`#### default` as a producer. `check-technique-template` re-run clean.

---

## Target: `work-package`

Consumer surface: the sweep ran over all 15 other workflow directories and found 50 references
into 16 `work-package` files, **none** of which resolves into a file this run changed. The three
changed files are an activity YAML no other workflow borrows, a standalone technique bound only by
`work-package`'s own `01-start-work-package`, and `workflow.yaml`. An empty changed-file consumer
surface is the recorded result of the sweep, not an unrun sweep.

### Critical

**WC-1 · `bind-protocol-locals` · `work-package/activities/01-start-work-package.yaml:163`**
The step binds `discovered_path: "{host_repo_path}/{component_path}"`. Neither name is declared in
`work-package/workflow.yaml` (which declares `target_path`, `repo_root`, `component_name`,
`discovered_path`, `planning_folder_path`), neither is produced by any work-package step, and
neither is inherited: the child bag is seeded from that workflow's `variables[]` plus `user_request`
alone (`src/tools/resource-tools.ts:449-453`). At the base ref this was a bare-string bind that
resolved by same-name from a declared variable. The authored prose confirms the cross-session
reach: `repo-root-resolution.md:14` says the value comes "from **the meta session's**
`component_path`". The change's own co-change set for this seam was walked — all three files were
edited — but the declaration gap was not closed; `work-package/workflow.yaml:514-516` only
reworded `discovered_path`'s description.
*Fix*: declare `host_repo_path` and `component_path` in `work-package/workflow.yaml` and seed them
across the session boundary, or bind `discovered_path` from a value work-package already declares.
**new**

### High

**WH-1 · `duplicate-shared-capability` + `capability-group-placement` ·
`work-package/techniques/repo-root-resolution.md:29`**
Protocol step 2 re-authors the git superproject-ascent recipe (`.gitmodules` parent test, "keep
ascending while it holds") for a capability this same change created as the shared meta op
`version-control::resolve-host-repo`, whose step 2 is the identical ascent. The file names the
shared home itself: "This is the same ascent `meta`'s `version-control::resolve-host-repo`
performs at session bootstrap, where it is stated canonically." The local novelty is only output
naming. The carve-out for "the activity binds the shared op as its own step" does not apply:
`01-start-work-package.yaml:159-163` binds the local technique, not the shared op.
*Fix*: delete the local recipe, bind `version-control::resolve-host-repo`, and keep only
caller-specific value assembly locally. **new**

**WH-2 · `io-agnostic-contract` · `repo-root-resolution.md:14` (mirrored at `work-package/workflow.yaml:516`)**
The input entry names the workflow-internal producer down to the activity, the step and the
producing session: "Bound explicitly by `01-start-work-package`'s `resolve-repo-root` step from
the meta session's `component_path`, absolutized against `host_repo_path` — not a path the user
typed." This is not the exempted intrinsic/external origin.
*Fix*: describe what the value is — an absolute filesystem path to the component directory under
inspection — and drop the internal source naming. **new**

**WH-3 · `worker-rule-reach` · `work-package/workflow.yaml:21-24`**
Four rules — `safety-floor-never-simplified`, `report-before-apply`,
`leanness-reported-honestly`, `complementary-not-duplicative-with-strategic-review` — all command
the worker that runs the lean-coding audit, yet exist only under `rules.workflow`, which workers
never receive. A library-wide grep for each key returns this file alone, and the worker-facing
`09-lean-coding-audit.yaml:76` says "Confirm the applied simplifications hold the safety floor"
without the floor's definition ever reaching the worker.
*Fix*: move worker-directed rules to `rules.activity` or the owning technique's `## Rules`. **pre**

### Medium

| # | Entry | Site(s) | Note | Attr |
|---|---|---|---|---|
| WM-1 | `no-rationale-in-description` | `work-package/workflow.yaml:516`; `repo-root-resolution.md:14,29` | producer/consumer narration and cross-technique rationale where siblings in the same file are terse one-liners | new |
| WM-2 | `variable-description-one-line` | `work-package/workflow.yaml:516` | multi-sentence with a bind-site tail and "Its basename becomes `component_name`" | new |
| WM-3 | `technique-stage-agnostic` | `repo-root-resolution.md:29` | "performs **at session bootstrap**" answers where in the workflow flow | new |
| WM-4 | `9-encode-constraints-as-structure` | `01-start-work-package.yaml:158-163` | absoluteness is a hard precondition in text only (`repo-root-resolution.md:14`), and a legal state violates it — `component_path` has `defaultValue: .` and `host_repo_path` may be left unset by design. The same file shows the available form two steps later (`verify-signing-precondition`) | new |

### Low

| # | Entry | Site(s) | Attr |
|---|---|---|---|
| WL-1 | `avoidance-voice-in-definitions` | `repo-root-resolution.md:14` — "not a path the user typed", negating the superseded definition | new |
| WL-2 | `procedure-in-capability` | `repo-root-resolution.md:8` — `{repo_root}`/`{component_name}` braces and a prohibition in Capability | pre |
| WL-3 | `validate-message-economy` | `01-start-work-package.yaml:248` — trailing consequence essay | pre |
| WL-4 | `no-valueless-control-set` | `01-start-work-package.yaml:147-157,538-543` — value-less control `set` carrying derivation HOW | pre |
| WL-5 | `no-duplicate-technique-steps` | `01-start-work-package.yaml:562,574` — two adjacent steps bind `naming-conventions`, whose single run produces both outputs | pre |
| WL-6 | `outcome-names-value` | `01-start-work-package.yaml:793` — pure-plumbing outcome ("a canonical, writable location is established") | pre |

---

## Coverage ledger

50 enumeration units. `walked` means the unit's criteria were applied to every file in scope
(the 19 changed files across both targets, read in full and against the base-ref diff, plus the
11 consumer-surface sites, with sibling-convention comparison against the 14 reference workflows).
Whole-surface mechanical coverage of both targets' 315 files comes from the guard suite, which runs
tree-wide.

| Home | Units | walked | not-applicable | blocked |
|---|---|---|---|---|
| `workflow-design/anti-patterns` | 13 | 12 | 1 | 0 |
| `workflow-design/design-principles` | 30 | 27 | 3 | 0 |
| `workflow-design/schema-construct-inventory` | 6 | 6 | 0 | 0 |
| `workflow-design/convention-conformance` | 1 | 1 | 0 | 0 |
| **Total** | **50** | **46** | **4** | **0** |

### Divergences — the four `not-applicable` units, each an evidenced negative

| Unit | Reason it does not reach this surface |
|---|---|
| `anti-patterns#creation-rules` | Governs how anti-pattern entries themselves are authored. No file in scope is a criteria home: `grep -rn "^### AP-"` over the 19 changed files and 11 consumer sites returns zero hits; all 130 entries live in `workflow-design/resources/anti-patterns.md`, which this change does not touch and no changed file references. |
| `design-principles#2-internalize-before-producing` | Governs the authoring session's order of work, not authored artefacts. No construct in scope carries evidence of pre- or post-internalisation ordering. |
| `design-principles#23-close-the-loop` | No recommendation-shaped deliverable in scope; the one analysis-to-action seam the change adds (`host_binding_mismatch` → checkpoint) terminates in an explicit `abort-binding` stop gate. |
| `design-principles#28-creation-guide-for-generated-documents` | No changed technique persists a planning artifact — no `#### artifact` declaration exists in any of the 19 changed files. |

**No unit is `blocked`**, so this walk records no missing coverage.

---

## Guard results

`npx tsx scripts/check-all.ts --root <target_path>` — 17 guards, 16 pass, 1 fail.
Both positional validators pass per target: `validate-workflow-yaml.ts` against `meta` (5
activities, 133 technique files) and against `work-package` (111 technique files), and
`validate-activities.ts` over the tree (112 passed, 0 failed).

`binding-fidelity` rejects 3 definition files after the one resolvable failure was resolved
(198 violations total: 70 harmless, 123 fix-later, 0 live bugs, 4 untriaged).

| Rejected file | Guard finding | Register entry |
|---|---|---|
| `meta/techniques/version-control/resolve-host-repo.md` | `dead-output is_monorepo_host` | MH-8 |
| `meta/techniques/cargo-operations/preflight.md` (at its `work-package` bind) | `orphan-input component_path`, `orphan-input host_repo_path` | MC-1 / WC-1 |
| `substrate-node-security-audit/techniques/write-report.md:90` | `read-resolution {target_path}` | outside both targets, pre-existing baseline drift — not attributable to this change |

The three in-target rejections all require a design decision that touches this run's open
judgements (how the derived host values cross the meta → client session boundary, and whether
`is_monorepo_host` gains a reader or is withdrawn). They are recorded here for disposition rather
than suppressed into `scripts/binding-fidelity-triage.json` — no entry was added to that file.

---

## Accepted exclusions — known findings, recorded not deleted

74 keys were loaded and compared; **none matched a finding raised above**, so the decision surface
is unchanged by them. They remain readable as suppressions so a later pass can ask whether each
acceptance still holds.

| Source | Keys | Class | Verdicts |
|---|---|---|---|
| `scripts/binding-fidelity-triage.json` | 63 | `dead-output` | 32 `meta` (harmless), 31 `work-package` (fix-later) |
| `scripts/binding-fidelity-triage.json` | 8 | `read-resolution` | 1 `meta`, 7 `work-package` (harmless) |
| `scripts/check-review-mode-gating.ts` `ACCEPTED_HEADLESS_AUTO_ADVANCE` | 3 | `review-mode-headless-auto-advance` | `work-package::codebase-comprehension::comprehension-sufficient`, `work-package::requirements-elicitation::elicitation-complete`, `work-package::research::context-scope-declaration` |

Keys are class-keyed rather than entry-keyed, because both sources name a violation class rather
than a criteria entry. The `audience` and `identifier-qualification` guards are hard-zero with no
baseline, and the planning folder held no prior findings register, so neither contributed keys.
