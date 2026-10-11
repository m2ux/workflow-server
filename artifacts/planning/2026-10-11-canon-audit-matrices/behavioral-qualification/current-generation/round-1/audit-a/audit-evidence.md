# Audit Evidence

Snapshot: f8b567874839f2b6884b80ad0fe7ad9cf22763968966413d77cd11bc8894e9e8

## Cell 588e9afc6de79e4e15622316

Row: corpus/qualification/activities/run.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/activities/run.yaml#/id. This owned row is an activity or activity-step identifier. It neither declares an invocation argument key nor resolves an exported routine output; the activity routine-call and argument rows carry the concrete AP2 responsibilities.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /id: This names run or activity step delivery; neither identifier is a routine argument key or a producer step referenced by a routine export.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 0782b255d289b2d8aaa260a8

Row: corpus/qualification/activities/run.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/activities/run.yaml#/id. The activity defines run and invokes routine deliver with argument key envelope. Its identifiers, routine-call fields and call relationship are YAML orchestration/binding surfaces; AP1 expressly excludes routine calls and bindings from emission instructions.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /id: Run invokes deliver with envelope; these YAML identifiers/call fields do not issue technique emission instructions. AP1 excludes calls and bindings.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a93639cc3c5c1ad866587c2e

Row: corpus/qualification/activities/run.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element. This owned native activity row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /id: The activity file has no leaf Destination declaration. DP1 exempts independent file rows; its explicit call relationship carries inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7d5cdef67a14fe0a0e70a8ff

Row: corpus/qualification/activities/run.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/activities/run.yaml#/id. The activity invokes deliver inside its steps. DP2 states that activity/routine steps do not add workflow graph exits; this activity surface or activity-to-routine call does not own initialActivity/graph reachability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /id: Run contains a delivery routine step/call, not a workflow graph exit. DP2 expressly says activity steps add no graph exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fc60645fdab03b4f360b972e

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope. The owned invocation/argument surface contains the concrete argument key envelope for deliver, whose Inputs declares envelope. AP2 requires comparing these key sets; sealed is an opaque value and does not settle applicability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /steps: The delivery invocation supplies key envelope to deliver, whose Inputs is [envelope]. AP2 requires checking this concrete key-set contract.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 69bbe5f010e4e9c6cc42b36b

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity defines run and invokes routine deliver with argument key envelope. Its identifiers, routine-call fields and call relationship are YAML orchestration/binding surfaces; AP1 expressly excludes routine calls and bindings from emission instructions.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /steps: Run invokes deliver with envelope; these YAML identifiers/call fields do not issue technique emission instructions. AP1 excludes calls and bindings.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 330d9855c61f1fa6db1e92b2

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. This owned native activity row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /steps: The activity file has no leaf Destination declaration. DP1 exempts independent file rows; its explicit call relationship carries inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell ec7e3577667dbf0846b7b09f

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity invokes deliver inside its steps. DP2 states that activity/routine steps do not add workflow graph exits; this activity surface or activity-to-routine call does not own initialActivity/graph reachability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /steps: Run contains a delivery routine step/call, not a workflow graph exit. DP2 expressly says activity steps add no graph exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ece85719689c1a3411d52a12

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope. The owned invocation/argument surface contains the concrete argument key envelope for deliver, whose Inputs declares envelope. AP2 requires comparing these key sets; sealed is an opaque value and does not settle applicability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /steps/id=delivery: The delivery invocation supplies key envelope to deliver, whose Inputs is [envelope]. AP2 requires checking this concrete key-set contract.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 4c9b9e3283acb76acd0c593c

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity defines run and invokes routine deliver with argument key envelope. Its identifiers, routine-call fields and call relationship are YAML orchestration/binding surfaces; AP1 expressly excludes routine calls and bindings from emission instructions.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /steps/id=delivery: Run invokes deliver with envelope; these YAML identifiers/call fields do not issue technique emission instructions. AP1 excludes calls and bindings.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a5b35e7460c5ba032ea3ab9c

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. This owned native activity row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /steps/id=delivery: The activity file has no leaf Destination declaration. DP1 exempts independent file rows; its explicit call relationship carries inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell eaf04cb03551645c38d72842

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity invokes deliver inside its steps. DP2 states that activity/routine steps do not add workflow graph exits; this activity surface or activity-to-routine call does not own initialActivity/graph reachability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /steps/id=delivery: Run contains a delivery routine step/call, not a workflow graph exit. DP2 expressly says activity steps add no graph exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 03b141fa3c167d6b5347f32a

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/activities/run.yaml#/steps/id=delivery/id. This owned row is an activity or activity-step identifier. It neither declares an invocation argument key nor resolves an exported routine output; the activity routine-call and argument rows carry the concrete AP2 responsibilities.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /steps/id=delivery/id: This names run or activity step delivery; neither identifier is a routine argument key or a producer step referenced by a routine export.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell eb0acb5f69509bc093ccb4c4

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity defines run and invokes routine deliver with argument key envelope. Its identifiers, routine-call fields and call relationship are YAML orchestration/binding surfaces; AP1 expressly excludes routine calls and bindings from emission instructions.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /steps/id=delivery/id: Run invokes deliver with envelope; these YAML identifiers/call fields do not issue technique emission instructions. AP1 excludes calls and bindings.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a09b4b5068e60047e85b9d20

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. This owned native activity row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /steps/id=delivery/id: The activity file has no leaf Destination declaration. DP1 exempts independent file rows; its explicit call relationship carries inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 51923b360aa3ef1a7585fbf4

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity invokes deliver inside its steps. DP2 states that activity/routine steps do not add workflow graph exits; this activity surface or activity-to-routine call does not own initialActivity/graph reachability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /steps/id=delivery/id: Run contains a delivery routine step/call, not a workflow graph exit. DP2 expressly says activity steps add no graph exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 366a1ced08e276234b09d365

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope. The owned invocation/argument surface contains the concrete argument key envelope for deliver, whose Inputs declares envelope. AP2 requires comparing these key sets; sealed is an opaque value and does not settle applicability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /steps/id=delivery/routine: The delivery invocation supplies key envelope to deliver, whose Inputs is [envelope]. AP2 requires checking this concrete key-set contract.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 8f71acc678543f1dedd6da64

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity defines run and invokes routine deliver with argument key envelope. Its identifiers, routine-call fields and call relationship are YAML orchestration/binding surfaces; AP1 expressly excludes routine calls and bindings from emission instructions.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /steps/id=delivery/routine: Run invokes deliver with envelope; these YAML identifiers/call fields do not issue technique emission instructions. AP1 excludes calls and bindings.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 4e129aea04e56ac3f5e18eac

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. This owned native activity row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /steps/id=delivery/routine: The activity file has no leaf Destination declaration. DP1 exempts independent file rows; its explicit call relationship carries inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7fa24663abc3348858407cd5

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity invokes deliver inside its steps. DP2 states that activity/routine steps do not add workflow graph exits; this activity surface or activity-to-routine call does not own initialActivity/graph reachability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /steps/id=delivery/routine: Run contains a delivery routine step/call, not a workflow graph exit. DP2 expressly says activity steps add no graph exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e4e1d36386ad37dc4007d953

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope. The owned invocation/argument surface contains the concrete argument key envelope for deliver, whose Inputs declares envelope. AP2 requires comparing these key sets; sealed is an opaque value and does not settle applicability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /steps/id=delivery/routine/arguments: The delivery invocation supplies key envelope to deliver, whose Inputs is [envelope]. AP2 requires checking this concrete key-set contract.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 85d58778322169b7eb358fb2

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity defines run and invokes routine deliver with argument key envelope. Its identifiers, routine-call fields and call relationship are YAML orchestration/binding surfaces; AP1 expressly excludes routine calls and bindings from emission instructions.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /steps/id=delivery/routine/arguments: Run invokes deliver with envelope; these YAML identifiers/call fields do not issue technique emission instructions. AP1 excludes calls and bindings.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 235d809af28915c83b47a336

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. This owned native activity row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /steps/id=delivery/routine/arguments: The activity file has no leaf Destination declaration. DP1 exempts independent file rows; its explicit call relationship carries inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 8f04699d8cada26b1b7ebcc5

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity invokes deliver inside its steps. DP2 states that activity/routine steps do not add workflow graph exits; this activity surface or activity-to-routine call does not own initialActivity/graph reachability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /steps/id=delivery/routine/arguments: Run contains a delivery routine step/call, not a workflow graph exit. DP2 expressly says activity steps add no graph exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell f45b86c19f25461cbe667622

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope. The owned invocation/argument surface contains the concrete argument key envelope for deliver, whose Inputs declares envelope. AP2 requires comparing these key sets; sealed is an opaque value and does not settle applicability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /steps/id=delivery/routine/arguments/envelope: The delivery invocation supplies key envelope to deliver, whose Inputs is [envelope]. AP2 requires checking this concrete key-set contract.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell e7190e6183add8a7b67d408d

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity defines run and invokes routine deliver with argument key envelope. Its identifiers, routine-call fields and call relationship are YAML orchestration/binding surfaces; AP1 expressly excludes routine calls and bindings from emission instructions.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /steps/id=delivery/routine/arguments/envelope: Run invokes deliver with envelope; these YAML identifiers/call fields do not issue technique emission instructions. AP1 excludes calls and bindings.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell cb6557b6c858a3df047947ff

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. This owned native activity row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /steps/id=delivery/routine/arguments/envelope: The activity file has no leaf Destination declaration. DP1 exempts independent file rows; its explicit call relationship carries inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell f7c71bd7cd44e3d3cfd50614

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity invokes deliver inside its steps. DP2 states that activity/routine steps do not add workflow graph exits; this activity surface or activity-to-routine call does not own initialActivity/graph reachability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /steps/id=delivery/routine/arguments/envelope: Run contains a delivery routine step/call, not a workflow graph exit. DP2 expressly says activity steps add no graph exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 23d52f087c143d67f67da445

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The routine name deliver resolves this concrete activity invocation to Inputs [envelope]. Its sibling arguments have the single key envelope; AP2 requires resolving and checking every concrete invocation against its declared input keys.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /steps/id=delivery/routine/name: The deliver reference resolves the concrete call with key envelope to Inputs [envelope]. AP2 requires each invocation to resolve and compare keys.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 7a49531ccbd7063bf5c4dd03

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity defines run and invokes routine deliver with argument key envelope. Its identifiers, routine-call fields and call relationship are YAML orchestration/binding surfaces; AP1 expressly excludes routine calls and bindings from emission instructions.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /steps/id=delivery/routine/name: Run invokes deliver with envelope; these YAML identifiers/call fields do not issue technique emission instructions. AP1 excludes calls and bindings.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell cced7364e2269714c048fe3b

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. This owned native activity row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /steps/id=delivery/routine/name: The activity file has no leaf Destination declaration. DP1 exempts independent file rows; its explicit call relationship carries inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 501147c7c9cf63d456cc367b

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name. The activity invokes deliver inside its steps. DP2 states that activity/routine steps do not add workflow graph exits; this activity surface or activity-to-routine call does not own initialActivity/graph reachability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /steps/id=delivery/routine/name: Run contains a delivery routine step/call, not a workflow graph exit. DP2 expressly says activity steps add no graph exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b331b3631bac4371bfebf008

Row: corpus/qualification/activities/run.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/activities/run.yaml#@element. The owned invocation/argument surface contains the concrete argument key envelope for deliver, whose Inputs declares envelope. AP2 requires comparing these key sets; sealed is an opaque value and does not settle applicability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for @element: The delivery invocation supplies key envelope to deliver, whose Inputs is [envelope]. AP2 requires checking this concrete key-set contract.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 6d000a7587cb7a720d3ce09a

Row: corpus/qualification/activities/run.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/activities/run.yaml#@element. The activity defines run and invokes routine deliver with argument key envelope. Its identifiers, routine-call fields and call relationship are YAML orchestration/binding surfaces; AP1 expressly excludes routine calls and bindings from emission instructions.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for @element: Run invokes deliver with envelope; these YAML identifiers/call fields do not issue technique emission instructions. AP1 excludes calls and bindings.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell fd8572c700cc4625bf5e2e78

Row: corpus/qualification/activities/run.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element. This owned native activity row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for @element: The activity file has no leaf Destination declaration. DP1 exempts independent file rows; its explicit call relationship carries inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 8b3b602b6703003326b8df8d

Row: corpus/qualification/activities/run.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/activities/run.yaml#@element. The activity invokes deliver inside its steps. DP2 states that activity/routine steps do not add workflow graph exits; this activity surface or activity-to-routine call does not own initialActivity/graph reachability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for @element: Run contains a delivery routine step/call, not a workflow graph exit. DP2 expressly says activity steps add no graph exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell eeab805ea4653756496776b5

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53. This activity-to-deliver call relationship carries the concrete argument key set {envelope} and the target Inputs [envelope]. AP2 expressly checks that invocation contract, independently of routine validity.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /steps/id=delivery/routine/name: The deliver reference resolves the concrete call with key envelope to Inputs [envelope]. AP2 requires each invocation to resolve and compare keys.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell e42353cfc8fe3169b809b996

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53. The activity defines run and invokes routine deliver with argument key envelope. Its identifiers, routine-call fields and call relationship are YAML orchestration/binding surfaces; AP1 expressly excludes routine calls and bindings from emission instructions.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /steps/id=delivery/routine/name: Run invokes deliver with envelope; these YAML identifiers/call fields do not issue technique emission instructions. AP1 excludes calls and bindings.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 91a7785154a1a018658ccae8

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — dp:1; owned rows corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53. This explicit call/execution relationship lies on the concrete executing chain: qualification initialActivity run invokes deliver from delivery; deliver calls produce from emit; produce declares Destination archive and the executing workflow ancestor TECHNIQUE.md requires archive. DP1 expressly requires call and inheritance relationships to carry the rule to that leaf instance, even when the caller file has no destination declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — A verified for /steps/id=delivery/routine/name: This call lies on qualification/run to deliver/emit to produce. DP1 explicitly carries the ancestor archive rule to leaf destination archive.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 36c8e451b93d39512aae352f

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53. The activity invokes deliver inside its steps. DP2 states that activity/routine steps do not add workflow graph exits; this activity surface or activity-to-routine call does not own initialActivity/graph reachability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /steps/id=delivery/routine/name: Run contains a delivery routine step/call, not a workflow graph exit. DP2 expressly says activity steps add no graph exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell bfa09024c94a6bc76d51c631

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/routines/deliver.yaml#/id. The value deliver identifies the routine itself. AP2 checks its Inputs against concrete invocation keys and resolves emit.report through producer step emit; this routine identifier is neither of those binding surfaces.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /id: The routine id deliver identifies the definition; AP2 binding responsibilities reside in its Inputs, exports and referenced producer steps.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 9156a757fd93955348ca5766

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/routines/deliver.yaml#/id. The routine declares input envelope, exports report as emit.report and calls technique produce. These declaration, binding and call/execution surfaces do not themselves direct emission in a technique Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /id: Deliver declares envelope, binds emit.report and calls produce. AP1 excludes these declarations and calls from Protocol/Rules emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell bf312e511dcc8f4eda77a41a

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/routines/deliver.yaml#/id. This owned native routine row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /id: The routine file has no leaf Destination declaration. DP1 exempts independent file rows; explicit producer/execution relationships carry inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell a0e70a1645458e99657058ca

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/routines/deliver.yaml#/id. The routine defines Inputs, an emit.report export and a produce step/call. These local steps and execution relationships do not add workflow graph exits under DP2; the workflow rows own the finite-path obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /id: Deliver owns local inputs, an export and a produce call. DP2 says routine steps add no graph exits; execution context does not change that role.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 620325a4c3f62c9867a7df90

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. This routine input surface declares envelope, the required key for the activity delivery invocation whose actual key set is {envelope}. AP2 checks the concrete caller against this Inputs contract.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /inputs: Inputs declares envelope, the contract for delivery arguments [envelope]. This declaration participates in the exact-key comparison required by AP2.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 2e52133101ac058519a8aa51

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. The routine declares input envelope, exports report as emit.report and calls technique produce. These declaration, binding and call/execution surfaces do not themselves direct emission in a technique Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /inputs: Deliver declares envelope, binds emit.report and calls produce. AP1 excludes these declarations and calls from Protocol/Rules emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell cf440ff1717daba3ba33af52

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/routines/deliver.yaml#@element. This owned native routine row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /inputs: The routine file has no leaf Destination declaration. DP1 exempts independent file rows; explicit producer/execution relationships carry inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0e0de76a45b1ce5cc0a55a2d

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. The routine defines Inputs, an emit.report export and a produce step/call. These local steps and execution relationships do not add workflow graph exits under DP2; the workflow rows own the finite-path obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /inputs: Deliver owns local inputs, an export and a produce call. DP2 says routine steps add no graph exits; execution context does not change that role.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 85e68983cef9c8b0f9a7bf33

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. This routine input surface declares envelope, the required key for the activity delivery invocation whose actual key set is {envelope}. AP2 checks the concrete caller against this Inputs contract.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /inputs/0: Inputs declares envelope, the contract for delivery arguments [envelope]. This declaration participates in the exact-key comparison required by AP2.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 8d0a1adc7b4ff87710b48af6

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. The routine declares input envelope, exports report as emit.report and calls technique produce. These declaration, binding and call/execution surfaces do not themselves direct emission in a technique Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /inputs/0: Deliver declares envelope, binds emit.report and calls produce. AP1 excludes these declarations and calls from Protocol/Rules emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell af24593c352cedfdf9a972fa

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/routines/deliver.yaml#@element. This owned native routine row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /inputs/0: The routine file has no leaf Destination declaration. DP1 exempts independent file rows; explicit producer/execution relationships carry inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0dfaae8a980c43d6afea14bc

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. The routine defines Inputs, an emit.report export and a produce step/call. These local steps and execution relationships do not add workflow graph exits under DP2; the workflow rows own the finite-path obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /inputs/0: Deliver owns local inputs, an export and a produce call. DP2 says routine steps add no graph exits; execution context does not change that role.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 1682a187cf7dd36419e2a143

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report. The routine export report binds emit.report. Step emit calls produce, whose Outputs declares report; AP2 requires resolving the producer and checking the referenced output name report against that declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /outputs: The report export is emit.report; emit calls produce, whose declared output is report. AP2 requires comparing the referenced producer name.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 8f64e24f8a4caa9482d28228

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@element. The routine declares input envelope, exports report as emit.report and calls technique produce. These declaration, binding and call/execution surfaces do not themselves direct emission in a technique Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /outputs: Deliver declares envelope, binds emit.report and calls produce. AP1 excludes these declarations and calls from Protocol/Rules emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell ab40e04b150dd3790c5764db

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report. This owned native routine row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /outputs: The routine file has no leaf Destination declaration. DP1 exempts independent file rows; explicit producer/execution relationships carry inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7c49f2961aec4917ed955bd7

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@element. The routine defines Inputs, an emit.report export and a produce step/call. These local steps and execution relationships do not add workflow graph exits under DP2; the workflow rows own the finite-path obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /outputs: Deliver owns local inputs, an export and a produce call. DP2 says routine steps add no graph exits; execution context does not change that role.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 7f71a92e9f425b2094dec98d

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report. The routine export report binds emit.report. Step emit calls produce, whose Outputs declares report; AP2 requires resolving the producer and checking the referenced output name report against that declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /outputs/report: The report export is emit.report; emit calls produce, whose declared output is report. AP2 requires comparing the referenced producer name.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 232c484eaf1003ef830d4ffa

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@element. The routine declares input envelope, exports report as emit.report and calls technique produce. These declaration, binding and call/execution surfaces do not themselves direct emission in a technique Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /outputs/report: Deliver declares envelope, binds emit.report and calls produce. AP1 excludes these declarations and calls from Protocol/Rules emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 791a31ca8731b94c89d67e5c

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report. This owned native routine row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /outputs/report: The routine file has no leaf Destination declaration. DP1 exempts independent file rows; explicit producer/execution relationships carry inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell ad7314b738ea597d93ae3b23

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@element. The routine defines Inputs, an emit.report export and a produce step/call. These local steps and execution relationships do not add workflow graph exits under DP2; the workflow rows own the finite-path obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /outputs/report: Deliver owns local inputs, an export and a produce call. DP2 says routine steps add no graph exits; execution context does not change that role.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 82c8e910cc4b4df96a89e369

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique. This producer step/call surface resolves emit to technique produce for the routine binding emit.report. The called technique declares output report; AP2 explicitly requires step and technique resolution before comparing the referenced output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /steps: Step emit resolves export emit.report to produce and its output report. AP2 explicitly requires step/technique resolution before comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell cbb292d61ff63c7740d065be

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. The routine declares input envelope, exports report as emit.report and calls technique produce. These declaration, binding and call/execution surfaces do not themselves direct emission in a technique Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /steps: Deliver declares envelope, binds emit.report and calls produce. AP1 excludes these declarations and calls from Protocol/Rules emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 2228315b4ed81fce11373514

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report. This owned native routine row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /steps: The routine file has no leaf Destination declaration. DP1 exempts independent file rows; explicit producer/execution relationships carry inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell f82d1cd9016de1cdd797e170

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. The routine defines Inputs, an emit.report export and a produce step/call. These local steps and execution relationships do not add workflow graph exits under DP2; the workflow rows own the finite-path obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /steps: Deliver owns local inputs, an export and a produce call. DP2 says routine steps add no graph exits; execution context does not change that role.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 790b168511688f3580f49f17

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique. This producer step/call surface resolves emit to technique produce for the routine binding emit.report. The called technique declares output report; AP2 explicitly requires step and technique resolution before comparing the referenced output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /steps/id=emit: Step emit resolves export emit.report to produce and its output report. AP2 explicitly requires step/technique resolution before comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell bbb0ef5214ae8bbcce715c65

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. The routine declares input envelope, exports report as emit.report and calls technique produce. These declaration, binding and call/execution surfaces do not themselves direct emission in a technique Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /steps/id=emit: Deliver declares envelope, binds emit.report and calls produce. AP1 excludes these declarations and calls from Protocol/Rules emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 2160f33c3a701883bf507397

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report. This owned native routine row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /steps/id=emit: The routine file has no leaf Destination declaration. DP1 exempts independent file rows; explicit producer/execution relationships carry inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 569231fa0b1023abbf3fc5e4

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. The routine defines Inputs, an emit.report export and a produce step/call. These local steps and execution relationships do not add workflow graph exits under DP2; the workflow rows own the finite-path obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /steps/id=emit: Deliver owns local inputs, an export and a produce call. DP2 says routine steps add no graph exits; execution context does not change that role.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e6707d2a492bbb28eafc3a21

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique. This producer step/call surface resolves emit to technique produce for the routine binding emit.report. The called technique declares output report; AP2 explicitly requires step and technique resolution before comparing the referenced output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /steps/id=emit/id: Step emit resolves export emit.report to produce and its output report. AP2 explicitly requires step/technique resolution before comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 71fd5507f4b74e2ec91c2b3e

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. The routine declares input envelope, exports report as emit.report and calls technique produce. These declaration, binding and call/execution surfaces do not themselves direct emission in a technique Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /steps/id=emit/id: Deliver declares envelope, binds emit.report and calls produce. AP1 excludes these declarations and calls from Protocol/Rules emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b707f101a68f594abdbb9fc8

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report. This owned native routine row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /steps/id=emit/id: The routine file has no leaf Destination declaration. DP1 exempts independent file rows; explicit producer/execution relationships carry inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7567be6ff4d583433092c972

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. The routine defines Inputs, an emit.report export and a produce step/call. These local steps and execution relationships do not add workflow graph exits under DP2; the workflow rows own the finite-path obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /steps/id=emit/id: Deliver owns local inputs, an export and a produce call. DP2 says routine steps add no graph exits; execution context does not change that role.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 387b3abcf94e6a19aabbf992

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique. This producer step/call surface resolves emit to technique produce for the routine binding emit.report. The called technique declares output report; AP2 explicitly requires step and technique resolution before comparing the referenced output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /steps/id=emit/technique: Step emit resolves export emit.report to produce and its output report. AP2 explicitly requires step/technique resolution before comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell f2a200e38a51bc411ee5e057

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. The routine declares input envelope, exports report as emit.report and calls technique produce. These declaration, binding and call/execution surfaces do not themselves direct emission in a technique Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /steps/id=emit/technique: Deliver declares envelope, binds emit.report and calls produce. AP1 excludes these declarations and calls from Protocol/Rules emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell d5d35100c716e2ed184e7476

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report. This owned native routine row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /steps/id=emit/technique: The routine file has no leaf Destination declaration. DP1 exempts independent file rows; explicit producer/execution relationships carry inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 90bd5ed8d7c0859a6fbe41a1

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0. The routine defines Inputs, an emit.report export and a produce step/call. These local steps and execution relationships do not add workflow graph exits under DP2; the workflow rows own the finite-path obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /steps/id=emit/technique: Deliver owns local inputs, an export and a produce call. DP2 says routine steps add no graph exits; execution context does not change that role.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fa301823ccd44ed9374ce575

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/routines/deliver.yaml#@element. This routine/execution surface connects the delivery argument key envelope to Inputs [envelope] and resolves exported emit.report through emit to produce Outputs [report]. Both concrete binding responsibilities are within AP2; this receipt records applicability only.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for @element: Delivery supplies envelope against envelope; emit.report resolves through emit to produce output report. This surface carries both AP2 contracts.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 2ec151da2546cd9066780932

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@element. The routine declares input envelope, exports report as emit.report and calls technique produce. These declaration, binding and call/execution surfaces do not themselves direct emission in a technique Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for @element: Deliver declares envelope, binds emit.report and calls produce. AP1 excludes these declarations and calls from Protocol/Rules emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 65dd3d64e8c54c7713685121

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/routines/deliver.yaml#@element. This owned native routine row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for @element: The routine file has no leaf Destination declaration. DP1 exempts independent file rows; explicit producer/execution relationships carry inheritance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 19723157905da0f5874e77db

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@element. The routine defines Inputs, an emit.report export and a produce step/call. These local steps and execution relationships do not add workflow graph exits under DP2; the workflow rows own the finite-path obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for @element: Deliver owns local inputs, an export and a produce call. DP2 says routine steps add no graph exits; execution context does not change that role.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b34f6249f0f9b31107491750

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7. This producer step/call surface resolves emit to technique produce for the routine binding emit.report. The called technique declares output report; AP2 explicitly requires step and technique resolution before comparing the referenced output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /steps/id=emit/technique: Step emit resolves export emit.report to produce and its output report. AP2 explicitly requires step/technique resolution before comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell afeb129e1e03e4f353693950

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7. The routine declares input envelope, exports report as emit.report and calls technique produce. These declaration, binding and call/execution surfaces do not themselves direct emission in a technique Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /steps/id=emit/technique: Deliver declares envelope, binds emit.report and calls produce. AP1 excludes these declarations and calls from Protocol/Rules emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell eb3d9f625d45294630564c36

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — dp:1; owned rows corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96. This explicit call/execution relationship lies on the concrete executing chain: qualification initialActivity run invokes deliver from delivery; deliver calls produce from emit; produce declares Destination archive and the executing workflow ancestor TECHNIQUE.md requires archive. DP1 expressly requires call and inheritance relationships to carry the rule to that leaf instance, even when the caller file has no destination declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — A verified for /steps/id=emit/technique: This call lies on qualification/run to deliver/emit to produce. DP1 explicitly carries the ancestor archive rule to leaf destination archive.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell a6cc9c95bd8a15eec9337ab9

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7. The routine defines Inputs, an emit.report export and a produce step/call. These local steps and execution relationships do not add workflow graph exits under DP2; the workflow rows own the finite-path obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /steps/id=emit/technique: Deliver owns local inputs, an export and a produce call. DP2 says routine steps add no graph exits; execution context does not change that role.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 8669d4026237cb94e83e2158

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96. This routine/execution surface connects the delivery argument key envelope to Inputs [envelope] and resolves exported emit.report through emit to produce Outputs [report]. Both concrete binding responsibilities are within AP2; this receipt records applicability only.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for execution/qualification/run/delivery/deliver/emit: Delivery supplies envelope against envelope; emit.report resolves through emit to produce output report. This surface carries both AP2 contracts.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 7b47769dd43afb09823a4b14

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96. The routine declares input envelope, exports report as emit.report and calls technique produce. These declaration, binding and call/execution surfaces do not themselves direct emission in a technique Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for execution/qualification/run/delivery/deliver/emit: Deliver declares envelope, binds emit.report and calls produce. AP1 excludes these declarations and calls from Protocol/Rules emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 15ee43746437cfdf860b1519

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — dp:1; owned rows corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96. This explicit call/execution relationship lies on the concrete executing chain: qualification initialActivity run invokes deliver from delivery; deliver calls produce from emit; produce declares Destination archive and the executing workflow ancestor TECHNIQUE.md requires archive. DP1 expressly requires call and inheritance relationships to carry the rule to that leaf instance, even when the caller file has no destination declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — A verified for execution/qualification/run/delivery/deliver/emit: This call lies on qualification/run to deliver/emit to produce. DP1 explicitly carries the ancestor archive rule to leaf destination archive.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7616d539ed6effba75237723

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96. The routine defines Inputs, an emit.report export and a produce step/call. These local steps and execution relationships do not add workflow graph exits under DP2; the workflow rows own the finite-path obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for execution/qualification/run/delivery/deliver/emit: Deliver owns local inputs, an export and a produce call. DP2 says routine steps add no graph exits; execution context does not change that role.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 5fb3f06992383a0be7318734

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element. The ancestor contains Capability and an inherited destination Rule, with no routine Inputs, technique Outputs, activity argument mapping or routine export reference. It supplies no AP2 binding responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /capability: The ancestor only describes a service and requires destination archive; it has no Inputs, Outputs, invocation arguments or exported output binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell d9eb0eb2cb8f9fb790e82eee

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element. The ancestor contains only a Capability description and the constraint Destination must be archive. These inherited declarations do not direct artifact emission in a leaf Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /capability: The ancestor contains descriptive Capability text and Destination must be archive; neither instructs artifact emission under AP1.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b6ad6f9e4c3bf6bcd7517234

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element. The ancestor declares Destination must be archive. DP1 explicitly treats this as the inherited constraint, not a conflicting leaf destination; the owned ancestor surface is not independently judged as a leaf instance.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /capability: TECHNIQUE.md declares the inherited archive constraint. DP1 explicitly distinguishes that ancestor declaration from a leaf destination.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0ed30157350f8c23d6297b75

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /capability: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell c9c06fb4ee9924c6c63c553f

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element. The ancestor contains Capability and an inherited destination Rule, with no routine Inputs, technique Outputs, activity argument mapping or routine export reference. It supplies no AP2 binding responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /capability/line-2: The ancestor only describes a service and requires destination archive; it has no Inputs, Outputs, invocation arguments or exported output binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 720f7eeadf6be862dd39b7ab

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element. The ancestor contains only a Capability description and the constraint Destination must be archive. These inherited declarations do not direct artifact emission in a leaf Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /capability/line-2: The ancestor contains descriptive Capability text and Destination must be archive; neither instructs artifact emission under AP1.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 3dd8981b7cf70f3489f0cb9a

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element. The ancestor declares Destination must be archive. DP1 explicitly treats this as the inherited constraint, not a conflicting leaf destination; the owned ancestor surface is not independently judged as a leaf instance.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /capability/line-2: TECHNIQUE.md declares the inherited archive constraint. DP1 explicitly distinguishes that ancestor declaration from a leaf destination.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 62d70a2ce5a077d8010ce9fe

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /capability/line-2: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ac42c54bb5e18cc6005d1df7

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element. The ancestor contains Capability and an inherited destination Rule, with no routine Inputs, technique Outputs, activity argument mapping or routine export reference. It supplies no AP2 binding responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /rules: The ancestor only describes a service and requires destination archive; it has no Inputs, Outputs, invocation arguments or exported output binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 541cffe238719bcc6a46fe77

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5. The ancestor contains only a Capability description and the constraint Destination must be archive. These inherited declarations do not direct artifact emission in a leaf Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /rules: The ancestor contains descriptive Capability text and Destination must be archive; neither instructs artifact emission under AP1.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b3f616c2c1a987217e5cf61b

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element. The ancestor declares Destination must be archive. DP1 explicitly treats this as the inherited constraint, not a conflicting leaf destination; the owned ancestor surface is not independently judged as a leaf instance.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /rules: TECHNIQUE.md declares the inherited archive constraint. DP1 explicitly distinguishes that ancestor declaration from a leaf destination.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell d9b55f0b6cbe3ed6ab868ed5

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /rules: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell bfde9ab405ad9faa2bc4b5ac

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element. The ancestor contains Capability and an inherited destination Rule, with no routine Inputs, technique Outputs, activity argument mapping or routine export reference. It supplies no AP2 binding responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /rules/line-5: The ancestor only describes a service and requires destination archive; it has no Inputs, Outputs, invocation arguments or exported output binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 06d002e75cf36ea1b43c83b1

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5. The ancestor contains only a Capability description and the constraint Destination must be archive. These inherited declarations do not direct artifact emission in a leaf Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /rules/line-5: The ancestor contains descriptive Capability text and Destination must be archive; neither instructs artifact emission under AP1.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 67ae926240e520bfdb63b1a3

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element. The ancestor declares Destination must be archive. DP1 explicitly treats this as the inherited constraint, not a conflicting leaf destination; the owned ancestor surface is not independently judged as a leaf instance.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /rules/line-5: TECHNIQUE.md declares the inherited archive constraint. DP1 explicitly distinguishes that ancestor declaration from a leaf destination.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 4da9396f20f50a18673256c5

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /rules/line-5: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 4d029f4ed7a941dc5b13bafa

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element. The ancestor contains Capability and an inherited destination Rule, with no routine Inputs, technique Outputs, activity argument mapping or routine export reference. It supplies no AP2 binding responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for @element: The ancestor only describes a service and requires destination archive; it has no Inputs, Outputs, invocation arguments or exported output binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 01bc60dde7d03c634b92d11c

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element. The ancestor contains only a Capability description and the constraint Destination must be archive. These inherited declarations do not direct artifact emission in a leaf Protocol instruction or Rules clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for @element: The ancestor contains descriptive Capability text and Destination must be archive; neither instructs artifact emission under AP1.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 69c0652ae2e85de91e1e5de4

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element. The ancestor declares Destination must be archive. DP1 explicitly treats this as the inherited constraint, not a conflicting leaf destination; the owned ancestor surface is not independently judged as a leaf instance.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for @element: TECHNIQUE.md declares the inherited archive constraint. DP1 explicitly distinguishes that ancestor declaration from a leaf destination.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 54a73e1bf111128988cf03fe

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for @element: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 4c3a69d6842d941bb1b4ae64

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The owned Capability/Protocol/Rules surface contains prose about producing, retaining or routing a report. AP2 expressly excludes artifact mentions in Markdown prose; the separate Outputs declaration supplies the producer name used by the routine binding.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /capability: This technique prose describes capability, emission, retention or destination. AP2 excludes Markdown artifact mentions; Outputs is separate.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell e192558242a4ed960c5d7a46

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. Capability describes the service as Produce a report; AP1 expressly excludes descriptive Capability text from the imperative Protocol/Rules emission check.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /capability: Produce a report is the Capability description. AP1 explicitly excludes Capability descriptions from imperative emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 36ee15fe5284f5e03e6afdc4

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The owned leaf Capability/Outputs/Protocol or report-retention/emission clause contains no Destination declaration. DP1 targets the separate leaf destination row and explicit inheritance relationship; artifact production/emission wording alone does not establish this row as a destination surface.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /capability: This Capability/Outputs/Protocol or retention/emission row contains no Destination declaration; DP1 assigns the leaf destination separately.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 6eb38943804944cf6cfbb4ed

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /capability: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 883f9febadc76de8d4b64dd6

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The owned Capability/Protocol/Rules surface contains prose about producing, retaining or routing a report. AP2 expressly excludes artifact mentions in Markdown prose; the separate Outputs declaration supplies the producer name used by the routine binding.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /capability/line-2: This technique prose describes capability, emission, retention or destination. AP2 excludes Markdown artifact mentions; Outputs is separate.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell e3b51412d1cbb5b26dbb8664

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. Capability describes the service as Produce a report; AP1 expressly excludes descriptive Capability text from the imperative Protocol/Rules emission check.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /capability/line-2: Produce a report is the Capability description. AP1 explicitly excludes Capability descriptions from imperative emission instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b82b83027689277cdcc2042f

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The owned leaf Capability/Outputs/Protocol or report-retention/emission clause contains no Destination declaration. DP1 targets the separate leaf destination row and explicit inheritance relationship; artifact production/emission wording alone does not establish this row as a destination surface.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /capability/line-2: This Capability/Outputs/Protocol or retention/emission row contains no Destination declaration; DP1 assigns the leaf destination separately.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell dadf707dc4833496ce962762

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /capability/line-2: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell c986d23bf9fe92ac15ab723d

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/report. The technique Outputs declaration names report. Deliver binds emit.report and resolves emit to produce, so AP2 requires comparing report with this declared producer output name. Merely naming an artifact in prose would not create this binding responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /outputs: Produce declares output report; deliver exports emit.report through step emit calling produce. This producer declaration participates in AP2.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell e00abe344b2cf11c702b34f1

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/report. The owned Outputs surface declares the name report; an output declaration does not direct emission under AP1.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /outputs: Outputs declares report; AP1 explicitly excludes output declarations, which do not direct emission.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b7876638c82ca7835e6ecd54

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/report. The owned leaf Capability/Outputs/Protocol or report-retention/emission clause contains no Destination declaration. DP1 targets the separate leaf destination row and explicit inheritance relationship; artifact production/emission wording alone does not establish this row as a destination surface.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /outputs: This Capability/Outputs/Protocol or retention/emission row contains no Destination declaration; DP1 assigns the leaf destination separately.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 9839de920cafa86c93f9e319

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/report, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /outputs: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 8835c0ddec51d397d30590e7

Row: corpus/qualification/techniques/produce.md#/outputs/report

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/report. The technique Outputs declaration names report. Deliver binds emit.report and resolves emit to produce, so AP2 requires comparing report with this declared producer output name. Merely naming an artifact in prose would not create this binding responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for /outputs/report: Produce declares output report; deliver exports emit.report through step emit calling produce. This producer declaration participates in AP2.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell f0f7088daffd00158c0c1032

Row: corpus/qualification/techniques/produce.md#/outputs/report

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/report. The owned Outputs surface declares the name report; an output declaration does not direct emission under AP1.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /outputs/report: Outputs declares report; AP1 explicitly excludes output declarations, which do not direct emission.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 52eadd327712a19ac6cca68e

Row: corpus/qualification/techniques/produce.md#/outputs/report

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/report. The owned leaf Capability/Outputs/Protocol or report-retention/emission clause contains no Destination declaration. DP1 targets the separate leaf destination row and explicit inheritance relationship; artifact production/emission wording alone does not establish this row as a destination surface.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /outputs/report: This Capability/Outputs/Protocol or retention/emission row contains no Destination declaration; DP1 assigns the leaf destination separately.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 16ed4220394232ac66e84453

Row: corpus/qualification/techniques/produce.md#/outputs/report

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/report, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /outputs/report: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 547682eae905cf61fddd33be

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8. The owned Capability/Protocol/Rules surface contains prose about producing, retaining or routing a report. AP2 expressly excludes artifact mentions in Markdown prose; the separate Outputs declaration supplies the producer name used by the routine binding.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /protocol: This technique prose describes capability, emission, retention or destination. AP2 excludes Markdown artifact mentions; Outputs is separate.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 668f2c03b5c1dfffd6143cc5

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — ap:emission-without-validation; owned rows corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8. The owned Protocol surface contains the concrete report-emission instruction: Validate the report, then emit it. AP1 applies to each such instruction regardless of whether validation is required.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — A verified for /protocol: Protocol directs: Validate the report, then emit it. AP1 covers each emitting instruction; requiring validation affects its result, not its applicability.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 533e91f3401233d0974551eb

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8. The owned leaf Capability/Outputs/Protocol or report-retention/emission clause contains no Destination declaration. DP1 targets the separate leaf destination row and explicit inheritance relationship; artifact production/emission wording alone does not establish this row as a destination surface.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /protocol: This Capability/Outputs/Protocol or retention/emission row contains no Destination declaration; DP1 assigns the leaf destination separately.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell a700a3294be653eb8e533547

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/report, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /protocol: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 0f13f165ba007a4540cef470

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8. The owned Capability/Protocol/Rules surface contains prose about producing, retaining or routing a report. AP2 expressly excludes artifact mentions in Markdown prose; the separate Outputs declaration supplies the producer name used by the routine binding.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /protocol/line-8: This technique prose describes capability, emission, retention or destination. AP2 excludes Markdown artifact mentions; Outputs is separate.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 7f339716e8d7474fb2512654

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — ap:emission-without-validation; owned rows corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8. The owned Protocol surface contains the concrete report-emission instruction: Validate the report, then emit it. AP1 applies to each such instruction regardless of whether validation is required.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — A verified for /protocol/line-8: Protocol directs: Validate the report, then emit it. AP1 covers each emitting instruction; requiring validation affects its result, not its applicability.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell fbafce4f79dd46979495549a

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8. The owned leaf Capability/Outputs/Protocol or report-retention/emission clause contains no Destination declaration. DP1 targets the separate leaf destination row and explicit inheritance relationship; artifact production/emission wording alone does not establish this row as a destination surface.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /protocol/line-8: This Capability/Outputs/Protocol or retention/emission row contains no Destination declaration; DP1 assigns the leaf destination separately.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell cc4fea783a74407b8fdb654e

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/report, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /protocol/line-8: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell a30b577290e3406e29334f7b

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The owned Capability/Protocol/Rules surface contains prose about producing, retaining or routing a report. AP2 expressly excludes artifact mentions in Markdown prose; the separate Outputs declaration supplies the producer name used by the routine binding.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /rules: This technique prose describes capability, emission, retention or destination. AP2 excludes Markdown artifact mentions; Outputs is separate.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell d10a33e1908da3335366adaa

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — ap:emission-without-validation; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2. The owned Rules surface includes the second semicolon clause, validate the report before each emission. This governs report emission, so AP1 applies to that clause independently of the neighboring retention clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — A verified for /rules: The second Rules clause directs: validate the report before each emission. AP1 requires examining this emitting clause independently of the retention clause.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 381dd396d48f156e5b5332ba

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — dp:1; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12. The owned leaf surface contains its Destination declaration, so DP1 applies in the executing inheritance context: qualification initialActivity run invokes deliver from delivery; deliver calls produce from emit; produce declares Destination archive and the executing workflow ancestor TECHNIQUE.md requires archive. Applicability leaves the comparison result to evaluation.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — A verified for /rules: This leaf surface contains Destination archive. Qualification/run calls deliver then produce, inheriting archive; DP1 requires that comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 21b5df21a5c696fcaa898fbf

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /rules: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 6dff2018269cdd7f6ce3a242

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The owned Capability/Protocol/Rules surface contains prose about producing, retaining or routing a report. AP2 expressly excludes artifact mentions in Markdown prose; the separate Outputs declaration supplies the producer name used by the routine binding.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /rules/line-11: This technique prose describes capability, emission, retention or destination. AP2 excludes Markdown artifact mentions; Outputs is separate.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell a3b7b46de80a7e60f06f33aa

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — ap:emission-without-validation; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2. The owned Rules surface includes the second semicolon clause, validate the report before each emission. This governs report emission, so AP1 applies to that clause independently of the neighboring retention clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — A verified for /rules/line-11: The second Rules clause directs: validate the report before each emission. AP1 requires examining this emitting clause independently of the retention clause.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 69a9fd68e24025b700e9bbb1

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The owned leaf Capability/Outputs/Protocol or report-retention/emission clause contains no Destination declaration. DP1 targets the separate leaf destination row and explicit inheritance relationship; artifact production/emission wording alone does not establish this row as a destination surface.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /rules/line-11: This Capability/Outputs/Protocol or retention/emission row contains no Destination declaration; DP1 assigns the leaf destination separately.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell d4d45cf60920c4360e003cf1

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /rules/line-11: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 923c5917ea2c9d4abe29e519

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The owned Capability/Protocol/Rules surface contains prose about producing, retaining or routing a report. AP2 expressly excludes artifact mentions in Markdown prose; the separate Outputs declaration supplies the producer name used by the routine binding.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /rules/line-11/clause-1: This technique prose describes capability, emission, retention or destination. AP2 excludes Markdown artifact mentions; Outputs is separate.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 2f83f57df858c2cf145efffc

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/techniques/produce.md#/rules/line-11/clause-1. The owned first semicolon clause is Retain the report ID. It directs retention only; the emitting second clause has a separate row and cannot make this clause an emission instruction.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /rules/line-11/clause-1: This first semicolon clause only says Retain the report ID. AP1 excludes retention; the separate emitting clause cannot change this clause scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9e2179b4c1fbfc73dc6b4981

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The owned leaf Capability/Outputs/Protocol or report-retention/emission clause contains no Destination declaration. DP1 targets the separate leaf destination row and explicit inheritance relationship; artifact production/emission wording alone does not establish this row as a destination surface.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /rules/line-11/clause-1: This Capability/Outputs/Protocol or retention/emission row contains no Destination declaration; DP1 assigns the leaf destination separately.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b1c897ef75ecfb0802a40206

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /rules/line-11/clause-1: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell a03eed5b1543ec6c3d53b66c

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The owned Capability/Protocol/Rules surface contains prose about producing, retaining or routing a report. AP2 expressly excludes artifact mentions in Markdown prose; the separate Outputs declaration supplies the producer name used by the routine binding.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /rules/line-11/clause-2: This technique prose describes capability, emission, retention or destination. AP2 excludes Markdown artifact mentions; Outputs is separate.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 1fff788717e68470ea335f4a

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — ap:emission-without-validation; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2. The owned Rules surface includes the second semicolon clause, validate the report before each emission. This governs report emission, so AP1 applies to that clause independently of the neighboring retention clause.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — A verified for /rules/line-11/clause-2: The second Rules clause directs: validate the report before each emission. AP1 requires examining this emitting clause independently of the retention clause.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell acca57d9a610cd2900940f11

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The owned leaf Capability/Outputs/Protocol or report-retention/emission clause contains no Destination declaration. DP1 targets the separate leaf destination row and explicit inheritance relationship; artifact production/emission wording alone does not establish this row as a destination surface.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /rules/line-11/clause-2: This Capability/Outputs/Protocol or retention/emission row contains no Destination declaration; DP1 assigns the leaf destination separately.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b192bf0ffab5454aaf50901a

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /rules/line-11/clause-2: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 185e903ef3c4ae26da231a32

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2. The owned Capability/Protocol/Rules surface contains prose about producing, retaining or routing a report. AP2 expressly excludes artifact mentions in Markdown prose; the separate Outputs declaration supplies the producer name used by the routine binding.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /rules/line-12: This technique prose describes capability, emission, retention or destination. AP2 excludes Markdown artifact mentions; Outputs is separate.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 9d43a5459db3bcbd7c1b6759

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/techniques/produce.md#/rules/line-12. Destination is archive declares a destination without directing artifact emission; AP1 expressly excludes destination declarations.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /rules/line-12: Destination is archive declares a destination without directing emission; AP1 explicitly excludes this construct.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 355ce3ec841005b898e3d8d3

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — dp:1; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12. The owned leaf surface contains its Destination declaration, so DP1 applies in the executing inheritance context: qualification initialActivity run invokes deliver from delivery; deliver calls produce from emit; produce declares Destination archive and the executing workflow ancestor TECHNIQUE.md requires archive. Applicability leaves the comparison result to evaluation.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — A verified for /rules/line-12: This leaf surface contains Destination archive. Qualification/run calls deliver then produce, inheriting archive; DP1 requires that comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 3e979fb0c7e3eb5836c3cb1a

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /rules/line-12: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ca1e1515076ec0147e7b8338

Row: corpus/qualification/techniques/produce.md#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — ap:broken-binding; owned rows corpus/qualification/techniques/produce.md#@element. The technique Outputs declaration names report. Deliver binds emit.report and resolves emit to produce, so AP2 requires comparing report with this declared producer output name. Merely naming an artifact in prose would not create this binding responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — A verified for @element: Produce declares output report; deliver exports emit.report through step emit calling produce. This producer declaration participates in AP2.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell d074a916d8f80c61b3aa18a0

Row: corpus/qualification/techniques/produce.md#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — ap:emission-without-validation; owned rows corpus/qualification/techniques/produce.md#@element. This leaf owns both an emitting Protocol instruction (Validate the report, then emit it.) and an emitting Rules clause (validate the report before each emission). AP1 requires each instruction/clause to be considered independently; applicability does not assert its conformance.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — A verified for @element: The whole technique contains the Protocol emission instruction and the separate emitting Rules clause. AP1 covers both independently.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a406c04573c91f8ad82577e3

Row: corpus/qualification/techniques/produce.md#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — dp:1; owned rows corpus/qualification/techniques/produce.md#@element. The owned leaf surface contains its Destination declaration, so DP1 applies in the executing inheritance context: qualification initialActivity run invokes deliver from delivery; deliver calls produce from emit; produce declares Destination archive and the executing workflow ancestor TECHNIQUE.md requires archive. Applicability leaves the comparison result to evaluation.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — A verified for @element: This leaf surface contains Destination archive. Qualification/run calls deliver then produce, inheriting archive; DP1 requires that comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 8d0f33a043c7068e8c998046

Row: corpus/qualification/techniques/produce.md#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/produce.md#@element. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for @element: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fa0e42c99b24fa8b70e1b4c5

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8. This relationship links the leaf to its ancestor destination constraint. It carries no activity-to-routine argument contract or routine-to-producer output binding, the two concrete responsibilities in AP2.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for ancestor/corpus/qualification/techniques/TECHNIQUE.md: Leaf-to-ancestor inheritance carries a destination constraint, neither of AP2 routine argument or producer-output binding contracts.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 8ab5a44208c83cc6801721f8

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8. This row owns the leaf-to-ancestor contract relationship. The ancestor requires archive and the leaf declares archive; carrying an inherited destination is not itself a Protocol instruction or Rules clause that directs emission.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for ancestor/corpus/qualification/techniques/TECHNIQUE.md: This relation carries the ancestor archive constraint to the leaf destination archive; inheritance itself is not an emitting instruction.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 8bfa310664405693e5cee00b

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — dp:1; owned rows corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8. This explicit leaf-to-ancestor relationship carries the inherited destination constraint to the executing leaf instance: qualification initialActivity run invokes deliver from delivery; deliver calls produce from emit; produce declares Destination archive and the executing workflow ancestor TECHNIQUE.md requires archive. DP1 requires that relationship comparison.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — A verified for ancestor/corpus/qualification/techniques/TECHNIQUE.md: This explicit ancestor relation connects produce destination archive to the archive rule in its executing qualification workflow. DP1 covers it.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 98b55e096e4899353322814f

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8. The technique owns Capability/Outputs/Protocol/Rules text or an inheritance relationship. None defines initialActivity or workflow graph exit targets, so it has no DP2 finite-path responsibility.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for ancestor/corpus/qualification/techniques/TECHNIQUE.md: Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e3964a7ca7f68e7c40793e11

Row: corpus/qualification/workflow.yaml#/graph

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done. The workflow owns initialActivity run and graph done to null, with relationships to the run activity. These graph selections do not carry routine argument keys or step-id.output-name exports, which are the two binding forms AP2 checks.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /graph: The workflow selects run and an exit to null; these graph references carry neither routine argument keys nor step.output export names.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 343988e91c335d3bdef76586

Row: corpus/qualification/workflow.yaml#/graph

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done. The workflow defines initialActivity run and graph exit done to null. Its graph/identifier surfaces and workflow-to-activity relationships are not technique emission instructions; AP1 expressly excludes graph labels.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /graph: Qualification starts at run and its done edge targets null. Workflow identifiers/graph references are outside AP1 technique instruction scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 67bbb2cf737f1d39490640e1

Row: corpus/qualification/workflow.yaml#/graph

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done. This owned native workflow row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /graph: The workflow file has no leaf Destination declaration. DP1 exempts independent file rows while explicit execution relationships carry the rule.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 094759e3ffb8236db086b566

Row: corpus/qualification/workflow.yaml#/graph

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — dp:2; owned rows corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done. This owned workflow start/graph/whole-element surface participates in the whole-workflow finite-path requirement. The complete graph starts at run and has only done to null; DP2 applies using that full graph rather than an isolated row or activity-ID match.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — A verified for /graph: This graph surface owns done to null; the complete workflow starts at run with no other edge. DP2 requires its whole-workflow finite-path check.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fc47360bf214ca94a9c2f752

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done. The workflow owns initialActivity run and graph done to null, with relationships to the run activity. These graph selections do not carry routine argument keys or step-id.output-name exports, which are the two binding forms AP2 checks.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /graph/run: The workflow selects run and an exit to null; these graph references carry neither routine argument keys nor step.output export names.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell cc39f8b8ebb2b96169d05005

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done. The workflow defines initialActivity run and graph exit done to null. Its graph/identifier surfaces and workflow-to-activity relationships are not technique emission instructions; AP1 expressly excludes graph labels.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /graph/run: Qualification starts at run and its done edge targets null. Workflow identifiers/graph references are outside AP1 technique instruction scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9aa00375bff5d32993c718d0

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done. This owned native workflow row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /graph/run: The workflow file has no leaf Destination declaration. DP1 exempts independent file rows while explicit execution relationships carry the rule.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 9a13e148e0a434d148bef242

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — dp:2; owned rows corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done. This owned workflow start/graph/whole-element surface participates in the whole-workflow finite-path requirement. The complete graph starts at run and has only done to null; DP2 applies using that full graph rather than an isolated row or activity-ID match.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — A verified for /graph/run: This graph surface owns done to null; the complete workflow starts at run with no other edge. DP2 requires its whole-workflow finite-path check.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e8a18028e34e1ace5d01fcf3

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done. The workflow owns initialActivity run and graph done to null, with relationships to the run activity. These graph selections do not carry routine argument keys or step-id.output-name exports, which are the two binding forms AP2 checks.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /graph/run/done: The workflow selects run and an exit to null; these graph references carry neither routine argument keys nor step.output export names.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell b1f517596f87f82a15830709

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done. The workflow defines initialActivity run and graph exit done to null. Its graph/identifier surfaces and workflow-to-activity relationships are not technique emission instructions; AP1 expressly excludes graph labels.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /graph/run/done: Qualification starts at run and its done edge targets null. Workflow identifiers/graph references are outside AP1 technique instruction scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 46e28f2007abc40979497fc9

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done. This owned native workflow row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /graph/run/done: The workflow file has no leaf Destination declaration. DP1 exempts independent file rows while explicit execution relationships carry the rule.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell e0fcd50974c10678a3e2fb44

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — dp:2; owned rows corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done. This owned workflow start/graph/whole-element surface participates in the whole-workflow finite-path requirement. The complete graph starts at run and has only done to null; DP2 applies using that full graph rather than an isolated row or activity-ID match.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — A verified for /graph/run/done: This graph surface owns done to null; the complete workflow starts at run with no other edge. DP2 requires its whole-workflow finite-path check.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell a1bbb96005ca910edd02b943

Row: corpus/qualification/workflow.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/workflow.yaml#/id. The workflow owns initialActivity run and graph done to null, with relationships to the run activity. These graph selections do not carry routine argument keys or step-id.output-name exports, which are the two binding forms AP2 checks.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /id: The workflow selects run and an exit to null; these graph references carry neither routine argument keys nor step.output export names.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell ca0a66d25c90e652baa92f28

Row: corpus/qualification/workflow.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/workflow.yaml#@element, corpus/qualification/workflow.yaml#/id. The workflow defines initialActivity run and graph exit done to null. Its graph/identifier surfaces and workflow-to-activity relationships are not technique emission instructions; AP1 expressly excludes graph labels.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /id: Qualification starts at run and its done edge targets null. Workflow identifiers/graph references are outside AP1 technique instruction scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9fff88eaae065adb66759e66

Row: corpus/qualification/workflow.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/workflow.yaml#/id. This owned native workflow row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /id: The workflow file has no leaf Destination declaration. DP1 exempts independent file rows while explicit execution relationships carry the rule.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b70cd0fa3dc717cd87f806e4

Row: corpus/qualification/workflow.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — dp:2; owned rows corpus/qualification/workflow.yaml#/id. The id qualification names the workflow without defining its initial activity or a graph exit. DP2 applies to the separately owned start/graph responsibilities and whole workflow; this name alone is not a termination obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N verified for /id: The id qualification only names the workflow; it does not select the start or an exit. DP2 reachability belongs to graph/start and whole-element rows.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b93fc9705f0d802bdff5440b

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element. The workflow owns initialActivity run and graph done to null, with relationships to the run activity. These graph selections do not carry routine argument keys or step-id.output-name exports, which are the two binding forms AP2 checks.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /initialActivity: The workflow selects run and an exit to null; these graph references carry neither routine argument keys nor step.output export names.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 3641b7b9d54d55df0cc22cb1

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/workflow.yaml#/initialActivity. The workflow defines initialActivity run and graph exit done to null. Its graph/identifier surfaces and workflow-to-activity relationships are not technique emission instructions; AP1 expressly excludes graph labels.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /initialActivity: Qualification starts at run and its done edge targets null. Workflow identifiers/graph references are outside AP1 technique instruction scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 665c1a7ad6f6a7650e3f374a

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/workflow.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity. This owned native workflow row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for /initialActivity: The workflow file has no leaf Destination declaration. DP1 exempts independent file rows while explicit execution relationships carry the rule.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell c7fdcca69a6f6d3b3cfa7009

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — dp:2; owned rows corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element. This owned workflow start/graph/whole-element surface participates in the whole-workflow finite-path requirement. The complete graph starts at run and has only done to null; DP2 applies using that full graph rather than an isolated row or activity-ID match.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — A verified for /initialActivity: InitialActivity selects run, the start of DP2 reachability. The complete graph has only done to null; matching run alone cannot prove termination.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ce1c6885d9fe828ffb2d4802

Row: corpus/qualification/workflow.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element. The workflow owns initialActivity run and graph done to null, with relationships to the run activity. These graph selections do not carry routine argument keys or step-id.output-name exports, which are the two binding forms AP2 checks.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for @element: The workflow selects run and an exit to null; these graph references carry neither routine argument keys nor step.output export names.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 5551fe05b667e60209399004

Row: corpus/qualification/workflow.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/workflow.yaml#@element, corpus/qualification/workflow.yaml#/id. The workflow defines initialActivity run and graph exit done to null. Its graph/identifier surfaces and workflow-to-activity relationships are not technique emission instructions; AP1 expressly excludes graph labels.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for @element: Qualification starts at run and its done edge targets null. Workflow identifiers/graph references are outside AP1 technique instruction scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 263ad09bd2d440e2a894ee63

Row: corpus/qualification/workflow.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — dp:1; owned rows corpus/qualification/workflow.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity. This owned native workflow row has no leaf Destination declaration. DP1 says such files are not independently checked; their separately inventoried explicit call/execution relationships carry the inherited constraint to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N verified for @element: The workflow file has no leaf Destination declaration. DP1 exempts independent file rows while explicit execution relationships carry the rule.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell e5c1842a573eccbf8d7d7e60

Row: corpus/qualification/workflow.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — dp:2; owned rows corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element. This owned workflow start/graph/whole-element surface participates in the whole-workflow finite-path requirement. The complete graph starts at run and has only done to null; DP2 applies using that full graph rather than an isolated row or activity-ID match.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — A verified for @element: Qualification starts at run and has only done to null. DP2 explicitly makes a finite path to null a whole-workflow invariant.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 94b820a882f196103f835741

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b. The workflow owns initialActivity run and graph done to null, with relationships to the run activity. These graph selections do not carry routine argument keys or step-id.output-name exports, which are the two binding forms AP2 checks.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /initialActivity: The workflow selects run and an exit to null; these graph references carry neither routine argument keys nor step.output export names.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell f30ba6f42d4230bf27814f3a

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b. The workflow defines initialActivity run and graph exit done to null. Its graph/identifier surfaces and workflow-to-activity relationships are not technique emission instructions; AP1 expressly excludes graph labels.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /initialActivity: Qualification starts at run and its done edge targets null. Workflow identifiers/graph references are outside AP1 technique instruction scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 21f9cfbf2718ad51d2976c98

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — dp:1; owned rows corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b. This explicit call/execution relationship lies on the concrete executing chain: qualification initialActivity run invokes deliver from delivery; deliver calls produce from emit; produce declares Destination archive and the executing workflow ancestor TECHNIQUE.md requires archive. DP1 expressly requires call and inheritance relationships to carry the rule to that leaf instance, even when the caller file has no destination declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — A verified for /initialActivity: This graph relation selects or locates run in qualification, which calls deliver then produce. DP1 carries archive to that leaf destination archive.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 8862878198e6198ef77c1f28

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — dp:2; owned rows corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b. This workflow-to-run graph relationship contributes to the workflow reachability obligation. The complete workflow starts at run and its only done edge leads to null; DP2 must judge a finite path to null across that full graph, not infer termination from a matching activity ID.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — A verified for /initialActivity: This workflow-to-run relationship participates in start/graph reachability. With sole done edge to null, DP2 requires the complete graph check.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 8020bba4283a65b31df0f113

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b. The workflow owns initialActivity run and graph done to null, with relationships to the run activity. These graph selections do not carry routine argument keys or step-id.output-name exports, which are the two binding forms AP2 checks.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /graph/run: The workflow selects run and an exit to null; these graph references carry neither routine argument keys nor step.output export names.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell ca06cc90126da20e026a0486

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b. The workflow defines initialActivity run and graph exit done to null. Its graph/identifier surfaces and workflow-to-activity relationships are not technique emission instructions; AP1 expressly excludes graph labels.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /graph/run: Qualification starts at run and its done edge targets null. Workflow identifiers/graph references are outside AP1 technique instruction scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 32efcf3836cf4d26fc113577

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — dp:1; owned rows corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b. This explicit call/execution relationship lies on the concrete executing chain: qualification initialActivity run invokes deliver from delivery; deliver calls produce from emit; produce declares Destination archive and the executing workflow ancestor TECHNIQUE.md requires archive. DP1 expressly requires call and inheritance relationships to carry the rule to that leaf instance, even when the caller file has no destination declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — A verified for /graph/run: This graph relation selects or locates run in qualification, which calls deliver then produce. DP1 carries archive to that leaf destination archive.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 48da822c85267d96ea48c4c2

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — dp:2; owned rows corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b. This workflow-to-run graph relationship contributes to the workflow reachability obligation. The complete workflow starts at run and its only done edge leads to null; DP2 must judge a finite path to null across that full graph, not infer termination from a matching activity ID.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — A verified for /graph/run: This workflow-to-run relationship participates in start/graph reachability. With sole done edge to null, DP2 requires the complete graph check.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell f0755acc68e9a62e580665a3

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — ap:broken-binding; owned rows corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b. The workflow owns initialActivity run and graph done to null, with relationships to the run activity. These graph selections do not carry routine argument keys or step-id.output-name exports, which are the two binding forms AP2 checks.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N verified for /graph/run/done: The workflow selects run and an exit to null; these graph references carry neither routine argument keys nor step.output export names.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 96797ae8488cf51f8878572b

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — ap:emission-without-validation; owned rows corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b. The workflow defines initialActivity run and graph exit done to null. Its graph/identifier surfaces and workflow-to-activity relationships are not technique emission instructions; AP1 expressly excludes graph labels.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N verified for /graph/run/done: Qualification starts at run and its done edge targets null. Workflow identifiers/graph references are outside AP1 technique instruction scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell dafc343685f5a84041beee97

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — dp:1; owned rows corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b. This explicit call/execution relationship lies on the concrete executing chain: qualification initialActivity run invokes deliver from delivery; deliver calls produce from emit; produce declares Destination archive and the executing workflow ancestor TECHNIQUE.md requires archive. DP1 expressly requires call and inheritance relationships to carry the rule to that leaf instance, even when the caller file has no destination declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — A verified for /graph/run/done: This graph relation selects or locates run in qualification, which calls deliver then produce. DP1 carries archive to that leaf destination archive.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 5453a725eb6086baaa72c972

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — dp:2; owned rows corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b. This workflow-to-run graph relationship contributes to the workflow reachability obligation. The complete workflow starts at run and its only done edge leads to null; DP2 must judge a finite path to null across that full graph, not infer termination from a matching activity ID.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — A verified for /graph/run/done: This workflow-to-run relationship participates in start/graph reachability. With sole done edge to null, DP2 requires the complete graph check.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.
