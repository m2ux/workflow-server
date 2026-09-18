# Session records which path drove it

#528 W3. A session carries one value naming the path that drove it, and
`start_session` / `dispatch_child` echo that value.

## Values

- `agent` — a caller walks the definition.
- `runner` — the server walks it.

The wire name is `execution_path`. The session file field is `executionPath`.
A file that never recorded a path is agent-driven.

## Create

Every fresh session, including a transient meta bootstrap and every
`dispatch_child`, records `agent`. The runner does not exist yet, so no
caller argument sets the other value.

## Resume

The stored value is echoed. A session written before the field existed is
treated as `agent` and the field is written on the next resume that already
restamps the file.

## Out of scope

Caller override. Graders withheld per path (#532 W3). Inspect-session identity
(Python parity lists a fixed key set).
