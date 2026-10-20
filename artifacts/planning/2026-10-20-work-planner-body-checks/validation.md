# Validation

## The Unconverted Finding

`sync.py` reads each epic row's link. Where the link is an issue and `--tasks` carries that issue's record, the row's issue is held to the shape of this epic's task issue: a title opening with that row's `[Ixx:Eyy:Wzz]` prefix, and `type:task` among its labels. An issue carrying neither is reported as `unconverted`, naming the row, the issue and what it lacks.

Evidence: `test/test_sync.py` runs the script over an epic whose W01 links an issue titled `A Mark Reaches the Bundle` and labelled `tech-debt`, and over one whose W01 links `[I01:E00:W01] Task: Done` labelled `type:task`. The first reports the finding; the second reports nothing. Both run in the suite below.

Observed on prosiform #39, where four rows linked issues raised as deferred debt and never rewritten: #89, #98, #108 and #109. Two of those bodies carried the standalone sections they were raised with, and none carried `type:task`.

## The Pull Request Body Check

`format.py --pull-request` reads `artifacts/pull-request-body.md` for the template, as it already reads a body artifact for each issue kind. A pull request whose head is an epic base — whose last segment is the branch it targets — is that epic's review, which carries no Test Plan.

Evidence: nine cases in `test/test_format.py` cover a conforming body, another shape's missing and extra sections, a Changes section naming no area, a result recorded without a link, a result on a row naming a criterion no check observes, column reordering, a title prefix naming a task, and a review body with and without a Test Plan.

Observed against prosiform #100, whose body carried `What was built`, `Fixtures`, `Test Plan`, `References`: the check names the two missing sections, the two extra ones, and the unlinked result.

## The Suite

`python3 -m unittest discover -s test` in `skills/work-planner`: **408 tests, OK**, run under `scripts/sbx` at the delivered head.

`python3 skills/scripts/check_skill_files.py skills/work-planner`: **49 files checked, 0 findings**.

## Limitations

- The unconverted finding reads the record `--tasks` supplies. A row whose linked issue is not supplied keeps the existing note asking for it, so a caller that fetches no task issues sees the note rather than the finding.
- The pull request check reads the body and the title. It does not read the Development field, so a References row naming the issue the pull request delivers is left to the reader.
