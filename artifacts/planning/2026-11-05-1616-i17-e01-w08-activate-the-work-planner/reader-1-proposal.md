# Proposed Correction

Change only the first sentence of **Dependent instructions** in `skills/work-planner/guidelines.md`, under **Procedure** (source line 32), to:

> Put instructions that handle an action's specific output immediately after that action, with each condition naming the action and its returned value.

Keep the rest of that paragraph:

> Keep detail flush beneath the step heading. Name the returned object explicitly when a pronoun would leave its referent unclear.

This gives each condition an explicit action and returned-value referent while preserving the rule's placement and layout requirements. The neighboring Explicit execution, Separate actions, List introductions and Branch headers rules already cover selection, sequence and continuation. No new rule, heading, link, prerequisite, script or consumer edit is proposed. `rules.json` already maps `procedure/dependent-instructions` to `review`.

# Validation Plan — Prepared, Not Executed

1. Review the proposed paragraph against both complete guidelines. Check its one-home placement, present-tense prose, single-line paragraph and flush detail layout. Confirm the neighboring branch and continuation rules remain compatible.
2. Review representative procedure examples containing two actions with different return values. For every conditional instruction, identify the named governing action and its returned value without relying on a pronoun. Include adjacent conditional groups and an action common to all branches; confirm the latter has the explicit continuation the existing rule requires. This is semantic review: the mapped `review` operation means a structural checker alone cannot establish clarity.
3. After applying the proposal in an authorized editable checkout, run its structural check from that checkout: `<workspace>/scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`. Resolve reported findings; distinguish existing findings from those caused by the paragraph. Do not report this as validation of the frozen proposal until run on the applied text.
4. Record a disclosure trace for the affected Revise scenario: SKILL.md → Rules and Conventions → Revise Mode → both whole-file guidelines → selected local check. Reuse those complete prerequisites. This proposal changes no reading route, so fresh-reader live routing trials are not required by the conditional live-check rule. If implementation changes links or routing, add the required independent trials and record any unavailable validation as an evidence gap.

Executable scripts, consumed templates, tests, SKILL.md frontmatter and section locations do not change, so script tests, frontmatter verification and section-move comparison are not selected for this wording-only proposal.

# Executed Review and Result

- Read the entry point, Rules, Conventions, Revise Mode and both complete guidelines; the truncated portion of Work Planner's guidelines was recovered in a focused read.
- Located the owning paragraph, compared its neighboring rules, and searched for consumers and the rule's review mapping. Modes, protocols and artifact operations inherit the Procedure rules through the existing guidance. No additional wording home was identified by the focused search.
- Prepared the one-sentence correction and validation plan. No structural check, Python command, test suite or live reader trial was run. No validation of applied source is claimed.
- No blocker to this bounded proposal. The frozen source was not edited. No branch/worktree, commit, push, network call or tracker mutation was performed.
