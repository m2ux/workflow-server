# Test Evidence — W30

> Delivery evidence · Branch `i11/e10/w30-the-gitnexus-entry-points` · Tested at `4c4827156e72a4952fca633b2a66420118b9ce71`

T1 to T3 run locally, from the unit's worktree, under `sbx`; T4 is the gate job on GitHub.

## T1

The shared check over the skill.

```bash
python3 skills/scripts/check_skill_files.py skills/gitnexus
```

- 12 files checked, 0 findings. At the base, `i11/e10/workspace` at `04bfa7a8c`, the same run reports the entry-point findings the [W21 evidence](../2026-11-01-1181-i11-e10-w21-an-entry-point-s/test-evidence.md#findings-beyond-this-unit) lists.

## T2

The shared suite and the work-planner suite.

```bash
python3 -m pytest skills/test -q
python3 -m pytest skills/work-planner/test -q
```

- `skills/test`: 108 passed.
- `skills/work-planner/test`: 645 passed, 1 skipped.

## T3

The skill leaves the gate's exclusions: `EXCLUDED` in `.github/workflows/verify-skills.yml` no longer names `gitnexus`, and names `server-in-the-loop` only while that skill's own row is undelivered.

## T4

The skill-check gate on the pull request's head.

- RESULT_T4
