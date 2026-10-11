# Canon Audit

Status: finished

Base ref: None · Snapshot: f98a133a20e1bd6037da00adc63aeb68f1bd0033c008c6bef050f7f02d793ecb

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
| e7c48d2d7b7d2bcb3311 | Live | Critical | [2. Provide a terminating workflow path](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt) | corpus/qualification/workflow.yaml#@element | The workflow starts at run and its only exit returns to run, leaving no finite path to a null destination. [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5; [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11 | diff | Provide at least one finite path from initialActivity run to a null destination. |
| 3aae9366a0811871a6d6 | Live | Critical | broken-binding | corpus/qualification/routines/deliver.yaml#/outputs/report | The routine report export references emit.report, but emit calls produce whose only declared output is summary. [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21 | diff | Bind the routine report export to emit.summary, an output declared by produce. |
| dcd0b646057689c3fd1a | Live | Critical | broken-binding | corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments | The delivery invocation supplies argument key packet, but deliver requires the exact input key envelope. [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21 | diff | Set the invocation argument key to envelope, matching deliver Inputs exactly. |
| 5a059f1a79deba79c1ab | Live | High | [1. Honor the executing workflow's inherited destination](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt) | corpus/qualification/techniques/produce.md#/rules/line-12 | The produce leaf declares Destination is public while its executing qualification ancestor requires archive. [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5; [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8 | diff | Set the leaf Destination declaration to archive, satisfying qualification/techniques/TECHNIQUE.md. |
| 41617381ad956865a6c4 | Live | High | emission-without-validation | corpus/qualification/techniques/produce.md#/rules/line-11/clause-2 | The second Rules clause explicitly emits the report without validation. [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14 | diff | Require validation of the report before emission in the second Rules clause. |
| fd098b2de08c78f94906 | Live | High | emission-without-validation | corpus/qualification/techniques/produce.md#/protocol/line-8 | The Protocol instruction explicitly emits the report without validation. [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14 | diff | Require validation of the report before emission in the Protocol instruction. |

## File Coverage

Read 5 · unread 0.


## Finding Confirmations

- finding:3aae9366a0811871a6d6: confirmed — Resolve the unchanged routine output report to emit.report, emit to produce, then inspect Outputs: the sole declared name is summary. report is absent. AP-02(2) fails across the changed producer and unchanged consumer; Critical Live reproduces.
- finding:41617381ad956865a6c4: confirmed — Independently split line11 at the semicolon: retain-ID is one clause; the second explicitly emits without validation. AP-01 requires validation in each emitting clause, so no neighboring instruction excuses it. High Live reproduces for the emitted artifact.
- finding:5a059f1a79deba79c1ab: confirmed — Follow qualification/run delivery to deliver/emit and produce with the captured ancestor TECHNIQUE.md. The ancestor requires archive; the leaf line12 directs public. The concrete leaf violates DP1 and can direct a wrong destination, so High Live reproduces.
- finding:dcd0b646057689c3fd1a: confirmed — Resolve activity delivery to deliver: argument keys are {packet}, but its exact required Inputs set is {envelope}. The fixture has no optional inputs or aliases. AP-02(1) therefore fails structurally at this concrete invocation; Critical Live reproduces.
- finding:e7c48d2d7b7d2bcb3311: confirmed — Start at initialActivity run. Its only graph exit done returns to run; the complete graph contains no null destination or other reachable node. DP2 cannot obtain a finite terminating path. Critical Live reproduces independently of matching activity IDs.
- finding:fd098b2de08c78f94906: confirmed — Protocol line8 explicitly directs emission without validation. AP-01 requires validation of that artifact in every emitting instruction. This instruction independently violates that contract, separate from the Rules clause; High Live reproduces.
