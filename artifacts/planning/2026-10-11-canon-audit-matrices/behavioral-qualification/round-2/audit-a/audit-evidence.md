# Audit Evidence

Snapshot: 8a3725e6142c077674aa46cbe55facb00e329e9167a25196e587562eecf052f9

## Cell 588e9afc6de79e4e15622316

Row: corpus/qualification/activities/run.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — run.yaml#/id: The activity declaration identifier is run. This declaration or activity-step identifier is not an invocation argument key, routine input, exported step.output binding or its referenced producer step. Neither AP-02 binding contract is present in this row.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — run /id names the activity. N holds: this identifier is neither an invocation argument/input key nor a producer named by a routine output binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 0782b255d289b2d8aaa260a8

Row: corpus/qualification/activities/run.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — run.yaml#/id: The activity declaration identifier is run. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — run /id names the activity. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a93639cc3c5c1ad866587c2e

Row: corpus/qualification/activities/run.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — run.yaml#/id: The activity declaration identifier is run. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — run /id names the activity. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7d5cdef67a14fe0a0e70a8ff

Row: corpus/qualification/activities/run.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — run.yaml#/id: The activity declaration identifier is run. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — run /id names the activity. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fc60645fdab03b4f360b972e

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — run.yaml#/steps: The activity steps contain delivery, which invokes deliver with the envelope argument. AP-02 contract (1) applies to this concrete invocation or its argument/target constituent: its key set must be compared with deliver Inputs. Both a matching and a different key set remain applicable.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — run /steps contains delivery invoking deliver with envelope. A holds: this invocation or required-input endpoint participates in AP-02 argument-key/Inputs comparison, including matching keys.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — run.yaml#/steps: The concrete run.delivery call supplies exactly {envelope}, matching deliver Inputs [envelope]; sealed is opaque.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 69bbe5f010e4e9c6cc42b36b

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — run.yaml#/steps: The activity steps contain delivery, which invokes deliver with the envelope argument. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — run /steps contains delivery invoking deliver with envelope. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 330d9855c61f1fa6db1e92b2

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — run.yaml#/steps: The activity steps contain delivery, which invokes deliver with the envelope argument. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — run /steps contains delivery invoking deliver with envelope. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell ec7e3577667dbf0846b7b09f

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — run.yaml#/steps: The activity steps contain delivery, which invokes deliver with the envelope argument. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — run /steps contains delivery invoking deliver with envelope. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ece85719689c1a3411d52a12

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — run.yaml#/steps/id=delivery: The delivery step invokes deliver and supplies the envelope argument. AP-02 contract (1) applies to this concrete invocation or its argument/target constituent: its key set must be compared with deliver Inputs. Both a matching and a different key set remain applicable.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The delivery step invokes deliver with envelope. A holds: this invocation or required-input endpoint participates in AP-02 argument-key/Inputs comparison, including matching keys.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — run.yaml#/steps/id=delivery: The concrete run.delivery call supplies exactly {envelope}, matching deliver Inputs [envelope]; sealed is opaque.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 4c9b9e3283acb76acd0c593c

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — run.yaml#/steps/id=delivery: The delivery step invokes deliver and supplies the envelope argument. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The delivery step invokes deliver with envelope. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a5b35e7460c5ba032ea3ab9c

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — run.yaml#/steps/id=delivery: The delivery step invokes deliver and supplies the envelope argument. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The delivery step invokes deliver with envelope. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell eaf04cb03551645c38d72842

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — run.yaml#/steps/id=delivery: The delivery step invokes deliver and supplies the envelope argument. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The delivery step invokes deliver with envelope. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 03b141fa3c167d6b5347f32a

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — run.yaml#/steps/id=delivery/id: This scalar names the activity step delivery; it does not declare an argument key or exported output. This declaration or activity-step identifier is not an invocation argument key, routine input, exported step.output binding or its referenced producer step. Neither AP-02 binding contract is present in this row.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — delivery /id names the activity step. N holds: this identifier is neither an invocation argument/input key nor a producer named by a routine output binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell eb0acb5f69509bc093ccb4c4

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — run.yaml#/steps/id=delivery/id: This scalar names the activity step delivery; it does not declare an argument key or exported output. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — delivery /id names the activity step. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a09b4b5068e60047e85b9d20

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — run.yaml#/steps/id=delivery/id: This scalar names the activity step delivery; it does not declare an argument key or exported output. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — delivery /id names the activity step. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 51923b360aa3ef1a7585fbf4

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — run.yaml#/steps/id=delivery/id: This scalar names the activity step delivery; it does not declare an argument key or exported output. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — delivery /id names the activity step. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 366a1ced08e276234b09d365

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — run.yaml#/steps/id=delivery/routine: The routine object names deliver and supplies the envelope argument. AP-02 contract (1) applies to this concrete invocation or its argument/target constituent: its key set must be compared with deliver Inputs. Both a matching and a different key set remain applicable.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The delivery routine object names deliver and supplies envelope. A holds: this invocation or required-input endpoint participates in AP-02 argument-key/Inputs comparison, including matching keys.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — run.yaml#/steps/id=delivery/routine: The concrete run.delivery call supplies exactly {envelope}, matching deliver Inputs [envelope]; sealed is opaque.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 8f71acc678543f1dedd6da64

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — run.yaml#/steps/id=delivery/routine: The routine object names deliver and supplies the envelope argument. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The delivery routine object names deliver and supplies envelope. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 4e129aea04e56ac3f5e18eac

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — run.yaml#/steps/id=delivery/routine: The routine object names deliver and supplies the envelope argument. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The delivery routine object names deliver and supplies envelope. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7fa24663abc3348858407cd5

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — run.yaml#/steps/id=delivery/routine: The routine object names deliver and supplies the envelope argument. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The delivery routine object names deliver and supplies envelope. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e4e1d36386ad37dc4007d953

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — run.yaml#/steps/id=delivery/routine/arguments: The invocation arguments have the single key envelope; sealed is its opaque value. AP-02 contract (1) applies to this concrete invocation or its argument/target constituent: its key set must be compared with deliver Inputs. Both a matching and a different key set remain applicable.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — delivery arguments has the single key envelope; sealed is opaque. A holds: this invocation or required-input endpoint participates in AP-02 argument-key/Inputs comparison, including matching keys.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — run.yaml#/steps/id=delivery/routine/arguments: The concrete run.delivery call supplies exactly {envelope}, matching deliver Inputs [envelope]; sealed is opaque.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 85d58778322169b7eb358fb2

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — run.yaml#/steps/id=delivery/routine/arguments: The invocation arguments have the single key envelope; sealed is its opaque value. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — delivery arguments has the single key envelope; sealed is opaque. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 235d809af28915c83b47a336

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — run.yaml#/steps/id=delivery/routine/arguments: The invocation arguments have the single key envelope; sealed is its opaque value. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — delivery arguments has the single key envelope; sealed is opaque. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 8f04699d8cada26b1b7ebcc5

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — run.yaml#/steps/id=delivery/routine/arguments: The invocation arguments have the single key envelope; sealed is its opaque value. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — delivery arguments has the single key envelope; sealed is opaque. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell f45b86c19f25461cbe667622

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — run.yaml#/steps/id=delivery/routine/arguments/envelope: The invocation argument key is envelope and its opaque value is sealed. AP-02 contract (1) applies to this concrete invocation or its argument/target constituent: its key set must be compared with deliver Inputs. Both a matching and a different key set remain applicable.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The invocation argument key is envelope. A holds: this invocation or required-input endpoint participates in AP-02 argument-key/Inputs comparison, including matching keys.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — run.yaml#/steps/id=delivery/routine/arguments/envelope: The concrete run.delivery call supplies exactly {envelope}, matching deliver Inputs [envelope]; sealed is opaque.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell e7190e6183add8a7b67d408d

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — run.yaml#/steps/id=delivery/routine/arguments/envelope: The invocation argument key is envelope and its opaque value is sealed. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The invocation argument key is envelope. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell cb6557b6c858a3df047947ff

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — run.yaml#/steps/id=delivery/routine/arguments/envelope: The invocation argument key is envelope and its opaque value is sealed. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The invocation argument key is envelope. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell f7c71bd7cd44e3d3cfd50614

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/envelope

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — run.yaml#/steps/id=delivery/routine/arguments/envelope: The invocation argument key is envelope and its opaque value is sealed. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The invocation argument key is envelope. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 23d52f087c143d67f67da445

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — run.yaml#/steps/id=delivery/routine/name: The routine name deliver selects the declaration whose Inputs list is envelope. AP-02 contract (1) applies to this concrete invocation or its argument/target constituent: its key set must be compared with deliver Inputs. Both a matching and a different key set remain applicable.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — delivery routine/name selects deliver. A holds: this invocation or required-input endpoint participates in AP-02 argument-key/Inputs comparison, including matching keys.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — run.yaml#/steps/id=delivery/routine/name: The concrete run.delivery call supplies exactly {envelope}, matching deliver Inputs [envelope]; sealed is opaque.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 7a49531ccbd7063bf5c4dd03

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — run.yaml#/steps/id=delivery/routine/name: The routine name deliver selects the declaration whose Inputs list is envelope. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — delivery routine/name selects deliver. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell cced7364e2269714c048fe3b

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — run.yaml#/steps/id=delivery/routine/name: The routine name deliver selects the declaration whose Inputs list is envelope. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — delivery routine/name selects deliver. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 501147c7c9cf63d456cc367b

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — run.yaml#/steps/id=delivery/routine/name: The routine name deliver selects the declaration whose Inputs list is envelope. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — delivery routine/name selects deliver. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b331b3631bac4371bfebf008

Row: corpus/qualification/activities/run.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — run.yaml#@element: The run activity contains delivery invoking deliver with argument key envelope. AP-02 contract (1) applies to this concrete invocation or its argument/target constituent: its key set must be compared with deliver Inputs. Both a matching and a different key set remain applicable.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The run element contains the concrete deliver invocation with envelope. A holds: this invocation or required-input endpoint participates in AP-02 argument-key/Inputs comparison, including matching keys.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — run.yaml#@element: The concrete run.delivery call supplies exactly {envelope}, matching deliver Inputs [envelope]; sealed is opaque.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 6d000a7587cb7a720d3ce09a

Row: corpus/qualification/activities/run.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — run.yaml#@element: The run activity contains delivery invoking deliver with argument key envelope. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The run element contains the concrete deliver invocation with envelope. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell fd8572c700cc4625bf5e2e78

Row: corpus/qualification/activities/run.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — run.yaml#@element: The run activity contains delivery invoking deliver with argument key envelope. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The run element contains the concrete deliver invocation with envelope. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 8b3b602b6703003326b8df8d

Row: corpus/qualification/activities/run.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — run.yaml#@element: The run activity contains delivery invoking deliver with argument key envelope. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The run element contains the concrete deliver invocation with envelope. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell eeab805ea4653756496776b5

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — run.yaml#@relationship/5a93bb0629055f53: The concrete activity call supplies envelope to deliver, whose input is envelope and whose emit step calls produce. AP-02 contract (1) applies to this concrete invocation or its argument/target constituent: its key set must be compared with deliver Inputs. Both a matching and a different key set remain applicable.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The run-to-deliver relationship binds argument envelope to input envelope. A holds: this invocation or required-input endpoint participates in AP-02 argument-key/Inputs comparison, including matching keys.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — run.yaml#@relationship/5a93bb0629055f53: The concrete run.delivery call supplies exactly {envelope}, matching deliver Inputs [envelope]; sealed is opaque.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell e42353cfc8fe3169b809b996

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — run.yaml#@relationship/5a93bb0629055f53: The concrete activity call supplies envelope to deliver, whose input is envelope and whose emit step calls produce. This row represents a call or inheritance relationship, not the target leaf instruction. AP-01 excludes calls and bindings from constructs that themselves direct emission.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The run-to-deliver relationship binds argument envelope to input envelope. N holds: AP-01 excludes calls and bindings; this relationship is not the target leaf emission instruction.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 91a7785154a1a018658ccae8

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — run.yaml#@relationship/5a93bb0629055f53: The concrete activity call supplies envelope to deliver, whose input is envelope and whose emit step calls produce. DP-01 expressly carries the inherited destination rule through call and inheritance relationships to this leaf instance. The captured qualification/run/deliver chain, ancestor requirement and leaf declaration establish that applicability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The run-to-deliver relationship binds argument envelope to input envelope. A follows from the explicit call/inheritance chain carrying DP-01 to the executing leaf.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — run.yaml#@relationship/5a93bb0629055f53: qualification executes run -> deliver -> produce under qualification/techniques/TECHNIQUE.md. The leaf Destination archive equals inherited required archive.

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

Applicability: N — run.yaml#@relationship/5a93bb0629055f53: The concrete activity call supplies envelope to deliver, whose input is envelope and whose emit step calls produce. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The run-to-deliver relationship binds argument envelope to input envelope. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell bfa09024c94a6bc76d51c631

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — deliver.yaml#/id: The routine declaration identifier is deliver. This declaration or activity-step identifier is not an invocation argument key, routine input, exported step.output binding or its referenced producer step. Neither AP-02 binding contract is present in this row.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — deliver /id names the routine declaration. N holds: this identifier is neither an invocation argument/input key nor a producer named by a routine output binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 9156a757fd93955348ca5766

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — deliver.yaml#/id: The routine declaration identifier is deliver. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — deliver /id names the routine declaration. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell bf312e511dcc8f4eda77a41a

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — deliver.yaml#/id: The routine declaration identifier is deliver. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — deliver /id names the routine declaration. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell a0e70a1645458e99657058ca

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — deliver.yaml#/id: The routine declaration identifier is deliver. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — deliver /id names the routine declaration. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 620325a4c3f62c9867a7df90

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — deliver.yaml#/inputs: The routine Inputs list contains exactly envelope. AP-02 contract (1) uses this exact Inputs list as the required key set for each concrete deliver invocation; the declaration is an endpoint of that binding contract.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — deliver /inputs declares the required key envelope. A holds: this invocation or required-input endpoint participates in AP-02 argument-key/Inputs comparison, including matching keys.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — deliver.yaml#/inputs: The concrete run.delivery call supplies exactly {envelope}, matching deliver Inputs [envelope]; sealed is opaque.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 2e52133101ac058519a8aa51

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — deliver.yaml#/inputs: The routine Inputs list contains exactly envelope. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — deliver /inputs declares the required key envelope. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell cf440ff1717daba3ba33af52

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — deliver.yaml#/inputs: The routine Inputs list contains exactly envelope. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — deliver /inputs declares the required key envelope. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0e0de76a45b1ce5cc0a55a2d

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — deliver.yaml#/inputs: The routine Inputs list contains exactly envelope. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — deliver /inputs declares the required key envelope. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 85e68983cef9c8b0f9a7bf33

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — deliver.yaml#/inputs/0: The sole routine input entry is envelope. AP-02 contract (1) uses this exact Inputs list as the required key set for each concrete deliver invocation; the declaration is an endpoint of that binding contract.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The sole deliver input item is envelope. A holds: this invocation or required-input endpoint participates in AP-02 argument-key/Inputs comparison, including matching keys.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — deliver.yaml#/inputs/0: The concrete run.delivery call supplies exactly {envelope}, matching deliver Inputs [envelope]; sealed is opaque.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 8d0a1adc7b4ff87710b48af6

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — deliver.yaml#/inputs/0: The sole routine input entry is envelope. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The sole deliver input item is envelope. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell af24593c352cedfdf9a972fa

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — deliver.yaml#/inputs/0: The sole routine input entry is envelope. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The sole deliver input item is envelope. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0dfaae8a980c43d6afea14bc

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — deliver.yaml#/inputs/0: The sole routine input entry is envelope. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The sole deliver input item is envelope. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 1682a187cf7dd36419e2a143

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — deliver.yaml#/outputs: The routine Outputs section exports report through emit.report. AP-02 contract (2) applies to the emit.report export or this explicitly named producer/output endpoint. The entry requires resolution of emit and produce before comparing the exported output with the declared name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — deliver /outputs binds exported report to emit.report. A holds: AP-02 resolves emit -> produce and compares the exported output name with this producer/output endpoint, even when they match.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — deliver.yaml#/outputs: deliver exports report from emit.report; emit calls produce, whose Outputs declares report. The referenced producer output exists.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 8f64e24f8a4caa9482d28228

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — deliver.yaml#/outputs: The routine Outputs section exports report through emit.report. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — deliver /outputs binds exported report to emit.report. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell ab40e04b150dd3790c5764db

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — deliver.yaml#/outputs: The routine Outputs section exports report through emit.report. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — deliver /outputs binds exported report to emit.report. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7c49f2961aec4917ed955bd7

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — deliver.yaml#/outputs: The routine Outputs section exports report through emit.report. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — deliver /outputs binds exported report to emit.report. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 7f71a92e9f425b2094dec98d

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — deliver.yaml#/outputs/report: The exported routine report is bound to emit.report. AP-02 contract (2) applies to the emit.report export or this explicitly named producer/output endpoint. The entry requires resolution of emit and produce before comparing the exported output with the declared name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — deliver /outputs/report contains the emit.report binding. A holds: AP-02 resolves emit -> produce and compares the exported output name with this producer/output endpoint, even when they match.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — deliver.yaml#/outputs/report: deliver exports report from emit.report; emit calls produce, whose Outputs declares report. The referenced producer output exists.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 232c484eaf1003ef830d4ffa

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — deliver.yaml#/outputs/report: The exported routine report is bound to emit.report. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — deliver /outputs/report contains the emit.report binding. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 791a31ca8731b94c89d67e5c

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — deliver.yaml#/outputs/report: The exported routine report is bound to emit.report. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — deliver /outputs/report contains the emit.report binding. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell ad7314b738ea597d93ae3b23

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — deliver.yaml#/outputs/report: The exported routine report is bound to emit.report. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — deliver /outputs/report contains the emit.report binding. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 82c8e910cc4b4df96a89e369

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — deliver.yaml#/steps: The routine steps resolve emit to technique produce, whose declared output is report. AP-02 contract (2) applies to the emit.report export or this explicitly named producer/output endpoint. The entry requires resolution of emit and produce before comparing the exported output with the declared name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — deliver /steps resolves emit to produce. A holds: AP-02 resolves emit -> produce and compares the exported output name with this producer/output endpoint, even when they match.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — deliver.yaml#/steps: deliver exports report from emit.report; emit calls produce, whose Outputs declares report. The referenced producer output exists.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell cbb292d61ff63c7740d065be

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — deliver.yaml#/steps: The routine steps resolve emit to technique produce, whose declared output is report. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — deliver /steps resolves emit to produce. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 2228315b4ed81fce11373514

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — deliver.yaml#/steps: The routine steps resolve emit to technique produce, whose declared output is report. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — deliver /steps resolves emit to produce. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell f82d1cd9016de1cdd797e170

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — deliver.yaml#/steps: The routine steps resolve emit to technique produce, whose declared output is report. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — deliver /steps resolves emit to produce. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 790b168511688f3580f49f17

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — deliver.yaml#/steps/id=emit: The emit step calls produce, whose declared output is report. AP-02 contract (2) applies to the emit.report export or this explicitly named producer/output endpoint. The entry requires resolution of emit and produce before comparing the exported output with the declared name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The emit step calls produce. A holds: AP-02 resolves emit -> produce and compares the exported output name with this producer/output endpoint, even when they match.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — deliver.yaml#/steps/id=emit: deliver exports report from emit.report; emit calls produce, whose Outputs declares report. The referenced producer output exists.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell bbb0ef5214ae8bbcce715c65

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — deliver.yaml#/steps/id=emit: The emit step calls produce, whose declared output is report. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The emit step calls produce. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 2160f33c3a701883bf507397

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — deliver.yaml#/steps/id=emit: The emit step calls produce, whose declared output is report. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The emit step calls produce. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 569231fa0b1023abbf3fc5e4

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — deliver.yaml#/steps/id=emit: The emit step calls produce, whose declared output is report. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The emit step calls produce. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e6707d2a492bbb28eafc3a21

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — deliver.yaml#/steps/id=emit/id: The step identifier emit is the producer named by the routine output binding emit.report. AP-02 contract (2) applies to the emit.report export or this explicitly named producer/output endpoint. The entry requires resolution of emit and produce before comparing the exported output with the declared name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The producer step ID emit is named by emit.report. A holds: AP-02 resolves emit -> produce and compares the exported output name with this producer/output endpoint, even when they match.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — deliver.yaml#/steps/id=emit/id: deliver exports report from emit.report; emit calls produce, whose Outputs declares report. The referenced producer output exists.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 71fd5507f4b74e2ec91c2b3e

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — deliver.yaml#/steps/id=emit/id: The step identifier emit is the producer named by the routine output binding emit.report. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The producer step ID emit is named by emit.report. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b707f101a68f594abdbb9fc8

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — deliver.yaml#/steps/id=emit/id: The step identifier emit is the producer named by the routine output binding emit.report. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The producer step ID emit is named by emit.report. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7567be6ff4d583433092c972

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — deliver.yaml#/steps/id=emit/id: The step identifier emit is the producer named by the routine output binding emit.report. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The producer step ID emit is named by emit.report. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 387b3abcf94e6a19aabbf992

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — deliver.yaml#/steps/id=emit/technique: The technique reference produce resolves the producer whose Outputs heading declares report. AP-02 contract (2) applies to the emit.report export or this explicitly named producer/output endpoint. The entry requires resolution of emit and produce before comparing the exported output with the declared name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The emit technique reference selects produce. A holds: AP-02 resolves emit -> produce and compares the exported output name with this producer/output endpoint, even when they match.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — deliver.yaml#/steps/id=emit/technique: deliver exports report from emit.report; emit calls produce, whose Outputs declares report. The referenced producer output exists.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell f2a200e38a51bc411ee5e057

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — deliver.yaml#/steps/id=emit/technique: The technique reference produce resolves the producer whose Outputs heading declares report. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The emit technique reference selects produce. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell d5d35100c716e2ed184e7476

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — deliver.yaml#/steps/id=emit/technique: The technique reference produce resolves the producer whose Outputs heading declares report. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The emit technique reference selects produce. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 90bd5ed8d7c0859a6fbe41a1

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — deliver.yaml#/steps/id=emit/technique: The technique reference produce resolves the producer whose Outputs heading declares report. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The emit technique reference selects produce. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fa301823ccd44ed9374ce575

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — deliver.yaml#@element: The complete deliver routine declares input envelope, exports report through emit.report, and calls produce in emit. AP-02 contract (2) applies to the emit.report export or this explicitly named producer/output endpoint. The entry requires resolution of emit and produce before comparing the exported output with the declared name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The deliver element declares input envelope, export emit.report and producer emit. A holds: this routine or execution context contains AP-02 input and producer-output binding endpoints; both remain in scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — deliver.yaml#@element: The concrete run.delivery call supplies exactly {envelope}, matching deliver Inputs [envelope]; sealed is opaque. deliver exports report from emit.report; emit calls produce, whose Outputs declares report. The referenced producer output exists.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell 2ec151da2546cd9066780932

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — deliver.yaml#@element: The complete deliver routine declares input envelope, exports report through emit.report, and calls produce in emit. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The deliver element declares input envelope, export emit.report and producer emit. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 65dd3d64e8c54c7713685121

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — deliver.yaml#@element: The complete deliver routine declares input envelope, exports report through emit.report, and calls produce in emit. This activity or routine declaration has no leaf Destination. DP-01 excludes independent checks on such files; its rule is carried by the separately captured call and inheritance relationships to produce.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The deliver element declares input envelope, export emit.report and producer emit. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 19723157905da0f5874e77db

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — deliver.yaml#@element: The complete deliver routine declares input envelope, exports report through emit.report, and calls produce in emit. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The deliver element declares input envelope, export emit.report and producer emit. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b34f6249f0f9b31107491750

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — deliver.yaml#@relationship/3a2f0d25e0e017f7: The deliver-to-produce call resolves emit.report through emit; produce declares report and Destination archive. AP-02 contract (2) applies to the emit.report export or this explicitly named producer/output endpoint. The entry requires resolution of emit and produce before comparing the exported output with the declared name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The deliver-to-produce relationship resolves emit.report against output report. A holds: AP-02 resolves emit -> produce and compares the exported output name with this producer/output endpoint, even when they match.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — deliver.yaml#@relationship/3a2f0d25e0e017f7: deliver exports report from emit.report; emit calls produce, whose Outputs declares report. The referenced producer output exists.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell afeb129e1e03e4f353693950

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — deliver.yaml#@relationship/3a2f0d25e0e017f7: The deliver-to-produce call resolves emit.report through emit; produce declares report and Destination archive. This row represents a call or inheritance relationship, not the target leaf instruction. AP-01 excludes calls and bindings from constructs that themselves direct emission.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The deliver-to-produce relationship resolves emit.report against output report. N holds: AP-01 excludes calls and bindings; this relationship is not the target leaf emission instruction.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell eb3d9f625d45294630564c36

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — deliver.yaml#@relationship/3a2f0d25e0e017f7: The deliver-to-produce call resolves emit.report through emit; produce declares report and Destination archive. DP-01 expressly carries the inherited destination rule through call and inheritance relationships to this leaf instance. The captured qualification/run/deliver chain, ancestor requirement and leaf declaration establish that applicability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The deliver-to-produce relationship resolves emit.report against output report. A follows from the explicit call/inheritance chain carrying DP-01 to the executing leaf.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — deliver.yaml#@relationship/3a2f0d25e0e017f7: qualification executes run -> deliver -> produce under qualification/techniques/TECHNIQUE.md. The leaf Destination archive equals inherited required archive.

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

Applicability: N — deliver.yaml#@relationship/3a2f0d25e0e017f7: The deliver-to-produce call resolves emit.report through emit; produce declares report and Destination archive. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The deliver-to-produce relationship resolves emit.report against output report. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 8669d4026237cb94e83e2158

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — deliver.yaml#@relationship/50a64427faa3df96: The execution relationship carries qualification -> run#delivery -> deliver#emit -> produce, the envelope argument, export emit.report, and the ancestor archive destination. AP-02 applies to both binding contracts carried by this instantiated call chain: activity arguments against routine Inputs and emit.report against the resolved produce Outputs declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The execution relationship instantiates qualification/run/delivery/deliver/emit/produce. A holds: this routine or execution context contains AP-02 input and producer-output binding endpoints; both remain in scope.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — deliver.yaml#@relationship/50a64427faa3df96: The concrete run.delivery call supplies exactly {envelope}, matching deliver Inputs [envelope]; sealed is opaque. deliver exports report from emit.report; emit calls produce, whose Outputs declares report. The referenced producer output exists.

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

Applicability: N — deliver.yaml#@relationship/50a64427faa3df96: The execution relationship carries qualification -> run#delivery -> deliver#emit -> produce, the envelope argument, export emit.report, and the ancestor archive destination. This row represents a call or inheritance relationship, not the target leaf instruction. AP-01 excludes calls and bindings from constructs that themselves direct emission.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The execution relationship instantiates qualification/run/delivery/deliver/emit/produce. N holds: AP-01 excludes calls and bindings; this relationship is not the target leaf emission instruction.

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

Applicability: A — deliver.yaml#@relationship/50a64427faa3df96: The execution relationship carries qualification -> run#delivery -> deliver#emit -> produce, the envelope argument, export emit.report, and the ancestor archive destination. DP-01 expressly carries the inherited destination rule through call and inheritance relationships to this leaf instance. The captured qualification/run/deliver chain, ancestor requirement and leaf declaration establish that applicability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The execution relationship instantiates qualification/run/delivery/deliver/emit/produce. A follows from the explicit call/inheritance chain carrying DP-01 to the executing leaf.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — deliver.yaml#@relationship/50a64427faa3df96: qualification executes run -> deliver -> produce under qualification/techniques/TECHNIQUE.md. The leaf Destination archive equals inherited required archive.

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

Applicability: N — deliver.yaml#@relationship/50a64427faa3df96: The execution relationship carries qualification -> run#delivery -> deliver#emit -> produce, the envelope argument, export emit.report, and the ancestor archive destination. DP-02 is a whole-workflow graph invariant and expressly states that activity and routine steps do not add graph exits. This activity/routine row or execution relationship supplies no graph transition.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The execution relationship instantiates qualification/run/delivery/deliver/emit/produce. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

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

Applicability: N — TECHNIQUE.md#/capability: The ancestor Capability describes its service as Constrain inherited delivery. This ancestor capability/destination contract declares neither routine argument keys nor an exported step.output producer/output endpoint; neither AP-02 binding form occurs.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Ancestor /capability describes Constrain inherited delivery. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell d9eb0eb2cb8f9fb790e82eee

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — TECHNIQUE.md#/capability: The ancestor Capability describes its service as Constrain inherited delivery. AP-01 limits imperative checks to Protocol and Rules and expressly excludes Capability service descriptions.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Ancestor /capability describes Constrain inherited delivery. N holds: AP-01 explicitly distinguishes Capability service descriptions from imperative Protocol/Rules instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b6ad6f9e4c3bf6bcd7517234

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — TECHNIQUE.md#/capability: The ancestor Capability describes its service as Constrain inherited delivery. DP-01 expressly treats the ancestor constraint as a declaration, not a competing leaf destination; this ancestor has no leaf declaration to check independently.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Ancestor /capability describes Constrain inherited delivery. N holds: DP-01 treats this ancestor as inherited context, not a leaf destination to check independently.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0ed30157350f8c23d6297b75

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — TECHNIQUE.md#/capability: The ancestor Capability describes its service as Constrain inherited delivery. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Ancestor /capability describes Constrain inherited delivery. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell c9c06fb4ee9924c6c63c553f

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — TECHNIQUE.md#/capability/line-2: Constrain inherited delivery is the ancestor Capability description. This ancestor capability/destination contract declares neither routine argument keys nor an exported step.output producer/output endpoint; neither AP-02 binding form occurs.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The ancestor Capability paragraph describes inherited delivery. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 720f7eeadf6be862dd39b7ab

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — TECHNIQUE.md#/capability/line-2: Constrain inherited delivery is the ancestor Capability description. AP-01 limits imperative checks to Protocol and Rules and expressly excludes Capability service descriptions.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The ancestor Capability paragraph describes inherited delivery. N holds: AP-01 explicitly distinguishes Capability service descriptions from imperative Protocol/Rules instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 3dd8981b7cf70f3489f0cb9a

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — TECHNIQUE.md#/capability/line-2: Constrain inherited delivery is the ancestor Capability description. DP-01 expressly treats the ancestor constraint as a declaration, not a competing leaf destination; this ancestor has no leaf declaration to check independently.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The ancestor Capability paragraph describes inherited delivery. N holds: DP-01 treats this ancestor as inherited context, not a leaf destination to check independently.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 62d70a2ce5a077d8010ce9fe

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — TECHNIQUE.md#/capability/line-2: Constrain inherited delivery is the ancestor Capability description. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The ancestor Capability paragraph describes inherited delivery. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ac42c54bb5e18cc6005d1df7

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — TECHNIQUE.md#/rules: The ancestor TECHNIQUE Rules declare Destination must be archive. This ancestor capability/destination contract declares neither routine argument keys nor an exported step.output producer/output endpoint; neither AP-02 binding form occurs.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Ancestor /rules declares the required archive destination. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 541cffe238719bcc6a46fe77

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — TECHNIQUE.md#/rules: The ancestor TECHNIQUE Rules declare Destination must be archive. AP-01 requires an emission directive; this retention or destination declaration does not direct emission, as the criterion explicitly distinguishes.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Ancestor /rules declares the required archive destination. N holds: retention and destination declarations do not direct artifact emission under AP-01.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b3f616c2c1a987217e5cf61b

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — TECHNIQUE.md#/rules: The ancestor TECHNIQUE Rules declare Destination must be archive. DP-01 expressly treats the ancestor constraint as a declaration, not a competing leaf destination; this ancestor has no leaf declaration to check independently.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Ancestor /rules declares the required archive destination. N holds: DP-01 treats this ancestor as inherited context, not a leaf destination to check independently.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell d9b55f0b6cbe3ed6ab868ed5

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — TECHNIQUE.md#/rules: The ancestor TECHNIQUE Rules declare Destination must be archive. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Ancestor /rules declares the required archive destination. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell bfde9ab405ad9faa2bc4b5ac

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — TECHNIQUE.md#/rules/line-5: The ancestor destination constraint requires archive; it is not a leaf destination declaration. This ancestor capability/destination contract declares neither routine argument keys nor an exported step.output producer/output endpoint; neither AP-02 binding form occurs.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The ancestor line-5 rule requires archive. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 06d002e75cf36ea1b43c83b1

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — TECHNIQUE.md#/rules/line-5: The ancestor destination constraint requires archive; it is not a leaf destination declaration. AP-01 requires an emission directive; this retention or destination declaration does not direct emission, as the criterion explicitly distinguishes.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The ancestor line-5 rule requires archive. N holds: retention and destination declarations do not direct artifact emission under AP-01.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 67ae926240e520bfdb63b1a3

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — TECHNIQUE.md#/rules/line-5: The ancestor destination constraint requires archive; it is not a leaf destination declaration. DP-01 expressly treats the ancestor constraint as a declaration, not a competing leaf destination; this ancestor has no leaf declaration to check independently.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The ancestor line-5 rule requires archive. N holds: DP-01 treats this ancestor as inherited context, not a leaf destination to check independently.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 4da9396f20f50a18673256c5

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — TECHNIQUE.md#/rules/line-5: The ancestor destination constraint requires archive; it is not a leaf destination declaration. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The ancestor line-5 rule requires archive. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 4d029f4ed7a941dc5b13bafa

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — TECHNIQUE.md#@element: The complete ancestor declares its capability and the required archive destination, with no leaf destination or binding. This ancestor capability/destination contract declares neither routine argument keys nor an exported step.output producer/output endpoint; neither AP-02 binding form occurs.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The ancestor element contains Capability and its archive requirement. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 01bc60dde7d03c634b92d11c

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — TECHNIQUE.md#@element: The complete ancestor declares its capability and the required archive destination, with no leaf destination or binding. AP-01 requires an emission directive; this retention or destination declaration does not direct emission, as the criterion explicitly distinguishes.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The ancestor element contains Capability and its archive requirement. N holds: retention and destination declarations do not direct artifact emission under AP-01.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 69c0652ae2e85de91e1e5de4

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — TECHNIQUE.md#@element: The complete ancestor declares its capability and the required archive destination, with no leaf destination or binding. DP-01 expressly treats the ancestor constraint as a declaration, not a competing leaf destination; this ancestor has no leaf declaration to check independently.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The ancestor element contains Capability and its archive requirement. N holds: DP-01 treats this ancestor as inherited context, not a leaf destination to check independently.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 54a73e1bf111128988cf03fe

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — TECHNIQUE.md#@element: The complete ancestor declares its capability and the required archive destination, with no leaf destination or binding. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The ancestor element contains Capability and its archive requirement. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 4c3a69d6842d941bb1b4ae64

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — produce.md#/capability: The leaf Capability describes the service Produce a report. This Markdown service, instruction or rule is not a binding or an Outputs name declaration. AP-02 explicitly excludes artifact mentions from its two binding contracts.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Leaf /capability describes Produce a report. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell e192558242a4ed960c5d7a46

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — produce.md#/capability: The leaf Capability describes the service Produce a report. AP-01 limits imperative checks to Protocol and Rules and expressly excludes Capability service descriptions.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Leaf /capability describes Produce a report. N holds: AP-01 explicitly distinguishes Capability service descriptions from imperative Protocol/Rules instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 36ee15fe5284f5e03e6afdc4

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — produce.md#/capability: The leaf Capability describes the service Produce a report. This leaf row contains no Destination declaration or inheritance relationship. DP-01 reaches the separate line-12 destination and its containing rows, not this instruction, service description or output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Leaf /capability describes Produce a report. N holds: this construct contains neither a Destination declaration nor its inheritance relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 6eb38943804944cf6cfbb4ed

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — produce.md#/capability: The leaf Capability describes the service Produce a report. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Leaf /capability describes Produce a report. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 883f9febadc76de8d4b64dd6

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — produce.md#/capability/line-2: Produce a report is the Capability description, outside Protocol and Rules. This Markdown service, instruction or rule is not a binding or an Outputs name declaration. AP-02 explicitly excludes artifact mentions from its two binding contracts.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The leaf Capability paragraph describes producing a report. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell e3b51412d1cbb5b26dbb8664

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — produce.md#/capability/line-2: Produce a report is the Capability description, outside Protocol and Rules. AP-01 limits imperative checks to Protocol and Rules and expressly excludes Capability service descriptions.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The leaf Capability paragraph describes producing a report. N holds: AP-01 explicitly distinguishes Capability service descriptions from imperative Protocol/Rules instructions.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b82b83027689277cdcc2042f

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — produce.md#/capability/line-2: Produce a report is the Capability description, outside Protocol and Rules. This leaf row contains no Destination declaration or inheritance relationship. DP-01 reaches the separate line-12 destination and its containing rows, not this instruction, service description or output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The leaf Capability paragraph describes producing a report. N holds: this construct contains neither a Destination declaration nor its inheritance relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell dadf707dc4833496ce962762

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — produce.md#/capability/line-2: Produce a report is the Capability description, outside Protocol and Rules. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The leaf Capability paragraph describes producing a report. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell c986d23bf9fe92ac15ab723d

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — produce.md#/outputs: The leaf Outputs heading declares the name report, consumed by deliver export emit.report. AP-02 contract (2) applies to the emit.report export or this explicitly named producer/output endpoint. The entry requires resolution of emit and produce before comparing the exported output with the declared name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Leaf /outputs declares report; deliver binds emit.report. A holds: AP-02 resolves emit -> produce and compares the exported output name with this producer/output endpoint, even when they match.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — produce.md#/outputs: deliver exports report from emit.report; emit calls produce, whose Outputs declares report. The referenced producer output exists.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell e00abe344b2cf11c702b34f1

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — produce.md#/outputs: The leaf Outputs heading declares the name report, consumed by deliver export emit.report. AP-01 requires an emitting instruction; an output-name declaration is expressly not itself an emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Leaf /outputs declares report; deliver binds emit.report. N holds: an Outputs name declaration is not an emission instruction under AP-01.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b7876638c82ca7835e6ecd54

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — produce.md#/outputs: The leaf Outputs heading declares the name report, consumed by deliver export emit.report. This leaf row contains no Destination declaration or inheritance relationship. DP-01 reaches the separate line-12 destination and its containing rows, not this instruction, service description or output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Leaf /outputs declares report; deliver binds emit.report. N holds: this construct contains neither a Destination declaration nor its inheritance relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 9839de920cafa86c93f9e319

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — produce.md#/outputs: The leaf Outputs heading declares the name report, consumed by deliver export emit.report. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Leaf /outputs declares report; deliver binds emit.report. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 8835c0ddec51d397d30590e7

Row: corpus/qualification/techniques/produce.md#/outputs/report

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — produce.md#/outputs/report: The leaf output declaration is report; the routine export refers to emit.report. AP-02 contract (2) applies to the emit.report export or this explicitly named producer/output endpoint. The entry requires resolution of emit and produce before comparing the exported output with the declared name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Leaf /outputs/report declares report. A holds: AP-02 resolves emit -> produce and compares the exported output name with this producer/output endpoint, even when they match.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — produce.md#/outputs/report: deliver exports report from emit.report; emit calls produce, whose Outputs declares report. The referenced producer output exists.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell f0f7088daffd00158c0c1032

Row: corpus/qualification/techniques/produce.md#/outputs/report

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — produce.md#/outputs/report: The leaf output declaration is report; the routine export refers to emit.report. AP-01 requires an emitting instruction; an output-name declaration is expressly not itself an emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Leaf /outputs/report declares report. N holds: an Outputs name declaration is not an emission instruction under AP-01.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 52eadd327712a19ac6cca68e

Row: corpus/qualification/techniques/produce.md#/outputs/report

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — produce.md#/outputs/report: The leaf output declaration is report; the routine export refers to emit.report. This leaf row contains no Destination declaration or inheritance relationship. DP-01 reaches the separate line-12 destination and its containing rows, not this instruction, service description or output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Leaf /outputs/report declares report. N holds: this construct contains neither a Destination declaration nor its inheritance relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 16ed4220394232ac66e84453

Row: corpus/qualification/techniques/produce.md#/outputs/report

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — produce.md#/outputs/report: The leaf output declaration is report; the routine export refers to emit.report. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Leaf /outputs/report declares report. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 547682eae905cf61fddd33be

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — produce.md#/protocol: The leaf Protocol contains the instruction: Validate the report, then emit it. This Markdown service, instruction or rule is not a binding or an Outputs name declaration. AP-02 explicitly excludes artifact mentions from its two binding contracts.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Leaf /protocol contains: Validate the report, then emit it. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 668f2c03b5c1dfffd6143cc5

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — produce.md#/protocol: The leaf Protocol contains the instruction: Validate the report, then emit it. AP-01 applies to this emitting Protocol instruction or Rules clause, including its containing row. Requiring validation remains an applicable contract; it is not grounds for N.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Leaf /protocol contains: Validate the report, then emit it. A holds: emitting Protocol/Rules instructions and their containing rows are in AP-01 scope; validation affects the result, not applicability.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: pass — produce.md#/protocol: Protocol line 8 directs validation of the report before emitting that same report.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

## Cell 533e91f3401233d0974551eb

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — produce.md#/protocol: The leaf Protocol contains the instruction: Validate the report, then emit it. This leaf row contains no Destination declaration or inheritance relationship. DP-01 reaches the separate line-12 destination and its containing rows, not this instruction, service description or output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Leaf /protocol contains: Validate the report, then emit it. N holds: this construct contains neither a Destination declaration nor its inheritance relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell a700a3294be653eb8e533547

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — produce.md#/protocol: The leaf Protocol contains the instruction: Validate the report, then emit it. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Leaf /protocol contains: Validate the report, then emit it. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 0f13f165ba007a4540cef470

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — produce.md#/protocol/line-8: This Protocol instruction says: Validate the report, then emit it. This Markdown service, instruction or rule is not a binding or an Outputs name declaration. AP-02 explicitly excludes artifact mentions from its two binding contracts.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Protocol line 8 directs: Validate the report, then emit it. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 7f339716e8d7474fb2512654

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — produce.md#/protocol/line-8: This Protocol instruction says: Validate the report, then emit it. AP-01 applies to this emitting Protocol instruction or Rules clause, including its containing row. Requiring validation remains an applicable contract; it is not grounds for N.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Protocol line 8 directs: Validate the report, then emit it. A holds: emitting Protocol/Rules instructions and their containing rows are in AP-01 scope; validation affects the result, not applicability.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: pass — produce.md#/protocol/line-8: Protocol line 8 directs validation of the report before emitting that same report.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

## Cell fbafce4f79dd46979495549a

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — produce.md#/protocol/line-8: This Protocol instruction says: Validate the report, then emit it. This leaf row contains no Destination declaration or inheritance relationship. DP-01 reaches the separate line-12 destination and its containing rows, not this instruction, service description or output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Protocol line 8 directs: Validate the report, then emit it. N holds: this construct contains neither a Destination declaration nor its inheritance relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell cc4fea783a74407b8fdb654e

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — produce.md#/protocol/line-8: This Protocol instruction says: Validate the report, then emit it. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Protocol line 8 directs: Validate the report, then emit it. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell a30b577290e3406e29334f7b

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — produce.md#/rules: The leaf Rules retain the report ID, validate the report before each emission, and declare Destination archive. This Markdown service, instruction or rule is not a binding or an Outputs name declaration. AP-02 explicitly excludes artifact mentions from its two binding contracts.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Leaf /rules contains the emission clause and Destination archive. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell d10a33e1908da3335366adaa

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — produce.md#/rules: The leaf Rules retain the report ID, validate the report before each emission, and declare Destination archive. AP-01 applies to this emitting Protocol instruction or Rules clause, including its containing row. Requiring validation remains an applicable contract; it is not grounds for N.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Leaf /rules contains the emission clause and Destination archive. A holds: emitting Protocol/Rules instructions and their containing rows are in AP-01 scope; validation affects the result, not applicability.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: pass — produce.md#/rules: Rules line 11 clause 2 requires validation of the report before each emission; clause 1 only retains its ID.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

## Cell 381dd396d48f156e5b5332ba

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — produce.md#/rules: The leaf Rules retain the report ID, validate the report before each emission, and declare Destination archive. DP-01 applies because this leaf row contains its Destination declaration. The qualification/run/deliver call chain selects the ancestor archive requirement; the declared values require comparison during evaluation.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Leaf /rules contains the emission clause and Destination archive. A follows from the leaf Destination declaration; compare it with the executing qualification ancestor requirement.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — produce.md#/rules: qualification executes run -> deliver -> produce under qualification/techniques/TECHNIQUE.md. The leaf Destination archive equals inherited required archive.

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

Applicability: N — produce.md#/rules: The leaf Rules retain the report ID, validate the report before each emission, and declare Destination archive. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Leaf /rules contains the emission clause and Destination archive. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 6dff2018269cdd7f6ce3a242

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — produce.md#/rules/line-11: The compound rule retains the report ID in its first clause and says to validate the report before each emission in its second. This Markdown service, instruction or rule is not a binding or an Outputs name declaration. AP-02 explicitly excludes artifact mentions from its two binding contracts.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Rule line 11 combines retention with: validate the report before each emission. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell a3b7b46de80a7e60f06f33aa

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — produce.md#/rules/line-11: The compound rule retains the report ID in its first clause and says to validate the report before each emission in its second. AP-01 applies to this emitting Protocol instruction or Rules clause, including its containing row. Requiring validation remains an applicable contract; it is not grounds for N.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Rule line 11 combines retention with: validate the report before each emission. A holds: emitting Protocol/Rules instructions and their containing rows are in AP-01 scope; validation affects the result, not applicability.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: pass — produce.md#/rules/line-11: Rules line 11 clause 2 requires validation of the report before each emission; clause 1 only retains its ID.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

## Cell 69a9fd68e24025b700e9bbb1

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — produce.md#/rules/line-11: The compound rule retains the report ID in its first clause and says to validate the report before each emission in its second. This leaf row contains no Destination declaration or inheritance relationship. DP-01 reaches the separate line-12 destination and its containing rows, not this instruction, service description or output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Rule line 11 combines retention with: validate the report before each emission. N holds: this construct contains neither a Destination declaration nor its inheritance relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell d4d45cf60920c4360e003cf1

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — produce.md#/rules/line-11: The compound rule retains the report ID in its first clause and says to validate the report before each emission in its second. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Rule line 11 combines retention with: validate the report before each emission. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 923c5917ea2c9d4abe29e519

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — produce.md#/rules/line-11/clause-1: Only the first semicolon-separated clause is this row: Retain the report ID. This Markdown service, instruction or rule is not a binding or an Outputs name declaration. AP-02 explicitly excludes artifact mentions from its two binding contracts.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Only clause 1 is owned here: Retain the report ID. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 2f83f57df858c2cf145efffc

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — produce.md#/rules/line-11/clause-1: Only the first semicolon-separated clause is this row: Retain the report ID. AP-01 requires an emission directive; this retention or destination declaration does not direct emission, as the criterion explicitly distinguishes.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Only clause 1 is owned here: Retain the report ID. N holds: retention and destination declarations do not direct artifact emission under AP-01.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9e2179b4c1fbfc73dc6b4981

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — produce.md#/rules/line-11/clause-1: Only the first semicolon-separated clause is this row: Retain the report ID. This leaf row contains no Destination declaration or inheritance relationship. DP-01 reaches the separate line-12 destination and its containing rows, not this instruction, service description or output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Only clause 1 is owned here: Retain the report ID. N holds: this construct contains neither a Destination declaration nor its inheritance relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b1c897ef75ecfb0802a40206

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — produce.md#/rules/line-11/clause-1: Only the first semicolon-separated clause is this row: Retain the report ID. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Only clause 1 is owned here: Retain the report ID. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell a03eed5b1543ec6c3d53b66c

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — produce.md#/rules/line-11/clause-2: Only the second semicolon-separated clause is this row: validate the report before each emission. This Markdown service, instruction or rule is not a binding or an Outputs name declaration. AP-02 explicitly excludes artifact mentions from its two binding contracts.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Only clause 2 is owned here: validate the report before each emission. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 1fff788717e68470ea335f4a

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — produce.md#/rules/line-11/clause-2: Only the second semicolon-separated clause is this row: validate the report before each emission. AP-01 applies to this emitting Protocol instruction or Rules clause, including its containing row. Requiring validation remains an applicable contract; it is not grounds for N.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Only clause 2 is owned here: validate the report before each emission. A holds: emitting Protocol/Rules instructions and their containing rows are in AP-01 scope; validation affects the result, not applicability.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: pass — produce.md#/rules/line-11/clause-2: Rules line 11 clause 2 requires validation of the report before each emission; clause 1 only retains its ID.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

## Cell acca57d9a610cd2900940f11

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — produce.md#/rules/line-11/clause-2: Only the second semicolon-separated clause is this row: validate the report before each emission. This leaf row contains no Destination declaration or inheritance relationship. DP-01 reaches the separate line-12 destination and its containing rows, not this instruction, service description or output name.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Only clause 2 is owned here: validate the report before each emission. N holds: this construct contains neither a Destination declaration nor its inheritance relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b192bf0ffab5454aaf50901a

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — produce.md#/rules/line-11/clause-2: Only the second semicolon-separated clause is this row: validate the report before each emission. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Only clause 2 is owned here: validate the report before each emission. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 185e903ef3c4ae26da231a32

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — produce.md#/rules/line-12: The leaf declaration says Destination is archive. This Markdown service, instruction or rule is not a binding or an Outputs name declaration. AP-02 explicitly excludes artifact mentions from its two binding contracts.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Leaf rule line 12 declares Destination archive. N holds: this service, instruction or destination/retention rule is neither an AP-02 binding nor an Outputs name declaration.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 9d43a5459db3bcbd7c1b6759

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — produce.md#/rules/line-12: The leaf declaration says Destination is archive. AP-01 requires an emission directive; this retention or destination declaration does not direct emission, as the criterion explicitly distinguishes.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Leaf rule line 12 declares Destination archive. N holds: retention and destination declarations do not direct artifact emission under AP-01.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 355ce3ec841005b898e3d8d3

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — produce.md#/rules/line-12: The leaf declaration says Destination is archive. DP-01 applies because this leaf row contains its Destination declaration. The qualification/run/deliver call chain selects the ancestor archive requirement; the declared values require comparison during evaluation.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Leaf rule line 12 declares Destination archive. A follows from the leaf Destination declaration; compare it with the executing qualification ancestor requirement.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — produce.md#/rules/line-12: qualification executes run -> deliver -> produce under qualification/techniques/TECHNIQUE.md. The leaf Destination archive equals inherited required archive.

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

Applicability: N — produce.md#/rules/line-12: The leaf declaration says Destination is archive. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Leaf rule line 12 declares Destination archive. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ca1e1515076ec0147e7b8338

Row: corpus/qualification/techniques/produce.md#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — produce.md#@element: The complete leaf declares output report, instruction Validate the report, then emit it, a separate emission Rules clause, and Destination archive. AP-02 contract (2) applies to the emit.report export or this explicitly named producer/output endpoint. The entry requires resolution of emit and produce before comparing the exported output with the declared name.

Agent: /root/qualify_audit_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The produce element declares output report, emitting instructions and Destination archive. A holds: AP-02 resolves emit -> produce and compares the exported output name with this producer/output endpoint, even when they match.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: pass — produce.md#@element: deliver exports report from emit.report; emit calls produce, whose Outputs declares report. The referenced producer output exists.

Agent: /root/qualify_audit_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

## Cell d074a916d8f80c61b3aa18a0

Row: corpus/qualification/techniques/produce.md#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — produce.md#@element: The complete leaf declares output report, instruction Validate the report, then emit it, a separate emission Rules clause, and Destination archive. AP-01 applies to this emitting Protocol instruction or Rules clause, including its containing row. Requiring validation remains an applicable contract; it is not grounds for N.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The produce element declares output report, emitting instructions and Destination archive. A holds: emitting Protocol/Rules instructions and their containing rows are in AP-01 scope; validation affects the result, not applicability.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: pass — produce.md#@element: Protocol line 8 directs validation of the report before emitting that same report. Rules line 11 clause 2 requires validation of the report before each emission; clause 1 only retains its ID.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

## Cell a406c04573c91f8ad82577e3

Row: corpus/qualification/techniques/produce.md#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — produce.md#@element: The complete leaf declares output report, instruction Validate the report, then emit it, a separate emission Rules clause, and Destination archive. DP-01 applies because this leaf row contains its Destination declaration. The qualification/run/deliver call chain selects the ancestor archive requirement; the declared values require comparison during evaluation.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The produce element declares output report, emitting instructions and Destination archive. A follows from the leaf Destination declaration; compare it with the executing qualification ancestor requirement.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — produce.md#@element: qualification executes run -> deliver -> produce under qualification/techniques/TECHNIQUE.md. The leaf Destination archive equals inherited required archive.

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

Applicability: N — produce.md#@element: The complete leaf declares output report, instruction Validate the report, then emit it, a separate emission Rules clause, and Destination archive. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The produce element declares output report, emitting instructions and Destination archive. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fa0e42c99b24fa8b70e1b4c5

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — produce.md#@relationship/f075d23fadb959c8: The inheritance relationship connects produce Destination archive to its executing workflow ancestor requirement archive. This relationship carries destination inheritance, not an activity argument contract or exported routine-output binding. The leaf output contract belongs to its separate declaration and producer-call rows.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The inheritance relationship links produce Destination archive to ancestor archive. N holds: this relationship carries destination inheritance, neither AP-02 argument keys nor a routine step.output binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 8ab5a44208c83cc6801721f8

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — produce.md#@relationship/f075d23fadb959c8: The inheritance relationship connects produce Destination archive to its executing workflow ancestor requirement archive. This row represents a call or inheritance relationship, not the target leaf instruction. AP-01 excludes calls and bindings from constructs that themselves direct emission.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The inheritance relationship links produce Destination archive to ancestor archive. N holds: AP-01 excludes calls and bindings; this relationship is not the target leaf emission instruction.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 8bfa310664405693e5cee00b

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — produce.md#@relationship/f075d23fadb959c8: The inheritance relationship connects produce Destination archive to its executing workflow ancestor requirement archive. DP-01 expressly carries the inherited destination rule through call and inheritance relationships to this leaf instance. The captured qualification/run/deliver chain, ancestor requirement and leaf declaration establish that applicability.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The inheritance relationship links produce Destination archive to ancestor archive. A follows from the explicit call/inheritance chain carrying DP-01 to the executing leaf.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — produce.md#@relationship/f075d23fadb959c8: qualification executes run -> deliver -> produce under qualification/techniques/TECHNIQUE.md. The leaf Destination archive equals inherited required archive.

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

Applicability: N — produce.md#@relationship/f075d23fadb959c8: The inheritance relationship connects produce Destination archive to its executing workflow ancestor requirement archive. DP-02 is restricted to the workflow initialActivity and graph. This technique contract or instruction defines no workflow node or exit.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The inheritance relationship links produce Destination archive to ancestor archive. N holds: DP-02 concerns the workflow initialActivity and graph; this declaration or call supplies no graph exit.

Agent: /root/qualify_audit_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e3964a7ca7f68e7c40793e11

Row: corpus/qualification/workflow.yaml#/graph

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — workflow.yaml#/graph: The graph contains run with the done exit directed to null. A workflow graph node, exit or activity reference is neither a routine invocation argument contract nor a routine step.output export, the two AP-02 scopes.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The workflow graph contains run.done pointing to null. N holds: workflow graph/activity references are outside both AP-02 routine argument and step.output binding forms.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 343988e91c335d3bdef76586

Row: corpus/qualification/workflow.yaml#/graph

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — workflow.yaml#/graph: The graph contains run with the done exit directed to null. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The workflow graph contains run.done pointing to null. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 67bbb2cf737f1d39490640e1

Row: corpus/qualification/workflow.yaml#/graph

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — workflow.yaml#/graph: The graph contains run with the done exit directed to null. This workflow identity or graph row has no leaf Destination declaration. Its activity graph connection is not the leaf call or inheritance contract; DP-01 excludes independent checks on files without a leaf declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The workflow graph contains run.done pointing to null. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 094759e3ffb8236db086b566

Row: corpus/qualification/workflow.yaml#/graph

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — workflow.yaml#/graph: The graph contains run with the done exit directed to null. DP-02 applies to the workflow root/graph construct represented here. The complete initialActivity and graph must be assessed together for a finite path; resolving the activity name alone does not settle that invariant.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The workflow graph contains run.done pointing to null. A holds: DP-02 requires this initialActivity/graph construct to be assessed with the complete reachable graph for a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — workflow.yaml#/graph: The entire workflow starts at run; the sole graph exit run.done leads to null. This is a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell fc47360bf214ca94a9c2f752

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — workflow.yaml#/graph/run: The run graph entry has one done exit directed to null. A workflow graph node, exit or activity reference is neither a routine invocation argument contract nor a routine step.output export, the two AP-02 scopes.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The run graph entry has the single done exit to null. N holds: workflow graph/activity references are outside both AP-02 routine argument and step.output binding forms.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell cc39f8b8ebb2b96169d05005

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — workflow.yaml#/graph/run: The run graph entry has one done exit directed to null. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The run graph entry has the single done exit to null. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9aa00375bff5d32993c718d0

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — workflow.yaml#/graph/run: The run graph entry has one done exit directed to null. This workflow identity or graph row has no leaf Destination declaration. Its activity graph connection is not the leaf call or inheritance contract; DP-01 excludes independent checks on files without a leaf declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The run graph entry has the single done exit to null. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 9a13e148e0a434d148bef242

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — workflow.yaml#/graph/run: The run graph entry has one done exit directed to null. DP-02 applies to the workflow root/graph construct represented here. The complete initialActivity and graph must be assessed together for a finite path; resolving the activity name alone does not settle that invariant.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The run graph entry has the single done exit to null. A holds: DP-02 requires this initialActivity/graph construct to be assessed with the complete reachable graph for a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — workflow.yaml#/graph/run: The entire workflow starts at run; the sole graph exit run.done leads to null. This is a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell e8a18028e34e1ace5d01fcf3

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — workflow.yaml#/graph/run/done: The done exit value is null in the run graph node. A workflow graph node, exit or activity reference is neither a routine invocation argument contract nor a routine step.output export, the two AP-02 scopes.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The run.done graph exit points to null. N holds: workflow graph/activity references are outside both AP-02 routine argument and step.output binding forms.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell b1f517596f87f82a15830709

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — workflow.yaml#/graph/run/done: The done exit value is null in the run graph node. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The run.done graph exit points to null. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 46e28f2007abc40979497fc9

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — workflow.yaml#/graph/run/done: The done exit value is null in the run graph node. This workflow identity or graph row has no leaf Destination declaration. Its activity graph connection is not the leaf call or inheritance contract; DP-01 excludes independent checks on files without a leaf declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The run.done graph exit points to null. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell e0fcd50974c10678a3e2fb44

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — workflow.yaml#/graph/run/done: The done exit value is null in the run graph node. DP-02 applies to the workflow root/graph construct represented here. The complete initialActivity and graph must be assessed together for a finite path; resolving the activity name alone does not settle that invariant.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The run.done graph exit points to null. A holds: DP-02 requires this initialActivity/graph construct to be assessed with the complete reachable graph for a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — workflow.yaml#/graph/run/done: The entire workflow starts at run; the sole graph exit run.done leads to null. This is a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell a1bbb96005ca910edd02b943

Row: corpus/qualification/workflow.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — workflow.yaml#/id: The workflow declaration identifier is qualification. This declaration or activity-step identifier is not an invocation argument key, routine input, exported step.output binding or its referenced producer step. Neither AP-02 binding contract is present in this row.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — workflow /id names qualification. N holds: workflow graph/activity references are outside both AP-02 routine argument and step.output binding forms.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell ca0a66d25c90e652baa92f28

Row: corpus/qualification/workflow.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — workflow.yaml#/id: The workflow declaration identifier is qualification. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — workflow /id names qualification. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9fff88eaae065adb66759e66

Row: corpus/qualification/workflow.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — workflow.yaml#/id: The workflow declaration identifier is qualification. This workflow identity or graph row has no leaf Destination declaration. Its activity graph connection is not the leaf call or inheritance contract; DP-01 excludes independent checks on files without a leaf declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — workflow /id names qualification. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b70cd0fa3dc717cd87f806e4

Row: corpus/qualification/workflow.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — workflow.yaml#/id: The workflow declaration identifier is qualification. This scalar only names the workflow; it is neither its initialActivity nor a graph edge. DP-02 is a whole-workflow reachability invariant, not an identifier equality check.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — workflow /id names qualification. N holds: a workflow identifier supplies neither the initial activity nor a graph transition; DP-02 is a reachability invariant.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b93fc9705f0d802bdff5440b

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — workflow.yaml#/initialActivity: The workflow initialActivity is run and its graph supplies run.done -> null. A workflow graph node, exit or activity reference is neither a routine invocation argument contract nor a routine step.output export, the two AP-02 scopes.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — initialActivity selects run; its done exit points to null. N holds: workflow graph/activity references are outside both AP-02 routine argument and step.output binding forms.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 3641b7b9d54d55df0cc22cb1

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — workflow.yaml#/initialActivity: The workflow initialActivity is run and its graph supplies run.done -> null. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — initialActivity selects run; its done exit points to null. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 665c1a7ad6f6a7650e3f374a

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — workflow.yaml#/initialActivity: The workflow initialActivity is run and its graph supplies run.done -> null. This workflow identity or graph row has no leaf Destination declaration. Its activity graph connection is not the leaf call or inheritance contract; DP-01 excludes independent checks on files without a leaf declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — initialActivity selects run; its done exit points to null. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell c7fdcca69a6f6d3b3cfa7009

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — workflow.yaml#/initialActivity: The workflow initialActivity is run and its graph supplies run.done -> null. DP-02 applies to the workflow root/graph construct represented here. The complete initialActivity and graph must be assessed together for a finite path; resolving the activity name alone does not settle that invariant.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — initialActivity selects run; its done exit points to null. A holds: DP-02 requires this initialActivity/graph construct to be assessed with the complete reachable graph for a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — workflow.yaml#/initialActivity: The entire workflow starts at run; the sole graph exit run.done leads to null. This is a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell ce1c6885d9fe828ffb2d4802

Row: corpus/qualification/workflow.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — workflow.yaml#@element: The complete qualification workflow starts at run and has the sole graph exit run.done -> null. A workflow graph node, exit or activity reference is neither a routine invocation argument contract nor a routine step.output export, the two AP-02 scopes.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The qualification workflow starts at run and has only run.done -> null. N holds: workflow graph/activity references are outside both AP-02 routine argument and step.output binding forms.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 5551fe05b667e60209399004

Row: corpus/qualification/workflow.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — workflow.yaml#@element: The complete qualification workflow starts at run and has the sole graph exit run.done -> null. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The qualification workflow starts at run and has only run.done -> null. N holds: AP-01 addresses technique Protocol/Rules instructions, not this YAML identifier, orchestration or binding.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 263ad09bd2d440e2a894ee63

Row: corpus/qualification/workflow.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — workflow.yaml#@element: The complete qualification workflow starts at run and has the sole graph exit run.done -> null. This workflow identity or graph row has no leaf Destination declaration. Its activity graph connection is not the leaf call or inheritance contract; DP-01 excludes independent checks on files without a leaf declaration.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The qualification workflow starts at run and has only run.done -> null. N holds: DP-01 excludes independent file checks without a leaf Destination; this row is a declaration, not the captured relationship.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell e5c1842a573eccbf8d7d7e60

Row: corpus/qualification/workflow.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — workflow.yaml#@element: The complete qualification workflow starts at run and has the sole graph exit run.done -> null. DP-02 applies to the workflow root/graph construct represented here. The complete initialActivity and graph must be assessed together for a finite path; resolving the activity name alone does not settle that invariant.

Agent: /root/qualify_audit_two

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The qualification workflow starts at run and has only run.done -> null. A holds: DP-02 requires this initialActivity/graph construct to be assessed with the complete reachable graph for a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — workflow.yaml#@element: The entire workflow starts at run; the sole graph exit run.done leads to null. This is a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell 94b820a882f196103f835741

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — workflow.yaml#@relationship/3b27fd01db44f877: The initialActivity relationship connects qualification to run; the activity invokes deliver. A workflow graph node, exit or activity reference is neither a routine invocation argument contract nor a routine step.output export, the two AP-02 scopes.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The initialActivity relationship selects run in qualification. N holds: workflow graph/activity references are outside both AP-02 routine argument and step.output binding forms.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell f30ba6f42d4230bf27814f3a

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — workflow.yaml#@relationship/3b27fd01db44f877: The initialActivity relationship connects qualification to run; the activity invokes deliver. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The initialActivity relationship selects run in qualification. N holds: AP-01 excludes calls and bindings; this relationship is not the target leaf emission instruction.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 21f9cfbf2718ad51d2976c98

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — Each assigned relationship selects or re-enters run in executing workflow qualification. Its delivery call invokes deliver, whose emit step calls produce under the captured ancestor contract. DP1 explicitly carries the inherited constraint through those call relationships to the leaf instance. The no-leaf-declaration exclusion concerns independent file checks; it does not exclude these concrete executing-chain relationships.

Agent: /root

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — initialActivity selects run in qualification. The captured run invokes deliver, whose emit calls produce under ancestor archive. The revised A reason correctly applies DP-01 to this executing relationship; absence of a leaf declaration in the workflow excludes only an independent file check. Full-chain citations support the reason.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — workflow.yaml#@relationship/3b27fd01db44f877: qualification executes run -> deliver -> produce under qualification/techniques/TECHNIQUE.md. The leaf Destination archive equals inherited required archive.

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

Applicability: A — workflow.yaml#@relationship/3b27fd01db44f877: The initialActivity relationship connects qualification to run; the activity invokes deliver. DP-02 applies to the workflow root/graph construct represented here. The complete initialActivity and graph must be assessed together for a finite path; resolving the activity name alone does not settle that invariant.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The initialActivity relationship selects run in qualification. A holds: DP-02 requires this initialActivity/graph construct to be assessed with the complete reachable graph for a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — workflow.yaml#@relationship/3b27fd01db44f877: The entire workflow starts at run; the sole graph exit run.done leads to null. This is a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell 8020bba4283a65b31df0f113

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — workflow.yaml#@relationship/475a98faaf5b9a55: The graph-entry relationship connects the run graph node to the run activity. A workflow graph node, exit or activity reference is neither a routine invocation argument contract nor a routine step.output export, the two AP-02 scopes.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The graph-entry relationship binds qualification graph node run to the run activity. N holds: workflow graph/activity references are outside both AP-02 routine argument and step.output binding forms.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell ca06cc90126da20e026a0486

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — workflow.yaml#@relationship/475a98faaf5b9a55: The graph-entry relationship connects the run graph node to the run activity. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The graph-entry relationship binds qualification graph node run to the run activity. N holds: AP-01 excludes calls and bindings; this relationship is not the target leaf emission instruction.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 32efcf3836cf4d26fc113577

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — Each assigned relationship selects or re-enters run in executing workflow qualification. Its delivery call invokes deliver, whose emit step calls produce under the captured ancestor contract. DP1 explicitly carries the inherited constraint through those call relationships to the leaf instance. The no-leaf-declaration exclusion concerns independent file checks; it does not exclude these concrete executing-chain relationships.

Agent: /root

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — The qualification graph-entry relationship binds node run to the run activity. The captured run invokes deliver, whose emit calls produce under ancestor archive. The revised A reason correctly applies DP-01 to this executing relationship; absence of a leaf declaration in the workflow excludes only an independent file check. Full-chain citations support the reason.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — workflow.yaml#@relationship/475a98faaf5b9a55: qualification executes run -> deliver -> produce under qualification/techniques/TECHNIQUE.md. The leaf Destination archive equals inherited required archive.

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

Applicability: A — workflow.yaml#@relationship/475a98faaf5b9a55: The graph-entry relationship connects the run graph node to the run activity. DP-02 applies to the workflow root/graph construct represented here. The complete initialActivity and graph must be assessed together for a finite path; resolving the activity name alone does not settle that invariant.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The graph-entry relationship binds qualification graph node run to the run activity. A holds: DP-02 requires this initialActivity/graph construct to be assessed with the complete reachable graph for a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — workflow.yaml#@relationship/475a98faaf5b9a55: The entire workflow starts at run; the sole graph exit run.done leads to null. This is a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

## Cell f0755acc68e9a62e580665a3

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — workflow.yaml#@relationship/aa4b84de66a9776b: This graph-entry relationship is attached to run.done, whose destination is null. A workflow graph node, exit or activity reference is neither a routine invocation argument contract nor a routine step.output export, the two AP-02 scopes.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — The graph-entry relationship at run.done identifies the executing run activity. N holds: workflow graph/activity references are outside both AP-02 routine argument and step.output binding forms.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 96797ae8488cf51f8878572b

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — workflow.yaml#@relationship/aa4b84de66a9776b: This graph-entry relationship is attached to run.done, whose destination is null. AP-01 is scoped to technique Protocol instructions and Rules clauses. This YAML orchestration, identifier or binding is outside that instruction scope; it supplies no emission directive.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The graph-entry relationship at run.done identifies the executing run activity. N holds: AP-01 excludes calls and bindings; this relationship is not the target leaf emission instruction.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell dafc343685f5a84041beee97

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — Each assigned relationship selects or re-enters run in executing workflow qualification. Its delivery call invokes deliver, whose emit step calls produce under the captured ancestor contract. DP1 explicitly carries the inherited constraint through those call relationships to the leaf instance. The no-leaf-declaration exclusion concerns independent file checks; it does not exclude these concrete executing-chain relationships.

Agent: /root

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–11
- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5

Verification: verified — The graph-entry relationship at run.done identifies its executing run activity. The captured run invokes deliver, whose emit calls produce under ancestor archive. The revised A reason correctly applies DP-01 to this executing relationship; absence of a leaf declaration in the workflow excludes only an independent file check. Full-chain citations support the reason.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: pass — workflow.yaml#@relationship/aa4b84de66a9776b: qualification executes run -> deliver -> produce under qualification/techniques/TECHNIQUE.md. The leaf Destination archive equals inherited required archive.

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

Applicability: A — workflow.yaml#@relationship/aa4b84de66a9776b: This graph-entry relationship is attached to run.done, whose destination is null. DP-02 applies to the workflow root/graph construct represented here. The complete initialActivity and graph must be assessed together for a finite path; resolving the activity name alone does not settle that invariant.

Agent: /root/qualify_audit_two

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — The graph-entry relationship at run.done identifies the executing run activity. A holds: DP-02 requires this initialActivity/graph construct to be assessed with the complete reachable graph for a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: pass — workflow.yaml#@relationship/aa4b84de66a9776b: The entire workflow starts at run; the sole graph exit run.done leads to null. This is a finite terminating path.

Agent: /root/qualify_audit_one

- [corpus/qualification/activities/run.yaml](sources/21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
