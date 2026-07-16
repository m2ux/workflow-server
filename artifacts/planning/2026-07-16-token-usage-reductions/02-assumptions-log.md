# Assumptions log

| ID | Assumption | Status | Notes |
|----|------------|--------|-------|
| D1 | Coordinated Opt1+Opt2 pair (two PRs) | Locked | Server merge before/with corpus docs that mention resource markers |
| D2 | Metric A not required to ship | Locked | Headless B+C gate |
| D3 | Opt1 guidance meta-bootstrap only | Locked | Client solo notes omitted — bootstrap is mandatory entry; avoid drift/dispatch misuse |
| D4 | Ledger key `resource:<exact resource_id incl. #section>` | Locked | Section and bare id independent |
| A1 | Solo walks under-adopt `context_mode: persistent` today | Validated (planning histories / canvas) | Largest unused saving |
| A2 | `get_resource` is outside delivery ledger on main | Validated (`resource-tools.ts`) | Opt2 target |
| A3 | ADR-0006 usage may be absent on bench `main` | Validated | #233 in worktree; not required for gate |
| A4 | Extending `get_resource` via existing delivery helpers is safer than changing `recordDeliveries` | Plan | GitNexus CRITICAL on `recordDeliveries` |
| A5 | Opt4 deferred safely if Opt1+2 land | Plan | Revisit if dispatch-heavy paths still dominate |
