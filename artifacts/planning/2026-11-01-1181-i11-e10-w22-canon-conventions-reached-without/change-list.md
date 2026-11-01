# Change List — W22 Session

> Delivery session · 2026-11-01

## Applied

- None. W22 was delivered as planned, with no task, epic, priority or folded-work change.

## Held

- None.

## Debt Found and Fixed

- **Unregistered finding kinds on the epic base.**  At `8b35508fd` the shared suite failed 18 tests: `heading without a blank line above` and `command specification nothing cites` were missing from `KINDS`, and the interface fixtures held a specification nothing cites. Fixed on this branch in `a72af28d5`; #1576 and #1556 landed the same fix on the base, and the merge into this branch takes the base's version.
- **Stale descriptions of a separate conventions file.**  Workflow Canon's guidelines and the shared guidelines' SKILL.md structure named it; both now describe the entry point's Conventions section. Fixed in [#1574](https://github.com/m2ux/workflow-server/pull/1574).
