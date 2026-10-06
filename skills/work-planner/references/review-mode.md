# Review Mode

Checks existing proposal, initiative, epic, task and standalone issues against their templates and against the rules that bind them, and fixes them.

## Procedure

1. **Select.**  Review the issues the user names, or an initiative with its open epics.
   - Review covers open issues only. A closed issue is reviewed only when named.
   - Naming another initiative's issue approves format edits to it.
   - An open standalone issue that a reviewed initiative, epic or task cites is reviewed with it.
2. **Fetch.**
   Fetch the issues under review as [Fetch](review-passes.md#fetch) states: each issue whole, with its initiative when it is an epic, its epics when it is an initiative, and the standalone issues it cites.
   - An initiative's fetch includes every epic its table links, closed epics included, and its format check takes each with `--epic`.
   - The fetch includes each source the initiative's References mark, for an epic as for the initiative.
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
   State each finding as [Report](review-passes.md#report) states.
6. **Decide.**
   Check every issue under review against each rule in this mode's Rules from Missing section through Several tasks, and decide the finding with the user. Draft the content the rule states.
7. **Check criteria.**
   Check every acceptance criterion of the issues under review against [Requirement characteristics](requirement-characteristics.md), through the [Verifiable](review-criteria.md#verifiable) rule, and report each that fails it. This mode's Criteria check rule says when the review is clear.
   - Align them with the sources the initiative's References mark, as the [Sources](review-criteria.md#sources) criteria define, and report each departure and each gap. Draft the criterion a gap calls for, and decide it with the user as in Decide.
8. **Check Dependencies.**
   - Check them whenever an initiative or epic is reviewed: take the initiative's and every epic's body with [Fetch Body](commands.md#fetch-body), and run [Check Dependencies](commands.md#check-dependencies).
   - Put each problem it reports to the user as in Decide. An initiative Depends on cell takes the epics it derives.
9. **Coverage.**
   For each epic under review, [Fetch Initiative Pull Requests](commands.md#fetch-initiative-pull-requests) and run [Sync Epic](commands.md#sync-epic) with `--fix`.
   - **Unmet.**
     Each task [Sync Epic](commands.md#sync-epic) reports unmet is a gap, as this mode's Gap rule states.
   - **Repair.**
     When the sync reports a row done, or a tick cleared, [Patch Body](commands.md#patch-body) from the `--fix` file, without asking.
   - **Absent.**
     A row that links a pull request the fetch did not return is fetched with [Fetch Pull Request](commands.md#fetch-pull-request), and the sync is run again.
   - **Unlinked.**
     A criterion ticked while its row links no pull request and no commit: link the one delivery [Fetch Comments](commands.md#fetch-comments) names, a path taken as the commit that holds it, then run the sync again. Several candidates, or none, go to the user.
   For an initiative under review, [Fetch Initiative Pull Requests](commands.md#fetch-initiative-pull-requests) and run [Sync Initiative](commands.md#sync-initiative) with `--fix` and every epic its table links.
   - **Ready to verify.**
     An initiative criterion [Sync Mode](sync-mode.md) reports ready to verify: every epic that cites it is delivered, and the criterion is unticked.
   - **Ticked early.**
     An initiative criterion [Sync Mode](sync-mode.md) reports ticked early: it is ticked while an epic that cites it is undelivered.
   Put each of those to the user. Verifying and ticking it is [Sync Mode](sync-mode.md). A Done change the fix file writes is applied with [Patch Body](commands.md#patch-body), without asking. The report follows [Coverage Reports](work-breakdown.md#coverage-reports).
10. **Re-run.**
   - Re-run the checks until they report nothing, or until every remaining finding is one the user chose to keep, within this mode's Criteria check rule.
   - Report what changed on each issue, including each finding the criteria check reported.

## Rules

- **The rules.**
  The review checks each issue against the rules that bind its kind, and against its template.
- **Criteria check.**
  - The review is not clear while a criterion that fails [Requirement characteristics](requirement-characteristics.md) remains.
  - A finding from that check is not one the user keeps.
- **Source alignment.**
  - Apply the initiative [Sources](review-criteria.md#sources) criteria to every criterion of the issues under review.
  - The review is not clear while a marked source stays unread. A source whose link is dead is repaired, or the mark is removed and the criteria it bound are decided with the user.
  - A departure from a marked source is corrected in the criterion, unless the user records the departure as a Non-Goal.
- **Missing section.**
  Draft a missing section from the issue and its epics.
- **Non-Goals.**
  An epic or task that carries Non-Goals fails the [Initiative](review-criteria.md#initiative) Non-Goals criteria. Lift any that bound the initiative into the initiative's Non-Goals, then remove the section. In a standalone issue, fold them into the Proposal as a closing boundary.
- **Extra section.**
  Keep an extra section, fold it into a template section, or remove it.
- **Wrong template.**
  A body that follows another kind's template is rewritten in its own kind's layout, or the issue is retitled to the kind it follows.
- **Change narrative.**
  Wording that narrates how the plan changed fails the [Any issue](review-criteria.md#any-issue) Body criteria. Restate it as the plan is.
- **Task grain.**
  Apply the [Epic](review-criteria.md#epic) Work Breakdown criteria for a task that delivers more than three criteria.
- **Local criterion.**
  Apply the initiative [Acceptance Criteria](review-criteria.md#acceptance-criteria) Local rule.
- **Counted criterion.**
  Apply the initiative [Acceptance Criteria](review-criteria.md#acceptance-criteria) No counts rule.
- **Instrument.**
  Apply the initiative [Verified](review-criteria.md#verified) rule.
- **Description.**
  Apply the [Epic](review-criteria.md#epic) Work Breakdown criteria for Description.
- **Coverage.**
  Apply the [Epic](review-criteria.md#epic) Work Breakdown criteria for Coverage.
- **One row.**
  Apply the epic [One row](review-criteria.md#one-row) criteria.
- **One invariant.**
  Apply the [shared acceptance criteria](review-criteria.md#shared-acceptance-criteria) One invariant rule.
- **Work Breakdown prose.**
  Prose in the Work Breakdown outside its table fails the [Work Breakdown Guide](work-breakdown.md#rules) Order rule. Move any design content into the Proposal.
- **Depends on.**
  Apply the [Epic](review-criteria.md#epic) or [Initiative](review-criteria.md#initiative) Work Breakdown criteria for Depends on. For an initiative, the cell takes the epics [Check Dependencies](commands.md#check-dependencies) derives with `I=`.
- **Title.**
  Apply the [Any issue](review-criteria.md#any-issue) Title criteria, and the [Epic](review-criteria.md#epic) Title criteria for an epic. The initiative row takes the epic's new name.
- **Several tasks.**
  Apply the [Epic](review-criteria.md#epic) Work Breakdown criteria for an issue several row ids link.
- **Gap.**
  Draft a further task for the unticked criteria, as the [Work Breakdown Guide](work-breakdown.md#tables) defines under Task grain. Put the draft to the user.
  - On acceptance, add the row and take those criteria off the delivered task's Coverage.
  - Run [Sync Epic](commands.md#sync-epic) again. It ticks Done on the delivered task, as the [Work Breakdown Guide](work-breakdown.md#tables) defines.
  - A criterion the user confirms already holds is ticked in [Sync Mode](sync-mode.md), and it stays on the delivered task.
- **Table.**
  A Done cell that disagrees with whether its row is complete, as the [Work Breakdown Guide](work-breakdown.md#tables) defines, is repaired. A ticked criterion whose row links no delivery is linked when the comments name one delivery, a path taken as the commit that holds it. Several candidates, or none, are decided with the user.

