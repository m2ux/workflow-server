# Canon Audit

Status: finished

Base ref: None · Snapshot: 090c865520a859fde87978508843f79273505b51ddf7fa859f860838baef2ca2

Coverage: 50 rows × 4 AP/DP criteria; 200 of 200 mappings verified; 48 of 48 applicable cells evaluated.

Guards: pass. Residual: 0 unread files; 0 inventory and 0 other obligations.

Conformance: findings

| Band | Findings |
| --- | --- |
| Live | 5 |
| Contract | 1 |
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
| 27029a238a739a1402cb | Live | Critical | [2. Provide a terminating workflow path](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt) | corpus/qualification/workflow.yaml#/graph/run/done | The workflow has only run --done--> run and no finite path to null. [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–11; [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5 | diff | Provide a reachable graph exit whose finite path ends at null. |
| f6d4d01ecd70b1f006d1 | Live | Critical | [AP-02. broken-binding](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt) | corpus/qualification/routines/deliver.yaml#/outputs/report | Routine output report binds emit.report, but produce declares only summary. [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–21; [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12 | diff | Bind report to an output actually declared by produce after resolving emit. |
| 43e98a017886135888df | Live | Critical | [AP-02. broken-binding](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt) | corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet | Delivery argument keys {packet} do not match deliver Inputs {envelope}. [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–21; [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6 | diff | Pass envelope and match the routine's exact input-key set. |
| 333b7dd9cc252e3139cb | Contract | High | [1. Honor the executing workflow's inherited destination](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt) | corpus/qualification/techniques/produce.md#/rules/line-12 | The leaf declares public while its executing workflow ancestor requires archive. [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–11; [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5 | diff | Set the leaf Destination to the inherited archive requirement. |
| 209dc9f4824686ad40cb | Live | High | [AP-01. emission-without-validation](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt) | corpus/qualification/techniques/produce.md#/rules/line-11/clause-2 | Rules clause 2 directs report emission without validation. [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–21; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12 | diff | Require report validation before emission in this Rules clause. |
| 95a1b58aa5a5507907af | Live | High | [AP-01. emission-without-validation](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt) | corpus/qualification/techniques/produce.md#/protocol/line-8 | The Protocol directs report emission without validation. [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–21; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12 | diff | Require report validation before this Protocol instruction emits it. |

## File Coverage

Read 5 · unread 0.


## Finding Confirmations

- finding:209dc9f4824686ad40cb: confirmed — Independently split Rules line 11 at its semicolon: retaining the ID is the first clause; the second explicitly directs emission without validation. AP-01 applies to each clause, reproducing a separate High Live violation.
- finding:27029a238a739a1402cb: confirmed — Start from initialActivity run. The complete graph has only run.done returning to run; no reachable transition targets null. DP2 requires a finite terminating path. The whole-graph defect independently reproduces Critical Live.
- finding:333b7dd9cc252e3139cb: confirmed — Follow qualification/run delivery to deliver/emit and produce, retaining the executing ancestor TECHNIQUE.md. The ancestor requires archive while the leaf declares public on line 12. DP1 reproduces an inherited contract conflict with High urgency because it reaches the concrete workflow instance. Contract classification identifies this declaration conflict; the controlled guard supplies no trace proving an actual runtime destination.
- finding:43e98a017886135888df: confirmed — Resolve delivery to deliver and compare exact keys: the invocation supplies packet while the routine Inputs list requires envelope. This fixture has no aliases or optional parameters. AP-02(1) reproduces a Critical Live binding defect.
- finding:95a1b58aa5a5507907af: confirmed — The original Protocol line 8 explicitly directs report emission without validation. AP-01 requires prior validation for every emitting instruction. This construct independently reproduces High Live, regardless of instructions elsewhere.
- finding:f6d4d01ecd70b1f006d1: confirmed — Resolve the unchanged routine export report to emit.report, emit to produce, and then read the complete leaf Outputs section: only summary is declared. The referenced report output is absent. AP-02(2) reproduces Critical Live at this consumer binding.
