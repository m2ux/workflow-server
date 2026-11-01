# Test Evidence

> W17 · Evaluated at `0f35fde494dba440fd4cef2e06d049e34914eb3e` on `i11/e10/w17-a-section-body-carried`

Each check ran from the unit's worktree under the workspace sandbox. The changed paths are `skills/scripts/check_skill_files.py`, `skills/test/test_check_skill_files.py`, `skills/work-planner/modes/revise-mode.md` and `skills/workflow-canon/references/revise-mode.md`.

## T1

The section body comparison's own test class, `SectionBodyComparison`, observes AC23.

```bash
python3 -m pytest skills/test/test_check_skill_files.py -q -k SectionBodyComparison
```

- **Specimen move.**
  Fetch Issue moves from an artifact to a mode file with its link retargeted from `issue.md#fields` to `../artifacts/issue.md#fields`, and reads as moved; the sections left in place read as identical.
- **Differences reported.**
  A reworded body, a changed fragment, a changed absolute URL and an emptied body each read as differing, with the reworded body's diff lines; a renamed section reads as one removed and one added.
- **Pairing.**
  A heading its own file still holds pairs with itself, never with the same heading in another file, and a heading inside a fence is no section.
- **Command.**
  Over a two-commit specimen repository, `--compare` exits 0 on a clean move and prints the section count at each revision, exits 1 with a diff where the move damaged a body, and refuses an unknown revision.
- **Result.**
  12 tests passed.

## T2

The whole shared skill-file suite and the Work Planner suite, so the check's existing behaviour stands beside the comparison.

```bash
python3 -m pytest skills/work-planner/test skills/test -q
```

- **Result.**
  721 passed, 1 skipped, 1140 subtests passed, after merging `origin/i11/e10/workspace` at `8e747419a`.
- **Canon suite.**
  `skills/workflow-canon/test` gives 39 passed and 38 skipped while `CANON_TEST_ENGINE` is unset, as its stated prerequisite provides.

## T3

The skill-file check over every skill, and the comparison over the change itself.

```bash
python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon skills/server-in-the-loop skills/gitnexus
python3 skills/scripts/check_skill_files.py --compare 8e747419a 0f35fde49 skills/work-planner skills/workflow-canon
```

- **Skill-file check.**
  76 files checked, 0 findings.
- **Comparison over this change.**
  468 sections at the base and 470 at the head; the two added are the Compare Section Bodies operations, and every other section is identical.
- **Comparison over a past range.**
  Between `51c5e7b76` and `ba441c2b8` it reads 465 and 468 sections and reports 16 added, removed or differing, each a section that range rewrote.
