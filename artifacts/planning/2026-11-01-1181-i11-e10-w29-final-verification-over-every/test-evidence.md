# Test Evidence — W29

> Delivery evidence · Branch `i11/e10/w29-final-verification-over-every` · Final verification revision `524ba6353dfcbb913ed5451a62fde9264aed90e9`, on epic base `i11/e10/workspace` at `9947ff911`, with every other E10 row merged

T1 and T2 run locally from the unit's worktree under `sbx`; T3 is the Verify Skills workflow on GitHub; T4 is the live walk the [disclosure record](disclosure-walk.md) holds.

## T1

The shared skill-file check over every repository skill at the final revision.

- **Inventory.**
  A skill is a folder under `skills/` holding a `SKILL.md` at any depth, as Verify Skills enumerates them. `skills/scripts/` and `skills/test/` hold the shared check and its suite and are no skills.

  | Skill folder | Entry points |
  | --- | --- |
  | `skills/gitnexus` | `gitnexus-cli`, `gitnexus-debugging`, `gitnexus-exploring`, `gitnexus-guide`, `gitnexus-impact-analysis`, `gitnexus-refactoring` |
  | `skills/server-in-the-loop` | `SKILL.md` |
  | `skills/work-planner` | `SKILL.md` |
  | `skills/workflow-canon` | `SKILL.md` |

- **Exclusions.**
  None. `EXCLUDED` in `.github/workflows/verify-skills.yml` is `''`, and the check carries no suppression or baseline.
- **Command.**

  ```bash
  python3 skills/scripts/check_skill_files.py skills/gitnexus skills/server-in-the-loop skills/work-planner skills/workflow-canon
  ```

- **Output, complete.**

  ```text
  81 files checked, 0 findings
  ```

- **Exit status.**
  0.

## T2

The shared, work-planner and workflow-canon suites at the same revision.

```bash
python3 -m pytest skills/test -q
python3 -m pytest skills/work-planner/test -q
python3 -m pytest skills/workflow-canon/test -q
```

- `skills/test`: 186 passed, 7 subtests passed.
- `skills/work-planner/test`: 690 passed, 1 skipped, 1831 subtests passed.
- `skills/workflow-canon/test`: 39 passed, 38 skipped, 21 subtests passed. The skips are the audit tests waiting on `CANON_TEST_ENGINE`, unset here, as AC18 states.
- `git diff --check` against the base reports nothing.

## T3

Verify Skills on the pull request's head.

- [Run 41300228363](https://github.com/m2ux/workflow-server/actions/runs/41300228363) at `524ba6353`: both jobs succeed, no skill excluded, and the check step prints `81 files checked, 0 findings`.

## T4

Live disclosure walks over the restructured gitnexus and server-in-the-loop entry points: five scenarios, each reaching its procedure through its entry point's routing with no missing context and no file outside that routing loaded. See [Disclosure Walk](disclosure-walk.md).
