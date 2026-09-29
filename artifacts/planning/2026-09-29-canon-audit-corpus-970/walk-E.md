# Walk E: anti-patterns overview, entry identity, Tool-Technique-Doc Consistency, Execution, Output Economy

Canon home: `corpus/canon/resources/anti-patterns.md` on the #970 worktree (head 0d56c951). Engine authority for tool claims: `src/tools/workflow-tools.ts` and `src/tools/resource-tools.ts` on schema-description-hygiene.

## Units

- Overview — walked
- Entry identity — walked
- AP-71. no-false-resource-delivery — walked
- AP-72. complete-bootstrap-path — walked
- AP-73. consistent-tool-names — walked
- AP-74. no-duplicated-guidance — walked
- AP-75. describe-tool-value — walked
- AP-76. no-redundant-tools — walked
- AP-77. impl-before-confirmed-approach — not-applicable — "Authoring-session smells"; Detect: "File/workflow modifications begin before the user has confirmed the proposed approach". The surface is definition files and holds no session record to test against.
- AP-78. follow-through-on-recommend — not-applicable — "Authoring-session smells"; Detect: "The agent emits recommendations/analysis as the deliverable and stops". No session output is on the surface.
- AP-79. structure-backed-constraints — walked
- AP-80. preserve-readme-content — walked (the README hunks in #970 are term substitutions and one link fix; none removes or shrinks content)
- AP-81. verify-format-literacy — walked (all 56 guards pass on both heads, so the touched files were validated)
- AP-82. work-through-activities — walked (checked the definition prose for any instruction to combine or advance results outside declared activities; found none)
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
- AP-96. artifact-audience-declared — walked
- AP-97. link-named-artifacts — walked
- AP-98. no-next-step-narration — walked
- AP-99. statement-not-question — walked
- AP-100. runtime-rules-only — walked
- AP-101. no-caption-only-message — walked
- AP-102. no-technique-resource-dual-home — walked

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| E1 | Contract | Medium | AP-71 no-false-resource-delivery | `meta/techniques/workflow-engine/resume-from-checkpoint.md:16-18` `### effects`; `activity-worker.md:24-26` `### effects`; `resume-worker.md:24-26` `### effects`; `compose-prompt.md:20-23` `### effects` | Each consumer describes `{effects}` as "Variable updates carried by the resolved checkpoint". The producer, `respond-checkpoint.md:22-24` (changed in #970), now declares `effects` as the whole `respond_checkpoint` reply: `resolved_option`, `effect` {`setVariable`, `exit`}, `exit` {`id`, `next_activity`, `ends_activity`} and `dismissed`. The handler (`workflow-tools.ts:2911-2929`) returns exactly that. `activity-loop.yaml:165-183` carries it by name into `resume-worker` and on to the stub. | diff (the changed output contract breaks consumers whose lines were not edited; at the base, producer and consumers both said "variable updates") | Align each consumer `effects` description with the reply shape `respond-checkpoint` declares: the resolution, its effect and its exit. |
| E2 | Hygiene | Low | AP-73 consistent-tool-names | `meta/techniques/workflow-engine/TECHNIQUE.md:38` rule `variable-mutation-source`; `meta/techniques/variable-binding.md:67` rule `outputs-mutate-state-only-via-sanctioned-path` | The rewritten rule spells the `activity_complete` channel `variables-changed` and, in the same sentence, the `yield_checkpoint` argument `variables_changed`. The harness field, `next_activity`'s parameter and `finalize-activity`'s output are all `variables_changed`. `variable-binding.md:67`, also edited in #970, keeps `variables-changed`. | diff (both rules edited by #970; the hyphenated spelling was already there at the base) | Use `variables_changed` in both rules. |
| E3 | Hygiene | Low | AP-75 describe-tool-value | `meta/techniques/workflow-engine/present-checkpoint-to-user.md:30` Protocol §1 | "it returns the active checkpoint's message and options". `present_checkpoint` (`workflow-tools.ts:2721-2756`) returns the message and labels already rendered from the bag, the effects and auto-advance, and on each option a `consequence` {`exit`, `next_activity`, `ends_activity`}, which the handler comment says lets the presenter state each option's consequence before the user chooses. | pre-existing (closure file, unchanged) | Describe the real return, including the rendered text and each option's `consequence`. |
| E4 | Hygiene | Low | AP-86 exception-only-verdict-tables | `workflow-design/resources/impact-analysis.md:54-60` Template `## 2. Integrity checks` | A `Check`/`Verdict` table whose rows are all `Pass / Fail — [one line]`. Its expected steady state is all-pass, and no downstream step parses it. #970 only relabelled a row, "Transitions" to "Exits and graph". | pre-existing | Replace it with a one-line all-pass form plus a table of divergences only. |
| E5 | Hygiene | Low | AP-87 omit-null-sections | `workflow-design/resources/impact-analysis.md:64-70` Template `## 3. Removals inventory` | "[Empty table + "none" line when removal_count is 0.]": the template tells the writer to keep a headed section with an empty table for a null result. | pre-existing | Mark the section `[Omit if none]` and log the null in one line. |
| E6 | Hygiene | Low | AP-91 lifecycle-row-update | `workflow-design/resources/design-assumptions.md:42-47` Template `## Summary` | A per-category scorecard table (Surfaced / Audit-resolved / Confirmed / Corrected / Deferred / Total) kept in the persisted assumptions log beside the rows it counts. | pre-existing (#970 changed only a category row at :21) | Drop the persisted scorecard. Present the aggregates in-session; the log keeps one row per item. |
| E7 | Hygiene | Low | AP-92 resource-fills-not-does | `workflow-design/resources/format-conventions.md:61` `## Rules` | "Skip writing this artifact in review mode." A fill rule that says when the artifact is written, which is mode gating, rather than constraining its shape. | pre-existing | Move the mode gate to the persisting step's `when` (or its technique) and delete the rule. |
| E8 | Hygiene | Low | AP-100 runtime-rules-only | `meta/techniques/variable-binding.md:55-57` rule `outputs-by-name-and-path` | "Downstream `when` and `condition` gates reference a technique's output by its declared name or a dotted path … never via a redundant flattened flag or a prose glue step". This is an authoring standard for how gates are written. It is delivered to every worker through `techniques.activity`, and it restates `no-derived-state-shadow` and `no-set-of-technique-output`. | diff (#970 edited this rule's wording; the misplacement was already there at the base) | Remove it from `## Rules` and rely on the canon entries it restates. |
| E9 | Hygiene | Low | AP-100 runtime-rules-only | `meta/techniques/variable-binding.md:69-71` rule `generic-not-overfit` | "resolve a name mismatch by aligning the caller's bag variable … not by bending the technique to the call-site". This governs how definitions are written, not what a worker does at run time. | pre-existing | Migrate it to the design-time canon (principle 46 or an entry) and delete the rule. |
| E10 | Contract | Low | AP-102 no-technique-resource-dual-home | `workflow-design/techniques/audit-rule-enforcement.md:14` output `enforcement_findings` | The technique loads `structure-backed-constraints` (§1) as its "sole Detect / Do not flag / Fix source", yet restates that entry's Fix list, "(checkpoint, condition, validate action, or exit `when`)". #970 had to edit both copies in step (`anti-patterns.md:1032,1036` and this line). | diff | Keep the list in the entry. Describe the field as "the structural mechanism `structure-backed-constraints` prescribes". |
| E11 | Contract | Low | AP-102 no-technique-resource-dual-home | `workflow-design/techniques/impact-analysis.md:56,62,69` (Protocol §6, §7 and rule `content-preservation`) vs `workflow-design/resources/impact-analysis.md:82,84` `## Rules` | Both files state the removed-versus-preserved row obligation and the "own facts only, link design-specification and structural-inventory" rule. The resource even names the technique rule "(content-preservation)". | pre-existing | Keep the fill rules in the resource. The technique keeps the persist step and cites the template. |
| E12 | Hygiene | Low | AP-89 checkpoint-requires-decision | `specimens/schema-hygiene-conformance/activities/01-probe.yaml:16-23` checkpoint `confirm` | A single option, `confirmed`, whose `effect.exit: probed` selects the activity's only (default) exit and sets no variable. Every answer leads to the same next step. | diff (#971) | As the entry prescribes: convert it to an `action: message`. The roster reason says this gate exists to exercise a declared yield by id, so a fix that keeps the case gives the gate a second option with a distinct effect instead. |
| E13 | Hygiene | Low | AP-99 statement-not-question | `specimens/schema-hygiene-conformance/activities/01-probe.yaml:18` `confirm.message`; `02-gate-exit.yaml:25` `stop-here.message` | "Is the probe recorded?" and "End this activity here?" both end in `?` and open interrogatively. No sibling specimen declares a checkpoint, so there is no convention to follow. | diff (#971) | Rewrite each message as a statement of its subject (for example "The probe is recorded." / "The activity can end here, ahead of `after-gate`.") and leave the decision in `options[]`. |
| E14 | Hygiene | Low | Entry identity | `canon/resources/schema-construct-inventory.md:37,43,103,109,133,139,151,179,185,191,271,277,283,289,295,301,313` | The inventory cites entries by number, for example `[AP-15. procedure-in-protocol](./anti-patterns.md#ap-15-procedure-in-protocol)`. Entry identity says "Cite the kebab name in backticks. Do not cite the number". The number-bearing anchors break on any renumbering. | pre-existing (none of these lines is touched) | Cite each entry as its backticked kebab name, for example `procedure-in-protocol`. |

No High findings, so none to verify, withdraw or downgrade. Mediums spot-confirmed: E1 was re-derived from the handler (`workflow-tools.ts:2911-2929`) and each consumer file.

Considered and not recorded:

- AP-74: the ends-activity instruction ("run none of the remaining steps, and finalize the activity with the steps you ran") sits almost word for word in `yield-checkpoint.md:33` and `resume-from-checkpoint.md:30`. It is paraphrased in `activity-worker.md:48` and in the server's own reply text (`endsActivityInstruction`). Every one of these is a meta engine surface "whose domain is tool usage", which the entry's Do not flag excludes.
- AP-76: `take-activity.md:70` sends the reader to `get_workflow_status`. That tool returns an explicit `completed` status, which `next_activity` never reports for a `complete` target, so its output is not a subset.

Out of slice, for the owning walker:

- `workflow-design/activities/05-impact-analysis.yaml:63-65`: option `revise-impact` sets nothing and shares the only exit `done` with `confirmed`. That makes it close to a gate option that reaches no distinct path.
- Principle 9 (`design-principles.md:53`) still names only checkpoint, condition and validate action. AP-79, which cites it, now also lists exit `when`.

## Files

- corpus-schema-hygiene/corpus/README.md — read
- corpus-schema-hygiene/corpus/canon/resources/anti-patterns.md — read
- corpus-schema-hygiene/corpus/canon/resources/design-principles.md — read
- corpus-schema-hygiene/corpus/canon/resources/schema-construct-inventory.md — read
- corpus-schema-hygiene/corpus/codebase-wiki/activities/README.md — read
- corpus-schema-hygiene/corpus/meta/README.md — read
- corpus-schema-hygiene/corpus/meta/activities/README.md — read
- corpus-schema-hygiene/corpus/meta/activities/patterns/README.md — read
- corpus-schema-hygiene/corpus/meta/resources/README.md — read
- corpus-schema-hygiene/corpus/meta/resources/workflow-canonical.md — read
- corpus-schema-hygiene/corpus/meta/techniques/variable-binding.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/TECHNIQUE.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/activity-worker.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/respond-checkpoint.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/take-activity.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/yield-checkpoint.md — read
- corpus-schema-hygiene/corpus/ponytail/activities/README.md — read
- corpus-schema-hygiene/corpus/prism-audit/README.md — read
- corpus-schema-hygiene/corpus/prism-audit/activities/README.md — read
- corpus-schema-hygiene/corpus/substrate-node-security-audit/activities/README.md — read
- corpus-schema-hygiene/corpus/work-package/activities/README.md — read
- corpus-schema-hygiene/corpus/work-packages/README.md — read
- corpus-schema-hygiene/corpus/workflow-authoring/resources/elicitation-guide.md — read
- corpus-schema-hygiene/corpus/workflow-authoring/resources/update-mode-guide.md — read
- corpus-schema-hygiene/corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md — read
- corpus-schema-hygiene/corpus/workflow-design/README.md — read
- corpus-schema-hygiene/corpus/workflow-design/activities/05-impact-analysis.yaml — read
- corpus-schema-hygiene/corpus/workflow-design/activities/README.md — read
- corpus-schema-hygiene/corpus/workflow-design/resources/design-assumptions.md — read
- corpus-schema-hygiene/corpus/workflow-design/resources/elicitation-guide.md — read
- corpus-schema-hygiene/corpus/workflow-design/resources/format-conventions.md — read
- corpus-schema-hygiene/corpus/workflow-design/resources/impact-analysis.md — read
- corpus-schema-hygiene/corpus/workflow-design/resources/pattern-analysis.md — read
- corpus-schema-hygiene/corpus/workflow-design/resources/structural-inventory.md — read
- corpus-schema-hygiene/corpus/workflow-design/resources/update-mode-guide.md — read
- corpus-schema-hygiene/corpus/workflow-design/techniques/TECHNIQUE.md — read
- corpus-schema-hygiene/corpus/workflow-design/techniques/audit-rule-enforcement.md — read
- corpus-schema-hygiene/corpus/workflow-design/techniques/impact-analysis.md — read
- corpus-schema-hygiene/corpus/workflow-design/techniques/pattern-analysis.md — read
- corpus-schema-hygiene/corpus/workflow-design/techniques/scope-definition.md — read
- corpus-schema-hygiene/docs/README.md — read
- corpus-schema-hygiene/corpus/meta/routines/activity-loop.yaml — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-worker.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/compose-prompt.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/present-checkpoint-to-user.md — read
- corpus-schema-hygiene/corpus/meta/techniques/agent-conduct.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/README.md — read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/README.md — read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml — read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/02-gate-exit.yaml — read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/techniques/hygiene-probe.md — read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/workflow.yaml — read
- specimen-schema-hygiene/walks/roster.json — read
