---
Lens: 30 — reachability ("What code is dead?")
Dimension: Redundant Work
Target: /home/mike1/projects/dev/workflow-server — workflows/meta/**, workflows/work-package/**; implementation surface src/**, scripts/**
Evaluation Date: 2026-08-17
---

# Portfolio Lens 30 — `reachability` over meta and work-package

Lens `reachability` (dead code, unreachable paths), serving the **Redundant Work** dimension, run against `workflows/meta/**` and `workflows/work-package/**` with `src/**` and `scripts/**` as implementation surface.

The lens was executed as its three-step program. Step 1 builds the call graph — for a definition corpus that means the reachability closure over activity transitions, step-level technique bindings, activity-level technique lists, `Apply [x](./x.md)` markdown call edges inside technique protocols, and resource references. Step 2 hunts stale and shadow state — declared variables that occupy the session bag but never influence behaviour, and gates checked against values no writer produces. Step 3 exposes structural deadness under the lens's three named patterns, translated to this domain: Zombie Override (a definition that shadows another by name and is never invoked), Phantom Configuration (validated or gated but never populated), Orphaned Handler (a handler for a condition the guarded body cannot raise).

Every measurement below was taken read-only against the working checkout. Where a finding is *provably* unreachable it is labelled **DEAD**; where a path is merely unexercised on the common route but load-bearing for a real caller it is labelled **RARE** and is not counted as a saving.

## Method and its one blind spot

Roots for the closure are the 21 workflows' `initialActivity` plus each `workflow.yaml` `techniques:` list. Edges:

| Edge kind | Mechanism | Counted |
|---|---|---|
| activity → technique | step `technique:` (string or `{name, inputs}` object), activity `techniques:` list | 174 step bindings in work-package over 110 distinct techniques; 53 in meta over 35 |
| technique → technique | `Apply [op](./op.md)` markdown links inside `## Protocol` | the intra-group call mechanism; 17 sites call `github-cli-protocol::resolve-repo-coordinates` alone |
| activity → activity | `transitions[].to`, checkpoint `transitionTo` | 15 work-package activities, 5 meta lifecycle activities |
| technique → group index | engine-applied: `composeLoaded` loads the workflow root `TECHNIQUE.md` and each containing group index as ancestors of every nested op | automatic, so no group index is ever an orphan |
| \* → resource | step `resource:`, markdown links, bare-id prose mention in activity YAML | 6 meta resources, 36 work-package resources |

Bare op ids resolve first against the group named after the enclosing activity (`technique: classify` inside activity `design-philosophy` → `design-philosophy::classify`), so the closure applies that convention; without it the analysis produces 35 false unreachables in work-package alone.

**The blind spot, stated up front.** Reaching a technique file does not require a static edge. An agent can call `get_technique` for any id it learns from prose. The server does not enumerate a group's ops on delivery (`resolveTechniques` returns only the named technique's own body plus its ancestors), so an op with no static edge and no prose mention anywhere in the corpus is unreachable *in practice* — the agent has no way to learn the name. That is the DEAD criterion used below: zero static edges **and** zero mentions in any activity, technique, resource or README across all 21 workflows.

---

## Step 1 — Call graph and usage

### 1.1 The meta pattern library: 20 files, zero callers

`workflows/meta/activities/patterns/` holds five standalone orchestration-pattern activities — `01-orchestrator-workers.yaml`, `02-supervisor.yaml`, `03-plan-and-execute.yaml`, `04-isolated-fan-out.yaml`, `05-lead-researcher.yaml`. All five have **zero in-edges**. They are not part of meta's lifecycle graph (which is `discover-session → initialize-session → resolve-target → dispatch-client-workflow → end-workflow`) and they cannot be reached by id either: `loadActivitiesFromDir` in `src/loaders/workflow-loader.ts:63` calls `readdir` **without** `recursive: true`, and `readActivityRaw` at line 567 does the same, so the `patterns/` subdirectory never enters meta's activity set. `next_activity({ activity_id: 'orchestrator-workers' })` on a meta session cannot resolve.

The one designed entry point is an activities-list string ref from another workflow — the mechanism `remediate-vuln/workflow.yaml:327-340` uses to borrow 14 work-package activities. **No workflow declares a ref to any pattern activity.** The only places `meta/patterns/…` appears are two `workflow-design` resources documenting that the library exists (`resources/design-principles.md:119`, `resources/schema-construct-inventory.md:37-42`).

The 14 `orchestration-patterns` ops exist to serve those five activities. Five of them are bound *only* from pattern activities and nowhere else:

| Op | Bound at | Status |
|---|---|---|
| `orchestration-patterns::compose-worker-briefs` | 4 pattern-activity steps only | **DEAD** |
| `orchestration-patterns::assess-research-gaps` | 2 steps in `05-lead-researcher.yaml` only | **DEAD** |
| `orchestration-patterns::execute-plan-step` | 2 steps in `03-plan-and-execute.yaml` only | **DEAD** |
| `orchestration-patterns::plan-research-questions` | 1 step in `05-lead-researcher.yaml` only | **DEAD** |
| `orchestration-patterns::replan` | 1 step in `03-plan-and-execute.yaml` only | **DEAD** |

The remaining nine ops (`dispatch-workers`, `gather-results`, `synthesise-results`, `decompose-work-units`, `classify-request`, `compose-worker-brief`, `plan-steps`, `invoke-as-tool`, `gather-results`) survive because other workflows cite them directly — `cicd-pipeline-security-audit/workflow.yaml:19,21` names `orchestration-patterns::dispatch-workers` in two workflow rules. So the group is not dead; the *pattern-activity layer over it* is.

**Measured: 20 files (5 activities + 14 ops + README), 28,692 bytes (28.0 KB), 3,374 words, ~4,554 tokens.**

### 1.2 `knowledge-base-search`: an entire group with no reference anywhere

`workflows/meta/techniques/knowledge-base-search/` holds `TECHNIQUE.md` plus `broad-chunks-search.md`, `catalog-search.md`, `chunks-search.md`, `load-domain-index.md`. **Zero static edges. Zero prose mentions anywhere in the 21 workflows** — the only occurrence of the string is a directory-tree listing in `workflows/meta/README.md:146`.

This is not an unused capability; it is a *duplicated* one. `workflows/work-package/techniques/research/research.md:29` inlines the protocol the group was built to hold: "Fetch `concept-rag://activities` resource to load its index", then the search calls in prose. The group's `load-domain-index` op does exactly that, and `binding-fidelity` already reports its `domain_index` output as consumed by nothing. Two implementations of one capability; the reachable one is the inline prose, the group is the orphan.

**Measured: 5 files, 1,902 bytes (1.9 KB), 266 words. Its `TECHNIQUE.md` is 125 bytes carrying a `## Capability` heading and nothing else — a container with no contract.**

### 1.3 The rest of the DEAD meta technique set

Twenty-six further meta technique files have zero static edges and zero corpus mentions:

| Group | Dead ops | Note |
|---|---|---|
| `atlassian-operations` | `create-jira-issue`, `search-jira-issues`, `list-jira-projects`, `list-jira-issue-types`, `list-jira-issue-fields`, `log-work-jira-issue` (6 Jira) + `create-confluence-page`, `update-confluence-page`, `search-confluence`, `list-confluence-spaces`, `list-confluence-pages-in-space`, `list-confluence-page-descendants`, `comment-confluence-page-footer`, `comment-confluence-page-inline` (8 Confluence) | The **entire Confluence half of the group is unreachable** — 8 of 9 Confluence ops dead, only `get-confluence-page` surviving on a prose mention. No workflow in the corpus writes to Confluence. |
| `gitnexus-operations` | `read-cluster`, `read-process`, `rename` | `read-cluster`/`read-process` are named only in `substrate-node-security-audit/CHANGELOG.md:11`, describing enrichment that workflow no longer binds. |
| `github-cli-protocol` | `add-labels`, `update-pr-title` | |
| `cargo-operations` | `build-dev` | `build-release`, `check`, `clippy`, `doc`, `fmt-*`, `run-suite`, `test` all survive. |
| `version-control` | `identify-path-type` | Its `kind` output is also in the `binding-fidelity` dead-output list — doubly dead. |

**Six of the 31 DEAD meta techniques also appear in the `binding-fidelity` dead-output triage as declaring an output nothing reads**: `create-jira-issue` (`issueKey`), `build-dev` (`build_artifacts`), `rename` (`changes`), `identify-path-type` (`kind`), `load-domain-index` (`domain_index`), `execute-plan-step` (`step_result`). Two independent analyses converging on the same files is the strongest signal in this report — an op nothing calls, producing a value nothing reads.

**Measured, all 31 DEAD meta techniques: 13,798 bytes (13.5 KB), 1,873 words, ~2,528 tokens.**

### 1.4 work-package DEAD techniques — three files, all Zombie Overrides

Only three of work-package's 111 technique files are unreachable, and all three shadow a live sibling by name (see Step 3.1):

| File | Bytes | Live twin |
|---|---|---|
| `techniques/update-pr/push-commits.md` | 500 | `techniques/manage-git/push-commits.md`, bound at `13-submit-for-review.yaml:175` |
| `techniques/finalize-documentation/revise-session-metrics.md` | 1,195 | `meta/techniques/workflow-engine/revise-session-metrics.md` |
| `techniques/manage-git/squash-merge.md` | 778 | none — its content is narrated by `manage-git/instruct-merge-strategy.md:20`, which is advisory-only |

`update-pr/push-commits.md` has **zero occurrences of the string `update-pr::push-commits` anywhere in the corpus**. Both push files declare the same output `pushed_branch`; a third, `meta/techniques/version-control/push-branch.md`, declares it too. Three implementations of "push the branch", one bound.

### 1.5 Unreachable resources

`workflows/work-package/resources/readme-deprecated-notice.md` (783 bytes) is a v2.0.0 tombstone — "Consolidated into [readme](./readme.md) as of v2.0.0" — linked by nothing but its own row in `resources/README.md:11`. **DEAD.**

All 6 meta resources and the other 35 work-package resources are reachable. Note that **none of the 41** is reached by a step-level `resource:` binding; every one arrives via a markdown link inside a technique protocol or a bare-id prose mention. That is the corpus convention, not a defect, but it means no static guard can distinguish a resource an agent will actually fetch from one it will skip.

### 1.6 Implementation surface: exported symbols with no caller

Scanning 398 exported values (`function`/`const`/`class`) across `src/**` and `scripts/**` against all of `src/`, `scripts/` and `tests/`, five exported **functions** have no caller anywhere, including tests. All five are the throwing twin of a `safeValidate*` form that *is* used:

| Site | Symbol |
|---|---|
| `src/schema/state.schema.ts:207` | `createInitialState` |
| `src/schema/state.schema.ts:218` | `validateState` |
| `src/schema/state.schema.ts:219` | `safeValidateState` |
| `src/schema/state.schema.ts:222` | `addHistoryEvent` |
| `src/schema/activity.schema.ts:308` | `validateActivity` |

`src/schema/state.schema.ts` is 226 LOC; these four are its entire mutation/validation façade, and the live code path writes state through `advanceSession` + `applyVariableWrites` (`src/utils/variable-seed.ts:60`) instead. This is a genuine Zombie Override at the code level: a façade the callers bypassed.

A further 78 exported symbols are referenced only within their own file (mostly zod sub-schemas composed into `StepSchema`). Those are over-exported rather than dead; not counted.

**Scripts.** Two `.ts` files under `scripts/` are absent from both `package.json` and the `check-all.ts` registry and are invoked by nothing: `scripts/analyze-io-protocol-refs.ts` — whose own header states it is "not a gate… deliberately absent from the guard registry" — and `scripts/count-workflow-sessions.ts` (127 LOC). The remaining unwired files are libraries the guards import (`guard-protocol.ts`, `guards.ts`, `workflows-root.ts`, `markdown-refs.ts`, `fragments-index.ts`) or shell entrypoints, and are reachable.

---

## Step 2 — Stale and shadow state

Two engine write paths exist into the session variable bag, and only two: checkpoint `setVariable` effects (`respond_checkpoint`, `src/tools/workflow-tools.ts:1603`) and worker-reported `variables_changed` on `next_activity` (`src/tools/workflow-tools.ts:577`). The second is what a technique's declared `## Outputs` entry becomes under the name-match convention. `seedDefaults` (`src/utils/variable-seed.ts:11`) seeds every declaration carrying a `defaultValue` and nothing else. So a declared variable with no `setVariable`, no `set` action, and no technique anywhere in the corpus declaring it as an output **has no producer** — it can only ever hold its seeded default.

Loop constructs are producers too (`loopType: forEach` binds its `variable:` per iteration), and `over:` is a read; both are credited below, which removes six false positives.

### 2.1 Variables with no producer, consumed anyway — Phantom Configuration

**work-package: 18 of 140 declared variables (12.9%).** meta: 3 of 27, all three externally seeded by the bootstrap protocol and correctly so.

| Variable | Consumption sites | Verdict |
|---|---|---|
| `stealth_mode` | **24 gates** across `06-plan-prepare`, `07-assumptions-review`, `12-strategic-review`, `13-submit-for-review` | **RARE, load-bearing.** No work-package writer exists because `remediate-vuln/workflow.yaml:53` seeds it `true` and borrows the activities. All 24 gates are constant-false in every work-package run and constant-true in every remediation run. Not a defect; the largest single block of never-taken branches in the corpus. |
| `safety_floor_cleared` | 1 `action: validate` target at `09-lean-coding-audit.yaml:75` (`target: safety_floor_cleared == true`) | **DEAD gate.** No producer anywhere. The workflow-level rule `safety-floor-never-simplified` promises "the simplification-apply-cycle validates the floor before resetting its driver flag" — the validation names a variable nothing sets, so the check can only ever fail or be ignored. |
| `assumption_decisions` | declared `## Inputs` of `review-assumptions/record.md` — the **most-bound technique in the workflow, 15 step sites** | **DEAD input.** The input every one of those 15 bindings depends on holds `[]` forever. |
| `skip_architecture_summary` | 1 gate, `10-post-impl-review.yaml:129` (`when: skip_architecture_summary != true`) | **Constant-true gate.** The step always runs; the gate is decoration. |
| `needs_plan_revision` | 1 transition condition, `07-assumptions-review.yaml:141` | **DEAD transition** (see 3.3) |
| `needs_further_discussion` | 1 transition condition, `07-assumptions-review.yaml:147` | **DEAD transition** (see 3.3) |
| `default_branch` | declared input of `manage-git/sync-branch.md` and `manage-git/squash-merge.md` | No producer. `sync-branch` is live, so this is a real binding gap. |
| `provenance_log_path` | 3 interpolations | No producer; default `""`. |
| `jira_issue_key` | 2 interpolations | No producer; default `""`. |
| `block_path`, `block_line_range`, `build_dependent_artifact_commands`, `flagged_block_indices`, `implementation_plan`, `issue_request`, `issue_title`, `question_domains`, `push_remote`, `user_request` | 1–4 sites each | `push_remote` and `user_request` are externally seeded by convention; the other eight are unproduced. |

`check-binding-fidelity` does not catch these. Its `read-resolution` check accepts "declared workflow var" as a producer (`scripts/check-binding-fidelity.ts` detail string: *"has no producer (declared id / $-local / workflow var / set-target)"*), so **declaration itself satisfies the guard**. That is the precise hole: 41 binding findings exist for these two trees and all 41 are triaged harmless, while 18 unproduced-but-consumed variables pass unremarked.

### 2.2 Variables written and never read — write-only state

**work-package: 16 of 140.** Every one is a checkpoint `setVariable` whose value nothing subsequently reads:

`assumption_batch_accepted` (1 writer), `assumption_deferred` (3), `assumption_resolved_inline` (4), `audit_confirmed` (3), `body_override_recorded` (1), `build_artifact_user_owned` (1), `findings_raised_to_author` (3), `github_issue_number` (1), `has_stakeholder_input` (2), `issue_approved` (2), `strategic_findings_actionable` (2), `strategic_findings_deferred` (1), `strategic_fixes_selective` (1), `submission_aborted` (1), `target_workflow_outcomes` (1), `ticket_refactor_needed` (3).

That is **30 write sites producing values no gate, interpolation or technique input consumes.** They are audit breadcrumbs — each write lands a `variable_set` history event — but they influence no behaviour. `audit_confirmed` is the clearest case: all three options of the `audit-findings-confirmed` checkpoint set it `true`, so it carries no information even as a record.

**meta: 2 of 27.** `abort_completion` is set `false` by one option and `true` by the other of `end-workflow`'s `completion-confirmed` checkpoint and read by nothing — the behaviour lives entirely in that option's `transitionTo: dispatch-client-workflow`. `client_planning_slug` has one writer, no reader.

### 2.3 Variables neither written nor read

**work-package: 9 pure dead declarations** — `artifact_name`, `current_branch`, `has_stakeholder_comment`, `needs_cleanup`, `prism_artifact_paths`, `safety_floor_cleared`, `skip_assumption_review`, `stakeholder_review_complete`, `task_assumptions`. **meta: 2** — `meta_session_index` and `target_workflow_outcomes`, both consumed by name-match binding rather than `{…}` interpolation (`01-initialize-session.yaml:27` passes `parent_session_index: meta_session_index`), so both are live; the meta count is effectively zero.

`prism_artifact_paths` is the notable one: it is declared to carry "Paths to prism structural analysis artifacts produced during post-impl-review", and the step that would produce them is empty (Step 3.2).

### 2.4 Gates that can never flip

Distinct from "no producer": a variable whose only writer sets it to the value it already defaults to.

| Workflow | Variable | Gate | Consequence |
|---|---|---|---|
| meta | `client_workflow_completed` | `04-end-workflow.yaml:13` — `when: client_workflow_completed == true && planning_folder_path != ''` | Default `false`; the **only** writer is the `return` option at line 42 setting it `false`. **`workflow-engine::revise-session-metrics` never executes.** |
| meta | `workflow_match_ambiguous` | `00-discover-session.yaml` | Default `false`; only writer sets `false`. |
| work-package | `post_jira_comment` | `07-assumptions-review.yaml:89` (`post_jira_comment != false`) | Default `false`; only writer sets `false`. The gate reads `!= false`, so it is constant-false and `post-summary-jira` never fires on that clause. |

The meta `client_workflow_completed` finding has downstream reach. `revise-session-metrics` is the authoritative post-exit rewrite of `session-trace.md` and `token-usage.md`; three separate files document that it happens — `finalize-documentation/render-token-usage.md:8,49`, `resources/session-trace.md:41`, `conduct-retrospective/retrospective.md:51` all say a mid-`complete` write is "a **draft**" that meta's `end-workflow` rewrites. It does not. Both artifacts ship as drafts in every run, and the work-package pointer technique that documents the rewrite (`finalize-documentation/revise-session-metrics.md`) is itself unbound.

---

## Step 3 — Structural deadness

### 3.1 Zombie Override — definitions that shadow a live twin and are never invoked

| Shadow | Base it shadows | Bound? |
|---|---|---|
| `work-package/techniques/update-pr/push-commits.md` (500 B) | `work-package/techniques/manage-git/push-commits.md` (676 B, 1 binding) — and `meta/techniques/version-control/push-branch.md` (638 B) | **No** |
| `work-package/techniques/finalize-documentation/revise-session-metrics.md` (1,195 B) | `meta/techniques/workflow-engine/revise-session-metrics.md` (3,058 B) | **No** — and the base's own step never fires (2.4) |
| `src/schema/state.schema.ts` façade — `createInitialState`, `addHistoryEvent`, `validateState`, `safeValidateState` | `advanceSession` + `applyVariableWrites` | **No callers** |
| `src/schema/activity.schema.ts:308 validateActivity` | `safeValidateActivity` (used by `scripts/validate-activities.ts:41`) | **No callers** |

The four duplicated technique basenames named in the brief resolve as follows, and only one is a zombie:

| Basename | meta copy | work-package copy | Verdict |
|---|---|---|---|
| `analyze` | `gitnexus-operations/analyze.md` (2,957 B) | `implementation-analysis/analyze.md` (3,341 B) | **Both live, unrelated capabilities** — a graph index build vs. a baseline analysis. Name collision only. |
| `create-pr` | `github-cli-protocol/create-pr.md` (1,221 B) | `update-pr/create-pr.md` (1,334 B) | **Both live.** meta's is bound by `workflow-design` and `workflow-authoring`; work-package's by its own `13-submit-for-review`. Genuine overlap worth folding, not deadness. |
| `mark-ready` | `github-cli-protocol/mark-ready.md` (560 B) | `update-pr/mark-ready.md` (556 B) | **Both live, near-identical size.** The clearest fold candidate in the pair set. |
| `revise-session-metrics` | `workflow-engine/revise-session-metrics.md` (3,058 B) | `finalize-documentation/revise-session-metrics.md` (1,195 B) | **work-package copy is a Zombie Override** — a pointer file that only says "the real one lives on meta". |

On the **eleven parallel `TECHNIQUE.md` group files**: the group indexes are never orphans, because `composeLoaded` (`src/loaders/technique-loader.ts:499`) loads the workflow root index plus every containing group index as an ancestor of each nested op. The structural finding is the inverse of deadness — an **ancestor tax**: meta carries 9 group indexes totalling 25,776 B on top of a 681 B root; work-package carries 16 totalling 29,562 B on top of a 1,111 B root. Two of those 25 carry a `## Capability` heading and nothing else and therefore contribute no contract while still costing an ancestor load: `knowledge-base-search/TECHNIQUE.md` (125 B) and `dco-provenance/TECHNIQUE.md` (115 B). Exactly one of the 25 declares a `## Protocol` (`update-pr/TECHNIQUE.md`, 3,659 B); the other 24 are contract-only.

### 3.2 Steps that exist and cannot act — five empty `actions: []`

Five `kind: action` steps in work-package declare `actions: []`. Each carries a `when:` gate and an id and performs nothing; each sits immediately before a checkpoint, so each is a gate carrier masquerading as work.

| Site | Step id | Gate | What it names |
|---|---|---|---|
| `01-start-work-package.yaml:250` | `check-github-issue` | `issue_platform == 'jira' && github_issue_found == false` | precedes the `github-issue-missing` checkpoint |
| `10-post-impl-review.yaml:80` | `dispatch-prism` | `problem_complexity == 'complex'` | **the prism integration.** Nothing is dispatched, and `prism_artifact_paths` — the variable declared to carry its output — has no producer and no reader (2.3). The whole prism path in `post-impl-review` is inert. |
| `11-validate.yaml:46` | `fix-failures` | `is_review_mode != true && run_local_validation == true && validation_results.validation_passed == false` | precedes the fix-revalidate loop |
| `13-submit-for-review.yaml:39` | `present-summary-to-user` | `is_review_mode == true` | precedes `review-summary-approval` |
| `13-submit-for-review.yaml:347` | `await-review` | `stealth_mode != true` | precedes `review-received` |

`check-checkpoint-entry` exists as a guard ("no activity opens with a checkpoint"), which is plausibly why some of these were introduced — but three of the five are mid-activity, so that is not the reason for all of them. No guard rejects an empty `actions` array.

### 3.3 Transition edges that cannot be taken

`07-assumptions-review.yaml` declares five transitions. Two are gated on variables with no producer anywhere in the corpus:

- `-> plan-prepare` when `needs_plan_revision == true` (line 138-143)
- `-> assumptions-review` when `needs_further_discussion == true` (line 144-149)

Both are **DEAD edges**. The activity's own description and the workflow rule *"Decision points require user choice — When issues are found, user decides whether to proceed or loop back"* both promise the loop-back these two edges implement; the plan-revision path back to `plan-prepare` and the self-loop for further stakeholder discussion cannot be entered. `assumptions-review` therefore has exactly three reachable exits, not five.

### 3.4 Orphaned Handler — handlers for conditions the guarded body cannot raise

**`11-validate.yaml` is the headline case: on any non-Rust project the entire activity produces nothing the run consumes.** Trace the 11 steps for `project_type == 'other'` (which `project-type-detection.md:32` sets for anything without Substrate dependencies — including this TypeScript repository) in create mode:

| Step | Gate | Fires? |
|---|---|---|
| `mark-validation-na` | `run_local_validation == false` | yes, when validation is declined (the default) |
| `preflight` | `project_type == 'rust-substrate' && run_local_validation == true` | **no** |
| `run-suite` | same | **no** — and this is the sole producer of `validation_results` anywhere in the corpus (`meta/techniques/cargo-operations/run-suite.md:12`) |
| `document-failures`, `assess-test-coverage`, `triage-reported-failures` | `is_review_mode == true` | **no** |
| `fix-failures` | `… validation_results.validation_passed == false` | empty `actions: []` — no in any case |
| `fix-revalidate-cycle` (3 inner steps) | `run_local_validation == true && validation_results.validation_passed == false` | **no** — the loop handles failures from a suite that never ran |

The `fix-revalidate-cycle` loop and its `validate-build::analyze-failure` / `validate-build::apply-fix` / `cargo-operations::run-suite` steps are an Orphaned Handler in the exact sense the lens names: they catch a failure class the guarded body cannot produce. The activity's declared outcome — *"All tests passing when the suite ran locally, or Progress Validation marked cancelled/N/A"* — is satisfied by the N/A branch alone. **A generic (non-Rust) work-package run pays for an 11-step activity, one `next_activity` round trip and one `get_activity` payload to set one boolean.**

Second case: `validate-safety-floor` at `09-lean-coding-audit.yaml:75` validates `safety_floor_cleared == true` against a variable with no writer (2.1). The handler guards a condition the body cannot establish.

### 3.5 Verification repeated at multiple stages — where it actually is

The brief's hypothesis was that the 26 `check-*.ts` guards duplicate in-workflow verification. **They do not overlap at all for these two trees.** Guard invocations appear in exactly two places in the corpus: the definition-authoring workflows (`workflow-design/techniques/yaml-authoring.md:52`, `workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:22-23`, `workflow-design/techniques/audit-schema-validation.md:24`) and repo CI (`workflows/.github/workflows/verify-corpus.yml:70`). Neither `meta` nor `work-package` invokes a guard. The whole suite runs in **1.7 s, 26 pass, 0 fail** — it is not a cost worth optimising and it is not duplicated work.

The real duplication is **inside** work-package. Of its 264 steps, **90 (34%) are verification-shaped** (id or bound technique matching verify/validate/check/review/audit/assess, or carrying an `action: validate`); meta's figure is 8 of 43 (19%). Within those 90:

| Duplication | Sites | Cost |
|---|---|---|
| `review-test-suite` bound **4×** | `10-post-impl-review/test-suite-review`, `10-post-impl-review/re-test-suite-review`, `11-validate/assess-test-coverage`, `11-validate/triage-reported-failures` | The last two are **consecutive steps in the same activity, bound to the same technique, with the identical gate `is_review_mode == true` and no distinguishing inputs.** One of the two produces nothing new. Technique is 5,647 B. |
| `summarize-architecture` bound **2×** | `10-post-impl-review/architecture-summary` (gated on the producerless `skip_architecture_summary`, so always on) and `12-strategic-review/create-architecture-summary` (ungated) | Both write `architecture-summary.md`. The second overwrites the first, so the first write is redundant work by construction. Technique is 3,232 B. |
| `review-code` and `review-diff` bound 2× each | `10-post-impl-review` normal pass + `re-` pass inside `review-fix-cycle` | **RARE, load-bearing** — the re-pass is the loop body and only runs when findings were applied. |
| `review-assumptions::record` 15×, `::collect` 7×, `::interview` 8×, `analyse-challenge::run-loop` 7× | across 7 of 15 activities | **RARE, load-bearing** individually, but the group totals 17,605 B (review-assumptions) + 10,795 B (analyse-challenge) and is bundled into 7 of 12 `get_activity` payloads on a skip-optional walk. |
| `verify-artifact-conforms` bound **1×** in work-package (`12-strategic-review.yaml:52`), **0×** in meta | 13 of the other 19 workflows bind it | The opposite of duplication: work-package writes 25 distinct artifact filenames and conformance-checks them at one boundary. |

### 3.6 Artifacts written but never read downstream

Twenty-five artifact filenames are declared as technique outputs across the two trees. Three are read by no activity, no technique and no gate — only by the resource template that defines their shape and by the planning-folder README index:

| Artifact | Producer | Consumers |
|---|---|---|
| `code-review-method.md` | `review-code.md:44` | `resources/rust-substrate-code-review.md` (template), `resources/README.md:58`, `resources/readme-seed.md:49` |
| `test-suite-review-method.md` | `review-test-suite.md:40` | `resources/test-suite-review.md` (template), `resources/README.md:60`, `readme-seed.md:51` |
| `strategic-review-{n}-method.md` | `strategic-review/document-findings.md:30` | `resources/strategic-review.md` (template), `resources/README.md:68`, `readme-seed.md:56` |

These are method records — the audit trail of what each review walked. **Classified RARE-by-design, not dead:** their consumer is a human auditor, and deleting them removes provenance. But they are three of the ~25 artifacts a run writes, and the run itself consumes none of them, which is the honest answer to "artifacts written but never read downstream". Two further artifacts — `change-block-index.md` and `prior-feedback-triage.json` — have zero activity and zero technique readers, only resource-template mentions.

The measured delivery baseline for comparison (`scripts/fixtures/token-benchmark-a0-reference.json`, work-package / skip-optional / `context_mode: fresh`): **1,355,532 delivered chars** over one walk — `get_activity` 687,936 (12 calls, ~57 KB per activity payload), `get_resource` 448,084 (128 calls), `get_technique` 160,057 (26 calls), `get_workflow` 59,455. `get_activity` is 51% of the total, which is why dead steps, dead gates and duplicate step bindings — all of which live in the activity payload — are where definition-side reachability savings actually land.

---

## Opportunity enumeration

Savings are split honestly. **Corpus surface** = files a maintainer must keep template-conformant, README-indexed and guard-clean; removing them saves no run tokens, because technique files load lazily and an unreferenced file is never fetched. **Run payload** = bytes and round trips a real walk pays.

| # | Opportunity | Proof | Saving | Implementation surface | Cost |
|---|---|---|---|---|---|
| R1 | Delete the meta pattern library (5 activities + 5 exclusively-theirs ops + README) | Zero in-edges; `readdir` is non-recursive so the ids cannot resolve; zero borrow refs in 21 workflows | **20 files, 28.0 KB corpus surface, ~4,554 tokens.** Zero run payload | Definition edit: remove `meta/activities/patterns/`; remove 5 ops from `orchestration-patterns/`; update `workflow-design/resources/design-principles.md:119` and `schema-construct-inventory.md:37-42` | Low. Keep the 9 ops other workflows cite. If the library is *intended* to be borrowed, the cheaper fix is one borrow ref in a real workflow plus `recursive: true` in `loadActivitiesFromDir` |
| R2 | Delete `knowledge-base-search/` and fold its protocol into `research/research.md` | Zero edges, zero mentions; `research.md:29` already inlines the capability | **5 files, 1.9 KB corpus surface.** Removes one contract-free group index from the ancestor set | Definition edit | Low. Decide first whether the group is the intended home and `research.md` should `Apply` it instead — that is the opposite fix and costs one edit too |
| R3 | Delete the 26 remaining DEAD meta ops — 14 atlassian (8 of 9 Confluence ops), 3 gitnexus, 2 github, 1 cargo, 1 version-control, 5 orchestration-patterns | Zero static edges **and** zero corpus mentions; 6 also carry a `binding-fidelity` dead output | **26 files, ~11.6 KB corpus surface.** Shrinks `atlassian-operations` from 23 ops to 9 | Definition edit + one `scripts/binding-fidelity-triage.json` entry removal per deleted dead-output | Low–medium. The Confluence set is a coherent capability someone may be holding for a future workflow; if so, say so in the group index rather than leaving it inferable only from absence |
| R4 | Fix `client_workflow_completed` so `revise-session-metrics` can run | Only writer sets `false`; default `false`; gate needs `true` | Restores the post-exit rewrite that 4 files document. **Un-deads 1 meta step + 1 work-package technique** | Definition edit: `03-dispatch-client-workflow.yaml` (or the client's `complete` outcome) must set it `true`; or declare it an output of `workflow-engine::finalize-activity` | Low edit, **highest correctness value in this report** — two shipped artifacts are currently drafts |
| R5 | Remove the duplicate `review-test-suite` binding in `11-validate` | Two consecutive steps, same technique, identical gate, no distinguishing inputs | **~5.6 KB off the review-mode `get_activity` payload for activity 11**, one fewer agent execution of a 5.6 KB protocol | Definition edit: merge `assess-test-coverage` and `triage-reported-failures` into one step, or give them distinct `inputs` | Low. Confirm the two were meant to be different passes; if so the fix is inputs, not deletion |
| R6 | Collapse `summarize-architecture`'s double binding | Bound at `10-post-impl-review:127` and `12-strategic-review:90`; both write `architecture-summary.md`; the second overwrites | **3.2 KB technique delivery + one artifact write cycle per create-mode run** | Definition edit: drop the `10-post-impl-review` binding (its gate is dead anyway) | Low |
| R7 | Delete the 5 empty `actions: []` steps and hang their gates on the checkpoints that follow | `actions: []` cannot act | **5 fewer steps in a 264-step workflow**; removes the inert `dispatch-prism` illusion | Definition edit + a new guard | Low edit. **Add a guard** — see R11 |
| R8 | Make `11-validate` degrade honestly for non-Rust projects | Every producing step is `project_type == 'rust-substrate'`-gated; `validation_results` has one Rust-only producer; `fix-revalidate-cycle` handles failures that cannot arise | **One whole activity's `get_activity` payload + one `next_activity` round trip per generic run.** On the A0 shape that is ~57 KB of the 688 KB `get_activity` total (8%) | Definition edit: either add a language-neutral validation op (`npm test` / `cargo test` behind one `validate-build::run-suite`) or gate the activity itself `required: false` with a `project_type == 'rust-substrate'` entry condition | Medium. The first option is the real fix and is genuinely new capability, not deletion |
| R9 | Give `safety_floor_cleared` a producer, or delete the validate that names it | No writer; the workflow rule `safety-floor-never-simplified` depends on it | Restores a safety check the workflow claims to perform | Definition edit: declare it an output of `ponytail/apply-ladder` or of `review-over-engineering` | Low edit, correctness value |
| R10 | Wire or delete the two DEAD transitions out of `07-assumptions-review` | `needs_plan_revision` / `needs_further_discussion` have no producer | Restores the documented loop-back paths, or removes two edges that lie about the graph | Definition edit: add `setVariable` effects to the `assumption-interview` / `post-summary-review` checkpoint options, or delete the transitions | Low |
| R11 | New guard: **definition reachability**, modelled on `scripts/check-prism-lens-reachability.ts` | The precedent exists for prism's 60 lens resources and for nothing else. `check-all-refs.ts` resolves only the flat `techniques[]` list, not step-level `technique:` bindings; `validate-activities.ts` is pure schema shape | Prevents every R1–R3 class from recurring. Would have flagged all 34 DEAD technique files and 1 DEAD resource | `scripts/check-definition-reachability.ts` + a `scripts/guards.ts` registry entry | Medium — 88–151 LOC by the existing guard precedent. Needs the activity-group bare-op convention and the `Apply [x](./x.md)` edge kind, both of which this analysis implements |
| R12 | Extend `check-binding-fidelity` so declaration is not production | Its `read-resolution` check accepts "workflow var" as a producer, which is why 18 unproduced-but-consumed work-package variables pass silently | Catches R4, R9, R10 and the other 15 phantom variables as a class | `scripts/check-binding-fidelity.ts` — add a `no-writer` rule requiring every consumed declared variable to have a `setVariable`, a `set` target, or a corpus technique output of that name | Medium. Must whitelist externally seeded names (`user_request`, `push_remote`, `meta_session_index`, `stealth_mode`) — 4 exemptions, each with a stated reason, which is itself worth writing down |
| R13 | Retire the 16 write-only work-package variables (30 write sites) | No gate, interpolation or technique input reads any of them | 30 fewer `setVariable` effects, 16 fewer declarations from 140. Small payload, real comprehension gain | Definition edit | Low–medium. Some are deliberate audit breadcrumbs; `audit_confirmed` is not (all three options set it `true`), so triage individually |
| R14 | Delete the 3 work-package Zombie Override techniques and `readme-deprecated-notice.md` | Zero refs to `update-pr::push-commits` anywhere; the other two are pointer/tombstone files | **4 files, 3.3 KB corpus surface.** Removes two of the three competing `pushed_branch` implementations | Definition edit | Low |
| R15 | Delete the 5 uncalled `src/schema` façade functions | No caller in `src/`, `scripts/` or `tests/` | ~30 LOC of `src/schema/state.schema.ts` (226 LOC) and `activity.schema.ts` | Code edit | Low |
| R16 | Fold `mark-ready` (and consider `create-pr`) across the two trees | `github-cli-protocol/mark-ready.md` 560 B vs `update-pr/mark-ready.md` 556 B, both live | ~0.6 KB and one duplicated contract; the value is single-source, not bytes | Definition edit: point work-package's `update-pr` group at the meta op | Low. Do **not** fold `analyze` — the two are unrelated capabilities that merely share a basename |

### What this lens found that is *not* an opportunity

Stated explicitly, because the discipline the brief asked for cuts both ways:

- **The 24 `stealth_mode` gates are not dead.** They are constant-false in work-package and constant-true in `remediate-vuln`, which seeds the variable and borrows the activities. `check-stealth-isolation` depends on exactly that shape. Touching them breaks the security workflow.
- **The `re-` review steps in `10-post-impl-review` are not duplicates.** They are the body of `review-fix-cycle` and fire only when fixes were applied.
- **The 25 group `TECHNIQUE.md` files are not orphans.** The engine loads them as ancestors of every nested op. Only two carry no contract worth loading.
- **The three `*-method.md` artifacts are not dead.** They are unconsumed by the run and consumed by a human auditor — which is what an audit trail is.
- **The 26 guards are not redundant verification.** They run in 1.7 s at CI, are invoked by no target-tree step, and overlap nothing in `meta` or `work-package`. The brief's hypothesis of duplication does not survive measurement; the gap is the opposite — no guard covers definition reachability, and `verify-artifact-conforms` is bound once in work-package and zero times in meta.
- **`check-all-refs.ts` passing is not evidence of reachability.** It resolves the flat `techniques[]` lists only. Every one of the 34 DEAD technique files in this report resolves fine when named; nothing names them.

## Numbers summary

| Measure | meta | work-package |
|---|---|---|
| Technique files | 149 | 111 |
| Structurally reached by a step binding or workflow list | 41 | 90 |
| Reached only via a markdown `Apply` link or prose | 77 | 18 |
| **Provably unreachable (DEAD)** | **31 (20.8%)** | **3 (2.7%)** |
| Resources | 6 | 36 |
| **Unreachable resources** | 0 | 1 |
| Activities loaded into the graph | 5 | 15 |
| Activities on disk but unreachable | 5 (`patterns/`) | 0 |
| Steps (incl. nested) | 43 | 264 |
| Verification-shaped steps | 8 (19%) | 90 (34%) |
| Empty `actions: []` steps | 0 | 5 |
| Transition edges gated on an unproduced variable | 0 | 2 |
| Declared variables | 27 | 140 |
| Consumed with no producer | 3 (all externally seeded) | **18 (12.9%)** |
| Written, never read | 2 | **16, over 30 write sites** |
| Neither written nor read | 0 (2 are name-match reads) | **9** |
| Gates that can never flip | 2 | 1 |
| `binding-fidelity` dead-output findings, all triaged harmless | 33 | 1 |

Total DEAD definition surface across both trees: **34 technique files + 1 resource + 5 pattern activities + 5 pattern-only ops = 45 files, 44.4 KB, ~6,000 tokens of corpus surface** — none of it run payload, all of it maintenance load. The run-payload savings live in R5, R6, R7 and above all R8, whose one activity is ~8% of the measured `get_activity` total for a walk that, on a non-Rust project, cannot use it.
