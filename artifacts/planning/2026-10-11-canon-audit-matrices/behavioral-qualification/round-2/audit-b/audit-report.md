# Canon Audit

Status: finished

Base ref: None · Snapshot: 3385628755635a68b747e59dc49cb55d24a0580ba70f1f6e938782534763ab90

Coverage: 50 rows × 4 AP/DP criteria; 200 of 200 mappings verified; 48 of 48 applicable cells evaluated.

Guards: pass. Residual: 0 unread files; 0 inventory and 0 other obligations.

Conformance: findings

| Band | Findings |
| --- | --- |
| Live | 6 |
| Contract | 0 |
| Hygiene | 0 |

[Complete coverage ledger](audit-coverage.md)

## Change Surface

| Path | How It Joined |
| --- | --- |
| corpus/qualification/activities/run.yaml | touched |
| corpus/qualification/routines/deliver.yaml | consumer |
| corpus/qualification/techniques/TECHNIQUE.md | context |
| corpus/qualification/techniques/produce.md | touched |
| corpus/qualification/workflow.yaml | touched |

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| d765c831b249d39c8c9e | Live | Critical | [2. Provide a terminating workflow path](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt) | corpus/qualification/workflow.yaml#/graph/run/done | The sole reachable graph exit loops from run back to run, leaving no terminating path. [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5; [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11 | diff | Provide a reachable graph exit to null from initialActivity. |
| ee22b8014c1628abf8c1 | Live | Critical | broken-binding | corpus/qualification/routines/deliver.yaml#/outputs/report | The deliver report export binds emit.report although produce declares only summary. [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21 | diff | Bind the routine export to emit.summary, which the called technique declares. |
| 5f7166a15951ef23a91c | Live | Critical | broken-binding | corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments | The delivery invocation supplies packet, but deliver requires envelope. [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21 | diff | Use the exact envelope input key in the delivery invocation of deliver. |
| b9b7c63a8a2957cdc670 | Live | High | [1. Honor the executing workflow's inherited destination](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt) | corpus/qualification/techniques/produce.md#/rules/line-12 | The executing produce leaf declares public, conflicting with its inherited archive destination. [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5; [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8 | diff | Set the leaf Destination to its inherited required archive value. |
| 516c436d7c33aa7d338a | Live | High | emission-without-validation | corpus/qualification/techniques/produce.md#/rules/line-11/clause-2 | The second Rules clause directs report emission without prior validation. [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14 | diff | Require validation of the report before emission in this Rules clause. |
| 799587e858016f356c0f | Live | High | emission-without-validation | corpus/qualification/techniques/produce.md#/protocol/line-8 | The Protocol directs report emission without prior validation. [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14 | diff | Require validation of the report before emission in this Protocol instruction. |

## File Coverage

Read 5 · unread 0.


## Finding Confirmations

- finding:516c436d7c33aa7d338a: confirmed — Independently split Rules line 11 at its semicolon: retaining the ID is the first clause; the second explicitly directs emission without validation. AP-01 applies to each clause, reproducing a separate High Live violation.
- finding:5f7166a15951ef23a91c: confirmed — Resolve delivery to deliver and compare exact keys: the invocation supplies packet while the routine Inputs list requires envelope. This fixture has no aliases or optional parameters. AP-02(1) reproduces a Critical Live binding defect.
- finding:799587e858016f356c0f: confirmed — The original Protocol line 8 explicitly directs report emission without validation. AP-01 requires prior validation for every emitting instruction. This construct independently reproduces High Live, regardless of instructions elsewhere.
- finding:b9b7c63a8a2957cdc670: confirmed — Follow qualification/run delivery to deliver/emit and produce, retaining the executing ancestor TECHNIQUE.md. The ancestor requires archive while the leaf declares public on line 12. DP1 reproduces a High Live destination conflict at this concrete instance.
- finding:d765c831b249d39c8c9e: confirmed — Start from initialActivity run. The complete graph has only run.done returning to run; no reachable transition targets null. DP2 requires a finite terminating path. The whole-graph defect independently reproduces Critical Live.
- finding:ee22b8014c1628abf8c1: confirmed — Resolve the unchanged routine export report to emit.report, emit to produce, and then read the complete leaf Outputs section: only summary is declared. The referenced report output is absent. AP-02(2) reproduces Critical Live at this consumer binding.
