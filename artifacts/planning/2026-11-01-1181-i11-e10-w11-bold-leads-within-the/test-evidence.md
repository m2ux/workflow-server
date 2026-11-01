# Test Evidence

Checks run for W11 and W13 at `e88bd866e` on `i11/e10/w11-bold-leads-within-the`: the change `75c41ece9`, merged with `i11/e10/workspace` at `41537ea98`. The same checks passed at `75c41ece9` over the base `ba441c2b8`, and at `cb05777ff` over `96295fffa`.

## Baseline

At `ba441c2b8` the shared skill-file check over all four skills reported six findings, every one in `skills/gitnexus/gitnexus-cli/SKILL.md`: five `command specification in the entry point` (analyze, status, clean, wiki, list) and one `inline bold lead too wide — 119 characters, limit 100` at line 82.

## T1

Shared skill-file check over the gitnexus skill.

```bash
python3 skills/scripts/check_skill_files.py skills/gitnexus
```

Output: `7 files checked, 0 findings`; exit 0. Observes AC17.

## T2

Shared skill-file check over every repository skill.

```bash
python3 skills/scripts/check_skill_files.py skills/gitnexus skills/work-planner skills/server-in-the-loop skills/workflow-canon
```

Output: `87 files checked, 0 findings`; exit 0. No entry point carries a command specification. Observes AC19.

## T3

Shared and work-planner suites, run as a regression check over the unchanged checker.

```bash
python3 -m pytest skills/test skills/work-planner/test -q
```

Output: `696 passed, 1 skipped, 1139 subtests passed`.
