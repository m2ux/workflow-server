# Walk 2 B — Design Principles 25–47 plus overview; Convention Conformance (fix surface)

Canon read at #970 head 1df70bd2. Fix commits walked: 1df70bd2 (parent 0d56c951) and 4ef2c6d6 (parent 8a7dc934). Covering entries followed as in the first pass: 25 → AP-110, AP-114; 26 → AP-114, AP-158; 27 → AP-115, AP-123; 28 → AP-116; 30 → AP-46; 31 → AP-59; 32 → AP-134, AP-139; 33 → AP-145; 36 → AP-157; 37 → AP-42; 38 → AP-160; 39 → AP-156; 44 → AP-134, AP-139; 45 → AP-152. Engine claims were checked against /home/mike1/projects/dev/workflow-server/.worktrees/schema-description-hygiene/src/tools/workflow-tools.ts: the yield_checkpoint replay payload (lines 2489-2525), the resume_checkpoint response (lines 2636-2688) and the respond_checkpoint reply (lines 2912-2931).

Neither fix commit edits a guard ledger.

## Units

- Overview (design-principles `# Overview`) — walked. Principle 43 now states one invariant, and B5 no longer fires.
- 25. Bind Sibling Techniques as Steps — walked. The activity-worker note "apply resume-from-checkpoint in place of opening at the first step" follows the Apply form the workflow-engine siblings share, so it is not recorded.
- 26. A Technique Is a Reading — walked. yield-checkpoint now leaves the argument shape to the tool schema, and B3 no longer fires.
- 27. State Contract Contribution — walked
- 28. Creation Guide for Generated Documents — walked
- 29. Cite Resource Policy; Do Not Restate It — walked
- 30. Resources Stay Abstract — walked
- 31. Isolate Conditional Branches as Notes — walked. yield-checkpoint phase 1 and resume-from-checkpoint phase 3 now carry their branches as `>` notes, and B4 no longer fires. Conditional bullets that open with "Where" or "If" (resume-from-checkpoint:39, finalize-activity:78, evaluate-transition:46) are a form the engine siblings share, so they are not recorded.
- 32. Cite Resources at Section Grain — walked
- 33. Pre-Session Prose Stands Alone — walked. No fix-surface file is delivered by `discover`.
- 34. Edit the Owner — walked
- 35. Prefer Removing the Thing That Needs a Prohibition — walked
- 36. A Technique Names Only What Its Reader Holds — walked
- 37. An I/O Contract Names the Value — walked
- 38. A Relocation Records the Outcome It Keeps — walked. Each move states the outcome it keeps at the receiving site:
  - The ends-activity finalize moved from the activity-worker step-3 note and the yield-checkpoint rule into resume-from-checkpoint phase 3, activity-worker phase 5 and the replayed branch.
  - The declared-yield and blocked-status cases moved from `confirm` to `stop-here` in the specimen README.
  - The `outputs-by-name-and-path` rule was a duplicate of variable-binding Protocol phase 4, and nothing else cites it.
- 39. A Phase Heading Names the Outcome — walked
- 40. Fan-Out Lives at the Layer That Runs the Work — walked
- 41. A Phase States Answers the Tool Has Returned — walked. Each field the checkpoint techniques read is in the handler reply: `exit`, `exit.ends_activity`, `resolved_option`, `effect`, `variables_changed`, and the refusal texts.
- 42. A Routine Holds the Codified Path — walked
- 43. A Workflow Borrows Activities — walked. The cited anchor `schema-construct-inventory.md#compose-or-reuse-activities` exists and states the reference form. No stale `#43-an-activity-reuses-activities` anchor remains in either worktree.
- 44. A Resource Splits for Section Delivery — walked. The pre-`##` framing in workflow-authoring/resources/impact-analysis.md:11 is orientation only.
- 45. A Rule States One Invariant — walked. `local-marker` now states one invariant, and B6 no longer fires.
- 46. A Consumer Binds the Contract — walked. `selected_exit` is now a declared output of yield-checkpoint and resume-from-checkpoint, under the name finalize-activity and evaluate-transition read. Each pattern's `done` exit is bound by its borrower.
- 47. A Calibrated Surface Extends by Wrapping — walked. No schema or measured surface is on the fix surface.
- Convention Conformance (whole file, `## Reference Conventions`) — walked. What the sweep found:
  - The three meta pattern activities place `exits` between `steps` and `outcome`, the order 191 activity files use.
  - The specimen workflow.yaml now lists `activities:` after `graph`, as remediate-vuln does (B14 no longer fires).
  - The specimen README's `## Copying from it` matches mvw's shape (B13 no longer fires).
  - The probe step has an `id` (B11 no longer fires).
  - The checkpoint messages are statements (B12 no longer fires).
  - The workflow-authoring impact-analysis row now names exits and graph. It keeps that twin's plain-language column style, a divergence the twin carries throughout, so it is justified (B10 no longer fires).
  - The specimen activity descriptions are noun phrases where most specimen siblings are imperative. They follow first-pass finding A9 ("state what each construct is"), so the divergence is justified.

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| B1 | Contract | Medium | 34. Edit the Owner | corpus/meta/techniques/workflow-engine/activity-worker.md:26, resume-from-checkpoint.md:18, resume-worker.md:26, compose-prompt.md:22 (each `### effects`) against the owner respond-checkpoint.md:24 (`### effects`) | Each reader now reads "…the option taken, its effect, and the exit it selected, or its dismissal". That is the owner's four fields (`resolved_option`, `effect`, `exit`, `dismissed`) restated in prose. A field the owner adds forces four edits just to keep agreeing. None of the readers relies on the list: resume-from-checkpoint takes `exit` from the `resume_checkpoint` response, not from `{effects}`. The commit body says the readers "cite respond-checkpoint's declaration", but none links it. | known — B1 (the reader entries were rewritten in the fix, and the field list survives in them) | Name the value alone ("The resolved checkpoint's reply") in each reader and drop the field enumeration |
| B15 | Hygiene | Low | 34. Edit the Owner | corpus/meta/activities/patterns/README.md:39 (How to consume, item 1) | "Each pattern declares one exit, `done`, which the borrower binds to the activity that follows it." This restates a count and an id held in 02-supervisor.yaml:60, 03-plan-and-execute.yaml:85 and 05-lead-researcher.yaml:82, so a pattern that gains an exit forces a README edit. Items 2 and 3 of the same list send the reader to the file instead ("read them off the `.yaml`"). | diff | Say the borrower's `graph` binds every exit the pattern declares, and send the reader to the `.yaml`, as items 2 and 3 do |
| B16 | Hygiene | Low | Convention Conformance (naming or structural patterns against siblings) | corpus/codebase-wiki/activities/README.md:43 (`## Graph`) | "Transition map" became `## Graph`. Every sibling activity README that heads its flow diagram calls the section a flow: `## Flow` (prism-update:17, work-packages:15) or `## Main Flow` (midnight-system-review:11, substrate-node-security-audit:11). `## Graph` is the only one named after the construct. | diff | Head the section `## Flow`, as the siblings do |

No finding is rated High, and no High was withdrawn or downgraded.

One observation outside this slice's entries, for the rule-hygiene slice: specimen techniques/hygiene-probe.md:26 now reads "`{probe_recorded}` is set by the Record step alone". The rule is scoped to one Protocol phase. It also shares the name "Record" with the new activity step id `record` in 01-probe.yaml:15, while 02-gate-exit's `numeric-flag` and `numeric-count` steps set the same variable through the same technique.

## Files

- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/canon/resources/design-principles.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/codebase-wiki/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/activities/patterns/02-supervisor.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/activities/patterns/03-plan-and-execute.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/activities/patterns/05-lead-researcher.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/activities/patterns/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/variable-binding.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/TECHNIQUE.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/activity-worker.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/compose-prompt.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/finalize-activity.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/respond-checkpoint.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-worker.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/yield-checkpoint.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/midnight-system-review/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/prism-evaluate/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/prism-update/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/specimens/fan-conformance/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/specimens/git-pin-conformance/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/specimens/gitnexus-radius-conformance/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/specimens/routine-conformance/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/substrate-node-security-audit/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/work-package/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/work-packages/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-authoring/resources/impact-analysis.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/audit-rule-enforcement.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/scope-definition.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/evaluate-transition.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/02-gate-exit.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/techniques/hygiene-probe.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/workflow.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/walks/roster.json — read
