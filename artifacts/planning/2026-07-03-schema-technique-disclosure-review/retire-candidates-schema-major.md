# Retire-Candidate Register — Next Schema Major (B12)

Date: 2026-07-07. Backlog item B12 of epic #166 (batched with B6). This register **flags** constructs for removal at the next workflow-schema major version; nothing is removed now, and no compatibility change ships with this document. Evidence: [field-ledger.md](field-ledger.md) (server-consumer trace), [corpus-consumption-audit.md](corpus-consumption-audit.md) §§2–3 (usage counts across all 14 workflows), [technique-structural-census.md](technique-structural-census.md) §5 (composition usage).

Selection criteria: a construct earns a place here when it is (a) INERT server-side (no code path reads it), and/or (b) unused or constant-valued corpus-wide, and/or (c) actively misleading (its name implies engine behavior that does not exist — the misread risks B6 now documents).

## Register

| # | Candidate | Server behavior today | Corpus usage | Disposition at next major | Migration |
|---|---|---|---|---|---|
| R1 | `workflow.author` | INERT — no read anywhere in src | present in headers, semantically idle | **Remove.** Authorship belongs to git history | Delete field; loader ignores unknown → no content change needed before the major |
| R2 | `activity.triggers[]` + `passContext` | INERT — `dispatch_child` takes an explicit `workflow_id` and creates the child with an empty variable bag; no context is ever passed. Name actively misleading | 3 trigger instances total | **Remove both.** Cross-workflow dispatch is already expressed by `dispatch_child` + prose/technique guidance | Move the 3 declarations' intent into the owning activities' bound techniques (or a rule); delete the construct |
| R3 | `activity.decisions[]` | ADVISORY — branch conditions stringified for warn-only matching, never evaluated; routing duplicated by `transitions[]` | 7 instances across 5 workflows | **Remove.** Fold each decision's branches into conditioned `transitions[]` entries, which the same warn-only machinery already covers | Mechanical: each `branch.condition`/`transitionTo` pair becomes a transition; `isDefault` branch becomes the default transition |
| R4 | Action verbs `emit`, `message` | INERT — no interpreter for any action verb | `emit`: 0 uses; `message`: tiny count (3 workflows) | **Remove the two verbs** from the `action` enum | Replace the few `message` uses with technique-protocol prose |
| R5 | `effect.skipActivities` | Semi-INERT — written to `skippedActivities`, which nothing ever reads | 0 uses | **Remove** from the checkpoint-option effect object (and drop the dead `skippedActivities` write path) | None — unused |
| R6 | `loop.breakCondition` | INERT — "evaluated each iteration" by nobody | 0 uses (22 loops declare `maxIterations`, 0 declare `breakCondition`) | **Remove.** A loop's exit is its `loopType` condition; early exit is agent judgment | None — unused |
| R7 | Condition operators `>=`, `<=` | Schema-legal; the runtime evaluator is agent-side anyway | 0 uses | **Remove from the operator enum.** `>`/`<` (1 workflow each) stay for now | None — unused |
| R8 | `step.required` | INERT — never checked; worker hint only | only ever `false`, 2 workflows | **Remove.** Step optionality is already expressed by `when`/`condition` gates; manifest validation treats gated steps as omit-legal | Convert the few `required: false` steps to explicit gates or drop the marker |
| R9 | `transition.isDefault` / `decisionBranch.isDefault` | ENFORCED only as tie-breaker input to warn-only matching | always `true` where present (0 `false`) | **Remove; infer default.** The last unconditioned transition of an activity is its default | Loader infers; authored `isDefault` deleted mechanically |
| R10 | `checkpoint.blocking` | INERT — the auto-advance gate checks only `defaultOption` + `autoAdvanceMs` (B6 documents this) | `blocking: true` written explicitly 45× (it is already the default) | **Decide: enforce or remove.** Either the server rejects `auto_advance` when `blocking: true` (making the field ENFORCED), or the field goes and "blocking" is simply the absence of `defaultOption`/`autoAdvanceMs`. Removal is the leaner ontology; enforcement preserves an explicit authoring signal | If removed: delete the 45 redundant `blocking: true` and any `blocking: false` becomes implied by the auto-advance pair |
| R11 | `Initial`/`Final` protocol wrapping | ENFORCED composition feature — load-bearing title matching in the technique loader (`wrapProtocolWithAncestors`), typo silently demotes the block | **0 uses corpus-wide** — no `TECHNIQUE.md` has `### Initial`/`### Final` (census §5); contract inheritance (inputs/outputs/rules merge) is the composition feature actually used | **Remove the wrapping feature** (loader code + schema/doc surface). Contract inheritance stays untouched | None — unused; delete loader path and its spec text |
| R12 | `outputs[].artifact.action` | INERT — enum unreachable: the markdown loader emits `{name}` only, so no authored content can populate it | 0 (unreachable) | **Remove** from technique schema | None — unreachable |

## Provisional entries — resolved by B7 (2026-07-07)

| # | Candidate | Resolution |
|---|---|---|
| P1 | `step.actions[].set` (and with R4, possibly the whole `actions[]` construct) | **B7 decided: retire.** No server-side step-execution moment exists to hook, and 35/67 corpus uses are valueless prose/`message:` encodings that aren't machine-executable. `set` stays schema-legal and documented-inert until the B12 major sweep removes it from the `action` enum; at B12, evaluate the residual `actions[]` construct (`log`/`validate` plus R4's `emit`/`message`) for full retirement |
| P2 | `variables[].type` / `defaultValue` / `required` | **Resolved by B7 (shipped): not retire candidates.** `defaultValue` is seeded into the session bag at session creation (`start_session` + `dispatch_child`, `variables_seeded` history event) and `type` is warn-only validated on checkpoint `setVariable` — both are now engine-read and leave this register. `required` remains unchecked authoring metadata, documented as agent-honored; kept (not retired) as part of the declaration contract. Corpus coherence is enforced by `check:variable-model` (no exists/notExists gates on defaulted variables, default/setVariable literals match declared types, setVariable targets declared) |

## Non-candidates considered and kept

- `>`/`<`, `exists`, `notExists`, `type: not`, `type: or` — single-workflow or tiny counts, but each carries live semantics with no substitute; removal saves nothing but expressiveness.
- `when` string form (17 uses) vs structured `condition` (233 uses) — a real duality (F5/e), but consolidation is a design decision about the condition dialect, not a dead-weight removal; out of B12's scope.
- `activitiesDir` explicit form — 0 explicit uses, but it is the documented server convention for the universal external-activities layout; the convention is load-bearing even where the field is implied.

## Disposition path

Retirement ships as one batch behind a workflow-schema **major** version bump, sequenced after B7 (P1/P2 resolution) so the corpus migrates once. Until then, B6's documentation pass is the mitigation: every candidate above is now documented as agent-interpreted/inert on the schema/API surface, so authors and agents stop inferring engine behavior from these fields.
