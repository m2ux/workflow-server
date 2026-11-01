# W06 Change List

## Applied

- **Task creation** — [I11:E16](https://github.com/m2ux/workflow-server/issues/1474) row W08, "Development links read by capture", linking [#1517](https://github.com/m2ux/workflow-server/pull/1517), empty Coverage, delivered. Trivial debt W06's audit of Access Development Links found: its read-only path ran Read Development Links, which had no command.

## Held

None.

## Held Steps

- **Debt fixed in the unit.** `test_sync.py`'s Test Plan builder, collected by pytest as a test, is renamed `plan_section` in [#1516](https://github.com/m2ux/workflow-server/pull/1516). No plan change.
- **Epic integration.** W03 and W05 and criteria AC5 and AC7 remain, so #1474 stays In Progress and draft review [#1505](https://github.com/m2ux/workflow-server/pull/1505) stays draft.
