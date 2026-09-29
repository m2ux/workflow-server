# Walk E (fourth pass, round-3 fix surface): anti-patterns overview, entry identity, Tool-Technique-Doc Consistency, Execution, Output Economy

Canon home: `corpus/canon/resources/anti-patterns.md` on the residuals worktree (`workflow/canon-audit-residuals`, head `c1ae16f8`, base `bcf31337`). Tool authority: `src/tools/workflow-tools.ts` on schema-description-hygiene (`respond_checkpoint` 2763-2935, `resume_checkpoint` 2636-2687, `present_checkpoint` 2689-2761, `yield_checkpoint` 2413-2578, `next_activity` 1223+, `get_activity` 1696+, `exitReport` 773), plus `src/resources/schema-resources.ts:45-50` and `src/loaders/schema-loader.ts:16`. Surface: the 80 paths in `r4-surface.txt`. Out-of-scope items (#973) were not recorded.

## Units

- Overview — walked
- Entry identity — walked
- AP-71. no-false-resource-delivery — walked
- AP-72. complete-bootstrap-path — walked (the continuation stub still reaches the paused step: `compose-prompt.md:43-44` emits `resume_checkpoint` then `get_activity`, and `activity-worker.md:40` routes to resume-from-checkpoint)
- AP-73. consistent-tool-names — walked (every `name { … }` call on the surface is a registered tool: get_activity, get_resource, get_technique, get_trace, get_workflow, next_activity, present_checkpoint, record_usage, respond_checkpoint, resume_checkpoint, start_session, yield_checkpoint; `get_activities` / `get_step_technique` appear only as catalogue exemplars)
- AP-74. no-duplicated-guidance — walked
- AP-75. describe-tool-value — walked
- AP-76. no-redundant-tools — walked
- AP-77. impl-before-confirmed-approach — not-applicable — "Authoring-session smells"; Detect: "File/workflow modifications begin before the user has confirmed the proposed approach". The surface is definition files with no session record.
- AP-78. follow-through-on-recommend — not-applicable — "Authoring-session smells"; Detect: "The agent emits recommendations/analysis as the deliverable and stops". No session output is on the surface.
- AP-79. structure-backed-constraints — walked
- AP-80. preserve-readme-content — walked (the README reductions in c1ae16f8 — work-packages −107, work-package activities, prism-update activities, substrate — answer third-pass findings walk3-A21, A23, B20, C2, F13, F14; Do not flag: "deletions the user explicitly requested")
- AP-81. verify-format-literacy — walked (brief: 56 of 56 guards pass on the head)
- AP-82. work-through-activities — walked
- AP-83. accept-correction — not-applicable — "Authoring-session smells"; Detect: "The agent disputes a user correction". No session exchange is on the surface.
- AP-84. single-closeout-artifact — walked
- AP-85. link-dont-copy-sections — walked
- AP-86. exception-only-verdict-tables — walked
- AP-87. omit-null-sections — walked
- AP-88. one-decision-one-checkpoint — walked
- AP-89. checkpoint-requires-decision — walked
- AP-90. no-guide-wrapper-ceremony — walked
- AP-91. lifecycle-row-update — walked
- AP-92. resource-fills-not-does — walked
- AP-93. canonical-fact-home — walked
- AP-94. link-only-input-slots — walked
- AP-95. enforce-output-discipline — walked
- AP-96. artifact-audience-declared — walked (every `#### artifact` the round added or moved carries `#### audience`: context-loading ×2, persist-design-specification, scope-definition ×2 twins, review-draft-yaml, verify-high-findings)
- AP-97. link-named-artifacts — walked
- AP-98. no-next-step-narration — walked
- AP-99. statement-not-question — walked
- AP-100. runtime-rules-only — walked
- AP-101. no-caption-only-message — walked
- AP-102. no-technique-resource-dual-home — walked

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| E1 | Live | High | AP-71 `no-false-resource-delivery` | `workflow-design/activities/05-impact-analysis.yaml:73-79` option `revise-impact.description`; `:86-95` step `record-impact-correction`; `:18-20` `impact_correction`; consumer `workflow-design/techniques/impact-analysis.md:20-22,51` | The option says "the reply carries the correction". The set action takes `impact_correction` from "The correction the reader's reply to the impact review carries". No reply the worker can read carries free text. `respond_checkpoint` accepts only `option_id` / `auto_advance` / `condition_not_met` (`workflow-tools.ts:2766-2771`) and returns `checkpoint_id, resolved, resolved_option, effect, dismissed, exit, message` (`:2912-2929`). That reply is the `checkpoint_reply` resume-worker carries. The `resume_checkpoint` the worker calls returns `checkpoint, option_id, variables_changed, exit, message` (`:2667-2682`). present-checkpoint-to-user captures only the `option_id` (`present-checkpoint-to-user.md:43,51`), and compose-prompt forbids decisions in the stub (`context-travels-as-state`). The worker running `record-impact-correction` therefore has no source for the value. On the re-run the `revise` exit enters (`workflow.yaml:55`), `impact-analysis` reads an empty or improvised `impact_correction` and reproduces the same classification. This round removed `immediate: true` from `revise` so that the step is reached. | diff (0e764ad3) | Carry the correction in a channel the tool surface has. For example, name what the revision changes as checkpoint options with `setVariable` effects, or have the worker ask for the correction through a gate it yields itself. Otherwise delete the "reply carries" claim and `impact_correction`. |
| E2 | Live | Medium | AP-71 `no-false-resource-delivery` | `work-package/activities/10-post-impl-review.yaml:127-136` (`flagged-blocks`: "The reply names the block numbers, comma-separated" → `collect-flagged-blocks`), `:150-159` (`rationale-corrected`: "The reply carries the corrections" → `re-render-block-rationale`); `workflow-design/activities/03-requirements-refinement.yaml:78-83` (`record-design-context`: "the reader supplied"); source rule `meta/techniques/workflow-engine/present-checkpoint-to-user.md:66-68` `a-correction-lands-in-the-bag` | This is the same form as E1, and it predates the round. Each site describes a checkpoint reply carrying free text, and a later step consumes it. The meta rule says such a correction "is written into the variable bag". But the resolving agent writes the bag through no call: `respond_checkpoint` takes no variables (`:2766-2771`), and `variable-mutation-source` (`workflow-engine/TECHNIQUE.md:60`) lists only setVariable effects, worker `variables_changed`, and yield `variables_changed`. A dispatched worker receives none of the text. | pre-existing (all three sites are present at bcf31337; wp-10 is a closure file) | State in one home how a reply's free text reaches the bag, over a call that carries it, or re-model each site so that the gate's options carry the value. |
| E3 | Live | Medium | AP-84 `single-closeout-artifact` | `workflow-design/techniques/create-completion-doc.md:22-24,45-47`; `workflow-design/activities/11-retrospective.yaml:26-45`; `workflow-design/techniques/conduct-retrospective.md:14`; `workflow-design/README.md:177` | create-completion-doc declares `#### artifact` `COMPLETE.md` and still persists the summary itself (§4 "record `{completion_document}` in `{planning_folder_path}`"). The activity also writes it to `completion.md` (`persist-completion-doc`). Then `persist-retrospective` writes `retrospective_document`, "the `## Workflow Retrospective` section of the close-out document", to the same `completion.md`. write-artifact §2 updates the file "writing `{artifact_content}` to it", so the summary is replaced by the section alone. The result is two terminal documents, and one loses its content. The round moved every other workflow-design report to its save step and left this one. | pre-existing (closure files, unchanged) | Collapse to one close-out file: delete create-completion-doc §4 and write the summary once, then retarget the retrospective write so it lands as a section of that document (an output composing summary and section, or an append-capable write). |
| E4 | Hygiene | Low | AP-75 `describe-tool-value` | `meta/techniques/workflow-engine/present-checkpoint-to-user.md:26` Protocol §1 | The line now reads "Call `present_checkpoint { session_index }` for the active checkpoint, whose softness phase 2 reads and whose message and options phase 5 puts to the user". It no longer states the value the tool returns: message and option text rendered from the bag, and on each exit-naming option a `consequence` carrying `exit`, `next_activity` and `ends_activity` (`workflow-tools.ts:2733-2744`). The engine returns the consequence precisely so that the presenter can state it before the user chooses. | diff (83d6f046) | Describe the real return: rendered message and options, effects, auto-advance, and per-option `consequence`. |
| E5 | Hygiene | Low | Entry identity | `canon/resources/anti-patterns.md:1604-1642` (`### MR-1.` … `### MR-4.`) | Entry identity requires "Title: `### AP-XX. name`. **AP-XX** is file order", but four titles use `MR-N`. The section intro "The `MR-` designator is stable" is a second, conflicting home for the title rule, and `AP-126` follows `AP-125` across them. | pre-existing | Number them `AP-XX` in file order, or state the `MR-` exception in Entry identity and drop the section-level claim. |
| E6 | Contract | Low | AP-71 `no-false-resource-delivery` | `workflow-design/techniques/context-loading.md:46` Protocol §1 | "Load all five JSON schema definitions from `workflow-server://schemas` (workflow, activity, technique, condition, state) … Delivery: resource-loading-via-tool". There is no `state` schema. The URI serves workflow, activity, condition, technique and session-file (`schema-loader.ts:16`), and it is an MCP resource, not a `get_resource` id (`schema-resources.ts:45-47`). This round edited the file's Inputs and §6-7, and its own inventory line now names the served schemas correctly. | known — not fixed (walk3-E5) | Name the schemas the URI serves, and read it as an MCP resource, not via `resource-loading-via-tool`. |
| E7 | Hygiene | Low | AP-97 `link-named-artifacts` | `workflow-design/activities/09-validate-and-commit.yaml:170` `approve-to-commit.message` | "`[assumptions log]({assumptions_log})`" interpolates the log object (`workflow.yaml:39-41`, type `object`), not a path. | known — not fixed (walk3-E7) | Declare a path output for `assumptions-log.md` and interpolate it. |
| E8 | Hygiene | Low | AP-98 `no-next-step-narration` | `workflow-design/activities/01-intake-and-context.yaml:142`; `03-requirements-refinement.yaml:129,145,174` | "— proceeding without Gate 1."; "Stakeholder attestation at Gate 2."; "Open judgements after reconcile batch into Gate 2."; "batched into Gate 2 (`approve-to-commit`), not interviewed mid-flow." This round touched both files. | known — not fixed (walk3-E8) | Delete the routing narration and keep the factual clause. |
| E9 | Hygiene | Low | AP-99 `statement-not-question` | `meta/activities/04-end-workflow.yaml:41`; `workflow-design/activities/09-validate-and-commit.yaml:170` | "Confirm closure or return to the workflow …" and "Approve commit for workflow '{workflow_id}' (…)" are imperative asks. This round touched 04 (the variable description). | known — not fixed (walk3-E9) | State the subject, and leave the decision to `options[]`. |
| E10 | Hygiene | Low | AP-101 `no-caption-only-message` | `meta/activities/04-end-workflow.yaml:41` | "Session summary presented above." captions `generate-summary`. | known — not fixed (walk3-E10) | Reduce the message to the subject the options decide. |
| E11 | Contract | Low | AP-102 `no-technique-resource-dual-home` | `workflow-authoring/techniques/workflow-definition/impact-analysis.md:84-86` vs `workflow-authoring/resources/impact-analysis.md:86`; `workflow-authoring/techniques/workflow-definition/scope-definition.md:78` vs `resources/scope-manifest.md:60`; `workflow-design/techniques/scope-definition.md:72` vs `workflow-design/resources/scope-manifest.md:64` | The techniques restate the templates' fill rules: "a reduction that no inventory row names as unapproved" vs "A reduction no row names is unapproved", and "link … rather than restating" vs "Own facts only". This round edited the adjacent Compose bullets in all three techniques. | known — not fixed (walk3-E13) | Keep the fill rules in the resource. The technique keeps the assemble step and the template citation. |

High re-derived and kept. I re-derived E1 from the handler and the activity alone:
- `respond_checkpoint` has three input parameters, none of them text.
- `resume_checkpoint` returns only the stored option, the effect variables and the exit.
- The worker that runs `record-impact-correction` sees only those, plus the stub's `checkpoint_reply`, which is the `respond_checkpoint` payload.

No High was withdrawn or downgraded.

Mediums spot-confirmed:
- E2: against `workflow-tools.ts:2766-2771` and bcf31337 (wp-10 :129, :152; wd-03 :78).
- E3: against `write-artifact.md` §2 and `conduct-retrospective.md:14`.

Third-pass findings in this slice, re-checked:
- **No longer firing**
  - walk3-E3: the `client_workflow_completed` description now states what its producer sets (`03…:15`, `04…:16`).
  - walk3-E6: the inventory `:15` now names the four definition schemas the URI serves, and the routine schema by repo path.
  - walk3-E14: `reconcile-design-assumptions.md:39` cites the kebab name.
  - walk3-E1 claim half: `finalize-activity.md:64` now names `__terminal__`. The loop-termination half is out of scope (#973).
- **Retired by a rule change**
  - walk3-E11 and walk3-E12: AP-100 Do not flag now reads "An authoring technique's rules for the definitions it drafts" (c1ae16f8). Both yaml-authoring rule sets fall under it.
- **Out of scope** (#973)
  - walk3-E2 (enter-fan `_meta.fan`).
  - walk3-E1 loop termination.
- **Off this surface**
  - walk3-E4 (`workflow-canonical.md`).

Considered and not recorded:
- **AP-74:** `checkpoint_reply` is declared with near-identical text on activity-worker, compose-prompt and resume-worker. These are bind contracts, not behavioural guidance, and they sit on a meta engine surface (Do not flag).
  - The stub's `resume_checkpoint` (`compose-prompt.md:43`) and resume-from-checkpoint §1 both call the tool. Same carve-out.
- **AP-79:** the new `content-preservation` rule (`workflow-design/techniques/impact-analysis.md:80-82`) is backed by the `preservation-check` checkpoint (`06…:269-301`).
  - `commit-after-activity` ("before the next `next_activity` call") is backed by routine order: `commit-activity-artifacts` runs before the next iteration's advance.
- **AP-89:** `05…:56-85` gives each option a distinct effect.
- **AP-91:** `refresh-enforcement-findings` (`08…:321-331`) re-saves in place under the same gate the other audit satellites use.
- **AP-92:** removing "Skip writing this artifact in review mode" from `applicable-constructs.md` takes the does-rule out of the resource. The `## Decision ask` in the impact template is template content.
- **AP-102:** workflow-design `impact-analysis.md` `content-preservation` (the unapproved consequence) is not the fact its resource's "Every material removal gets a removed-vs-preserved row" states.
- **Focus items:**
  - `checkpoint_reply` is produced by respond-checkpoint (`respond-checkpoint.md:18-20`), bound by `resume-yielded-worker` (`activity-loop.yaml:182`) and cleared by `clear-checkpoint-reply` (`:184-191`). No later dispatch binds it, and no other corpus file reads it.
  - `exit_id` and `step_manifest`, now declared on the container (`workflow-engine/TECHNIQUE.md:20-26`), are bound by `continue-batched-worker` (`activity-loop.yaml:72,75`).
  - `scope_manifest` stays an array: the drafting loop iterates it (`06…:166`, authoring `06…:131`), and the save steps write `scope_manifest_report`.

Out of slice, for the owning walker:
- `unproduced-value-read`, `workflow-design/activities/01-intake-and-context.yaml:128-136` with `intake-classification.md:85-86`:
  - `structural_inventory` is built only when classification yields update or review. `design-intent-batch` then runs `confirm-update` / `cancel-as-create`, which set `operation_type` after the build.
  - A create→update flip runs `persist-structural-inventory` and, later, `impact-analysis` (required input `structural_inventory`) with no producer on that path.
- One home / save step: `audit-principles.md:40-42`, `audit-anti-patterns.md:44-46`, `audit-expressiveness.md`, `audit-conformance.md` and `audit-rule-hygiene.md` still persist their findings themselves.
  - `08-quality-review.yaml:116-134` also saves principle and anti-pattern findings through write-artifact, so each has two writers.
  - The round's intent ("every workflow-design report through its save step") stops short of these.
- `brace-declared-ids` / `bind-protocol-locals`, `yield-checkpoint.md:25` (diff, 83d6f046): the call now reads `{checkpoint_id}`. The technique declares no such id, and the bind one bullet above is `{$checkpoint_id}`.
- `activity-loop.yaml:173-183` with `enter_activity: workflow-engine::take-activity` (`prism-audit/…/02…:93`, `prism-evaluate/…/02…:108`, `work-package/…/10…:211`):
  - A `checkpoint_pending` from an activity this context carried reaches `resume-worker` with no `worker_agent_id`, because take-activity spawns no worker.
  - This is pre-existing, and it may sit under the loop-termination item in #973.

## Files

- canon-audit-residuals/corpus/canon/resources/anti-patterns.md — read
- canon-audit-residuals/corpus/canon/resources/schema-construct-inventory.md — read
- canon-audit-residuals/corpus/meta/activities/03-dispatch-client-workflow.yaml — read
- canon-audit-residuals/corpus/meta/activities/04-end-workflow.yaml — read
- canon-audit-residuals/corpus/meta/routines/activity-loop.yaml — read
- canon-audit-residuals/corpus/meta/techniques/fan/enter-fan.md — read
- canon-audit-residuals/corpus/meta/techniques/fan/spawn-branches.md — read
- canon-audit-residuals/corpus/meta/techniques/variable-binding.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/TECHNIQUE.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/activity-worker.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/commit-and-persist.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/compose-prompt.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/continue-batch.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/dispatch-activity.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/evaluate-transition.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/finalize-activity.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/present-checkpoint-to-user.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/resume-worker.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/take-activity.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/yield-checkpoint.md — read
- canon-audit-residuals/corpus/prism-audit/README.md — read
- canon-audit-residuals/corpus/prism-audit/techniques/README.md — read
- canon-audit-residuals/corpus/prism-update/activities/README.md — read
- canon-audit-residuals/corpus/substrate-node-security-audit/README.md — read
- canon-audit-residuals/corpus/work-package/README.md — read
- canon-audit-residuals/corpus/work-package/activities/README.md — read
- canon-audit-residuals/corpus/work-packages/README.md — read
- canon-audit-residuals/corpus/workflow-authoring/activities/06-scope-and-draft.yaml — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/scope-definition.md — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/yaml-authoring.md — read
- canon-audit-residuals/corpus/workflow-design/README.md — read
- canon-audit-residuals/corpus/workflow-design/activities/01-intake-and-context.yaml — read
- canon-audit-residuals/corpus/workflow-design/activities/03-requirements-refinement.yaml — read
- canon-audit-residuals/corpus/workflow-design/activities/05-impact-analysis.yaml — read
- canon-audit-residuals/corpus/workflow-design/activities/06-scope-and-draft.yaml — read
- canon-audit-residuals/corpus/workflow-design/activities/08-quality-review.yaml — read
- canon-audit-residuals/corpus/workflow-design/resources/applicable-constructs.md — read
- canon-audit-residuals/corpus/workflow-design/resources/draft-attestation.md — read
- canon-audit-residuals/corpus/workflow-design/resources/impact-analysis.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/TECHNIQUE.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/assemble-file-approach.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/audit-rule-enforcement.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/context-loading.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/impact-analysis.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/intake-classification.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/persist-design-specification.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/reconcile-design-assumptions.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/review-draft-yaml.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/review-drafted-file.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/scope-definition.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/verify-high-findings.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/yaml-authoring.md — read
- canon-audit-residuals/ledgers/binding-fidelity-triage.json — read (header, rationales and every entry whose site is on this surface; the changed entry at `:367` checked against `variable-binding.md:24`)
- canon-audit-residuals/ledgers/unserved-operation-ref-triage.json — read (the homogeneous site/op/verdict list, entries on this surface, and the removed `TECHNIQUE.md:70` entry checked against the delinked line)
- canon-audit-residuals/corpus/meta/techniques/fan/retire-branch.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/respond-checkpoint.md — read
- canon-audit-residuals/corpus/prism-audit/activities/02-execute-analysis.yaml — read
- canon-audit-residuals/corpus/prism-evaluate/activities/02-execute-analysis.yaml — read
- canon-audit-residuals/corpus/work-package/activities/10-post-impl-review.yaml — read
- canon-audit-residuals/corpus/work-package/resources/workflow-retrospective.md — read
- canon-audit-residuals/corpus/workflow-authoring/activities/08-quality-review.yaml — read
- canon-audit-residuals/corpus/workflow-authoring/activities/09-validate-and-commit.yaml — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/compile-report.md — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/compose-publication.md — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/create-completion-doc.md — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/readme-authoring.md — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/scope-verification.md — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/verify-high-findings.md — read
- canon-audit-residuals/corpus/workflow-authoring/workflow.yaml — read
- canon-audit-residuals/corpus/workflow-design/activities/09-validate-and-commit.yaml — read
- canon-audit-residuals/corpus/workflow-design/activities/10-post-update-review.yaml — read
- canon-audit-residuals/corpus/workflow-design/activities/11-retrospective.yaml — read
- canon-audit-residuals/corpus/workflow-design/techniques/apply-audit-fixes.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/create-completion-doc.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/publish-workflow-pr.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/scope-audit.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/scope-verification.md — read
- canon-audit-residuals/corpus/workflow-design/workflow.yaml — read
