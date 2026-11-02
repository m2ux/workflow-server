# Review

Plan Mode step 5, Review Initiative Goal, over the drafts in this record. Format results: `format.py` at `785a5ee8c` over each draft snapshot. Ordering: the [dependency report](dependencies.txt).

## Round 1

### Criteria

- **R1-1. Initiative criteria restated single epic criteria.**  Major.
  - Problem: initiative AC3 to AC6 and AC10 to AC11 each restated one epic criterion. Source: initiative-issue-body.md Initiative Acceptance Criteria, "One that restates a single epic's criterion is a duplicate".
  - Resolution: raised to what the epics achieve together; the initiative carries eight criteria, link scope, operators and check definitions each one outcome. Applied.
- **R1-2. AC3 joined two invariants.**  Minor.
  - Problem: `format.py`: "AC3 may state several invariants; state one per criterion".
  - Resolution: restated as one condition, no link compiling content its reader need not have. Applied; format clear.
- **R1-3. AC1 restates E03 AC2.**  Minor.
  - Problem: the same duplicate rule.
  - Resolution: kept; AC1 is goal clause G1 verbatim and E03 AC2 is the row that makes it true. Recorded.

### Format

- **R1-4. Change narrative in References.**  Minor.
  - Problem: `format.py`: "References: change narrative ... state the plan as it is", on the word superseded.
  - Resolution: the #1427 entry states what it holds. Applied.
- **R1-5. E01 subtitle over ten words, and title name over three.**  Minor.
  - Problem: `format.py`: "title subtitle runs to 11 words"; Issue Body Titles, "The name is two or three words".
  - Resolution: `[I16:E01] Check Definitions: Each Check Defined in the Shared Guide, Named by Link`. Applied.

### Ordering

- **R1-6. Implied and missing epic edges.**  Minor.
  - Problem: `deps.py`: "E03:W01: E00:W01 is already implied by E02:W03"; "initiative E02: Depends on should be E00"; "initiative E03: Depends on should be E02".
  - Resolution: dropped the implied edge and set both initiative cells. Applied; the report shows no problem.
- **R1-7. Component contention.**  Advisory.
  - Problem: E00 and E01 both extend `skills/guidelines.md` and `skills/scripts/check_skill_files.py`; E02 and E03 both extend `SKILL.md` and `deliver-mode.md`.
  - Resolution: the proposed priority map separates each contending pair by a number.

### Outside Threats

- **R1-8. A shared-check caller this work never edits.**  Major.
  - Problem: `skills/workflow-canon/references/revise-mode.md` lines 72 to 73 run the shared check over workflow-canon, which would take every new finding.
  - Resolution: E00 AC10 holds the prosiform findings to the skills named to them; how a skill is named is OQ2.
- **R1-9. An absent instrument could pass silently.**  Major.
  - Problem: a check that skips the compile when `pf` is missing would report a clean skill.
  - Resolution: E00 AC9 makes an absent or mismatched `pf` a finding.
- **R1-10. The instrument's version moves the measurements.**  Major.
  - Problem: installed `pf` is `skill-markdown-v1`; prosiform main is `skill-markdown-v4`, whose guide the bootstrap needs. See [evidence](evidence.md#instrument).
  - Resolution: E03 AC3 compares both revisions with one version; which version is OQ1.
- **R1-11. The stated baseline does not resolve here.**  Major.
  - Problem: `93dad5b9` is an md-composer commit; `git cat-file` in workflow-server: "Not a valid object name 93dad5b9".
  - Resolution: OQ3, recommending workflow-server `ed508443`, markdown-identical.
- **R1-12. A finding against the skill's own files before it conforms.**  Minor.
  - Problem: holding Work Planner to the findings before E02 and E03 land would leave a finding on each branch between.
  - Resolution: E03 W02 names Work Planner to the findings once every mode compiles within the budget.

### Skill

- **R1-13. Discussion branch conflicts with the shared engineering worktree.**  Advisory.
  - Problem: planning-record.md Add Planning Record, "The engineering branch takes no further worktree and no branch", against Plan Mode step 2's draft discussion pull request from a planning branch.
  - Resolution: OQ4.
- **R1-14. Same-board reference.**  Advisory.
  - Problem: issue-body.md References, "An issue's References section does not link issues or pull requests on the same board"; #1427 stands on board 17.
  - Resolution: OQ5.

## Round 2

Review Initiative Goal repeated over the revised bodies: every clause traces to a criterion, every criterion to an epic and a task row ([trace](trace.md)); `format.py` reports nothing to fix, apply or decide on any draft; `deps.py` reports no problem. No content or structural finding remains. Open Questions OQ1 to OQ5 stand for the user, and the epic Open Questions carry OQ1 to OQ3.
