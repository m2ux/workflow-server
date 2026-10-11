# Dispatch Budget Review

Reviewer: /root/qualify_audit_two. Date: 2026-10-11. Result: the three-line candidate correction closes the known mapping-evidence input-budget defect for the inspected assignment.

## Exact Candidate

The only Python script differing between the production script directory and /tmp/canon-dispatch-candidate/skills/workflow-canon/scripts is audit_dispatch.py. In context_spans, verify/evaluate add each mapping evidence citation's exact source/start/end span before the existing merge. Existing row and criterion context is preserved; estimate and packet_content consume the same merged context.

- Production SHA256: d03af7c3894f91a2bcfd5116a9a2fb5d2bc2189303988c2c0bc3b6df78458cbe
- Candidate SHA256: 7d6b6f2f2f9e721cb461c004d5235cd9f6957c1f1ef0b1e6e70a322205c6b168
- Preserved Author A assignment: 557788b6b6a57a89051f
- Snapshot: 6cf42fd5ea1e2d0cb855bb8b61b4bbb16668b378ed2baf35c7d74f3e11ef4e9c
- Input packet: [corrected Author A packet](behavioral-qualification/round-2/author-a/corrected-packets/557788b6b6a57a89051f.json)

## Concrete Packet Evidence

Pure estimate and packet_content calls reconstructed the original packet and its recorded estimate, then projected the candidate using the same assignment and original budget. Inputs came from that packet and only the captured source catalog; captured blobs were independently hash-checked. No evaluation findings or expected outcomes were loaded.

All 18 citation occurrences across the three mappings are covered by six merged excerpts, with one excerpt per source. The old packet had three excerpts. Exact source hashes and excerpt text were checked, and all original row/criterion ranges remain covered.

| Captured Source | Candidate Lines |
| --- | --- |
| corpus/canon/resources/design-principles.md | 1–11 |
| corpus/qualification/workflow.yaml | 1–5 |
| corpus/qualification/activities/run.yaml | 1–6 |
| corpus/qualification/routines/deliver.yaml | 1–6 |
| corpus/qualification/techniques/TECHNIQUE.md | 1–5 |
| corpus/qualification/techniques/produce.md | 1–12 |

| Measurement | Old | Candidate |
| --- | ---: | ---: |
| Serialized packet bytes, excluding trailing newline | 14,834 | 16,742 |
| File bytes with one trailing newline | 14,835 | 16,743 |
| Estimated input tokens, at one byte per token | 15,445 | 17,353 |
| Estimated output tokens | 1,536 | 1,536 |
| Estimated work seconds | 15 | 15 |

The added source context increases both serialized size and the input estimate by 1,908. The candidate estimate covers its actual serialized size with 611 units of headroom at the declared proxy. Input plus output is 18,889 against 208,400 usable context after the original reserves, leaving 189,511. Output 1,536 remains below 16,000; estimated work 15 seconds remains below 600. The original declared budget still fits.

## Limits

This is structural candidate evidence, not current-generation semantic completion. The retained IDs and snapshot served only as comparison inputs. No production file, run state or receipt was modified or ingested. The input state remained equal before and after the pure calls. The coordinator owns fresh generation capture, semantic verification and suite results.

The measurement harness initially stopped on an excerpt-list ordering difference after JSON round-tripping. Comparing the same excerpts independently of ordering preserved content equality, and the completed measurement exited 0. Later investigation beyond already-cited sources remains measured work subject to recalibration and residual replanning; this correction budgets known dependencies without adding all captured files.
