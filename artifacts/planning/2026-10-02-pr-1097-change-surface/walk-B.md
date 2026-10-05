# Walk B — work-package resources and workflow README

Tree: `.worktrees/workflow/i10-integrate`. Base: `b57da76ae3b8b9947799860944c1a6055c062cfe` (pr-1097-base when the file is there). Kinds: `corpus/work-package/resources/*.md` is `resource` (including `resources/README.md`); `corpus/work-package/README.md` and `resources/README.md` are `readme`. A `*` unit meets all 19. A readme unit meets both READMEs. A resource unit meets the 18 resource files.

## Files read

- corpus/work-package/README.md
- corpus/work-package/resources/README.md
- corpus/work-package/resources/adr-guide.md
- corpus/work-package/resources/architecture-review.md
- corpus/work-package/resources/assumption-reconciliation.md
- corpus/work-package/resources/canonical-home-map.md
- corpus/work-package/resources/close-out-guide.md
- corpus/work-package/resources/deferred-items-guide.md
- corpus/work-package/resources/design-framework.md
- corpus/work-package/resources/follow-ups-guide.md
- corpus/work-package/resources/issue-creation.md
- corpus/work-package/resources/knowledge-base-research.md
- corpus/work-package/resources/plan-guide.md
- corpus/work-package/resources/pr-description.md
- corpus/work-package/resources/prior-feedback-triage-guide.md
- corpus/work-package/resources/provenance-log-guide.md
- corpus/work-package/resources/readme-seed.md
- corpus/work-package/resources/requirements-elicitation.md
- corpus/work-package/resources/test-plan-guide.md

## Unread

None in this slice.

## Not applicable

Fires-on excludes every file in this slice. Quoted once.

- P 1. Workflows Ossify Patterns — **Fires on:** `workflow`, `activity`, `technique`, `routine`
- P 5. Maximize Schema Expressiveness — **Fires on:** `workflow`, `activity`, `technique`, `routine`
- P 9. Encode Constraints as Structure — **Fires on:** `activity.steps`, `activity.exits`, `workflow.rules`, `activity.rules`, `technique.rules`
- P 13. Separate Contract from Procedure — **Fires on:** `technique.inputs`, `technique.outputs`, `technique.protocol`, `technique.rules`
- P 14. Single Source of Truth — **Fires on:** `workflow.variables`, `activity.steps`, `technique.inputs`
- P 15. Phase by Sequenced Outcome — **Fires on:** `technique.protocol`
- P 16. Distinguish Designators from Parameters — **Fires on:** `technique.protocol`
- P 18. Prefer Shared Capability — **Fires on:** `activity.steps`, `activity.techniques`, `workflow.techniques`, `technique`
- P 19. Name Symbols Affirmatively — **Fires on:** `technique.inputs`, `technique.outputs`, `technique.rules`, `workflow.variables`, `activity.variables`
- P 20. Keep Orchestration in Structure — **Fires on:** `activity.steps`, `activity.exits`, `workflow.graph`, `technique.capability`, `technique.protocol`, `technique.rules`
- P 24. Keep Session Interaction in Activities — **Fires on:** `technique`, `activity.steps`
- P 25. Bind Sibling Techniques as Steps — **Fires on:** `activity.steps`, `technique.protocol`
- P 26. A Technique Is a Reading — **Fires on:** `technique.capability`, `technique.protocol`, `technique.inputs`, `activity.steps`
- P 27. State Contract Contribution — **Fires on:** `technique.capability`, `technique.protocol`, `technique.inputs`, `technique.outputs`, `technique.rules`
- P 31. Isolate Conditional Branches as Notes — **Fires on:** `technique.protocol`
- P 36. A Technique Names Only What Its Reader Holds — **Fires on:** `technique`
- P 37. An I/O Contract Names the Value — **Fires on:** `technique.inputs`, `technique.outputs`
- P 38. A Relocation Records the Outcome It Keeps — **Fires on:** `activity.steps`, `activity.exits`, `technique`, `workflow.rules`, `activity.rules`, `technique.rules`
- P 39. A Phase Heading Names the Outcome — **Fires on:** `technique.protocol`
- P 40. Fan-Out Lives at the Layer That Runs the Work — **Fires on:** `workflow.graph`, `activity.steps`, `technique`
- P 41. A Phase States Answers the Tool Has Returned — **Fires on:** `technique.protocol`
- P 42. A Routine Holds the Codified Path — **Fires on:** `routine`, `technique`, `activity`
- P 43. A Workflow Borrows Activities — **Fires on:** `workflow.activities`
- P 45. A Rule States One Invariant — **Fires on:** `technique.rules`
- P 46. A Consumer Binds the Contract — **Fires on:** `technique`, `activity`, `workflow`
- AP-02. schema-is-constraint — **Fires on:** `workflow`, `activity`, `technique`
- AP-05. atomic-checkpoints — **Fires on:** `activity.steps`
- AP-09. checkpoint-not-prose — **Fires on:** `activity.description`, `activity.steps`, `technique.protocol`
- AP-10. loop-not-prose — **Fires on:** `activity.description`, `activity.steps`, `technique.protocol`
- AP-11. decision-not-prose — **Fires on:** `activity.description`, `activity.exits`, `workflow.graph`
- AP-12. artifact-not-buried — **Fires on:** `activity.description`, `technique.capability`, `technique.protocol`, `technique.outputs`
- AP-13. variable-for-approval — **Fires on:** `activity.description`, `activity.steps`, `activity.variables`, `workflow.variables`
- AP-14. mode-as-state — **Fires on:** `activity.rules`, `workflow.rules`, `technique.rules`, `activity.variables`, `workflow.variables`, `activity.steps`, `activity.exits`
- AP-15. procedure-in-protocol — **Fires on:** `activity.steps`
- AP-16. technique-inputs-declared — **Fires on:** `technique.capability`, `technique.inputs`, `technique.protocol`
- AP-17. bound-step-no-description — **Fires on:** `activity.steps`
- AP-18. no-monolith-masking-steps — **Fires on:** `activity.steps`
- AP-19. no-rule-protocol-restatement — **Fires on:** `technique.rules`, `activity.rules`, `workflow.rules`, `technique.protocol`
- AP-20. rule-group-disambiguation — **Fires on:** `technique.rules`, `activity.rules`, `workflow.rules`
- AP-21. grouped-rule-keys — **Fires on:** `technique.rules`, `activity.rules`, `workflow.rules`
- AP-22. single-rule-authority — **Fires on:** `workflow.rules`, `activity.rules`, `technique.rules`
- AP-23. worker-rule-reach — **Fires on:** `workflow.rules.workflow`, `activity.rules`, `technique.rules`
- AP-24. no-contradictory-rules — **Fires on:** `technique.rules`, `activity.rules`, `workflow.rules`
- AP-25. no-one-step-rules — **Fires on:** `technique.rules`, `technique.protocol`
- AP-26. no-rationale-in-description — **Fires on:** `workflow.description`, `activity.description`, `activity.steps[].message`, `activity.steps[].options[].description`, `activity.steps[].actions[].description`, `technique.protocol`, `technique.rules`, `activity.rules`, `workflow.rules`
- AP-27. validate-message-economy — **Fires on:** `activity.steps[].actions[].message`
- AP-28. no-sequence-in-description — **Fires on:** `workflow.description`, `activity.description`, `technique.capability`, `workflow.activities`, `workflow.graph`, `activity.steps`, `technique.protocol`
- AP-29. no-user-env-mutation — **Fires on:** `workflow.description`, `activity.description`, `technique.capability`, `activity.steps[].actions[].message`, `technique.protocol`, `activity.steps[].options`
- AP-30. role-rules-not-description — **Fires on:** `workflow.description`, `activity.description`, `workflow.variables`, `activity.variables`, `workflow.rules`, `activity.rules`, `technique.rules`
- AP-31. no-hand-authored-artifacts — **Fires on:** `activity`, `technique.outputs`
- AP-32. outcome-names-value — **Fires on:** `activity.outcome`
- AP-33. no-set-of-technique-output — **Fires on:** `activity.steps[].technique`, `activity.steps[].actions`, `technique.outputs`
- AP-34. no-valueless-control-set — **Fires on:** `activity.steps[].actions`
- AP-35. no-intra-step-input-set — **Fires on:** `activity.steps[].technique.inputs`, `activity.steps[].actions`
- AP-36. techniques-list-disjoint — **Fires on:** `activity.techniques`, `activity.steps[].technique`
- AP-37. rule-audience-bucket — **Fires on:** `workflow.rules.workflow`, `workflow.rules.activity`, `workflow.rules.universal`
- AP-38. no-duplicate-technique-steps — **Fires on:** `activity.steps[].technique`
- AP-39. hoist-universal-techniques — **Fires on:** `activity.techniques`, `workflow.techniques.activity`
- AP-42. io-agnostic-contract — **Fires on:** `technique.inputs`, `technique.outputs`
- AP-43. canonical-artifact-ids — **Fires on:** `technique.protocol`, `technique.inputs`, `technique.outputs`
- AP-44. artifact-name-in-io — **Fires on:** `technique.protocol`, `technique.inputs`, `technique.outputs`
- AP-45. no-opaque-artifact-path-array — **Fires on:** `technique.inputs`, `technique.protocol`
- AP-48. brace-output-references — **Fires on:** `technique.protocol`
- AP-49. no-delivery-mechanism-narration — **Fires on:** `technique.protocol`
- AP-51. canonical-technique-reference — **Fires on:** `technique.protocol`
- AP-52. brace-declared-ids — **Fires on:** `technique.protocol`, `technique.capability`
- AP-53. dotted-rule-address — **Fires on:** `technique.protocol`
- AP-54. anchored-protocol-references — **Fires on:** `technique.protocol`
- AP-55. hoist-shared-inputs — **Fires on:** `technique.inputs`, `technique.inherited_inputs`
- AP-56. paren-invocation-args — **Fires on:** `technique.protocol`
- AP-59. constraint-as-blockquote — **Fires on:** `technique.protocol`
- AP-60. local-rule-as-note — **Fires on:** `technique.rules`, `technique.protocol`
- AP-61. factor-repeated-paths — **Fires on:** `technique`
- AP-62. bind-protocol-locals — **Fires on:** `technique.protocol`, `technique.inputs`, `technique.outputs`
- AP-64. boolean-id-shape — **Fires on:** `technique.inputs`, `technique.outputs`, `workflow.variables`, `activity.variables`
- AP-65. collection-id-shape — **Fires on:** `technique.inputs`, `technique.outputs`, `workflow.variables`, `activity.variables`
- AP-66. io-id-shape — **Fires on:** `technique.inputs`, `technique.outputs`
- AP-67. rule-slug-shape — **Fires on:** `technique.rules`
- AP-68. technique-stage-agnostic — **Fires on:** `technique.capability`, `technique.protocol`, `technique.rules`
- AP-69. no-activity-prose-rules — **Fires on:** `activity.rules`
- AP-70. capability-group-placement — **Fires on:** `technique`, `workflow.techniques`
- AP-79. structure-backed-constraints — **Fires on:** `workflow.rules`, `activity.rules`, `technique.rules`, `activity.steps`, `activity.exits`
- AP-82. work-through-activities — **Fires on:** `workflow.activities`, `workflow.graph`
- AP-88. one-decision-one-checkpoint — **Fires on:** `activity.steps`
- AP-89. checkpoint-requires-decision — **Fires on:** `activity.steps`
- AP-96. artifact-audience-declared — **Fires on:** `technique.outputs`
- AP-97. link-named-artifacts — **Fires on:** `activity.steps[].message`, `activity.steps[].actions[].message`
- AP-98. no-next-step-narration — **Fires on:** `activity.steps[].message`, `activity.steps[].actions[].message`, `activity.steps[].options[].description`
- AP-99. statement-not-question — **Fires on:** `activity.steps[].message`
- AP-100. runtime-rules-only — **Fires on:** `workflow.rules`, `activity.rules`, `technique.rules`
- AP-101. no-caption-only-message — **Fires on:** `activity.steps[].message`
- AP-105. no-shadow-audit-pass — **Fires on:** `technique.protocol`
- AP-108. numbered-protocol-phases — **Fires on:** `technique.protocol`
- AP-109. technique-outputs-declared — **Fires on:** `technique.capability`, `technique.protocol`, `technique.outputs`
- AP-110. duplicate-shared-capability — **Fires on:** `technique.protocol`
- AP-111. contract-not-procedure — **Fires on:** `technique.protocol`, `technique.outputs`
- AP-112. no-derived-state-shadow — **Fires on:** `workflow.variables`
- AP-113. session-interaction-in-technique — **Fires on:** `technique.capability`, `technique.protocol`, `technique.rules`
- AP-114. pass-orchestration-in-technique — **Fires on:** `technique.capability`, `technique.protocol`
- AP-117. no-engine-mechanics-as-rules — **Fires on:** `technique.rules`, `activity.rules`, `workflow.rules`, `technique.protocol`
- AP-119. procedure-in-io-contract — **Fires on:** `technique.inputs`, `technique.outputs`
- AP-120. procedure-in-capability — **Fires on:** `technique.capability`
- AP-123. capability-as-op-inventory — **Fires on:** `technique.capability`
- AP-124. alternate-ops-as-protocol-sequence — **Fires on:** `technique.protocol`
- AP-125. technique-ref-in-io-contract — **Fires on:** `technique.inputs`, `technique.outputs`
- AP-130. variable-description-one-line — **Fires on:** `workflow.variables`
- AP-132. unproduced-value-read — **Fires on:** `activity.steps`
- AP-134. artifact-name-is-filename — **Fires on:** `technique.outputs`
- AP-136. deployment-path-in-capability — **Fires on:** `technique.capability`
- AP-139. tool-contract-restated-in-protocol — **Fires on:** `technique.protocol`, `technique.rules`
- AP-141. unowned-harness-capability — **Fires on:** `technique`
- AP-142. output-without-destination — **Fires on:** `technique.outputs`, `activity.steps`
- AP-144. declared-input-never-read — **Fires on:** `technique.inputs`, `technique.protocol`, `technique.rules`
- AP-145. apply-omits-declared-input — **Fires on:** `technique.protocol`, `technique.inputs`
- AP-146. branch-on-undeclared-threshold — **Fires on:** `technique.protocol`, `technique.rules`, `activity.steps`
- AP-147. inherited-rules-re-enumerated — **Fires on:** `technique.rules`, `workflow.rules`, `activity.rules`
- AP-148. reference-without-provenance — **Fires on:** `technique`
- AP-151. rule-binds-beyond-its-operation — **Fires on:** `technique.rules`
- AP-152. inherited-input-re-declared — **Fires on:** `technique.inputs`, `technique.inherited_inputs`
- AP-154. engine-internals-narrated — **Fires on:** `technique`
- AP-156. one-invariant-per-rule — **Fires on:** `technique.rules`
- AP-157. call-omits-conditionally-required-argument — **Fires on:** `technique.protocol`, `technique.rules`
- AP-158. call-omits-required-argument — **Fires on:** `technique.protocol`, `technique.rules`
- AP-159. call-names-an-undeclared-argument — **Fires on:** `technique.protocol`, `technique.rules`
- AP-160. protocol-phase-as-list-item — **Fires on:** `technique.protocol`
- AP-161. unreachable-operation-reference — **Fires on:** `technique.capability`, `technique.protocol`, `technique.rules`
- AP-162. produce-path-without-a-reading — **Fires on:** `technique.protocol`
- AP-164. relocation-without-a-preserved-outcome — **Fires on:** `activity.steps`, `activity.exits`, `technique`, `workflow.rules`, `activity.rules`, `technique.rules`
- AP-165. unproducible-declared-value — **Fires on:** `technique.outputs`, `technique.protocol`

## Evidence

Lines are `unit | file | field | clean or finding | quote`. Finding ids match the table. Paths are under `corpus/work-package/` unless noted.

### P 2, P 3, P 4, P 8, P 23, P 35, AP-03, AP-06, AP-07, AP-08, AP-77, AP-78, AP-83

These units detect session conduct (an unconfirmed choice, a done claim, stacked questions, a recommendation with no follow-through). None of the 19 files is a session transcript. Each is clean at `body`, quoted by its H1.

- P2 / P3 / P4 / P8 / P23 / P35 / AP-03 / AP-06 / AP-07 / AP-08 / AP-77 / AP-78 / AP-83 | README.md | body | clean | "# Work Package Implementation Workflow"
- same units | resources/README.md | body | clean | "# Work Package Resources"
- same units | resources/adr-guide.md | body | clean | "# Architecture Decision Record Guide"
- same units | resources/architecture-review.md | body | clean | "# Architecture Review Guide"
- same units | resources/assumption-reconciliation.md | body | clean | "# Assumption Reconciliation"
- same units | resources/canonical-home-map.md | body | clean | "# Canonical Home Map"
- same units | resources/close-out-guide.md | body | clean | "# Work Package Close-Out Guide"
- same units | resources/deferred-items-guide.md | body | clean | "# Deferred Items Register Guide"
- same units | resources/design-framework.md | body | clean | "# Design Framework Guide"
- same units | resources/follow-ups-guide.md | body | clean | "# Follow-Ups Register Guide"
- same units | resources/issue-creation.md | body | clean | "# Issue Creation Guide"
- same units | resources/knowledge-base-research.md | body | clean | "# Knowledge Base Research Guide"
- same units | resources/plan-guide.md | body | clean | "# Work Package Plan Guide"
- same units | resources/pr-description.md | body | clean | "# Pull Request Description Guide"
- same units | resources/prior-feedback-triage-guide.md | body | clean | "# Prior Feedback Triage Guide"
- same units | resources/provenance-log-guide.md | body | clean | "# Provenance Log Guide"
- same units | resources/readme-seed.md | body | clean | "# Work Package README Seed"
- same units | resources/requirements-elicitation.md | body | clean | "# Requirements Elicitation Guide"
- same units | resources/test-plan-guide.md | body | clean | "# Test Plan Creation Guide"

### P 6 One Authoritative Home / P 7 Convention Over Invention / P 10 Non-Destructive Updates / P 34 Edit the Owner

- P6 | README.md | Workflow Flow | clean | "Activity order and the exits between activities are the `graph` in [workflow.yaml](./workflow.yaml)."
- P6 | resources/canonical-home-map.md | ## Map | clean | "The canonical home for each shared fact category."
- P6 | resources/adr-guide.md | ## Rules | clean | "A record holds the decision, not the design."
- P6 | resources/plan-guide.md | ## Rules | clean | "Problem & Scope, Success Criteria, Testing Strategy, Assumptions — link-only slots"
- P6 | resources/close-out-guide.md | ## Rules | clean | "Point, don't restate."
- P6 | resources/deferred-items-guide.md | ## Canonical Home | clean | "The register is the one canonical home for work consciously deferred **out of scope**"
- P6 | resources/follow-ups-guide.md | ## Canonical Home | clean | "The register is the one canonical home for **in-task** follow-ups"
- P6 | resources/knowledge-base-research.md | ## Planning Artifact | finding B27 | "**Template:**" under `## Planning Artifact`, not a `## Template` home
- P6 | remaining resource files (architecture-review, assumption-reconciliation, design-framework, issue-creation, pr-description, prior-feedback-triage-guide, provenance-log-guide, readme-seed, requirements-elicitation, test-plan-guide, resources/README.md) | body | clean | each names one guide or index and points at the sibling that owns the other fact (architecture-review → adr-guide `#template`; assumption-reconciliation → assumptions-review `#assumptions-log-template`; readme-seed → planning-readme `#rules` and `#template`)
- P7 | resources/adr-guide.md | frontmatter | finding B28 | `metadata.order` with no `version`
- P7 | resources/prior-feedback-triage-guide.md | frontmatter | finding B28 | `metadata.order` with no `version`
- P7 | resources/provenance-log-guide.md | frontmatter | finding B28 | `metadata.order` with no `version`
- P7 | resources/deferred-items-guide.md | frontmatter | clean | "version: 2.0.2"
- P7 | resources/design-framework.md | name | finding B18 | `name: design-framework` while the file holds `## Design Philosophy Artifact Template`
- P7 | resources/issue-creation.md | name | finding B19 | `name: issue-creation` while the file holds `## Issue Template`
- P7 | resources/pr-description.md | name | finding B20 | `name: pr-description` while the file holds `### Template (Initial)`
- P7 | resources/requirements-elicitation.md | name | finding B21 | `name: requirements-elicitation` while the file holds `## Document Template`
- P7 | other files in the slice | name / H1 | clean | kebab-case resource ids that already carry `-guide` or `-seed`, or a readme index
- P10 | assumption-reconciliation.md | ## Scorecard removed in the diff | clean | the integration section still says "reconciliation updates rows in place"
- P10 | README.md | ## Workflow Flow | clean | the mermaid exit list is replaced by the graph pointer; the activity table remains (B1)
- P34 | readme-seed.md | ## Progress inventory | finding B3 | "Rows run in the order the activities execute" while the workflow README now inserts Contract Tests and Implementation Join between Implement and Lean-Coding Audit
- P34 | other files | body | clean | renames in this diff retarget `wp-plan` / `test-plan` / `adr` / `complete-wp-guide` links onto `plan-guide` / `test-plan-guide` / `adr-guide` / `close-out-guide`

### P 11 Complete Documentation Structure — readme

- P11 | README.md | ## Overview, ## Workflow Flow | clean | purpose, a file-grain activity orientation, and "Activity order and the exits between activities are the `graph`"
- P11 | resources/README.md | index table | clean | "Markdown resources for planning-folder templates" plus a file-grain resource index

### P 12 Output Economy — resource

- P12 | resources/close-out-guide.md | ## Template Results | clean | "Link the [implementation plan](NN-work-package-plan.md) — do not restate its tasks."
- P12 | resources/plan-guide.md | ## Template Problem & Scope | clean | "Do not restate them here."
- P12 | resources/canonical-home-map.md | ### link-only-slots | clean | "a markdown link to the canonical home plus at most one line"
- P12 | resources/close-out-guide.md | ## Template Design decisions | finding B30 | "Context / Decision / Rationale / Alternatives considered."
- P12 | other resource files | template or rules | clean | one audience per artifact; other facts are links (requirements Assumptions slot, deferred-items "Point, don't restate", pr-description "Content is linked, not inlined")

### P 17 Document in Positive Present — readme

- P17 | README.md | Overview | clean | "Where assumptions or comprehension questions are settled, agent-resolvable concerns converge before any residual stakeholder ask."
- P17 | resources/README.md | index | clean | present-tense purpose lines ("Creation guide: `provenance-log.md` — one appended row per task")

### P 21 Match the Harness Surface — technique, resource, readme

- P21 | all 19 | body | clean | no harness return shape or bootstrap path is described. resources/README.md indexes guides; README.md points at workflow-orchestrator / activity-worker / dispatch-activity by link

### P 22 Modular Over Inline — resource

- P22 | all 18 resource files | body | clean | each guide is its own file; resources/README.md links them and does not inline a template

### P 28 Creation Guide for Generated Documents — resource

- P28 | resources/knowledge-base-research.md | ## Planning Artifact | finding B27 | "**Template:**" is bold lead-in, not `## Template`
- P28 | resources/adr-guide.md | ## Template | clean | fenced ADR skeleton plus `## Rules`
- P28 | resources/close-out-guide.md | ## Template | clean | fenced COMPLETE.md skeleton
- P28 | resources/deferred-items-guide.md | ## Template | clean | JSON array skeleton
- P28 | resources/follow-ups-guide.md | ## Template | clean | JSON array skeleton
- P28 | resources/plan-guide.md | ## Template | clean | fenced plan skeleton
- P28 | resources/pr-description.md | ### Template (Initial) / ### Template (Final) | clean | both variants are headed template sections
- P28 | resources/prior-feedback-triage-guide.md | ## Template | clean | JSON register skeleton
- P28 | resources/provenance-log-guide.md | ## Template | clean | table skeleton
- P28 | resources/test-plan-guide.md | ## Templates | clean | "Template (Initial)" and "Template (Final)"
- P28 | resources/requirements-elicitation.md | ## Document Template | clean | fenced requirements skeleton
- P28 | resources/design-framework.md | ## Design Philosophy Artifact Template | clean | fenced design-philosophy skeleton
- P28 | resources/issue-creation.md | ## Issue Template | clean | fenced issue skeleton
- P28 | resources/readme-seed.md | lead | clean | "The fill shape is [Template](/meta/resources/planning-readme.md#template)."
- P28 | resources/architecture-review.md | ## Record Shape | clean | "The record's skeleton … are the [ADR creation guide](adr-guide.md#template)'s"
- P28 | resources/assumption-reconciliation.md | lead | clean | "fill the [assumptions log template](assumptions-review.md#assumptions-log-template)"
- P28 | resources/canonical-home-map.md | ## Map | clean | maps each bare filename to the guide that owns it
- P28 | resources/README.md | Planning artifact to guide map | clean | "Which guide owns each persisted filename's shape."

### P 29 Cite Resource Policy; Do Not Restate It — resource

- P29 | resources/readme-seed.md | ## Row ownership | finding B12 | "Which activity owns which rows, per [row-ownership map](/meta/resources/planning-readme.md#row-ownership-map)." then a full activity-to-row table
- P29 | resources/pr-description.md | ### Content is linked, not inlined | clean | "per `manage-artifacts.single-source-and-link`"
- P29 | resources/architecture-review.md | ## Writing Style | clean | "Tone and attribution: [agent-conduct](/meta/techniques/agent-conduct.md)."
- P29 | resources/readme-seed.md | lead | clean | "Policy lives in [Rules](/meta/resources/planning-readme.md#rules)."
- P29 | other resource files | rules | clean | link-only and line-break policy is cited (`canonical-home-map.link-only-slots`, `markdown-line-breaks`) rather than recopied as a second full policy

### P 30 Resources Stay Abstract — resource

- P30 | resources/readme-seed.md | Progress inventory | finding B4 | "Persistent knowledge under comprehension/"
- P30 | resources/prior-feedback-triage-guide.md | ## Template | clean | example `https://github.com/org/repo/pull/412#discussion_r1` sits inside the fence as a shape illustration
- P30 | other resource files | templates | clean | filenames in guides are the artifact identity the guide owns (`deferred-items.json`, `NNNN-{decision_title}.md`), with run values in placeholders

### P 32 Cite Resources at Section Grain — resource, readme

- P32 | resources/deferred-items-guide.md | ## Canonical Home and ## Rules | finding B8 | bare `[follow-ups](./follow-ups-guide.md)` beside `[follow-ups register](./follow-ups-guide.md#template)`
- P32 | resources/follow-ups-guide.md | ## Canonical Home and ## Rules | finding B9 | bare `[deferred-items](./deferred-items-guide.md)` beside `[deferred-items register](./deferred-items-guide.md#template)`
- P32 | resources/architecture-review.md | ## Record Shape | clean | `[adr-guide.md#template]` and `[adr-guide.md#rules]`
- P32 | resources/design-framework.md | ## Solution Synthesis | clean | `[canonical-home-map.md#map]`, `[plan-guide.md#template]`, `[requirements-elicitation.md#document-template]`
- P32 | resources/readme-seed.md | lead | clean | `[planning-readme.md#rules]` and `[planning-readme.md#template]`
- P32 | README.md | ## Detailed documentation | clean | links are folder READMEs and technique files, not a whole multi-section resource cited for one heading
- P32 | resources/README.md | guide map | clean | section anchors where one heading is meant (`rust-substrate-code-review.md#report-template`, `manual-diff-review.md#file-index-generation`)
- P32 | other resource files | links | clean | no second bare cite of a resource that the same file also anchors

### P 33 Pre-Session Prose Stands Alone — resource

- P33 | all 18 resource files | body | clean | none is the `discover` bootstrap. readme-seed cites planning-readme by link because a session can resolve it

### P 44 A Resource Splits for Section Delivery — resource

- P44 | resources/architecture-review.md | H1 body | finding B22 | opening paragraph before `## Architectural Significance`
- P44 | resources/assumption-reconciliation.md | H1 body | finding B23 | "Log-integration shape for assumption reconciliation. Status vocabulary and row update rules below…"
- P44 | resources/design-framework.md | H1 body | finding B24 | "Systematic solution design: explore the solution space conventional-before-inventive…"
- P44 | resources/issue-creation.md | H1 body | finding B25 | "Reference material for creating a tracker issue. The body template below is the issue's content on any platform…"
- P44 | resources/requirements-elicitation.md | H1 body | finding B26 | "Requirements elicitation discovers **what** the user needs before planning **how** to implement it — a dialogue, not a checklist."
- P44 | resources/knowledge-base-research.md | H1 | clean | first heading is `## Purpose` (the former lead now sits under it)
- P44 | resources/pr-description.md | H1 | clean | first heading is `## When This Guide Applies`
- P44 | resources/adr-guide.md | H1 | clean | first heading is `## Record`
- P44 | resources/plan-guide.md | H1 | clean | first heading is `## Specification`
- P44 | resources/close-out-guide.md | H1 | clean | first heading is `## Template`
- P44 | resources/test-plan-guide.md | H1 | clean | the sentence under the H1 is under 100 characters ("Test plans document *what* will be tested and *why*, with direct traceability to source code."); `## Lifecycle` follows
- P44 | resources/canonical-home-map.md, deferred-items-guide.md, follow-ups-guide.md, prior-feedback-triage-guide.md, provenance-log-guide.md | H1 | clean | first content heading is a `##` with no 100-character lead
- P44 | resources/readme-seed.md | H1 lead | clean | no anchored citer of this file was required for AP-143; the lead is the fill pointer, and section delivery is not shown
- P44 | resources/README.md | index | clean | the index is the H1 body; no `#` citer of this README was part of the judgment

### P 47 A Calibrated Surface Extends by Wrapping — resource

- P47 | all 18 resource files | body | clean | none is a schema or measured prompt being extended inline

### AP-01 no-inline-content — resource

- AP-01 | all 18 resource files | body | clean | templates live in the resource file that owns them; parents link

### AP-04 no-invented-naming — `*`

- AP-04 | resources/README.md | index ids | clean | renames follow the `-guide` siblings (`plan-guide`, `test-plan-guide`, `close-out-guide`, `adr-guide`, `deferred-items-guide`, `follow-ups-guide`, `provenance-log-guide`, `prior-feedback-triage-guide`)
- AP-04 | other 18 files | name | clean | no new vocabulary term outside that `-guide` pattern

### AP-40 readme-orients-not-transcribes — readme

- AP-40 | README.md | ## Workflow Flow | clean | "Activity order and the exits between activities are the `graph` in [workflow.yaml](./workflow.yaml)." The activity table does not list steps, exits, bindings, variables, rules, or estimated times (that table is B1 / AP-107).
- AP-40 | resources/README.md | index | clean | file-grain resource index, not an activity-step transcription and not a loader-path recipe

### AP-41 avoidance-voice-in-definitions — resource, readme

- AP-41 | resources/knowledge-base-research.md | ## Purpose | clean | the diff dropped "instead of reinventing them"; the purpose now states what research surfaces
- AP-41 | resources/requirements-elicitation.md | H1 | clean | "a dialogue, not a checklist" defines the method; it is not a comparison with a retired workflow design
- AP-41 | resources/issue-creation.md | ## What an Issue Holds | clean | "Issues define problems, not solutions" is the operative issue rule
- AP-41 | README.md and the other resource files | body | clean | no passage whose only job is how this design differs from a prior one

### AP-46 no-resource-caller-backlink — resource

- AP-46 | resources/deferred-items-guide.md | ## Rules Created lazily | finding B5 | "Any activity may be the one that defers first, so the register has no owning activity and takes no `artifactPrefix`."
- AP-46 | resources/follow-ups-guide.md | ## Rules Created lazily | finding B6 | "Any activity may be the one that logs first, so the register has no owning activity and takes no `artifactPrefix`."
- AP-46 | resources/adr-guide.md | ## Rules Status opens at Proposed | finding B10 | "Acceptance is recorded later by the finalization step, not asserted here."
- AP-46 | resources/prior-feedback-triage-guide.md | ## Rules The header states the cap | finding B11 | "Whether the rendered Overall Rating holds at the cap is decided against the review's own findings, per [rating-cap-carve-in](../techniques/review-summary.md#rating-cap-carve-in)."
- AP-46 | resources/readme-seed.md | ## Row ownership | finding B12 | activity-number to row-label table under "Which activity owns which rows"
- AP-46 | resources/canonical-home-map.md | ## Map token-usage row | finding B13 | "the close-out, retrospective and session trace link it and restate no figure"
- AP-46 | resources/README.md | manual-diff-review row | finding B14 | "the report renders as a code-review.md section"
- AP-46 | resources/requirements-elicitation.md | ## Canonical Home | finding B15 | "Downstream artifacts link here."
- AP-46 | resources/test-plan-guide.md | ## Rules Promoted naming and storage | finding B16 | "stored alongside the ADR or in the tests documentation folder"
- AP-46 | resources/architecture-review.md | ## Writing Style | clean | agent-conduct and manage-artifacts links cite prose policy, not who binds this guide
- AP-46 | resources/assumption-reconciliation.md | Markdown formatting rule | clean | the manage-artifacts link is `#markdown-line-breaks`, a fill rule, not a binder
- AP-46 | resources/design-framework.md | ## Solution Synthesis | clean | "lands in the homes the canonical-home map names" sends synthesis to those homes
- AP-46 | resources/plan-guide.md, close-out-guide.md, issue-creation.md, knowledge-base-research.md, pr-description.md, provenance-log-guide.md | body | clean | no host-caller, `Outputs:` header, or bind recipe beyond the artifact this guide itself defines

### AP-47 no-redundant-link-label — `*`

- AP-47 | all 19 | links | clean | no `word ([word](url))` pair. readme-seed's old "Planning Folder README Guide ([Template]…)" form is gone; the link text is now "Rules" and "Template"

### AP-50 no-tool-usage-prescription — resource

- AP-50 | all 18 resource files | body | clean | no `get_resource` / `get_technique` / `get_activity` call, argument shape, or session-tool sequence. `cargo check` in plan-guide is a forbidden task shape, not a harness call

### AP-57 escape-literal-dollar — `*`

- AP-57 | all 19 | body | clean | no unescaped `$` outside a fence or code span. Placeholders are `{planning_folder_path}`, `{is_review_mode}`, `{ENG_PLANNING_PATH}`

### AP-58 snake-case-symbols — resource

- AP-58 | resources/canonical-home-map.md | ### link-only-slots | clean | rule slug `link-only-slots` is kebab, not snaked
- AP-58 | resources/deferred-items-guide.md | ## Template | clean | `deferred_at` is snake_case
- AP-58 | resources/readme-seed.md | Mode exclusion | clean | `{is_review_mode}` is snake_case
- AP-58 | resources/pr-description.md | Link Row Forms | clean | `{TARGET_REPO_URL}` is a template placeholder, not a kebab or camel symbol id
- AP-58 | other resource files | ids | clean | resource ids stay kebab (`adr-guide`, `plan-guide`)

### AP-63 backtick-code-tokens — `*`

- AP-63 | resources/readme-seed.md | Progress inventory row 4 | finding B4 | "Persistent knowledge under comprehension/"
- AP-63 | README.md | Appendix | clean | `{planning_folder_path}`, `{adr_dir}`, `.engineering/artifacts/reviews` are in code spans
- AP-63 | resources/README.md | guide map | clean | bare filenames are in code spans (`deferred-items.json`, `NNNN-{decision_title}.md`)
- AP-63 | resources/pr-description.md | Link Row Forms | clean | `.engineering/` and `test-plan.md` are in code spans
- AP-63 | resources/close-out-guide.md | ## Rules | clean | `token-usage.md` and `canonical-home-map.link-only-slots` are in code spans
- AP-63 | resources/plan-guide.md | ## Rules | clean | `cargo check`, `cargo test` are in code spans
- AP-63 | other resource files | body | clean | paths and filenames outside fences are in code spans or are markdown link targets

### AP-71 no-false-resource-delivery / AP-72 complete-bootstrap-path / AP-73 consistent-tool-names / AP-75 describe-tool-value / AP-76 no-redundant-tools

- AP-71 / AP-73 | all met files (19) | body | clean | no tool return payload is described, and no harness tool is named
- AP-72 | all 18 resource files | body | clean | none is an authoritative bootstrap sequence
- AP-75 / AP-76 | all 18 resource files | body | clean | none is an engine, bootstrap, or tool-doc surface

### AP-74 no-duplicated-guidance — resource

- AP-74 | resources/deferred-items-guide.md and resources/follow-ups-guide.md | ## Rules Created lazily, unprefixed | finding B7 | the owning-activity / `artifactPrefix` sentence is the same instruction in both guides
- AP-74 | other resource files | ## Rules | clean | "Point, don't restate" cites `canonical-home-map.link-only-slots` instead of cloning the map's rule text

### AP-80 preserve-readme-content — readme

- AP-80 | README.md | ## Workflow Flow | clean | the removed mermaid is replaced by the graph pointer; the activity table and appendix remain
- AP-80 | resources/README.md | index | clean | the edit retargets guide ids; it does not drop a purpose or a map row

### AP-81 verify-format-literacy — resource

- AP-81 | all 18 resource files | frontmatter | clean | each has `name` and `description`. Version gaps are B28 (convention), not a missing file kind

### AP-84 single-closeout-artifact — resource, readme

- AP-84 | resources/close-out-guide.md | ## Template | clean | one COMPLETE.md skeleton; Lessons and Workflow Retrospective are sections of that one artifact
- AP-84 | README.md | Appendix | clean | artifact locations, not a second close-out of delivered items
- AP-84 | other met files | body | clean | no second terminal footer

### AP-85 link-dont-copy-sections / AP-94 link-only-input-slots — resource

- AP-94 | resources/close-out-guide.md | ## Template Design decisions | finding B30 | the slot is "Context / Decision / Rationale / Alternatives considered" after "recorded nowhere else"
- AP-85 | resources/plan-guide.md | ## Template | clean | Problem & Scope, Assumptions, Success Criteria, and Testing Strategy are link-only lines
- AP-85 | resources/requirements-elicitation.md | ## Document Template Assumptions | clean | "Assumptions surfaced during elicitation: [assumptions log](assumptions-log.md)."
- AP-85 | resources/design-framework.md | ## Design Philosophy Artifact Template | clean | Success Criteria is a link unless the path skips elicitation, which the canonical-home map budgets
- AP-85 | other resource files | templates | clean | sections hold the fact that file homes (issue problem statement, kb findings, ADR decision, test-plan cases)

### AP-86 exception-only-verdict-tables — resource

- AP-86 | resources/close-out-guide.md | ## Template Results | clean | "Rows only for divergences" and the rule "A table appears only when a row diverges from its target."
- AP-86 | other resource files | templates | clean | no steady-state all-pass verdict table

### AP-87 omit-null-sections — resource

- AP-87 | resources/close-out-guide.md | ## Rules | clean | "No \"What Was NOT Implemented: none\" — drop the heading."
- AP-87 | resources/knowledge-base-research.md | ## Template | clean | "Omit this section if none found"
- AP-87 | resources/plan-guide.md | ## Template | clean | "Omit this section if none"
- AP-87 | other resource files | templates | clean | optional sections say to omit when empty; pr-description's `N/A` is a fork-strategy choice, not an empty headed section

### AP-90 no-guide-wrapper-ceremony — resource

- AP-90 | resources/knowledge-base-research.md | ## Purpose | clean | the section names what research surfaces; it does not restate the title and stop
- AP-90 | resources/plan-guide.md | ## Specification | clean | one sentence, then the template and rules
- AP-90 | other resource files | body | clean | no Good/Bad pair, quality checklist, or relationship table wrapped around a template

### AP-91 lifecycle-row-update — resource

- AP-91 | resources/assumption-reconciliation.md | ### Log structure | clean | "reconciliation updates rows in place" and "No standalone per-assumption section"
- AP-91 | resources/provenance-log-guide.md | ## Rules | clean | "One row per task, appended."
- AP-91 | resources/pr-description.md and resources/test-plan-guide.md | Templates | clean | Initial and Final are two fill states of one body, the same pair both guides use

### AP-92 resource-fills-not-does — resource

- AP-92 | resources/test-plan-guide.md | between the two templates | finding B29 | "After implementation, update the plan with: hyperlinked Test IDs pointing to actual test locations, detailed steps reflecting the actual implementation, verified Running Tests commands, and hyperlinked symbols in the Overview."
- AP-92 | resources/design-framework.md | ## Design Framework | clean | the five areas are the methodology this guide exists to hold
- AP-92 | resources/requirements-elicitation.md | ## Question Discipline | clean | probe and scope vocabulary the elicitation document consumes
- AP-92 | resources/readme-seed.md | ## Mode exclusion map | clean | the map is the fill data the seed's description names ("mode-exclusion map")
- AP-92 | other resource files | ## Rules | clean | rules are fill constraints (line budget, omit-empty, link-only), not checkpoint routing

### AP-93 canonical-fact-home — resource

- AP-93 | resources/canonical-home-map.md | ## Map | clean | one row per fact category
- AP-93 | resources/design-framework.md | Problem Statement | clean | the map row budgets "a 2–4 sentence ticket-derived statement" on `design-philosophy.md`
- AP-93 | resources/issue-creation.md | ## Issue Template | clean | the tracker issue is a different artifact from `requirements-elicitation.md`
- AP-93 | other resource files | templates | clean | plan, requirements, kb-research, and test-plan each home the category the map names

### AP-95 enforce-output-discipline — resource

- AP-95 | resources/pr-description.md | ## Rules | clean | conformance criteria are headed so a verify pass can name them; this file does not itself show the absence of a verifier
- AP-95 | resources/canonical-home-map.md, close-out-guide.md, plan-guide.md | ## Rules | clean | the ruleset is present; no finding, because a missing boundary verifier is not in these files

### AP-102 no-technique-resource-dual-home / AP-104 operative-criteria-need-a-home — resource

- AP-102 | all 18 resource files | criteria sections | clean | the criteria live in the resource (architecture significance, issue anti-patterns, pr-description rules, test-plan rules). A parallel copy inside a technique was not in this slice
- AP-104 | all 18 resource files | body | clean | reusable criteria that appear here have this resource as their home

### AP-103 cited-home-owns-claim — resource, readme

- AP-103 | all 19 | cites | clean | no cited-home absence is shown from these files alone. Section cites that were checked as links only: adr-guide `#template` / `#rules`, assumptions-review `#assumptions-log-template`, planning-readme `#rules` / `#template` / `#item-cell`

### AP-106 canon-layer-cites-not-restates — resource, readme

- AP-106 | all 19 | body | clean | none of these files is an upper canon layer re-embedding a Detect or Fix body

### AP-107 bind-site-is-orchestration-truth — readme, resource

- AP-107 | README.md | activity table | finding B1 | the `# | Activity | Description` table from Start Work Package through Complete, including Contract Tests, Implementation Join, Code Review, Structural Analysis, and Test Suite Review
- AP-107 | resources/readme-seed.md | ## Progress inventory | finding B2 | rows 1–27 "in the order the activities execute"
- AP-107 | resources/README.md | index | clean | resource ids, not an activity or step list
- AP-107 | other resource files | body | clean | no ordered activity, step, or technique-pass roster

### AP-115 platform-semantics-in-capability — readme

- AP-115 | README.md | after the resource index | finding B17 | "The cross-cutting `variable-binding` technique applies to every activity. An activity declares its own `techniques[]` block only for an activity-specific strategy technique such as `scatter-gather`"
- AP-115 | resources/README.md | index | clean | no loader-composition lecture

### AP-116 no-template-creation-guide — resource

- AP-116 | resources/knowledge-base-research.md | ## Planning Artifact | finding B27 | `kb-research.md` is mapped to this guide, and the template has no `## Template` heading
- AP-116 | other resource files that own a persisted filename | ## Template or named template heading | clean | adr-guide, close-out-guide, deferred-items-guide, follow-ups-guide, plan-guide, pr-description, prior-feedback-triage-guide, provenance-log-guide, test-plan-guide, requirements-elicitation, design-framework, issue-creation

### AP-118 no-bind-mechanics-as-prose — readme

- AP-118 | README.md | Appendix | clean | paths are `{planning_folder_path}`, `{adr_dir}`, `{comprehension_dir}`; the appendix does not say how to resolve them
- AP-118 | resources/README.md | guide map | clean | the map names the guide, not how a slot is bound

### AP-121 rule-as-protocol-step — resource

- AP-121 | all 18 resource files | ## Rules | clean | rule bullets are standing fill constraints. The sequenced "After implementation, update the plan" paragraph is B29 (AP-92), not a rule heading

### AP-122 prompt-restates-owned-mechanics — resource

- AP-122 | all 18 resource files | body | clean | no bundling budget, begin-beat, `step_techniques`, or yield/replay contract. Line budgets are artifact length caps

### AP-126 cut-comment-jsdoc-verbosity — `*`

- AP-126 | all 19 | body | clean | no code comments. HTML comments in close-out-guide are fill notes inside the template fence ("Canonical home. Caveats about what WAS delivered")

### AP-127 no-dense-prose-after-config-examples — resource, readme

- AP-127 | resources/prior-feedback-triage-guide.md | field table after the JSON fence | clean | the table adds Type and Meaning; it is the field contract
- AP-127 | resources/adr-guide.md | ## Rules after the fence | clean | the rules add invariants (one rejected alternative, status Proposed, line budget)
- AP-127 | other met files | after fences | clean | following prose is rules or a second variant, not a restatement of keys already shown
- AP-127 | README.md | body | clean | no example fence

### AP-128 worktree-root-placeholders — `*`

- AP-128 | all 19 | body | clean | no home directory or machine worktree root. Example hosts are `{jira_host}`, `{JIRA_DOMAIN}`, and `github.com/org/repo` inside a fence

### AP-129 no-parallel-runbook-when-setup-covers-it — resource, readme

- AP-129 | all 19 | body | clean | no clone, install, build, or server-start runbook. test-plan Running Tests is the project suite command inside the template

### AP-131 bag-value-as-literal — resource

- AP-131 | all 18 resource files | body | clean | operative literals are either the artifact's own filename or a shape illustration. No workflow-variable description in these files names the same literal

### AP-133 stale-restatement-after-change — readme, resource

- AP-133 | resources/readme-seed.md | ## Progress inventory and ## Row ownership | finding B3 | inventory and ownership still run Implement then Lean-coding audit, with Code review on `09` and Test suite review / Structural analysis on `10`, and with no Contract Tests or Implementation Join row
- AP-133 | README.md | activity table | clean | the table was edited to add activities 20, 21, 17, 18, and 19 and to retitle 04–07 and 10
- AP-133 | other resource files | body | clean | they do not restate the pre-change activity order ("Post plan summary and assumptions to issue tracker", research as a single gather step)

### AP-135 resource-id-names-its-content — resource

- AP-135 | resources/design-framework.md | name | finding B18 | `design-framework` omits `-guide` / `-template` and holds `## Design Philosophy Artifact Template`
- AP-135 | resources/issue-creation.md | name | finding B19 | `issue-creation` holds `## Issue Template`
- AP-135 | resources/pr-description.md | name | finding B20 | `pr-description` holds `### Template (Initial)`
- AP-135 | resources/requirements-elicitation.md | name | finding B21 | `requirements-elicitation` holds `## Document Template`
- AP-135 | resources/knowledge-base-research.md | name | clean | the template label is `**Template:**` under `## Planning Artifact`, not a `## Template` heading (that gap is B27)
- AP-135 | resources/adr-guide.md, close-out-guide.md, deferred-items-guide.md, follow-ups-guide.md, plan-guide.md, prior-feedback-triage-guide.md, provenance-log-guide.md, test-plan-guide.md | name | clean | the id carries `-guide`
- AP-135 | resources/readme-seed.md | name | clean | `readme-seed` carries `-seed` and has no `## Template`
- AP-135 | resources/architecture-review.md, assumption-reconciliation.md, canonical-home-map.md, README.md | name | clean | no `## Template` heading

### AP-137 overlapping-rule-scopes — resource

- AP-137 | resources/pr-description.md | ## Rules | clean | "Mandated sections present" says the per-section criteria do not substitute for a missing heading
- AP-137 | resources/assumption-reconciliation.md | Resolvability | clean | Partially resolvable says when it reclassifies as not code-resolvable
- AP-137 | other resource files | ## Rules | clean | each bullet has a distinct trigger (link-only, line budget, id allocation, status)

### AP-138 whole-resource-for-one-section — resource

- AP-138 | resources/deferred-items-guide.md | links to follow-ups-guide | finding B8 | bare cite beside `#template`
- AP-138 | resources/follow-ups-guide.md | links to deferred-items-guide | finding B9 | bare cite beside `#template`
- AP-138 | other resource files | links | clean | repeated cites of one resource in the same file are anchored, or the bare cite is the whole guide (the resources README index)

### AP-140 phase-cited-by-ordinal — resource, readme

- AP-140 | all 19 | body | clean | no "step N", "phase N", or "the Nth step". readme-seed "sits third" is the order claim in B2 / B3, not that phrase

### AP-143 framing-outside-any-section — resource

Anchored citers exist for the five findings (section links in techniques and sibling resources). The H1 lead is outside every `##` those citers fetch.

- AP-143 | resources/architecture-review.md | H1 | finding B22 | "Architecture review evaluates significant design decisions against quality attributes, constraints, and trade-offs, and records them as an **Architecture Decision Record (ADR)**…"
- AP-143 | resources/assumption-reconciliation.md | H1 | finding B23 | "Log-integration shape for assumption reconciliation. Status vocabulary and row update rules below; fill the assumptions log template accordingly."
- AP-143 | resources/design-framework.md | H1 | finding B24 | "Systematic solution design: explore the solution space conventional-before-inventive and record trade-offs with rationale."
- AP-143 | resources/issue-creation.md | H1 | finding B25 | "Reference material for creating a tracker issue. The body template below is the issue's content on any platform; a platform guide states only where that content sits in its own fields"
- AP-143 | resources/requirements-elicitation.md | H1 | finding B26 | "Requirements elicitation discovers **what** the user needs before planning **how** to implement it — a dialogue, not a checklist."
- AP-143 | resources/test-plan-guide.md | H1 | clean | opening sentence is under 100 characters
- AP-143 | resources/knowledge-base-research.md | H1 | clean | `## Purpose` is the first heading
- AP-143 | resources/pr-description.md | H1 | clean | `## When This Guide Applies` is the first heading
- AP-143 | other resource files | H1 | clean | no 100-character lead before the first `##`, or (readme-seed, resources/README) no anchored citer established

### AP-149 pre-session-prose-defers-to-the-framework — resource

- AP-149 | all 18 resource files | body | clean | none is the discover bootstrap

### AP-150 instruction-narrates-an-actor — readme

- AP-150 | README.md | ## Orchestration Model | clean | the section names the inherited pattern by link ("workflow-orchestrator / activity-worker via dispatch-activity") and does not assign the reader's duty to a third person
- AP-150 | resources/README.md | index | clean | purpose lines do not narrate a second actor's limits

### AP-153 schema-semantics-restated — resource

- AP-153 | resources/readme-seed.md | Mode key | clean | "`{is_review_mode}` (boolean)" names the seed's mode key; it is not a schema operator roster
- AP-153 | resources/prior-feedback-triage-guide.md | field table | clean | the table is the register's own field contract, not the server schema
- AP-153 | other resource files | body | clean | no schema default, optionality, or operator roster

### AP-155 value-set-in-prose — resource

- AP-155 | resources/readme-seed.md | ## Classifier | clean | `Feature`, `Bug-Fix`, `Enhancement`, `Refactor` and the lifecycle statuses are the seed vocabulary, not a workflow variable that lacks `values`
- AP-155 | resources/provenance-log-guide.md | ## Rules | clean | "Context scope is one of three values" is the column's own set (`repo-only`, `web-retrieval`, `mixed`)
- AP-155 | other resource files | body | clean | no pipe roster of a declared variable that has no `values`

### AP-163 construct-folder-without-a-readme — resource

- AP-163 | resources/README.md | H1 | clean | "# Work Package Resources" sits beside the resource files
- AP-163 | other 17 resource files | folder | clean | the resources folder has that README

### CV Reference Conventions — resource

- CV | resources/adr-guide.md | frontmatter | finding B28 | no `metadata.version`
- CV | resources/prior-feedback-triage-guide.md | frontmatter | finding B28 | no `metadata.version`
- CV | resources/provenance-log-guide.md | frontmatter | finding B28 | no `metadata.version`
- CV | resources/deferred-items-guide.md | frontmatter | clean | `version: 2.0.2` beside `name` and `description`
- CV | resources/close-out-guide.md, plan-guide.md, test-plan-guide.md, follow-ups-guide.md | frontmatter | clean | semantic `version` under `metadata`
- CV | other resource files | frontmatter | clean | kebab-case `.md`, `name` then `description`; older files that already had `version` still have it

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| B1 | Contract | High | AP-107 bind-site-is-orchestration-truth | corpus/work-package/README.md activity table | The table is an ordered roster from Start Work Package through Complete, including the new fan rows. Workflow Flow already says the graph is the order. The table still has to change when the graph changes, and the YAML is not its source. | pre-existing | Delete the activity table. Leave the graph pointer in Workflow Flow |
| B2 | Contract | High | AP-107 bind-site-is-orchestration-truth | corpus/work-package/resources/readme-seed.md ## Progress inventory | "Rows run in the order the activities execute, which is the order a reader watches them complete in." The 27 rows are a hand-written activity order, including "Codebase comprehension therefore sits third". | pre-existing | Generate the progress rows from the workflow graph, or state that the graph is the order and keep the seed to item labels only |
| B3 | Live | High | AP-133 stale-restatement-after-change | corpus/work-package/resources/readme-seed.md ## Progress inventory and ## Row ownership | The workflow README now runs Implement, then Contract Tests (20) and Implementation Join (21), then Lean-Coding Audit, with Code Review (17), Structural Analysis (18), and Test Suite Review (19) as fan branches before Post-Implementation Review. The seed still goes from Implementation to Lean-coding audit, puts Code review on activity 09, and puts Test suite review and Structural analysis on activity 10. It has no Contract Tests or Implementation Join row. The same sentence says those rows are the order the activities execute. | diff | Add the contract-tests and implementation-join rows in run order, and move code review, structural analysis, and test suite review onto activities 17, 18, and 19 |
| B4 | Hygiene | Low | AP-63 backtick-code-tokens | corpus/work-package/resources/readme-seed.md Progress inventory row 4 | "Persistent knowledge under comprehension/" — the path is outside a code span and is not a link target. | pre-existing | Wrap `comprehension/` in a code span |
| B5 | Contract | Medium | AP-46 no-resource-caller-backlink | corpus/work-package/resources/deferred-items-guide.md ## Rules | "Any activity may be the one that defers first, so the register has no owning activity and takes no `artifactPrefix`." | diff | Keep "created as bare `deferred-items.json` when the first deferred item appears". Drop the owning-activity and `artifactPrefix` clause |
| B6 | Contract | Medium | AP-46 no-resource-caller-backlink | corpus/work-package/resources/follow-ups-guide.md ## Rules | "Any activity may be the one that logs first, so the register has no owning activity and takes no `artifactPrefix`." | diff | Keep the bare `follow-ups.json` creation rule. Drop the owning-activity and `artifactPrefix` clause |
| B7 | Hygiene | Low | AP-74 no-duplicated-guidance | corpus/work-package/resources/deferred-items-guide.md and follow-ups-guide.md, Created lazily | The two "Created lazily, unprefixed" bullets differ only by filename and "defers" versus "logs". | diff | State the lazy-creation rule once on the canonical-home map, and leave each guide its filename |
| B8 | Contract | Medium | AP-138 whole-resource-for-one-section | corpus/work-package/resources/deferred-items-guide.md | Bare `[follow-ups](./follow-ups-guide.md)` in Canonical Home, and `[follow-ups register](./follow-ups-guide.md#template)` in Rules. Both are delivered. | diff | Anchor the Canonical Home cite at `#template` or drop it and keep the Rules cite |
| B9 | Contract | Medium | AP-138 whole-resource-for-one-section | corpus/work-package/resources/follow-ups-guide.md | Bare `[deferred-items](./deferred-items-guide.md)` beside `[deferred-items register](./deferred-items-guide.md#template)`. | diff | Anchor the Canonical Home cite at `#template` or drop it and keep the Rules cite |
| B10 | Hygiene | Low | AP-46 no-resource-caller-backlink | corpus/work-package/resources/adr-guide.md ## Rules | "Acceptance is recorded later by the finalization step, not asserted here." | diff | Keep "Status opens at Proposed." Drop the finalization-step clause |
| B11 | Hygiene | Low | AP-46 no-resource-caller-backlink | corpus/work-package/resources/prior-feedback-triage-guide.md ## Rules | "Whether the rendered Overall Rating holds at the cap is decided against the review's own findings, per [rating-cap-carve-in](../techniques/review-summary.md#rating-cap-carve-in)." | diff | Keep the register rule that `rating_cap` is stated once here. Drop the technique link that names who decides the rating |
| B12 | Contract | Medium | AP-46 no-resource-caller-backlink | corpus/work-package/resources/readme-seed.md ## Row ownership | "Which activity owns which rows" plus the activity-number table. The seed already points at planning-readme `#row-ownership-map`. | pre-existing | Delete the table and keep the link to the row-ownership map |
| B13 | Hygiene | Low | AP-46 no-resource-caller-backlink | corpus/work-package/resources/canonical-home-map.md token-usage row | "the close-out, retrospective and session trace link it and restate no figure, so one ledger produces one artifact" | pre-existing | Keep `token-usage.md` as the home. Drop the list of who links it |
| B14 | Hygiene | Low | AP-46 no-resource-caller-backlink | corpus/work-package/resources/README.md manual-diff-review row | "the report renders as a code-review.md section" | pre-existing | Describe the lean-header and block-rationale forms. Leave where the report is rendered to the review resource |
| B15 | Hygiene | Low | AP-46 no-resource-caller-backlink | corpus/work-package/resources/requirements-elicitation.md ## Canonical Home | "Downstream artifacts link here." | pre-existing | Keep "the canonical home for the problem statement, scope, and success criteria." Drop the downstream-artifacts clause |
| B16 | Hygiene | Low | AP-46 no-resource-caller-backlink | corpus/work-package/resources/test-plan-guide.md Promoted naming and storage | "stored alongside the ADR or in the tests documentation folder" | diff | Keep the promoted filename `test-plan-<kebab-case-name>.md`. Drop the storage destination |
| B17 | Hygiene | Low | AP-115 platform-semantics-in-capability | corpus/work-package/README.md after the resource links | "The cross-cutting `variable-binding` technique applies to every activity. An activity declares its own `techniques[]` block only for an activity-specific strategy technique such as `scatter-gather`, on activities that aggregate per-item outputs across iteration." | pre-existing | Cite variable-binding and scatter-gather. Drop the sentence that teaches how `techniques[]` is inherited |
| B18 | Hygiene | Low | AP-135 resource-id-names-its-content | corpus/work-package/resources/design-framework.md `name` | `design-framework` has no `-guide` or `-template`, and the file holds `## Design Philosophy Artifact Template` | pre-existing | Rename the id so it carries `-guide` or `-template`, matching adr-guide and plan-guide |
| B19 | Hygiene | Low | AP-135 resource-id-names-its-content | corpus/work-package/resources/issue-creation.md `name` | `issue-creation` holds `## Issue Template` | pre-existing | Add the kind word the sibling guides use |
| B20 | Hygiene | Low | AP-135 resource-id-names-its-content | corpus/work-package/resources/pr-description.md `name` | `pr-description` holds `### Template (Initial)` and `### Template (Final)` | pre-existing | Add the kind word the sibling guides use |
| B21 | Hygiene | Low | AP-135 resource-id-names-its-content | corpus/work-package/resources/requirements-elicitation.md `name` | `requirements-elicitation` holds `## Document Template` | pre-existing | Add the kind word the sibling guides use |
| B22 | Contract | Medium | AP-143 framing-outside-any-section | corpus/work-package/resources/architecture-review.md H1 | The paragraph under the H1, before `## Architectural Significance`, is longer than 100 characters. Section citers use `#architectural-significance` and `#decision-making-discipline`. | pre-existing | Move that paragraph under a `##` heading those citers can fetch, or into the first section |
| B23 | Contract | Medium | AP-143 framing-outside-any-section | corpus/work-package/resources/assumption-reconciliation.md H1 | "Log-integration shape for assumption reconciliation. Status vocabulary and row update rules below; fill the assumptions log template accordingly." sits before `## Resolvability Classification`. Citers use `#resolvability-classification` and `#integration-with-assumptions-log`. | pre-existing | Move the lead under a `##` heading |
| B24 | Contract | Medium | AP-143 framing-outside-any-section | corpus/work-package/resources/design-framework.md H1 | "Systematic solution design: explore the solution space conventional-before-inventive and record trade-offs with rationale." sits before `## Design Framework`. Citers use `#design-framework-trizics-approach`, `#problem-definition-checklist`, and `#design-philosophy-artifact-template`. | pre-existing | Move the lead under the first `##` |
| B25 | Contract | Medium | AP-143 framing-outside-any-section | corpus/work-package/resources/issue-creation.md H1 | "Reference material for creating a tracker issue. The body template below is the issue's content on any platform…" sits before `## What an Issue Holds`. Citers use `#issue-template`, `#section-rules`, and `#anti-patterns`. | pre-existing | Move the platform-neutral lead under `## What an Issue Holds` or its own `##` |
| B26 | Contract | Medium | AP-143 framing-outside-any-section | corpus/work-package/resources/requirements-elicitation.md H1 | "Requirements elicitation discovers **what** the user needs before planning **how** to implement it — a dialogue, not a checklist." sits before `## Canonical Home`. Citers use `#document-template`, `#question-domain-reference`, and `#question-discipline`. | pre-existing | Move the lead under a `##` heading |
| B27 | Hygiene | Low | P 28 Creation Guide for Generated Documents | corpus/work-package/resources/knowledge-base-research.md ## Planning Artifact | The kb-research guide's skeleton is a bold `**Template:**` under `## Planning Artifact`, not a `## Template` section. | pre-existing | Head the skeleton `## Template` |
| B28 | Hygiene | Low | CV Reference Conventions | corpus/work-package/resources/adr-guide.md, prior-feedback-triage-guide.md, provenance-log-guide.md frontmatter | Sibling creation guides in this folder carry `metadata.version` (`close-out-guide` 2.2.3, `deferred-items-guide` 2.0.2, `plan-guide` 1.4.1). These three have `metadata.order` and no version. | diff | Add a semantic `metadata.version` |
| B29 | Contract | Medium | AP-92 resource-fills-not-does | corpus/work-package/resources/test-plan-guide.md between the templates | "After implementation, update the plan with: hyperlinked Test IDs pointing to actual test locations, detailed steps reflecting the actual implementation, verified Running Tests commands, and hyperlinked symbols in the Overview." | diff | Leave the two templates and the Rules. Move the after-implementation update sequence to the technique that finalizes the plan |
| B30 | Contract | Medium | AP-94 link-only-input-slots | corpus/work-package/resources/close-out-guide.md ## Template Design decisions | "List here ONLY decisions made during implementation that are recorded nowhere else, each in the form Context / Decision / Rationale / Alternatives considered." The slot is a full decision writeup. The plan and the ADR already home decisions. | diff | Make the slot one link line, the same shape as the plan and assumptions links above it |
