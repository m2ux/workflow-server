# Walk 4, slice B: design principles 25–47, the overview, and convention conformance

Worktree `.worktrees/canon-audit-residuals`, base `bcf31337`, commits `83d6f046`, `0e764ad3`, `c1ae16f8`. Canon homes read on this worktree. Engine claims settled in `.worktrees/schema-description-hygiene` (`src/tools/workflow-tools.ts`, `src/loaders/schema-loader.ts`, `src/resources/schema-resources.ts`, `schemas/routine.schema.json`). Out-of-scope items (#973) were not recorded: the loop's termination, `enter-fan` reading `_meta.fan`, dispatch/enter-fan passing `variables_changed` and `step_manifest`, and the two workflow-design options with no exit.

## Units

- Overview (design-principles.md): walked. Each heading is one invariant, and a citation of a heading cites that invariant. Specific instances belong to the anti-pattern catalog. Taken as the reading rule; no finding.
- 25. Bind Sibling Techniques as Steps: walked. The round moved every persist phase out of the converted techniques and onto a bound save step. The remaining inline Applies are the meta workflow-engine convention. No finding.
- 26. A Technique Is a Reading: walked. present-checkpoint-to-user phase 1 now keeps only the call and what phases 2 and 5 read (walk3 B9 fixed). No converted technique shrank to a bare call. No finding.
- 27. State Contract Contribution: walked. The container's Capability ("sessions, activities, agents, Progress, and checkpoints") covers the hoisted `exit_id` and `step_manifest`. No bag variable of either name exists, so the same-name inheritance that sank `checkpoint_reply` has nothing to bind. No finding.
- 28. Creation Guide for Generated Documents: walked (B3).
- 29. Cite Resource Policy; Do Not Restate It: walked (B12).
- 30. Resources Stay Abstract: walked. impact-analysis `**Removals inventoried:**` and draft-attestation `**Closing attestation:**` now name roles (walk3 B14 fixed). No finding.
- 31. Isolate Conditional Branches as Notes: walked. The new conditional bullets (impact-analysis:51, context-loading:66/:70, intake-classification:85) use the workflow-design sibling form "When X, do Y", so they count as convention. Not recorded.
- 32. Cite Resources at Section Grain: walked (B11). reconcile-design-assumptions:39 dropped the anchored AP link that sat beside a bare citation of the same file, which conforms.
- 33. Pre-Session Prose Stands Alone: not-applicable. The unit covers "Prose delivered before references can be resolved", and no surface file is delivered before a session.
- 34. Edit the Owner: walked (B4, B5). walk3 B6 (`exit_id`/`step_manifest` hoisted) and B15 (the three stale README lines) are fixed. The three `checkpoint_reply` declarations fall under AP-55's carve-out: an input shared by three techniques whose common ancestor declares none of them. Hoisting it would bring the defect back.
- 35. Prefer Removing the Thing That Needs a Prohibition: walked. The round added no prohibition. It removed "Skip writing this artifact in review mode" and the context-loading skip bullets in favour of gates. No finding.
- 36. A Technique Names Only What Its Reader Holds: walked (B9). The workflow-design container no longer links verify-artifact-conforms.
- 37. An I/O Contract Names the Value: walked (B13, B14). walk3 B10 is fixed on every cited line.
- 38. A Relocation Records the Outcome It Keeps: walked (B1, B2). The other relocations keep their outcome and check:
  - `binding-carries-only-deviations` moved into phases 2 and 4 and into both twins' yaml-authoring.
  - `side-effect-detection` moved into workflow-authoring impact-analysis phase 2.
  - The finalize-on-`ends_activity` duty moved into activity-worker phase 5.
  - substrate's dispatch statement moved to its activities README:5.
  - walk3 B3 is fixed by `refresh-enforcement-findings`.
- 39. A Phase Heading Names the Outcome: walked (B15).
- 40. Fan-Out Lives at the Layer That Runs the Work: walked (B10, B17).
- 41. A Phase States Answers the Tool Has Returned: walked. Checked at the handler:
  - resume_checkpoint: "still active" refusal, `exit`, `ends_activity`.
  - yield_checkpoint replay: `resolved_option`, `effect`, `exit`.
  - respond_checkpoint reply fields.
  - `when: checkpoint_reply`: the routine schema's `whenExpression` states that "A bare IDENT holds when its value is truthy".
  The context-loading schema list also fires here; it is recorded once as B5. No other finding.
- 42. A Routine Holds the Codified Path: walked. `clear-checkpoint-reply` is ordinary routine mechanics, and its placement holds on every path:
  - `resume-yielded-worker` returns `checkpoint_pending`: the next pass's `respond` re-sets the reply before `resume` binds it.
  - It returns `activity_complete`: `continue-batch` no longer declares the reply.
  - Neither: no dispatch technique declares it.
  No finding.
- 43. A Workflow Borrows Activities: walked. No borrowing construct changed. No finding.
- 44. A Resource Splits for Section Delivery: walked. No surface resource is a multi-part per-category resource. No finding.
- 45. A Rule States One Invariant: walked. The three yaml-authoring rules now in both twins each state one invariant, and `a-foreign-technique-is-qualified`'s standalone-meta sentence is a carve-out naming what it excepts. The re-homed `content-preservation` is one invariant. No finding.
- 46. A Consumer Binds the Contract: walked. Every save step now binds a produced id: `format_conventions`, `applicable_constructs`, `design_specification`, `drafting_plan`, `file_review_note`, `reviewed_blocks`, `scope_manifest_report` and `verified_findings` (walk3 B1/B2 fixed). Every gate-linked path is bound through `written_artifact`. Every `scope_manifest` reader in both twins reads it as the file list it now is. `resume-yielded-worker` binds `checkpoint_reply` to resume-worker, which declares it. `continue-batched-worker` binds `exit_id`/`step_manifest` through the container. No finding.
- 47. A Calibrated Surface Extends by Wrapping: walked. No schema or measured surface changed. No finding.
- Convention Conformance (convention-conformance.md), one unit: walked against the sibling activities and techniques and the workflow-design/workflow-authoring twins (B6, B7, B8, B16).

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| B1 | Live | Medium | 38. A Relocation Records the Outcome It Keeps | workflow-design/activities/06-scope-and-draft.yaml:210-213 `revise-file-approach` | The step re-applies assemble-file-approach when `file_approach_disposition == 'revise'`. 0e764ad3 removed that technique's "2. Persist Drafting Plan", so this re-application now writes nothing. The only save step, `persist-drafting-plan` (:177-186), runs before the gate. The revised `{drafting_plan}` lands in the bag, and drafting-plan.md keeps the approach the reader rejected. At bcf31337 the technique persisted itself on every application, this one included. | diff | Add a write-artifact step after `revise-file-approach`, gated `file_approach_disposition == 'revise'`, binding `written_artifact: drafting_plan_path` |
| B2 | Live | Medium | 38. A Relocation Records the Outcome It Keeps | workflow-design/techniques/persist-design-specification.md:38-40, "2. Mirror Decisions To README" | "Mirror key decisions into the planning README Design Decisions section as links to this artifact". The removed phase persisted the file and captured `{specification_path}` before this phase ran. The save step `persist-design-specification-artifact` (03:117-126) now runs after the technique, and write-artifact mints the file's `NN-` prefix on first creation (write-artifact.md phase 2). On a first run, the README links a file that does not exist yet, under a name the technique cannot know. | diff | Bind the README mirror as its own step after the save step, reading `{specification_path}`, or pass `{specification_path}` to the phase |
| B3 | Contract | Medium | 28. Creation Guide for Generated Documents ("The persisting technique cites that template") | workflow-design/techniques/verify-high-findings.md:12-22, Output `verified_findings` (`#### artifact` `verified-findings.md`) | The removed phase 4 ("Persist `{verified_findings}` following the [Findings Satellite Guide](…#template)") was the file's only citation of its guide. The file now cites findings-satellite nowhere. 08:270-278 and :141-148 still save the output as the satellite file (guide map: resources/README.md:56). Every other technique 0e764ad3 converted cites its Template on the Output or the assemble bullet. | diff | Shape `{verified_findings}` at `[Template](../resources/findings-satellite.md#template)` on the Output |
| B4 | Contract | Medium | 34. Edit the Owner | meta/techniques/workflow-engine/finalize-activity.md:62-72 (`#### next_activity_id`, `next_activity_fans`, `activity_exit`) against evaluate-transition.md:26-36 | The same three fields and their value vocabulary are declared in both files. `activity_exit` is word for word the same. 83d6f046 rewrote finalize:64 only to agree ("the destination values finalize-activity gives are the ones evaluate-transition reads"), and the two still word the fan case differently: "the fan destination" against "a list of members, one activity together with the collection it runs over". | diff | Describe each envelope field as the evaluate-transition output phase 2 folds in, and keep the value vocabulary on evaluate-transition alone |
| B5 | Contract | Medium | 34. Edit the Owner (a restated list); also fires 41 | workflow-design/techniques/context-loading.md:46 | "Load all five JSON schema definitions from `workflow-server://schemas` (workflow, activity, technique, condition, state)". c1ae16f8 made the inventory (:15) say the URI serves workflow, activity, technique and condition. The handler serves workflow, activity, condition, technique and session-file (schema-loader.ts:16). No state schema exists. The round edited phases 6-7 of this file and left the line. | known — not fixed (walk3 B7) | Cite the inventory's schema list, or the URI, without enumerating it |
| B6 | Contract | Medium | Convention Conformance (a save step writes the content its technique outputs) | workflow-design/activities/08-quality-review.yaml:113-134 `persist-principle-findings`, `persist-anti-pattern-findings`, against audit-principles.md:40-42 and audit-anti-patterns.md:86-88 | Each technique still persists its own file and outputs `*_path`, and a save step then writes the same content again. The commit subject says every workflow-design report is written through its save step. It converted verify-high-findings but not these two. | known — not fixed (walk3 B8) | Drop each technique's persist phase and `*_path` output, and keep the save step |
| B7 | Live | Medium | Convention Conformance (same pattern) | workflow-design/activities/11-retrospective.yaml:22-45; create-completion-doc.md:45-47; conduct-retrospective.md:36 | The steps run in this order:<br>1. create-completion-doc records the summary itself (artifact `COMPLETE.md`).<br>2. `persist-completion-doc` writes it again, to `completion.md`.<br>3. conduct-retrospective writes its section "into the close-out document (update in place)".<br>4. `persist-retrospective` writes `retrospective_document`, which is the section alone, to `completion.md`.<br>write-artifact updates an existing instance in place (phase 2), so step 4 overwrites the completion summary with the retrospective section. | pre-existing | Give both techniques content outputs with no persist phase, and save one close-out file once, with the retrospective as its section |
| B8 | Hygiene | Low | Convention Conformance (twin), and yaml-authoring `a-step-binds-only-its-deviations`, now carried by workflow-design itself | workflow-design 01:135, :189, :198; 03:124; 06:133, :184, :230, :319; 08:328 (new `refresh-enforcement-findings`); plus the earlier sites | Every workflow-design write step binds `target_dir: planning_folder_path`, which is write-artifact's declared `#### default`. The workflow-authoring twin omits it. 0e764ad3 added the rule to workflow-design's yaml-authoring and a new step carrying the binding. | known — not fixed (walk3 B21); 08:328 diff | Drop the default-valued binding |
| B9 | Hygiene | Low | 36. A Technique Names Only What Its Reader Holds | meta/techniques/workflow-engine/activity-worker.md:81 (`final-message-is-an-envelope`); finalize-activity.md:95 (`no-readme-persist-on-worker`) | Two worker-served rules name `dispatch-activity.reject-partial-worker-result` and link sync-progress-status. The worker bundle carries neither. 83d6f046 edited both files. | known — not fixed (walk3 B12) | State the fact and drop the names |
| B10 | Hygiene | Low | 40. Fan-Out Lives at the Layer That Runs the Work | substrate-node-security-audit/README.md:11, :19, :81, :127 | "Primary Audit — Concurrent dispatch of all specialized agent groups"; "The primary audit dispatches all specialized agent groups concurrently". 03-primary-audit.yaml:4 gathers "the agent branches the graph opened", and the graph fans from reconnaissance. c1ae16f8 replaced the one sentence that placed the fan at reconnaissance (old :220) with a pointer, so the root README now places it only at primary audit. | known — not fixed (walk3 B18) | Place the fan at reconnaissance's graph destination, or point these lines at activities/README.md:5 |
| B11 | Hygiene | Low | 32. Cite Resources at Section Grain ("Where the set is most of the body, cite the resource once") | workflow-authoring/techniques/workflow-definition/yaml-authoring.md:48 | One bullet cites all five level sections of schema-construct-inventory by anchor. | known — not fixed (walk3 B17) | Cite the inventory once |
| B12 | Hygiene | Low | 29. Cite Resource Policy ("link text is the section title") | review-draft-yaml.md:24, intake-classification.md:85 (both rewritten this round); scope-definition.md:63, :67; review-draft-yaml.md:38; assemble-file-approach.md:32, :46; review-drafted-file.md:24, :42; intake-classification.md:50 | Each links `…#template` under `[Draft Attestation Guide]`, `[Structural Inventory Guide]`, `[scope-manifest]`, `[Drafting Plan Guide]` or `[File Review Note Guide]`. The round converted the neighbouring lines to `[Template]`: scope-definition:32/:71, audit-rule-enforcement:45 and impact-analysis:32. That is the corpus form (74 sites). | diff (:24, :85); pre-existing (the rest) | Use `[Template](…#template)` |
| B13 | Hygiene | Low | 37. An I/O Contract Names the Value | workflow-design/techniques/context-loading.md:14, Input `operation_type` | "Selects whether the literacy artifacts are assembled." This is a consumer clause on a declaration that the round introduced. | diff | "The classified operation — `create`, `update` or `review`." |
| B14 | Hygiene | Low | 37. An I/O Contract Names the Value | workflow-design/activities/05-impact-analysis.yaml:20 `impact_correction`, :23 `impact_revision_requested` | "from each `revise-impact` reply in order" names the producing option. "True between the reader asking to revise … and that reply's correction landing in `impact_correction`" narrates producer and consumer. | diff | State what each value is, e.g. "The reader's corrections to the impact scope; absent until one is given" |
| B15 | Hygiene | Low | 39. A Phase Heading Names the Outcome | workflow-authoring/techniques/workflow-definition/scope-definition.md:75 "### 5. Compose the Manifest" | The phase now renders `{scope_manifest_report}`, and phase 2 already produced `{scope_manifest}`. The workflow-design twin renamed its phase "Compose Scope Manifest Report". | diff | Name the report, e.g. "Render the Manifest Report" |
| B16 | Hygiene | Low | Convention Conformance (naming against the established convention) | workflow-design/techniques/persist-design-specification.md (id, Capability :8 "Durable planning-folder review surface…"); 03-requirements-refinement.yaml:114-116, step `persist-specification` | The technique now only assembles; the next step, `persist-design-specification-artifact`, persists. The converted siblings are named `assemble-*` and `review-*`, and README:115 already reads "Assemble the elicited design specification". | diff | Rename the technique and step (e.g. `assemble-design-specification`), and state the product in Capability |
| B17 | Hygiene | Low | 40. Fan-Out Lives at the Layer That Runs the Work | work-packages/README.md:65 | Package Planning is "fanning out over the identified work packages". 04-package-planning.yaml:19-24 is a `forEach` loop over `work_packages` inside one worker. The round rewrote this section and kept the sentence. | pre-existing | "working through each identified work package in a loop" |

No High was recorded, withdrawn or downgraded. Mediums spot-confirmed at the cited lines:
- B1, B2: re-read against bcf31337.
- B3: `grep -c findings-satellite` gives 0.
- B4, B5: against the handler.
- B6: audit-principles/audit-anti-patterns phase 3.
- B7: write-artifact phase 2 and conduct-retrospective:36.

Candidates withdrawn:
- yield-checkpoint:25 `{checkpoint_id}` read after the `{$checkpoint_id}` bind: that is the correct AP-62 bind/read form.
- 05 `record-impact-correction` recording a correction "the reply carries": this is the corpus convention (work-package 10:152, 13:199, 03:88/:121).
- `checkpoint_reply` declared three times: AP-55 carve-out.

Out-of-slice observations for the owning slices:
- workflow-design scope-definition.md:71: phase 6 reads `{$structural_design}` and `{$drafting_order}`. This is `bind-protocol-locals`: the phase 4/5 binds are no longer read bare. At bcf31337 the reads were bare. Origin: diff.
- variable-binding.md:45: a rule cites "Phase 2's disambiguation rule". This is `phase-cited-by-ordinal`. Origin: diff.
- 01-intake-and-context.yaml:128-136: `persist-structural-inventory` gates on the post-Gate-1 `operation_type`, and intake built the inventory against the pre-Gate-1 value. A correction to update writes an unbuilt `structural_inventory`. This is `unproduced-value-read`. Origin: pre-existing.

## Files

- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/canon/resources/anti-patterns.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/canon/resources/schema-construct-inventory.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/activities/03-dispatch-client-workflow.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/activities/04-end-workflow.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/routines/activity-loop.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/fan/enter-fan.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/fan/spawn-branches.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/variable-binding.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/TECHNIQUE.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/activity-worker.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/commit-and-persist.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/compose-prompt.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/continue-batch.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/dispatch-activity.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/evaluate-transition.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/finalize-activity.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/present-checkpoint-to-user.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/resume-worker.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/take-activity.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/yield-checkpoint.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-audit/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-audit/techniques/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-update/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/substrate-node-security-audit/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-package/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-package/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-packages/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/activities/06-scope-and-draft.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/scope-definition.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/yaml-authoring.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/01-intake-and-context.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/03-requirements-refinement.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/05-impact-analysis.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/06-scope-and-draft.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/08-quality-review.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/resources/applicable-constructs.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/resources/draft-attestation.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/resources/impact-analysis.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/TECHNIQUE.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/assemble-file-approach.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/audit-rule-enforcement.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/context-loading.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/impact-analysis.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/intake-classification.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/persist-design-specification.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/reconcile-design-assumptions.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/review-draft-yaml.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/review-drafted-file.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/scope-definition.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/verify-high-findings.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/yaml-authoring.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/ledgers/binding-fidelity-triage.json — read (69 entries; the moved `variable-binding.md:24` site matches the relocated template example)
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/ledgers/unserved-operation-ref-triage.json — read (354 entries; the `workflow-design/techniques/TECHNIQUE.md:70` entry left with the reworded rule)
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/fan/retire-branch.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/respond-checkpoint.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-audit/activities/02-execute-analysis.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-evaluate/activities/02-execute-analysis.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-package/activities/10-post-impl-review.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-package/resources/workflow-retrospective.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/activities/08-quality-review.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/activities/09-validate-and-commit.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/compile-report.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/compose-publication.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/create-completion-doc.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/readme-authoring.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/scope-verification.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/verify-high-findings.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/workflow.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/09-validate-and-commit.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/10-post-update-review.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/11-retrospective.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/apply-audit-fixes.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/create-completion-doc.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/publish-workflow-pr.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/scope-audit.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/scope-verification.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/workflow.yaml — read
