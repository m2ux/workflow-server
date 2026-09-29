# Walk E (second pass): anti-patterns overview, entry identity, Tool-Technique-Doc Consistency, Execution, Output Economy

Canon home: `corpus/canon/resources/anti-patterns.md` on the #970 worktree (head 1df70bd2). Tool authority: `src/tools/workflow-tools.ts` on schema-description-hygiene, plus `src/tools/resource-tools.ts` and `src/loaders/workflow-loader.ts` where a claim is settled there. Surface: the 37 paths in fix-surface.txt. Fix commits: 1df70bd2 (parent 0d56c951) and 4ef2c6d6 (parent 8a7dc934). Neither commit edits a guard ledger.

## Units

- Overview — walked
- Entry identity — walked
- AP-71. no-false-resource-delivery — walked
- AP-72. complete-bootstrap-path — walked
- AP-73. consistent-tool-names — walked (every tool name on the surface exists on the harness; `variables-changed` no longer appears)
- AP-74. no-duplicated-guidance — walked
- AP-75. describe-tool-value — walked
- AP-76. no-redundant-tools — walked
- AP-77. impl-before-confirmed-approach — not-applicable — "Authoring-session smells"; Detect: "File/workflow modifications begin before the user has confirmed the proposed approach". The surface is definition files, with no session record to test.
- AP-78. follow-through-on-recommend — not-applicable — "Authoring-session smells"; Detect: "The agent emits recommendations/analysis as the deliverable and stops". No session output is on the surface.
- AP-79. structure-backed-constraints — walked
- AP-80. preserve-readme-content — walked
- AP-81. verify-format-literacy — walked (56 of 56 guards pass on both heads)
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
| E1 | Live | Medium | AP-71 no-false-resource-delivery | `meta/techniques/workflow-engine/activity-worker.md:38` Protocol §1, and `:101` rule `batch-ends-where-the-server-says` | §1 says "Read `may_continue` from the `batch:` block leading that response". The rule says "Each `get_activity` opens with a `batch:` block". The handler appends the block after the body: `text: responseText + batchBlock` (`workflow-tools.ts:2347,2408`). The tool description agrees: "a `batch` block at the end of the response" (`:1700`). A worker that looks at the head of the response finds the ops bundle and no reading. That is the failure engine commit 81cd595d cites (#473): workers inferred `may_continue` because none was in view. | pre-existing (same text at base ba2ee7b6 and at parent 0d56c951; the fix edited other lines of this file) | Say the `batch:` block ends the response, and `_meta.batch` carries the same reading, in both places. |
| E2 | Hygiene | Low | AP-100 runtime-rules-only | `meta/techniques/variable-binding.md:65-67` rule `generic-not-overfit` | "resolve a name mismatch by aligning the caller's bag variable … not by bending the technique to the call-site". This governs how definitions are written, not what a worker does at run time. | known — E9 | Migrate it to the design-time canon and delete the rule. |
| E3 | Hygiene | Low | AP-100 runtime-rules-only | `meta/techniques/variable-binding.md:37-39` `signature-is-the-contract`; `:41-43` `binding-carries-only-deviations`; `:69-71` `activity-group-shorthand` | Each rule mixes a runtime reading with authoring standards that would apply in any unrelated authoring session. The authoring clauses: "Keep signatures complete: every `{name}` a technique's protocol reads is a declared input" (this restates `technique-inputs-declared` / `technique-outputs-declared`); "a step with no deviation uses the bare-string form … an input equal to its default … is omitted" (the YAML shape of `step.technique`); "Techniques from any OTHER group … are always written qualified". All three are delivered to every worker through `techniques.activity`. | pre-existing (unchanged by either fix; the fix removed the sibling `outputs-by-name-and-path` for this reason) | Strip the authoring clauses from `## Rules` and keep the binding reading. Migrate the clauses to the canon or construct inventory entry that covers them. |
| E4 | Hygiene | Low | AP-86 exception-only-verdict-tables | `workflow-authoring/resources/impact-analysis.md:54-60` Template `## 2. Integrity checks` | A `Check` / `Verdict` table whose three rows are each `Pass / Fail — [one line]`. Its expected steady state is all-pass. No workflow-authoring step parses it: the technique only assembles it (`techniques/workflow-definition/impact-analysis.md:78`). The fix relabelled row `:58` to "Exits and graph" and bumped the guide to 1.1.0, but kept the table's shape. This is the twin of the first pass's E4 on the workflow-design copy. | pre-existing | Replace it with a one-line all-pass form plus a table of divergences only. |

No High findings, so none to verify, withdraw or downgrade. E1 was re-derived from the handler (lines 2347 and 2408, with the tool description at 1700), from the base and parent copies of `activity-worker.md`, and from commit 81cd595d.

First-pass findings on fix-surface files, re-checked:

- E1 no longer fires. The four `effects` readers now match the reply `respond-checkpoint` declares: the option taken, its effect, the exit, or the dismissal.
- E2 no longer fires. `TECHNIQUE.md:38` and `variable-binding.md:63` spell `variables_changed`.
- E8 no longer fires. `outputs-by-name-and-path` is deleted and nothing cites it.
- E10 no longer fires. `audit-rule-enforcement.md:14` cites `structure-backed-constraints` for the mechanism.
- E12 no longer fires. `confirm` is removed. `stop-here` has two options, and they lead to different next steps: `halt` is immediate and skips `after-gate`, while `go-on` runs it.
- E13 no longer fires. `stop-here.message` is a statement.
- E9 still fires (E2 above).

Considered and not recorded:

- `yield-checkpoint.md:31`: "A declared gate is yielded by its id alone" follows "passing … as `variables_changed`". This matches the tool's "An id the activity declares needs nothing else". The note under it sets the contrast as `message`/`options`, so the claim is accurate.
- AP-98 on `02-gate-exit.yaml:25`, "The activity can end here, ahead of after-gate.". This states the decision's subject, as AP-99's Fix prescribes. It does not narrate what runs next.
- AP-74, two cases. Neither is flagged, because the entry's Do not flag excludes "A meta surface whose domain is tool usage":
  - The ends-activity finalize instruction sits in `yield-checkpoint.md:38`, `resume-from-checkpoint.md:41` and `activity-worker.md:61`.
  - A continuation calls `resume_checkpoint` twice: once from the stub (`compose-prompt.md:44`) and again from `resume-from-checkpoint.md:30`. AP-76 does not fire either, because it is the same tool, not a strict subset of another.
- AP-80 on `meta/activities/patterns/README.md:39`. The copy recipe it dropped became false once each pattern declares `done`, and the commit body lists the removal.
- AP-84 on `workflow-design/README.md:177`. The definitions write the retrospective as a section of `COMPLETE.md` (`resources/completion-artifact.md:10,54`), so the design has a single close-out artifact.

Out of slice, for the owning walker:

- `finalize-activity.md:78` reads `{selected_exit}`, which finalize-activity does not declare among its Inputs. The value now comes from outputs that `resume-from-checkpoint` and `yield-checkpoint` declare.
- The commit body says the `effects` readers "cite respond-checkpoint's declaration". In fact `activity-worker.md:26`, `compose-prompt.md:22`, `resume-from-checkpoint.md:18` and `resume-worker.md:26` each restate the shape in the same words, with no link to `respond-checkpoint.md:24`. That is a second home for the shape (principle 6 / `cited-home-owns-claim`), and it is the same coupling that made first-pass E1.
- `hygiene-probe.md:26` `local-marker` says "`{probe_recorded}` is set by the Record step alone". `02-gate-exit.yaml:15-22` binds `hygiene-probe` twice more, and each bind sets `probe_recorded`. So the rule is false wherever "Record step" is read as the step `record` in `probe`.
- `finalize-activity.md:68` and `evaluate-transition.md:40` pass `workflow_complete` to `next_activity` as `exit` when no exit is declared. The `next_activity` schema says "an exit the activity does not declare warns" (`workflow-tools.ts:1232`).
- `workflow-design/README.md:236-246`: the file tree places `design-principles.md`, `schema-construct-inventory.md`, `anti-patterns.md` and `convention-conformance.md` under `workflow-design/resources/`. They live under `canon/resources/`.
- Principle 9 (`design-principles.md:53`) still names only checkpoint, condition and validate action. `structure-backed-constraints` also lists exit `when`. The first pass noted the same.

## Files

- corpus-schema-hygiene/corpus/canon/resources/design-principles.md — read
- corpus-schema-hygiene/corpus/codebase-wiki/activities/README.md — read
- corpus-schema-hygiene/corpus/meta/activities/patterns/02-supervisor.yaml — read
- corpus-schema-hygiene/corpus/meta/activities/patterns/03-plan-and-execute.yaml — read
- corpus-schema-hygiene/corpus/meta/activities/patterns/05-lead-researcher.yaml — read
- corpus-schema-hygiene/corpus/meta/activities/patterns/README.md — read
- corpus-schema-hygiene/corpus/meta/techniques/variable-binding.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/README.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/TECHNIQUE.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/activity-worker.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/compose-prompt.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/finalize-activity.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/respond-checkpoint.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-worker.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/yield-checkpoint.md — read
- corpus-schema-hygiene/corpus/midnight-system-review/activities/README.md — read
- corpus-schema-hygiene/corpus/prism-evaluate/activities/README.md — read
- corpus-schema-hygiene/corpus/prism-update/activities/README.md — read
- corpus-schema-hygiene/corpus/specimens/fan-conformance/activities/README.md — read
- corpus-schema-hygiene/corpus/specimens/git-pin-conformance/activities/README.md — read
- corpus-schema-hygiene/corpus/specimens/gitnexus-radius-conformance/activities/README.md — read
- corpus-schema-hygiene/corpus/specimens/routine-conformance/activities/README.md — read
- corpus-schema-hygiene/corpus/substrate-node-security-audit/activities/README.md — read
- corpus-schema-hygiene/corpus/work-package/README.md — read
- corpus-schema-hygiene/corpus/work-packages/activities/README.md — read
- corpus-schema-hygiene/corpus/workflow-authoring/resources/impact-analysis.md — read
- corpus-schema-hygiene/corpus/workflow-design/README.md — read
- corpus-schema-hygiene/corpus/workflow-design/techniques/audit-rule-enforcement.md — read
- corpus-schema-hygiene/corpus/workflow-design/techniques/scope-definition.md — read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/evaluate-transition.md — read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/README.md — read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml — read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/02-gate-exit.yaml — read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/techniques/hygiene-probe.md — read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/workflow.yaml — read
- specimen-schema-hygiene/walks/roster.json — read
