# Review Mode

Checks existing proposal, initiative, epic, task and standalone issues against their templates and against the rules that bind them, and fixes them.

## Procedure

1. **Select.**  Review the issues the user names, or an initiative with its open epics.
   - Review covers open issues only. A closed issue is reviewed only when named.
   - Naming another initiative's issue approves format edits to it.
   - An open standalone issue that a reviewed initiative, epic or task cites is reviewed with it.
2. **Fetch.**
   Fetch each issue whole, with its initiative when it is an epic, its epics when it is an initiative, and the standalone issues it cites, with [Fetch Issue](commands.md#fetch-issue).
   - An initiative's fetch includes every epic its table links, closed epics included, and its format check takes each with `--epic`.
   - A closed epic's own body is checked only when the epic is named.
3. **Check.**
   Check each issue with [Check Format](commands.md#check-format): an epic with its initiative's JSON, an initiative with each of its epics', a proposal with neither. It reports three kinds of finding:
   - **Fixed.**
     Structural changes that keep the wording, already made in `fixed-943.md`, with the body diff printed.
   - **Apply.**  A title or label change to make on the issue.
   - **Decide.**  Anything needing new content or a judgement.
4. **Apply the mechanical fixes.**
   - Apply them without asking.
   - Read the diff to confirm it changes structure only, then [Patch Body](commands.md#patch-body) from `fixed-943.md`.
   - Make the title and label changes the check names, with [Retitle Issue](commands.md#retitle-issue), [Add Labels](commands.md#add-labels) and [Remove Label](commands.md#remove-label).
5. **Check the rules.**
   Run the [Review Passes](review-passes.md) on the issues under review: the goal pass, the consistency pass, and the ordering pass.
   - A proposal, against [Propose Mode](propose-mode.md)'s Problem scope rule.
   - An initiative or epic body, against the [Work Breakdown Guide](work-breakdown.md)'s [Rules](work-breakdown.md#rules) and the skill's [Rules](../SKILL.md#rules) for what a body states.
6. **Decide.**
   Check every issue under review against each rule in this mode's Rules from Missing section through Several tasks, and decide the finding with the user. Draft the content the rule states.
7. **Check criteria.**
   Check every acceptance criterion of the issues under review against the [Goal Pass](review-passes.md#goal-pass) Verifiable rule, and report each a test cannot fail. This mode's Criteria check rule says when the review is clear.
8. **Check Dependencies.**
   - Check them whenever an initiative or epic is reviewed: take the initiative's and every epic's body with [Fetch Body](commands.md#fetch-body), and run [Check Dependencies](commands.md#check-dependencies).
   - Put each problem it reports to the user as in Decide. An initiative Depends on cell takes the epics it derives.
9. **Coverage.**
   For each epic under review, [Fetch Initiative Pull Requests](commands.md#fetch-initiative-pull-requests) and run [Match Pull Requests](commands.md#match-pull-requests).
   - **Unmet.**
     A task whose id links a merged pull request while a criterion its Coverage names is unticked, as the [Work Breakdown Guide](work-breakdown.md#tables) defines.
   For an initiative under review, [Fetch Initiative Pull Requests](commands.md#fetch-initiative-pull-requests) and run [Sync Initiative](commands.md#sync-initiative) with every epic its table links.
   - **Ready to verify.**
     An initiative criterion [Sync Mode](sync-mode.md) reports ready to verify: every epic that cites it is delivered, and the criterion is unticked.
   - **Ticked early.**
     An initiative criterion [Sync Mode](sync-mode.md) reports ticked early: it is ticked while an epic that cites it is undelivered.
   Put each to the user. Verifying and ticking it is [Sync Mode](sync-mode.md). The report follows [Coverage Reports](work-breakdown.md#coverage-reports).
10. **Re-run.**
   - Re-run the checks until they report nothing, or until every remaining finding is one the user chose to keep, within this mode's Criteria check rule.
   - Report what changed on each issue, including each finding the criteria check reported.

## Rules

- **The rules.**
  The review checks each issue against the rules that bind its kind, and against its template.
- **Criteria check.**
  - The review is not clear while a criterion a test cannot fail remains.
  - A finding from that check is not one the user keeps.
- **Missing section.**
  Draft a missing section from the issue and its epics.
- **Non-Goals.**
  Non-Goals in an epic or task: lift any that bound the initiative into the initiative's Non-Goals, then remove the section. In a standalone issue, fold them into the Proposal as a closing boundary.
- **Extra section.**
  Keep an extra section, fold it into a template section, or remove it.
- **Wrong template.**
  A body that follows another kind's template is rewritten in its own kind's layout, or the issue is retitled to the kind it follows.
- **Change narrative.**
  Wording that narrates how the plan changed is restated as the plan is.
- **Task grain.**
  A task delivering more than three criteria no other task delivers is split into tasks one pull request each can deliver, with the rows and their criteria drafted.
- **Local criterion.**
  An initiative criterion or non-goal that names an initiative, epic, task or issue is restated locally, or a criterion that holds only through another initiative's work is dropped.
- **Counted criterion.**
  An initiative criterion that carries a count is measured against a named baseline or check.
- **Instrument.**
  An initiative criterion that names no instrument names its instrument, and any missing test is planned, as the goal pass's Verified rule defines.
- **Description.**
  A Description cell over eight words or holding a semicolon is shortened to a phrase naming what the row delivers. Any detail no cited criterion carries is restated as a new criterion of one invariant, cited by the row.
- **Coverage.**
  A Coverage cell that does not name the criteria the row delivers is mapped to them, from its text and each criterion's wording. A criterion no row delivers needs a row, or belongs in another epic.
- **One invariant.**
  A criterion that may state several invariants is split, each new criterion added at the end of the list and cited from the rows that deliver it.
- **Work Breakdown prose.**
  Prose in the Work Breakdown outside its table moves any design content into the Proposal, and drops narration of order and its reasons.
- **Depends on.**
  A Depends on cell holding prose is reduced to references. For an initiative, to the epics [Check Dependencies](commands.md#check-dependencies) derives with `I=`.
- **Title.**
  A title whose name is not two or three words, or whose subtitle runs past ten, is drafted in the agent-engineering form, and the initiative row takes the new name.
- **Several tasks.**
  An issue several row ids link is unlinked, and the issue is cited under References, since it backs several tasks, or each task is given its own issue.

