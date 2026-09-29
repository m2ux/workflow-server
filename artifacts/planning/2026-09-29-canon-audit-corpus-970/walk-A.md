# Walk A — Design Principles 1–24 (+ overview)

Home: `corpus/canon/resources/design-principles.md` at 0d56c951 (#970 worktree). Overview taken as written: each heading is one invariant; specific instances are the anti-pattern catalog's. Principles 1–24 name no anti-pattern entry in their own text; where a catalog entry cites one of these principles as its covering stance (AP-41 → 17, AP-135 → 21, AP-129 → 6), that entry's Detect / Do not flag decided the spellings it reaches, and the principle decided the rest.

Surface: 42 touched (#970) + 6 closure + 6 touched (#971) = 54 files, all read whole. One off-surface consumer (`meta/techniques/workflow-engine/finalize-activity.md`) was read because a changed rule's restatement lands there (A2). Engine claims settled at `src/tools/workflow-tools.ts`, `src/loaders/workflow-loader.ts`, `src/schema/*.ts` on the schema-description-hygiene worktree.

## Units

- `## 1. Workflows Ossify Patterns` — walked
- `## 2. Internalize Before Producing` — walked (session conduct; no definition on the surface prescribes or breaks it)
- `## 3. Define Complete Scope Before Execution` — walked (session conduct; the commit bodies list the files the change touches)
- `## 4. Clarify Before Assuming` — walked (session conduct; no surface construct)
- `## 5. Maximize Schema Expressiveness` — walked
- `## 6. One Authoritative Home` — walked
- `## 7. Convention Over Invention` — walked (specimen README headings, field order and step shapes checked against the other specimens; sibling READMEs carry no one heading set)
- `## 8. Confirm Before Irreversible Changes` — walked (session conduct; no surface construct)
- `## 9. Encode Constraints as Structure` — walked (AP-79 and audit-rule-enforcement now list an exit `when` beside checkpoint, condition and validate; an exit `when` is a condition, so the principle and its entry agree)
- `## 10. Non-Destructive Updates` — walked (the removals in #970 — the `no active checkpoint` branch, the `transitions`/`decisions` inventory keys, the yield rule clause — are named in the commit bodies)
- `## 11. Complete Documentation Structure` — walked (specimen `activities/` and `techniques/` carry no README, as mvw and namespace-conformance do not; AP-159 exempts specimens)
- `## 12. Output Economy` — walked
- `## 13. Separate Contract from Procedure` — walked
- `## 14. Single Source of Truth` — walked
- `## 15. Phase by Sequenced Outcome` — walked
- `## 16. Distinguish Designators from Parameters` — walked
- `## 17. Document in Positive Present` — walked (AP-41 decided outcome and README spellings; the 05-impact-analysis outcome negations are not avoidance-of-an-old-way framing)
- `## 18. Prefer Shared Capability` — walked
- `## 19. Name Symbols Affirmatively` — walked
- `## 20. Keep Orchestration in Structure` — walked
- `## 21. Match the Harness Surface` — walked (every tool name, return field and status the surface claims was checked against the handlers: respond/resume/yield reply fields, `ends_activity`, per-visit replay, `blocked`/`completed` status, boolean ordering comparison, borrowed-path resolution)
- `## 22. Modular Over Inline` — walked
- `## 23. Close the Loop` — walked (session conduct; no surface construct)
- `## 24. Keep Session Interaction in Activities` — walked

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| A1 | Contract | Medium | 13. Separate Contract from Procedure | `corpus/meta/techniques/workflow-engine/activity-worker.md:26` `### effects`; `resume-from-checkpoint.md:18` `### effects`; `resume-worker.md:26` `### effects`; `compose-prompt.md:22` `### effects` | Each input states the value as "Variable updates carried by the/a resolved checkpoint". The value bound into them is respond-checkpoint's Output `effects` (`respond-checkpoint.md:24`, via `activity-loop.yaml:182` → resume-worker → compose-prompt stub → activity-worker → resume-from-checkpoint), which #970 restated as the whole reply: `resolved_option`, `effect` (`setVariable` and `exit`), `exit` with `next_activity` and `ends_activity`, and `dismissed`. | diff (I/O contract change; the four input lines are unchanged) | State each input as the reply its producer declares — option, effect, exit with `ends_activity`, dismissal — or cite that one declaration. |
| A2 | Contract | Medium | 6. One Authoritative Home | `corpus/meta/techniques/workflow-engine/finalize-activity.md:48` `#### variables_changed` (off-surface consumer) | "one of the two sanctioned state-mutation sources", while `workflow-engine/TECHNIQUE.md:38` `variable-mutation-source` now reads "three sources only" (#970 added the yield's `variables_changed`, and updated `variable-binding.md:67` to "one of the sanctioned" but not this copy). | diff | Drop the count and cite `variable-mutation-source`. |
| A3 | Contract | Medium | 21. Match the Harness Surface (covering AP-135 `tool-contract-restated-in-protocol`) | `corpus/meta/techniques/workflow-engine/yield-checkpoint.md:26-27`, Protocol `### 1. Yield Gate` | "sending either is refused"; "omit it when those steps produced nothing"; "plus `message` and at least two `options`, each with an `id` and a `label`" — forbidden-versus-required, omit-versus-empty, cardinality and field names the `yield_checkpoint` schema already carries (`workflow-tools.ts:2415-2423` param describes and `.min(2)`; `:122-128` "Omit when no step before the gate produced anything"). | diff | Keep the obligation (a declared gate yields by id; pass what the steps before it produced; an undeclared decision supplies its own) and drop the shape. |
| A4 | Contract | Medium | 18. Prefer Shared Capability | `corpus/meta/activities/patterns/README.md:39` (How to consume, step 1) | "A pattern file declaring none ends the run where it is entered; to route onward, copy its step list into a local activity that declares its own exits." All three pattern files (`02-supervisor.yaml`, `03-plan-and-execute.yaml`, `05-lead-researcher.yaml`) declare no `exits`, and the schema makes such an activity terminal, so the only mid-phase route the guide offers is a local copy of the shared activity. Line 5 still calls them "Borrowable mid-phase". No workflow borrows one today. | diff | Let the shared surface absorb the caller — give each pattern file a default exit the borrower's graph binds — and drop the copy recipe. |
| A5 | Contract | Medium | 6. One Authoritative Home | `corpus/canon/resources/schema-construct-inventory.md:15-21` and every `Fields: schemas/README.md#…` line (31 citations, e.g. `:31`, `:37`, `:121`, `:203`) | The cited home `schemas/README.md` does not exist on the engine (removed in 94fc4712, "the schema … guides under docs"); `docs/schemas.md` holds only Overview, Enforcement Model and Generation, so anchors such as `#exits-and-the-graph`, `#step`, `#checkpoint-steps` resolve nowhere. #970 edited entries in this file and left the citations. | pre-existing (31 citations at ba2ee7b6) | Point each citation at the home that now holds the fields, or remove the Fields pointers. |
| A6 | Hygiene | Low | 19. Name Symbols Affirmatively | `corpus/meta/techniques/workflow-engine/respond-checkpoint.md:22` Output `### effects` | The id names the option's effect, while the value #970 declares is the whole resolution reply — and that reply carries a field named `effect` inside it. | diff | Rename the output for what it is (the checkpoint's resolution reply) at its declaration and its bind sites. |
| A7 | Hygiene | Low | 13. Separate Contract from Procedure | `corpus/meta/techniques/workflow-engine/respond-checkpoint.md:34`, Protocol `### 2. Clear Active Gate` | "returns `resolved_option`, `effect`, `exit` and `dismissed` as they apply" restates the field list the Output (`:24`) states. | diff | Capture `{effects}` by reference and leave the field list on the Output. |
| A8 | Hygiene | Low | 13. Separate Contract from Procedure | `corpus/meta/techniques/workflow-engine/yield-checkpoint.md:14` Input `### checkpoint_id` | Allowed values name the activity YAML `id` and `<baseId>#<instance>`; the Protocol bullet #970 added (`:27`) admits a third, an id of the worker's choosing for a decision the activity does not declare. | diff | Add the undeclared-decision id to the Input's allowed values. |
| A9 | Hygiene | Low | 5. Maximize Schema Expressiveness | `corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml:4` `description`; `activities/02-gate-exit.yaml:4` `description`; `workflow.yaml:5-8` `description` (#971 worktree) | "Record the probe, then confirm it at a declared checkpoint."; "Run two gated probes, then stop at a checkpoint whose answer can end the activity before its last step."; "a local probe, an activity borrowed from the minimum viable workflow, then two gated probes and a checkpoint…" restate `steps[]` and `graph` order. Sibling specimens state purpose (mvw `dispatch`: "Dispatch once."; namespace-conformance `reach-by-path`: "Bind the same library by the path…"). | diff | State what each construct is and leave the order to `steps[]` and the `graph`. |
| A10 | Hygiene | Low | 19. Name Symbols Affirmatively | `corpus/meta/techniques/workflow-engine/TECHNIQUE.md:38` `variable-mutation-source`; `corpus/meta/techniques/variable-binding.md:67` `outputs-mutate-state-only-via-sanctioned-path` | `variables-changed` names the `activity_complete` field that finalize-activity declares, and `next_activity` takes, as `variables_changed`; the rewritten rule now spells both forms side by side. | pre-existing | Spell it `variables_changed`. |
| A11 | Hygiene | Low | 17. Document in Positive Present (covering AP-41) | `corpus/meta/resources/README.md:7` and the `### Removed` table `:24-32` | "has moved into the corresponding capability techniques' techniques"; a table of removed resources headed "Where the content lives now" — README orientation for meta that describes a prior design. #970 edited that table's last row (`:32`). | pre-existing | Describe what the resources folder holds now and drop the Removed table. |
| A12 | Hygiene | Low | 16. Distinguish Designators from Parameters | `corpus/workflow-design/techniques/scope-definition.md:41`, Protocol `### 2. Design Folder Structure` | `{id}/` braces a value the technique does not declare; phase 3 (`:45`) names the same value `{workflow_id}`, and the same bullet uses `NN-<id>` for the activity id. | pre-existing (base: `workflow-{id}/`) | Use the one designator the technique names for the workflow id. |

No High was raised, so none was withdrawn or downgraded. Checked and not recorded: the respond, resume and yield reply fields, `ends_activity`, replay only within the current visit, `blocked` and `completed` status, `flag_on > 0` reading false, and `meta/patterns/…` borrow resolution all match the engine; `workflow.yaml` listing only borrowed files matches `WorkflowFileSchema`; the format-conventions exit rules match `ExitSchema` and the loader.

## Files

- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/canon/resources/anti-patterns.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/canon/resources/design-principles.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/canon/resources/schema-construct-inventory.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/codebase-wiki/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/activities/patterns/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/resources/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/resources/workflow-canonical.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/variable-binding.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/TECHNIQUE.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/activity-worker.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/respond-checkpoint.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/take-activity.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/yield-checkpoint.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/ponytail/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/prism-audit/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/prism-audit/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/substrate-node-security-audit/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/work-package/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/work-packages/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-authoring/resources/elicitation-guide.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-authoring/resources/update-mode-guide.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/activities/05-impact-analysis.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/design-assumptions.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/elicitation-guide.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/format-conventions.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/impact-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/pattern-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/structural-inventory.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/update-mode-guide.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/TECHNIQUE.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/audit-rule-enforcement.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/impact-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/pattern-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/scope-definition.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/docs/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/routines/activity-loop.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-worker.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/compose-prompt.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/present-checkpoint-to-user.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/agent-conduct.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/02-gate-exit.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/techniques/hygiene-probe.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/workflow.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/walks/roster.json
