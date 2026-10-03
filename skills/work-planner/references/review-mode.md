# Review Mode

Checks existing proposal, initiative, epic, task and standalone issues against the templates, and fixes them.

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
   - **fixed.**
     Structural changes that keep the wording, already made in `fixed-943.md`, with the body diff printed.
   - **apply.**  A title or label change to make on the issue.
   - **decide.**  Anything needing new content or a judgement.
4. **Apply the mechanical fixes.**
   - Apply them without asking.
   - Read the diff to confirm it changes structure only, then [Patch Body](commands.md#patch-body) from `fixed-943.md`.
   - Make the title and label changes the check names, with [Retitle Issue](commands.md#retitle-issue), [Add Labels](commands.md#add-labels) and [Remove Label](commands.md#remove-label).
5. **Decide the rest.**  Decide each remaining finding with the user, with its content drafted:
   - a missing section: draft it from the issue and its epics;
   - Non-Goals in an epic or task: lift any that bound the initiative into the initiative's Non-Goals, then remove the section; in a standalone issue, fold them into the Proposal as a closing boundary;
   - an extra section: keep it, fold it into a template section, or remove it;
   - a body that follows another kind's template: rewrite it in its own kind's layout, or retitle the issue to the kind it follows;
   - wording that narrates how the plan changed: restate it as the plan is;
   - a task delivering more than three criteria no other task delivers: split it into tasks one pull request each can deliver, drafting the rows and their criteria;
   - an initiative criterion or non-goal naming an initiative, epic, task or issue: restate it locally, or drop a criterion that holds only through another initiative's work;
   - an initiative criterion that carries a count: measure it against a named baseline or check;
   - an initiative criterion that names no instrument: name its instrument, and plan any missing test, as the goal pass's Verified rule defines;
   - a Description cell over eight words or holding a semicolon: shorten it to a phrase naming what the row delivers, and restate any detail no cited criterion carries as a new criterion of one invariant, cited by the row;
   - an Coverage cell that does not name the criteria the row delivers: map the row to them, from its text and each criterion's wording; a criterion no row delivers needs a row, or belongs in another epic;
   - a criterion that may state several invariants: split it, adding each new criterion at the end of the list, and cite it from the rows that deliver it;
   - prose in the Work Breakdown outside its table: move any design content into the Proposal, and drop narration of order and its reasons;
   - a Depends on cell holding prose: reduce it to references; for an initiative, to the epics [Check Dependencies](commands.md#check-dependencies) derives with `I=`;
   - a title whose name is not two or three words or whose subtitle runs past ten: draft a title of the agent-engineering form, and give the initiative row the new name;
   - an issue several row ids link: unlink the ids and cite the issue under References, since it backs several tasks, or give each task its own issue.
6. **Check criteria.**
   Check every acceptance criterion of the issues under review against the [Goal Pass](review-passes.md#goal-pass) Verifiable rule.
   - Report each criterion a test cannot fail.
   - The review is not clear while one remains.
7. **Check Dependencies.**
   - Check them whenever an initiative or epic is reviewed: take the initiative's and every epic's body with [Fetch Body](commands.md#fetch-body), and run [Check Dependencies](commands.md#check-dependencies).
   - Put each problem it reports to the user as in step 5. An initiative Depends on cell takes the epics it derives.
8. **Coverage.**
   For each epic under review, [Fetch Initiative Pull Requests](commands.md#fetch-initiative-pull-requests) and run [Match Pull Requests](commands.md#match-pull-requests).
   - **unmet.**
     A task whose id links a merged pull request while a criterion its Coverage names is unticked, as the [Work Breakdown Guide](work-breakdown.md#tables) defines.
   For an initiative under review, [Fetch Initiative Pull Requests](commands.md#fetch-initiative-pull-requests) and run [Sync Initiative](commands.md#sync-initiative) with every epic its table links.
   - **ready to verify.**
     An initiative criterion [Sync Mode](sync-mode.md) reports ready to verify: every epic that cites it is delivered, and the criterion is unticked.
   - **ticked early.**
     An initiative criterion [Sync Mode](sync-mode.md) reports ticked early: it is ticked while an epic that cites it is undelivered.
   Put each to the user. Verifying and ticking it is [Sync Mode](sync-mode.md). The report follows [Coverage Reports](work-breakdown.md#coverage-reports).
9. **Re-run.**
   - Re-run the checks until they report nothing, or until every remaining finding is one the user chose to keep. A finding from the criteria check is not one the user keeps.
   - Report what changed on each issue, including each finding the criteria check reported.

