# Advisory summary delivery

## Scope

- Shared github::read-security-advisory operation and library index.
- Repository REST lookup followed by global lookup when the repository cannot answer.
- Allowlisted summary fields, endpoint provenance, and actual HTTP status for unreadable results.
- Self-contained published/unreachable conformance specimen and recorded real execution.
- Authorized neutral private draft read and cleanup.

## Decisions

- 2026-10-09: User directs standalone placement before delivery. #949 loses its epic prefix and labels, Work Breakdown and board membership. #946 loses E04 and AC15–AC16. #955 loses W08 and AC11–AC12; advisory smoke verification belongs to #949 AC4.
- 2026-10-09: User authorizes creating and deleting a neutral test draft. REST documents closing, not deleting; creation waits for the user's answer on closing as cleanup.
- Bootstrap opened meta THTC3R and auto-selected github-library-conformance NNYP25. That specimen does not implement this issue and is not run as a substitute for delivery.

## Progress

- [x] Convert and detach #949 from I08.
- [ ] Implement and audit the operation and conformance specimen. In progress.
- [ ] Execute checks and live advisory verification.
- [ ] Commit, push, open the pull request, verify CI and merge.

## Test plan

| Test | Description | Coverage | Pass |
| --- | --- | --- | --- |
| T1 | Definition guards and canon review over the operation and specimen | AC1, AC2, AC3 | |
| T2 | Real conformance run reads a published global advisory and rejects an unreachable advisory | AC1, AC2, AC3, AC4 | ✓ |
| T3 | Private draft read through the repository endpoint, with cleanup recorded | AC1, AC2, AC5 | |

## Verification notes

- Standalone format check: #949 passes.
- #955 format check reports a pre-existing same-board References finding; delivery does not rewrite unrelated reference policy.
- GitHub's global endpoint answered GHSA-jfh8-c2jp-5v3q, providing a published fixture for the specimen.
- Current server commit: c1a97f236e20db64c8d36ba919ef0e7a4c1b671e. Corpus base: d4e594d0a2804679aa9dc8a5503a48b4b962fded.
- Corpus-only guard sweep: 53 pass, one fails on five pre-existing activity-variable findings in artifact-destination-conformance. Its bound_artifact_written and unbound_artifact_written writes are unproduced and unread, and artifact_destination is an unused read. Delta guard passes with no introduced finding.
- Specimen graph test: one passes, 64 outside the selection skipped. Scoped option coverage: one passes.
- Live MCP specimen BPC3CB completes. The published fixture returns repository 404 then global 200, with exactly the metadata allowlist. The unreachable fixture returns 404 from both endpoints and a null advisory/source. A status re-read confirms completed state and exact equality of the stored output objects with live-results.json.
