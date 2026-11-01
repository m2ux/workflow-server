# E10 candidate units

The dependency check groups E10's undelivered rows by declared component. Each candidate it reports is answered here; it replaces the per-pair record [E10 pairs](../2026-10-31-project17-plan-review/joins/E10-pairs.md), whose 322 pair lines each repeated one template.

| Candidate | Component | Answer |
| --- | --- | --- |
| W01, W04, W05, W06, W07, W08, W15, W17, W19, W20, W21, W29 | `workspace:skills/scripts/check_skill_files.py` | Split by rule: 16 criteria exceed the bound of six. W04, W05 and W06 are joined within it. |
| W02, W23, W24 | `workspace:skills/work-planner/scripts/sync.py` | Split by rule: 7 criteria exceed the bound of six. |
| W03, W10 | `workspace:skills/work-planner/scripts/deliver.py` | Joined. |
| W27, W28 | `workspace:skills/work-planner/scripts/deps.py` | Joined. |

No candidate is open, so no record line is needed for one. Each other row declares a component no other undelivered E10 row declares.

## Comparison with the E10 review

The [E10 review](../2026-10-31-project17-plan-review/e10-joins-review.md) chose W03 + W10, W04 + W05 + W06, W11 + W13 and W27 + W28. The check reaches the same units: W03 + W10 and W27 + W28 are candidates their rows join, W04 + W05 + W06 is a joined unit of five criteria inside a candidate the bound splits, and W11 + W13 is delivered, so it joins no candidate.
