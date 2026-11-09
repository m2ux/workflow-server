# Split Candidate Units

Each line names one candidate unit, rows of this epic declaring one component, and why its rows stay split.

- E02:W49 and E02:W20 stay split: the hot-fix interface operations land before the general callers select them, while the Board Status extraction waits on the script registry and statuses rows.
- E02:W52 and E02:W34 stay split: the kind separation of Unit Dispatch lands with the other general callers, while the retained-preparation route waits on the checker and #1631.
