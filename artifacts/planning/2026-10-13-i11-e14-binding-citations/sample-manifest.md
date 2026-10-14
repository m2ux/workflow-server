# Sample Read-Set Manifest — Plan Mode

Derived from the citations in [the sample mode file](sample-plan-mode.md), against the sections those citations name on `3c0f1ff5`. A section runs to the next heading of equal or higher level, which is the boundary the Linked sections rule states. The Case column carries the word the sentence opens with; a row with none is loaded whenever its step runs.

## Read set

| Step | File | Section | Lines | Case |
| --- | --- | --- | --- | --- |
| Prerequisites | `../SKILL.md` | #command-conventions | 25 | every run of this step |
| 1. Take the proposal | `propose-mode.md` | #procedure | 29 | When |
| 2. Planning record | `commands.md` | #add-planning-record | 14 | every run of this step |
| 2. Planning record | `planning-layout.md` | #planning-layout | 21 | every run of this step |
| 2. Planning record | `../templates/pull-request.md` | (whole file) | 25 | every run of this step |
| 3. Draft bodies | `work-breakdown.md` | #problem-and-proposal | 9 | every run of this step |
| 3. Draft bodies | `review-criteria.md` | #initiative | 77 | every run of this step |
| 3. Draft bodies | `requirement-characteristics.md` | #individual | 23 | every run of this step |
| 3. Draft bodies | `review-criteria.md` | #verified | 5 | every run of this step |
| 3. Draft bodies | `work-breakdown.md` | #coverage-reports | 10 | every run of this step |
| 3. Draft bodies | `work-breakdown.md` | #delivery | 196 | every run of this step |
| 3. Draft bodies | `work-breakdown.md` | #tables | 46 | every run of this step |
| 3. Draft bodies | `commands.md` | #check-dependencies | 15 | every run of this step |
| 3. Draft bodies | `work-breakdown.md` | #work-item | 17 | every run of this step |
| 3. Draft bodies | `work-breakdown.md` | #test-coverage | 7 | every run of this step |
| 4. Review the drafts | `review-passes.md` | #fetch | 9 | every run of this step |
| 4. Review the drafts | `review-passes.md` | #goal-pass | 20 | every run of this step |
| 4. Review the drafts | `review-criteria.md` | #trace | 6 | every run of this step |
| 4. Review the drafts | `review-criteria.md` | #whole | 4 | every run of this step |
| 4. Review the drafts | `review-passes.md` | #report | 9 | every run of this step |
| 5. Create issues | `commands.md` | #create-issue | 8 | every run of this step |
| 5. Create issues | `commands.md` | #patch-body | 8 | every run of this step |
| 5. Create issues | `../templates/task.md` | (whole file) | 23 | Where |
| 5. Create issues | `commands.md` | #check-format | 14 | every run of this step |
| 6. Review | `review-passes.md` | #procedure | 84 | every run of this step |
| 7. Keep in step | `commands.md` | #delivery-state | 10 | every run of this step |
| 7. Keep in step | `commands.md` | #sync-epic | 20 | every run of this step |
| 7. Keep in step | `work-breakdown.md` | #unplaced | 4 | every run of this step |
| 8. Ready the epic | `work-breakdown.md` | #epic-prerequisites | 6 | every run of this step |
| 8. Ready the epic | `work-breakdown.md` | #missing-branches | 6 | every run of this step |
| 8. Ready the epic | `commands.md` | #retarget-pull-request | 8 | every run of this step |
| 8. Ready the epic | `interview.md` | #rules | 8 | every run of this step |
| 8. Ready the epic | `review-criteria.md` | #shared-acceptance-criteria | 17 | every run of this step |
| 8. Ready the epic | `review-criteria.md` | #one-row | 4 | every run of this step |
| 9. Deliver | `sync-mode.md` | #sync-mode | 221 | Once |
| Rules | `review-criteria.md` | #initiative-acceptance-criteria | 10 | every run of this step |
| Rules | `work-breakdown.md` | #corpus-audit | 16 | when an epic changes definitions |
| Rules | `work-breakdown.md` | #technical-debt | 23 | when a theme defers debt |

Thirty-eight sections. 1057 lines if every step runs and every case holds.

## What it shows

- **Two sections carry a fifth of the payload each.**
  `work-breakdown.md#delivery` is 196 lines, pulled at step 3 by one sentence about how the initiative closes, and `sync-mode.md#sync-mode` is 221, which is the mode switch at step 9 rather than a read Plan mode needs for itself. Together they are 40 percent of the set.
- **Step 3 is half the file's cost.**
  Nine sections, 400 lines, for drafting bodies. The manifest is where a maintainer sees that before deciding whether a step is doing too much.
- **The entry point's own cost is one section.**
  The conventions are 25 lines, read once, because they stand where every mode already opens.

## What the generator must handle

- **A citation outside the Procedure belongs to its own section, not the last step.**
  The three Rules rows above were attributed to step 9 by the draft generator, since it tracked the most recent numbered step. The rule's own heading is the unit, and its case is the one the rule states.
- **A case the prose states in words, not an opener.**
  `#corpus-audit` and `#technical-debt` are read when a rule applies, which the sentence states without a leading case word. The generator records the rule's condition rather than leaving the cell blank, so the reader is not told these load on every run.
- **A whole-file row needs its reason.**
  `../templates/task.md` and `../templates/pull-request.md` carry no heading of their own, so they are whole-file rows by exception rather than by an author's choice.
