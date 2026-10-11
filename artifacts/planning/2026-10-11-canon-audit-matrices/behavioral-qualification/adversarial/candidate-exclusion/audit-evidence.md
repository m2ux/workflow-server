# Audit Evidence

Snapshot: a345f72e4b37abff362d4617e28438aea150597c06a720247659141069d2aa2d

## Cell 588e9afc6de79e4e15622316

Row: corpus/qualification/activities/run.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–1
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 0782b255d289b2d8aaa260a8

Row: corpus/qualification/activities/run.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–1
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a93639cc3c5c1ad866587c2e

Row: corpus/qualification/activities/run.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–1
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7d5cdef67a14fe0a0e70a8ff

Row: corpus/qualification/activities/run.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–1
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fc60645fdab03b4f360b972e

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 checks each concrete routine invocation. This row contains or selects delivery calling deliver, including the argument-key side of the contract with deliver Inputs [envelope]. Row: /steps.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 3–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains or selects the concrete delivery invocation of deliver. The supplied key is packet and the routine Inputs list declares envelope. AP2 requires this exact argument-key comparison for every invocation; success or mismatch belongs to evaluation. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 input contract fails: activity line 6 supplies the sole key packet, while routine line 2 requires the sole input envelope. The sets differ and no aliases or optional parameters exist. The opaque value sealed is not a defect. This is one broken invocation, Live/Critical because its binding is structurally broken; origin diff follows the touched activity. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 69bbe5f010e4e9c6cc42b36b

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /steps.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 3–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 330d9855c61f1fa6db1e92b2

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /steps.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 3–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell ec7e3577667dbf0846b7b09f

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /steps.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 3–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ece85719689c1a3411d52a12

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 checks each concrete routine invocation. This row contains or selects delivery calling deliver, including the argument-key side of the contract with deliver Inputs [envelope]. Row: /steps/id=delivery.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 3–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains or selects the concrete delivery invocation of deliver. The supplied key is packet and the routine Inputs list declares envelope. AP2 requires this exact argument-key comparison for every invocation; success or mismatch belongs to evaluation. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 input contract fails: activity line 6 supplies the sole key packet, while routine line 2 requires the sole input envelope. The sets differ and no aliases or optional parameters exist. The opaque value sealed is not a defect. This is one broken invocation, Live/Critical because its binding is structurally broken; origin diff follows the touched activity. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 4c9b9e3283acb76acd0c593c

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /steps/id=delivery.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 3–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a5b35e7460c5ba032ea3ab9c

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /steps/id=delivery.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 3–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell eaf04cb03551645c38d72842

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /steps/id=delivery.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 3–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 03b141fa3c167d6b5347f32a

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /steps/id=delivery/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 3–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell eb0acb5f69509bc093ccb4c4

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /steps/id=delivery/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 3–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a09b4b5068e60047e85b9d20

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /steps/id=delivery/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 3–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 51923b360aa3ef1a7585fbf4

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /steps/id=delivery/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 3–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 366a1ced08e276234b09d365

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 checks each concrete routine invocation. This row contains or selects delivery calling deliver, including the argument-key side of the contract with deliver Inputs [envelope]. Row: /steps/id=delivery/routine.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains or selects the concrete delivery invocation of deliver. The supplied key is packet and the routine Inputs list declares envelope. AP2 requires this exact argument-key comparison for every invocation; success or mismatch belongs to evaluation. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 input contract fails: activity line 6 supplies the sole key packet, while routine line 2 requires the sole input envelope. The sets differ and no aliases or optional parameters exist. The opaque value sealed is not a defect. This is one broken invocation, Live/Critical because its binding is structurally broken; origin diff follows the touched activity. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 8f71acc678543f1dedd6da64

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /steps/id=delivery/routine.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 4e129aea04e56ac3f5e18eac

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /steps/id=delivery/routine.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7fa24663abc3348858407cd5

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /steps/id=delivery/routine.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e4e1d36386ad37dc4007d953

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 checks each concrete routine invocation. This row contains or selects delivery calling deliver, including the argument-key side of the contract with deliver Inputs [envelope]. Row: /steps/id=delivery/routine/arguments.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 6–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains or selects the concrete delivery invocation of deliver. The supplied key is packet and the routine Inputs list declares envelope. AP2 requires this exact argument-key comparison for every invocation; success or mismatch belongs to evaluation. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 input contract fails: activity line 6 supplies the sole key packet, while routine line 2 requires the sole input envelope. The sets differ and no aliases or optional parameters exist. The opaque value sealed is not a defect. This is one broken invocation, Live/Critical because its binding is structurally broken; origin diff follows the touched activity. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 85d58778322169b7eb358fb2

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /steps/id=delivery/routine/arguments.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 6–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 235d809af28915c83b47a336

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /steps/id=delivery/routine/arguments.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 6–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 8f04699d8cada26b1b7ebcc5

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /steps/id=delivery/routine/arguments.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 6–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell f1186a7f61ea9f6493402006

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 checks each concrete routine invocation. This row contains or selects delivery calling deliver, including the argument-key side of the contract with deliver Inputs [envelope]. Row: /steps/id=delivery/routine/arguments/packet.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 6–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains or selects the concrete delivery invocation of deliver. The supplied key is packet and the routine Inputs list declares envelope. AP2 requires this exact argument-key comparison for every invocation; success or mismatch belongs to evaluation. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 input contract fails: activity line 6 supplies the sole key packet, while routine line 2 requires the sole input envelope. The sets differ and no aliases or optional parameters exist. The opaque value sealed is not a defect. This is one broken invocation, Live/Critical because its binding is structurally broken; origin diff follows the touched activity. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 460145b3f2b47abf7cc6997a

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /steps/id=delivery/routine/arguments/packet.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 6–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 272c678aed06a8e25584080e

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /steps/id=delivery/routine/arguments/packet.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 6–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell accbcdab5de3e41546023b48

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /steps/id=delivery/routine/arguments/packet.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 6–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 23d52f087c143d67f67da445

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 checks each concrete routine invocation. This row contains or selects delivery calling deliver, including the argument-key side of the contract with deliver Inputs [envelope]. Row: /steps/id=delivery/routine/name.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains or selects the concrete delivery invocation of deliver. The supplied key is packet and the routine Inputs list declares envelope. AP2 requires this exact argument-key comparison for every invocation; success or mismatch belongs to evaluation. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 input contract fails: activity line 6 supplies the sole key packet, while routine line 2 requires the sole input envelope. The sets differ and no aliases or optional parameters exist. The opaque value sealed is not a defect. This is one broken invocation, Live/Critical because its binding is structurally broken; origin diff follows the touched activity. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 7a49531ccbd7063bf5c4dd03

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /steps/id=delivery/routine/name.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell cced7364e2269714c048fe3b

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /steps/id=delivery/routine/name.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — The complete corpus/qualification/activities/run.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 501147c7c9cf63d456cc367b

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /steps/id=delivery/routine/name.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b331b3631bac4371bfebf008

Row: corpus/qualification/activities/run.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 checks each concrete routine invocation. This row contains or selects delivery calling deliver, including the argument-key side of the contract with deliver Inputs [envelope]. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains or selects the concrete delivery invocation of deliver. The supplied key is packet and the routine Inputs list declares envelope. AP2 requires this exact argument-key comparison for every invocation; success or mismatch belongs to evaluation. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 input contract fails: activity line 6 supplies the sole key packet, while routine line 2 requires the sole input envelope. The sets differ and no aliases or optional parameters exist. The opaque value sealed is not a defect. This is one broken invocation, Live/Critical because its binding is structurally broken; origin diff follows the touched activity. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 6d000a7587cb7a720d3ce09a

Row: corpus/qualification/activities/run.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The complete corpus/qualification/activities/run.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell fd8572c700cc4625bf5e2e78

Row: corpus/qualification/activities/run.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The complete corpus/qualification/activities/run.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 8b3b602b6703003326b8df8d

Row: corpus/qualification/activities/run.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell eeab805ea4653756496776b5

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 checks each concrete routine invocation. This row contains or selects delivery calling deliver, including the argument-key side of the contract with deliver Inputs [envelope]. Row: @relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains or selects the concrete delivery invocation of deliver. The supplied key is packet and the routine Inputs list declares envelope. AP2 requires this exact argument-key comparison for every invocation; success or mismatch belongs to evaluation. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 input contract fails: activity line 6 supplies the sole key packet, while routine line 2 requires the sole input envelope. The sets differ and no aliases or optional parameters exist. The opaque value sealed is not a defect. This is one broken invocation, Live/Critical because its binding is structurally broken; origin diff follows the touched activity. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell e42353cfc8fe3169b809b996

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses. This row is a call, graph or inheritance relationship, not an emitting instruction; call/binding/graph constructs are expressly outside its emitting construct. Row: @relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — Each named row is a call, graph or inheritance relationship. AP1 expressly excludes these constructs from emitting instructions. A leaf instruction cited as context remains represented by its own instruction/section rows; the relationship itself issues no emission directive. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 91a7785154a1a018658ccae8

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — DP-01 explicitly includes call and inheritance relationships. This row carries qualification to run, deliver and produce, or binds produce to the ancestor archive requirement. Row: @relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named relationship is a link in qualification -> run/delivery -> deliver/emit -> produce or the produce-to-TECHNIQUE.md inheritance link. DP1 explicitly carries the inherited rule through these relationships to the concrete leaf. Full execution and ancestor evidence supports the exact A reasons. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — DP-01 fails: the qualification/run/delivery/deliver/emit execution context resolves produce under qualification's techniques ancestor. Ancestor line 5 requires archive; leaf line 12 declares public. Each assigned relationship carries that same inherited requirement to the leaf. The actual defect is the leaf declaration, not the ancestor or relationship row. Live/High reflects a propagating destination violation; origin diff follows the touched leaf. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 36c8e451b93d39512aae352f

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: @relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell bfa09024c94a6bc76d51c631

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /id.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–1
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 9156a757fd93955348ca5766

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /id.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–1
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell bf312e511dcc8f4eda77a41a

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /id.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–1
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell a0e70a1645458e99657058ca

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /id.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–1
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 620325a4c3f62c9867a7df90

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 compares invocation argument keys with the routine Inputs list. This row declares envelope, the expected-key endpoint of delivery calling deliver; its concrete activity invocation supplies the other endpoint. Row: /inputs.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row declares envelope in deliver Inputs, the required-key endpoint compared with the concrete activity invocation under AP2. The complete invocation supplies packet; a valid routine declaration cannot exempt the call. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 input contract fails: activity line 6 supplies the sole key packet, while routine line 2 requires the sole input envelope. The sets differ and no aliases or optional parameters exist. The opaque value sealed is not a defect. This is one broken invocation, Live/Critical because its binding is structurally broken; origin diff follows the touched activity. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 2e52133101ac058519a8aa51

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /inputs.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell cf440ff1717daba3ba33af52

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /inputs.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0e0de76a45b1ce5cc0a55a2d

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /inputs.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 85e68983cef9c8b0f9a7bf33

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 compares invocation argument keys with the routine Inputs list. This row declares envelope, the expected-key endpoint of delivery calling deliver; its concrete activity invocation supplies the other endpoint. Row: /inputs/0.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row declares envelope in deliver Inputs, the required-key endpoint compared with the concrete activity invocation under AP2. The complete invocation supplies packet; a valid routine declaration cannot exempt the call. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 input contract fails: activity line 6 supplies the sole key packet, while routine line 2 requires the sole input envelope. The sets differ and no aliases or optional parameters exist. The opaque value sealed is not a defect. This is one broken invocation, Live/Critical because its binding is structurally broken; origin diff follows the touched activity. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 8d0a1adc7b4ff87710b48af6

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /inputs/0.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell af24593c352cedfdf9a972fa

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /inputs/0.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0dfaae8a980c43d6afea14bc

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /inputs/0.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 1682a187cf7dd36419e2a143

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 checks routine invocation and exported output contracts. This row contains deliver contract data or its produce relationship; emit.report requires the resolved produce Outputs names, and the instantiated call supplies arguments. Row: /outputs.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains deliver contract data or its produce call/execution relationship. The export is emit.report; emit resolves to produce, whose declared output is summary. AP2 applies to that compared binding contract with the concrete invocation retained. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 output contract fails: routine line 3 binds report to emit.report; lines 5-6 resolve emit to produce, whose Outputs line 5 declares only summary. The exported name report is allowed, but the referenced output report is absent. This is one dangling binding, Live/Critical. Origin diff follows this consumer's binding to the touched technique output contract. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 8f64e24f8a4caa9482d28228

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /outputs.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell ab40e04b150dd3790c5764db

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /outputs.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7c49f2961aec4917ed955bd7

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /outputs.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 7f71a92e9f425b2094dec98d

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 checks routine invocation and exported output contracts. This row contains deliver contract data or its produce relationship; emit.report requires the resolved produce Outputs names, and the instantiated call supplies arguments. Row: /outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains deliver contract data or its produce call/execution relationship. The export is emit.report; emit resolves to produce, whose declared output is summary. AP2 applies to that compared binding contract with the concrete invocation retained. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 output contract fails: routine line 3 binds report to emit.report; lines 5-6 resolve emit to produce, whose Outputs line 5 declares only summary. The exported name report is allowed, but the referenced output report is absent. This is one dangling binding, Live/Critical. Origin diff follows this consumer's binding to the touched technique output contract. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 232c484eaf1003ef830d4ffa

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 791a31ca8731b94c89d67e5c

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell ad7314b738ea597d93ae3b23

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 3–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 82c8e910cc4b4df96a89e369

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 requires resolving the step and its technique before output comparison. This row defines emit or its produce call, which resolves the exported emit.report binding to the technique Outputs declaration. Row: /steps.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row supplies emit or its produce technique selection. AP2 requires resolving that exact step before comparing emit.report with the technique Outputs names. The complete binding and called leaf are included as evidence. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 output contract fails: routine line 3 binds report to emit.report; lines 5-6 resolve emit to produce, whose Outputs line 5 declares only summary. The exported name report is allowed, but the referenced output report is absent. This is one dangling binding, Live/Critical. Origin diff follows this consumer's binding to the touched technique output contract. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell cbb292d61ff63c7740d065be

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /steps.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 2228315b4ed81fce11373514

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /steps.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell f82d1cd9016de1cdd797e170

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /steps.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 790b168511688f3580f49f17

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 requires resolving the step and its technique before output comparison. This row defines emit or its produce call, which resolves the exported emit.report binding to the technique Outputs declaration. Row: /steps/id=emit.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row supplies emit or its produce technique selection. AP2 requires resolving that exact step before comparing emit.report with the technique Outputs names. The complete binding and called leaf are included as evidence. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 output contract fails: routine line 3 binds report to emit.report; lines 5-6 resolve emit to produce, whose Outputs line 5 declares only summary. The exported name report is allowed, but the referenced output report is absent. This is one dangling binding, Live/Critical. Origin diff follows this consumer's binding to the touched technique output contract. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell bbb0ef5214ae8bbcce715c65

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /steps/id=emit.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 2160f33c3a701883bf507397

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /steps/id=emit.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 569231fa0b1023abbf3fc5e4

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /steps/id=emit.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e6707d2a492bbb28eafc3a21

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 requires resolving the step and its technique before output comparison. This row defines emit or its produce call, which resolves the exported emit.report binding to the technique Outputs declaration. Row: /steps/id=emit/id.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row supplies emit or its produce technique selection. AP2 requires resolving that exact step before comparing emit.report with the technique Outputs names. The complete binding and called leaf are included as evidence. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 output contract fails: routine line 3 binds report to emit.report; lines 5-6 resolve emit to produce, whose Outputs line 5 declares only summary. The exported name report is allowed, but the referenced output report is absent. This is one dangling binding, Live/Critical. Origin diff follows this consumer's binding to the touched technique output contract. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 71fd5507f4b74e2ec91c2b3e

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /steps/id=emit/id.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b707f101a68f594abdbb9fc8

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /steps/id=emit/id.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7567be6ff4d583433092c972

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /steps/id=emit/id.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 387b3abcf94e6a19aabbf992

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 requires resolving the step and its technique before output comparison. This row defines emit or its produce call, which resolves the exported emit.report binding to the technique Outputs declaration. Row: /steps/id=emit/technique.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 6–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row supplies emit or its produce technique selection. AP2 requires resolving that exact step before comparing emit.report with the technique Outputs names. The complete binding and called leaf are included as evidence. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 output contract fails: routine line 3 binds report to emit.report; lines 5-6 resolve emit to produce, whose Outputs line 5 declares only summary. The exported name report is allowed, but the referenced output report is absent. This is one dangling binding, Live/Critical. Origin diff follows this consumer's binding to the touched technique output contract. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell f2a200e38a51bc411ee5e057

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /steps/id=emit/technique.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 6–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell d5d35100c716e2ed184e7476

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /steps/id=emit/technique.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 6–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 90bd5ed8d7c0859a6fbe41a1

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /steps/id=emit/technique.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 6–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fa301823ccd44ed9374ce575

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 checks routine invocation and exported output contracts. This row contains deliver contract data or its produce relationship; emit.report requires the resolved produce Outputs names, and the instantiated call supplies arguments. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains deliver contract data or its produce call/execution relationship. The export is emit.report; emit resolves to produce, whose declared output is summary. AP2 applies to that compared binding contract with the concrete invocation retained. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 exposes two distinct broken contracts: delivery supplies packet while deliver requires envelope (activity line 6, routine line 2); deliver exports emit.report while emit calls produce, which declares only summary (routine lines 3, 5-6; technique line 5). The whole routine and explicit execution relationship expose both. Both are Live/Critical structural binding failures. Origins are diff: the touched invocation and its touched output-contract consumer. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/routines/deliver.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 2ec151da2546cd9066780932

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 65dd3d64e8c54c7713685121

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The complete corpus/qualification/routines/deliver.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 19723157905da0f5874e77db

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b34f6249f0f9b31107491750

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 checks routine invocation and exported output contracts. This row contains deliver contract data or its produce relationship; emit.report requires the resolved produce Outputs names, and the instantiated call supplies arguments. Row: @relationship/3a2f0d25e0e017f7.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains deliver contract data or its produce call/execution relationship. The export is emit.report; emit resolves to produce, whose declared output is summary. AP2 applies to that compared binding contract with the concrete invocation retained. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 output contract fails: routine line 3 binds report to emit.report; lines 5-6 resolve emit to produce, whose Outputs line 5 declares only summary. The exported name report is allowed, but the referenced output report is absent. This is one dangling binding, Live/Critical. Origin diff follows this consumer's binding to the touched technique output contract. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell afeb129e1e03e4f353693950

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses. This row is a call, graph or inheritance relationship, not an emitting instruction; call/binding/graph constructs are expressly outside its emitting construct. Row: @relationship/3a2f0d25e0e017f7.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row is a call, graph or inheritance relationship. AP1 expressly excludes these constructs from emitting instructions. A leaf instruction cited as context remains represented by its own instruction/section rows; the relationship itself issues no emission directive. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell eb3d9f625d45294630564c36

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — DP-01 explicitly includes call and inheritance relationships. This row carries qualification to run, deliver and produce, or binds produce to the ancestor archive requirement. Row: @relationship/3a2f0d25e0e017f7.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named relationship is a link in qualification -> run/delivery -> deliver/emit -> produce or the produce-to-TECHNIQUE.md inheritance link. DP1 explicitly carries the inherited rule through these relationships to the concrete leaf. Full execution and ancestor evidence supports the exact A reasons. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — DP-01 fails: the qualification/run/delivery/deliver/emit execution context resolves produce under qualification's techniques ancestor. Ancestor line 5 requires archive; leaf line 12 declares public. Each assigned relationship carries that same inherited requirement to the leaf. The actual defect is the leaf declaration, not the ancestor or relationship row. Live/High reflects a propagating destination violation; origin diff follows the touched leaf. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell a6cc9c95bd8a15eec9337ab9

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: @relationship/3a2f0d25e0e017f7.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 8669d4026237cb94e83e2158

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 checks routine invocation and exported output contracts. This row contains deliver contract data or its produce relationship; emit.report requires the resolved produce Outputs names, and the instantiated call supplies arguments. Row: @relationship/50a64427faa3df96.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row contains deliver contract data or its produce call/execution relationship. The export is emit.report; emit resolves to produce, whose declared output is summary. AP2 applies to that compared binding contract with the concrete invocation retained. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 exposes two distinct broken contracts: delivery supplies packet while deliver requires envelope (activity line 6, routine line 2); deliver exports emit.report while emit calls produce, which declares only summary (routine lines 3, 5-6; technique line 5). The whole routine and explicit execution relationship expose both. Both are Live/Critical structural binding failures. Origins are diff: the touched invocation and its touched output-contract consumer. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/routines/deliver.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 7b47769dd43afb09823a4b14

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses. This row is a call, graph or inheritance relationship, not an emitting instruction; call/binding/graph constructs are expressly outside its emitting construct. Row: @relationship/50a64427faa3df96.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row is a call, graph or inheritance relationship. AP1 expressly excludes these constructs from emitting instructions. A leaf instruction cited as context remains represented by its own instruction/section rows; the relationship itself issues no emission directive. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 15ee43746437cfdf860b1519

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — DP-01 explicitly includes call and inheritance relationships. This row carries qualification to run, deliver and produce, or binds produce to the ancestor archive requirement. Row: @relationship/50a64427faa3df96.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named relationship is a link in qualification -> run/delivery -> deliver/emit -> produce or the produce-to-TECHNIQUE.md inheritance link. DP1 explicitly carries the inherited rule through these relationships to the concrete leaf. Full execution and ancestor evidence supports the exact A reasons. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — DP-01 fails: the qualification/run/delivery/deliver/emit execution context resolves produce under qualification's techniques ancestor. Ancestor line 5 requires archive; leaf line 12 declares public. Each assigned relationship carries that same inherited requirement to the leaf. The actual defect is the leaf declaration, not the ancestor or relationship row. Live/High reflects a propagating destination violation; origin diff follows the touched leaf. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 7616d539ed6effba75237723

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: @relationship/50a64427faa3df96.

Agent: /root/qualify_author_one

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 5fb3f06992383a0be7318734

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /capability.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell d9eb0eb2cb8f9fb790e82eee

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /capability.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — The complete corpus/qualification/techniques/TECHNIQUE.md source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b6ad6f9e4c3bf6bcd7517234

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes the ancestor constraint from conflicting leaf destinations. This row belongs to ancestor TECHNIQUE.md; it declares archive as the inherited requirement and is not a leaf instance. Row: /capability.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — The full source is ancestor TECHNIQUE.md, which supplies the archive requirement and is not a leaf instance. DP1 explicitly distinguishes that declaration from a conflicting leaf destination. The source remains comparison context for applicable leaf/relationship rows. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0ed30157350f8c23d6297b75

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /capability.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell c9c06fb4ee9924c6c63c553f

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 720f7eeadf6be862dd39b7ab

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — The complete corpus/qualification/techniques/TECHNIQUE.md source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 3dd8981b7cf70f3489f0cb9a

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes the ancestor constraint from conflicting leaf destinations. This row belongs to ancestor TECHNIQUE.md; it declares archive as the inherited requirement and is not a leaf instance. Row: /capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — The full source is ancestor TECHNIQUE.md, which supplies the archive requirement and is not a leaf instance. DP1 explicitly distinguishes that declaration from a conflicting leaf destination. The source remains comparison context for applicable leaf/relationship rows. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 62d70a2ce5a077d8010ce9fe

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ac42c54bb5e18cc6005d1df7

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /rules.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 4–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 541cffe238719bcc6a46fe77

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /rules.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 4–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — The complete corpus/qualification/techniques/TECHNIQUE.md source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b3f616c2c1a987217e5cf61b

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes the ancestor constraint from conflicting leaf destinations. This row belongs to ancestor TECHNIQUE.md; it declares archive as the inherited requirement and is not a leaf instance. Row: /rules.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 4–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — The full source is ancestor TECHNIQUE.md, which supplies the archive requirement and is not a leaf instance. DP1 explicitly distinguishes that declaration from a conflicting leaf destination. The source remains comparison context for applicable leaf/relationship rows. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell d9b55f0b6cbe3ed6ab868ed5

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /rules.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 4–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell bfde9ab405ad9faa2bc4b5ac

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /rules/line-5.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 06d002e75cf36ea1b43c83b1

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /rules/line-5.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — The complete corpus/qualification/techniques/TECHNIQUE.md source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 67ae926240e520bfdb63b1a3

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes the ancestor constraint from conflicting leaf destinations. This row belongs to ancestor TECHNIQUE.md; it declares archive as the inherited requirement and is not a leaf instance. Row: /rules/line-5.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — The full source is ancestor TECHNIQUE.md, which supplies the archive requirement and is not a leaf instance. DP1 explicitly distinguishes that declaration from a conflicting leaf destination. The source remains comparison context for applicable leaf/relationship rows. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 4da9396f20f50a18673256c5

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /rules/line-5.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 4d029f4ed7a941dc5b13bafa

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 01bc60dde7d03c634b92d11c

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The complete corpus/qualification/techniques/TECHNIQUE.md source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 69c0652ae2e85de91e1e5de4

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes the ancestor constraint from conflicting leaf destinations. This row belongs to ancestor TECHNIQUE.md; it declares archive as the inherited requirement and is not a leaf instance. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The full source is ancestor TECHNIQUE.md, which supplies the archive requirement and is not a leaf instance. DP1 explicitly distinguishes that declaration from a conflicting leaf destination. The source remains comparison context for applicable leaf/relationship rows. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 54a73e1bf111128988cf03fe

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 4c3a69d6842d941bb1b4ae64

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /capability.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell e192558242a4ed960c5d7a46

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /capability.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–3
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The named Capability rows describe Produce a report. AP1 explicitly treats capability descriptions as service descriptions rather than imperative emission instructions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 36ee15fe5284f5e03e6afdc4

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 concerns Destination declarations and explicit call/inheritance relationships. This row contains neither; the separate Destination declaration is produce line 12. Row: /capability.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The named leaf rows describe Capability, Outputs, Protocol or the retention/emission Rules line. None is the separate Destination declaration at line 12 or an explicit call/inheritance relationship. DP1 scopes those latter constructs; full-source evidence supports this exclusion. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 6eb38943804944cf6cfbb4ed

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /capability.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–3
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 883f9febadc76de8d4b64dd6

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell e3b51412d1cbb5b26dbb8664

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The named Capability rows describe Produce a report. AP1 explicitly treats capability descriptions as service descriptions rather than imperative emission instructions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b82b83027689277cdcc2042f

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 concerns Destination declarations and explicit call/inheritance relationships. This row contains neither; the separate Destination declaration is produce line 12. Row: /capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The named leaf rows describe Capability, Outputs, Protocol or the retention/emission Rules line. None is the separate Destination declaration at line 12 or an explicit call/inheritance relationship. DP1 scopes those latter constructs; full-source evidence supports this exclusion. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell dadf707dc4833496ce962762

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell c986d23bf9fe92ac15ab723d

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 explicitly uses keys beneath technique Outputs as declared output names. This row includes that declaration in produce, the called endpoint of deliver export emit.report. Row: /outputs.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 4–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row includes produce Outputs/summary, the declared-name endpoint of deliver export emit.report. AP2 expressly defines the keys below Outputs as the output names; applicability survives either agreement or disagreement. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 output contract fails: routine line 3 binds report to emit.report; lines 5-6 resolve emit to produce, whose Outputs line 5 declares only summary. The exported name report is allowed, but the referenced output report is absent. This is one dangling binding, Live/Critical. Origin diff follows this consumer's binding to the touched technique output contract. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell e00abe344b2cf11c702b34f1

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /outputs.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 4–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The named rows declare output summary and contain no Protocol instruction or Rules emission clause. AP1 explicitly excludes output declarations. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b7876638c82ca7835e6ecd54

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 concerns Destination declarations and explicit call/inheritance relationships. This row contains neither; the separate Destination declaration is produce line 12. Row: /outputs.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 4–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The named leaf rows describe Capability, Outputs, Protocol or the retention/emission Rules line. None is the separate Destination declaration at line 12 or an explicit call/inheritance relationship. DP1 scopes those latter constructs; full-source evidence supports this exclusion. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 9839de920cafa86c93f9e319

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /outputs.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 4–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fef2366b0f34a7eda42dc08d

Row: corpus/qualification/techniques/produce.md#/outputs/summary

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 explicitly uses keys beneath technique Outputs as declared output names. This row includes that declaration in produce, the called endpoint of deliver export emit.report. Row: /outputs/summary.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row includes produce Outputs/summary, the declared-name endpoint of deliver export emit.report. AP2 expressly defines the keys below Outputs as the output names; applicability survives either agreement or disagreement. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 output contract fails: routine line 3 binds report to emit.report; lines 5-6 resolve emit to produce, whose Outputs line 5 declares only summary. The exported name report is allowed, but the referenced output report is absent. This is one dangling binding, Live/Critical. Origin diff follows this consumer's binding to the touched technique output contract. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell b055cfe76040cd42f5d207a8

Row: corpus/qualification/techniques/produce.md#/outputs/summary

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /outputs/summary.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 5–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The named rows declare output summary and contain no Protocol instruction or Rules emission clause. AP1 explicitly excludes output declarations. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 8b527c51fa312ce306f5d8f4

Row: corpus/qualification/techniques/produce.md#/outputs/summary

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 concerns Destination declarations and explicit call/inheritance relationships. This row contains neither; the separate Destination declaration is produce line 12. Row: /outputs/summary.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The named leaf rows describe Capability, Outputs, Protocol or the retention/emission Rules line. None is the separate Destination declaration at line 12 or an explicit call/inheritance relationship. DP1 scopes those latter constructs; full-source evidence supports this exclusion. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7e07755f91a05aa3f3a47b42

Row: corpus/qualification/techniques/produce.md#/outputs/summary

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /outputs/summary.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 5–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 547682eae905cf61fddd33be

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /protocol.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 7–9
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 668f2c03b5c1dfffd6143cc5

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — AP-01 scopes emitting Protocol instructions and Rules clauses. This row contains the report-emission directive at produce line 8 or line 11 clause 2; whether validation is required belongs to evaluation. Row: /protocol.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 7–9
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains the Protocol instruction at produce line 8. It directs report emission, so AP1 applies; the presence or absence of validation determines evaluation and does not justify exclusion. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: finding — AP-01 fails for the Protocol instruction at line 8: it explicitly emits the report without validation. It must satisfy validation independently of Rules. This emission directive is Live/High because it propagates unvalidated artifact behavior; origin diff follows the touched technique. Assigned rows: corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 533e91f3401233d0974551eb

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 concerns Destination declarations and explicit call/inheritance relationships. This row contains neither; the separate Destination declaration is produce line 12. Row: /protocol.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 7–9
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The named leaf rows describe Capability, Outputs, Protocol or the retention/emission Rules line. None is the separate Destination declaration at line 12 or an explicit call/inheritance relationship. DP1 scopes those latter constructs; full-source evidence supports this exclusion. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell a700a3294be653eb8e533547

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /protocol.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 7–9
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 0f13f165ba007a4540cef470

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /protocol/line-8.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 8–8
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 7f339716e8d7474fb2512654

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — AP-01 explicitly covers each Protocol instruction directing emission. This line directs emission without validation and is neither a heading nor a declaration; its applicability is A regardless of the later evaluation result.

Agent: /root

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 1–14

Verification: verified — The proposed A disposition and reason agree with the original criterion and source. AP-01 Detect expressly covers each Protocol instruction directing artifact emission. Produce Protocol line 8 says Emit the report without validation, an imperative instruction rather than a heading, declaration or Capability description. The mapping cites the complete leaf and the criterion section, overlapping the assigned line and full AP-01 entry. Applicability is established; evaluation is still a separate obligation.

Agent: /root/qualify_audit_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell fbafce4f79dd46979495549a

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 concerns Destination declarations and explicit call/inheritance relationships. This row contains neither; the separate Destination declaration is produce line 12. Row: /protocol/line-8.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 8–8
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The named leaf rows describe Capability, Outputs, Protocol or the retention/emission Rules line. None is the separate Destination declaration at line 12 or an explicit call/inheritance relationship. DP1 scopes those latter constructs; full-source evidence supports this exclusion. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell cc4fea783a74407b8fdb654e

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /protocol/line-8.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 8–8
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell a30b577290e3406e29334f7b

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /rules.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 10–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell d10a33e1908da3335366adaa

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — AP-01 scopes emitting Protocol instructions and Rules clauses. This row contains the report-emission directive at produce line 8 or line 11 clause 2; whether validation is required belongs to evaluation. Row: /rules.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 10–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains the second semicolon-separated clause at produce line 11. That clause governs report emission and must independently undergo AP1 evaluation. The retention clause cannot excuse or remove its applicability. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: finding — AP-01 fails for Rules line 11 clause 2: it explicitly emits the report without validation. Clause 1 only retains the report ID and cannot satisfy the second clause's obligation. This emission directive is Live/High because it propagates unvalidated artifact behavior; origin diff follows the touched technique. Assigned rows: corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 381dd396d48f156e5b5332ba

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — DP-01 scopes the leaf Destination declaration. This row contains that declaration at produce line 12, requiring comparison with the executing qualification ancestor at TECHNIQUE.md line 5. Row: /rules.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 10–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row contains produce Destination public at line 12. DP1 requires comparison with the archive constraint of the executing qualification ancestor at TECHNIQUE.md line 5. Applicability is independent of whether those values agree. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — DP-01 fails: the qualification/run/delivery/deliver/emit execution context resolves produce under qualification's techniques ancestor. Ancestor line 5 requires archive; leaf line 12 declares public. Each assigned relationship carries that same inherited requirement to the leaf. The actual defect is the leaf declaration, not the ancestor or relationship row. Live/High reflects a propagating destination violation; origin diff follows the touched leaf. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 21b5df21a5c696fcaa898fbf

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /rules.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 10–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 6dff2018269cdd7f6ce3a242

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /rules/line-11.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 11–11
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell a3b7b46de80a7e60f06f33aa

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — AP-01 scopes emitting Protocol instructions and Rules clauses. This row contains the report-emission directive at produce line 8 or line 11 clause 2; whether validation is required belongs to evaluation. Row: /rules/line-11.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 11–11
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains the second semicolon-separated clause at produce line 11. That clause governs report emission and must independently undergo AP1 evaluation. The retention clause cannot excuse or remove its applicability. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: finding — AP-01 fails for Rules line 11 clause 2: it explicitly emits the report without validation. Clause 1 only retains the report ID and cannot satisfy the second clause's obligation. This emission directive is Live/High because it propagates unvalidated artifact behavior; origin diff follows the touched technique. Assigned rows: corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 69a9fd68e24025b700e9bbb1

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 concerns Destination declarations and explicit call/inheritance relationships. This row contains neither; the separate Destination declaration is produce line 12. Row: /rules/line-11.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 11–11
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The named leaf rows describe Capability, Outputs, Protocol or the retention/emission Rules line. None is the separate Destination declaration at line 12 or an explicit call/inheritance relationship. DP1 scopes those latter constructs; full-source evidence supports this exclusion. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell d4d45cf60920c4360e003cf1

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /rules/line-11.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 11–11
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 923c5917ea2c9d4abe29e519

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /rules/line-11/clause-1.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 11–11
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 2f83f57df858c2cf145efffc

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /rules/line-11/clause-1.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 11–11
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The exact named clause is Retain the report ID. AP1 explicitly excludes retention clauses that do not direct emission; the sibling emission clause is separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9e2179b4c1fbfc73dc6b4981

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 concerns Destination declarations and explicit call/inheritance relationships. This row contains neither; the separate Destination declaration is produce line 12. Row: /rules/line-11/clause-1.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 11–11
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The named leaf rows describe Capability, Outputs, Protocol or the retention/emission Rules line. None is the separate Destination declaration at line 12 or an explicit call/inheritance relationship. DP1 scopes those latter constructs; full-source evidence supports this exclusion. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b1c897ef75ecfb0802a40206

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /rules/line-11/clause-1.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 11–11
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell a03eed5b1543ec6c3d53b66c

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /rules/line-11/clause-2.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 11–11
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 1fff788717e68470ea335f4a

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — AP-01 scopes emitting Protocol instructions and Rules clauses. This row contains the report-emission directive at produce line 8 or line 11 clause 2; whether validation is required belongs to evaluation. Row: /rules/line-11/clause-2.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 11–11
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row contains the second semicolon-separated clause at produce line 11. That clause governs report emission and must independently undergo AP1 evaluation. The retention clause cannot excuse or remove its applicability. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: finding — AP-01 fails for Rules line 11 clause 2: it explicitly emits the report without validation. Clause 1 only retains the report ID and cannot satisfy the second clause's obligation. This emission directive is Live/High because it propagates unvalidated artifact behavior; origin diff follows the touched technique. Assigned rows: corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell acca57d9a610cd2900940f11

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 concerns Destination declarations and explicit call/inheritance relationships. This row contains neither; the separate Destination declaration is produce line 12. Row: /rules/line-11/clause-2.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 11–11
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The named leaf rows describe Capability, Outputs, Protocol or the retention/emission Rules line. None is the separate Destination declaration at line 12 or an explicit call/inheritance relationship. DP1 scopes those latter constructs; full-source evidence supports this exclusion. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b192bf0ffab5454aaf50901a

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /rules/line-11/clause-2.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 11–11
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 185e903ef3c4ae26da231a32

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /rules/line-12.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 12–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 9d43a5459db3bcbd7c1b6759

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /rules/line-12.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 12–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — The exact row declares destination public. AP1 expressly excludes destination declarations from emitting instructions, irrespective of their conformance with a different criterion. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 355ce3ec841005b898e3d8d3

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — DP-01 scopes the leaf Destination declaration. This row contains that declaration at produce line 12, requiring comparison with the executing qualification ancestor at TECHNIQUE.md line 5. Row: /rules/line-12.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 12–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row contains produce Destination public at line 12. DP1 requires comparison with the archive constraint of the executing qualification ancestor at TECHNIQUE.md line 5. Applicability is independent of whether those values agree. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — DP-01 fails: the qualification/run/delivery/deliver/emit execution context resolves produce under qualification's techniques ancestor. Ancestor line 5 requires archive; leaf line 12 declares public. Each assigned relationship carries that same inherited requirement to the leaf. The actual defect is the leaf declaration, not the ancestor or relationship row. Live/High reflects a propagating destination violation; origin diff follows the touched leaf. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 3e979fb0c7e3eb5836c3cb1a

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: /rules/line-12.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 12–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ca1e1515076ec0147e7b8338

Row: corpus/qualification/techniques/produce.md#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — AP-02 explicitly uses keys beneath technique Outputs as declared output names. This row includes that declaration in produce, the called endpoint of deliver export emit.report. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

Verification: verified — Each named row includes produce Outputs/summary, the declared-name endpoint of deliver export emit.report. AP2 expressly defines the keys below Outputs as the output names; applicability survives either agreement or disagreement. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — AP-02 output contract fails: routine line 3 binds report to emit.report; lines 5-6 resolve emit to produce, whose Outputs line 5 declares only summary. The exported name report is allowed, but the referenced output report is absent. This is one dangling binding, Live/Critical. Origin diff follows this consumer's binding to the touched technique output contract. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell d074a916d8f80c61b3aa18a0

Row: corpus/qualification/techniques/produce.md#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — AP-01 scopes emitting Protocol instructions and Rules clauses. This row contains the report-emission directive at produce line 8 or line 11 clause 2; whether validation is required belongs to evaluation. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The complete leaf contains report-emission instructions at Protocol line 8 and Rules line 11 clause 2. AP1 therefore applies to the whole element while keeping those instructions separately accountable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: finding — AP-01 exposes two distinct violations in the whole technique: Protocol line 8 and Rules line 11 clause 2 each explicitly emit the report without validation. Each directive must satisfy the criterion independently, so neither the common artifact nor the retention clause merges or excuses them. Both are Live/High propagating emission defects, with origin diff from the touched technique. Assigned rows: corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell a406c04573c91f8ad82577e3

Row: corpus/qualification/techniques/produce.md#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — DP-01 scopes the leaf Destination declaration. This row contains that declaration at produce line 12, requiring comparison with the executing qualification ancestor at TECHNIQUE.md line 5. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row contains produce Destination public at line 12. DP1 requires comparison with the archive constraint of the executing qualification ancestor at TECHNIQUE.md line 5. Applicability is independent of whether those values agree. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — DP-01 fails: the qualification/run/delivery/deliver/emit execution context resolves produce under qualification's techniques ancestor. Ancestor line 5 requires archive; leaf line 12 declares public. Each assigned relationship carries that same inherited requirement to the leaf. The actual defect is the leaf declaration, not the ancestor or relationship row. Live/High reflects a propagating destination violation; origin diff follows the touched leaf. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 8d0f33a043c7068e8c998046

Row: corpus/qualification/techniques/produce.md#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fa0e42c99b24fa8b70e1b4c5

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: @relationship/f075d23fadb959c8.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — These graph or ancestor relationships do not themselves specify a routine argument-key comparison or a step.output export. AP2 limits its binding contract to those two forms. Captured endpoint context is retained without treating every reference as a binding. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 8ab5a44208c83cc6801721f8

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses. This row is a call, graph or inheritance relationship, not an emitting instruction; call/binding/graph constructs are expressly outside its emitting construct. Row: @relationship/f075d23fadb959c8.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — Each named row is a call, graph or inheritance relationship. AP1 expressly excludes these constructs from emitting instructions. A leaf instruction cited as context remains represented by its own instruction/section rows; the relationship itself issues no emission directive. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 8bfa310664405693e5cee00b

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — DP-01 explicitly includes call and inheritance relationships. This row carries qualification to run, deliver and produce, or binds produce to the ancestor archive requirement. Row: @relationship/f075d23fadb959c8.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named relationship is a link in qualification -> run/delivery -> deliver/emit -> produce or the produce-to-TECHNIQUE.md inheritance link. DP1 explicitly carries the inherited rule through these relationships to the concrete leaf. Full execution and ancestor evidence supports the exact A reasons. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — DP-01 fails: the qualification/run/delivery/deliver/emit execution context resolves produce under qualification's techniques ancestor. Ancestor line 5 requires archive; leaf line 12 declares public. Each assigned relationship carries that same inherited requirement to the leaf. The actual defect is the leaf declaration, not the ancestor or relationship row. Live/High reflects a propagating destination violation; origin diff follows the touched leaf. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 98b55e096e4899353322814f

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 scopes a whole-workflow graph invariant and says activity/routine steps add no exits. This activity, routine, technique or nested call/inheritance row does not declare workflow graph transitions. Row: @relationship/f075d23fadb959c8.

Agent: /root/qualify_author_one

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5

Verification: verified — Each named row belongs to an activity, routine, technique, ancestor or nested call/inheritance relationship. DP2 limits termination to the workflow graph and expressly says activity/routine steps add no exits. Complete context is preserved, including any workflow used only as call context. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e3964a7ca7f68e7c40793e11

Row: corpus/qualification/workflow.yaml#/graph

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /graph.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 4–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 343988e91c335d3bdef76586

Row: corpus/qualification/workflow.yaml#/graph

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /graph.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 4–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — The complete corpus/qualification/workflow.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 67bbb2cf737f1d39490640e1

Row: corpus/qualification/workflow.yaml#/graph

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /graph.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 4–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — The complete corpus/qualification/workflow.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 094759e3ffb8236db086b566

Row: corpus/qualification/workflow.yaml#/graph

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — DP-02 requires a finite initialActivity-to-null path in the complete workflow graph. This row supplies an entry, graph edge, graph relationship or the whole workflow; its decision requires the entire captured graph. Row: /graph.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 4–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row supplies the workflow entry, graph structure/exit, graph relationship or whole element. DP2 requires a complete initialActivity-to-null path assessment. The captured graph starts at run and has done -> run; the full graph is evidence, and local identifier agreement cannot decide the invariant. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — DP-02 fails as a whole-workflow invariant: initialActivity is run, and the entire graph's sole exit is run.done -> run. No null destination or alternative reachable terminating path exists. Matching the run activity ID does not establish termination, and activity/routine steps add no graph exits. This is Live/Critical because the workflow is structurally nonterminating; origin diff follows the touched graph. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell fc47360bf214ca94a9c2f752

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /graph/run.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell cc39f8b8ebb2b96169d05005

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /graph/run.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — The complete corpus/qualification/workflow.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9aa00375bff5d32993c718d0

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /graph/run.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — The complete corpus/qualification/workflow.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 9a13e148e0a434d148bef242

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — DP-02 requires a finite initialActivity-to-null path in the complete workflow graph. This row supplies an entry, graph edge, graph relationship or the whole workflow; its decision requires the entire captured graph. Row: /graph/run.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row supplies the workflow entry, graph structure/exit, graph relationship or whole element. DP2 requires a complete initialActivity-to-null path assessment. The captured graph starts at run and has done -> run; the full graph is evidence, and local identifier agreement cannot decide the invariant. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — DP-02 fails as a whole-workflow invariant: initialActivity is run, and the entire graph's sole exit is run.done -> run. No null destination or alternative reachable terminating path exists. Matching the run activity ID does not establish termination, and activity/routine steps add no graph exits. This is Live/Critical because the workflow is structurally nonterminating; origin diff follows the touched graph. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell e8a18028e34e1ace5d01fcf3

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /graph/run/done.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell b1f517596f87f82a15830709

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /graph/run/done.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 5–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — The complete corpus/qualification/workflow.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 46e28f2007abc40979497fc9

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /graph/run/done.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — The complete corpus/qualification/workflow.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell e0fcd50974c10678a3e2fb44

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — DP-02 requires a finite initialActivity-to-null path in the complete workflow graph. This row supplies an entry, graph edge, graph relationship or the whole workflow; its decision requires the entire captured graph. Row: /graph/run/done.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 5–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row supplies the workflow entry, graph structure/exit, graph relationship or whole element. DP2 requires a complete initialActivity-to-null path assessment. The captured graph starts at run and has done -> run; the full graph is evidence, and local identifier agreement cannot decide the invariant. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — DP-02 fails as a whole-workflow invariant: initialActivity is run, and the entire graph's sole exit is run.done -> run. No null destination or alternative reachable terminating path exists. Matching the run activity ID does not establish termination, and activity/routine steps add no graph exits. This is Live/Critical because the workflow is structurally nonterminating; origin diff follows the touched graph. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell a1bbb96005ca910edd02b943

Row: corpus/qualification/workflow.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /id.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–1
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell ca0a66d25c90e652baa92f28

Row: corpus/qualification/workflow.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /id.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–1
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — The complete corpus/qualification/workflow.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9fff88eaae065adb66759e66

Row: corpus/qualification/workflow.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /id.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–1
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — The complete corpus/qualification/workflow.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b70cd0fa3dc717cd87f806e4

Row: corpus/qualification/workflow.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — DP-02 concerns the initialActivity-to-null graph path. This row only declares the workflow identifier; it supplies neither an entry/exit nor the whole graph, and identifier matching does not prove termination. Row: /id.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–1
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — This row declares only workflow id qualification. It supplies no graph entry or exit. DP2 states that matching identifiers does not establish termination; separate entry, graph and whole-workflow rows remain applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b93fc9705f0d802bdff5440b

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: /initialActivity.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 3641b7b9d54d55df0cc22cb1

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: /initialActivity.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 2–2
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — The complete corpus/qualification/workflow.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 665c1a7ad6f6a7650e3f374a

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: /initialActivity.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — The complete corpus/qualification/workflow.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell c7fdcca69a6f6d3b3cfa7009

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — DP-02 requires a finite initialActivity-to-null path in the complete workflow graph. This row supplies an entry, graph edge, graph relationship or the whole workflow; its decision requires the entire captured graph. Row: /initialActivity.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 2–2
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Each named row supplies the workflow entry, graph structure/exit, graph relationship or whole element. DP2 requires a complete initialActivity-to-null path assessment. The captured graph starts at run and has done -> run; the full graph is evidence, and local identifier agreement cannot decide the invariant. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — DP-02 fails as a whole-workflow invariant: initialActivity is run, and the entire graph's sole exit is run.done -> run. No null destination or alternative reachable terminating path exists. Matching the run activity ID does not establish termination, and activity/routine steps add no graph exits. This is Live/Critical because the workflow is structurally nonterminating; origin diff follows the touched graph. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell ce1c6885d9fe828ffb2d4802

Row: corpus/qualification/workflow.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Each named row is an identifier, graph structure, ancestor constraint or descriptive/imperative prose without either AP2 binding form or a declaration endpoint used by that form. AP2 excludes Markdown artifact mentions as bindings; the actual invocation, routine inputs/exports and leaf output declarations are separately applicable. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 5551fe05b667e60209399004

Row: corpus/qualification/workflow.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses directing emission. This row is a declaration, description, retention/destination constraint, identifier or call/binding/graph construct and contains no emitting instruction. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — The complete corpus/qualification/workflow.yaml source contains only identifiers, call/binding/graph structure or an ancestor capability/destination constraint. None of these rows is a technique Protocol instruction or Rules clause directing artifact emission; AP1 names these exclusions. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 263ad09bd2d440e2a894ee63

Row: corpus/qualification/workflow.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — DP-01 excludes independent checks of files without a leaf Destination declaration. The complete source contains activity/routine/workflow structure, with no leaf Destination; its relationship rows are mapped separately. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — The complete corpus/qualification/workflow.yaml source has no leaf Destination declaration. DP1 explicitly excludes independent checks of such files; applicable relationship rows separately carry the executing context to produce. This N decision does not assert that any leaf destination passes. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell e5c1842a573eccbf8d7d7e60

Row: corpus/qualification/workflow.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — DP-02 requires a finite initialActivity-to-null path in the complete workflow graph. This row supplies an entry, graph edge, graph relationship or the whole workflow; its decision requires the entire captured graph. Row: @element.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Each named row supplies the workflow entry, graph structure/exit, graph relationship or whole element. DP2 requires a complete initialActivity-to-null path assessment. The captured graph starts at run and has done -> run; the full graph is evidence, and local identifier agreement cannot decide the invariant. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — DP-02 fails as a whole-workflow invariant: initialActivity is run, and the entire graph's sole exit is run.done -> run. No null destination or alternative reachable terminating path exists. Matching the run activity ID does not establish termination, and activity/routine steps add no graph exits. This is Live/Critical because the workflow is structurally nonterminating; origin diff follows the touched graph. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 30d521174c6c7f6c4a8579ad

Row: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: @relationship/27bf829b0e84c593.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — These graph or ancestor relationships do not themselves specify a routine argument-key comparison or a step.output export. AP2 limits its binding contract to those two forms. Captured endpoint context is retained without treating every reference as a binding. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell ff07daa2c799e9750e2df8bc

Row: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses. This row is a call, graph or inheritance relationship, not an emitting instruction; call/binding/graph constructs are expressly outside its emitting construct. Row: @relationship/27bf829b0e84c593.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row is a call, graph or inheritance relationship. AP1 expressly excludes these constructs from emitting instructions. A leaf instruction cited as context remains represented by its own instruction/section rows; the relationship itself issues no emission directive. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell f442830158e33a5d097e4514

Row: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — DP-01 explicitly includes call and inheritance relationships. This row carries qualification to run, deliver and produce, or binds produce to the ancestor archive requirement. Row: @relationship/27bf829b0e84c593.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named relationship is a link in qualification -> run/delivery -> deliver/emit -> produce or the produce-to-TECHNIQUE.md inheritance link. DP1 explicitly carries the inherited rule through these relationships to the concrete leaf. Full execution and ancestor evidence supports the exact A reasons. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — DP-01 fails: the qualification/run/delivery/deliver/emit execution context resolves produce under qualification's techniques ancestor. Ancestor line 5 requires archive; leaf line 12 declares public. Each assigned relationship carries that same inherited requirement to the leaf. The actual defect is the leaf declaration, not the ancestor or relationship row. Live/High reflects a propagating destination violation; origin diff follows the touched leaf. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 3f2fc1d2f91b27a5d46f0504

Row: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — DP-02 requires a finite initialActivity-to-null path in the complete workflow graph. This row supplies an entry, graph edge, graph relationship or the whole workflow; its decision requires the entire captured graph. Row: @relationship/27bf829b0e84c593.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row supplies the workflow entry, graph structure/exit, graph relationship or whole element. DP2 requires a complete initialActivity-to-null path assessment. The captured graph starts at run and has done -> run; the full graph is evidence, and local identifier agreement cannot decide the invariant. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — DP-02 fails as a whole-workflow invariant: initialActivity is run, and the entire graph's sole exit is run.done -> run. No null destination or alternative reachable terminating path exists. Matching the run activity ID does not establish termination, and activity/routine steps add no graph exits. This is Live/Critical because the workflow is structurally nonterminating; origin diff follows the touched graph. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 94b820a882f196103f835741

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: @relationship/3b27fd01db44f877.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — These graph or ancestor relationships do not themselves specify a routine argument-key comparison or a step.output export. AP2 limits its binding contract to those two forms. Captured endpoint context is retained without treating every reference as a binding. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell f30ba6f42d4230bf27814f3a

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses. This row is a call, graph or inheritance relationship, not an emitting instruction; call/binding/graph constructs are expressly outside its emitting construct. Row: @relationship/3b27fd01db44f877.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row is a call, graph or inheritance relationship. AP1 expressly excludes these constructs from emitting instructions. A leaf instruction cited as context remains represented by its own instruction/section rows; the relationship itself issues no emission directive. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 21f9cfbf2718ad51d2976c98

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — DP-01 explicitly includes call and inheritance relationships. This row carries qualification to run, deliver and produce, or binds produce to the ancestor archive requirement. Row: @relationship/3b27fd01db44f877.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named relationship is a link in qualification -> run/delivery -> deliver/emit -> produce or the produce-to-TECHNIQUE.md inheritance link. DP1 explicitly carries the inherited rule through these relationships to the concrete leaf. Full execution and ancestor evidence supports the exact A reasons. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — DP-01 fails: the qualification/run/delivery/deliver/emit execution context resolves produce under qualification's techniques ancestor. Ancestor line 5 requires archive; leaf line 12 declares public. Each assigned relationship carries that same inherited requirement to the leaf. The actual defect is the leaf declaration, not the ancestor or relationship row. Live/High reflects a propagating destination violation; origin diff follows the touched leaf. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 8862878198e6198ef77c1f28

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — DP-02 requires a finite initialActivity-to-null path in the complete workflow graph. This row supplies an entry, graph edge, graph relationship or the whole workflow; its decision requires the entire captured graph. Row: @relationship/3b27fd01db44f877.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row supplies the workflow entry, graph structure/exit, graph relationship or whole element. DP2 requires a complete initialActivity-to-null path assessment. The captured graph starts at run and has done -> run; the full graph is evidence, and local identifier agreement cannot decide the invariant. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — DP-02 fails as a whole-workflow invariant: initialActivity is run, and the entire graph's sole exit is run.done -> run. No null destination or alternative reachable terminating path exists. Matching the run activity ID does not establish termination, and activity/routine steps add no graph exits. This is Live/Critical because the workflow is structurally nonterminating; origin diff follows the touched graph. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 8020bba4283a65b31df0f113

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: @relationship/475a98faaf5b9a55.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — These graph or ancestor relationships do not themselves specify a routine argument-key comparison or a step.output export. AP2 limits its binding contract to those two forms. Captured endpoint context is retained without treating every reference as a binding. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell ca06cc90126da20e026a0486

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses. This row is a call, graph or inheritance relationship, not an emitting instruction; call/binding/graph constructs are expressly outside its emitting construct. Row: @relationship/475a98faaf5b9a55.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row is a call, graph or inheritance relationship. AP1 expressly excludes these constructs from emitting instructions. A leaf instruction cited as context remains represented by its own instruction/section rows; the relationship itself issues no emission directive. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 32efcf3836cf4d26fc113577

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — DP-01 explicitly includes call and inheritance relationships. This row carries qualification to run, deliver and produce, or binds produce to the ancestor archive requirement. Row: @relationship/475a98faaf5b9a55.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named relationship is a link in qualification -> run/delivery -> deliver/emit -> produce or the produce-to-TECHNIQUE.md inheritance link. DP1 explicitly carries the inherited rule through these relationships to the concrete leaf. Full execution and ancestor evidence supports the exact A reasons. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — DP-01 fails: the qualification/run/delivery/deliver/emit execution context resolves produce under qualification's techniques ancestor. Ancestor line 5 requires archive; leaf line 12 declares public. Each assigned relationship carries that same inherited requirement to the leaf. The actual defect is the leaf declaration, not the ancestor or relationship row. Live/High reflects a propagating destination violation; origin diff follows the touched leaf. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 48da822c85267d96ea48c4c2

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — DP-02 requires a finite initialActivity-to-null path in the complete workflow graph. This row supplies an entry, graph edge, graph relationship or the whole workflow; its decision requires the entire captured graph. Row: @relationship/475a98faaf5b9a55.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row supplies the workflow entry, graph structure/exit, graph relationship or whole element. DP2 requires a complete initialActivity-to-null path assessment. The captured graph starts at run and has done -> run; the full graph is evidence, and local identifier agreement cannot decide the invariant. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — DP-02 fails as a whole-workflow invariant: initialActivity is run, and the entire graph's sole exit is run.done -> run. No null destination or alternative reachable terminating path exists. Matching the run activity ID does not establish termination, and activity/routine steps add no graph exits. This is Live/Critical because the workflow is structurally nonterminating; origin diff follows the touched graph. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell f0755acc68e9a62e580665a3

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — AP-02 Detect is limited to activity routine-argument contracts and routine step.output bindings. This row is an unrelated identifier, prose constraint, graph or ancestor relationship, with neither specified binding nor its compared declaration. Row: @relationship/aa4b84de66a9776b.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — These graph or ancestor relationships do not themselves specify a routine argument-key comparison or a step.output export. AP2 limits its binding contract to those two forms. Captured endpoint context is retained without treating every reference as a binding. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 96797ae8488cf51f8878572b

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — AP-01 scopes technique Protocol instructions and Rules clauses. This row is a call, graph or inheritance relationship, not an emitting instruction; call/binding/graph constructs are expressly outside its emitting construct. Row: @relationship/aa4b84de66a9776b.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row is a call, graph or inheritance relationship. AP1 expressly excludes these constructs from emitting instructions. A leaf instruction cited as context remains represented by its own instruction/section rows; the relationship itself issues no emission directive. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell dafc343685f5a84041beee97

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — DP-01 explicitly includes call and inheritance relationships. This row carries qualification to run, deliver and produce, or binds produce to the ancestor archive requirement. Row: @relationship/aa4b84de66a9776b.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

Verification: verified — Each named relationship is a link in qualification -> run/delivery -> deliver/emit -> produce or the produce-to-TECHNIQUE.md inheritance link. DP1 explicitly carries the inherited rule through these relationships to the concrete leaf. Full execution and ancestor evidence supports the exact A reasons. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — DP-01 fails: the qualification/run/delivery/deliver/emit execution context resolves produce under qualification's techniques ancestor. Ancestor line 5 requires archive; leaf line 12 declares public. Each assigned relationship carries that same inherited requirement to the leaf. The actual defect is the leaf declaration, not the ancestor or relationship row. Live/High reflects a propagating destination violation; origin diff follows the touched leaf. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

## Cell 5453a725eb6086baaa72c972

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — DP-02 requires a finite initialActivity-to-null path in the complete workflow graph. This row supplies an entry, graph edge, graph relationship or the whole workflow; its decision requires the entire captured graph. Row: @relationship/aa4b84de66a9776b.

Agent: /root/qualify_author_one

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

Verification: verified — Each named row supplies the workflow entry, graph structure/exit, graph relationship or whole element. DP2 requires a complete initialActivity-to-null path assessment. The captured graph starts at run and has done -> run; the full graph is evidence, and local identifier agreement cannot decide the invariant. The exact mapped disposition, reason and evidence were independently checked and agree with these source facts.

Agent: /root/qualify_verify_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — DP-02 fails as a whole-workflow invariant: initialActivity is run, and the entire graph's sole exit is run.done -> run. No null destination or alternative reachable terminating path exists. Matching the run activity ID does not establish termination, and activity/routine steps add no graph exits. This is Live/Critical because the workflow is structurally nonterminating; origin diff follows the touched graph. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
