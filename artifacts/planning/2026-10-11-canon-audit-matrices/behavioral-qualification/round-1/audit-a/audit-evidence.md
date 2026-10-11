# Audit Evidence

Snapshot: 4d56c488fee329d522c6fe8efd8b002401ed7218d076fd9d76eecd0ee1e0c4ef

## Cell 588e9afc6de79e4e15622316

Row: corpus/qualification/activities/run.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The activity id is run. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–1
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: run is the activity identifier. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 0782b255d289b2d8aaa260a8

Row: corpus/qualification/activities/run.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The activity id is run. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–1
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: run is the activity identifier. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a93639cc3c5c1ad866587c2e

Row: corpus/qualification/activities/run.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The activity id is run. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–1
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: run is the activity identifier. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7d5cdef67a14fe0a0e70a8ff

Row: corpus/qualification/activities/run.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The activity id is run. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–1
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: run is the activity identifier. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fc60645fdab03b4f360b972e

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The activity steps invoke deliver with argument key envelope. AP-02 requires comparing the concrete activity routine argument-key set with deliver Inputs [envelope]. This invocation or binding endpoint participates in that comparison; matching keys would still be an applicable evaluation.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 3–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: Activity steps invoke deliver with the sole argument key envelope. AP-02 requires comparing this concrete invocation or declaration endpoint with routine Inputs [envelope].

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The sole concrete run/delivery invocation supplies the argument-key set {envelope}; deliver Inputs is exactly [envelope]. The sets agree. sealed is an opaque value, and this dialect has no optional inputs or aliases. Each assigned row is an invocation signature or its declaration endpoint for this same comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 69bbe5f010e4e9c6cc42b36b

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The activity steps invoke deliver with argument key envelope. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 3–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: Activity steps invoke deliver with the sole argument key envelope. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 330d9855c61f1fa6db1e92b2

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The activity steps invoke deliver with argument key envelope. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 3–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: Activity steps invoke deliver with the sole argument key envelope. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell ec7e3577667dbf0846b7b09f

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The activity steps invoke deliver with argument key envelope. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 3–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: Activity steps invoke deliver with the sole argument key envelope. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ece85719689c1a3411d52a12

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The delivery step invokes deliver with argument key envelope. AP-02 requires comparing the concrete activity routine argument-key set with deliver Inputs [envelope]. This invocation or binding endpoint participates in that comparison; matching keys would still be an applicable evaluation.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 3–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The delivery step invokes deliver with the sole argument key envelope. AP-02 requires comparing this concrete invocation or declaration endpoint with routine Inputs [envelope].

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The sole concrete run/delivery invocation supplies the argument-key set {envelope}; deliver Inputs is exactly [envelope]. The sets agree. sealed is an opaque value, and this dialect has no optional inputs or aliases. Each assigned row is an invocation signature or its declaration endpoint for this same comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 4c9b9e3283acb76acd0c593c

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The delivery step invokes deliver with argument key envelope. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 3–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The delivery step invokes deliver with the sole argument key envelope. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a5b35e7460c5ba032ea3ab9c

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The delivery step invokes deliver with argument key envelope. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 3–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The delivery step invokes deliver with the sole argument key envelope. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell eaf04cb03551645c38d72842

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The delivery step invokes deliver with argument key envelope. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 3–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The delivery step invokes deliver with the sole argument key envelope. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 03b141fa3c167d6b5347f32a

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The activity step identifier is delivery. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 3–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: delivery is the activity step identifier. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell eb0acb5f69509bc093ccb4c4

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The activity step identifier is delivery. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 3–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: delivery is the activity step identifier. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a09b4b5068e60047e85b9d20

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The activity step identifier is delivery. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 3–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: delivery is the activity step identifier. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 51923b360aa3ef1a7585fbf4

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The activity step identifier is delivery. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 3–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: delivery is the activity step identifier. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 366a1ced08e276234b09d365

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The routine binding names deliver and supplies argument key envelope. AP-02 requires comparing the concrete activity routine argument-key set with deliver Inputs [envelope]. This invocation or binding endpoint participates in that comparison; matching keys would still be an applicable evaluation.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The routine invocation selects deliver and supplies envelope: sealed. AP-02 requires comparing this concrete invocation or declaration endpoint with routine Inputs [envelope].

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The sole concrete run/delivery invocation supplies the argument-key set {envelope}; deliver Inputs is exactly [envelope]. The sets agree. sealed is an opaque value, and this dialect has no optional inputs or aliases. Each assigned row is an invocation signature or its declaration endpoint for this same comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 8f71acc678543f1dedd6da64

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine binding names deliver and supplies argument key envelope. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The routine invocation selects deliver and supplies envelope: sealed. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 4e129aea04e56ac3f5e18eac

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The routine binding names deliver and supplies argument key envelope. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The routine invocation selects deliver and supplies envelope: sealed. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7fa24663abc3348858407cd5

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine binding names deliver and supplies argument key envelope. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The routine invocation selects deliver and supplies envelope: sealed. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e4e1d36386ad37dc4007d953

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The argument map has the sole key envelope, with value sealed. AP-02 requires comparing the concrete activity routine argument-key set with deliver Inputs [envelope]. This invocation or binding endpoint participates in that comparison; matching keys would still be an applicable evaluation.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 6–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The argument map contains only envelope: sealed. AP-02 requires comparing this concrete invocation or declaration endpoint with routine Inputs [envelope].

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The sole concrete run/delivery invocation supplies the argument-key set {envelope}; deliver Inputs is exactly [envelope]. The sets agree. sealed is an opaque value, and this dialect has no optional inputs or aliases. Each assigned row is an invocation signature or its declaration endpoint for this same comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 85d58778322169b7eb358fb2

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The argument map has the sole key envelope, with value sealed. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 6–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The argument map contains only envelope: sealed. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 235d809af28915c83b47a336

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The argument map has the sole key envelope, with value sealed. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 6–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The argument map contains only envelope: sealed. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 8f04699d8cada26b1b7ebcc5

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The argument map has the sole key envelope, with value sealed. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 6–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The argument map contains only envelope: sealed. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell f45b86c19f25461cbe667622

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The argument key is envelope and its opaque value is sealed. AP-02 requires comparing the concrete activity routine argument-key set with deliver Inputs [envelope]. This invocation or binding endpoint participates in that comparison; matching keys would still be an applicable evaluation.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 6–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: envelope is the argument key; sealed is an opaque value. AP-02 requires comparing this concrete invocation or declaration endpoint with routine Inputs [envelope].

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The sole concrete run/delivery invocation supplies the argument-key set {envelope}; deliver Inputs is exactly [envelope]. The sets agree. sealed is an opaque value, and this dialect has no optional inputs or aliases. Each assigned row is an invocation signature or its declaration endpoint for this same comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell e7190e6183add8a7b67d408d

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The argument key is envelope and its opaque value is sealed. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 6–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: envelope is the argument key; sealed is an opaque value. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell cb6557b6c858a3df047947ff

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The argument key is envelope and its opaque value is sealed. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 6–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: envelope is the argument key; sealed is an opaque value. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell f7c71bd7cd44e3d3cfd50614

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The argument key is envelope and its opaque value is sealed. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 6–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: envelope is the argument key; sealed is an opaque value. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 23d52f087c143d67f67da445

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The concrete routine invocation names deliver. AP-02 requires comparing the concrete activity routine argument-key set with deliver Inputs [envelope]. This invocation or binding endpoint participates in that comparison; matching keys would still be an applicable evaluation.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The invocation names deliver, selecting its input contract. AP-02 requires comparing this concrete invocation or declaration endpoint with routine Inputs [envelope].

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The sole concrete run/delivery invocation supplies the argument-key set {envelope}; deliver Inputs is exactly [envelope]. The sets agree. sealed is an opaque value, and this dialect has no optional inputs or aliases. Each assigned row is an invocation signature or its declaration endpoint for this same comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 7a49531ccbd7063bf5c4dd03

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The concrete routine invocation names deliver. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The invocation names deliver, selecting its input contract. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell cced7364e2269714c048fe3b

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The concrete routine invocation names deliver. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The invocation names deliver, selecting its input contract. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 501147c7c9cf63d456cc367b

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The concrete routine invocation names deliver. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The invocation names deliver, selecting its input contract. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b331b3631bac4371bfebf008

Row: corpus/qualification/activities/run.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The complete activity declares one deliver invocation with argument key envelope. AP-02 requires comparing the concrete activity routine argument-key set with deliver Inputs [envelope]. This invocation or binding endpoint participates in that comparison; matching keys would still be an applicable evaluation.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The complete activity invokes deliver with the sole argument key envelope. AP-02 requires comparing this concrete invocation or declaration endpoint with routine Inputs [envelope].

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The sole concrete run/delivery invocation supplies the argument-key set {envelope}; deliver Inputs is exactly [envelope]. The sets agree. sealed is an opaque value, and this dialect has no optional inputs or aliases. Each assigned row is an invocation signature or its declaration endpoint for this same comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 6d000a7587cb7a720d3ce09a

Row: corpus/qualification/activities/run.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The complete activity declares one deliver invocation with argument key envelope. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N: The complete activity invokes deliver with the sole argument key envelope. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell fd8572c700cc4625bf5e2e78

Row: corpus/qualification/activities/run.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The complete activity declares one deliver invocation with argument key envelope. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N: The complete activity invokes deliver with the sole argument key envelope. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 8b3b602b6703003326b8df8d

Row: corpus/qualification/activities/run.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The complete activity declares one deliver invocation with argument key envelope. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N: The complete activity invokes deliver with the sole argument key envelope. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell eeab805ea4653756496776b5

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — This activity-to-deliver relationship carries the invocation with argument key envelope. AP-02 requires comparing the concrete activity routine argument-key set with deliver Inputs [envelope]. This invocation or binding endpoint participates in that comparison; matching keys would still be an applicable evaluation.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The run/delivery-to-deliver relationship carries argument key envelope. AP-02 requires comparing this concrete invocation or declaration endpoint with routine Inputs [envelope].

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The sole concrete run/delivery invocation supplies the argument-key set {envelope}; deliver Inputs is exactly [envelope]. The sets agree. sealed is an opaque value, and this dialect has no optional inputs or aliases. Each assigned row is an invocation signature or its declaration endpoint for this same comparison. The routine export is report: emit.report. Resolving step emit gives technique produce, whose complete Outputs section declares report. The referenced output exists; the exported routine name is not an additional output-name restriction. Each assigned row is this reference, its step, its declaration endpoint, or their relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell e42353cfc8fe3169b809b996

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — This activity-to-deliver relationship carries the invocation with argument key envelope. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: The run/delivery-to-deliver relationship carries argument key envelope. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 91a7785154a1a018658ccae8

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — This activity-to-deliver relationship carries the invocation with argument key envelope. DP-01 applies to the leaf Destination declaration and the explicit call or inheritance relationships carrying qualification -> run -> deliver -> produce and its qualification TECHNIQUE.md ancestor. Applicability does not decide whether the values agree.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — A: The run/delivery-to-deliver relationship carries argument key envelope. DP-01 requires this execution or inheritance link to carry the ancestor destination to the leaf.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — The captured call chain is qualification initial/graph run -> run activity delivery -> deliver routine emit -> produce. In that executing workflow the applicable ancestor is qualification/techniques/TECHNIQUE.md, whose Rules require archive. The leaf declares Destination is archive. The values agree; the ancestor declaration is the requirement, not a second conflicting leaf. This same chain and comparison hold for every assigned row.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

## Cell 36c8e451b93d39512aae352f

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — This activity-to-deliver relationship carries the invocation with argument key envelope. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: The run/delivery-to-deliver relationship carries argument key envelope. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell bfa09024c94a6bc76d51c631

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The routine id is deliver. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–1
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: deliver is the routine identifier. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 9156a757fd93955348ca5766

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine id is deliver. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–1
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: deliver is the routine identifier. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell bf312e511dcc8f4eda77a41a

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The routine id is deliver. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–1
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: deliver is the routine identifier. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell a0e70a1645458e99657058ca

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine id is deliver. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–1
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: deliver is the routine identifier. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 620325a4c3f62c9867a7df90

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The routine Inputs list declares the sole name envelope. AP-02 makes the routine Inputs list the declaration endpoint for each concrete invocation argument-key set. The run/delivery invocation supplies the corresponding call site, so this declaration must be compared in that relationship context.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: Routine Inputs contain only envelope. AP-02 requires comparing this concrete invocation or declaration endpoint with routine Inputs [envelope].

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The sole concrete run/delivery invocation supplies the argument-key set {envelope}; deliver Inputs is exactly [envelope]. The sets agree. sealed is an opaque value, and this dialect has no optional inputs or aliases. Each assigned row is an invocation signature or its declaration endpoint for this same comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 2e52133101ac058519a8aa51

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine Inputs list declares the sole name envelope. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: Routine Inputs contain only envelope. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell cf440ff1717daba3ba33af52

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The routine Inputs list declares the sole name envelope. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: Routine Inputs contain only envelope. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0e0de76a45b1ce5cc0a55a2d

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine Inputs list declares the sole name envelope. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: Routine Inputs contain only envelope. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 85e68983cef9c8b0f9a7bf33

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The routine input declaration is envelope. AP-02 makes the routine Inputs list the declaration endpoint for each concrete invocation argument-key set. The run/delivery invocation supplies the corresponding call site, so this declaration must be compared in that relationship context.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The routine input name is envelope. AP-02 requires comparing this concrete invocation or declaration endpoint with routine Inputs [envelope].

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The sole concrete run/delivery invocation supplies the argument-key set {envelope}; deliver Inputs is exactly [envelope]. The sets agree. sealed is an opaque value, and this dialect has no optional inputs or aliases. Each assigned row is an invocation signature or its declaration endpoint for this same comparison.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 8d0a1adc7b4ff87710b48af6

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine input declaration is envelope. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: The routine input name is envelope. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell af24593c352cedfdf9a972fa

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The routine input declaration is envelope. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: The routine input name is envelope. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0dfaae8a980c43d6afea14bc

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine input declaration is envelope. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: The routine input name is envelope. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 1682a187cf7dd36419e2a143

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The routine Outputs map exports report from emit.report. AP-02 requires resolving the routine output emit.report through step emit to produce and comparing the declared technique output names. This reference, step, output declaration, or relationship is part of that binding contract; agreement is evaluated later.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: Routine Outputs export report from emit.report. AP-02 requires resolving emit.report through emit to produce and comparing its declared output names.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The routine export is report: emit.report. Resolving step emit gives technique produce, whose complete Outputs section declares report. The referenced output exists; the exported routine name is not an additional output-name restriction. Each assigned row is this reference, its step, its declaration endpoint, or their relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 8f64e24f8a4caa9482d28228

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine Outputs map exports report from emit.report. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: Routine Outputs export report from emit.report. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell ab40e04b150dd3790c5764db

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The routine Outputs map exports report from emit.report. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: Routine Outputs export report from emit.report. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7c49f2961aec4917ed955bd7

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine Outputs map exports report from emit.report. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: Routine Outputs export report from emit.report. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 7f71a92e9f425b2094dec98d

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The routine report binding references emit.report. AP-02 requires resolving the routine output emit.report through step emit to produce and comparing the declared technique output names. This reference, step, output declaration, or relationship is part of that binding contract; agreement is evaluated later.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The routine report binding references emit.report. AP-02 requires resolving emit.report through emit to produce and comparing its declared output names.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The routine export is report: emit.report. Resolving step emit gives technique produce, whose complete Outputs section declares report. The referenced output exists; the exported routine name is not an additional output-name restriction. Each assigned row is this reference, its step, its declaration endpoint, or their relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 232c484eaf1003ef830d4ffa

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine report binding references emit.report. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: The routine report binding references emit.report. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 791a31ca8731b94c89d67e5c

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The routine report binding references emit.report. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: The routine report binding references emit.report. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell ad7314b738ea597d93ae3b23

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine report binding references emit.report. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: The routine report binding references emit.report. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 82c8e910cc4b4df96a89e369

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The routine steps define emit as a call to produce, resolving the step used by emit.report. AP-02 requires resolving the routine output emit.report through step emit to produce and comparing the declared technique output names. This reference, step, output declaration, or relationship is part of that binding contract; agreement is evaluated later.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: Routine steps define emit as the produce call used by emit.report. AP-02 requires resolving emit.report through emit to produce and comparing its declared output names.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The routine export is report: emit.report. Resolving step emit gives technique produce, whose complete Outputs section declares report. The referenced output exists; the exported routine name is not an additional output-name restriction. Each assigned row is this reference, its step, its declaration endpoint, or their relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell cbb292d61ff63c7740d065be

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine steps define emit as a call to produce, resolving the step used by emit.report. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: Routine steps define emit as the produce call used by emit.report. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 2228315b4ed81fce11373514

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The routine steps define emit as a call to produce, resolving the step used by emit.report. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: Routine steps define emit as the produce call used by emit.report. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell f82d1cd9016de1cdd797e170

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine steps define emit as a call to produce, resolving the step used by emit.report. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: Routine steps define emit as the produce call used by emit.report. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 790b168511688f3580f49f17

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The emit step calls produce and is referenced by the routine output emit.report. AP-02 requires resolving the routine output emit.report through step emit to produce and comparing the declared technique output names. This reference, step, output declaration, or relationship is part of that binding contract; agreement is evaluated later.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: Step emit calls produce and is referenced by emit.report. AP-02 requires resolving emit.report through emit to produce and comparing its declared output names.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The routine export is report: emit.report. Resolving step emit gives technique produce, whose complete Outputs section declares report. The referenced output exists; the exported routine name is not an additional output-name restriction. Each assigned row is this reference, its step, its declaration endpoint, or their relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell bbb0ef5214ae8bbcce715c65

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The emit step calls produce and is referenced by the routine output emit.report. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: Step emit calls produce and is referenced by emit.report. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 2160f33c3a701883bf507397

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The emit step calls produce and is referenced by the routine output emit.report. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: Step emit calls produce and is referenced by emit.report. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 569231fa0b1023abbf3fc5e4

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The emit step calls produce and is referenced by the routine output emit.report. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: Step emit calls produce and is referenced by emit.report. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e6707d2a492bbb28eafc3a21

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The step id emit is the step-id endpoint of the routine output reference emit.report. AP-02 requires resolving the routine output emit.report through step emit to produce and comparing the declared technique output names. This reference, step, output declaration, or relationship is part of that binding contract; agreement is evaluated later.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: emit is the step-id endpoint of the emit.report output reference. AP-02 requires resolving emit.report through emit to produce and comparing its declared output names.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The routine export is report: emit.report. Resolving step emit gives technique produce, whose complete Outputs section declares report. The referenced output exists; the exported routine name is not an additional output-name restriction. Each assigned row is this reference, its step, its declaration endpoint, or their relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 71fd5507f4b74e2ec91c2b3e

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The step id emit is the step-id endpoint of the routine output reference emit.report. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: emit is the step-id endpoint of the emit.report output reference. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b707f101a68f594abdbb9fc8

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The step id emit is the step-id endpoint of the routine output reference emit.report. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: emit is the step-id endpoint of the emit.report output reference. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7567be6ff4d583433092c972

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The step id emit is the step-id endpoint of the routine output reference emit.report. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: emit is the step-id endpoint of the emit.report output reference. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 387b3abcf94e6a19aabbf992

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The emit step technique reference names produce, the declaration endpoint for emit.report. AP-02 requires resolving the routine output emit.report through step emit to produce and comparing the declared technique output names. This reference, step, output declaration, or relationship is part of that binding contract; agreement is evaluated later.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 6–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The referenced emit step selects technique produce. AP-02 requires resolving emit.report through emit to produce and comparing its declared output names.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The routine export is report: emit.report. Resolving step emit gives technique produce, whose complete Outputs section declares report. The referenced output exists; the exported routine name is not an additional output-name restriction. Each assigned row is this reference, its step, its declaration endpoint, or their relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell f2a200e38a51bc411ee5e057

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The emit step technique reference names produce, the declaration endpoint for emit.report. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 6–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: The referenced emit step selects technique produce. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell d5d35100c716e2ed184e7476

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The emit step technique reference names produce, the declaration endpoint for emit.report. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 6–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: The referenced emit step selects technique produce. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 90bd5ed8d7c0859a6fbe41a1

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The emit step technique reference names produce, the declaration endpoint for emit.report. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 6–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — N: The referenced emit step selects technique produce. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fa301823ccd44ed9374ce575

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The complete routine declares envelope input, report: emit.report output, and the emit-to-produce call. AP-02 requires resolving the routine output emit.report through step emit to produce and comparing the declared technique output names. This reference, step, output declaration, or relationship is part of that binding contract; agreement is evaluated later.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: deliver declares envelope input, report: emit.report and the emit-to-produce call. AP-02 requires resolving emit.report through emit to produce and comparing its declared output names.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The sole concrete run/delivery invocation supplies the argument-key set {envelope}; deliver Inputs is exactly [envelope]. The sets agree. sealed is an opaque value, and this dialect has no optional inputs or aliases. Each assigned row is an invocation signature or its declaration endpoint for this same comparison. The routine export is report: emit.report. Resolving step emit gives technique produce, whose complete Outputs section declares report. The referenced output exists; the exported routine name is not an additional output-name restriction. Each assigned row is this reference, its step, its declaration endpoint, or their relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 2ec151da2546cd9066780932

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The complete routine declares envelope input, report: emit.report output, and the emit-to-produce call. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N: deliver declares envelope input, report: emit.report and the emit-to-produce call. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 65dd3d64e8c54c7713685121

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The complete routine declares envelope input, report: emit.report output, and the emit-to-produce call. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N: deliver declares envelope input, report: emit.report and the emit-to-produce call. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 19723157905da0f5874e77db

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The complete routine declares envelope input, report: emit.report output, and the emit-to-produce call. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N: deliver declares envelope input, report: emit.report and the emit-to-produce call. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b34f6249f0f9b31107491750

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The routine-to-produce relationship resolves the emit step and its output declaration. AP-02 requires resolving the routine output emit.report through step emit to produce and comparing the declared technique output names. This reference, step, output declaration, or relationship is part of that binding contract; agreement is evaluated later.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The routine-to-technique relationship resolves emit to produce. AP-02 requires resolving emit.report through emit to produce and comparing its declared output names.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The routine export is report: emit.report. Resolving step emit gives technique produce, whose complete Outputs section declares report. The referenced output exists; the exported routine name is not an additional output-name restriction. Each assigned row is this reference, its step, its declaration endpoint, or their relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell afeb129e1e03e4f353693950

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine-to-produce relationship resolves the emit step and its output declaration. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The routine-to-technique relationship resolves emit to produce. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell eb3d9f625d45294630564c36

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — The routine-to-produce relationship resolves the emit step and its output declaration. DP-01 applies to the leaf Destination declaration and the explicit call or inheritance relationships carrying qualification -> run -> deliver -> produce and its qualification TECHNIQUE.md ancestor. Applicability does not decide whether the values agree.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — A: The routine-to-technique relationship resolves emit to produce. DP-01 requires this execution or inheritance link to carry the ancestor destination to the leaf.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — The captured call chain is qualification initial/graph run -> run activity delivery -> deliver routine emit -> produce. In that executing workflow the applicable ancestor is qualification/techniques/TECHNIQUE.md, whose Rules require archive. The leaf declares Destination is archive. The values agree; the ancestor declaration is the requirement, not a second conflicting leaf. This same chain and comparison hold for every assigned row.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

## Cell a6cc9c95bd8a15eec9337ab9

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine-to-produce relationship resolves the emit step and its output declaration. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The routine-to-technique relationship resolves emit to produce. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 8669d4026237cb94e83e2158

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The explicit qualification/run/delivery/deliver/emit relationship carries the concrete invocation, report export, and inherited destination. AP-02 requires both the concrete invocation argument comparison and resolution of the routine output through emit to produce. This explicit execution relationship supplies both binding contracts and their endpoints.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — A: The execution relationship binds qualification/run/delivery/deliver/emit to produce and its ancestor. AP-02 applies to both concrete argument and resolved output contracts carried by this execution relationship.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The sole concrete run/delivery invocation supplies the argument-key set {envelope}; deliver Inputs is exactly [envelope]. The sets agree. sealed is an opaque value, and this dialect has no optional inputs or aliases. Each assigned row is an invocation signature or its declaration endpoint for this same comparison. The routine export is report: emit.report. Resolving step emit gives technique produce, whose complete Outputs section declares report. The referenced output exists; the exported routine name is not an additional output-name restriction. Each assigned row is this reference, its step, its declaration endpoint, or their relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 7b47769dd43afb09823a4b14

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The explicit qualification/run/delivery/deliver/emit relationship carries the concrete invocation, report export, and inherited destination. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The execution relationship binds qualification/run/delivery/deliver/emit to produce and its ancestor. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

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

Applicability: A — The explicit qualification/run/delivery/deliver/emit relationship carries the concrete invocation, report export, and inherited destination. DP-01 applies to the leaf Destination declaration and the explicit call or inheritance relationships carrying qualification -> run -> deliver -> produce and its qualification TECHNIQUE.md ancestor. Applicability does not decide whether the values agree.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — A: The execution relationship binds qualification/run/delivery/deliver/emit to produce and its ancestor. DP-01 requires this execution or inheritance link to carry the ancestor destination to the leaf.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — The captured call chain is qualification initial/graph run -> run activity delivery -> deliver routine emit -> produce. In that executing workflow the applicable ancestor is qualification/techniques/TECHNIQUE.md, whose Rules require archive. The leaf declares Destination is archive. The values agree; the ancestor declaration is the requirement, not a second conflicting leaf. This same chain and comparison hold for every assigned row.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

## Cell 7616d539ed6effba75237723

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The explicit qualification/run/delivery/deliver/emit relationship carries the concrete invocation, report export, and inherited destination. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The execution relationship binds qualification/run/delivery/deliver/emit to produce and its ancestor. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

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

Applicability: N — The ancestor Capability describes constraining inherited delivery. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: Ancestor Capability describes constraining inherited delivery. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell d9eb0eb2cb8f9fb790e82eee

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The ancestor Capability describes constraining inherited delivery. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: Ancestor Capability describes constraining inherited delivery. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b6ad6f9e4c3bf6bcd7517234

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The ancestor Capability describes constraining inherited delivery. DP-01 explicitly treats the ancestor constraint as a declaration, not a conflicting leaf destination; this ancestor row is not a leaf declaration. The inheritance relationship carries its constraint.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: Ancestor Capability describes constraining inherited delivery. DP-01 treats ancestor constraints as declarations; this is not a leaf destination.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0ed30157350f8c23d6297b75

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The ancestor Capability describes constraining inherited delivery. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: Ancestor Capability describes constraining inherited delivery. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell c9c06fb4ee9924c6c63c553f

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This ancestor Capability sentence says Constrain inherited delivery. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: The ancestor Capability sentence describes inherited delivery constraints. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 720f7eeadf6be862dd39b7ab

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — This ancestor Capability sentence says Constrain inherited delivery. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: The ancestor Capability sentence describes inherited delivery constraints. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 3dd8981b7cf70f3489f0cb9a

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — This ancestor Capability sentence says Constrain inherited delivery. DP-01 explicitly treats the ancestor constraint as a declaration, not a conflicting leaf destination; this ancestor row is not a leaf declaration. The inheritance relationship carries its constraint.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: The ancestor Capability sentence describes inherited delivery constraints. DP-01 treats ancestor constraints as declarations; this is not a leaf destination.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 62d70a2ce5a077d8010ce9fe

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — This ancestor Capability sentence says Constrain inherited delivery. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: The ancestor Capability sentence describes inherited delivery constraints. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ac42c54bb5e18cc6005d1df7

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The ancestor Rules declare Destination must be archive. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 4–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: Ancestor Rules declare Destination must be archive. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 541cffe238719bcc6a46fe77

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The ancestor Rules declare Destination must be archive. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 4–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: Ancestor Rules declare Destination must be archive. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b3f616c2c1a987217e5cf61b

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The ancestor Rules declare Destination must be archive. DP-01 explicitly treats the ancestor constraint as a declaration, not a conflicting leaf destination; this ancestor row is not a leaf declaration. The inheritance relationship carries its constraint.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 4–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: Ancestor Rules declare Destination must be archive. DP-01 treats ancestor constraints as declarations; this is not a leaf destination.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell d9b55f0b6cbe3ed6ab868ed5

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The ancestor Rules declare Destination must be archive. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 4–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: Ancestor Rules declare Destination must be archive. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell bfde9ab405ad9faa2bc4b5ac

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This ancestor rule declares the inherited required destination archive. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: The ancestor destination constraint requires archive. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 06d002e75cf36ea1b43c83b1

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — This ancestor rule declares the inherited required destination archive. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: The ancestor destination constraint requires archive. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 67ae926240e520bfdb63b1a3

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — This ancestor rule declares the inherited required destination archive. DP-01 explicitly treats the ancestor constraint as a declaration, not a conflicting leaf destination; this ancestor row is not a leaf declaration. The inheritance relationship carries its constraint.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: The ancestor destination constraint requires archive. DP-01 treats ancestor constraints as declarations; this is not a leaf destination.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 4da9396f20f50a18673256c5

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — This ancestor rule declares the inherited required destination archive. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: The ancestor destination constraint requires archive. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 4d029f4ed7a941dc5b13bafa

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The complete TECHNIQUE.md ancestor declares its capability and Destination must be archive constraint. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N: The ancestor contains a Capability description and archive destination constraint. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 01bc60dde7d03c634b92d11c

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The complete TECHNIQUE.md ancestor declares its capability and Destination must be archive constraint. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N: The ancestor contains a Capability description and archive destination constraint. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 69c0652ae2e85de91e1e5de4

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The complete TECHNIQUE.md ancestor declares its capability and Destination must be archive constraint. DP-01 explicitly treats the ancestor constraint as a declaration, not a conflicting leaf destination; this ancestor row is not a leaf declaration. The inheritance relationship carries its constraint.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N: The ancestor contains a Capability description and archive destination constraint. DP-01 treats ancestor constraints as declarations; this is not a leaf destination.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 54a73e1bf111128988cf03fe

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The complete TECHNIQUE.md ancestor declares its capability and Destination must be archive constraint. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N: The ancestor contains a Capability description and archive destination constraint. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 4c3a69d6842d941bb1b4ae64

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The leaf Capability describes producing a report. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: Capability describes the service Produce a report. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell e192558242a4ed960c5d7a46

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The leaf Capability describes producing a report. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: Capability describes the service Produce a report. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 36ee15fe5284f5e03e6afdc4

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The leaf Capability describes producing a report. DP-01 scopes its independent check to the leaf Destination declaration. This row contains neither that declaration nor a call or inheritance relationship; the separate line-12 declaration is outside the row.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: Capability describes the service Produce a report. DP-01 targets the destination declaration; this row has neither that declaration nor an inheritance/call link.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 6eb38943804944cf6cfbb4ed

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The leaf Capability describes producing a report. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: Capability describes the service Produce a report. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 883f9febadc76de8d4b64dd6

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This leaf Capability sentence says Produce a report. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The Capability sentence describes producing a report. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell e3b51412d1cbb5b26dbb8664

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — This leaf Capability sentence says Produce a report. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The Capability sentence describes producing a report. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b82b83027689277cdcc2042f

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — This leaf Capability sentence says Produce a report. DP-01 scopes its independent check to the leaf Destination declaration. This row contains neither that declaration nor a call or inheritance relationship; the separate line-12 declaration is outside the row.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The Capability sentence describes producing a report. DP-01 targets the destination declaration; this row has neither that declaration nor an inheritance/call link.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell dadf707dc4833496ce962762

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — This leaf Capability sentence says Produce a report. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The Capability sentence describes producing a report. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell c986d23bf9fe92ac15ab723d

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The leaf Outputs section declares the output name report. AP-02 requires resolving the routine output emit.report through step emit to produce and comparing the declared technique output names. This reference, step, output declaration, or relationship is part of that binding contract; agreement is evaluated later.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 4–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The leaf Outputs section declares report. AP-02 requires resolving emit.report through emit to produce and comparing its declared output names.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The routine export is report: emit.report. Resolving step emit gives technique produce, whose complete Outputs section declares report. The referenced output exists; the exported routine name is not an additional output-name restriction. Each assigned row is this reference, its step, its declaration endpoint, or their relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell e00abe344b2cf11c702b34f1

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The leaf Outputs section declares the output name report. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 4–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The leaf Outputs section declares report. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b7876638c82ca7835e6ecd54

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The leaf Outputs section declares the output name report. DP-01 scopes its independent check to the leaf Destination declaration. This row contains neither that declaration nor a call or inheritance relationship; the separate line-12 declaration is outside the row.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 4–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The leaf Outputs section declares report. DP-01 targets the destination declaration; this row has neither that declaration nor an inheritance/call link.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 9839de920cafa86c93f9e319

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The leaf Outputs section declares the output name report. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 4–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The leaf Outputs section declares report. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 8835c0ddec51d397d30590e7

Row: corpus/qualification/techniques/produce.md#/outputs/report

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The leaf output heading declares report. AP-02 requires resolving the routine output emit.report through step emit to produce and comparing the declared technique output names. This reference, step, output declaration, or relationship is part of that binding contract; agreement is evaluated later.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The leaf output heading declares report. AP-02 requires resolving emit.report through emit to produce and comparing its declared output names.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The routine export is report: emit.report. Resolving step emit gives technique produce, whose complete Outputs section declares report. The referenced output exists; the exported routine name is not an additional output-name restriction. Each assigned row is this reference, its step, its declaration endpoint, or their relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell f0f7088daffd00158c0c1032

Row: corpus/qualification/techniques/produce.md#/outputs/report

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The leaf output heading declares report. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The leaf output heading declares report. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 52eadd327712a19ac6cca68e

Row: corpus/qualification/techniques/produce.md#/outputs/report

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The leaf output heading declares report. DP-01 scopes its independent check to the leaf Destination declaration. This row contains neither that declaration nor a call or inheritance relationship; the separate line-12 declaration is outside the row.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The leaf output heading declares report. DP-01 targets the destination declaration; this row has neither that declaration nor an inheritance/call link.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 16ed4220394232ac66e84453

Row: corpus/qualification/techniques/produce.md#/outputs/report

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The leaf output heading declares report. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The leaf output heading declares report. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 547682eae905cf61fddd33be

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The leaf Protocol section contains the instruction: Validate the report, then emit it. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 7–9
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The Protocol section contains: Validate the report, then emit it. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 668f2c03b5c1dfffd6143cc5

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — The leaf Protocol section contains the instruction: Validate the report, then emit it. AP-01 applies to imperative Protocol instructions and Rules clauses concerning emission. This row contains such an instruction or clause, which must be tested separately even when it requires validation; a clean result does not make it inapplicable.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 7–9
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The Protocol section contains: Validate the report, then emit it. AP-01 requires checking each emitting instruction or clause; requiring validation does not exclude it.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: pass — The complete leaf Protocol says Validate the report, then emit it. Its Rules independently require validating the report before each emission. Both instructions order validation of the same artifact before emission. The sibling Retain the report ID clause is non-emitting and was considered separately; it does not excuse or alter another clause. There is no instruction permitting unvalidated emission in the complete leaf.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

## Cell 533e91f3401233d0974551eb

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The leaf Protocol section contains the instruction: Validate the report, then emit it. DP-01 scopes its independent check to the leaf Destination declaration. This row contains neither that declaration nor a call or inheritance relationship; the separate line-12 declaration is outside the row.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 7–9
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The Protocol section contains: Validate the report, then emit it. DP-01 targets the destination declaration; this row has neither that declaration nor an inheritance/call link.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell a700a3294be653eb8e533547

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The leaf Protocol section contains the instruction: Validate the report, then emit it. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 7–9
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The Protocol section contains: Validate the report, then emit it. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 0f13f165ba007a4540cef470

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This Protocol instruction states: Validate the report, then emit it. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 8–8
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The Protocol instruction is: Validate the report, then emit it. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 7f339716e8d7474fb2512654

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — This Protocol instruction states: Validate the report, then emit it. AP-01 applies to imperative Protocol instructions and Rules clauses concerning emission. This row contains such an instruction or clause, which must be tested separately even when it requires validation; a clean result does not make it inapplicable.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 8–8
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The Protocol instruction is: Validate the report, then emit it. AP-01 requires checking each emitting instruction or clause; requiring validation does not exclude it.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: pass — The complete leaf Protocol says Validate the report, then emit it. Its Rules independently require validating the report before each emission. Both instructions order validation of the same artifact before emission. The sibling Retain the report ID clause is non-emitting and was considered separately; it does not excuse or alter another clause. There is no instruction permitting unvalidated emission in the complete leaf.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

## Cell fbafce4f79dd46979495549a

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — This Protocol instruction states: Validate the report, then emit it. DP-01 scopes its independent check to the leaf Destination declaration. This row contains neither that declaration nor a call or inheritance relationship; the separate line-12 declaration is outside the row.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 8–8
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The Protocol instruction is: Validate the report, then emit it. DP-01 targets the destination declaration; this row has neither that declaration nor an inheritance/call link.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell cc4fea783a74407b8fdb654e

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — This Protocol instruction states: Validate the report, then emit it. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 8–8
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The Protocol instruction is: Validate the report, then emit it. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell a30b577290e3406e29334f7b

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The leaf Rules contain ID retention, the clause validate the report before each emission, and Destination is archive. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 10–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: Rules contain report-ID retention, an emission clause and Destination is archive. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell d10a33e1908da3335366adaa

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — The leaf Rules contain ID retention, the clause validate the report before each emission, and Destination is archive. AP-01 applies to imperative Protocol instructions and Rules clauses concerning emission. This row contains such an instruction or clause, which must be tested separately even when it requires validation; a clean result does not make it inapplicable.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 10–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: Rules contain report-ID retention, an emission clause and Destination is archive. AP-01 requires checking each emitting instruction or clause; requiring validation does not exclude it.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: pass — The complete leaf Protocol says Validate the report, then emit it. Its Rules independently require validating the report before each emission. Both instructions order validation of the same artifact before emission. The sibling Retain the report ID clause is non-emitting and was considered separately; it does not excuse or alter another clause. There is no instruction permitting unvalidated emission in the complete leaf.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

## Cell 381dd396d48f156e5b5332ba

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — The leaf Rules contain ID retention, the clause validate the report before each emission, and Destination is archive. DP-01 applies to the leaf Destination declaration and the explicit call or inheritance relationships carrying qualification -> run -> deliver -> produce and its qualification TECHNIQUE.md ancestor. Applicability does not decide whether the values agree.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 10–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — A: Rules contain report-ID retention, an emission clause and Destination is archive. DP-01 applies to this leaf destination declaration in its inherited execution context.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — The captured call chain is qualification initial/graph run -> run activity delivery -> deliver routine emit -> produce. In that executing workflow the applicable ancestor is qualification/techniques/TECHNIQUE.md, whose Rules require archive. The leaf declares Destination is archive. The values agree; the ancestor declaration is the requirement, not a second conflicting leaf. This same chain and comparison hold for every assigned row.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

## Cell 21b5df21a5c696fcaa898fbf

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The leaf Rules contain ID retention, the clause validate the report before each emission, and Destination is archive. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 10–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: Rules contain report-ID retention, an emission clause and Destination is archive. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 6dff2018269cdd7f6ce3a242

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This Rules line contains two independently testable clauses: Retain the report ID; validate the report before each emission. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 11–11
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The Rules line has separate retention and report-emission clauses. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell a3b7b46de80a7e60f06f33aa

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — This Rules line contains two independently testable clauses: Retain the report ID; validate the report before each emission. AP-01 applies to imperative Protocol instructions and Rules clauses concerning emission. This row contains such an instruction or clause, which must be tested separately even when it requires validation; a clean result does not make it inapplicable.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 11–11
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The Rules line has separate retention and report-emission clauses. AP-01 requires checking each emitting instruction or clause; requiring validation does not exclude it.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: pass — The complete leaf Protocol says Validate the report, then emit it. Its Rules independently require validating the report before each emission. Both instructions order validation of the same artifact before emission. The sibling Retain the report ID clause is non-emitting and was considered separately; it does not excuse or alter another clause. There is no instruction permitting unvalidated emission in the complete leaf.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

## Cell 69a9fd68e24025b700e9bbb1

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — This Rules line contains two independently testable clauses: Retain the report ID; validate the report before each emission. DP-01 scopes its independent check to the leaf Destination declaration. This row contains neither that declaration nor a call or inheritance relationship; the separate line-12 declaration is outside the row.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 11–11
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The Rules line has separate retention and report-emission clauses. DP-01 targets the destination declaration; this row has neither that declaration nor an inheritance/call link.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell d4d45cf60920c4360e003cf1

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — This Rules line contains two independently testable clauses: Retain the report ID; validate the report before each emission. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 11–11
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The Rules line has separate retention and report-emission clauses. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 923c5917ea2c9d4abe29e519

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This first Rules clause directs retention of the report ID. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 11–11
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The first Rules clause only requires retaining the report ID. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 2f83f57df858c2cf145efffc

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — This first Rules clause directs retention of the report ID. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 11–11
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The first Rules clause only requires retaining the report ID. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9e2179b4c1fbfc73dc6b4981

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — This first Rules clause directs retention of the report ID. DP-01 scopes its independent check to the leaf Destination declaration. This row contains neither that declaration nor a call or inheritance relationship; the separate line-12 declaration is outside the row.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 11–11
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The first Rules clause only requires retaining the report ID. DP-01 targets the destination declaration; this row has neither that declaration nor an inheritance/call link.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b1c897ef75ecfb0802a40206

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — This first Rules clause directs retention of the report ID. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 11–11
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The first Rules clause only requires retaining the report ID. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell a03eed5b1543ec6c3d53b66c

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This second Rules clause states: validate the report before each emission. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 11–11
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The second Rules clause is: validate the report before each emission. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 1fff788717e68470ea335f4a

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — This second Rules clause states: validate the report before each emission. AP-01 applies to imperative Protocol instructions and Rules clauses concerning emission. This row contains such an instruction or clause, which must be tested separately even when it requires validation; a clean result does not make it inapplicable.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 11–11
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The second Rules clause is: validate the report before each emission. AP-01 requires checking each emitting instruction or clause; requiring validation does not exclude it.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: pass — The complete leaf Protocol says Validate the report, then emit it. Its Rules independently require validating the report before each emission. Both instructions order validation of the same artifact before emission. The sibling Retain the report ID clause is non-emitting and was considered separately; it does not excuse or alter another clause. There is no instruction permitting unvalidated emission in the complete leaf.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

## Cell acca57d9a610cd2900940f11

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — This second Rules clause states: validate the report before each emission. DP-01 scopes its independent check to the leaf Destination declaration. This row contains neither that declaration nor a call or inheritance relationship; the separate line-12 declaration is outside the row.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 11–11
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The second Rules clause is: validate the report before each emission. DP-01 targets the destination declaration; this row has neither that declaration nor an inheritance/call link.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b192bf0ffab5454aaf50901a

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — This second Rules clause states: validate the report before each emission. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 11–11
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The second Rules clause is: validate the report before each emission. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 185e903ef3c4ae26da231a32

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This leaf declaration states Destination is archive. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 12–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The leaf declares Destination is archive. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 9d43a5459db3bcbd7c1b6759

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — This leaf declaration states Destination is archive. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 12–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The leaf declares Destination is archive. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 355ce3ec841005b898e3d8d3

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — This leaf declaration states Destination is archive. DP-01 applies to the leaf Destination declaration and the explicit call or inheritance relationships carrying qualification -> run -> deliver -> produce and its qualification TECHNIQUE.md ancestor. Applicability does not decide whether the values agree.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 12–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — A: The leaf declares Destination is archive. DP-01 applies to this leaf destination declaration in its inherited execution context.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — The captured call chain is qualification initial/graph run -> run activity delivery -> deliver routine emit -> produce. In that executing workflow the applicable ancestor is qualification/techniques/TECHNIQUE.md, whose Rules require archive. The leaf declares Destination is archive. The values agree; the ancestor declaration is the requirement, not a second conflicting leaf. This same chain and comparison hold for every assigned row.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

## Cell 3e979fb0c7e3eb5836c3cb1a

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — This leaf declaration states Destination is archive. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 12–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — N: The leaf declares Destination is archive. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ca1e1515076ec0147e7b8338

Row: corpus/qualification/techniques/produce.md#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The complete produce leaf declares output report, a Protocol emission instruction, a Rules emission clause, and Destination is archive. AP-02 requires resolving the routine output emit.report through step emit to produce and comparing the declared technique output names. This reference, step, output declaration, or relationship is part of that binding contract; agreement is evaluated later.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — A: The complete leaf declares report, two emission directives and Destination is archive. AP-02 requires resolving emit.report through emit to produce and comparing its declared output names.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — The routine export is report: emit.report. Resolving step emit gives technique produce, whose complete Outputs section declares report. The referenced output exists; the exported routine name is not an additional output-name restriction. Each assigned row is this reference, its step, its declaration endpoint, or their relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell d074a916d8f80c61b3aa18a0

Row: corpus/qualification/techniques/produce.md#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — The complete produce leaf declares output report, a Protocol emission instruction, a Rules emission clause, and Destination is archive. AP-01 applies to imperative Protocol instructions and Rules clauses concerning emission. This row contains such an instruction or clause, which must be tested separately even when it requires validation; a clean result does not make it inapplicable.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — A: The complete leaf declares report, two emission directives and Destination is archive. AP-01 requires checking each emitting instruction or clause; requiring validation does not exclude it.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: pass — The complete leaf Protocol says Validate the report, then emit it. Its Rules independently require validating the report before each emission. Both instructions order validation of the same artifact before emission. The sibling Retain the report ID clause is non-emitting and was considered separately; it does not excuse or alter another clause. There is no instruction permitting unvalidated emission in the complete leaf.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

## Cell a406c04573c91f8ad82577e3

Row: corpus/qualification/techniques/produce.md#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — The complete produce leaf declares output report, a Protocol emission instruction, a Rules emission clause, and Destination is archive. DP-01 applies to the leaf Destination declaration and the explicit call or inheritance relationships carrying qualification -> run -> deliver -> produce and its qualification TECHNIQUE.md ancestor. Applicability does not decide whether the values agree.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — A: The complete leaf declares report, two emission directives and Destination is archive. DP-01 applies to this leaf destination declaration in its inherited execution context.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — The captured call chain is qualification initial/graph run -> run activity delivery -> deliver routine emit -> produce. In that executing workflow the applicable ancestor is qualification/techniques/TECHNIQUE.md, whose Rules require archive. The leaf declares Destination is archive. The values agree; the ancestor declaration is the requirement, not a second conflicting leaf. This same chain and comparison hold for every assigned row.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

## Cell 8d0f33a043c7068e8c998046

Row: corpus/qualification/techniques/produce.md#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The complete produce leaf declares output report, a Protocol emission instruction, a Rules emission clause, and Destination is archive. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — N: The complete leaf declares report, two emission directives and Destination is archive. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fa0e42c99b24fa8b70e1b4c5

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This inheritance relationship connects produce to qualification/techniques/TECHNIQUE.md. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: The inheritance relationship connects produce to qualification TECHNIQUE.md. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 8ab5a44208c83cc6801721f8

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — This inheritance relationship connects produce to qualification/techniques/TECHNIQUE.md. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: The inheritance relationship connects produce to qualification TECHNIQUE.md. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 8bfa310664405693e5cee00b

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — This inheritance relationship connects produce to qualification/techniques/TECHNIQUE.md. DP-01 applies to the leaf Destination declaration and the explicit call or inheritance relationships carrying qualification -> run -> deliver -> produce and its qualification TECHNIQUE.md ancestor. Applicability does not decide whether the values agree.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — A: The inheritance relationship connects produce to qualification TECHNIQUE.md. DP-01 requires this execution or inheritance link to carry the ancestor destination to the leaf.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — The captured call chain is qualification initial/graph run -> run activity delivery -> deliver routine emit -> produce. In that executing workflow the applicable ancestor is qualification/techniques/TECHNIQUE.md, whose Rules require archive. The leaf declares Destination is archive. The values agree; the ancestor declaration is the requirement, not a second conflicting leaf. This same chain and comparison hold for every assigned row.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

## Cell 98b55e096e4899353322814f

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — This inheritance relationship connects produce to qualification/techniques/TECHNIQUE.md. DP-02 is scoped to the workflow graph from initialActivity to a null destination. This activity, routine, technique, or local relationship supplies no workflow graph exit; the criterion explicitly states activity and routine steps do not add such exits.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — N: The inheritance relationship connects produce to qualification TECHNIQUE.md. DP-02 is a workflow-graph invariant; this construct supplies no graph exit or initial-activity binding.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e3964a7ca7f68e7c40793e11

Row: corpus/qualification/workflow.yaml#/graph

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The workflow graph has the run activity and its done exit with destination null. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 4–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The complete graph contains run/done with destination null. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 343988e91c335d3bdef76586

Row: corpus/qualification/workflow.yaml#/graph

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The workflow graph has the run activity and its done exit with destination null. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 4–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The complete graph contains run/done with destination null. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 67bbb2cf737f1d39490640e1

Row: corpus/qualification/workflow.yaml#/graph

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The workflow graph has the run activity and its done exit with destination null. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 4–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The complete graph contains run/done with destination null. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 094759e3ffb8236db086b566

Row: corpus/qualification/workflow.yaml#/graph

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — The workflow graph has the run activity and its done exit with destination null. DP-02 applies to the workflow path from initialActivity through graph exits. This graph or entry construct must be assessed against the complete workflow invariant, with all reachable exits considered; matching one activity name cannot establish termination.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 4–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — A: The complete graph contains run/done with destination null. DP-02 applies to this path-bearing construct with the entire workflow graph as context.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — Reading the complete workflow gives initialActivity run and the sole graph exit run.done: null. The finite path run -> null is reachable from the initial activity. Every assigned graph, entry, or relationship row is evaluated against this whole-workflow path, not just matching individual activity IDs.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell fc47360bf214ca94a9c2f752

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The graph run entry has done: null. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The run graph entry contains done: null. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell cc39f8b8ebb2b96169d05005

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The graph run entry has done: null. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The run graph entry contains done: null. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9aa00375bff5d32993c718d0

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The graph run entry has done: null. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The run graph entry contains done: null. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 9a13e148e0a434d148bef242

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — The graph run entry has done: null. DP-02 applies to the workflow path from initialActivity through graph exits. This graph or entry construct must be assessed against the complete workflow invariant, with all reachable exits considered; matching one activity name cannot establish termination.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — A: The run graph entry contains done: null. DP-02 applies to this path-bearing construct with the entire workflow graph as context.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — Reading the complete workflow gives initialActivity run and the sole graph exit run.done: null. The finite path run -> null is reachable from the initial activity. Every assigned graph, entry, or relationship row is evaluated against this whole-workflow path, not just matching individual activity IDs.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell e8a18028e34e1ace5d01fcf3

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The graph exit done has destination null. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The graph exit done has destination null. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell b1f517596f87f82a15830709

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The graph exit done has destination null. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The graph exit done has destination null. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 46e28f2007abc40979497fc9

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The graph exit done has destination null. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The graph exit done has destination null. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell e0fcd50974c10678a3e2fb44

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — The graph exit done has destination null. DP-02 applies to the workflow path from initialActivity through graph exits. This graph or entry construct must be assessed against the complete workflow invariant, with all reachable exits considered; matching one activity name cannot establish termination.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — A: The graph exit done has destination null. DP-02 applies to this path-bearing construct with the entire workflow graph as context.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — Reading the complete workflow gives initialActivity run and the sole graph exit run.done: null. The finite path run -> null is reachable from the initial activity. Every assigned graph, entry, or relationship row is evaluated against this whole-workflow path, not just matching individual activity IDs.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell a1bbb96005ca910edd02b943

Row: corpus/qualification/workflow.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The workflow id is qualification. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–1
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: qualification is the workflow identifier. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell ca0a66d25c90e652baa92f28

Row: corpus/qualification/workflow.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The workflow id is qualification. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–1
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: qualification is the workflow identifier. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9fff88eaae065adb66759e66

Row: corpus/qualification/workflow.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The workflow id is qualification. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–1
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: qualification is the workflow identifier. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b70cd0fa3dc717cd87f806e4

Row: corpus/qualification/workflow.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The workflow id is qualification. DP-02 is a whole-workflow path invariant. The id label names the workflow but supplies neither its initialActivity nor a graph exit; the complete workflow and path-bearing rows carry this check.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–1
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: qualification is the workflow identifier. DP-02 concerns the initial activity and reachable graph exits; the workflow ID supplies neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b93fc9705f0d802bdff5440b

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The workflow initialActivity is run. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The workflow initialActivity is run. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 3641b7b9d54d55df0cc22cb1

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The workflow initialActivity is run. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The workflow initialActivity is run. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 665c1a7ad6f6a7650e3f374a

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The workflow initialActivity is run. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — N: The workflow initialActivity is run. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell c7fdcca69a6f6d3b3cfa7009

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — The workflow initialActivity is run. DP-02 applies to the workflow path from initialActivity through graph exits. This graph or entry construct must be assessed against the complete workflow invariant, with all reachable exits considered; matching one activity name cannot establish termination.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — A: The workflow initialActivity is run. DP-02 applies to this path-bearing construct with the entire workflow graph as context.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — Reading the complete workflow gives initialActivity run and the sole graph exit run.done: null. The finite path run -> null is reachable from the initial activity. Every assigned graph, entry, or relationship row is evaluated against this whole-workflow path, not just matching individual activity IDs.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell ce1c6885d9fe828ffb2d4802

Row: corpus/qualification/workflow.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The complete workflow has initialActivity run and graph run/done: null. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — N: The workflow starts at run and its sole exit is done: null. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 5551fe05b667e60209399004

Row: corpus/qualification/workflow.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The complete workflow has initialActivity run and graph run/done: null. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — N: The workflow starts at run and its sole exit is done: null. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 263ad09bd2d440e2a894ee63

Row: corpus/qualification/workflow.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The complete workflow has initialActivity run and graph run/done: null. DP-01 excludes independent checks of files without a leaf Destination declaration. This activity, routine, or workflow row has none; explicit call relationships carry the rule to the leaf instance.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — N: The workflow starts at run and its sole exit is done: null. DP-01 excludes independent checks of files without a leaf destination; this file has none.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell e5c1842a573eccbf8d7d7e60

Row: corpus/qualification/workflow.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — The complete workflow has initialActivity run and graph run/done: null. DP-02 applies to the workflow path from initialActivity through graph exits. This graph or entry construct must be assessed against the complete workflow invariant, with all reachable exits considered; matching one activity name cannot establish termination.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — A: The workflow starts at run and its sole exit is done: null. DP-02 applies to this path-bearing construct with the entire workflow graph as context.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — Reading the complete workflow gives initialActivity run and the sole graph exit run.done: null. The finite path run -> null is reachable from the initial activity. Every assigned graph, entry, or relationship row is evaluated against this whole-workflow path, not just matching individual activity IDs.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell 94b820a882f196103f835741

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The initialActivity relationship connects qualification to run. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The initialActivity relationship connects qualification to run. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell f30ba6f42d4230bf27814f3a

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The initialActivity relationship connects qualification to run. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The initialActivity relationship connects qualification to run. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 21f9cfbf2718ad51d2976c98

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — The initialActivity relationship connects qualification to run. DP-01 applies to the leaf Destination declaration and the explicit call or inheritance relationships carrying qualification -> run -> deliver -> produce and its qualification TECHNIQUE.md ancestor. Applicability does not decide whether the values agree.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The initialActivity relationship connects qualification to run. DP-01 requires this execution or inheritance link to carry the ancestor destination to the leaf.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — The captured call chain is qualification initial/graph run -> run activity delivery -> deliver routine emit -> produce. In that executing workflow the applicable ancestor is qualification/techniques/TECHNIQUE.md, whose Rules require archive. The leaf declares Destination is archive. The values agree; the ancestor declaration is the requirement, not a second conflicting leaf. This same chain and comparison hold for every assigned row.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

## Cell 8862878198e6198ef77c1f28

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — The initialActivity relationship connects qualification to run. DP-02 applies to the workflow path from initialActivity through graph exits. This graph or entry construct must be assessed against the complete workflow invariant, with all reachable exits considered; matching one activity name cannot establish termination.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — A: The initialActivity relationship connects qualification to run. DP-02 applies to this path-bearing construct with the entire workflow graph as context.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — Reading the complete workflow gives initialActivity run and the sole graph exit run.done: null. The finite path run -> null is reachable from the initial activity. Every assigned graph, entry, or relationship row is evaluated against this whole-workflow path, not just matching individual activity IDs.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell 8020bba4283a65b31df0f113

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The graph-entry relationship resolves the run activity. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The graph-key relationship resolves run to the run activity. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell ca06cc90126da20e026a0486

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The graph-entry relationship resolves the run activity. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The graph-key relationship resolves run to the run activity. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 32efcf3836cf4d26fc113577

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — The graph-entry relationship resolves the run activity. DP-01 applies to the leaf Destination declaration and the explicit call or inheritance relationships carrying qualification -> run -> deliver -> produce and its qualification TECHNIQUE.md ancestor. Applicability does not decide whether the values agree.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The graph-key relationship resolves run to the run activity. DP-01 requires this execution or inheritance link to carry the ancestor destination to the leaf.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — The captured call chain is qualification initial/graph run -> run activity delivery -> deliver routine emit -> produce. In that executing workflow the applicable ancestor is qualification/techniques/TECHNIQUE.md, whose Rules require archive. The leaf declares Destination is archive. The values agree; the ancestor declaration is the requirement, not a second conflicting leaf. This same chain and comparison hold for every assigned row.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

## Cell 48da822c85267d96ea48c4c2

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — The graph-entry relationship resolves the run activity. DP-02 applies to the workflow path from initialActivity through graph exits. This graph or entry construct must be assessed against the complete workflow invariant, with all reachable exits considered; matching one activity name cannot establish termination.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — A: The graph-key relationship resolves run to the run activity. DP-02 applies to this path-bearing construct with the entire workflow graph as context.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — Reading the complete workflow gives initialActivity run and the sole graph exit run.done: null. The finite path run -> null is reachable from the initial activity. Every assigned graph, entry, or relationship row is evaluated against this whole-workflow path, not just matching individual activity IDs.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell f0755acc68e9a62e580665a3

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The graph-entry relationship identifies the run/done binding context. AP-02 checks concrete activity routine argument-key sets and routine Outputs references resolved to technique output declarations. This row has neither contract endpoint nor a binding relationship; an identifier, graph label, ancestor constraint, or Markdown artifact mention is not such a binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The graph-entry relationship records the run/done activity context. AP-02 concerns invocation argument keys and resolved output bindings; this construct participates in neither.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 96797ae8488cf51f8878572b

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The graph-entry relationship identifies the run/done binding context. AP-01 scopes its Detect to imperative technique Protocol emission instructions and Rules emission clauses. This row supplies an identifier, declaration, capability, retention/destination constraint, or relationship rather than such an imperative; those non-emitting constructs are outside that scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — N: The graph-entry relationship records the run/done activity context. AP-01 concerns imperative Protocol/Rules emission instructions; this construct is not one.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell dafc343685f5a84041beee97

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — The graph-entry relationship identifies the run/done binding context. DP-01 applies to the leaf Destination declaration and the explicit call or inheritance relationships carrying qualification -> run -> deliver -> produce and its qualification TECHNIQUE.md ancestor. Applicability does not decide whether the values agree.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12

Verification: verified — A: The graph-entry relationship records the run/done activity context. DP-01 requires this execution or inheritance link to carry the ancestor destination to the leaf.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — The captured call chain is qualification initial/graph run -> run activity delivery -> deliver routine emit -> produce. In that executing workflow the applicable ancestor is qualification/techniques/TECHNIQUE.md, whose Rules require archive. The leaf declares Destination is archive. The values agree; the ancestor declaration is the requirement, not a second conflicting leaf. This same chain and comparison hold for every assigned row.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

## Cell 5453a725eb6086baaa72c972

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — The graph-entry relationship identifies the run/done binding context. DP-02 applies to the workflow path from initialActivity through graph exits. This graph or entry construct must be assessed against the complete workflow invariant, with all reachable exits considered; matching one activity name cannot establish termination.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6

Verification: verified — A: The graph-entry relationship records the run/done activity context. DP-02 applies to this path-bearing construct with the entire workflow graph as context.

Agent: /root/qualify_verify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — Reading the complete workflow gives initialActivity run and the sole graph exit run.done: null. The finite path run -> null is reachable from the initial activity. Every assigned graph, entry, or relationship row is evaluated against this whole-workflow path, not just matching individual activity IDs.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
