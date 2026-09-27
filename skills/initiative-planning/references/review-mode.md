# Review mode

Checks existing initiative, epic and task issues against the templates, and fixes them.

## Procedure

1. **Select.** Review the issues the user names, or an initiative with its open epics.
   - Review covers open issues only. A closed issue is reviewed only when named, and a closed epic
     keeps its `Solution` heading.
   - Naming another initiative's issue approves format edits to it.
2. **Fetch** each issue whole, with its initiative when it is an epic:
   `gh api repos/{owner}/{repo}/issues/943 > issue-943.json`.
3. **Check** with `scripts/format.py issue-943.json --initiative issue-936.json --fix fixed-943.md`.
   The initiative's table lists the epic issues that the epic's references link to. The check
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
   - an extra section: keep it, fold it into a template section, or remove it;
   - a body that follows another kind's template: rewrite it in its own kind's layout, or relabel
     the issue;
   - a PR cell holding text or several links: move the one pull request that delivered the task
     onto its id, and put anything else worth keeping in Where it stands;
   - a Work column, or an Outcomes cell without criteria: map each row to the criteria it delivers,
     from the row's text and each criterion's wording; a criterion no row delivers needs a row, or
     belongs in another epic;
   - prose in the Work Breakdown outside its table, or a Sequencing section: move any design
     content into the Proposal or Solution, and drop narration of order and its reasons;
   - a Depends on cell holding prose: reduce it to references; for an initiative, to the list
     `deps.py` derives with `I=`.
6. **Re-run** the check until it exits 0, or until every remaining finding is one the user chose to
   keep. Report what changed on each issue.

## Commands

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/format.py issue-943.json --initiative issue-936.json --fix fixed-943.md
```
