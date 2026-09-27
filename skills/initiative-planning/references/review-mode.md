# Review mode

Checks existing initiative, epic, task and standalone issues against the templates, and fixes
them. A standalone issue has no house prefix and belongs to no initiative; hoist mode leaves such
issues in place.

## Procedure

1. **Select.** Review the issues the user names, or an initiative with its open epics.
   - Review covers open issues only. A closed issue is reviewed only when named.
   - Naming another initiative's issue approves format edits to it.
   - An open standalone issue that a reviewed initiative, epic or task cites is reviewed with it.
2. **Fetch** each issue whole, with its initiative when it is an epic, its epics when it is an
   initiative, and the standalone issues it cites:
   `gh api repos/{owner}/{repo}/issues/943 > issue-943.json`.
3. **Check** with `scripts/format.py issue-943.json --initiative issue-936.json --fix fixed-943.md`,
   and an initiative with `--epic issue-943.json` for each of its epics. The initiative's table
   lists the epic issues that the epic's references link to, and each epic's title names its row. The check
   reads the format from `templates/`, and reports three kinds of finding:
   - **fixed:** structural changes that keep the wording, already made in `fixed-943.md`, with the
     body diff printed;
   - **apply:** a title or label change to make on the issue;
   - **decide:** anything needing new content or a judgement.
4. **Apply the mechanical fixes** without asking. Read the diff to confirm it changes structure only,
   then patch the body from `fixed-943.md`, along with the title and labels the check names.
5. **Decide the rest** with the user, one finding at a time, each with a recommended option and the
   content drafted:
   - a missing section: draft it from the issue and its epics;
   - Non-goals in an epic or task: lift any that bound the initiative into the initiative's
     Non-goals, then remove the section; in a standalone issue, fold them into the Proposal as a
     closing boundary;
   - an extra section: keep it, fold it into a template section, or remove it;
   - a body that follows another kind's template: rewrite it in its own kind's layout, or retitle
     the issue to the kind it follows;
   - wording that narrates how the plan changed: restate it as the plan is;
   - a task delivering more than three criteria no other task delivers: split it into tasks one
     pull request each can deliver, drafting the rows and their criteria;
   - an initiative criterion or non-goal naming an initiative, epic, task or issue: restate it
     locally, or drop a criterion that holds only through another initiative's work;
   - an initiative criterion that carries a count: measure it against a named baseline or check;
   - an initiative criterion that names no instrument: name the automated test that verifies it,
     or how the user confirms it where none can exist, as the goal pass's Verified rule defines,
     and recommend any missing test as a task or a test-infrastructure epic;
   - a Description cell over eight words or holding a semicolon: shorten it to a phrase naming
     what the row delivers, and restate any detail no cited criterion carries as a new criterion of
     one invariant, cited by the row;
   - a Description cell without criteria: map the row to the criteria it delivers, from its text
     and each criterion's wording; a criterion no row delivers needs a row, or belongs in another
     epic;
   - a criterion that may state several invariants: split it, adding each new criterion at the end
     of the list, and cite it from the rows that deliver it;
   - prose in the Work Breakdown outside its table: move any design content into the Proposal, and
     drop narration of order and its reasons;
   - a Depends on cell holding prose: reduce it to references; for an initiative, to the epics
     `deps.py` derives with `I=`;
   - a title whose name is not two or three words or whose subtitle runs past ten: draft a title of
     the house form, and give the initiative row the new name;
   - an issue several row ids link: unlink the ids and cite the issue under References, since it
     backs several tasks, or give each task its own issue.
6. **Check dependencies** whenever an initiative or epic is reviewed: fetch the initiative's and
   every epic's body, and run `scripts/deps.py I=live-936.md E00=live-943.md …`. Put each problem it
   reports to the user as in step 5; an initiative Depends on cell takes the epics it derives.
7. **Re-run** both checks until they report nothing, or until every remaining finding is one the
   user chose to keep. Report what changed on each issue.

## Commands

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/format.py issue-943.json --initiative issue-936.json --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/format.py issue-936.json --epic issue-943.json --epic issue-937.json --fix fixed-936.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/deps.py I=live-936.md E00=live-943.md E01=live-937.md
```
