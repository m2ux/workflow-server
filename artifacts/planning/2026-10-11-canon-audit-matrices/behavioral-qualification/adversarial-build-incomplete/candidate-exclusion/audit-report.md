# Canon Audit

Status: in progress

Base ref: None · Snapshot: a345f72e4b37abff362d4617e28438aea150597c06a720247659141069d2aa2d

Coverage: 50 rows × 4 AP/DP criteria; 199 of 200 mappings verified; 47 of 47 applicable cells evaluated.

Guards: pass. Residual: 0 unread files; 0 inventory and 0 other obligations.

Conformance: unmeasured

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
| 7c940b88b10568c5d21c | Live | Critical | [2. Provide a terminating workflow path](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt) | corpus/qualification/workflow.yaml:5 (graph.run.done) | The workflow's only reachable exit returns run to itself, so no path from initialActivity reaches null. [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11; [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5 | diff | Provide a finite path from run to null; the terminal done exit can target null. |
| 590a852c166e0d259cd9 | Live | Critical | broken-binding | corpus/qualification/routines/deliver.yaml:3 (outputs.report) | The routine exports emit.report, but the called produce technique declares only summary. [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21; [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5 | diff | Bind the exported report to emit.summary, an output declared by the technique called by emit. |
| 4ff195aedfa85a555034 | Live | Critical | broken-binding | corpus/qualification/activities/run.yaml:6 (steps.delivery.routine.arguments) | The delivery invocation supplies packet while deliver requires the envelope argument. [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21; [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5 | diff | Use the exact argument key envelope at the delivery invocation; retain the opaque value sealed. |
| c9abd3edddcf719d0230 | Live | High | [1. Honor the executing workflow's inherited destination](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt) | corpus/qualification/techniques/produce.md:12 (Rules Destination) | The leaf declares Destination is public while the executing qualification ancestor requires archive. [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8; [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6; [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6; [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12; [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5 | diff | Set the leaf Destination to archive to satisfy the inherited requirement. |
| 334477bfa3468fcc37ed | Live | High | emission-without-validation | corpus/qualification/techniques/produce.md:11 (Rules clause 2) | Rules clause 2 explicitly emits the report without validation. [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12 | diff | Require validation of the report before its emission in Rules clause 2. |
| c6bb654766beae15f273 | Live | High | emission-without-validation | corpus/qualification/techniques/produce.md:8 (Protocol instruction) | The Protocol instruction explicitly emits the report without validation. [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14; [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12 | diff | Require validation of the report before its emission in this Protocol instruction. |

## File Coverage

Read 5 · unread 0.


## Finding Confirmations

- finding:334477bfa3468fcc37ed: confirmed — Independently split line11 at the semicolon: retain-ID is one clause; the second explicitly emits without validation. AP-01 requires validation in each emitting clause, so no neighboring instruction excuses it. High Live reproduces for the emitted artifact.
- finding:4ff195aedfa85a555034: confirmed — Resolve activity delivery to deliver: argument keys are {packet}, but its exact required Inputs set is {envelope}. The fixture has no optional inputs or aliases. AP-02(1) therefore fails structurally at this concrete invocation; Critical Live reproduces.
- finding:590a852c166e0d259cd9: confirmed — Resolve the unchanged routine output report to emit.report, emit to produce, then inspect Outputs: the sole declared name is summary. report is absent. AP-02(2) fails across the changed producer and unchanged consumer; Critical Live reproduces.
- finding:7c940b88b10568c5d21c: confirmed — Start at initialActivity run. Its only graph exit done returns to run; the complete graph contains no null destination or other reachable node. DP2 cannot obtain a finite terminating path. Critical Live reproduces independently of matching activity IDs.
- finding:c6bb654766beae15f273: confirmed — Protocol line8 explicitly directs emission without validation. AP-01 requires validation of that artifact in every emitting instruction. This instruction independently violates that contract, separate from the Rules clause; High Live reproduces.
- finding:c9abd3edddcf719d0230: confirmed — Follow qualification/run delivery to deliver/emit and produce with the captured ancestor TECHNIQUE.md. The ancestor requires archive; the leaf line12 directs public. The concrete leaf violates DP1 and can direct a wrong destination, so High Live reproduces.
