# Working Directory Refusal: Unmapped Root and Repository Shape — October 2026

> Planning record · Issue #1220

## Summary

`start_session` evaluates caller `working_directory` paths through a three-way disposition:

1. **Unresolvable or empty after inversion**: Malformed, empty, or non-existent paths are refused with a message stating that failure.
2. **Resolves, outside mapped roots**: Paths sitting outside the server's served roots return the `unmapped-root` open decision carrying the served search roots.
3. **Resolves, inside mapped roots, no repository**: Paths inside served roots that exist but contain no git repository are refused with `is not a git checkout`.

## Artifacts

| Artifact | Purpose |
| --- | --- |
| [README.md](README.md) | Problem statement, design decisions, and acceptance verification |

## Links

| Resource | Link |
| --- | --- |
| Issue #1220 | https://github.com/m2ux/workflow-server/issues/1220 |
| Bootstrap Protocol | workflows/corpus/meta/resources/bootstrap-protocol.md |
