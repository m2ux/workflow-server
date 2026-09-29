# Canon slice P — design principles and convention conformance, PR #991 (engine #978 as consumer)

Corpus worktree `/home/mike1/projects/dev/workflow-server/.worktrees/meta-walk-protocol` (base `03dfd4e2`, head `f093a318`). Engine consumer: `/home/mike1/projects/dev/workflow-server/.worktrees/fan-barrier-destination` (`src/tools/workflow-tools.ts`, `src/loaders/routine-resolver.ts`, `src/utils/validation.ts`). Paths in the table are relative to `corpus/` unless they name `walks/` or the engine.

## Units

Design principles (`canon/resources/design-principles.md`):

- Overview — walked. What it says to take: each heading is one invariant. A principle is broader than any one defect.
- 1. Workflows Ossify Patterns — walked
- 2. Internalize Before Producing — not-applicable — "Read the construct model … before writing content". This governs the authoring act, not a definition construct.
- 3. Define Complete Scope Before Execution — walked. The corpus was swept for surviving old-termination prose ("routes to none", "null if the activity declares no exit", "until none follows", "read `_meta.fan` as"). None remains.
- 4. Clarify Before Assuming — not-applicable — "When the request admits materially different interpretations, ask one question before acting". This is session conduct.
- 5. Maximize Schema Expressiveness — walked
- 6. One Authoritative Home — walked. Its sites are recorded under 34, the more specific entry.
- 7. Convention Over Invention — walked
- 8. Confirm Before Irreversible Changes — walked. No irreversible change is added, and 04's closure gate is unchanged.
- 9. Encode Constraints as Structure — walked
- 10. Non-Destructive Updates — walked
- 11. Complete Documentation Structure — walked
- 12. Output Economy — walked
- 13. Separate Contract from Procedure — walked
- 14. Single Source of Truth — walked
- 15. Phase by Sequenced Outcome — walked
- 16. Distinguish Designators from Parameters — walked
- 17. Document in Positive Present — walked
- 18. Prefer Shared Capability — walked
- 19. Name Symbols Affirmatively — walked
- 20. Keep Orchestration in Structure — walked
- 21. Match the Harness Surface — walked
- 22. Modular Over Inline — walked
- 23. Close the Loop — not-applicable — "When implementation is in scope, a recommendation is followed by the action". This is session conduct.
- 24. Keep Session Interaction in Activities — walked
- 25. Bind Sibling Techniques as Steps — walked
- 26. A Technique Is a Reading — walked
- 27. State Contract Contribution — walked
- 28. Creation Guide for Generated Documents — walked
- 29. Cite Resource Policy; Do Not Restate It — walked
- 30. Resources Stay Abstract — walked
- 31. Isolate Conditional Branches as Notes — walked
- 32. Cite Resources at Section Grain — walked
- 33. Pre-Session Prose Stands Alone — not-applicable — "Prose delivered before references can be resolved". No surface file is pre-session prose.
- 34. Edit the Owner — walked
- 35. Prefer Removing the Thing That Needs a Prohibition — walked
- 36. A Technique Names Only What Its Reader Holds — walked
- 37. An I/O Contract Names the Value — walked
- 38. A Relocation Records the Outcome It Keeps — walked
- 39. A Phase Heading Names the Outcome — walked
- 40. Fan-Out Lives at the Layer That Runs the Work — walked
- 41. A Phase States Answers the Tool Has Returned — walked
- 42. A Routine Holds the Codified Path — walked
- 43. A Workflow Borrows Activities — walked
- 44. A Resource Splits for Section Delivery — walked
- 45. A Rule States One Invariant — walked
- 46. A Consumer Binds the Contract — walked. `dispatch-activity` and `take-activity` both declare `activity_entered` and inherit `exit_id`, `step_manifest` and `variables_changed`. They therefore meet every binding `activity-loop` makes to `enter_activity`.
- 47. A Calibrated Surface Extends by Wrapping — walked. The `walks/` snapshot is re-baselined as a baseline, and gains no consumer need.

Convention conformance (`canon/resources/convention-conformance.md`, `## Reference Conventions`):

- File naming — walked
- Field ordering — walked
- Version format — walked. A graph-edge addition carries no workflow bump, as precedent `eca54b7f` shows.
- Routing patterns — walked
- Checkpoint structure — walked
- Technique structure — walked
- Routine structure — walked
- Divergence disposition ("decide whether it is justified (document why)") — walked
- Specimen layout (`docs/README.md` "Adding a workflow" and "Discovery"), applied to `specimens/exitless-end` against the sibling specimens — walked

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|---|---|---|---|---|---|---|---|
| P1 | Live | High | 38. A Relocation Records the Outcome It Keeps | `meta/activities/04-end-workflow.yaml:46-52` (option `return`), with `meta/workflow.yaml:29` and `meta/activities/03-dispatch-client-workflow.yaml:42-43` | `return` is "Some outcomes are unmet — re-dispatch the orchestrator to address them", `exit: return`, and it goes back to 03. 03's `"null"` exit now fires only after `end-walk`, when the advance onto `__terminal__` has completed the client session (`activity-loop.yaml:102-109`, 03:15/19). A `return` re-runs the loop from `client_initial_activity` (`activity-loop.yaml:50-55`). The first advance names `from_activity`, which still holds the client's last activity. The engine then refuses: "Cannot exit '…': the session is not on it. In flight: (nothing)." (`workflow-tools.ts:1020`). Omitting `from_activity` instead re-walks a session whose status is `completed`. At base, an exitless client graph left its last activity in flight, so the re-run retired it and re-entered. No file names what `return` keeps. | diff | State what `return` does to a completed client session. Either open a fresh client session before 03 re-runs, or retire the option. Record the check, for example a `return` walk on `mvw` and `exitless-end`. |
| P2 | Live | High | 9. Encode Constraints as Structure | `meta/routines/activity-loop.yaml:50-55` (`prime-initial-activity`), against `meta/techniques/workflow-engine/take-activity.md:35` and `dispatch-activity.md:73` | The constraint is stated as text only: "A first entry has no prior activity to retire, so `{from_activity}`, `{exit_id}`, `{step_manifest}` and `{variables_changed}` are all unset together". The prime step sets only `current_activity`. `from_activity` resolves by name to the host's variable: routine outputs map to the host name (`routine-resolver.ts:657-664`), and the loop's `:232-237` comment confirms it. The variable therefore persists between walks on one bag. `prism-audit/02:70-97` and `prism-evaluate/02:193-220` open a new child session on each `forEach` iteration. So does `work-package/10:204-215` on re-entry through `has-blocker`, and `remediate-vuln` borrows that activity. Each second walk's first `take-activity` names the previous child's last activity on a new session whose frontier is empty, and the engine refuses it (`workflow-tools.ts:1020`). | pre-existing (the base prime step is identical; the diff re-ships the unbacked claim at `take-activity.md:35`) | In `prime-initial-activity`, also set `from_activity` and `worker_result` to null, so that a walk's first entry carries nothing to retire by structure. |
| P3 | Contract | Medium | 38. A Relocation Records the Outcome It Keeps | `meta/techniques/workflow-engine/evaluate-transition.md:58` (phase 5) and `:28` (Output `next_activity_id`) | The phase reads "Where no exit was taken — the activity declares none — set `{next_activity_id}` to `__terminal__`". The diff re-routes this path from null to `__terminal__`, but it also catches an activity that declares exits and takes none. In the corpus that is meta 03 only: `"null"` gated `current_activity == null`, with no default (03:42-43). At the 200-iteration bound no exit holds, and the path now completes the meta session: the engine accepts `__terminal__` from any activity (`validation.ts:48`). 04 is skipped, against 03's own outcome "close-out can tell a completed run from one that stopped at the iteration bound" (03:49). This holds wherever meta's own walk resolves its exits through this technique. | diff (the conflation itself is pre-existing) | Scope phase 5 to an activity that declares no exits. Name what an activity whose exits all fail does. For example, give 03 a default exit bound to `end-workflow`. |
| P4 | Contract | Medium | 34. Edit the Owner | `meta/activities/03-dispatch-client-workflow.yaml:15,19`; `04-end-workflow.yaml:14-16`; `prism-audit/activities/02-execute-analysis.yaml:17`; `prism-evaluate/activities/02-execute-analysis.yaml:21`; `work-package/activities/10-post-impl-review.yaml:49` | Each host variable restates the routine output "null once the advance onto `__terminal__` has completed the session" (`activity-loop.yaml:32`). `client_workflow_completed` is described identically in 03 and 04. The PR edited all six copies only to keep them agreeing with the routine. | pre-existing (the same copies existed at base as "routes to none") | Each host description states only what the value holds ("The client activity the walk holds"). The walk-end semantics stay on the routine output. |
| P5 | Contract | Low | 34. Edit the Owner | `meta/techniques/workflow-engine/continue-batch.md:64` (rule `one-advance-per-activity`, second paragraph) | The rule enumerates "the paths that reach `dispatch-activity`". The diff appends "and the activity a fan's last branch retirement entered, which that dispatch carries without a second advance" to keep the list agreeing with `activity-loop`'s gates. That is the fourth statement of the `activity_entered` fact, after the routine internal and the input and note on each of `dispatch-activity` and `take-activity`. | diff | Keep the invariant: a continuation never hands its advanced activity back to `dispatch-activity`. Drop the path enumeration, which the loop's `when` gates own. |
| P6 | Hygiene | Low | 13. Separate Contract from Procedure | `meta/techniques/fan/enter-fan.md:44` (Output `branch_activities`), against `:59` (Protocol phase 2) | The Output says "the `branches` of every `_meta.fan` entry, concatenated in the order the server gave the entries". The Protocol only says "read `{branch_activities}` from `_meta.fan`". The derivation and its order, which are the #973 fix, live on the Output. The step still reads the report list. | diff | The Protocol step names the concatenation of every entry's `branches`, in order. The Output states the value: every branch id the destination opened, in server order. |
| P7 | Hygiene | Low | 13. Separate Contract from Procedure | `meta/techniques/workflow-engine/TECHNIQUE.md:18` (Input `activity_id`) | The input reads "The activity the operation acts on: the one it enters, carries or continues…". `dispatch-activity` and `take-activity` now admit `__terminal__` there (`dispatch-activity.md:55`, `take-activity.md:36`). That value is not an activity, and it completes the session. The allowed value is stated only in Capability and Protocol notes. | diff | Name `__terminal__` among the admitted values of the input the enter operations read, as the value that completes the session. |
| P8 | Hygiene | Low | 34. Edit the Owner | `specimens/README.md:5` | A grouping README that "names nothing of its own … open the directory for what it currently holds" now adds "`exitless-end` is the smallest graph that ends on an activity declaring no exits". That line restates the child README, and must change with it. | diff (the `mvw` sentence is pre-existing) | Drop the per-specimen sentence. Discovery and the child README carry it. |

Both Highs were re-derived from the cited file and entry alone:

- **P1** reproduces. 04:46-52 routes back to 03, and 03 exits only after the terminal advance. The first dispatch of the re-run binds `from_activity` by name. `resolveRetiringActivity` refuses a named activity absent from an empty frontier.
- **P2** reproduces. The prime step sets one target, and `routine-resolver.ts` maps the output `from_activity` onto the host's name. Two hosts iterate the routine inside a `forEach` loop.
- Neither High was withdrawn.

Considered and not recorded:

- **Settled decisions:**
  - 01's `retarget` self-loop diverges from its twin `workflow-authoring/01`, which ends the run through `review-scope-declined: __terminal__`. The decision is settled.
  - Whether a re-run intake yields a corrected target set belongs to #974.
- **Convention the siblings carry:**
  - `exitless-end` has no `-conformance` suffix and no `conformance` tag. `mvw` and `contract-composition` carry the same form.
  - It has no `techniques.activity: variable-binding` block. It has no steps, and its README says so.
  - `activity_entered` is declared per technique, as the sibling `from_activity` form is.
  - Option text narrating its route (01 `wrong-review-target`) matches 04 `return` and 06 `redraft`.

Outside the surface, relevant to P1: `meta/techniques/workflow-engine/workflow-orchestrator.md:27` resumes from `in_flight`, or else from `initialActivity`, and reads no status. Every walk now ends `completed` with `in_flight: []`, so resuming a completed session re-walks it from the start.

## Files

Touched by #991:

- `meta/README.md` — read
- `meta/activities/03-dispatch-client-workflow.yaml` — read
- `meta/activities/04-end-workflow.yaml` — read
- `meta/activities/README.md` — read
- `meta/routines/activity-loop.yaml` — read
- `meta/techniques/fan/enter-fan.md` — read
- `meta/techniques/fan/retire-branch.md` — read
- `meta/techniques/fan/spawn-branches.md` — read
- `meta/techniques/workflow-engine/TECHNIQUE.md` — read
- `meta/techniques/workflow-engine/continue-batch.md` — read
- `meta/techniques/workflow-engine/dispatch-activity.md` — read
- `meta/techniques/workflow-engine/evaluate-transition.md` — read
- `meta/techniques/workflow-engine/take-activity.md` — read
- `prism-audit/activities/02-execute-analysis.yaml` — read
- `prism-evaluate/activities/02-execute-analysis.yaml` — read
- `specimens/README.md` — read
- `specimens/exitless-end/README.md` — read
- `specimens/exitless-end/activities/01-open.yaml` — read
- `specimens/exitless-end/activities/02-close.yaml` — read
- `specimens/exitless-end/workflow.yaml` — read
- `work-package/activities/10-post-impl-review.yaml` — read
- `workflow-design/activities/01-intake-and-context.yaml` — read
- `workflow-design/activities/06-scope-and-draft.yaml` — read in the checkpoint, attestation and exit spans the diff touches, lines 120-175 and 420-500. The rest is unchanged drafting steps.
- `workflow-design/activities/README.md` — read
- `workflow-design/workflow.yaml` — read
- `walks/roster.json` — read
- `walks/snapshot.test.ts.snap` — read in the diff hunks and their gate-list and step-count sections only. It is a generated test baseline of 3945 lines, to which no principle applies.

Closure:

- `canon/resources/anti-patterns.md` — read
- `canon/resources/schema-construct-inventory.md` — read
- `meta/techniques/workflow-engine/finalize-activity.md` — read
- `meta/techniques/workflow-engine/resume-from-checkpoint.md` — read
- `meta/techniques/workflow-engine/revise-session-metrics.md` — read
- `meta/techniques/workflow-engine/yield-checkpoint.md` — read
- `meta/workflow.yaml` — read
- `midnight-system-review/workflow.yaml` — read
- `plain-language/workflow.yaml` — read
- `ponytail/workflow.yaml` — read
- `prism-evaluate/activities/README.md` — read
- `prism-evaluate/workflow.yaml` — read
- `prism-update/workflow.yaml` — read
- `remediate-vuln/workflow.yaml` — read
- `requirements-refinement/workflow.yaml` — read
- `specimens/contract-composition/workflow.yaml` — read
- `specimens/fan-conformance/README.md` — read
- `specimens/fan-conformance/workflow.yaml` — read
- `specimens/git-pin-conformance/workflow.yaml` — read
- `specimens/github-library-conformance/workflow.yaml` — read
- `specimens/gitnexus-api-change-gate-conformance/workflow.yaml` — read
- `specimens/gitnexus-api-surface-review-conformance/workflow.yaml` — read
- `specimens/gitnexus-area-comprehension-conformance/workflow.yaml` — read
- `specimens/gitnexus-change-risk-assessment-conformance/workflow.yaml` — read
- `specimens/gitnexus-diff-coverage-map-conformance/workflow.yaml` — read
- `specimens/gitnexus-diff-taint-pass-conformance/workflow.yaml` — read
- `specimens/gitnexus-doc-heading-lookup-conformance/workflow.yaml` — read
- `specimens/gitnexus-doc-reference-surface-conformance/workflow.yaml` — read
- `specimens/gitnexus-graph-for-tree-conformance/workflow.yaml` — read
- `specimens/gitnexus-group-concept-search-conformance/workflow.yaml` — read
- `specimens/gitnexus-group-refresh-conformance/workflow.yaml` — read
- `specimens/gitnexus-guarded-rename-conformance/workflow.yaml` — read
- `specimens/gitnexus-index-refresh-conformance/workflow.yaml` — read
- `specimens/gitnexus-layer-conformance/workflow.yaml` — read
- `specimens/gitnexus-narrow-to-changed-conformance/workflow.yaml` — read
- `specimens/gitnexus-orphan-scan-conformance/workflow.yaml` — read
- `specimens/gitnexus-package-diagram-source-conformance/workflow.yaml` — read
- `specimens/gitnexus-pre-edit-impact-gate-conformance/workflow.yaml` — read
- `specimens/gitnexus-public-api-enum-conformance/workflow.yaml` — read
- `specimens/gitnexus-radius-conformance/workflow.yaml` — read
- `specimens/gitnexus-restructure-surface-conformance/workflow.yaml` — read
- `specimens/gitnexus-scope-discipline-check-conformance/workflow.yaml` — read
- `specimens/gitnexus-sequence-diagram-source-conformance/workflow.yaml` — read
- `specimens/gitnexus-symptom-trace-conformance/workflow.yaml` — read
- `specimens/gitnexus-tool-surface-conformance/workflow.yaml` — read
- `specimens/mvw/workflow.yaml` — read
- `specimens/namespace-conformance/workflow.yaml` — read
- `specimens/readme-links-conformance/workflow.yaml` — read
- `specimens/routine-conformance/workflow.yaml` — read
- `substrate-node-security-audit/workflow.yaml` — read
- `work-package/resources/workflow-retrospective.md` — read
- `work-package/workflow.yaml` — read
- `workflow-authoring/activities/01-intake-and-context.yaml` — read
- `workflow-authoring/techniques/impact-analysis.md` — read
- `workflow-authoring/workflow.yaml` — read
- `workflow-design/resources/format-conventions.md` — read
- `workflow-design/techniques/impact-analysis.md` — read
