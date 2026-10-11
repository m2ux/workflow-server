# Read and preparation record

All commands used cwd `/home/mike1/projects/dev/workflow-server`. The captured source revision is `e70b44778f71d9d699f746f78a16b892531c82d3`; source identities and exact byte counts are in [validation.json](validation.json). Only this `reviews/ap_execution/` directory was written. No Git, network, workflow-session, source or corpus operations were performed.

## Source reads

[read-log.jsonl](read-log.jsonl) records the exact command, inclusive line range, SHA-256, source bytes emitted, UTC start and measured script duration for every bounded source read. `read_bytes` is the source slice emitted, not physical disk I/O. The helper numbers lines and refuses slices above 24,000 source bytes.

- Anti-pattern catalog: 1–220, 221–440, 441–660, 661–880, 881–1100, 1101–1320, 1321–1540, 1541–1700, 1701–1840, 1841–1960, 1961–2084. The 1321–1540 and 1541–1700 ranges were subsequently reread independently.
- Design principles: 1–205, complete. An earlier unlogged `cat` also read the complete principles; it is excluded from the logged-byte and timed-read totals.
- Unique source bytes: 176,058. Logged emitted source bytes including rereads: 213,555. First logged read: 12:18:28.237922 UTC. Last logged read: 12:19:38.508305 UTC. The logged read window was 70.270383 seconds; measured source-reader execution summed to 0.009734476 seconds. These do not measure reasoning time.
- Through the recorded 12:41:41.058918 UTC validation, elapsed wall time from the first logged read was 1,392.820996 seconds. Initial instruction and memory preparation preceded that window and has no precise start measurement.

## Preserved failures and recovery

1. Initial commands were:

   `/home/mike1/projects/dev/workflow-server/scripts/sbx python3 .engineering/artifacts/planning/2026-10-11-canon-quality-review/reviews/ap_execution/read_source.py anti-patterns.md 1 220`

   `/home/mike1/projects/dev/workflow-server/scripts/sbx python3 .engineering/artifacts/planning/2026-10-11-canon-quality-review/reviews/ap_execution/read_source.py anti-patterns.md 221 440`

   Both exited 1 before reading: `bwrap: No permissions to create a new namespace, likely because the kernel does not allow non-privileged user namespaces.` Tool-reported wall durations were 0.000006841 and 0.000004937 seconds. The project-local Python file was then run directly, permitted by the supplied project-script execution rules; those successful commands appear in the read log.

2. A combined functions response for catalog ranges 1321–1540 and 1541–1700 exceeded the outer 10,000-token display budget (10,177 original tokens). The readers emitted full stdout, but the aggregate response truncated 177 tokens in the first result. Its `read_complete` log status describes stdout, not complete model receipt. Both ranges were reread as later commands and fully received. Validation uses the latest observation for repeated ranges; this note excludes the first aggregate observations from the completeness claim.

3. An attempted large `apply_patch` creating `build_review.py` failed with `invalid patch: The last line of the patch must be '*** End Patch'`. No file was created. The return was written directly in bounded JSON batches instead.

4. The first JSON-write preparation used unavailable `TextEncoder` and failed with `ReferenceError: TextEncoder is not defined` before invoking the write tool. UTF-8 size was then counted explicitly; Python byte lengths confirmed the final files.

5. The final command was `python3 .engineering/artifacts/planning/2026-10-11-canon-quality-review/reviews/ap_execution/validate_review.py`. It exited 0, verified all 55 primary IDs, 28 records and 59 source quotes, and checked source identities and byte bounds. It is artifact validation, not an engine test or an independent confirmation of the review's judgments.

## Context read

The review used the planning record README/method, `.engineering/AGENTS.md`, `.project/main/AGENTS.md`, and the workflow-canon skill with its Audit, Planning, Canon Context and command-convention guidance. Task authority narrowed the work to canon quality and suggestions; no definition audit or workflow session was started. A quick memory lookup supplied prior review-only/evidence discipline and the known truncation/namespace pitfalls; current source identities and claims were established from the captured files.
