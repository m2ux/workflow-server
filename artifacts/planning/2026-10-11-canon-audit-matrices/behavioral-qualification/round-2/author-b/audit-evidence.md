# Audit Evidence

Snapshot: 2debad79d3f7bd7d84f96cd02ea06bdc26977ca87424e347e08eb9598ba2f5cd

## Cell 588e9afc6de79e4e15622316

Row: corpus/qualification/activities/run.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The activity identifier declares run. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 0782b255d289b2d8aaa260a8

Row: corpus/qualification/activities/run.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The activity identifier declares run. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a93639cc3c5c1ad866587c2e

Row: corpus/qualification/activities/run.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The activity identifier declares run. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/workflow.yaml#@element, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7d5cdef67a14fe0a0e70a8ff

Row: corpus/qualification/activities/run.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The activity identifier declares run. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fc60645fdab03b4f360b972e

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The activity steps contain the concrete delivery invocation of deliver and its argument-key set. AP-02 binding contract (1) compares each concrete activity routine invocation argument-key set with the selected routine Inputs. This row is that invocation, its selector or argument key, its Inputs authority, or their direct call relationship. Matching keys would still require evaluation; sealed is only an opaque argument value.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (1) compares the concrete run.delivery invocation argument-key set at activity line 6 with deliver Inputs at routine line 2. These rows expose the invocation, selector, key container/key, declared input endpoint, containing element or direct call relationship. The captured exact key names must be compared during evaluation even when they match; sealed is an opaque value. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The concrete delivery invocation supplies exactly {packet}, while deliver Inputs requires [envelope]. With no optional parameters or aliases, the required input is unbound and the supplied key is outside the contract. This is a structurally broken live invocation. The activity belongs to scope.paths, establishing diff attribution without a Git-base claim. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

## Cell 69bbe5f010e4e9c6cc42b36b

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The activity steps contain the concrete delivery invocation of deliver and its argument-key set. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 330d9855c61f1fa6db1e92b2

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The activity steps contain the concrete delivery invocation of deliver and its argument-key set. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell ec7e3577667dbf0846b7b09f

Row: corpus/qualification/activities/run.yaml#/steps

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The activity steps contain the concrete delivery invocation of deliver and its argument-key set. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ece85719689c1a3411d52a12

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The delivery step contains the concrete deliver invocation and its argument-key set. AP-02 binding contract (1) compares each concrete activity routine invocation argument-key set with the selected routine Inputs. This row is that invocation, its selector or argument key, its Inputs authority, or their direct call relationship. Matching keys would still require evaluation; sealed is only an opaque argument value.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (1) compares the concrete run.delivery invocation argument-key set at activity line 6 with deliver Inputs at routine line 2. These rows expose the invocation, selector, key container/key, declared input endpoint, containing element or direct call relationship. The captured exact key names must be compared during evaluation even when they match; sealed is an opaque value. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The concrete delivery invocation supplies exactly {packet}, while deliver Inputs requires [envelope]. With no optional parameters or aliases, the required input is unbound and the supplied key is outside the contract. This is a structurally broken live invocation. The activity belongs to scope.paths, establishing diff attribution without a Git-base claim. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

## Cell 4c9b9e3283acb76acd0c593c

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The delivery step contains the concrete deliver invocation and its argument-key set. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a5b35e7460c5ba032ea3ab9c

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The delivery step contains the concrete deliver invocation and its argument-key set. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell eaf04cb03551645c38d72842

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The delivery step contains the concrete deliver invocation and its argument-key set. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 03b141fa3c167d6b5347f32a

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The activity step identifier declares delivery; it is not the routine output step reference emit. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell eb0acb5f69509bc093ccb4c4

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The activity step identifier declares delivery; it is not the routine output step reference emit. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell a09b4b5068e60047e85b9d20

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The activity step identifier declares delivery; it is not the routine output step reference emit. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 51923b360aa3ef1a7585fbf4

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The activity step identifier declares delivery; it is not the routine output step reference emit. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 366a1ced08e276234b09d365

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The routine invocation selects deliver and supplies its argument-key set. AP-02 binding contract (1) compares each concrete activity routine invocation argument-key set with the selected routine Inputs. This row is that invocation, its selector or argument key, its Inputs authority, or their direct call relationship. Matching keys would still require evaluation; sealed is only an opaque argument value.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (1) compares the concrete run.delivery invocation argument-key set at activity line 6 with deliver Inputs at routine line 2. These rows expose the invocation, selector, key container/key, declared input endpoint, containing element or direct call relationship. The captured exact key names must be compared during evaluation even when they match; sealed is an opaque value. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The concrete delivery invocation supplies exactly {packet}, while deliver Inputs requires [envelope]. With no optional parameters or aliases, the required input is unbound and the supplied key is outside the contract. This is a structurally broken live invocation. The activity belongs to scope.paths, establishing diff attribution without a Git-base claim. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

## Cell 8f71acc678543f1dedd6da64

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine invocation selects deliver and supplies its argument-key set. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 4e129aea04e56ac3f5e18eac

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The routine invocation selects deliver and supplies its argument-key set. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7fa24663abc3348858407cd5

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine invocation selects deliver and supplies its argument-key set. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e4e1d36386ad37dc4007d953

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The arguments object supplies the key set for this concrete invocation of deliver. AP-02 binding contract (1) compares each concrete activity routine invocation argument-key set with the selected routine Inputs. This row is that invocation, its selector or argument key, its Inputs authority, or their direct call relationship. Matching keys would still require evaluation; sealed is only an opaque argument value.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (1) compares the concrete run.delivery invocation argument-key set at activity line 6 with deliver Inputs at routine line 2. These rows expose the invocation, selector, key container/key, declared input endpoint, containing element or direct call relationship. The captured exact key names must be compared during evaluation even when they match; sealed is an opaque value. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The concrete delivery invocation supplies exactly {packet}, while deliver Inputs requires [envelope]. With no optional parameters or aliases, the required input is unbound and the supplied key is outside the contract. This is a structurally broken live invocation. The activity belongs to scope.paths, establishing diff attribution without a Git-base claim. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

## Cell 85d58778322169b7eb358fb2

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The arguments object supplies the key set for this concrete invocation of deliver. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 235d809af28915c83b47a336

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The arguments object supplies the key set for this concrete invocation of deliver. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 8f04699d8cada26b1b7ebcc5

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The arguments object supplies the key set for this concrete invocation of deliver. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell f1186a7f61ea9f6493402006

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The invocation supplies the argument key packet with the opaque value sealed. AP-02 binding contract (1) compares each concrete activity routine invocation argument-key set with the selected routine Inputs. This row is that invocation, its selector or argument key, its Inputs authority, or their direct call relationship. Matching keys would still require evaluation; sealed is only an opaque argument value.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (1) compares the concrete run.delivery invocation argument-key set at activity line 6 with deliver Inputs at routine line 2. These rows expose the invocation, selector, key container/key, declared input endpoint, containing element or direct call relationship. The captured exact key names must be compared during evaluation even when they match; sealed is an opaque value. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The concrete delivery invocation supplies exactly {packet}, while deliver Inputs requires [envelope]. With no optional parameters or aliases, the required input is unbound and the supplied key is outside the contract. This is a structurally broken live invocation. The activity belongs to scope.paths, establishing diff attribution without a Git-base claim. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

## Cell 460145b3f2b47abf7cc6997a

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The invocation supplies the argument key packet with the opaque value sealed. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 272c678aed06a8e25584080e

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The invocation supplies the argument key packet with the opaque value sealed. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell accbcdab5de3e41546023b48

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The invocation supplies the argument key packet with the opaque value sealed. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 23d52f087c143d67f67da445

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The invocation name deliver selects the routine whose Inputs must be compared with this invocation. AP-02 binding contract (1) compares each concrete activity routine invocation argument-key set with the selected routine Inputs. This row is that invocation, its selector or argument key, its Inputs authority, or their direct call relationship. Matching keys would still require evaluation; sealed is only an opaque argument value.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (1) compares the concrete run.delivery invocation argument-key set at activity line 6 with deliver Inputs at routine line 2. These rows expose the invocation, selector, key container/key, declared input endpoint, containing element or direct call relationship. The captured exact key names must be compared during evaluation even when they match; sealed is an opaque value. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The concrete delivery invocation supplies exactly {packet}, while deliver Inputs requires [envelope]. With no optional parameters or aliases, the required input is unbound and the supplied key is outside the contract. This is a structurally broken live invocation. The activity belongs to scope.paths, establishing diff attribution without a Git-base claim. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

## Cell 7a49531ccbd7063bf5c4dd03

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The invocation name deliver selects the routine whose Inputs must be compared with this invocation. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell cced7364e2269714c048fe3b

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The invocation name deliver selects the routine whose Inputs must be compared with this invocation. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 501147c7c9cf63d456cc367b

Row: corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The invocation name deliver selects the routine whose Inputs must be compared with this invocation. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b331b3631bac4371bfebf008

Row: corpus/qualification/activities/run.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The whole activity includes its concrete deliver invocation and argument-key set. AP-02 binding contract (1) compares each concrete activity routine invocation argument-key set with the selected routine Inputs. This row is that invocation, its selector or argument key, its Inputs authority, or their direct call relationship. Matching keys would still require evaluation; sealed is only an opaque argument value.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (1) compares the concrete run.delivery invocation argument-key set at activity line 6 with deliver Inputs at routine line 2. These rows expose the invocation, selector, key container/key, declared input endpoint, containing element or direct call relationship. The captured exact key names must be compared during evaluation even when they match; sealed is an opaque value. Assigned rows: corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The concrete delivery invocation supplies exactly {packet}, while deliver Inputs requires [envelope]. With no optional parameters or aliases, the required input is unbound and the supplied key is outside the contract. This is a structurally broken live invocation. The activity belongs to scope.paths, establishing diff attribution without a Git-base claim. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

## Cell 6d000a7587cb7a720d3ce09a

Row: corpus/qualification/activities/run.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The whole activity includes its concrete deliver invocation and argument-key set. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell fd8572c700cc4625bf5e2e78

Row: corpus/qualification/activities/run.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The whole activity includes its concrete deliver invocation and argument-key set. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/workflow.yaml#@element, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 8b3b602b6703003326b8df8d

Row: corpus/qualification/activities/run.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The whole activity includes its concrete deliver invocation and argument-key set. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell eeab805ea4653756496776b5

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The call relationship binds run delivery to deliver, whose emit step invokes produce in qualification. AP-02 binding contract (1) compares each concrete activity routine invocation argument-key set with the selected routine Inputs. This row is that invocation, its selector or argument key, its Inputs authority, or their direct call relationship. Matching keys would still require evaluation; sealed is only an opaque argument value.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (1) compares the concrete run.delivery invocation argument-key set at activity line 6 with deliver Inputs at routine line 2. These rows expose the invocation, selector, key container/key, declared input endpoint, containing element or direct call relationship. The captured exact key names must be compared during evaluation even when they match; sealed is an opaque value. Assigned rows: corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The concrete run delivery invocation names deliver but passes exactly {packet}; deliver requires [envelope] and the dialect supplies no aliases or optional inputs. The required input remains unbound (Live/Critical). The activity is a declared changed definition in scope.paths, so attribution is diff. Assigned rows: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

## Cell e42353cfc8fe3169b809b996

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The call relationship binds run delivery to deliver, whose emit step invokes produce in qualification. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 91a7785154a1a018658ccae8

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — The call relationship binds run delivery to deliver, whose emit step invokes produce in qualification. DP-01 explicitly requires call and inheritance relationships to carry the required Destination to the executing leaf instance. This relationship is part of qualification/run/delivery/deliver/emit/produce and its qualification TECHNIQUE.md inheritance; the complete captured chain supports the later leaf-versus-ancestor comparison.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified A: the listed explicit call/inheritance relationships connect qualification run.delivery to deliver.emit/produce and its qualification TECHNIQUE.md ancestor. DP-01 expressly requires those relationships to carry the inherited requirement to the executing leaf. All five concrete context sources were read, so this is an instance-context judgment rather than an independent check of a file without a leaf declaration. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — The captured qualification -> run/delivery -> deliver/emit -> produce chain binds the leaf to qualification/techniques/TECHNIQUE.md. Its inherited Rules require Destination archive; the leaf's own Rules declare Destination public. DP1 compares these values on the executing leaf, so the leaf declaration is the defect. This incompatible inherited contract propagates into the concrete execution instance (Contract/High). The leaf is declared changed in scope.paths, giving diff attribution. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 36c8e451b93d39512aae352f

Row: corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The call relationship binds run delivery to deliver, whose emit step invokes produce in qualification. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell bfa09024c94a6bc76d51c631

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The routine identifier declares deliver; this row contains no input declaration or output-step binding. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 9156a757fd93955348ca5766

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine identifier declares deliver; this row contains no input declaration or output-step binding. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell bf312e511dcc8f4eda77a41a

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The routine identifier declares deliver; this row contains no input declaration or output-step binding. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/workflow.yaml#@element, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell a0e70a1645458e99657058ca

Row: corpus/qualification/routines/deliver.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine identifier declares deliver; this row contains no input declaration or output-step binding. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

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

Applicability: A — The routine Inputs list declares envelope, the key-set contract for concrete activity invocations. AP-02 binding contract (1) compares each concrete activity routine invocation argument-key set with the selected routine Inputs. This row is that invocation, its selector or argument key, its Inputs authority, or their direct call relationship. Matching keys would still require evaluation; sealed is only an opaque argument value.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (1) compares the concrete run.delivery invocation argument-key set at activity line 6 with deliver Inputs at routine line 2. These rows expose the invocation, selector, key container/key, declared input endpoint, containing element or direct call relationship. The captured exact key names must be compared during evaluation even when they match; sealed is an opaque value. Assigned rows: corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The concrete delivery invocation supplies exactly {packet}, while deliver Inputs requires [envelope]. With no optional parameters or aliases, the required input is unbound and the supplied key is outside the contract. This is a structurally broken live invocation. The activity belongs to scope.paths, establishing diff attribution without a Git-base claim. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

## Cell 2e52133101ac058519a8aa51

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine Inputs list declares envelope, the key-set contract for concrete activity invocations. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell cf440ff1717daba3ba33af52

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The routine Inputs list declares envelope, the key-set contract for concrete activity invocations. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/workflow.yaml#@element, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0e0de76a45b1ce5cc0a55a2d

Row: corpus/qualification/routines/deliver.yaml#/inputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine Inputs list declares envelope, the key-set contract for concrete activity invocations. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 85e68983cef9c8b0f9a7bf33

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The routine input entry declares envelope, a member of the required invocation key set. AP-02 binding contract (1) compares each concrete activity routine invocation argument-key set with the selected routine Inputs. This row is that invocation, its selector or argument key, its Inputs authority, or their direct call relationship. Matching keys would still require evaluation; sealed is only an opaque argument value.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (1) compares the concrete run.delivery invocation argument-key set at activity line 6 with deliver Inputs at routine line 2. These rows expose the invocation, selector, key container/key, declared input endpoint, containing element or direct call relationship. The captured exact key names must be compared during evaluation even when they match; sealed is an opaque value. Assigned rows: corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The concrete delivery invocation supplies exactly {packet}, while deliver Inputs requires [envelope]. With no optional parameters or aliases, the required input is unbound and the supplied key is outside the contract. This is a structurally broken live invocation. The activity belongs to scope.paths, establishing diff attribution without a Git-base claim. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6

## Cell 8d0a1adc7b4ff87710b48af6

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine input entry declares envelope, a member of the required invocation key set. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell af24593c352cedfdf9a972fa

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The routine input entry declares envelope, a member of the required invocation key set. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/workflow.yaml#@element, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0dfaae8a980c43d6afea14bc

Row: corpus/qualification/routines/deliver.yaml#/inputs/0

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine input entry declares envelope, a member of the required invocation key set. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 1682a187cf7dd36419e2a143

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The routine Outputs object binds exported report to emit.report. AP-02 binding contract (2) resolves routine Outputs emit.report through step emit to produce and compares report with the technique Outputs heading names. This row supplies the export binding, its step/technique resolution, or the declared output-name set. A matching declaration remains an applicable contract.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (2) resolves routine line 3 emit.report through emit at lines 5-6 to the produce Outputs heading at line 5. These rows supply that exported binding, its named step/technique resolution endpoint, output-name declaration or containing element. An exact match remains applicable; Markdown report mentions elsewhere do not supply this binding. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The routine export report is bound to emit.report. Resolving emit selects produce, whose complete Outputs section declares only summary; report is absent. The output binding cannot resolve and is structurally broken. The consumer break depends on the producer's declared changed output contract in scope.paths, so origin is diff without asserting historical base equality. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 8f64e24f8a4caa9482d28228

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine Outputs object binds exported report to emit.report. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell ab40e04b150dd3790c5764db

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The routine Outputs object binds exported report to emit.report. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7c49f2961aec4917ed955bd7

Row: corpus/qualification/routines/deliver.yaml#/outputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine Outputs object binds exported report to emit.report. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 7f71a92e9f425b2094dec98d

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The exported routine output report is bound to emit.report. AP-02 binding contract (2) resolves routine Outputs emit.report through step emit to produce and compares report with the technique Outputs heading names. This row supplies the export binding, its step/technique resolution, or the declared output-name set. A matching declaration remains an applicable contract.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (2) resolves routine line 3 emit.report through emit at lines 5-6 to the produce Outputs heading at line 5. These rows supply that exported binding, its named step/technique resolution endpoint, output-name declaration or containing element. An exact match remains applicable; Markdown report mentions elsewhere do not supply this binding. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The routine export report is bound to emit.report. Resolving emit selects produce, whose complete Outputs section declares only summary; report is absent. The output binding cannot resolve and is structurally broken. The consumer break depends on the producer's declared changed output contract in scope.paths, so origin is diff without asserting historical base equality. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 232c484eaf1003ef830d4ffa

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The exported routine output report is bound to emit.report. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 791a31ca8731b94c89d67e5c

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The exported routine output report is bound to emit.report. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell ad7314b738ea597d93ae3b23

Row: corpus/qualification/routines/deliver.yaml#/outputs/report

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The exported routine output report is bound to emit.report. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 82c8e910cc4b4df96a89e369

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The routine steps resolve emit.report through step emit to technique produce. AP-02 binding contract (2) resolves routine Outputs emit.report through step emit to produce and compares report with the technique Outputs heading names. This row supplies the export binding, its step/technique resolution, or the declared output-name set. A matching declaration remains an applicable contract.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (2) resolves routine line 3 emit.report through emit at lines 5-6 to the produce Outputs heading at line 5. These rows supply that exported binding, its named step/technique resolution endpoint, output-name declaration or containing element. An exact match remains applicable; Markdown report mentions elsewhere do not supply this binding. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The routine export report is bound to emit.report. Resolving emit selects produce, whose complete Outputs section declares only summary; report is absent. The output binding cannot resolve and is structurally broken. The consumer break depends on the producer's declared changed output contract in scope.paths, so origin is diff without asserting historical base equality. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell cbb292d61ff63c7740d065be

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine steps resolve emit.report through step emit to technique produce. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 2228315b4ed81fce11373514

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The routine steps resolve emit.report through step emit to technique produce. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell f82d1cd9016de1cdd797e170

Row: corpus/qualification/routines/deliver.yaml#/steps

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine steps resolve emit.report through step emit to technique produce. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 790b168511688f3580f49f17

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The emit step resolves the step-id part of the routine output binding and calls produce. AP-02 binding contract (2) resolves routine Outputs emit.report through step emit to produce and compares report with the technique Outputs heading names. This row supplies the export binding, its step/technique resolution, or the declared output-name set. A matching declaration remains an applicable contract.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (2) resolves routine line 3 emit.report through emit at lines 5-6 to the produce Outputs heading at line 5. These rows supply that exported binding, its named step/technique resolution endpoint, output-name declaration or containing element. An exact match remains applicable; Markdown report mentions elsewhere do not supply this binding. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The routine export report is bound to emit.report. Resolving emit selects produce, whose complete Outputs section declares only summary; report is absent. The output binding cannot resolve and is structurally broken. The consumer break depends on the producer's declared changed output contract in scope.paths, so origin is diff without asserting historical base equality. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell bbb0ef5214ae8bbcce715c65

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The emit step resolves the step-id part of the routine output binding and calls produce. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 2160f33c3a701883bf507397

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The emit step resolves the step-id part of the routine output binding and calls produce. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 569231fa0b1023abbf3fc5e4

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The emit step resolves the step-id part of the routine output binding and calls produce. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e6707d2a492bbb28eafc3a21

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The step identifier emit is the step-id selected by the binding emit.report. AP-02 binding contract (2) resolves routine Outputs emit.report through step emit to produce and compares report with the technique Outputs heading names. This row supplies the export binding, its step/technique resolution, or the declared output-name set. A matching declaration remains an applicable contract.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (2) resolves routine line 3 emit.report through emit at lines 5-6 to the produce Outputs heading at line 5. These rows supply that exported binding, its named step/technique resolution endpoint, output-name declaration or containing element. An exact match remains applicable; Markdown report mentions elsewhere do not supply this binding. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The routine export report is bound to emit.report. Resolving emit selects produce, whose complete Outputs section declares only summary; report is absent. The output binding cannot resolve and is structurally broken. The consumer break depends on the producer's declared changed output contract in scope.paths, so origin is diff without asserting historical base equality. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 71fd5507f4b74e2ec91c2b3e

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The step identifier emit is the step-id selected by the binding emit.report. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b707f101a68f594abdbb9fc8

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The step identifier emit is the step-id selected by the binding emit.report. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7567be6ff4d583433092c972

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The step identifier emit is the step-id selected by the binding emit.report. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 387b3abcf94e6a19aabbf992

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The technique reference produce selects the output declaration authority for emit.report. AP-02 binding contract (2) resolves routine Outputs emit.report through step emit to produce and compares report with the technique Outputs heading names. This row supplies the export binding, its step/technique resolution, or the declared output-name set. A matching declaration remains an applicable contract.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (2) resolves routine line 3 emit.report through emit at lines 5-6 to the produce Outputs heading at line 5. These rows supply that exported binding, its named step/technique resolution endpoint, output-name declaration or containing element. An exact match remains applicable; Markdown report mentions elsewhere do not supply this binding. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The routine export report is bound to emit.report. Resolving emit selects produce, whose complete Outputs section declares only summary; report is absent. The output binding cannot resolve and is structurally broken. The consumer break depends on the producer's declared changed output contract in scope.paths, so origin is diff without asserting historical base equality. Assigned rows: corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell f2a200e38a51bc411ee5e057

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The technique reference produce selects the output declaration authority for emit.report. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell d5d35100c716e2ed184e7476

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The technique reference produce selects the output declaration authority for emit.report. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 90bd5ed8d7c0859a6fbe41a1

Row: corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The technique reference produce selects the output declaration authority for emit.report. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fa301823ccd44ed9374ce575

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The whole routine declares Inputs envelope, exports emit.report, and resolves emit to produce. AP-02 reaches both concrete routine invocation argument keys versus Inputs and exported step.output bindings versus the called technique Outputs. This row preserves the Inputs and output-resolution contract together with the captured invocation context.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: the whole routine and explicit execution instance expose both AP-02 contracts. The activity argument set must match deliver Inputs, and deliver outputs.report must resolve emit.report through emit to a declared produce output. The full workflow/activity/routine/leaf/ancestor context supports the concrete invocation; evaluating one contract cannot substitute for evaluating the other. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/routines/deliver.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — Both independent AP-02 contracts fail in this captured invocation. Delivery passes {packet} while deliver Inputs requires [envelope]. Separately, outputs.report binds emit.report although emit calls produce with only summary declared. These are distinct structurally broken live bindings and both are reported. The invocation is in scope.paths; the export break depends on the declared changed producer contract, so both have diff origin without a Git-base claim. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/routines/deliver.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 2ec151da2546cd9066780932

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The whole routine declares Inputs envelope, exports emit.report, and resolves emit to produce. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 65dd3d64e8c54c7713685121

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The whole routine declares Inputs envelope, exports emit.report, and resolves emit to produce. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/workflow.yaml#@element, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 19723157905da0f5874e77db

Row: corpus/qualification/routines/deliver.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The whole routine declares Inputs envelope, exports emit.report, and resolves emit to produce. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

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

Applicability: A — The routine-to-technique call resolves deliver emit to produce, including its declared outputs and leaf Destination. AP-02 binding contract (2) resolves routine Outputs emit.report through step emit to produce and compares report with the technique Outputs heading names. This row supplies the export binding, its step/technique resolution, or the declared output-name set. A matching declaration remains an applicable contract.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (2) resolves routine line 3 emit.report through emit at lines 5-6 to the produce Outputs heading at line 5. These rows supply that exported binding, its named step/technique resolution endpoint, output-name declaration or containing element. An exact match remains applicable; Markdown report mentions elsewhere do not supply this binding. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The routine report export binds emit.report, but resolving emit to produce reaches a complete Outputs declaration containing only summary. The consumed name report is absent, so this binding is structurally broken (Live/Critical). This closure consumer break depends on the declared changed producer output contract in scope.paths, giving diff origin. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell afeb129e1e03e4f353693950

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The routine-to-technique call resolves deliver emit to produce, including its declared outputs and leaf Destination. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

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

Applicability: A — The routine-to-technique call resolves deliver emit to produce, including its declared outputs and leaf Destination. DP-01 explicitly requires call and inheritance relationships to carry the required Destination to the executing leaf instance. This relationship is part of qualification/run/delivery/deliver/emit/produce and its qualification TECHNIQUE.md inheritance; the complete captured chain supports the later leaf-versus-ancestor comparison.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified A: the listed explicit call/inheritance relationships connect qualification run.delivery to deliver.emit/produce and its qualification TECHNIQUE.md ancestor. DP-01 expressly requires those relationships to carry the inherited requirement to the executing leaf. All five concrete context sources were read, so this is an instance-context judgment rather than an independent check of a file without a leaf declaration. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — The captured qualification -> run/delivery -> deliver/emit -> produce chain binds the leaf to qualification/techniques/TECHNIQUE.md. Its inherited Rules require Destination archive; the leaf's own Rules declare Destination public. DP1 compares these values on the executing leaf, so the leaf declaration is the defect. This incompatible inherited contract propagates into the concrete execution instance (Contract/High). The leaf is declared changed in scope.paths, giving diff attribution. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell a6cc9c95bd8a15eec9337ab9

Row: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The routine-to-technique call resolves deliver emit to produce, including its declared outputs and leaf Destination. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

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

Applicability: A — The explicit execution relationship captures qualification, run delivery, deliver emit, produce, and the inherited TECHNIQUE.md contract. AP-02 reaches both concrete routine invocation argument keys versus Inputs and exported step.output bindings versus the called technique Outputs. This row preserves the Inputs and output-resolution contract together with the captured invocation context.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: the whole routine and explicit execution instance expose both AP-02 contracts. The activity argument set must match deliver Inputs, and deliver outputs.report must resolve emit.report through emit to a declared produce output. The full workflow/activity/routine/leaf/ancestor context supports the concrete invocation; evaluating one contract cannot substitute for evaluating the other. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/routines/deliver.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — Both independent AP-02 contracts fail in this captured invocation. Delivery passes {packet} while deliver Inputs requires [envelope]. Separately, outputs.report binds emit.report although emit calls produce with only summary declared. These are distinct structurally broken live bindings and both are reported. The invocation is in scope.paths; the export break depends on the declared changed producer contract, so both have diff origin without a Git-base claim. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/routines/deliver.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 7b47769dd43afb09823a4b14

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The explicit execution relationship captures qualification, run delivery, deliver emit, produce, and the inherited TECHNIQUE.md contract. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

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

Applicability: A — The explicit execution relationship captures qualification, run delivery, deliver emit, produce, and the inherited TECHNIQUE.md contract. DP-01 explicitly requires call and inheritance relationships to carry the required Destination to the executing leaf instance. This relationship is part of qualification/run/delivery/deliver/emit/produce and its qualification TECHNIQUE.md inheritance; the complete captured chain supports the later leaf-versus-ancestor comparison.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified A: the listed explicit call/inheritance relationships connect qualification run.delivery to deliver.emit/produce and its qualification TECHNIQUE.md ancestor. DP-01 expressly requires those relationships to carry the inherited requirement to the executing leaf. All five concrete context sources were read, so this is an instance-context judgment rather than an independent check of a file without a leaf declaration. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — The captured qualification -> run/delivery -> deliver/emit -> produce chain binds the leaf to qualification/techniques/TECHNIQUE.md. Its inherited Rules require Destination archive; the leaf's own Rules declare Destination public. DP1 compares these values on the executing leaf, so the leaf declaration is the defect. This incompatible inherited contract propagates into the concrete execution instance (Contract/High). The leaf is declared changed in scope.paths, giving diff attribution. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 7616d539ed6effba75237723

Row: corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The explicit execution relationship captures qualification, run delivery, deliver emit, produce, and the inherited TECHNIQUE.md contract. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

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

Applicability: N — The ancestor Capability section describes inherited delivery constraints. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell d9eb0eb2cb8f9fb790e82eee

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The ancestor Capability section describes inherited delivery constraints. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b6ad6f9e4c3bf6bcd7517234

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The ancestor Capability section describes inherited delivery constraints. DP-01 expressly distinguishes the ancestor constraint declaration from a leaf Destination. This row belongs to the ancestor contract, not a leaf instance; the leaf and its inheritance relationship carry the comparison.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these rows belong to the ancestor TECHNIQUE.md, which declares the required archive destination and describes inherited delivery. DP-01 explicitly distinguishes that ancestor constraint from a leaf Destination. The leaf and explicit inheritance/call relationships carry its comparison; the ancestor itself is not another leaf destination. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 0ed30157350f8c23d6297b75

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The ancestor Capability section describes inherited delivery constraints. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell c9c06fb4ee9924c6c63c553f

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The ancestor Capability description says Constrain inherited delivery. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 720f7eeadf6be862dd39b7ab

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The ancestor Capability description says Constrain inherited delivery. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 3dd8981b7cf70f3489f0cb9a

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The ancestor Capability description says Constrain inherited delivery. DP-01 expressly distinguishes the ancestor constraint declaration from a leaf Destination. This row belongs to the ancestor contract, not a leaf instance; the leaf and its inheritance relationship carry the comparison.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these rows belong to the ancestor TECHNIQUE.md, which declares the required archive destination and describes inherited delivery. DP-01 explicitly distinguishes that ancestor constraint from a leaf Destination. The leaf and explicit inheritance/call relationships carry its comparison; the ancestor itself is not another leaf destination. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 62d70a2ce5a077d8010ce9fe

Row: corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The ancestor Capability description says Constrain inherited delivery. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ac42c54bb5e18cc6005d1df7

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The ancestor Rules section declares that Destination must be archive. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 541cffe238719bcc6a46fe77

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The ancestor Rules section declares that Destination must be archive. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b3f616c2c1a987217e5cf61b

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The ancestor Rules section declares that Destination must be archive. DP-01 expressly distinguishes the ancestor constraint declaration from a leaf Destination. This row belongs to the ancestor contract, not a leaf instance; the leaf and its inheritance relationship carry the comparison.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these rows belong to the ancestor TECHNIQUE.md, which declares the required archive destination and describes inherited delivery. DP-01 explicitly distinguishes that ancestor constraint from a leaf Destination. The leaf and explicit inheritance/call relationships carry its comparison; the ancestor itself is not another leaf destination. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell d9b55f0b6cbe3ed6ab868ed5

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The ancestor Rules section declares that Destination must be archive. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell bfde9ab405ad9faa2bc4b5ac

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The ancestor constraint declares that Destination must be archive. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 06d002e75cf36ea1b43c83b1

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The ancestor constraint declares that Destination must be archive. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 67ae926240e520bfdb63b1a3

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The ancestor constraint declares that Destination must be archive. DP-01 expressly distinguishes the ancestor constraint declaration from a leaf Destination. This row belongs to the ancestor contract, not a leaf instance; the leaf and its inheritance relationship carry the comparison.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these rows belong to the ancestor TECHNIQUE.md, which declares the required archive destination and describes inherited delivery. DP-01 explicitly distinguishes that ancestor constraint from a leaf Destination. The leaf and explicit inheritance/call relationships carry its comparison; the ancestor itself is not another leaf destination. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 4da9396f20f50a18673256c5

Row: corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The ancestor constraint declares that Destination must be archive. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 4d029f4ed7a941dc5b13bafa

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The whole ancestor document defines inherited capability and the required archive Destination. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 01bc60dde7d03c634b92d11c

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The whole ancestor document defines inherited capability and the required archive Destination. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 69c0652ae2e85de91e1e5de4

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The whole ancestor document defines inherited capability and the required archive Destination. DP-01 expressly distinguishes the ancestor constraint declaration from a leaf Destination. This row belongs to the ancestor contract, not a leaf instance; the leaf and its inheritance relationship carry the comparison.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these rows belong to the ancestor TECHNIQUE.md, which declares the required archive destination and describes inherited delivery. DP-01 explicitly distinguishes that ancestor constraint from a leaf Destination. The leaf and explicit inheritance/call relationships carry its comparison; the ancestor itself is not another leaf destination. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 54a73e1bf111128988cf03fe

Row: corpus/qualification/techniques/TECHNIQUE.md#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The whole ancestor document defines inherited capability and the required archive Destination. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 4c3a69d6842d941bb1b4ae64

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The leaf Capability section describes producing a report. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell e192558242a4ed960c5d7a46

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The leaf Capability section describes producing a report. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 36ee15fe5284f5e03e6afdc4

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The leaf Capability section describes producing a report. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 6eb38943804944cf6cfbb4ed

Row: corpus/qualification/techniques/produce.md#/capability

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The leaf Capability section describes producing a report. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 883f9febadc76de8d4b64dd6

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — Produce a report is the leaf Capability description. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell e3b51412d1cbb5b26dbb8664

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — Produce a report is the leaf Capability description. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b82b83027689277cdcc2042f

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — Produce a report is the leaf Capability description. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell dadf707dc4833496ce962762

Row: corpus/qualification/techniques/produce.md#/capability/line-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — Produce a report is the leaf Capability description. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell c986d23bf9fe92ac15ab723d

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The leaf Outputs section declares the output-name set against which emit.report is resolved. AP-02 binding contract (2) resolves routine Outputs emit.report through step emit to produce and compares report with the technique Outputs heading names. This row supplies the export binding, its step/technique resolution, or the declared output-name set. A matching declaration remains an applicable contract.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (2) resolves routine line 3 emit.report through emit at lines 5-6 to the produce Outputs heading at line 5. These rows supply that exported binding, its named step/technique resolution endpoint, output-name declaration or containing element. An exact match remains applicable; Markdown report mentions elsewhere do not supply this binding. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The routine report export binds emit.report, but resolving emit to produce reaches a complete Outputs declaration containing only summary. The consumed name report is absent, so this binding is structurally broken (Live/Critical). This closure consumer break depends on the declared changed producer output contract in scope.paths, giving diff origin. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell e00abe344b2cf11c702b34f1

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The leaf Outputs section declares the output-name set against which emit.report is resolved. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell b7876638c82ca7835e6ecd54

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The leaf Outputs section declares the output-name set against which emit.report is resolved. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/workflow.yaml#@element, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 9839de920cafa86c93f9e319

Row: corpus/qualification/techniques/produce.md#/outputs

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The leaf Outputs section declares the output-name set against which emit.report is resolved. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fef2366b0f34a7eda42dc08d

Row: corpus/qualification/techniques/produce.md#/outputs/summary

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The leaf output heading declares summary, a member of the output-name set consumed by emit.report. AP-02 binding contract (2) resolves routine Outputs emit.report through step emit to produce and compares report with the technique Outputs heading names. This row supplies the export binding, its step/technique resolution, or the declared output-name set. A matching declaration remains an applicable contract.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (2) resolves routine line 3 emit.report through emit at lines 5-6 to the produce Outputs heading at line 5. These rows supply that exported binding, its named step/technique resolution endpoint, output-name declaration or containing element. An exact match remains applicable; Markdown report mentions elsewhere do not supply this binding. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The routine report export binds emit.report, but resolving emit to produce reaches a complete Outputs declaration containing only summary. The consumed name report is absent, so this binding is structurally broken (Live/Critical). This closure consumer break depends on the declared changed producer output contract in scope.paths, giving diff origin. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell b055cfe76040cd42f5d207a8

Row: corpus/qualification/techniques/produce.md#/outputs/summary

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The leaf output heading declares summary, a member of the output-name set consumed by emit.report. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 8b527c51fa312ce306f5d8f4

Row: corpus/qualification/techniques/produce.md#/outputs/summary

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The leaf output heading declares summary, a member of the output-name set consumed by emit.report. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/workflow.yaml#@element, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 7e07755f91a05aa3f3a47b42

Row: corpus/qualification/techniques/produce.md#/outputs/summary

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The leaf output heading declares summary, a member of the output-name set consumed by emit.report. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 547682eae905cf61fddd33be

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The leaf Protocol section contains the report emission instruction on line 8. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 668f2c03b5c1dfffd6143cc5

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — The leaf Protocol section contains the report emission instruction on line 8. AP-01 scopes each report-emitting Protocol instruction and Rules clause, including directives that require validation. The presence or absence of validation determines later evaluation, not applicability; compound clauses remain independently testable.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified A from the original AP-01 scope: the leaf Protocol instruction at line 8 and independently testable Rules clause 2 at line 11 direct report emission or its required validation. These rows expose those instructions through the instruction, compound line, section or whole leaf. Correct validation would affect evaluation, not applicability. Assigned rows: corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: finding — Protocol line 8 explicitly directs emission of the report without validation. This instruction independently violates AP-01 and allows an unchecked report to leave the producer (Live/High). The changed leaf in scope.paths establishes diff origin. Assigned rows: corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 533e91f3401233d0974551eb

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The leaf Protocol section contains the report emission instruction on line 8. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell a700a3294be653eb8e533547

Row: corpus/qualification/techniques/produce.md#/protocol

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The leaf Protocol section contains the report emission instruction on line 8. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 0f13f165ba007a4540cef470

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The leaf Protocol instruction on line 8 explicitly addresses report emission and validation. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 7f339716e8d7474fb2512654

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — The leaf Protocol instruction on line 8 explicitly addresses report emission and validation. AP-01 scopes each report-emitting Protocol instruction and Rules clause, including directives that require validation. The presence or absence of validation determines later evaluation, not applicability; compound clauses remain independently testable.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified A from the original AP-01 scope: the leaf Protocol instruction at line 8 and independently testable Rules clause 2 at line 11 direct report emission or its required validation. These rows expose those instructions through the instruction, compound line, section or whole leaf. Correct validation would affect evaluation, not applicability. Assigned rows: corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: finding — Protocol line 8 explicitly directs emission of the report without validation. This instruction independently violates AP-01 and allows an unchecked report to leave the producer (Live/High). The changed leaf in scope.paths establishes diff origin. Assigned rows: corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell fbafce4f79dd46979495549a

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The leaf Protocol instruction on line 8 explicitly addresses report emission and validation. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell cc4fea783a74407b8fdb654e

Row: corpus/qualification/techniques/produce.md#/protocol/line-8

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The leaf Protocol instruction on line 8 explicitly addresses report emission and validation. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell a30b577290e3406e29334f7b

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The leaf Rules section contains a report emission clause on line 11 and a Destination declaration on line 12. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell d10a33e1908da3335366adaa

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — The leaf Rules section contains a report emission clause on line 11 and a Destination declaration on line 12. AP-01 scopes each report-emitting Protocol instruction and Rules clause, including directives that require validation. The presence or absence of validation determines later evaluation, not applicability; compound clauses remain independently testable.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified A from the original AP-01 scope: the leaf Protocol instruction at line 8 and independently testable Rules clause 2 at line 11 direct report emission or its required validation. These rows expose those instructions through the instruction, compound line, section or whole leaf. Correct validation would affect evaluation, not applicability. Assigned rows: corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: finding — Rules line 11 contains two independent clauses. The first retains the report ID; the second explicitly says emit the report without validation. The second clause violates AP-01 independently and allows an unchecked report to leave the producer (Live/High). Retention does not satisfy validation. The changed leaf in scope.paths establishes diff origin. Assigned rows: corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 381dd396d48f156e5b5332ba

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — The leaf Rules section contains a report emission clause on line 11 and a Destination declaration on line 12. DP-01 applies to the leaf Destination declaration. The captured qualification workflow executes run, which invokes deliver emit and then produce; qualification techniques TECHNIQUE.md supplies the inherited required Destination. The declared leaf value requires comparison with that ancestor during evaluation.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified A: produce line 12 is a leaf Destination declaration, exposed by its clause, containing Rules section or whole leaf. DP-01 requires comparison with the executing qualification ancestor requirement at TECHNIQUE.md line 5. The explicit run/delivery/deliver/emit chain identifies that ancestor; matching values would still require evaluation. Assigned rows: corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — The captured qualification -> run/delivery -> deliver/emit -> produce chain binds the leaf to qualification/techniques/TECHNIQUE.md. Its inherited Rules require Destination archive; the leaf's own Rules declare Destination public. DP1 compares these values on the executing leaf, so the leaf declaration is the defect. This incompatible inherited contract propagates into the concrete execution instance (Contract/High). The leaf is declared changed in scope.paths, giving diff attribution. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 21b5df21a5c696fcaa898fbf

Row: corpus/qualification/techniques/produce.md#/rules

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The leaf Rules section contains a report emission clause on line 11 and a Destination declaration on line 12. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 6dff2018269cdd7f6ce3a242

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This compound Rules line has an ID-retention clause and a separate report emission clause. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell a3b7b46de80a7e60f06f33aa

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — This compound Rules line has an ID-retention clause and a separate report emission clause. AP-01 scopes each report-emitting Protocol instruction and Rules clause, including directives that require validation. The presence or absence of validation determines later evaluation, not applicability; compound clauses remain independently testable.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified A from the original AP-01 scope: the leaf Protocol instruction at line 8 and independently testable Rules clause 2 at line 11 direct report emission or its required validation. These rows expose those instructions through the instruction, compound line, section or whole leaf. Correct validation would affect evaluation, not applicability. Assigned rows: corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: finding — Rules line 11 contains two independent clauses. The first retains the report ID; the second explicitly says emit the report without validation. The second clause violates AP-01 independently and allows an unchecked report to leave the producer (Live/High). Retention does not satisfy validation. The changed leaf in scope.paths establishes diff origin. Assigned rows: corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 69a9fd68e24025b700e9bbb1

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — This compound Rules line has an ID-retention clause and a separate report emission clause. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell d4d45cf60920c4360e003cf1

Row: corpus/qualification/techniques/produce.md#/rules/line-11

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — This compound Rules line has an ID-retention clause and a separate report emission clause. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 923c5917ea2c9d4abe29e519

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The first clause is Retain the report ID; its sibling emission clause is a separate row. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 2f83f57df858c2cf145efffc

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The first clause is Retain the report ID; its sibling emission clause is a separate row. AP-01 requires an emission directive. The independently addressed first clause only retains the report ID; retention is explicitly outside emission, and the second clause is judged separately.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N: the separately addressed first clause at produce line 11 only retains the report ID. AP-01 expressly excludes retention clauses from emission directives. The sibling emission clause remains a separate applicable row; its presence cannot make this isolated retention clause an emission instruction. Assigned rows: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9e2179b4c1fbfc73dc6b4981

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The first clause is Retain the report ID; its sibling emission clause is a separate row. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b1c897ef75ecfb0802a40206

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-1

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The first clause is Retain the report ID; its sibling emission clause is a separate row. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell a03eed5b1543ec6c3d53b66c

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The second Rules clause independently directs the treatment of validation for report emission. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 1fff788717e68470ea335f4a

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — The second Rules clause independently directs the treatment of validation for report emission. AP-01 scopes each report-emitting Protocol instruction and Rules clause, including directives that require validation. The presence or absence of validation determines later evaluation, not applicability; compound clauses remain independently testable.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified A from the original AP-01 scope: the leaf Protocol instruction at line 8 and independently testable Rules clause 2 at line 11 direct report emission or its required validation. These rows expose those instructions through the instruction, compound line, section or whole leaf. Correct validation would affect evaluation, not applicability. Assigned rows: corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: finding — Rules line 11 contains two independent clauses. The first retains the report ID; the second explicitly says emit the report without validation. The second clause violates AP-01 independently and allows an unchecked report to leave the producer (Live/High). Retention does not satisfy validation. The changed leaf in scope.paths establishes diff origin. Assigned rows: corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell acca57d9a610cd2900940f11

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The second Rules clause independently directs the treatment of validation for report emission. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b192bf0ffab5454aaf50901a

Row: corpus/qualification/techniques/produce.md#/rules/line-11/clause-2

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The second Rules clause independently directs the treatment of validation for report emission. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell 185e903ef3c4ae26da231a32

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The leaf Rules line declares its Destination value. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 9d43a5459db3bcbd7c1b6759

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The leaf Rules line declares its Destination value. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 355ce3ec841005b898e3d8d3

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — The leaf Rules line declares its Destination value. DP-01 applies to the leaf Destination declaration. The captured qualification workflow executes run, which invokes deliver emit and then produce; qualification techniques TECHNIQUE.md supplies the inherited required Destination. The declared leaf value requires comparison with that ancestor during evaluation.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified A: produce line 12 is a leaf Destination declaration, exposed by its clause, containing Rules section or whole leaf. DP-01 requires comparison with the executing qualification ancestor requirement at TECHNIQUE.md line 5. The explicit run/delivery/deliver/emit chain identifies that ancestor; matching values would still require evaluation. Assigned rows: corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — The captured qualification -> run/delivery -> deliver/emit -> produce chain binds the leaf to qualification/techniques/TECHNIQUE.md. Its inherited Rules require Destination archive; the leaf's own Rules declare Destination public. DP1 compares these values on the executing leaf, so the leaf declaration is the defect. This incompatible inherited contract propagates into the concrete execution instance (Contract/High). The leaf is declared changed in scope.paths, giving diff attribution. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 3e979fb0c7e3eb5836c3cb1a

Row: corpus/qualification/techniques/produce.md#/rules/line-12

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The leaf Rules line declares its Destination value. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell ca1e1515076ec0147e7b8338

Row: corpus/qualification/techniques/produce.md#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: A — The whole leaf declares output names, a Protocol emission instruction, a Rules emission clause, and its Destination. AP-02 binding contract (2) resolves routine Outputs emit.report through step emit to produce and compares report with the technique Outputs heading names. This row supplies the export binding, its step/technique resolution, or the declared output-name set. A matching declaration remains an applicable contract.

Agent: /root/qualify_author_two

- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified A: AP-02 contract (2) resolves routine line 3 emit.report through emit at lines 5-6 to the produce Outputs heading at line 5. These rows supply that exported binding, its named step/technique resolution endpoint, output-name declaration or containing element. An exact match remains applicable; Markdown report mentions elsewhere do not supply this binding. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: finding — The routine report export binds emit.report, but resolving emit to produce reaches a complete Outputs declaration containing only summary. The consumed name report is absent, so this binding is structurally broken (Live/Critical). This closure consumer break depends on the declared changed producer output contract in scope.paths, giving diff origin. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell d074a916d8f80c61b3aa18a0

Row: corpus/qualification/techniques/produce.md#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: A — The whole leaf declares output names, a Protocol emission instruction, a Rules emission clause, and its Destination. AP-01 scopes each report-emitting Protocol instruction and Rules clause, including directives that require validation. The presence or absence of validation determines later evaluation, not applicability; compound clauses remain independently testable.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified A from the original AP-01 scope: the leaf Protocol instruction at line 8 and independently testable Rules clause 2 at line 11 direct report emission or its required validation. These rows expose those instructions through the instruction, compound line, section or whole leaf. Correct validation would affect evaluation, not applicability. Assigned rows: corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: finding — The full leaf has two distinct failing constructs: Protocol line 8 explicitly emits without validation, and Rules line 11 clause 2 independently emits without validation. AP-01 requires each instruction and semicolon-separated clause to satisfy the ordering itself, so both violations remain distinct. Each permits unchecked report emission (Live/High), and both occur in the declared changed leaf (diff). Assigned rows: corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell a406c04573c91f8ad82577e3

Row: corpus/qualification/techniques/produce.md#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — The whole leaf declares output names, a Protocol emission instruction, a Rules emission clause, and its Destination. DP-01 applies to the leaf Destination declaration. The captured qualification workflow executes run, which invokes deliver emit and then produce; qualification techniques TECHNIQUE.md supplies the inherited required Destination. The declared leaf value requires comparison with that ancestor during evaluation.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified A: produce line 12 is a leaf Destination declaration, exposed by its clause, containing Rules section or whole leaf. DP-01 requires comparison with the executing qualification ancestor requirement at TECHNIQUE.md line 5. The explicit run/delivery/deliver/emit chain identifies that ancestor; matching values would still require evaluation. Assigned rows: corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — The captured qualification -> run/delivery -> deliver/emit -> produce chain binds the leaf to qualification/techniques/TECHNIQUE.md. Its inherited Rules require Destination archive; the leaf's own Rules declare Destination public. DP1 compares these values on the executing leaf, so the leaf declaration is the defect. This incompatible inherited contract propagates into the concrete execution instance (Contract/High). The leaf is declared changed in scope.paths, giving diff attribution. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 8d0f33a043c7068e8c998046

Row: corpus/qualification/techniques/produce.md#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The whole leaf declares output names, a Protocol emission instruction, a Rules emission clause, and its Destination. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell fa0e42c99b24fa8b70e1b4c5

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The inheritance relationship binds the leaf produce to qualification techniques TECHNIQUE.md. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 8ab5a44208c83cc6801721f8

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The inheritance relationship binds the leaf produce to qualification techniques TECHNIQUE.md. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 8bfa310664405693e5cee00b

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — The inheritance relationship binds the leaf produce to qualification techniques TECHNIQUE.md. DP-01 explicitly requires call and inheritance relationships to carry the required Destination to the executing leaf instance. This relationship is part of qualification/run/delivery/deliver/emit/produce and its qualification TECHNIQUE.md inheritance; the complete captured chain supports the later leaf-versus-ancestor comparison.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified A: the listed explicit call/inheritance relationships connect qualification run.delivery to deliver.emit/produce and its qualification TECHNIQUE.md ancestor. DP-01 expressly requires those relationships to carry the inherited requirement to the executing leaf. All five concrete context sources were read, so this is an instance-context judgment rather than an independent check of a file without a leaf declaration. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: finding — The captured qualification -> run/delivery -> deliver/emit -> produce chain binds the leaf to qualification/techniques/TECHNIQUE.md. Its inherited Rules require Destination archive; the leaf's own Rules declare Destination public. DP1 compares these values on the executing leaf, so the leaf declaration is the defect. This incompatible inherited contract propagates into the concrete execution instance (Contract/High). The leaf is declared changed in scope.paths, giving diff attribution. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 98b55e096e4899353322814f

Row: corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The inheritance relationship binds the leaf produce to qualification techniques TECHNIQUE.md. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: the listed activity, routine and technique rows supply local declarations, steps, contracts or call/inheritance context rather than a workflow start or graph edge. DP-02 expressly states that activity and routine steps add no graph exits and defines termination as a whole-workflow invariant. These rows do not independently create a path-to-null test. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell e3964a7ca7f68e7c40793e11

Row: corpus/qualification/workflow.yaml#/graph

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The workflow graph defines the reachable run activity and its sole done destination. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 343988e91c335d3bdef76586

Row: corpus/qualification/workflow.yaml#/graph

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The workflow graph defines the reachable run activity and its sole done destination. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 67bbb2cf737f1d39490640e1

Row: corpus/qualification/workflow.yaml#/graph

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The workflow graph defines the reachable run activity and its sole done destination. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 094759e3ffb8236db086b566

Row: corpus/qualification/workflow.yaml#/graph

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — The workflow graph defines the reachable run activity and its sole done destination. DP-02 applies to the workflow start and reachable graph path represented here. The whole captured workflow, including initialActivity and all exits, must be assessed together for a finite route to null; matching an activity identifier alone does not settle that invariant.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified A: each listed workflow row supplies initialActivity, a graph entry/exit, a graph relationship or the whole workflow. DP-02 requires assessment of their complete reachable graph for a finite path to null. Activity name resolution alone cannot decide that invariant, and either a terminating edge or a self-loop remains within the criterion scope. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — The complete five-line workflow sets initialActivity to run, contains only graph node run, and sets its sole done exit to run. Following every reachable edge repeats run; no null destination exists. Activity/routine steps supply no graph exits in this dialect. The workflow path is structurally nonterminating, a Live/Critical violation. The workflow is a declared changed definition in scope.paths, establishing diff origin. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

## Cell fc47360bf214ca94a9c2f752

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The run graph entry defines the sole exit used by the whole-workflow termination check. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell cc39f8b8ebb2b96169d05005

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The run graph entry defines the sole exit used by the whole-workflow termination check. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9aa00375bff5d32993c718d0

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The run graph entry defines the sole exit used by the whole-workflow termination check. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell 9a13e148e0a434d148bef242

Row: corpus/qualification/workflow.yaml#/graph/run

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — The run graph entry defines the sole exit used by the whole-workflow termination check. DP-02 applies to the workflow start and reachable graph path represented here. The whole captured workflow, including initialActivity and all exits, must be assessed together for a finite route to null; matching an activity identifier alone does not settle that invariant.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified A: each listed workflow row supplies initialActivity, a graph entry/exit, a graph relationship or the whole workflow. DP-02 requires assessment of their complete reachable graph for a finite path to null. Activity name resolution alone cannot decide that invariant, and either a terminating edge or a self-loop remains within the criterion scope. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — The complete five-line workflow sets initialActivity to run, contains only graph node run, and sets its sole done exit to run. Following every reachable edge repeats run; no null destination exists. Activity/routine steps supply no graph exits in this dialect. The workflow path is structurally nonterminating, a Live/Critical violation. The workflow is a declared changed definition in scope.paths, establishing diff origin. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

## Cell e8a18028e34e1ace5d01fcf3

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The graph exit run.done supplies the next activity or null in the workflow path. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell b1f517596f87f82a15830709

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The graph exit run.done supplies the next activity or null in the workflow path. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 46e28f2007abc40979497fc9

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The graph exit run.done supplies the next activity or null in the workflow path. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell e0fcd50974c10678a3e2fb44

Row: corpus/qualification/workflow.yaml#/graph/run/done

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — The graph exit run.done supplies the next activity or null in the workflow path. DP-02 applies to the workflow start and reachable graph path represented here. The whole captured workflow, including initialActivity and all exits, must be assessed together for a finite route to null; matching an activity identifier alone does not settle that invariant.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified A: each listed workflow row supplies initialActivity, a graph entry/exit, a graph relationship or the whole workflow. DP-02 requires assessment of their complete reachable graph for a finite path to null. Activity name resolution alone cannot decide that invariant, and either a terminating edge or a self-loop remains within the criterion scope. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — The complete five-line workflow sets initialActivity to run, contains only graph node run, and sets its sole done exit to run. Following every reachable edge repeats run; no null destination exists. Activity/routine steps supply no graph exits in this dialect. The workflow path is structurally nonterminating, a Live/Critical violation. The workflow is a declared changed definition in scope.paths, establishing diff origin. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

## Cell a1bbb96005ca910edd02b943

Row: corpus/qualification/workflow.yaml#/id

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The workflow identifier declares qualification; it does not define a path or exit. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell ca0a66d25c90e652baa92f28

Row: corpus/qualification/workflow.yaml#/id

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The workflow identifier declares qualification; it does not define a path or exit. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 9fff88eaae065adb66759e66

Row: corpus/qualification/workflow.yaml#/id

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The workflow identifier declares qualification; it does not define a path or exit. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/workflow.yaml#@element, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell b70cd0fa3dc717cd87f806e4

Row: corpus/qualification/workflow.yaml#/id

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: N — The workflow identifier declares qualification; it does not define a path or exit. DP-02 is a whole-workflow invariant over initialActivity and graph destinations. This row declares no workflow start or graph path; activity and routine steps add no exits, and an isolated identifier or technique declaration is not a terminating-path test.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified N: workflow line 1 only names qualification. It supplies neither initialActivity nor a graph entry/exit; DP-02 requires the reachable path invariant. The initialActivity, graph and whole-workflow rows remain independently applicable, so the label exclusion does not bypass termination assessment. Assigned rows: corpus/qualification/workflow.yaml#/id.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: unresolved.

## Cell b93fc9705f0d802bdff5440b

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The initialActivity value run selects the start from which the whole graph must reach a null destination. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 3641b7b9d54d55df0cc22cb1

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The initialActivity value run selects the start from which the whole graph must reach a null destination. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 665c1a7ad6f6a7650e3f374a

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The initialActivity value run selects the start from which the whole graph must reach a null destination. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/workflow.yaml#@element, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell c7fdcca69a6f6d3b3cfa7009

Row: corpus/qualification/workflow.yaml#/initialActivity

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — The initialActivity value run selects the start from which the whole graph must reach a null destination. DP-02 applies to the workflow start and reachable graph path represented here. The whole captured workflow, including initialActivity and all exits, must be assessed together for a finite route to null; matching an activity identifier alone does not settle that invariant.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified A: each listed workflow row supplies initialActivity, a graph entry/exit, a graph relationship or the whole workflow. DP-02 requires assessment of their complete reachable graph for a finite path to null. Activity name resolution alone cannot decide that invariant, and either a terminating edge or a self-loop remains within the criterion scope. Assigned rows: corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — The complete five-line workflow sets initialActivity to run, contains only graph node run, and sets its sole done exit to run. Following every reachable edge repeats run; no null destination exists. Activity/routine steps supply no graph exits in this dialect. The workflow path is structurally nonterminating, a Live/Critical violation. The workflow is a declared changed definition in scope.paths, establishing diff origin. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

## Cell ce1c6885d9fe828ffb2d4802

Row: corpus/qualification/workflow.yaml#@element

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — The whole workflow contains initialActivity and every graph exit required to decide the finite-path invariant. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 5551fe05b667e60209399004

Row: corpus/qualification/workflow.yaml#@element

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — The whole workflow contains initialActivity and every graph exit required to decide the finite-path invariant. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2, corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/TECHNIQUE.md#@element, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element, corpus/qualification/activities/run.yaml#@element, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 263ad09bd2d440e2a894ee63

Row: corpus/qualification/workflow.yaml#@element

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: N — The whole workflow contains initialActivity and every graph exit required to decide the finite-path invariant. DP-01 checks a leaf Destination declaration and explicit call or inheritance relationships carrying that constraint to the leaf instance. This row contains no leaf Destination declaration and is not such an instance relationship; unrelated content is not an independent destination check.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Verification: verified — Verified N: these native declaration/section/item rows contain no leaf Destination clause and are not explicit execution or inheritance relationship rows. DP-01 limits independent destination checks to the leaf declaration and requires context to travel through the explicit relationships. Their argument keys, output names, emission prose, identifiers or graph containers do not independently declare a leaf destination. Assigned rows: corpus/qualification/techniques/produce.md#/outputs, corpus/qualification/techniques/produce.md#/outputs/summary, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/workflow.yaml#@element, corpus/qualification/routines/deliver.yaml#@element, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#/id, corpus/qualification/activities/run.yaml#/id, corpus/qualification/routines/deliver.yaml#/id, corpus/qualification/activities/run.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8

Evaluation: unresolved.

## Cell e5c1842a573eccbf8d7d7e60

Row: corpus/qualification/workflow.yaml#@element

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — The whole workflow contains initialActivity and every graph exit required to decide the finite-path invariant. DP-02 applies to the workflow start and reachable graph path represented here. The whole captured workflow, including initialActivity and all exits, must be assessed together for a finite route to null; matching an activity identifier alone does not settle that invariant.

Agent: /root/qualify_author_two

- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified A: each listed workflow row supplies initialActivity, a graph entry/exit, a graph relationship or the whole workflow. DP-02 requires assessment of their complete reachable graph for a finite path to null. Activity name resolution alone cannot decide that invariant, and either a terminating edge or a self-loop remains within the criterion scope. Assigned rows: corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — The complete five-line workflow sets initialActivity to run, contains only graph node run, and sets its sole done exit to run. Following every reachable edge repeats run; no null destination exists. Activity/routine steps supply no graph exits in this dialect. The workflow path is structurally nonterminating, a Live/Critical violation. The workflow is a declared changed definition in scope.paths, establishing diff origin. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

## Cell 30d521174c6c7f6c4a8579ad

Row: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This relationship resolves the run.done next-activity value to run; termination still requires reading the complete workflow graph. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell ff07daa2c799e9750e2df8bc

Row: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — This relationship resolves the run.done next-activity value to run; termination still requires reading the complete workflow graph. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell f442830158e33a5d097e4514

Row: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — Each assigned relationship selects or re-enters run in executing workflow qualification. Its delivery call invokes deliver, whose emit step calls produce under the captured ancestor contract. DP1 explicitly carries the inherited constraint through those call relationships to the leaf instance. The no-leaf-declaration exclusion concerns independent file checks; it does not exclude these concrete executing-chain relationships.

Agent: /root

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Verified A for all four relationships. The initialActivity selection and graph run entry identify run as the executing activity; its done exit returns to run. The graph-entry and next-activity relationships therefore participate in the same execution context. The delivery step names deliver, whose emit step names produce, and the captured execution relationship binds that leaf instance to qualification and its ancestor TECHNIQUE.md. The leaf has a Destination declaration. DP1 explicitly carries the inherited destination requirement along these relationships; no independent-file exclusion applies. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 4–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 10–12

Evaluation: finding — The captured qualification -> run/delivery -> deliver/emit -> produce chain binds the leaf to qualification/techniques/TECHNIQUE.md. Its inherited Rules require Destination archive; the leaf's own Rules declare Destination public. DP1 compares these values on the executing leaf, so the leaf declaration is the defect. This incompatible inherited contract propagates into the concrete execution instance (Contract/High). The leaf is declared changed in scope.paths, giving diff attribution. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 3f2fc1d2f91b27a5d46f0504

Row: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — This relationship resolves the run.done next-activity value to run; termination still requires reading the complete workflow graph. DP-02 applies to the workflow start and reachable graph path represented here. The whole captured workflow, including initialActivity and all exits, must be assessed together for a finite route to null; matching an activity identifier alone does not settle that invariant.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified A: each listed workflow row supplies initialActivity, a graph entry/exit, a graph relationship or the whole workflow. DP-02 requires assessment of their complete reachable graph for a finite path to null. Activity name resolution alone cannot decide that invariant, and either a terminating edge or a self-loop remains within the criterion scope. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — The complete five-line workflow sets initialActivity to run, contains only graph node run, and sets its sole done exit to run. Following every reachable edge repeats run; no null destination exists. Activity/routine steps supply no graph exits in this dialect. The workflow path is structurally nonterminating, a Live/Critical violation. The workflow is a declared changed definition in scope.paths, establishing diff origin. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

## Cell 94b820a882f196103f835741

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This relationship resolves initialActivity run and belongs to the reachable workflow path. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell f30ba6f42d4230bf27814f3a

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — This relationship resolves initialActivity run and belongs to the reachable workflow path. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 21f9cfbf2718ad51d2976c98

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — Each assigned relationship selects or re-enters run in executing workflow qualification. Its delivery call invokes deliver, whose emit step calls produce under the captured ancestor contract. DP1 explicitly carries the inherited constraint through those call relationships to the leaf instance. The no-leaf-declaration exclusion concerns independent file checks; it does not exclude these concrete executing-chain relationships.

Agent: /root

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Verified A for all four relationships. The initialActivity selection and graph run entry identify run as the executing activity; its done exit returns to run. The graph-entry and next-activity relationships therefore participate in the same execution context. The delivery step names deliver, whose emit step names produce, and the captured execution relationship binds that leaf instance to qualification and its ancestor TECHNIQUE.md. The leaf has a Destination declaration. DP1 explicitly carries the inherited destination requirement along these relationships; no independent-file exclusion applies. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 4–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 10–12

Evaluation: finding — The captured qualification -> run/delivery -> deliver/emit -> produce chain binds the leaf to qualification/techniques/TECHNIQUE.md. Its inherited Rules require Destination archive; the leaf's own Rules declare Destination public. DP1 compares these values on the executing leaf, so the leaf declaration is the defect. This incompatible inherited contract propagates into the concrete execution instance (Contract/High). The leaf is declared changed in scope.paths, giving diff attribution. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 8862878198e6198ef77c1f28

Row: corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — This relationship resolves initialActivity run and belongs to the reachable workflow path. DP-02 applies to the workflow start and reachable graph path represented here. The whole captured workflow, including initialActivity and all exits, must be assessed together for a finite route to null; matching an activity identifier alone does not settle that invariant.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified A: each listed workflow row supplies initialActivity, a graph entry/exit, a graph relationship or the whole workflow. DP-02 requires assessment of their complete reachable graph for a finite path to null. Activity name resolution alone cannot decide that invariant, and either a terminating edge or a self-loop remains within the criterion scope. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — The complete five-line workflow sets initialActivity to run, contains only graph node run, and sets its sole done exit to run. Following every reachable edge repeats run; no null destination exists. Activity/routine steps supply no graph exits in this dialect. The workflow path is structurally nonterminating, a Live/Critical violation. The workflow is a declared changed definition in scope.paths, establishing diff origin. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

## Cell 8020bba4283a65b31df0f113

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This relationship resolves the graph entry run, whose exits must be assessed in the complete workflow graph. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell ca06cc90126da20e026a0486

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — This relationship resolves the graph entry run, whose exits must be assessed in the complete workflow graph. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell 32efcf3836cf4d26fc113577

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — Each assigned relationship selects or re-enters run in executing workflow qualification. Its delivery call invokes deliver, whose emit step calls produce under the captured ancestor contract. DP1 explicitly carries the inherited constraint through those call relationships to the leaf instance. The no-leaf-declaration exclusion concerns independent file checks; it does not exclude these concrete executing-chain relationships.

Agent: /root

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Verified A for all four relationships. The initialActivity selection and graph run entry identify run as the executing activity; its done exit returns to run. The graph-entry and next-activity relationships therefore participate in the same execution context. The delivery step names deliver, whose emit step names produce, and the captured execution relationship binds that leaf instance to qualification and its ancestor TECHNIQUE.md. The leaf has a Destination declaration. DP1 explicitly carries the inherited destination requirement along these relationships; no independent-file exclusion applies. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 4–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 10–12

Evaluation: finding — The captured qualification -> run/delivery -> deliver/emit -> produce chain binds the leaf to qualification/techniques/TECHNIQUE.md. Its inherited Rules require Destination archive; the leaf's own Rules declare Destination public. DP1 compares these values on the executing leaf, so the leaf declaration is the defect. This incompatible inherited contract propagates into the concrete execution instance (Contract/High). The leaf is declared changed in scope.paths, giving diff attribution. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 48da822c85267d96ea48c4c2

Row: corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — This relationship resolves the graph entry run, whose exits must be assessed in the complete workflow graph. DP-02 applies to the workflow start and reachable graph path represented here. The whole captured workflow, including initialActivity and all exits, must be assessed together for a finite route to null; matching an activity identifier alone does not settle that invariant.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified A: each listed workflow row supplies initialActivity, a graph entry/exit, a graph relationship or the whole workflow. DP-02 requires assessment of their complete reachable graph for a finite path to null. Activity name resolution alone cannot decide that invariant, and either a terminating edge or a self-loop remains within the criterion scope. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — The complete five-line workflow sets initialActivity to run, contains only graph node run, and sets its sole done exit to run. Following every reachable edge repeats run; no null destination exists. Activity/routine steps supply no graph exits in this dialect. The workflow path is structurally nonterminating, a Live/Critical violation. The workflow is a declared changed definition in scope.paths, establishing diff origin. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6

## Cell f0755acc68e9a62e580665a3

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: AP-02 — AP-02. broken-binding

Applicability: N — This relationship locates the run.done graph exit; activity resolution alone cannot settle termination. AP-02 Detect checks a concrete activity routine argument-key contract or a routine output reference resolved to a called technique output declaration. This row supplies neither such binding nor its input/output declaration or step-resolution endpoint. Markdown artifact mentions and graph labels do not create those contracts.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Verification: verified — Verified N after inspecting the listed rows: none supplies an activity routine argument-key contract, routine Inputs endpoint, routine step.output export, its referenced emit step/technique endpoint or a called-technique output declaration. Their artifact prose, retention/destination constraints, unrelated identifiers, graph structure and inheritance-only context are outside AP-02 binding forms. This conclusion does not infer validity from a clean declaration. Assigned rows: corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-11, corpus/qualification/techniques/produce.md#/rules/line-11/clause-1, corpus/qualification/techniques/produce.md#/rules/line-11/clause-2, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/techniques/produce.md#/capability, corpus/qualification/techniques/produce.md#/capability/line-2, corpus/qualification/techniques/produce.md#/protocol, corpus/qualification/techniques/produce.md#/protocol/line-8, corpus/qualification/techniques/TECHNIQUE.md#/capability, corpus/qualification/techniques/TECHNIQUE.md#/capability/line-2.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 15–21

Evaluation: unresolved.

## Cell 96797ae8488cf51f8878572b

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: AP-01 — AP-01. emission-without-validation

Applicability: N — This relationship locates the run.done graph exit; activity resolution alone cannot settle termination. AP-01 Detect reaches imperative emission instructions in a technique Protocol or Rules clause. This row is a declaration, description, structural identifier, or relationship, without an emission directive of its own; the criterion expressly distinguishes headings, output declarations, destination declarations, calls, bindings, graph labels and Capability prose.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Verification: verified — Verified N after inspecting every listed construct: these rows are declarations, Capability descriptions, output headings, destination constraints, structural YAML content, calls or relationship context. They contain no imperative Protocol or Rules emission directive of their own. AP-01 explicitly limits its Detect to those emitting instructions and excludes these declaration/call/label forms. This is a scope exclusion, not a clean evaluation. Assigned rows: corpus/qualification/activities/run.yaml#/steps, corpus/qualification/activities/run.yaml#/steps/id=delivery, corpus/qualification/activities/run.yaml#/steps/id=delivery/id, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet, corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/name, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#/steps, corpus/qualification/routines/deliver.yaml#/steps/id=emit, corpus/qualification/routines/deliver.yaml#/steps/id=emit/id, corpus/qualification/routines/deliver.yaml#/steps/id=emit/technique, corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/routines/deliver.yaml#/inputs, corpus/qualification/routines/deliver.yaml#/inputs/0, corpus/qualification/techniques/TECHNIQUE.md#/rules, corpus/qualification/techniques/TECHNIQUE.md#/rules/line-5, corpus/qualification/routines/deliver.yaml#/outputs, corpus/qualification/routines/deliver.yaml#/outputs/report.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/anti-patterns.md](sources/0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025.txt), lines 7–14

Evaluation: unresolved.

## Cell dafc343685f5a84041beee97

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: DP-01 — 1. Honor the executing workflow's inherited destination

Applicability: A — Each assigned relationship selects or re-enters run in executing workflow qualification. Its delivery call invokes deliver, whose emit step calls produce under the captured ancestor contract. DP1 explicitly carries the inherited constraint through those call relationships to the leaf instance. The no-leaf-declaration exclusion concerns independent file checks; it does not exclude these concrete executing-chain relationships.

Agent: /root

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 1–11
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5

Verification: verified — Verified A for all four relationships. The initialActivity selection and graph run entry identify run as the executing activity; its done exit returns to run. The graph-entry and next-activity relationships therefore participate in the same execution context. The delivery step names deliver, whose emit step names produce, and the captured execution relationship binds that leaf instance to qualification and its ancestor TECHNIQUE.md. The leaf has a Destination declaration. DP1 explicitly carries the inherited destination requirement along these relationships; no independent-file exclusion applies. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 4–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 10–12

Evaluation: finding — The captured qualification -> run/delivery -> deliver/emit -> produce chain binds the leaf to qualification/techniques/TECHNIQUE.md. Its inherited Rules require Destination archive; the leaf's own Rules declare Destination public. DP1 compares these values on the executing leaf, so the leaf declaration is the defect. This incompatible inherited contract propagates into the concrete execution instance (Contract/High). The leaf is declared changed in scope.paths, giving diff attribution. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/techniques/produce.md#/rules, corpus/qualification/techniques/produce.md#/rules/line-12, corpus/qualification/routines/deliver.yaml#@relationship/3a2f0d25e0e017f7, corpus/qualification/routines/deliver.yaml#@relationship/50a64427faa3df96, corpus/qualification/techniques/produce.md#@relationship/f075d23fadb959c8, corpus/qualification/activities/run.yaml#@relationship/5a93bb0629055f53, corpus/qualification/techniques/produce.md#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 5–8
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12

## Cell 5453a725eb6086baaa72c972

Row: corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b

Criterion: DP-02 — 2. Provide a terminating workflow path

Applicability: A — This relationship locates the run.done graph exit; activity resolution alone cannot settle termination. DP-02 applies to the workflow start and reachable graph path represented here. The whole captured workflow, including initialActivity and all exits, must be assessed together for a finite route to null; matching an activity identifier alone does not settle that invariant.

Agent: /root/qualify_author_two

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Verification: verified — Verified A: each listed workflow row supplies initialActivity, a graph entry/exit, a graph relationship or the whole workflow. DP-02 requires assessment of their complete reachable graph for a finite path to null. Activity name resolution alone cannot decide that invariant, and either a terminating edge or a self-loop remains within the criterion scope. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done.

Agent: /root/qualify_author_one

- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
- [corpus/qualification/routines/deliver.yaml](sources/ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1.txt), lines 1–6
- [corpus/qualification/techniques/TECHNIQUE.md](sources/dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b.txt), lines 1–5
- [corpus/qualification/techniques/produce.md](sources/27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729.txt), lines 1–12
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11

Evaluation: finding — The complete five-line workflow sets initialActivity to run, contains only graph node run, and sets its sole done exit to run. Following every reachable edge repeats run; no null destination exists. Activity/routine steps supply no graph exits in this dialect. The workflow path is structurally nonterminating, a Live/Critical violation. The workflow is a declared changed definition in scope.paths, establishing diff origin. Assigned rows: corpus/qualification/workflow.yaml#@relationship/27bf829b0e84c593, corpus/qualification/workflow.yaml#@relationship/3b27fd01db44f877, corpus/qualification/workflow.yaml#@relationship/475a98faaf5b9a55, corpus/qualification/workflow.yaml#@relationship/aa4b84de66a9776b, corpus/qualification/workflow.yaml#/graph, corpus/qualification/workflow.yaml#/graph/run, corpus/qualification/workflow.yaml#/graph/run/done, corpus/qualification/workflow.yaml#/initialActivity, corpus/qualification/workflow.yaml#@element.

Agent: /root/qualify_author_one

- [corpus/canon/resources/design-principles.md](sources/6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121.txt), lines 9–11
- [corpus/qualification/workflow.yaml](sources/be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1.txt), lines 1–5
- [corpus/qualification/activities/run.yaml](sources/e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813.txt), lines 1–6
