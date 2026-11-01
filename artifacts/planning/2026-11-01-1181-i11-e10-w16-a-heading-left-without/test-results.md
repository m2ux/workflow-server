# W16 Test Results

> Tested revision: `eb3522f7409aa931f7cac453fe17f60d2c686a42` on `i11/e10/w16-a-heading-left-without`, base `i11/e10/workspace` at `ba441c2b`.

## T1 Empty Section Unit Tests

```bash
cd <worktree> && <workspace>/scripts/sbx python3 -m pytest skills/test/test_check_skill_files.py -q -k EmptySection
```

- **Result.**
  8 passed.
- **Observation.**
  A specimen skill whose `SKILL.md` carries `## Sources` directly above `## Sessions` makes the command exit 1 and print `specimen/SKILL.md:5: heading without content — Sources`, which observes AC22.
- **Coverage.**
  The class also holds a parent whose body is its sub-sections as clean, an empty sub-section beneath it as reported, a heading ending the file as reported, a fenced example as content, a heading inside a fence as neither a finding nor a boundary, and a fixture tree as unread.

## T2 Shared Checker Suite

```bash
cd <worktree> && <workspace>/scripts/sbx python3 -m pytest skills/test/test_check_skill_files.py -q
```

- **Result.**
  84 passed, 3 subtests passed.
- **Observation.**
  One existing specimen, a mode file holding only `# Plan`, now also carries a sentence under its title, so the test keeps observing the two missing sections it was written for.

## T3 Work Planner Suite

```bash
cd <worktree> && <workspace>/scripts/sbx python3 -m pytest skills/work-planner/test -q
```

- **Result.**
  619 passed, 1 skipped, 1136 subtests passed.

## T4 Check Over Every Skill

```bash
python3 skills/scripts/check_skill_files.py --quiet skills/<skill>
```

- **Result.**
  `work-planner` 50 files, 0 findings; `workflow-canon` 18 files, 0 findings; `server-in-the-loop` 1 file, 0 findings; `gitnexus` 6 files, 6 findings.
- **Observation.**
  No skill carries a heading without content. The six `gitnexus` findings, five command specifications in its entry point and one wide bold lead, stand identically at the base revision and are owned by W29's final verification over every skill.
- **Fixtures.**
  Before the fixture exclusion, the rule reported `### report` and `### summary` in the `workflow-canon` audit-qualification corpus, whose output headings carry no body by design and whose expected outcomes fix their line numbers. That corpus is test input, so the check leaves it to the suite that owns it.
