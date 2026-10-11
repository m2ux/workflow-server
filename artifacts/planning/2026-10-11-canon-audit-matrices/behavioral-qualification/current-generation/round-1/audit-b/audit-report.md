# Canon Audit

Status: finished

Base ref: None · Snapshot: 1a49a0da298528d4749ba8687d9ea8dd10ffe689f7d37cca7e45bc544f0a4cf7

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
| 7eb24eb7a951e4233345 | Live | Critical | Provide a terminating workflow path | corpus/qualification/workflow.yaml#/graph/run/done | Qualification's sole reachable exit loops from run to run, with no path to null. [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5; [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11 | diff | Provide a reachable workflow exit whose destination is null. |
| 5962f0bd3a0b9cc13585 | Live | Critical | broken-binding | corpus/qualification/routines/deliver.yaml#/outputs/report | Deliver exports emit.report, but emit calls produce, which declares only summary. [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21 | diff | Bind the exported report to emit.summary, the output declared by the called technique. |
| a4bf0744e8470747d764 | Live | Critical | broken-binding | corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments | Delivery passes packet to deliver, whose only input is envelope. [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21 | diff | Pass the argument under the exact declared input key envelope. |
| 333b7dd9cc252e3139cb | Contract | High | [1. Honor the executing workflow's inherited destination](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt) | corpus/qualification/techniques/produce.md#/rules/line-12 | The leaf declares public while its executing workflow ancestor requires archive. [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–8; [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5 | diff | Set the leaf Destination to the inherited archive requirement. |
| 452b21c3c82a86416607 | Live | High | emission-without-validation | corpus/qualification/techniques/produce.md#/rules/line-11/clause-2 | Rules clause 2 directs report emission without prior report validation. [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14 | diff | Require validation of the report before every emission in the second Rules clause. |
| 070cd4ca1a0d1330bb5b | Live | High | emission-without-validation | corpus/qualification/techniques/produce.md#/protocol/line-8 | Protocol directs report emission without prior report validation. [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14 | diff | Require validation of the report before emitting it in this Protocol instruction. |

## File Coverage

Read 5 · unread 0.


## Finding Confirmations

- finding:070cd4ca1a0d1330bb5b: confirmed — The original Protocol line 8 explicitly directs report emission without validation. AP-01 requires prior validation for every emitting instruction. This construct independently reproduces High Live, regardless of instructions elsewhere.
- finding:333b7dd9cc252e3139cb: confirmed — Follow qualification/run delivery to deliver/emit and produce, retaining the executing ancestor TECHNIQUE.md. The ancestor requires archive while the leaf declares public on line 12. DP1 reproduces an inherited contract conflict with High urgency because it reaches the concrete workflow instance. Contract identifies the propagated contradictory declarations: the fixture supplies no structural destination-binding operation that establishes which declaration wins. This does not assert a successful runtime execution.
- finding:452b21c3c82a86416607: confirmed — Independently split Rules line 11 at its semicolon: retaining the ID is the first clause; the second explicitly directs emission without validation. AP-01 applies to each clause, reproducing a separate High Live violation.
- finding:5962f0bd3a0b9cc13585: confirmed — Resolve the unchanged routine export report to emit.report, emit to produce, and then read the complete leaf Outputs section: only summary is declared. The referenced report output is absent. AP-02(2) reproduces Critical Live at this consumer binding.
- finding:7eb24eb7a951e4233345: confirmed — Start from initialActivity run. The complete graph has only run.done returning to run; no reachable transition targets null. DP2 requires a finite terminating path. The whole-graph defect independently reproduces Critical Live.
- finding:a4bf0744e8470747d764: confirmed — Resolve delivery to deliver and compare exact keys: the invocation supplies packet while the routine Inputs list requires envelope. This fixture has no aliases or optional parameters. AP-02(1) reproduces a Critical Live binding defect.
