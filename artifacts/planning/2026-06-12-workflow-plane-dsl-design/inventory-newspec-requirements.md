# Inventory: Requirements the Workflow Plane design spec places on the TypeScript DSL

Source: `/home/mike1/projects/main/workflow-server/.engineering/proposals/workflow-plane/design-specification.md` (v0.4, 2026-06-12, 599 lines).
Line anchors are `L<n>` into that file. Requirement IDs `R-*` are assigned here for cross-referencing; they are not in the spec.

---

## 1. Principles (§3, L80–93) — constraints every DSL decision must satisfy

| ID | Principle | DSL-facing requirement |
|----|-----------|------------------------|
| R-P1 | P1 Gateway-first, harness-second (L84) | The DSL is a *server-side authoring* surface; nothing in it may assume a particular harness (no Claude-Code-specific constructs). Harness attachment is an adapter concern, not an authoring concern. |
| R-P2 | P2 Deterministic execution (L85) | Same definition + same state ⇒ same path, "first-order property". The DSL compile step must itself be deterministic: the executed-builder run is single-shot in a sealed sandbox (no IO/clock/random — per locked decision 1) and must produce byte-identical canonical IR for identical source. Nothing in the authoring surface may introduce runtime nondeterminism (no callbacks surviving into IR, no closures evaluated at run time). |
| R-P3 | P3 Source ≠ runtime (L86) | Source is parsed/validated/lowered to IR; "the runtime executes IR only." The DSL is a *construction* language: builder calls describe a definition; no DSL code executes during workflow execution. Reinforced at L29 ("the model never interprets a workflow at execution time"), L125, L149, L237, L546. |
| R-P4 | P4 Validation is a product feature (L87) | Orchestra's grammar/constraint split (EBNF + Alloy, severity-graded rules) is "part of the authoring and execution contract." The DSL must surface the full rule families (§5.2, L197–209) as compiler diagnostics with severities (ERROR/WARN/INFO), and additionally exploit TS typing so many of these become tsc-time errors (locked decision 2: generated technique contract declarations make step bindings type-check end-to-end). |
| R-P5 | P5 Governance by construction (L88, Phase 2+) | The DSL must leave first-class room for roles/capability scope/approvals/audit later — see R-GOV-* (§8–§10 below). |
| R-P6/P7/P8 | Identity / one envelope / nudge (L89–91, Phase 2+) | No direct Phase-1 authoring surface, but the DSL's IR target carries the `ExecutionPolicy` envelope seam (R-IR-ENV) these attach to. |
| R-P9 | P9 Compatibility at the edge, modernization at the core (L92) | The DSL may be cleaner than TOON *internally*, but observable behaviour (what the IR makes the runtime do) must be preserved. |
| R-P10 | P10 Parity before innovation (L93) | Any DSL ergonomic improvement that would alter baseline behaviour is "invisible internally or deferred." Compatibility rule restated at L499–501: mirror legacy shape first — *even the `skill:` grammar field, the self-referencing-retry pattern, the checkpoint shape*. The DSL's expressible semantics in Phase 1 = exactly the baseline's. |

## 2. Pipeline position (§4, L101–127)

- R-PIPE-1 (L102–105, L123): the DSL is what authors (human **or agent**) write; `wp-dsl` does parse → AST → semantic validation (Alloy rule families) → lower. The DSL must be LLM-writable as well as human-readable (L149).
- R-PIPE-2 (L121–127): three stored representations — Source (DSL text), AST, IR — kept separately for audit/reproducibility ("the source authored, the IR executed"). Implication: the DSL artifact itself is a retained audit object; compilation must be reproducible from stored source (reinforces sandboxed determinism).
- R-PIPE-3 (L102, L123): legacy TOON enters via a compatibility reader *beside* the DSL; both converge on the same AST/IR (also L177, L241, L496).

## 3. §5.1 The authoring surface (L147–177)

- R-DSL-1 (L149): "a small, strictly-typed builder API" — minimal surface area, strict typing, "ergonomic for humans to read and for LLMs to write," compiled by `wp-dsl` to the same AST/IR the runtime executes; "far more concise than raw orchestration code."
- R-DSL-2 (L149): "the plan lives in code and lowers deterministically."
- R-DSL-3 (L152): the §5.1 example is **explicitly illustrative** — "the exact builder API is an open question (§14.2)". Do not treat the example's method names/shapes as committed. What the example *does* commit to (as required expressible constructs):
  - `export default workflow(id, semver, (wf) => …)` shape — workflow id + version + body callback (L153).
  - `wf.variables({...})` — workflow-level variable declarations w/ initial values (L154).
  - `wf.activity(id, (a) => …)` — activity definition (L156).
  - `a.inputs(...)` accepting both bare symbol ids (`'raw_responses'`) and qualified cross-activity refs (`'01.create-issue.issue_number'`, i.e. `NN.step.name`) (L157).
  - `a.step(id, { technique: '<::-path>' })` — step bound to a markdown technique by path; returns a referencable handle (`const ask = …`) (L159–160).
  - `a.decision(id).match(variable, { value: [items…], default: [items…] })` — programmatic variable decision, branches as ordered arrays of steps/checkpoints (L162–166).
  - `a.checkpoint(id)` usable inline inside a branch (L163).
  - `a.loop(id).forEach(var).over(collection).max(n).body(items…)` — forEach loop w/ maxIterations; body may include steps and decisions (L168–169).
  - `a.flow('main', item, item, a.transition(when(cond), goTo(activity)))` — named flow ordering items; transition with a condition combinator (`when(eq(var, value))`) and a `goTo` target (L171–172).
  - Builder-handle reuse: items defined once, referenced by variable in flows/loops (the `ask`/`collect`/`route` pattern) — the DSL's analogue of TOON flows being *reference lists*.
- R-DSL-4 (L177): the DSL is "the canonical authoring surface"; TOON is "ingested by a compatibility reader (or transpiled once to the DSL)" and must lower to *behaviourally-equivalent IR* — that equivalence is what makes §12.4 trace-diff parity possible.

## 4. §5.2 Orchestra semantics (L179–209) — the DSL is one concrete syntax of a fixed model

- R-ORC-1 (L181): Orchestra defines meaning/validation *independently of concrete syntax*; the TS DSL and legacy TOON "express the same model and are checked by the same constraint families." The DSL cannot add or change semantics, only spell them.
- R-ORC-2 (L186–190): four primitives — Workflow (TBD, legacy schema), **Activity (fully defined)**, Technique (specified in technique-protocol-specification.md), Resource (TBD). DSL Phase-1 scope is Activity-complete; Workflow/Resource DSL forms are open (L229, L560).
- R-ORC-3 (L190–195): Activity model the DSL must express in full: steps / decisions / loops composed by named ordered **flows** (every activity has `main`); step→technique binding (grammar field is `skill:` — parity nuance L192, L561); decisions interactive (`message:`) vs programmatic (`variable:` match / `condition:` boolean algebra); branches rejoin unless terminal; empty branch = pass-through; branchless interactive = acknowledgment gate; self-reference = retry with non-recursive exit; loop `forEach`+`maxIterations`; `break` = innermost loop only; `- activity:` = layered terminal exiting the whole activity; scope chain local flow → loop var → activity → workflow.
- R-ORC-4 (L197–209): rule families the DSL compiler must implement as passes (severity-graded): PROV-001/002, SYM-001..004, FLOW-001..003, LOOP-001..003, DEC-001..004, TERM-001..002, SCOPE-001..002. (L209: "what `wp-dsl` preserves as compiler passes".) Note for the TS surface: several (SYM uniqueness, PROV qualified refs, DEC form-correctness) are candidates for *type-level* or builder-shape enforcement; the rest stay semantic-validation diagnostics. Severity grading must survive whatever is hoisted into types.

## 5. §5.4 Technique referencing from the DSL (L219–229)

- R-TEC-1 (L229): techniques **remain markdown**, "referenced from the TypeScript DSL by `::` path (e.g. `a.step('ask-question', { technique: 'domain-question' })`)."
- R-TEC-2 (L223): addressing = `::` paths (`cargo-operations::check`); unprefixed refs resolve current-workflow-first then `meta`; workflow-root technique is ancestor of all. The DSL's technique reference strings must carry this addressing scheme unchanged.
- R-TEC-3 (L224–226): contract inheritance (keyed-section union, local wins), Initial/Final protocol wrapping, AP-60 symbol model — `snake_case` symbol ids binding to runtime variables **by exact string match**, `kebab-case` names. DSL binding identifiers must therefore be snake_case strings preserved verbatim into IR (also R-BIND-2).
- R-TEC-4 (locked decision 2, beyond spec text but consistent w/ P4): techniques gain *generated* TS contract declarations so tsc checks step bindings end-to-end; the markdown remains source of truth, the .d.ts is derived.
- R-TEC-5 (L227): bundle delivery (`techniques`/`rules`/`unresolved` buckets; non-empty `unresolved` = lint-gated definition defect) is a runtime/loader behaviour the DSL's references must feed; a DSL-time resolvable-reference check aligns with the lint gate.
- R-TEC-6 (L229, L563): whether technique *authoring* also gains a TS surface is OPEN — the DSL design must not foreclose it but must not depend on it.

## 6. §6 IR — the DSL's compilation target (L233–289)

- R-IR-1 (L237): IR is "the only form the runtime executes"; normalizes DSL + TOON into a deterministic model; explicit scope & control flow; "retains traceability to source" — DSL compilation must emit source-mapping (node ↔ builder call site / authored id).
- R-IR-2 (L241–253) Phase-1 lowering table (every row = a construct the DSL must be able to author):
  | authored | IR node |
  |---|---|
  | technique-backed step | `Invoke { technique_ref, bindings, outputs }` |
  | interactive decision | `AwaitInput { prompt, options, branches }` |
  | programmatic decision | `Branch { MatchVar \| Condition }` (both forms preserved) |
  | loop forEach | `Iterate { var, collection, body, max_iterations }` |
  | `- message:` flow item | `EmitMessage` |
  | `- activity:` flow item | `GotoActivity` (layered terminal) |
  | `- break` | `LoopExit` (innermost only) |
  | flow | `Block { items }`, `main` = entry |
  | end | `Terminate` (explicit completion) |
  Note: the illustrative §5.1 example does not show `message:` flow items, `break`, or explicit end — the real builder API must cover all nine.
- R-IR-3 (L255–262) baseline ⇒ Phase 1, NOT deferred: `Checkpoint { id, options, blocking, auto_advance, effects }` (checkpoints[] + yield/present/respond/resume); `Dispatch { workflow_id, agent_id, planning_slug }` (dispatch_child); `EmitArtifact { id, name, location, action: create|update }` (artifacts[]). The DSL must have authoring forms for checkpoints (incl. options/blocking/auto_advance/effects), dispatch, and artifact declarations.
- R-IR-4 (L263): deferred nodes — `RequireApproval` (layers on Checkpoint), `CapabilityGate`, `Delegate` (layers on Dispatch). DSL must not need redesign to add them ("layered on" ⇒ the Phase-1 checkpoint/dispatch authoring shapes must be extension-friendly).
- R-IR-ENV (L265–279): governance envelope — every IR node is wrapped `NodeEnvelope { id: NodeId, node: Node, policy: ExecutionPolicy }` with `ExecutionPolicy { required_role?, capability_scope[], approval?, audit, retry?, timeout? }`. **Present but inert in Phase 1** (legacy-equivalent semantics). DSL consequence: compilation must emit the envelope per node (with default/inert policy); the authoring surface need not expose policy fields in Phase 1 but must be able to grow them without reshaping control flow (L279).
- R-IR-5 (L281–285) graph projection: `wp-ir` exposes a derived graph view — Node, Edge, Guard, Effect, CapabilityGrant, AuditEvent; `BoolExpr`/`ValueExpr`; `ViolationAction` = deny/fail_node/fail_workflow/escalate/nudge; `EffectType` = invoke_tool/read_resource/write_state/emit_event/delegate/request_approval/grant_capability/revoke_capability/transition/compute. The tree (activity/block/node, 1:1 with the Activity model) is the authoring/Phase-1 form; the graph is *derived* — the DSL targets the tree; everything the DSL emits must be projectable (condition expressions must lower to Guard-compatible `BoolExpr`, etc.). Keep IR an executable plan, distinct from `wp-domain`.
- R-BIND (L287–289) binding & scope: preserve Orchestra scope precedence *exactly* (local flow → loop var → activity → workflow) as an explicit runtime mechanism; cross-activity refs use qualified `NN.step.name` (PROV-002); **symbol ids remain `snake_case` to bind to runtime variables by exact string match**. DSL: input/output/variable identifiers are strings (not TS identifiers subject to renaming) and must be validated as snake_case; qualified-ref string form must be first-class.

## 7. §7 Runtime semantics the DSL-produced IR must drive identically (L293–304)

The DSL doesn't implement these but must be expressive enough that lowering reproduces them, and must not allow authoring anything that breaks them:
- R-RT-1 (L297): server-owned sealed state, `session_index`, atomic writes, resume — no DSL impact except: no authoring construct may imply client-held state.
- R-RT-2 (L298): ordered `transitions[]`, first matching condition wins — the DSL's transition list must be **ordered** and conditions rigid (condition algebra per `condition.schema.json` lineage), never free-text for an LLM to interpret.
- R-RT-3 (L299): rejoin-unless-terminal; variable decision w/o default ⇒ WARN + pass-through if unmatched; break innermost; `activity:` exits activity; self-referencing decision = retry with guaranteed exit. The DSL semantics for its branch/loop builders are fixed to these.
- R-RT-4 (L300): checkpoint protocol yield→present→respond→resume; three resolution modes (`option_id` | `auto_advance` | `condition_not_met`); effects `setVariable`/`transitionTo`/`skipActivities`; hard gate. DSL checkpoint construct must express options + effects + auto_advance compatible with this.
- R-RT-5 (L301): 3-level dispatch, child sessions, parent snapshots; checkpoints bubble up, effects cascade down — DSL `Dispatch` authoring carries `workflow_id`/`agent_id`/`planning_slug`.
- R-RT-6 (L302): all 7 fidelity layers preserved — incl. step/activity manifests, which are *derived from the definition*; the DSL must yield stable step/activity identities for manifests and trace tokens (see R-PAR-3).
- R-RT-7 (L304): resources lazy via `get_resource`, bare-slug vs prefixed, `#section` anchors — any DSL resource references use this addressing.

## 8. §8–§10 Governance/distribution/packaging — room the DSL must leave (all Phase 2+)

- R-GOV-1 (§8.1–8.2, L315–337): operation envelope + PDP/CBAC gate *operations*, keyed on workflow-state — the workflow-state input comes from the deterministic state model the DSL definitions produce; DSL state/activity naming must remain stable enough to be policy-keyable.
- R-GOV-2 (§8.4 L360–368, §6.3): roles/role manifests substantiate `executionModel` — the DSL keeps an `executionModel`-equivalent (agent roles) declaration at workflow level so Phase 2+ can bind proofs to it without re-authoring.
- R-GOV-3 (§8.5–8.6, §9.2–9.3, L372–406): identity handshake / task packets / leases layer onto Dispatch — DSL dispatch shape must accommodate a future governed overlay (bounded context, allowed tools, stop conditions live in the *task packet*, not new authoring fields).
- R-GOV-4 (§10, L420–427): signed artifacts/manifests; `workflow_compile` becomes a runtime MCP governance tool (L426) — implies the DSL compile path is invocable as a governed server operation, and compiled IR is a signable, hashable artifact (canonical serialization required ⇒ L2 EBNF layer of the locked tri-layer definition).

## 9. §12 Parity strategy — what it demands of the DSL (L477–518)

- R-PAR-1 (L486, L496): `wp-dsl` loads legacy TOON via a compatibility front-end (or one-time transpile) **and** the TS DSL; both get the *same Orchestra validation* (rule families, severities) and lower to behaviourally-equivalent IR.
- R-PAR-2 (L499–501 compatibility rule): mirror legacy shape even where inelegant — `skill:` field, self-referencing retry, checkpoint shape. For the DSL: parity of *semantics and IR*, with naming questions (e.g. `technique` vs `skill`) logged as open (L561).
- R-PAR-3 (L503–508 testing model) **trace-diff implication — STABLE IDs**: trace diffing compares "visited activities/steps/decisions, branch choices, checkpoint states, dispatch lineage, final state, termination path" between live server (TOON) and Workflow Plane on the *same* workflows. Therefore the DSL must produce **stable, author-controlled ids** for workflows, activities, steps, decisions, loops, flows, checkpoints — identical to the TOON corpus's ids after transpile/reading — not synthesized/positional ids that vary by builder-call order or compiler version. Ids are explicit string arguments in every builder call (as the §5.1 example shows) and survive verbatim into IR `NodeId`s and trace events. Golden corpus (L504) + golden MCP responses (L505) + semantic-regression suites mirroring `constraints/activity.als` (L507) all key off these ids.
- R-PAR-4 (L514–518 phases): DSL-relevant gates — Phase 1 "Parse & validate" = loading, parse/AST/diagnostics, rule-family validation, technique resolution, compile-to-IR, *no execution*; the DSL + compiler is shippable and testable standalone before any runtime exists.

## 10. §13 Scope boundaries (L522–535)

- R-SCOPE-1 (L526) Phase 1 in-scope for the DSL: TypeScript-DSL authoring + legacy-TOON reader + Orchestra validation; everything else listed (16 tools, technique resolution/bundling, checkpoints, dispatch, state, 7 fidelity layers, resources, traces) consumes the DSL's IR.
- R-SCOPE-2 (L528–535) Phase 2+ out-of-scope for DSL v1: identity, policy engine, role substantiation, A2A, governed deployment, and the governed nodes `RequireApproval`/`CapabilityGate`/`Delegate`. DSL must not implement these, only avoid foreclosing them (R-IR-4, R-IR-ENV).

## 11. §14.2 Open questions owned/co-owned by the DSL design (L557–567)

- OQ-1 (L562): **exact builder API** — "the surface for steps, decisions, loops, flows, transitions, checkpoints, and dispatch" (note: this enumeration adds *transitions, checkpoints, dispatch* beyond the §5.1 example — the API must be designed for all seven construct kinds).
- OQ-2 (L563): technique authoring TS surface vs markdown (locked decision 2 resolves direction: markdown + *generated* TS contract declarations).
- OQ-3 (L564): TOON transpiled once to DSL vs permanent compatibility reader (affects whether the DSL must round-trip TOON faithfully enough to be the *only* surviving source).
- OQ-4 (L561): `skill:` vs `technique` field naming for parity.
- OQ-5 (L560): Orchestra Workflow/Technique/Resource variants TBD — DSL workflow-level surface (variables, modes, executionModel, artifactLocations, initialActivity — per the baseline workflow shape L39) currently rests on legacy `workflow.schema.json` semantics.
- OQ-6 (L559): frozen 16-tool response contract (Phase 0) — upstream input the DSL's bundle-feeding output must match.

## 12. Cross-cutting requirements synthesized (spec + locked decisions)

- R-X-1 Canonical IR serialization: trace-diff (R-PAR-3), artifact signing (R-GOV-4), and stored-representation audit (R-PIPE-2) jointly require a *canonical, deterministic* IR serialization — the L2 EBNF layer of the locked tri-layer formal definition.
- R-X-2 Sandboxed single-shot execution (locked decision 1) operationalizes P2+P3 for an *executed builder*: determinism comes from the sandbox (no IO/clock/random), not from authors' discipline; the spec's "lowers deterministically" (L149) is satisfied by construction.
- R-X-3 Type-system leverage (locked decisions 2+3): L1 normative .d.ts is the authoring contract; generated technique declarations make `Invoke.bindings`/`outputs` tsc-checkable (PROV-001-class errors at edit time); L3 Alloy stays the semantic-constraint layer over IR (SYM/FLOW/LOOP/DEC/TERM/SCOPE families).
- R-X-4 Dual-audience ergonomics (L149): the API must optimize simultaneously for human readability and LLM generation reliability — small surface, strict types, conciseness over raw orchestration code.
- R-X-5 Baseline workflow metadata (L39): the legacy Workflow carries `id, version, title, executionModel, variables, modes, artifactLocations, initialActivity, activities[], techniques?` — parity (P10) means the DSL workflow builder must be able to declare all of these even though §5.1 only illustrates `variables` and `activity`.
