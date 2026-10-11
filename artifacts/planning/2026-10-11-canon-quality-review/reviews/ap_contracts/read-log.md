# Read and validation record

The assigned review output is confined to `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-10-11-canon-quality-review/reviews/ap_contracts`. No corpus, source, shared inventory, or other review ledger was edited.

The complete captured sources were emitted in 12 bounded reads. Every requested source range reached the model without tool-output truncation. The [command log](read-log.jsonl) records actual commands, ranges, UTC timestamps, complete-source hashes, emitted UTF-8 byte counts and Python read elapsed time. [Validation](validation.json) independently recomputes continuity, exact evidence quotes, coverage and batch bounds.

- Revision: `e70b44778f71d9d699f746f78a16b892531c82d3`.
- Source bytes emitted, excluding line-number decoration: **176,058**.
- Decorated bytes emitted: **188,372**.
- First measured source read: `2026-10-11T12:18:22.655753+00:00`.
- Last source read: `2026-10-11T12:19:03.309046+00:00`; source-read command span **40.653 s**.
- This validation: `2026-10-11T12:33:32.588157+00:00`; elapsed since first measured source read **909.932 s**.
- Summed measured Python read/format durations: **0.007850 s**. This is I/O preparation time, not a claim about reasoning time.
- Validation runtime to the measurement point: **0.011968 s**.

Preparation time before the first source-read timestamp was not separately measured. The review interval includes analysis, artifact construction and validation, rather than summing shell runtimes.

| Source | UTF-8 bytes | Lines | SHA-256 |
| --- | ---: | ---: | --- |
| sources/anti-patterns.md | 161582 | 2084 | `dbdf297b3d7ddb5517993b694705e0baa292374a82373aaee19c36fb8994e681` |
| sources/design-principles.md | 14476 | 205 | `dc51605fb74d9a4a3f6bdefb93b984bfa2a6b909bfbd00f164f2d277566d8e7b` |

Preparation and exceptional outcomes:

- `rg -n 'workflow-canon|integration-review|canon' /home/mike1/.codex/memories/MEMORY.md`: one relevant registry hit; read the first 48 registry lines with the current skill. Historical integration practices informed evidence discipline only; no historical behavior claim is used as current evidence. Current review authority and method were re-read locally.
- Read workspace `AGENTS.md`, `.project/main/AGENTS.md`, `.engineering/AGENTS.md`, Workflow Canon `SKILL.md`, `audit-mode.md`, `planning.md`, command conventions, and canon-context prerequisites/terms. These were instruction reads, not definition-conformance review.
- The first `cat README.md; cat inventory.json` preparation command exceeded its output limit. Its inventory output was truncated and was not used as complete coverage. The README was re-read alone; the inventory was then loaded by the artifact writers and validator, which check all 42 assigned IDs. The actual source coverage comes solely from the bounded read log.
- The first sandbox-prefixed source-reader invocation failed with `bwrap: No permissions to create a new namespace`; it emitted no source text and contributed zero source bytes. The same project-local Python reader was run in the default shell, which is permitted for project scripts. The failed attempt had reported tool wall time 0.000004710 s; this is preserved as reported, not interpreted as human analysis time.
- Source reads in `read-log.jsonl` all exited successfully. No output from those source-read commands was truncated. The build command `python3 .engineering/artifacts/planning/2026-10-11-canon-quality-review/reviews/ap_contracts/write_review.py` exited 0 and produced the bounded batches. The validation command is `python3 .engineering/artifacts/planning/2026-10-11-canon-quality-review/reviews/ap_contracts/validate_review.py`.
- No Git, remote, workflow session, engine test, or corpus mutation was performed. Synthetic witnesses test the wording of criteria; they do not assert actual corpus defects or current runtime conformance.
