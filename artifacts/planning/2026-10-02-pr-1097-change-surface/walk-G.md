# Walk G

Tree: `.worktrees/workflow/i10-integrate`. Base: `.worktrees/workflow/pr-1097-base` (`b57da76ae3b8b9947799860944c1a6055c062cfe`).

Slice: touched paths outside `corpus/work-package/` and `corpus/specimens/`, plus two closure techniques. Kinds: `workflow.yaml` workflow, activities yaml activity, routines yaml routine, techniques md technique, `README.md` readme, resources md resource.

Closure: `corpus/workflow-authoring/techniques/yaml-authoring.md` and `corpus/workflow-design/techniques/yaml-authoring.md` join because they cite `review-assumptions::reconcile`, whose Inputs/Outputs changed. Both files are byte-identical to the base. The cite is a qualified-spelling example inside `a-foreign-technique-is-qualified` (`gitnexus::analyze`, `review-assumptions::reconcile`), not an Apply and not a restatement of that op's slots. No finding on either file exists only because of that cite.

## Files read

23, each whole.

- `corpus/codebase-wiki/techniques/ingest.md` — technique — touched
- `corpus/codebase-wiki/techniques/query.md` — technique — touched
- `corpus/meta/routines/activity-loop.yaml` — routine — touched
- `corpus/midnight-system-review/activities/02-area-derivation.yaml` — activity — touched
- `corpus/plain-language/activities/04-evaluate.yaml` — activity — touched
- `corpus/ponytail/activities/02-apply-ladder.yaml` — activity — touched
- `corpus/prism-evaluate/activities/05-resolution-dialogue.yaml` — activity — touched
- `corpus/remediate-vuln/README.md` — readme — touched
- `corpus/remediate-vuln/activities/01-start.yaml` — activity — touched
- `corpus/remediate-vuln/workflow.yaml` — workflow — touched
- `corpus/support/gitnexus/routines/api-surface-review.yaml` — routine — touched
- `corpus/support/gitnexus/routines/area-comprehension.yaml` — routine — touched
- `corpus/support/gitnexus/routines/doc-reference-surface.yaml` — routine — touched
- `corpus/support/gitnexus/routines/graph-for-tree.yaml` — routine — touched
- `corpus/support/gitnexus/routines/index-refresh.yaml` — routine — touched
- `corpus/workflow-authoring/activities/06-scope-and-draft.yaml` — activity — touched
- `corpus/workflow-authoring/activities/08-quality-review.yaml` — activity — touched
- `corpus/workflow-authoring/techniques/yaml-authoring.md` — technique — closure
- `corpus/workflow-design/activities/03-requirements-refinement.yaml` — activity — touched
- `corpus/workflow-design/activities/09-validate-and-commit.yaml` — activity — touched
- `corpus/workflow-design/resources/follow-ups.md` — resource — touched
- `corpus/workflow-design/techniques/README.md` — readme — touched
- `corpus/workflow-design/techniques/yaml-authoring.md` — technique — closure

## Unread

0.

## Not applicable

None. Every unit in `units.tsv` Fires-on `*` or on a kind this slice holds (`workflow`, `activity`, `technique`, `routine`, `readme`, `resource`), so none is excluded.

## Evidence

Entry-major. One line per meeting unit-file: `entry | file | field | clean or finding | quote`. A `*` unit meets all 23 files; the line names the file. Field `—` means the unit meets the file and the file has no construct of that field.

Session-conduct units (P-02, P-03, P-04, P-08, P-23, AP-03, AP-04, AP-06, AP-07, AP-08, AP-77, AP-78, AP-83) meet every file and have no definition construct. Each of those 13 × 23 pairs is **clean**. Quote for each: no scope manifest, clarifying question, done-claim, invented id introduced as new vocabulary, or recommendation left unimplemented — the file is a definition, not a session transcript.

### P-01. Workflows Ossify Patterns

Meets workflow, activity, technique, routine (20 files).

- P-01 | `ingest.md` | capability | clean | "This is the technique other workflows bind as `codebase-wiki/ingest`"
- P-01 | `query.md` | capability | clean | "the technique other workflows bind as `codebase-wiki/query`"
- P-01 | `activity-loop.yaml` | steps | clean | `loopType: while` over `current_activity` until null
- P-01 | `02-area-derivation.yaml` | steps | clean | derive, then `doWhile` on `plan_approved`
- P-01 | `04-evaluate.yaml` | steps | clean | `doWhile` on `needs_revision`, then checklist
- P-01 | `02-apply-ladder.yaml` | steps | clean | `doWhile` on `safety_floor_cleared`
- P-01 | `05-resolution-dialogue.yaml` | steps | clean | `forEach` finding, nested `doWhile` on `discuss`
- P-01 | `01-start.yaml` | steps | clean | own security setup, then borrowed techniques
- P-01 | `remediate-vuln/workflow.yaml` | graph | clean | borrowed `work-package/` activities plus own `start`
- P-01 | five `support/gitnexus/routines/*.yaml` | steps | clean | each is a named run of gitnexus produce paths
- P-01 | `06-scope-and-draft.yaml` | steps | clean | manifest gate, then `forEach` draft
- P-01 | `08-quality-review.yaml` | steps | clean | `forEach` over `target_workflow_ids`
- P-01 | both `yaml-authoring.md` | capability | clean | one authoring product each; closure cite is a spelling example, not a second graph
- P-01 | `03-requirements-refinement.yaml` | steps | clean | dimension `forEach`, then assumption `doWhile`
- P-01 | `09-validate-and-commit.yaml` | steps | clean | validate, scope, commit, PR

### P-05. Maximize Schema Expressiveness

Meets workflow, activity, technique, routine (20 files).

- P-05 | `01-start.yaml` | steps | **finding G1** | `sec-vuln-url-input` option `provided` has no `recordReply`; `record-sec-vuln-url` is `set` `target: sec_vuln_url` with `message` and no `value`. Same shape at `private-fork-url-input` / `record-private-fork-url` and `short-id-input` / `record-short-id`.
- P-05 | `04-evaluate.yaml` | steps | **finding G2** | `count-revision-round` `set` `target: revision_round` `message: Increment the revision round by one.` and no `value`
- P-05 | `06-scope-and-draft.yaml` | steps | **finding G3** | `bump-scope-round` `set` `target: scope_round` `message: The scope-confirmation round this gate presents, one higher than the rounds already answered.` and no `value`
- P-05 | `index-refresh.yaml` | inputs | **finding G4** | `repo_name` "Unbound, the host variable of the same name supplies it; the empty default leaves a host with no such variable to the single-graph omission the gitnexus techniques already allow."
- P-05 | `ingest.md` | protocol | clean | phases are `### N. Title`; new cross-link args are italic names and `{subject_slugs}`
- P-05 | `query.md` | protocol | clean | persist phase binds `{$page_filename}` then `{page_filename}`
- P-05 | `activity-loop.yaml` | steps | clean | `set` targets that move the pointer carry `value:`
- P-05 | `02-area-derivation.yaml` | steps | clean | `plan_approved` is `setVariable` on the approve option
- P-05 | `02-apply-ladder.yaml` | steps | clean | `safety_floor_cleared` is `setVariable` on each option
- P-05 | `05-resolution-dialogue.yaml` | steps | clean | dispositions are `setVariable`; `accepted_mitigations` set carries `value: "{finding_decision}"`
- P-05 | `remediate-vuln/workflow.yaml` | variables | clean | `issue_platform` carries `values:`; `stealth_mode` is a boolean with `defaultValue: true`
- P-05 | `api-surface-review.yaml` | steps | clean | `repo_name: repo_name` on `route-map` and `shape-check`
- P-05 | `area-comprehension.yaml` | steps | clean | `symbol_contexts` / `flow_traces` sets are forEach accumulators (`AP-33` do-not-flag a); not scored here as a missing `value`
- P-05 | `doc-reference-surface.yaml` | steps | clean | `value: "[{referencing_files}, {file_referencers}]"`
- P-05 | `graph-for-tree.yaml` | steps | clean | `when: "!repo_name"` on build and the second resolve
- P-05 | `08-quality-review.yaml` | steps | clean | register append is a technique-step set, not a valueless control set
- P-05 | both `yaml-authoring.md` | protocol | clean | schema read is `workflow-server://schemas`; closure cite does not restate reconcile's slots
- P-05 | `03-requirements-refinement.yaml` | steps | clean | `design_context` option uses `recordReply: design_context`
- P-05 | `09-validate-and-commit.yaml` | steps | clean | gates are `exit:` on the option, not prose

### P-06. One Authoritative Home

Meets all 23.

- P-06 | `ingest.md` | outputs | **finding G5** | `page_slugs` "used by `maintain-index-log`"; `ingest_summary` "Consumed by `maintain-index-log` as its `operation_summary`"
- P-06 | `remediate-vuln/README.md` | body | **finding G6** | mermaid `prism-decision --> post-impl-review` after the graph inserted the review fan
- P-06 | `query.md` | outputs | clean | answer, gaps, and `answer_page` each stated once
- P-06 | `follow-ups.md` | body | clean | "The register is the one canonical home for **in-task** follow-ups"
- P-06 | `workflow-design/techniques/README.md` | body | clean | "`collect`, `record` for the design-assumption lifecycle" — `interview` is gone
- P-06 | `03-requirements-refinement.yaml` | outcome | clean | "while-loop" is gone from the outcome
- P-06 | `09-validate-and-commit.yaml` | steps | clean | assumptions-log path link is gone with `assumptions_log_path`
- P-06 | remaining 17 files | description or capability | clean | one statement of the construct; no second copy of a fact this diff moved

### P-07. Convention Over Invention

Meets all 23. All **clean**. Quote: ids and step kinds match siblings (`recordReply`, `setVariable`, `doWhile`, `forEach`, qualified `gitnexus::` / `work-package::`). No new id pattern in the diff.

### P-09. Encode Constraints as Structure

Meets activity steps/exits, workflow rules, technique rules (14 files: 9 activities, 1 workflow, 4 techniques).

- P-09 | `01-start.yaml` | steps | **finding G1** | URL, fork URL, and slug are asked in prose and never written by `recordReply` or `value`
- P-09 | `04-evaluate.yaml` | steps | **finding G2** | round increment is a message, not a value
- P-09 | `06-scope-and-draft.yaml` | steps | **finding G3** | scope round increment is a message, not a value
- P-09 | `remediate-vuln/workflow.yaml` | rules | clean | isolation rules sit beside `stealth_mode`, `base_remote`, `push_remote`
- P-09 | `02-area-derivation.yaml` | exits | clean | single `done`; approval is `plan_approved`
- P-09 | `02-apply-ladder.yaml` | exits | clean | `when: safety_floor_cleared == true` and default breached
- P-09 | `05-resolution-dialogue.yaml` | exits | clean | `when: mitigations_apply_requested == true`
- P-09 | `04-evaluate.yaml` | exits | clean | `revise-again` is `exit:` on the option
- P-09 | `08-quality-review.yaml` | exits | clean | `done` only; no prose branch
- P-09 | `03-requirements-refinement.yaml` | exits | clean | `update` when, `refine` immediate, `create` default
- P-09 | `09-validate-and-commit.yaml` | exits | clean | `return-to-draft` and `correct-assumptions` are option exits
- P-09 | `ingest.md` | rules | clean | four cross-cutting rules, not a substitute for the phases
- P-09 | `query.md` | rules | clean | navigate, cite, surface disagreement
- P-09 | both `yaml-authoring.md` | rules | clean | authoring invariants; closure cite names a spelling, not a gate

### P-10. Non-Destructive Updates

Meets all 23. All **clean**. Quote: README overview shrink and outcome edits name the surviving behaviour (private remote, assumptions converge, `collect`/`record`). No silent deletion of a gate in this slice.

### P-11. Complete Documentation Structure

Meets readme (2).

- P-11 | `remediate-vuln/README.md` | body | clean | Overview, Activities, mermaid, Techniques
- P-11 | `workflow-design/techniques/README.md` | body | clean | orients the technique folder and points at `TECHNIQUE.md`

### P-12. Output Economy

Meets technique outputs, activity steps, resource (14 files).

- P-12 | `02-area-derivation.yaml` | steps | **finding G7** | "recorded in investigation-plan.md" with no path link
- P-12 | `ingest.md` | outputs | clean | pages, slugs, cascaded pages, summary — one fact each; audience `human` on `wiki_pages`
- P-12 | `query.md` | outputs | clean | `wiki_answer` states the answer; `answer_page` is conditional
- P-12 | `follow-ups.md` | template | clean | one row per item
- P-12 | remaining activity steps | message | clean | checkpoint messages that name files use `[label]({path})`

### P-13. Separate Contract from Procedure

Meets the 4 techniques.

- P-13 | `ingest.md` | inputs | **finding G5** | `target_area` "(the entry the build loop is iterating, bound to `target_area` each pass)"
- P-13 | `query.md` | inputs | clean | `wiki_question` is the question; `persist_answer` is whether to persist, with `default` `false`
- P-13 | `workflow-authoring/.../yaml-authoring.md` | inputs | clean | `current_file` "full path, action and kind"; `schema_conforms` is the boolean
- P-13 | `workflow-design/.../yaml-authoring.md` | inputs | clean | `schema_type` "one of `workflow`, `activity` or `technique`"

### P-14. Single Source of Truth

Meets workflow variables, activity steps, technique inputs (14 files).

- P-14 | nine activities | variables | clean | diff drops `reads` entries that are also `writes` (`plan_approved`, `needs_revision`, `safety_floor_cleared`, `finding_disposition`, `schema_conforms`)
- P-14 | `remediate-vuln/workflow.yaml` | variables | clean | `assumption_outcome` is gone; fan containers are one slot each
- P-14 | 4 techniques | inputs | clean | one id per slot; no second name for the same value

### P-15. Phase by Sequenced Outcome

Meets 4 techniques' protocol.

- P-15 | `ingest.md` | protocol | **finding G8** | `### 2. Read Raw Sources` chains resolve, verify, query, and context as ordered outcomes under one heading
- P-15 | `query.md` | protocol | clean | four phases; persist is one outcome (hold, then write)
- P-15 | both `yaml-authoring.md` | protocol | clean | each `### N.` is one authoring outcome

### P-16. Distinguish Designators from Parameters

Meets 4 techniques' protocol.

- P-16 | `ingest.md` | protocol | **finding G9** | phase 6 "binding `bare_filename` … `artifact_content` … `target_dir`" — argument names in backticks
- P-16 | `ingest.md` | protocol | clean on the new Apply | `(*subject_pages*=`{subject_slugs}`, *related_pages*=`{related_slugs}`)`
- P-16 | `query.md` | protocol | clean | `(*bare_filename*=`{page_filename}`, *artifact_content*=`{answer_body}`, *target_dir*=`{wiki_path}`)`
- P-16 | both `yaml-authoring.md` | protocol | clean | `{current_file}`, `{schema_type}`, `{yaml_file}` are declared ids; closure cite is not an argument list

### P-17. Document in Positive Present

Meets workflow description, activity description/outcome/options, readme (12 files).

- P-17 | `ingest.md` | — | clean | capability is not this unit's field; see AP-41
- P-17 | `04-evaluate.yaml` | outcome | **finding G10** | "the only way to know it works rather than assume it"; "rather than stopping at the first draft"
- P-17 | `02-apply-ladder.yaml` | outcome | **finding G10** | "No change reaches the over-engineering review without having cleared the floor"
- P-17 | `05-resolution-dialogue.yaml` | outcome | **finding G10** | "preserving the nuance that batch review would lose"
- P-17 | `remediate-vuln/workflow.yaml` | description | clean | "Remediate security vulnerabilities on the private remote."
- P-17 | `remediate-vuln/README.md` | overview | clean | private `security` remote; the old no-disclosure essay is gone
- P-17 | `01-start.yaml` | outcome | clean | "The run uses the private remote and the private planning folder"
- P-17 | `workflow-design/techniques/README.md` | body | clean | present-tense orientation
- P-17 | remaining activity descriptions and option text | description | clean | options state the choice ("Approve the investigation plan", "Safety floor cleared")

### P-18. Prefer Shared Capability

Meets activity steps/techniques, workflow techniques, technique (14 files). All **clean**. Quote: file writes bind `work-package::manage-artifacts::write-artifact`; gitnexus routines bind `gitnexus::` ops; remediate-vuln borrows work-package activities. Local techniques are the security setup and the design-local ops.

### P-19. Name Symbols Affirmatively

Meets technique I/O and rules, workflow variables, activity variables (14 files). All **clean**. Quote: booleans are predicates (`plan_approved`, `schema_conforms`, `has_open_assumptions`, `index_stale`); collections are plural (`wiki_pages`, `manifest_entries`, `evaluation_findings`). No `not_` / `_flag` / `_status` / `_check` id.

### P-20. Keep Orchestration in Structure

Meets activity steps/exits, workflow graph, technique capability/protocol/rules (14 files).

- P-20 | `ingest.md` | protocol | **finding G8** | Applies are the activity's step list written inside the technique
- P-20 | `query.md` | protocol | **finding G8** | `write-artifact` and `maintain-index-log` are invoked from Protocol
- P-20 | activities and `remediate-vuln/workflow.yaml` | steps or graph | clean | exits and `when` carry the route
- P-20 | both `yaml-authoring.md` | protocol | clean | no activity, checkpoint, or exit named as the technique's own gate

### P-21. Match the Harness Surface

Meets technique, resource, readme (8 files). All **clean**. Quote: `Apply` uses canonical `[group](path)::[op](path)`; `get_technique` is not renamed; `workflow-server://schemas` is the schema read. No false delivery claim in this slice.

### P-22. Modular Over Inline

Meets workflow, activity, technique, resource, routine (21 files; not the two readmes). All **clean**. Quote: each construct is its own file; parents reference by id or link. No inlined activity or technique body.

### P-24. Keep Session Interaction in Activities

Meets technique and activity steps (13 files). All **clean**. Quote: checkpoints and `action: message` sit on activities. Technique protocol does not present to the user. `query.md` "surface the disagreement" is the answer content, not a session channel.

### P-25. Bind Sibling Techniques as Steps

Meets activity steps and technique protocol (13 files).

- P-25 | `ingest.md` | protocol | **finding G8** | `Apply` of resolve-graph, verify-index, query, context, cross-link, write-artifact
- P-25 | `query.md` | protocol | **finding G8** | `Apply` of write-artifact and maintain-index-log
- P-25 | activity steps | steps | clean | each sibling technique is its own step
- P-25 | both `yaml-authoring.md` | protocol | clean | no `Apply` of a sibling; closure cite does not invoke reconcile

### P-26. A Technique Is a Reading

Meets technique capability/protocol/inputs and activity steps (13 files). All **clean** beside G8, which is the pass-orchestration entry rather than an empty tool leaflet. Quote: ingest classifies, scores, and cascades; query synthesizes and flags disagreement. yaml-authoring validates and corrects against a reference file.

### P-27. State Contract Contribution

Meets the 4 techniques. All **clean**. Quote: none is a container `TECHNIQUE.md`. Capability names the product ("Ingest a scoped source area", "Schema-valid definition file authored from a manifest entry").

### P-28. Creation Guide for Generated Documents

Meets resource and technique protocol (5 files).

- P-28 | `ingest.md` | protocol | clean | "[page-templates](../resources/page-templates.md)" and anchored wiki-format sections
- P-28 | `query.md` | protocol | clean | wikilink conventions cited with `#wikilink-conventions`
- P-28 | `follow-ups.md` | template | clean | `## Template` and `## Rules`
- P-28 | both `yaml-authoring.md` | protocol | clean | they author definition YAML, not a session planning artifact; design file cites yaml-style

### P-29. Cite Resource Policy; Do Not Restate It

Meets resource and technique protocol (5 files).

- P-29 | `workflow-design/.../yaml-authoring.md` | protocol | clean | phase 4 cites Document in Positive Present with `#17-document-in-positive-present` and does not paste the principle body
- P-29 | `ingest.md` | protocol | clean | page-type, frontmatter, and confidence are anchored cites
- P-29 | `query.md` | protocol | clean | one anchored cite
- P-29 | `follow-ups.md` | rules | clean | the rules are the guide's own fill rules
- P-29 | `workflow-authoring/.../yaml-authoring.md` | protocol | clean | cites the inventory and yaml-style rather than restating them

### P-30. Resources Stay Abstract

Meets resource, technique, activity (14 files).

- P-30 | `follow-ups.md` | template | clean | placeholders `[activity or checkpoint]`, `{workflow-id}`, `YYYY-MM-DD`
- P-30 | techniques and activities | body | clean | concrete filenames sit on the technique or the step (`evaluation-report.md`, `scope-manifest.md`), not in the guide as a bound instance

### P-31. Isolate Conditional Branches as Notes

Meets 4 techniques' protocol.

- P-31 | `query.md` | protocol | **finding G11** | "When `{persist_answer}` is true, hold the page file as `{$page_filename}`"
- P-31 | `ingest.md` | protocol | **finding G11** | "If `{task_knowledge}` was supplied, read it"; "When a claim contradicts"; "When augmenting"
- P-31 | both `yaml-authoring.md` | protocol | clean | "When `{selected_findings}` is present" is the whole planning bullet's condition; design file's failure bullets are "Where the parser rejects" — same shape, recorded under G11 only for the wiki techniques where the condition is a branch beside an unconditional read

### P-32. Cite Resources at Section Grain

Meets technique, activity, resource, readme (16 files). All **clean**. Quote: wiki-format and citation-conventions cites carry `#` anchors. Whole-file cites (`page-templates`, schema-construct-inventory, convention-conformance) do not sit beside a phrase that matches one heading. `follow-ups.md` points at `deferred-items-guide` as the other register, not one section of it.

### P-33. Pre-Session Prose Stands Alone

Meets resource (1).

- P-33 | `follow-ups.md` | body | clean | not the discover bootstrap; the template and rules stand in the file

### P-34. Edit the Owner

Meets all 23.

- P-34 | `remediate-vuln/README.md` | body | **finding G6** | the graph gained the review fan; the README mermaid still draws the old edge
- P-34 | `03-requirements-refinement.yaml` | outcome | clean | outcome no longer says "while-loop" after the loop became `doWhile`
- P-34 | `workflow-design/techniques/README.md` | body | clean | `interview` dropped from the review-assumptions row
- P-34 | `09-validate-and-commit.yaml` | steps | clean | message no longer links `{assumptions_log_path}`
- P-34 | remaining files | body | clean | prose that this diff touched was updated with the bind or the removal

### P-35. Prefer Removing the Thing That Needs a Prohibition

Meets all 23. All **clean**. Quote: remediate-vuln overview no longer narrates a parallel disclosure path; start outcome no longer lists disabled public paths. Rules that remain name the private remote.

### P-36. A Technique Names Only What Its Reader Holds

Meets 4 techniques. All **clean**. Quote: `gitnexus.index-freshness-first` and `gitnexus.edges-the-parser-cannot-see` are dotted addresses. `review-assumptions::reconcile` appears only as a spelling example in both yaml-authoring rules; the reader does not need reconcile's Inputs to apply the rule. Not a finding from the closure cite.

### P-37. An I/O Contract Names the Value

Meets 4 techniques' inputs and outputs.

- P-37 | `ingest.md` | inputs, outputs | **finding G5** | build loop; `maintain-index-log` as consumer and as `operation_summary`
- P-37 | `query.md` | inputs, outputs | clean | question, whether to persist, answer, gaps, slug
- P-37 | both `yaml-authoring.md` | inputs, outputs | clean | kind, path, conformance boolean; no caller workflow named in the slot

### P-38. A Relocation Records the Outcome It Keeps

Meets activity steps/exits, technique, workflow rules, technique rules (14 files). All **clean**. Quote: `03-requirements-refinement.yaml` dropped the standalone `reconcile-assumptions` step and kept `reconcile-design-assumptions` inside `assumption-reconciliation`; the outcome still says open judgements remain in the assumptions log. Fan outputs on remediate-vuln are declared on the variables the new graph edges read.

### P-39. A Phase Heading Names the Outcome

Meets 4 techniques' protocol. All **clean**. Quote: headings are two to four words in Title Case ("Read Raw Sources", "Persist If Requested", "Resolve Validation Failures").

### P-40. Fan-Out Lives at the Layer That Runs the Work

Meets workflow graph, activity steps, technique (14 files).

- P-40 | `remediate-vuln/workflow.yaml` | graph | clean | `prism-decision.done` is the three review activities; each returns to `post-impl-review`
- P-40 | `requirements-elicitation` and `codebase-comprehension` edges | graph | clean | research and implementation-analysis are graph destinations
- P-40 | activity `forEach` steps | steps | clean | findings, files, dimensions, and targets are loop steps
- P-40 | techniques | protocol | clean | no `Task` / spawn recipe in these four files

### P-41. A Phase States Answers the Tool Has Returned

Meets 4 techniques' protocol. All **clean**. Quote: ingest's empty `{repo_name}` branch says the tree carries no index; verify-index's `{index_stale}` is read as the graph built before the baseline. No invented tool field.

### P-42. A Routine Holds the Codified Path

Meets routine, technique, activity (19 files). All **clean**. Quote: the six routines are the codified gitnexus and activity-loop paths. The four techniques still hold the reading (classify, synthesize, validate). Activities bind those routines or techniques as steps.

### P-43. A Workflow Borrows Activities

Meets workflow activities (1).

- P-43 | `remediate-vuln/workflow.yaml` | activities | clean | `activities:` lists `work-package/NN-….yaml`; `initialActivity: start` is the local file

### P-44. A Resource Splits for Section Delivery

Meets resource (1).

- P-44 | `follow-ups.md` | body | clean | one guide; no second file for one section

### P-45. A Rule States One Invariant

Meets technique rules (4). All **clean**. Quote: each `###` slug is one sentence-level invariant (`typed-pages-only`, `navigate-do-not-scan`, `smallest-edit-that-resolves`, `block-style-arrays`).

### P-46. A Consumer Binds the Contract

Meets technique, activity, workflow (14 files). All **clean**. Quote: new binds pass `planning_folder_path`, `repo_name`, `subject_pages` / `related_pages`, and write-artifact's `bare_filename` / `artifact_content` / `target_dir`. Bare `technique:` strings are same-name. The yaml-authoring closure cite does not bind reconcile's new inputs.

### P-47. A Calibrated Surface Extends by Wrapping

Meets technique and resource (5). All **clean**. Quote: these files are not a schema or a measured prompt being extended by a second copy.

### AP-01. no-inline-content

Meets activity, technique, resource (14). All **clean**. Quote: no activity, technique, or resource body pasted into a parent file.

### AP-02. schema-is-constraint

Meets workflow, activity, technique (14). All **clean**. Quote: no schema or escape hatch invented in these files.

### AP-05. atomic-checkpoints

Meets activity steps (9). All **clean**. Quote: each checkpoint is one decision (plan, safety floor, finding disposition, URL, manifest, preservation, spec, validation, scope, commit).

### AP-09. checkpoint-not-prose

Meets activity description/outcome and technique protocol (13). All **clean**. Quote: asks sit on `kind: checkpoint`, not in a description with no gate.

### AP-10. loop-not-prose

Meets activity description/steps and technique protocol (13). All **clean**. Quote: repeated work is `loopType: doWhile` or `forEach` with `over` / `continueWhile`.

### AP-11. decision-not-prose

Meets activity description/exits and workflow graph (10). All **clean**. Quote: branches named in prose are exits on the activity and edges on `remediate-vuln/workflow.yaml`.

### AP-12. artifact-not-buried

Meets activity description and technique capability/protocol/outputs (13).

- AP-12 | `ingest.md` | outputs | clean | `#### artifact` `` `{$page_slug}.md` `` and `#### audience` `human` on `wiki_pages`
- AP-12 | `query.md` | outputs | clean | no file claimed; `answer_page` is a slug
- AP-12 | both `yaml-authoring.md` | outputs | clean | `yaml_file` / `drafted_files` are the authored files; no buried filename
- AP-12 | activity descriptions | description | clean | files are step outputs (`evaluation_report_path`, `scope_manifest_path`), not description-only

### AP-13. variable-for-approval

Meets activity description/steps/variables and workflow variables (10). All **clean** as this entry: approval booleans are `setVariable` (`plan_approved`, `scope_manifest_confirmed`, `safety_floor_cleared`). The URL gates are G1 (the value is not an approval flag).

### AP-14. mode-as-state

Meets rules, variables, steps, exits (10). All **clean**. Quote: `stealth_mode`, `operation_type`, `is_review_mode` are variables; skips are `when: operation_type != 'review'`.

### AP-15. procedure-in-protocol

Meets activity steps (9). All **clean**. Quote: no step `description` holds a numbered procedure. Bound steps omit `description`.

### AP-16. technique-inputs-declared

Meets 4 techniques.

- AP-16 | `ingest.md` | protocol | **finding G12** | `{wiki_path}` and `{raw_baseline_commit}` are used and are not Inputs
- AP-16 | `query.md` | protocol | **finding G12** | `{wiki_path}` is passed as `target_dir` and is not an Input
- AP-16 | both `yaml-authoring.md` | protocol | clean | every braced id is declared (`current_file`, `selected_findings`, `reference_file`, `yaml_file`, `schema_conforms`, `schema_type`, `drafted_files`)

### AP-17. bound-step-no-description

Meets activity steps (9). All **clean**. Quote: `kind: technique` steps carry `id` and `technique` only, plus `inputs` / `outputs` / `when` / `actions` where they deviate.

### AP-18. no-monolith-masking-steps

Meets activity steps (9). All **clean**. Quote: repeated technique ids are different ops or the same op with a different `when` (`yaml-authoring` on author vs restore).

### AP-19. no-rule-protocol-restatement

Meets rules and technique protocol (5 files with rules or protocol rules). All **clean**. Quote: rules are invariants the phases do not already enumerate (`cite-the-task-too`, `a-step-binds-only-its-deviations`).

### AP-20. rule-group-disambiguation

Meets rules (5). All **clean**. Quote: no two co-listed rules read as conflicting.

### AP-21. grouped-rule-keys

Meets rules (5). All **clean**. Quote: technique rules are one slug each; workflow rules are one audience list, not a flat family that should be a group.

### AP-22. single-rule-authority

Meets rules (5). All **clean**. Quote: no "same stance as" bridge. Isolation rules live once, under `rules.activity`.

### AP-23. worker-rule-reach

Meets workflow rules, activity rules, technique rules (5). All **clean**. Quote: remediate-vuln worker directives are under `rules.activity`, which `get_activity` injects. No `rules.workflow` bucket.

### AP-24. no-contradictory-rules

Meets rules (5). All **clean**. Quote: no mutually exclusive pair in one bucket.

### AP-25. no-one-step-rules

Meets technique rules and protocol (4). All **clean**. Quote: each rule spans the technique (`augment-not-rebuild` is every page, not one bullet).

### AP-26. no-rationale-in-description

Meets the listed prose fields on workflow, activity, technique (14). All **clean** on those fields. Quote: activity-loop `#` comments explain pointer order; they are not a `description` or a rule. Option text states the choice.

### AP-27. validate-message-economy

Meets activity action messages (9). All **clean**. Quote: signing message is cause plus "Set commit signing on this repository and re-run." The origin-untracked message dropped the public-push consequence essay.

### AP-28. no-sequence-in-description

Meets workflow/activity/technique descriptions, workflow activities/graph, activity steps, technique protocol (14).

- AP-28 | `04-evaluate.yaml` | description | **finding G13** | "Evaluate the draft … revise while issues remain, and complete the ISO checklist"
- AP-28 | `02-apply-ladder.yaml` | description | **finding G13** | "climbing the rungs … then confirm it clears the safety floor"
- AP-28 | `02-area-derivation.yaml` | description | **finding G13** | "Derive bounded investigation areas … and secure approval"
- AP-28 | other descriptions, `activities:`, and graphs | description | clean | "Initialize a high-sensitivity security fix."; "Remediate security vulnerabilities on the private remote."

### AP-29. no-user-env-mutation

Meets descriptions, validate messages, protocol, options (14). All **clean**. Quote: signing message now says "on this repository", not system or global git config.

### AP-30. role-rules-not-description

Meets descriptions, variables, rules (10). All **clean**. Quote: descriptions say what the construct is. "MUST NOT" lives in `rules.activity`, not in `description`.

### AP-31. no-hand-authored-artifacts

Meets activity and technique outputs (13). All **clean**. Quote: no activity `artifacts:` key.

### AP-32. outcome-names-value

Meets activity outcome (9).

- AP-32 | `09-validate-and-commit.yaml` | outcome | **finding G14** | "Gate 2 (`approve-to-commit`) batches …"; "committed from the session `{target_path}` worktree on `{workflow_branch}`"
- AP-32 | other outcomes | outcome | clean | outcomes stay true if a file is renamed ("The draft is evaluated against all four principles")

### AP-33. no-set-of-technique-output

Meets activity steps (9). All **clean**. Quote: technique steps that also `set` either write a different accumulator with a value (`accepted_mitigations`) or are not activities. No `set` whose target is the bound technique's own product.

### AP-34. no-valueless-control-set

Meets activity steps (9). All **clean** as this entry. Quote: the valueless control sets use `message`, not `description`. Scored under P-05 / G1–G3, not under this field shape.

### AP-35. no-intra-step-input-set

Meets activity steps (9). All **clean**. Quote: no step interpolates a variable that the same step's `set` writes.

### AP-36. techniques-list-disjoint

Meets activity techniques and steps (9).

- AP-36 | `05-resolution-dialogue.yaml` | techniques | clean | `techniques: [scatter-gather]`; steps bind `resolve-findings::…`
- AP-36 | `03-requirements-refinement.yaml` | techniques | clean | `scatter-gather` is not also a `step.technique`
- AP-36 | other activities | techniques | clean | no activity-level `techniques:` key

### AP-37. rule-audience-bucket

Meets workflow rules (1).

- AP-37 | `remediate-vuln/workflow.yaml` | rules.activity | clean | isolation, private remote, and private research are worker directives under `rules.activity`

### AP-38. no-duplicate-technique-steps

Meets activity steps (9). All **clean**. Quote: `yaml-authoring` appears twice in `06-scope-and-draft.yaml` under different `when` values (author vs restore), not as an unrolled collection.

### AP-39. hoist-universal-techniques

Meets activity techniques and workflow techniques (2 activities plus 1 workflow). All **clean**. Quote: `scatter-gather` is on two activities in this slice, not on nearly every activity. `remediate-vuln` `techniques.activity` is `variable-binding` only.

### AP-40. readme-orients-not-transcribes

Meets readme (2).

- AP-40 | `remediate-vuln/README.md` | body | clean | activity table is name, source, one-line purpose; mermaid is a diagram. The stale edge is G6, not a checkpoint transcription
- AP-40 | `workflow-design/techniques/README.md` | body | clean | technique index by area; "does not restate protocols"

### AP-41. avoidance-voice-in-definitions

Meets the listed prose fields (16 files).

- AP-41 | `ingest.md` | capability | **finding G10** | "Augment and update are folded into ingest … not a separate technique"
- AP-41 | `04-evaluate.yaml` | outcome | **finding G10** | "rather than assume it"; "rather than stopping at the first draft"
- AP-41 | `02-apply-ladder.yaml` | outcome | **finding G10** | "No change reaches the over-engineering review without having cleared the floor"
- AP-41 | `05-resolution-dialogue.yaml` | outcome | **finding G10** | "preserving the nuance that batch review would lose"
- AP-41 | `remediate-vuln/README.md` | overview | clean | rewritten to the private remote; no "without public disclosure"
- AP-41 | `01-start.yaml` | outcome | clean | rewritten off "never touching a public branch"
- AP-41 | `remediate-vuln/workflow.yaml` | description | clean | "on the private remote"
- AP-41 | `follow-ups.md` | body | clean | "in-task" vs deferred is the register's scope, not a prior design
- AP-41 | remaining descriptions and option text | description | clean | no "rather than" / "no longer" framing

### AP-42. io-agnostic-contract

Meets 4 techniques' inputs and outputs.

- AP-42 | `ingest.md` | inputs, outputs | **finding G5** | "build loop"; "used by `maintain-index-log`"; "Consumed by `maintain-index-log`"
- AP-42 | `query.md` | inputs, outputs | clean | no technique, activity, or step named in a slot
- AP-42 | both `yaml-authoring.md` | inputs, outputs | clean | no producer or consumer technique in a slot; the reconcile cite is in Rules, not I/O

### AP-43. canonical-artifact-ids

Meets 4 techniques' protocol and I/O. All **clean** beside G15's filename. Quote: `{target_area}`, `{wiki_question}`, `{yaml_file}` are the ids. No `*-path` proxy id.

### AP-44. artifact-name-in-io

Meets 4 techniques.

- AP-44 | `ingest.md` | protocol | **finding G15** | "Read `index.md`"
- AP-44 | `query.md` | protocol | **finding G15** | "Read `index.md`"
- AP-44 | both `yaml-authoring.md` | protocol | clean | no concrete artifact filename; `workflow.yaml` in the design rules is the file kind

### AP-45. no-opaque-artifact-path-array

Meets technique inputs and protocol (4). All **clean**. Quote: no `*-paths` array.

### AP-46. no-resource-caller-backlink

Meets resource (1).

- AP-46 | `follow-ups.md` | body | clean | sibling cite `[deferred-items-guide](...)`; "producers" has no host id. Do not flag a sibling resource

### AP-47. no-redundant-link-label

Meets all 23. All **clean**. Quote: no `word ([word](url))`. Links are `[01-start.yaml](activities/01-start.yaml)` after "own", and `[Schema Construct Inventory](...)`.

### AP-48. brace-output-references

Meets 4 techniques' protocol. All **clean**. Quote: outputs are `{wiki_pages}`, `{wiki_answer}`, `{schema_conforms}`, `{drafted_files}`, not "the output".

### AP-49. no-delivery-mechanism-narration

Meets 4 techniques' protocol. All **clean**. Quote: no "attached to technique responses" or `_resources` delivery essay.

### AP-50. no-tool-usage-prescription

Meets technique capability/protocol/rules and resource (5). All **clean**. Quote: no `get_resource` / `get_technique` call recipe. Applies are canonical technique references.

### AP-51. canonical-technique-reference

Meets 4 techniques' protocol. All **clean**. Quote: gitnexus and write-artifact are `[group](path)::[op](path)` or a markdown link that invokes, not a raw tool standing in for a wrapped capability.

### AP-52. brace-declared-ids

Meets 4 techniques' protocol and capability.

- AP-52 | `ingest.md` | protocol | **finding G16** | foreign output ids braced with no local bind (same sites as G16)
- AP-52 | `query.md` | protocol | clean | `{wiki_question}` and `{persist_answer}` match Inputs; `{page_filename}` follows `{$page_filename}`
- AP-52 | both `yaml-authoring.md` | protocol | clean | braced ids match `###` ids

### AP-53. dotted-rule-address

Meets 4 techniques' protocol.

- AP-53 | `ingest.md` | protocol | clean | `gitnexus.index-freshness-first`, `gitnexus.edges-the-parser-cannot-see`
- AP-53 | `query.md` | protocol | clean | no rule citation
- AP-53 | both `yaml-authoring.md` | protocol | clean | no dotted rule; closure cite uses `::` as a spelling example in Rules, which this unit does not meet

### AP-54. anchored-protocol-references

Meets 4 techniques' protocol. All **clean** where G9, G12, G15, and G16 do not already cover the form. Quote: resources are markdown links; declared ids are braced; gitnexus rules are dotted.

### AP-55. hoist-shared-inputs

Meets technique inputs (4). All **clean**. Quote: these four do not re-declare one shared input across a group. No `inherited_inputs` block.

### AP-56. paren-invocation-args

Meets 4 techniques' protocol.

- AP-56 | `ingest.md` | protocol | **finding G9** | phase 6 argument names in backticks, not italic on the reference
- AP-56 | `query.md` | protocol | clean | italic `*bare_filename*` `*artifact_content*` `*mutated_pages*` `*operation_summary*`
- AP-56 | `ingest.md` new cross-link line | protocol | clean | italic `*subject_pages*` `*related_pages*`
- AP-56 | both `yaml-authoring.md` | protocol | clean | no invocation argument list; closure cite is not an Apply

### AP-57. escape-literal-dollar

Meets all 23. All **clean**. Quote: `$schema` is a YAML key in `remediate-vuln/workflow.yaml`, not rendered prose. Design yaml-authoring spells `` `$schema` `` inside a code span.

### AP-58. snake-case-symbols

Meets technique I/O, protocol, rules, and resource (5). All **clean**. Quote: ids are `snake_case` (`wiki_pages`, `target_area`, `schema_conforms`, `page_slugs`). Rule slugs stay kebab (`typed-pages-only`), which is the rule-slug form.

### AP-59. constraint-as-blockquote

Meets 4 techniques' protocol.

- AP-59 | `query.md` | protocol | **finding G11** | "When `{persist_answer}` is true, hold the page file…"
- AP-59 | `ingest.md` | protocol | **finding G11** | "If `{task_knowledge}` was supplied"; "When a claim contradicts"; "When augmenting an existing page"
- AP-59 | `ingest.md` | protocol | clean | the macro caveat is `  > -`, the note form
- AP-59 | both `yaml-authoring.md` | protocol | clean | failure handling is the phase "Resolve Validation Failures", not a buried second branch

### AP-60. local-rule-as-note

Meets technique rules and protocol (4). All **clean**. Quote: no rule scoped to a single phase only.

### AP-61. factor-repeated-paths

Meets 4 techniques. All **clean**. Quote: `index.md` repeats (G15) but is not a filesystem path repeated as a literal root. No hard-coded tree where a variable already exists, aside from G12's undeclared `{wiki_path}`.

### AP-62. bind-protocol-locals

Meets 4 techniques.

- AP-62 | `ingest.md` | protocol | **finding G16** | `{repo_name}`, `{graph_inventory}`, `{index_stale}`, `{query_report}`, `{context_report}` have no `{$…}` bind; `{$symbol}` and `{$page_slug}` are never read bare
- AP-62 | `query.md` | protocol | clean | `{$page_filename}` then `{page_filename}`; `{$answer_body}` then `{answer_body}`
- AP-62 | both `yaml-authoring.md` | protocol | clean | no unbound `{name}` and no dead `{$name}`

### AP-63. backtick-code-tokens

Meets all 23.

- AP-63 | `01-start.yaml` | actions.message | **finding G17** | "Add it with git remote add security {private_fork_url}"; "Run git branch --unset-upstream in {target_path}"
- AP-63 | `remediate-vuln/workflow.yaml` | rules.activity | **finding G17** | "gh pr create, gh issue create" bare in the isolation rule
- AP-63 | other 21 files | body | clean | commands and filenames that appear are already in spans (`index.md`, `` `{$page_slug}.md` ``)

### AP-64. boolean-id-shape

Meets technique I/O, workflow variables, activity variables (14). All **clean**. Quote: `is_review_mode`, `has_open_assumptions`, `needs_revision`, `schema_conforms`, `index_stale` — affirmative or `is_`/`has_` on an affirmative stem. No `not_` / `_flag`.

### AP-65. collection-id-shape

Meets the same variable and I/O fields (14). All **clean**. Quote: `evaluation_findings`, `manifest_entries`, `wiki_pages`, `research_outputs`. No `_list` / `_array`. Singular `current_finding` is the loop variable, not the collection.

### AP-66. io-id-shape

Meets 4 techniques' I/O. All **clean**. Quote: no direction suffix, no `-path` id, no bare `summary` / `result` / `artifact`. `ingest_summary` and `wiki_answer` name the value.

### AP-67. rule-slug-shape

Meets technique rules (4). All **clean**. Quote: `typed-pages-only`, `cite-every-claim`, `smallest-edit-that-resolves`, `a-foreign-technique-is-qualified`. No bare negation slug.

### AP-68. technique-stage-agnostic

Meets technique capability, protocol, rules (4). All **clean**. Quote: no activity name, checkpoint, or "before the next step". The build-loop clause is on an Input, which this unit does not meet (G5).

### AP-69. no-activity-prose-rules

Meets activity rules (9). All **clean**. Quote: no activity `rules:` key.

### AP-70. capability-group-placement

Meets technique and workflow techniques (5). All **clean**. Quote: ingest and query live under `codebase-wiki/techniques/`; yaml-authoring lives in the authoring workflow that binds it. No group folder whose ops are the whole workflow.

### AP-71. no-false-resource-delivery

Meets technique, resource, readme (8). All **clean**. Quote: no claim that a tool returns full resource bodies.

### AP-72. complete-bootstrap-path

Meets technique and resource (5). All **clean**. Quote: none of these is the discover / engine bootstrap.

### AP-73. consistent-tool-names

Meets technique, resource, readme (8). All **clean**. Quote: one name per action; canonical load name is not aliased.

### AP-74. no-duplicated-guidance

Meets technique and resource (5). All **clean**. Quote: the two yaml-authoring files share three rule slugs (`a-step-binds-only-its-deviations`, `a-name-mismatch-is-closed-at-the-caller`, `a-foreign-technique-is-qualified`) as the same authoring contract in two workflows, not a second copy of a harness mechanic. Not scored as duplication of a tool description.

### AP-75. describe-tool-value

Meets technique and resource (5). All **clean**. Quote: not an engine or bootstrap surface.

### AP-76. no-redundant-tools

Meets technique and resource (5). All **clean**. Quote: no routing-only helper recommended beside a tool that already returns it.

### AP-79. structure-backed-constraints

Meets rules, activity steps, activity exits (14). All **clean** beside G1–G3, which are the schema-construct misses rather than a rule with no gate. Quote: remediate-vuln isolation is also `stealth_mode` and the private remotes.

### AP-80. preserve-readme-content

Meets readme (2). All **clean**. Quote: remediate-vuln overview was shortened in the diff; the activities table and mermaid remain. This unit's detect is an edit that drops substance without a preserved/removed list. The surviving orientation is still in the file. Not scored as a drop.

### AP-81. verify-format-literacy

Meets workflow, technique, resource (6). All **clean**. Quote: files follow the existing frontmatter and schema shapes. This walk does not re-run the guard suite.

### AP-82. work-through-activities

Meets workflow activities and graph (1).

- AP-82 | `remediate-vuln/workflow.yaml` | graph | clean | every edge names an activity in `activities:` or `start` / `__terminal__`

### AP-84. single-closeout-artifact

Meets resource and readme (3). All **clean**. Quote: one follow-ups guide; READMEs do not each restate a close-out footer.

### AP-85. link-dont-copy-sections

Meets resource (1).

- AP-85 | `follow-ups.md` | template | clean | the row is the item; "Link, don't restate"

### AP-86. exception-only-verdict-tables

Meets resource (1). All **clean**. Quote: the template is an item register, not an all-pass verdict table.

### AP-87. omit-null-sections

Meets resource and activity steps (10). All **clean**. Quote: "a run with none has no register." No "None" / "N/A" section. Checkpoints do not ask the user to confirm a null.

### AP-88. one-decision-one-checkpoint

Meets activity steps (9). All **clean**. Quote: `evaluation-reviewed` (revise vs accept) and `evaluation-gate` (deliver vs return) are different decisions. URL gates are one question each (G1 is the missing reply, not a subsumed second checkpoint).

### AP-89. checkpoint-requires-decision

Meets activity steps (9). All **clean**. Quote: options set different variables or different exits. `autoAdvanceMs` on evaluate, spec-confirmed, validation, and scope changes `needs_revision` or takes the default that is a real choice, not an acknowledgement of guidance. The single-option URL gates exist to collect a value (G1), not to acknowledge guidance.

### AP-90. no-guide-wrapper-ceremony

Meets resource (1).

- AP-90 | `follow-ups.md` | body | clean | template plus rules; no Good/Bad pair or quality checklist

### AP-91. lifecycle-row-update

Meets resource (1).

- AP-91 | `follow-ups.md` | rules | clean | "One row per item, updated in place"

### AP-92. resource-fills-not-does

Meets resource (1).

- AP-92 | `follow-ups.md` | rules | clean | fill rules, not "after each phase" cadence

### AP-93. canonical-fact-home

Meets resource (1).

- AP-93 | `follow-ups.md` | body | clean | one register for in-task follow-ups; deferrals point elsewhere

### AP-94. link-only-input-slots

Meets resource (1).

- AP-94 | `follow-ups.md` | template | clean | the row is the item, not a copy of another document

### AP-95. enforce-output-discipline

Meets workflow rules, technique rules, resource (6). All **clean**. Quote: no output-discipline ruleset left only as prose with no verify technique at a boundary these files own.

### AP-96. artifact-audience-declared

Meets technique outputs (4).

- AP-96 | `ingest.md` | outputs | clean | `#### audience` `human` on `wiki_pages`
- AP-96 | `query.md` | outputs | clean | no `#### artifact`
- AP-96 | both `yaml-authoring.md` | outputs | clean | no `#### artifact`

### AP-97. link-named-artifacts

Meets activity checkpoint and action messages (9).

- AP-97 | `02-area-derivation.yaml` | steps.message | **finding G7** | "recorded in investigation-plan.md"
- AP-97 | `04-evaluate.yaml` | steps.message | clean | `[evaluation report]({evaluation_report_path})`, `[ISO checklist]({checklist_path})`
- AP-97 | `05-resolution-dialogue.yaml` | steps.message | clean | `[the mitigation plan]({mitigation_plan_path})`
- AP-97 | `06-scope-and-draft.yaml` | steps.message | clean | `[scope manifest]({scope_manifest_path})`, `[impact analysis]({impact_analysis_path})`
- AP-97 | `03-requirements-refinement.yaml` | steps.message | clean | `[design specification]({specification_path})`
- AP-97 | `09-validate-and-commit.yaml` | steps.message | clean | specification, impact, attestation, and planning README are linked
- AP-97 | `01-start.yaml` | steps.message | clean | messages name remotes and URLs, not a durable file
- AP-97 | `02-apply-ladder.yaml` | steps.message | clean | no filename
- AP-97 | `08-quality-review.yaml` | steps.message | clean | no user-facing filename

### AP-98. no-next-step-narration

Meets activity messages and option descriptions (9). All **clean**. Quote: no "Continuing to…" or "auto-accepts after 30s" in message or option text. Timing stays in `autoAdvanceMs`.

### AP-99. statement-not-question

Meets activity checkpoint messages (9). All **clean**. Quote: no trailing `?` and no "confirm" / "is this" / "would you like" opener. "Please provide the private security advisory URL:" is an imperative, not that opener list.

### AP-100. runtime-rules-only

Meets workflow, activity, and technique rules (5). All **clean**. Quote: remediate-vuln rules are session isolation. yaml-authoring rules constrain the file the session is writing. They are not a design principle pasted as a runtime rule. The design protocol cites the principle; it does not file it under `## Rules`.

### AP-101. no-caption-only-message

Meets activity checkpoint messages (9). All **clean**. Quote: messages name the plan, the issue count, the finding id, or the manifest — a durable subject.

### AP-102. no-technique-resource-dual-home

Meets technique and resource (5). All **clean**. Quote: ingest cites templates and does not copy the taxonomy. follow-ups rules are not also a technique checklist.

### AP-103. cited-home-owns-claim

Meets technique, resource, readme (8). All **clean**. Quote: anchored wiki-format and citation cites match headings that exist (`#page-type-taxonomy`, `#wikilink-conventions`, `#17-document-in-positive-present`). `deferred-items-guide` is the renamed home the diff points at.

### AP-104. operative-criteria-need-a-home

Meets technique protocol and resource (5). All **clean**. Quote: no Detect/Fix catalogue living only in a protocol.

### AP-105. no-shadow-audit-pass

Meets technique protocol (4). All **clean**. Quote: none of these walks a canon home in compressed form.

### AP-106. canon-layer-cites-not-restates

Meets resource and readme (3). All **clean**. Quote: READMEs and follow-ups do not paste a Detect or Fix body.

### AP-107. bind-site-is-orchestration-truth

Meets readme, resource, technique, workflow description, activity steps, workflow graph (16).

- AP-107 | `remediate-vuln/README.md` | body | clean under this entry's do-not-flag | at-a-glance names with one-line roles, plus a mermaid. The false edge is G6 (`AP-133`), not a third checklist
- AP-107 | `workflow-design/techniques/README.md` | body | clean | index of technique ids, not an ordered `steps[]` dump
- AP-107 | other meeting files | description or graph | clean | descriptions do not list a complete pass inventory the YAML does not hold, aside from G13's short sequences

### AP-108. numbered-protocol-phases

Meets 4 techniques' protocol.

- AP-108 | `ingest.md` | protocol | **finding G8** | phase 2's bullets are distinct ordered outcomes (resolve, then verify, then query, then context)
- AP-108 | `query.md` | protocol | clean | phase 4's two bullets are one persist outcome
- AP-108 | both `yaml-authoring.md` | protocol | clean | bullets under a phase are facets of that phase (read schema, map fields, validate)

### AP-109. technique-outputs-declared

Meets 4 techniques. All **clean**. Quote: pages, summary, answer, gaps, `answer_page`, `yaml_file`, `schema_conforms`, `drafted_files` are declared. Protocol does not return an undeclared plan or count.

### AP-110. duplicate-shared-capability

Meets 4 techniques' protocol. All **clean** beside G8, which is the invocation entry. Quote: no local re-teaching of `Task` fan-out.

### AP-111. contract-not-procedure

Meets technique protocol and outputs (4). All **clean**. Quote: outputs state what the value is. Protocol does not restate a recognition tree that the output already fully defines.

### AP-112. no-derived-state-shadow

Meets workflow variables (1).

- AP-112 | `remediate-vuln/workflow.yaml` | variables | clean | `host_repo_path` "equals target_path in this workflow" is a description tail (G18), not a second boolean or count shadow. No gate writes both.

### AP-113. session-interaction-in-technique

Meets 4 techniques. All **clean**. Quote: no "present to the user" / "show in chat".

### AP-114. pass-orchestration-in-technique

Meets 4 techniques.

- AP-114 | `ingest.md` | protocol | **finding G8** | Apply resolve-graph, verify-index, query, context, cross-link; delegate write-artifact
- AP-114 | `query.md` | protocol | **finding G8** | write-artifact and maintain-index-log
- AP-114 | both `yaml-authoring.md` | protocol | clean | no Apply and no `::` work invoke. Closure cite does not apply reconcile

### AP-115. platform-semantics-in-capability

Meets technique capability and readme (6). All **clean**. Quote: capability does not teach loader inheritance. The techniques README says where shared inputs live in one orientation sentence and points at `TECHNIQUE.md`.

### AP-116. no-template-creation-guide

Meets technique protocol and resource (5). All **clean**. Quote: follow-ups has `## Template`. Ingest cites page-templates. These techniques do not persist a planning artifact by a bare filename with no guide.

### AP-117. no-engine-mechanics-as-rules

Meets rules and technique protocol (5). All **clean**. Quote: no restatement of `variables_changed`, loop mechanics, or dispatch as a rule.

### AP-118. no-bind-mechanics-as-prose

Meets technique I/O, capability, protocol, rules, readme, and listed activity text (16). Does not meet routine inputs.

- AP-118 | `ingest.md` | inputs | **finding G5** | "bound to `target_area` each pass"
- AP-118 | `index-refresh.yaml` | — | clean | the unbound-host sentence is a routine input; this unit's Fires-on does not include `routine`. Scored as G4 under P-05
- AP-118 | other meeting files | inputs or protocol | clean | slots state meaning; call-site binds are in `inputs:` / Apply parentheses

### AP-119. procedure-in-io-contract

Meets 4 techniques' I/O.

- AP-119 | `ingest.md` | inputs | **finding G5** | the build-loop parenthesis is how the value is supplied
- AP-119 | `query.md` | inputs, outputs | clean | "When false, the answer is returned without writing a page" is the meaning of the boolean, and the output says "present only when `persist_answer` is true" as recognition
- AP-119 | both `yaml-authoring.md` | inputs, outputs | clean | no imperative, no "final phase", no checkpoint duty in a slot

### AP-120. procedure-in-capability

Meets 4 techniques' capability. All **clean**. Quote: no imperative past the product, no markdown link, no `{id}` in Capability. The "not a separate technique" clause is G10 (avoidance), not a how-to.

### AP-121. rule-as-protocol-step

Meets technique protocol and resource (5). All **clean**. Quote: no phase whose only job is "follow the rules throughout". Design yaml-authoring's description-hygiene bullet cites the principle while the phase drafts the file.

### AP-122. prompt-restates-owned-mechanics

Meets resource and technique (5). All **clean**. Quote: not a spawn stub. No bundling budget or `step_techniques` essay.

### AP-123. capability-as-op-inventory

Meets 4 techniques' capability. All **clean**. Quote: capability is the product, not a comma list of child ops.

### AP-124. alternate-ops-as-protocol-sequence

Meets 4 techniques' protocol. All **clean**. Quote: phases are ordered. Persist-if-requested is one phase, not a menu of alternate modes numbered as a sequence.

### AP-125. technique-ref-in-io-contract

Meets 4 techniques' I/O. All **clean**. Quote: `maintain-index-log` in ingest outputs is backticks, not a markdown link to a technique file. Scored as G5 (names the consumer) rather than as a hyperlink.

### AP-126. cut-comment-jsdoc-verbosity

Meets all 23. All **clean**. Quote: `activity-loop.yaml` and `remediate-vuln/workflow.yaml` comments state a non-obvious order or why the review-mode constants have no producer. Removing them would drop that why.

### AP-127. no-dense-prose-after-config-examples

Meets resource, technique, readme (8). All **clean**. Quote: follow-ups rules after the template add fill constraints the fence does not show. No paragraph that only re-explains keys already in the fence.

### AP-128. worktree-root-placeholders

Meets all 23. All **clean**. Quote: no `/home/…` or machine worktree root. Paths are `{target_path}`, `{wiki_path}`, `{planning_folder_path}`, or repo-relative links.

### AP-129. no-parallel-runbook-when-setup-covers-it

Meets technique protocol, readme, resource (8). All **clean**. Quote: no clone/install/build runbook.

### AP-130. variable-description-one-line

Meets workflow variables (1).

- AP-130 | `remediate-vuln/workflow.yaml` | variables | **finding G18** | `prior_feedback_triage` "always empty in this workflow"; `rating_cap` "always empty"; `is_review_mode` "always false"; `gitnexus_indexed` "(kept false here)"; `squash_merge_supported` "always false"; `host_repo_path` "equals target_path in this workflow"
- AP-130 | `stealth_mode` | variables | clean | "Whether every public-disclosure side-effect is suppressed." — does not restate `defaultValue`

### AP-131. bag-value-as-literal

Meets workflow, activity, technique, resource (16; not routines). All **clean**. Quote: `security` as `defaultValue` of `base_remote` and `push_remote` is the value the slot holds, and the description names the remote. No second prose copy of a branch name where `{name}` should stand, aside from G17's command text which is the command itself.

### AP-132. unproduced-value-read

Meets activity steps (9). All **clean**. Quote: readers of `plan_approved`, `needs_revision`, `safety_floor_cleared`, `schema_conforms`, `has_resolvable_assumptions` have `defaultValue`. `doWhile` bodies run before the condition. No later reader of a `when`-gated producer that lacks a default.

### AP-133. stale-restatement-after-change

Meets readme, activity description, technique capability, activity outcome, resource (16).

- AP-133 | `remediate-vuln/README.md` | body | **finding G6** | mermaid still has `prism-decision --> post-impl-review`; the activities table still goes from row 16 prism-decision to row 10 post-impl-review
- AP-133 | `03-requirements-refinement.yaml` | outcome | clean | "while-loop" removed
- AP-133 | `workflow-design/techniques/README.md` | body | clean | `interview` removed
- AP-133 | `09-validate-and-commit.yaml` | steps | clean | assumptions-log link removed with the path variable (message is not this unit's field; the outcome does not still name the old path)
- AP-133 | `01-start.yaml` | outcome | clean | public-disclosure wording removed
- AP-133 | `remediate-vuln/workflow.yaml` | description | clean | "on the private remote"
- AP-133 | other meeting files | description or capability | clean | no pre-change phrase of a gate this diff altered

### AP-134. artifact-name-is-filename

Meets technique outputs (4).

- AP-134 | `ingest.md` | outputs | clean | `` `{$page_slug}.md` `` is one filename token, not two segments joined by `/` or "or"
- AP-134 | other three | outputs | clean | no `#### artifact` body, or none with a path separator

### AP-135. resource-id-names-its-content

Meets resource (1).

- AP-135 | `follow-ups.md` | name | clean | frontmatter `name: follow-ups`; the body is a register guide. Not a verb head

### AP-136. deployment-path-in-capability

Meets 4 techniques' capability. All **clean**. Quote: no repo-relative or absolute directory in Capability.

### AP-137. overlapping-rule-scopes

Meets rules and resource (6). All **clean**. Quote: no two thresholds on one measure. follow-ups "in-task only" vs deferred is a split, and the deferred case names the other register.

### AP-138. whole-resource-for-one-section

Meets technique and resource (5). All **clean**. Quote: bare cites are not paired with an anchored cite of the same resource. Phrases beside schema-construct-inventory and convention-conformance do not match a single `##` heading (`Reference Conventions` is the only convention heading; "field ordering" is not that heading).

### AP-139. tool-contract-restated-in-protocol

Meets technique protocol and rules (4). All **clean**. Quote: no field-name, cardinality, or omit-versus-empty essay for a harness tool schema.

### AP-140. phase-cited-by-ordinal

Meets the listed fields (16).

- AP-140 | `ingest.md` | protocol | clean | "the cascade in step 5" is an ordinal inside the Protocol that owns the numbering
- AP-140 | `09-validate-and-commit.yaml` | outcome | clean | "Gate 2" is not "step N" / "phase N"; the gate id in that outcome is G14
- AP-140 | other meeting files | body | clean | no "step N" or "phase N" outside the owning protocol

### AP-141. unowned-harness-capability

Meets technique (4). All **clean**. Quote: no one tool named for the same capability in two of these bodies without an output owner.

### AP-142. output-without-destination

Meets technique outputs and activity steps (13). All **clean**. Quote: ingest outputs are consumed by the cascade and by the write. query's `wiki_answer` is the return. yaml-authoring outputs are the file the step writes and `schema_conforms`, which the activity loops on. Activity checkpoints interpolate the paths those writes bind.

### AP-143. framing-outside-any-section

Meets resource (1).

- AP-143 | `follow-ups.md` | body | clean | H1 then one paragraph then `## Template`. The paragraph is short and the file has no section-scoped citer in this slice that would drop it

### AP-144. declared-input-never-read

Meets 4 techniques.

- AP-144 | `ingest.md` | inputs, protocol | clean | `{target_area}` and `{task_knowledge}` occur in Protocol
- AP-144 | `query.md` | inputs, protocol | clean | `{wiki_question}` and `{persist_answer}` occur
- AP-144 | `workflow-authoring/.../yaml-authoring.md` | inputs, protocol | clean | `{current_file}`, `{reference_file}`, `{selected_findings}`, and the outputs occur
- AP-144 | `workflow-design/.../yaml-authoring.md` | inputs, protocol | clean | `{reference_file}` and `{schema_type}` occur

### AP-145. apply-omits-declared-input

Meets 4 techniques' protocol.

- AP-145 | `ingest.md` | protocol | clean | cross-link required `subject_pages` and `related_pages` are passed. resolve-graph `tree_path` is optional. verify-index has no required input of its own; inherited `repo_name` is optional
- AP-145 | `query.md` | protocol | clean | write-artifact required `bare_filename` and `artifact_content` are passed; `target_dir` is optional and is passed. maintain-index-log required `mutated_pages` and `operation_summary` are passed
- AP-145 | both `yaml-authoring.md` | protocol | clean | no Apply. Closure cite does not omit reconcile's `comprehension_artifact`, `query_report`, or `context_report` because it does not invoke the op

### AP-146. branch-on-undeclared-threshold

Meets technique protocol/rules and activity steps (13). All **clean**. Quote: loops declare `maxIterations`. No "if it takes too long" or "when the payload is large".

### AP-147. inherited-rules-re-enumerated

Meets rules (5). All **clean**. Quote: no rules entry that is only a citation list of rules the reader already receives.

### AP-148. reference-without-provenance

Meets technique (4). All **clean** beside G12 and G16, which name the missing supplier. Quote: yaml-authoring values trace to Inputs or to the schema resource link.

### AP-149. pre-session-prose-defers-to-the-framework

Meets resource (1).

- AP-149 | `follow-ups.md` | body | clean | not the discover procedure

### AP-150. instruction-narrates-an-actor

Meets the listed fields (16). All **clean**. Quote: rules address the reader. No clause whose only job is a second actor's limitations. "the user" in checkpoint option text is the reader of that checkpoint.

### AP-151. rule-binds-beyond-its-operation

Meets technique rules (4). All **clean**. Quote: each rule's subject is the page, the answer, or the file this technique writes. Striking the technique removes the subject.

### AP-152. inherited-input-re-declared

Meets technique inputs (4). All **clean**. Quote: none of these four re-declares an id that its group `TECHNIQUE.md` already declares. They are not under a group file in a way that duplicates `repo_name`; ingest and query do not declare `repo_name` at all (G12/G16).

### AP-153. schema-semantics-restated

Meets technique rules, capability, and resource (5). All **clean**. Quote: yaml-authoring rules state YAML style the author must produce. They do not restate an operator roster the schema enumerates.

### AP-154. engine-internals-narrated

Meets technique (4). All **clean**. Quote: no server file, seal, or internal module named.

### AP-155. value-set-in-prose

Meets workflow variables, technique I/O, resource (6). All **clean**. Quote: `issue_platform` carries `values: [github, jira]` and the description does not repeat them. `finding_disposition` on the activity carries `values` (activity variables are not this unit). No pipe roster in a workflow description without `values`.

### AP-156. one-invariant-per-rule

Meets technique rules (4). All **clean**. Quote: no bold lede opening a second invariant inside one rule body. Entries are one short paragraph.

### AP-157. call-omits-conditionally-required-argument

Meets technique protocol and rules (4). All **clean**. Quote: no tool signature written as a whole call that omits an argument the tool requires from the state the phase is in.

### AP-158. call-omits-required-argument

Meets technique protocol and rules (4). All **clean**. Quote: no whole tool signature missing a required parameter. Technique Applies are scored under AP-145.

### AP-159. call-names-an-undeclared-argument

Meets technique protocol and rules (4). All **clean**. Quote: Apply argument names (`subject_pages`, `bare_filename`, `mutated_pages`, `tree_path`, `search_query`, `repo_name`) are inputs on the target or its container.

### AP-160. protocol-phase-as-list-item

Meets 4 techniques' protocol. All **clean**. Quote: phases are `### N. Title`, not `N.` list items or bold leads.

### AP-161. unreachable-operation-reference

Meets 4 techniques.

- AP-161 | both `yaml-authoring.md` | rules | clean | `` `review-assumptions::reconcile` `` is the spelling of a qualified id, in backticks, with no navigable link and no work invoked. The I/O change does not make the example stale. Not a closure-only finding
- AP-161 | `ingest.md` | protocol | clean | technique links invoke work (`AP-114` / G8), which this entry does not flag
- AP-161 | `query.md` | protocol | clean | same

### AP-162. produce-path-without-a-reading

Meets 4 techniques' protocol. All **clean**. Quote: ingest states what an empty graph and a stale index mean. query states disagreement and coverage gaps. yaml-authoring states parser failure versus schema failure.

### AP-163. construct-folder-without-a-readme

Meets activity, technique, resource, routine (20). All **clean** as a file walk. Quote: this unit's verdict is the folder list beside the files. The folders these files sit in (`codebase-wiki/techniques/`, `meta/routines/`, each workflow's `activities/`, `support/gitnexus/routines/`, `workflow-design/techniques/`, `workflow-design/resources/`) are not fully enumerated here; sibling READMEs were not on this slice except `workflow-design/techniques/README.md` and `remediate-vuln/README.md`, which do orient those two folders. No folder in this slice was opened as a directory listing, so no completeness verdict is recorded against a folder that was not listed.

### AP-164. relocation-without-a-preserved-outcome

Meets activity steps/exits, technique, and rules (14). All **clean**. Quote: the reconcile step moved into the `doWhile` and the outcome still states that open judgements remain for the commit batch. The prism fan's new activities are on the graph and in `activities:`. No gate disappeared without a receiving site.

### AP-165. unproducible-declared-value

Meets 4 techniques' outputs and protocol. All **clean**. Quote: each declared output is written by a phase (pages in phase 6, answer in phase 3, `schema_conforms` in the validate phase, `drafted_files` in the draft phase). No later phase reassigns that field over the same subjects.

### CV. Reference Conventions

Meets workflow, activity, technique, routine, resource (21; not the two readmes). All **clean**. Quote: `version` is X.Y.Z. Field order follows siblings (`id`, `version`, `name`, `description`, `variables`, `steps`, `exits`, `outcome`). Technique files use Capability, Inputs, Outputs, Protocol, Rules. Routine steps use `kind`, `id`, `technique` / `routine`, `when`. No invented heading.

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| G1 | Live | High | 5. Maximize Schema Expressiveness | `corpus/remediate-vuln/activities/01-start.yaml` `sec-vuln-url-input`, `private-fork-url-input`, `short-id-input`; sets `record-sec-vuln-url`, `record-private-fork-url`, `record-short-id` | Each option is only `provided` and sets nothing. The following control `set` names `sec_vuln_url`, `private_fork_url`, or `short_id` with a `message` and no `value`. A checkpoint reply is stored only when the option declares `recordReply`. | pre-existing | Declare `recordReply` on each option for that variable and delete the valueless set. |
| G2 | Live | High | 5. Maximize Schema Expressiveness | `corpus/plain-language/activities/04-evaluate.yaml` `count-revision-round` | `set` `target: revision_round` with `message: Increment the revision round by one.` and no `value`. | pre-existing | Give the set the incremented value. |
| G3 | Live | High | 5. Maximize Schema Expressiveness | `corpus/workflow-authoring/activities/06-scope-and-draft.yaml` `bump-scope-round` | `set` `target: scope_round` with a message that the round is one higher, and no `value`. | pre-existing | Give the set the next round. |
| G4 | Hygiene | Medium | 5. Maximize Schema Expressiveness | `corpus/support/gitnexus/routines/index-refresh.yaml` input `repo_name` | "Unbound, the host variable of the same name supplies it; the empty default leaves a host with no such variable to the single-graph omission the gitnexus techniques already allow." The input already has `default: ""`. | diff | Name the graph. Leave resolution to the default and the call-site bind. |
| G5 | Contract | Medium | AP-42. io-agnostic-contract | `corpus/codebase-wiki/techniques/ingest.md` `target_area`, `page_slugs`, `ingest_summary` | "the entry the build loop is iterating, bound to `target_area` each pass"; "used by `maintain-index-log`"; "Consumed by `maintain-index-log` as its `operation_summary`". | pre-existing | State the area, the slugs, and the one-line summary. Drop the loop and the consumer. |
| G6 | Contract | Medium | AP-133. stale-restatement-after-change | `corpus/remediate-vuln/README.md` mermaid and Activities table | Mermaid still draws `prism-decision --> post-impl-review`. The table still goes from 16 prism-decision to 10 post-impl-review. The graph's `prism-decision.done` is `code-review`, `structural-analysis`, and `test-suite-review`. | diff | Draw and list the fan the graph declares. |
| G7 | Hygiene | Medium | AP-97. link-named-artifacts | `corpus/midnight-system-review/activities/02-area-derivation.yaml` `investigation-plan-approved` `message` | "is recorded in investigation-plan.md" with no `[label]({path})`. | pre-existing | Link the plan through its path variable. |
| G8 | Contract | Medium | AP-114. pass-orchestration-in-technique | `corpus/codebase-wiki/techniques/ingest.md` Protocol phases 2, 5, and 6; `corpus/codebase-wiki/techniques/query.md` Protocol phase 4 | Ingest Applies resolve-graph, verify-index, query, context, cross-link, and write-artifact. Query Applies write-artifact and maintain-index-log. | pre-existing | Bind each invoked op as its own step at the activity that runs the technique. |
| G9 | Hygiene | Low | AP-56. paren-invocation-args | `corpus/codebase-wiki/techniques/ingest.md` Protocol phase 6 | "binding `bare_filename` to the page's `{$page_slug}.md`, `artifact_content` to the page body, and `target_dir` to `{wiki_path}`". | pre-existing | Put italic argument names in parentheses on the write-artifact reference. |
| G10 | Hygiene | Low | AP-41. avoidance-voice-in-definitions | `ingest.md` Capability; `04-evaluate.yaml` outcome; `02-apply-ladder.yaml` outcome; `05-resolution-dialogue.yaml` outcome | "not a separate technique"; "rather than assume it"; "rather than stopping at the first draft"; "No change reaches the over-engineering review without having cleared the floor"; "preserving the nuance that batch review would lose". | pre-existing | State what the construct does now. |
| G11 | Hygiene | Low | AP-59. constraint-as-blockquote | `query.md` phase 4; `ingest.md` phases 2 and 4 | "When `{persist_answer}` is true, hold the page file"; "If `{task_knowledge}` was supplied, read it"; "When a claim contradicts an existing page"; "When augmenting an existing page". | pre-existing | Make the unconditional instruction the bullet and put the condition in a `>` note. |
| G12 | Contract | Medium | AP-16. technique-inputs-declared | `ingest.md` Protocol `{wiki_path}`, `{raw_baseline_commit}`; `query.md` Protocol `{wiki_path}` | Both paths are used and neither technique declares them under Inputs. | pre-existing | Declare each path on Inputs and keep the braced id. |
| G13 | Hygiene | Low | AP-28. no-sequence-in-description | `04-evaluate.yaml` description; `02-apply-ladder.yaml` description; `02-area-derivation.yaml` description | "revise while issues remain, and complete the ISO checklist"; "then confirm it clears the safety floor"; "and secure approval of the investigation plan". | pre-existing | State the purpose. Leave the order in `steps[]`. |
| G14 | Hygiene | Low | AP-32. outcome-names-value | `09-validate-and-commit.yaml` outcome | "Gate 2 (`approve-to-commit`) batches design specification…"; "The work is committed from the session `{target_path}` worktree on `{workflow_branch}`". | pre-existing | Name the commit decision and the pull request without the gate id and the path tokens. |
| G15 | Hygiene | Medium | AP-44. artifact-name-in-io | `ingest.md` and `query.md` Protocol phase 1 | "Read `index.md`". | pre-existing | Name the catalog by a declared id. |
| G16 | Contract | Medium | AP-62. bind-protocol-locals | `ingest.md` Protocol phase 2 and output `artifact` | `{repo_name}`, `{graph_inventory}`, `{index_stale}`, `{query_report}`, and `{context_report}` have no `{$…}` bind. `{$symbol}` and `{$page_slug}` are never read as `{symbol}` and `{page_slug}`. | pre-existing | Bind at the producer and read the bare id. |
| G17 | Hygiene | Low | AP-63. backtick-code-tokens | `01-start.yaml` `configure-sec-vuln-remote` and `finalize-setup` validate messages; `remediate-vuln/workflow.yaml` `rules.activity` | "git remote add security {private_fork_url}"; "git branch --unset-upstream in {target_path}"; "gh pr create, gh issue create". | pre-existing | Wrap each command in one code span. |
| G18 | Hygiene | Low | AP-130. variable-description-one-line | `remediate-vuln/workflow.yaml` `prior_feedback_triage`, `rating_cap`, `host_repo_path`, `is_review_mode`, `gitnexus_indexed`, `squash_merge_supported` | "always empty in this workflow"; "always false in this workflow"; "(kept false here)"; "equals target_path in this workflow". | pre-existing | One line naming the value. |

No High was withdrawn. G1–G3 were re-derived from the checkpoint option, the set, and the engine statement that `reply` is absent unless the option declares `recordReply`.

Closure cite check: both yaml-authoring files mention `review-assumptions::reconcile` only as a qualified-name example. They do not pass `comprehension_artifact`, `query_report`, or `context_report`, and they do not describe `assumptions_log`. No row above exists only because of that cite.
