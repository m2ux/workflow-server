# Workflow Plane — Design Specification

**Status:** Working draft
**Version:** 0.4
**Date:** 2026-06-12
**Sources:** the research threads *"are Claude workflows reusable?"* and *"Does the MCP protocol have a specification?"* (both in `/home/mike1/Incoming/`), and the live `workflow-server` repository at `/home/mike1/projects/main/workflow-server` (authoritative for all baseline facts). See [Appendix B](#appendix-b--sources--caveats).

---

## 1. Executive summary

**Workflow Plane** is the governed, harness-agnostic successor to **`workflow-server`** — an MCP server that orchestrates AI agents through a *User Goal → Workflow → Activity → Technique → Tools* model. The successor keeps that model and its deterministic-execution guarantee, re-homes it on a cleaner compiler/runtime architecture with a **TypeScript-DSL authoring surface** (replacing TOON), and adds a governance layer the current system does not yet have.

The organizing thesis:

> **The workflow language is not the harness language, and the gateway — not the harness — is the architectural center.** One canonical runtime owns workflow semantics, identity, policy, and audit. Harnesses (Claude Code, Cursor, Windsurf, non-MCP agent SDKs) attach as *adapters* at the edge. MCP is the primary edge protocol; A2A is the agent-peer/federation protocol; function-calling is the fallback. Claude Code's dynamic workflows are an *existence proof*, not a foundation.

Two layers of ambition, sequenced:

- **Phase 1 — parity.** Reproduce the current `workflow-server` behaviour (techniques, dispatch, checkpoints, traces, deterministic state, fidelity enforcement) on the new `wp-dsl → wp-ir → wp-runtime → wp-mcp` architecture, with a regression-proof baseline. No new governance semantics.
- **Phase 2+ — governance.** Layer on what the baseline lacks: cross-process **cryptographic agent identity**, a **policy engine** that gates every privileged operation by workflow-state and time, **role substantiation**, **A2A federation** across servers, and **signed-artifact deployment**.

---

## 2. Baseline & motivation

### 2.1 Motivation

The design is gateway-first. Targeting any one harness's runtime (e.g. Claude Code's JavaScript workflow runtime) creates lock-in and forces the governance model to be re-expressed for every client. Instead, Workflow Plane owns a canonical runtime and treats every harness as a replaceable adapter: the model never *interprets* a workflow at execution time — the server compiles and executes it deterministically.

Raw MCP is sufficient for tool exposure but too limited for workflow-aware, time-gated governance of skill use, tool calls, file access, and web access. That governance belongs in a policy gateway with a single internal operation model, with MCP at the edge for harness compatibility and A2A behind it for agent-to-agent delegation.

### 2.2 What `workflow-server` is today (the parity contract)

**Conceptual model — `User Goal → Workflow → Activity → Technique → Tools`:**

| Concept | What it is |
|---------|-----------|
| **Workflow** | Top-level process (TOON file): `id`, `version`, `title`, `executionModel` (agent roles), `variables`, `modes`, `artifactLocations`, `initialActivity`, `activities[]`, optional `techniques`. |
| **Activity** | Execution unit (TOON): `steps`, `decisions`, `loops`, `flows`, `transitions`, `checkpoints`, `triggers`, `techniques`, `rules`, `artifacts`. Sequential (transitions) or independent (intent `recognition`). |
| **Technique** | Reusable, **hierarchical, composable** capability (markdown): `## Capability`, optional typed `## Inputs`/`## Outputs`, ordered `## Protocol`, optional `## Rules`. Addressed by `::` paths; nested techniques inherit contract and `Initial`/`Final` protocol wrapping from ancestors. |
| **Tools** | MCP tools (below) + domain tools (Git, shell, Atlassian, …) agents invoke during execution. |

**The 16 MCP tools** (the surface Phase 1 must reproduce), grouped:

- *Bootstrap:* `discover`, `list_workflows`, `health_check`
- *Session:* `start_session`, `get_workflow_status`
- *Navigation:* `get_workflow`, `next_activity`, `get_activity`
- *Checkpoint (JIT pause/resume):* `yield_checkpoint`, `present_checkpoint`, `respond_checkpoint`, `resume_checkpoint`
- *Technique & resource:* `get_technique`, `get_resource`
- *Dispatch:* `dispatch_child`
- *Trace:* `get_trace`

**Six schemas** in `schemas/`: `workflow`, `activity`, `technique`, `condition`, `session-file`, `state`.

**Baseline capabilities (the parity surface):**

| Capability | Where it lives today |
|------------|---------------------|
| Sub-agent **delegation** | `dispatch_child` + 3-level dispatch model (Meta Orchestrator → Workflow Orchestrator → Activity Worker); child sessions with parent snapshots for trace correlation |
| Human-in-the-loop **gates** | JIT **checkpoints**: `yield`→`present`→`respond`→`resume`, with hard gates blocking progress until resolved |
| **Integrity / audit** | HMAC-SHA256-signed `session_index`; HMAC-signed **trace tokens**; 7-layer **workflow-fidelity** model |
| **Deterministic execution** | Server-owned sealed state; rigid variable/condition evaluation (`condition.schema.json`); the orchestrator never asks the LLM what to do next |
| **Session handling (no MCP fork)** | Server owns `session.json` (+ `.session-token` HMAC seal); agents pass only a 6-char base32 `session_index` |

**Determinism guarantee (in force).** Orchestra's stated goal: *given the same workflow definition and the same state, any conforming agent follows the same execution path.* Backed by the state model's rigid evaluation and the fidelity layers.

**Tech stack:** TypeScript 5.3 / Node 18+; `@modelcontextprotocol/sdk`; **TOON** (`@toon-format/toon`) as the on-disk definition format; Zod + AJV validation; Vitest. (The successor is a deliberate reimplementation in **Rust** with a **TypeScript-DSL authoring surface** replacing TOON — [§5.1](#51-authoring-surface-a-typescript-dsl), [§11](#11-implementation-language--workspace).)

### 2.3 What the baseline lacks (the Phase 2+ target)

- **No cross-process cryptographic identity.** Integrity today is HMAC over server-owned state and traces. There is no spawn-token → handshake → minted runtime identity, no proof-of-possession, no artifact signing. Dispatched children are trusted by session lineage, not by a zero-trust handshake.
- **No policy engine.** Tool/file/web/technique use is not gated by a policy decision point keyed on workflow-state, time, role, sensitivity, or budget. Checkpoints gate *progress*, not *capability*.
- **No role substantiation.** `executionModel` declares agent roles structurally, but a role is not yet a server-proven, signed entitlement an agent must present to act.
- **No federation.** The server is MCP-only and single-node; no A2A, no peer-server delegation, no multi-harness adapters beyond MCP.
- **No governed deployment.** No signed artifact, manifest, or self-attestation.

---

## 3. Design goals & principles

| # | Principle | Meaning |
|---|-----------|---------|
| P1 | **Gateway-first, harness-second** | One governed core; MCP/A2A/HTTP are adapters. The harness is replaceable. |
| P2 | **Deterministic execution** | Same definition + same state ⇒ same path. Preserve as a first-order property. |
| P3 | **Source ≠ runtime** | TOON/Orchestra source is parsed, validated, lowered to IR; the runtime executes IR only. |
| P4 | **Validation is a product feature** | Orchestra's grammar/constraint split (EBNF + Alloy, severity-graded rules) is part of the authoring and execution contract. |
| P5 | **Governance by construction** | Roles, capability scope, approvals, audit are first-class — not prose the model may ignore. *(Phase 2+.)* |
| P6 | **Zero-trust agent identity** | An agent has authority only after a server-observed handshake mints a scoped, signed identity. *No handshake, no identity; no identity, no authority.* *(Phase 2+.)* |
| P7 | **One operation envelope** | Every privileged action (skill/tool/file/web/delegate) passes one internal `OperationRequest → PolicyDecision → ExecutionResult` path, regardless of entry protocol. *(Phase 2+.)* |
| P8 | **Teach, don't just deny** | Illegal operations return a corrective *nudge* (reason + allowed alternatives + retry condition), never a bare failure. The agent learns local norms; it may never modify its own privileges/role/policy. *(Phase 2+.)* |
| P9 | **Compatibility at the edge, modernization at the core** | The MCP surface stays compatible; internals may be cleaner if observable behaviour is preserved. |
| P10 | **Parity before innovation** | A change that improves elegance but alters baseline behaviour is invisible internally or deferred. |

---

## 4. System architecture

### 4.1 Pipeline

```text
author (human or agent) writes the TypeScript DSL   (legacy TOON via a compatibility reader)
        │
        ▼
   wp-dsl     parse → AST → semantic validation (Alloy rule families) → lower
        │
        ▼
   wp-ir      normalized, executable, transport-independent graph
        │
        ▼
   wp-runtime deterministic execution · server-owned session/state · scope ·
              checkpoints · dispatch · trace · [Phase 2+: identity & policy enforcement]
        │
        ▼
   adapters   wp-mcp · [Phase 2+: wp-a2a · wp-http · wp-events]
        │
        ▼
   harnesses & external systems
```

### 4.2 Three representations of a workflow

1. **Source** — the **TypeScript DSL** (what authors/agents write); the legacy TOON corpus is ingested via a compatibility reader.
2. **AST** — parser output.
3. **IR** — the only thing the runtime executes.

Store all three separately for audit/reproducibility: *the source authored, the IR executed, the policy context under which it ran.* The baseline already separates source (TOON) from server-owned runtime state; Workflow Plane formalizes the AST/IR middle.

### 4.3 One binary, many surfaces, one runtime *(Phase 2+ for non-MCP surfaces)*

The deployable is a **server product with MCP as one adapter**, not "an MCP tool with extras." A single (signed) binary runs one core runtime and exposes:

| Surface | Audience | Purpose | Status |
|---------|----------|---------|--------|
| **MCP** | Claude Code, Cursor, Windsurf, … | Workflow navigation, techniques, checkpoints, dispatch, traces as *tools* | Baseline (the 16 tools) |
| **A2A** | Orchestration agents, peer servers | Collaborate as an *agent peer*; cross-server delegation | Phase 2+ |
| **Admin HTTP** | Installers, ops | Health, version, signer identity, registration, lifecycle, self-attestation | Phase 2+ |
| **Workflow HTTP** | External services, webhooks, CI | Start/query runs, approvals, fetch receipts | Phase 2+ |
| **Event stream** | Dashboards, observability | Live audit events, transitions, policy decisions | Phase 2+ |

**Invariant (no semantic drift):** MCP `next_activity`/`dispatch_child` and any future HTTP `POST /runs` must resolve to the *same* internal command, emit the *same* trace/audit events, and pass the *same* gates. No "safe MCP mode" vs "unsafe HTTP mode."

---

## 5. The authoring DSL & the Technique model

### 5.1 Authoring surface: a TypeScript DSL

Workflow Plane's human-readable workflow artifacts — workflow and activity definitions — are authored in a **TypeScript-flavored DSL**, not TOON. The DSL is a small, strictly-typed builder API: ergonomic for humans to read and for LLMs to write, and compiled (by `wp-dsl`) to the same AST/IR the runtime executes. Authoring in TypeScript means the plan lives in code and lowers deterministically — the model never *interprets* a definition at runtime — while staying far more concise than raw orchestration code.

```ts
// illustrative — the exact builder API is an open question (§14.2)
export default workflow('work-package', '3.0.0', (wf) => {
  wf.variables({ mode: 'implement', elicitation_complete: false });

  wf.activity('requirements-elicitation', (a) => {
    a.inputs('raw_responses', '01.create-issue.issue_number');

    const ask     = a.step('ask-question',        { technique: 'domain-question' });
    const collect = a.step('collect-assumptions', { technique: 'assumptions-review' });

    const route = a.decision('platform-routing').match('issue_platform', {
      jira:    [a.step('post-to-jira', { technique: 'jira-comment' }), a.checkpoint('jira-comment-review')],
      github:  [a.step('post-to-github', { technique: 'github-comment' })],
      default: [a.step('create-document', { technique: 'artifact-management' })],
    });

    a.loop('domain-iteration').forEach('current_domain').over('question_domains').max(5)
      .body(ask, a.decision('user-intent'));

    a.flow('main', collect, route,
      a.transition(when(eq('elicitation_complete', true)), goTo('research')));
  });
});
```

The DSL is the canonical authoring surface; the legacy TOON corpus is ingested by a compatibility reader (or transpiled once to the DSL) and lowers to behaviourally-equivalent IR — which is what makes trace-diff parity ([§12.4](#124-testing-model)) possible.

### 5.2 Orchestra: the semantic model & constraints (surface-independent)

Orchestra (`docs/orchestra-specification.md` v1.0.0, Draft) defines the *meaning and validation* of the Activity model independently of concrete syntax; the deterministic-landscape guarantee is its design goal: *given the same workflow definition and the same state, any conforming agent follows the same execution path.* The legacy concrete syntax is the TOON/indented grammar (`grammar/activity.ebnf`); the Workflow Plane concrete syntax is the TypeScript DSL (§5.1). Both express the same model and are checked by the same constraint families. Orchestra defines four primitives, one fully specified so far:

| Primitive | Orchestra status |
|-----------|------------------|
| **Workflow** | TBD — uses legacy `workflow.schema.json` |
| **Activity** | **Fully defined** (grammar + constraints) |
| **Technique** | TBD in Orchestra — separately fully specified in `docs/technique-protocol-specification.md` (see §5.3) |
| **Resource** | TBD |

**Activity model:** three primitives — **steps**, **decisions**, **loops** — composed by **flows** (named, ordered reference lists; every activity has a `main` flow).

- **Step** = a unit of work; non-trivial steps name a technique (resolved via `get_technique(step_id)`). *(Grammar note: the EBNF field is `skill:` and the Alloy signatures say `SkillRef`/`SkillDef`; the model is "technique" — the field name binds a step to a technique.)*
- **Decision** = branch point. *Interactive* (`message:` → presents to user, blocks) or *programmatic* (`variable:` multi-way match, or `condition:` boolean algebra). Branches rejoin unless terminal; empty branch = pass-through; branchless interactive = acknowledgment gate; self-reference = retry (must have a non-recursive exit).
- **Loop** = `forEach` over a collection with optional `maxIterations`; `break` exits the innermost loop only; `- activity:` is a layered terminal exiting the whole activity.
- **Scope chain:** local flow → loop variable → activity → workflow.

**Formal artifacts:** EBNF in `grammar/activity.ebnf` (+ `docs/orchestra-specification.md` §3.2); Alloy constraints in `constraints/activity.als`, surfaced as severity-graded validation rules:

| Family | Rules (severity) |
|--------|------------------|
| Provenance | `PROV-001` required input resolves from scope (ERROR); `PROV-002` cross-activity refs qualified `NN.step.name` (ERROR) |
| Symbol uniqueness | `SYM-001..004` step/decision/loop/flow ids unique (ERROR) |
| Flow structure | `FLOW-001` main flow exists (ERROR); `FLOW-002` no orphan flows (WARN); `FLOW-003` flow refs resolve (ERROR) |
| Loop | `LOOP-001` loop flow exists (ERROR); `LOOP-002` break in loop scope (ERROR); `LOOP-003` break innermost (INFO) |
| Decision | `DEC-001` variable decision should have default (WARN); `DEC-002` self-ref has exit (ERROR); `DEC-003` interactive form (ERROR); `DEC-004` programmatic form (ERROR) |
| Terminal | `TERM-001` `activity:` terminates scope (INFO); `TERM-002` branches rejoin unless terminal (ERROR) |
| Scoping | `SCOPE-001` resolution order (INFO); `SCOPE-002` boolean expr names resolvable (ERROR) |

These rule families are what `wp-dsl` preserves as compiler passes (Rust-native, not Alloy-backed at runtime).

### 5.3 Three authoring/runtime layers

| Layer | Purpose |
|-------|---------|
| **Authoring DSL** | The TypeScript DSL (§5.1) — ergonomic, human/model-friendly; Orchestra semantics |
| **Canonical IR** | Strict, normalized — the validation & portability center |
| **Runtime plan** | Fully resolved graph with policies, grants, scopes, adapter bindings attached *(Phase 2+ overlay)* |

### 5.4 The Technique model

A **technique** is a unit of reusable procedure + interface: a `## Capability`, optional typed `## Inputs`/`## Outputs`, an ordered `## Protocol`, optional `## Rules`. Techniques are the leaf of `Goal → Activity → Technique → Tools`.

- **Hierarchy & addressing.** Techniques nest in folders; addressed by `::` paths (`cargo-operations::check`). Unprefixed refs resolve current-workflow-first, then the shared `meta` layer. A `<wf>/techniques/TECHNIQUE.md` is the workflow-root technique (ancestor of all).
- **Contract inheritance.** Keyed sections (Inputs/Outputs/Rules) union from ancestor containers; the technique-local entry wins. **Protocol composition:** ancestor `Initial`/`Final` blocks wrap a descendant's protocol recursively (root outermost, immediate parent innermost); the server renumbers.
- **Symbol model.** One namespace of mutable symbols; **direction is structural** (carried by the section, not spelling). **Symbol ids are `snake_case`** (they bind to runtime variables by exact string match); **names** (techniques, rules, files) are **`kebab-case`**. Protocol variables use declare-once `{$name}` then `{name}`. Grammatical shape encodes kind (boolean = affirmative predicate, collection = plural noun, I/O id = qualified noun phrase head-noun-last, rule name = positive declarative assertion). This is the **AP-60** discipline.
- **Executable `::` vs symbol `.`.** `::` invokes a technique; `.` names a rule (`workflow.technique.rule-name`) without invoking it. Invocation args go in `(…)`, never `{}` (braces are the designator namespace).
- **Delivery.** `get_technique` returns one fully composed technique; `get_workflow`/`get_activity` return a **bundle**: `techniques` (bodies by path), `rules` (`[name, text]`), `unresolved` (a non-empty list is a definition defect a lint gate enforces). Core orchestrator/worker technique sets are auto-included.

Techniques remain **markdown** capability/protocol definitions, referenced from the TypeScript DSL by `::` path (e.g. `a.step('ask-question', { technique: 'domain-question' })`). Workflow Plane carries the Technique model forward as canon; whether technique authoring also gains a TypeScript surface, and the design of the Workflow/Resource DSL forms, are open questions (§14.2).

---

## 6. Intermediate representation (`wp-ir`)

### 6.1 Purpose

The IR is the only form the runtime executes. It normalizes the TypeScript DSL (and the legacy TOON corpus) into a deterministic model, makes scope and control flow explicit, and retains traceability to source. It may be cleaner than the source as long as it preserves baseline behaviour.

### 6.2 Lowering the Activity model

In the TypeScript DSL these constructs are builder calls (`a.step(...)`, `a.decision(...)`, `a.loop(...)`, `a.flow(...)`); in the legacy TOON corpus they are the `steps:`/`decisions:`/`loops:`/`flows:` sections. Both lower to the same nodes.

| Authored construct | IR node | Note |
|------------------|---------|------|
| `step` (technique-backed) | `Invoke { technique_ref, bindings, outputs }` | Resolves a `::` technique path |
| interactive `decision` (`message:`) | `AwaitInput { prompt, options, branches }` | Splits prompting from branching |
| programmatic `decision` (`variable:`/`condition:`) | `Branch { MatchVar \| Condition }` | Preserves both forms |
| `loop` (`forEach`) | `Iterate { var, collection, body, max_iterations }` | |
| flow item `- message:` | `EmitMessage` | Status / user-facing text |
| flow item `- activity:` | `GotoActivity` | Local activity transition (layered terminal) |
| flow item `- break` | `LoopExit` | Innermost loop only |
| `flow` | `Block { items }` | Named ordered block; `main` is entry |
| (end) | `Terminate` | Explicit completion |

This is the Phase 1 node set. The baseline already provides three further constructs that are therefore Phase 1, not deferred:

| Baseline construct | IR node | Status |
|--------------------|---------|--------|
| `checkpoints[]` + yield/present/respond/resume | `Checkpoint { id, options, blocking, auto_advance, effects }` | Phase 1 |
| `dispatch_child` | `Dispatch { workflow_id, agent_id, planning_slug }` | Phase 1 |
| `artifacts[]` (`create`/`update`) | `EmitArtifact { id, name, location, action }` | Phase 1 |

Only the *governed* extensions are deferred: `RequireApproval` (role-qualified, escalating) layered on `Checkpoint`; `CapabilityGate` (policy-gated operation); `Delegate` (identity-backed, A2A-capable) layered on `Dispatch`.

### 6.3 Governance envelope (the Phase 2+ seam)

```rust
pub struct ExecutionPolicy {
    pub required_role:    Option<RoleRef>,
    pub capability_scope: Vec<CapabilityRef>,
    pub approval:         Option<ApprovalPolicy>,   // layers on Checkpoint
    pub audit:            AuditPolicy,
    pub retry:            Option<RetryPolicy>,
    pub timeout:          Option<TimeoutPolicy>,
}
pub struct NodeEnvelope { pub id: NodeId, pub node: Node, pub policy: ExecutionPolicy }
```

In Phase 1 the envelope exists but is inert (legacy-equivalent semantics). It is where the policy engine ([§8](#8-governance--trust-model-phase-2)) attaches without reshaping the control-flow core.

### 6.4 Normalized graph projection (analysis & portability)

For cross-harness portability and formal analysis, `wp-ir` also exposes a derived **graph view** — the portable center: **Node, Edge, Guard, Effect, CapabilityGrant, AuditEvent** (with `BoolExpr`/`ValueExpr`, `ViolationAction` = deny/fail_node/fail_workflow/escalate/nudge, `EffectType` = invoke_tool/read_resource/write_state/emit_event/delegate/request_approval/grant_capability/revoke_capability/transition/compute).

The activity/block/node tree is the authoring/Phase-1 form (it maps 1:1 to the Activity model). The graph projection + governance envelope is the analysis/portability/governance form. `wp-ir` produces the tree from lowering and exposes the graph as a derived view. Keep `wp-ir` distinct from `wp-domain` (business nouns) — IR is an *executable plan*.

### 6.5 Binding & scope

Preserve Orchestra's scope precedence exactly (local flow → loop var → activity → workflow), as an explicit runtime mechanism. Cross-activity references use the qualified `NN.step.name` form (`PROV-002`). Symbol ids remain `snake_case` to bind to runtime variables by exact string match (per the Technique symbol model).

---

## 7. Runtime semantics

The runtime executes IR deterministically and preserves the baseline's observable semantics.

- **Server-owned state.** Canonical `session.json` (Zod/JSON-Schema validated) + `.session-token` (HMAC seal) on disk; agents pass only the deterministic 6-char base32 `session_index`. Atomic writes (temp+rename); transparent restarts; resume via `start_session({ planning_slug })`.
- **Deterministic transitions.** Evaluate `transitions[]` in order; first matching `condition` wins; the orchestrator calls `next_activity` — never asks the LLM what to do next.
- **Control flow.** Decisions rejoin unless terminal; variable decisions warn without `default` and pass through if unmatched; `break` exits innermost loop; `activity:` exits the activity; self-referencing decisions implement retry (with a guaranteed exit).
- **Checkpoints (JIT).** Worker `yield_checkpoint` → server records `activeCheckpoint`, returns one-shot handle → orchestrator `present_checkpoint` → `respond_checkpoint` (`option_id` | `auto_advance` | `condition_not_met`) → effects (`setVariable`/`transitionTo`/`skipActivities`) → worker `resume_checkpoint`. **Hard gate:** most tools blocked while a checkpoint is active.
- **Dispatch.** 3-level model: Meta Orchestrator → Workflow Orchestrator (child session via `start_session({parent_planning_slug})`, parent snapshot for trace correlation) → Activity Worker (shares `session_index`). Checkpoints bubble up; effects cascade down.
- **Fidelity (7 layers).** Token integrity (HMAC), checkpoint gate, cross-activity validation (warn), transition-condition tracking (warn), step manifest (warn), activity manifest (warn), execution trace (HMAC-signed tokens resolved via `get_trace`). Preserve all seven.
- **Resources.** Lazy-loaded markdown via `get_resource` (bare slug = current workflow; prefixed = cross-workflow; `#section` anchors).

---

## 8. Governance & trust model *(Phase 2+)*

This is the layer the baseline lacks. It attaches to the existing technique/checkpoint/dispatch machinery.

### 8.1 The universal operation envelope

Every privileged action an agent wants passes one internal envelope — the abstraction the baseline (and raw MCP) lacks:

```ts
type OperationRequest = {
  actor_id: string;
  workflow_id: string;
  workflow_state: string;        // from the deterministic state model
  task_id: string;
  operation_type: 'skill' | 'tool' | 'file_read' | 'file_write' | 'web_fetch' | 'web_post' | 'delegate';
  target: string;
  purpose: string;
  time_context: string;
  budget_class: string;
  sensitivity: string;
  requires_human_approval: boolean;
};
```

Flow: agent emits an operation → **PDP** evaluates → returns a decision → on allow, **PEP** executes (locally, or delegates) and returns an artifact/event. Adapters map MCP tool calls, A2A tasks, and function calls *into* this one envelope.

### 8.2 Policy engine (PDP/PEP)

- **Separation:** the application owns the workflow state machine; the policy engine answers only *"is this allowed right now?"*. Externalize policy (OPA/Rego is a strong fit; a native Rust engine is the alternative). Policy is **context-based (CBAC)** — workflow-state and time are first-class inputs, not static role ACLs.
- **Decision outcomes:** `ALLOW` · `ALLOW_WITH_WARNING` · `DENY_WITH_NUDGE` · `DEFER_UNTIL` · `AWAIT_APPROVAL` · `ESCALATE_TO_ROLE`.
- **Example rules:** in `research` state allow `web_fetch` + workspace `file_read`, deny `file_write` outside scratch; in `implementation` allow tools + project writes, restrict network to an allowlist; in `review` deny destructive ops, require approval for publish/deploy; outside approved hours downgrade autonomy budget and force approval for external side effects.

### 8.3 Teach, don't just deny (the nudge contract)

A denial returns guidance, not a dead end:

```ts
type NudgeResponse = {
  decision: 'deny' | 'defer' | 'await_approval';
  reason_code: 'STATE_MISMATCH' | 'TIME_WINDOW_CLOSED' | 'ROLE_NOT_QUALIFIED' | 'SCOPE_EXCEEDED';
  why: string;
  recommended_next_actions: string[];
  retry_condition: string;
  approval_path?: string;
};
```

A learning loop logs denial → chosen alternative → resolution, feeding planner/prompt/role-instruction improvements over time. **Hard rule:** the agent may never modify its own privileges, role file, or policy. Surfaced through MCP, a nudge is returned as a normal tool result (so harnesses stay compatible while being steered).

### 8.4 Roles as server-proven memory

> A role is **not** something the agent *claims*; it is something the server *proves* and *remembers*. It carries no weight until the server binds capabilities and context to a provable identity.

This substantiates the structural `executionModel` roles. A **role manifest** governs delegation eligibility:

```
agent_id · role_id · role_name · allowed_workflow_states · allowed_operation_types ·
data_access_level · delegation_depth_limit · autonomy_budget · approval_requirements ·
time_window_policy · trust_source (registry|manual|ephemeral) · credential_strength
```

Three decision points: **capability** (may this agent do this op?), **delegation** (may it delegate at all now?), **delegate qualification** (which roles are valid targets right now?). A **curated registry** returns only qualified candidates — no free-form delegation. This is runtime RBAC/ABAC for agent societies.

### 8.5 Zero-trust agent identity

Authority is established by a two-step flow that **separates spawn authorization from runtime identity** (a stolen bootstrap token is not a usable credential). This is the governed overlay on `dispatch_child`:

```text
1. Spawn authorization   — server issues a one-time, short-lived signed spawn token
2. Identity handshake     — spawned worker presents token + proves liveness (PoP key)
3. Runtime identity        — server mints a fresh, scoped, signed identity bound to that key
4. Per-request enforcement — every call validated against the minted identity
```

- **Spawn token claims:** `iss`, `aud`, `workflow_id`, `run_id`, `requested_role`, `worker_profile`, `nonce`, `exp`, `parent_agent_id`.
- **Runtime identity:** `agent_instance_id`, `role_id`, `scope`, `exp`, `jti`, signer, credential bound to the worker's PoP key.
- **Enforcement:** reject unless issued-by-this-server · unexpired · bound to current run · scope permits the action · `jti` active · PoP verifies.
- **Effect:** *No handshake, no identity; no identity, no authority.* A harness may launch extra agents, but without a server-observed handshake they are inert. The harness may **launch**; the server must **authorize and assign**.

### 8.6 Audit & signed receipts

The baseline HMAC-signs `session_index` and trace tokens. Phase 2+ adds cross-process attribution and signed runtime receipts (Ed25519 + hash-chained), attributing every action to: parent agent · worker instance · run · role grant · capability scope. Two trust layers: **artifact signature** (authentic at install) and **runtime receipts** (authentic at runtime).

---

## 9. Distributed execution model *(Phase 2+)*

### 9.1 Grounded in the existing dispatch model

The baseline's 3-level dispatch (Meta → Workflow → Activity) already does in-host delegation with child sessions and parent snapshots. Workflow Plane extends this *outward* (across servers via A2A) and *upward in rigor* (identity-backed activation, role qualification).

Principle: **delegation lives in the server, not the harness.** Avoid split authority. The frontend harness submits top-level work; the server decides whether a request becomes one worker, ten, or a remote A2A fan-out.

### 9.2 Governed worker handshake

Extends `dispatch_child`: server returns a signed `spawn_worker` request → harness launches a worker (bootstrap: *contact server, present token, take no action, await assignment*) → §8.5 handshake → server activates with a **task packet** (objective, bounded context, allowed tools, stop conditions, expected output, audit IDs). Workers share the harness **contract** (tool interface, policy gateway, role model, output schema), **not** the live session/context — a fork-join model with isolated contexts.

### 9.3 Worker dispatch mechanics

Leased queue + role-qualified worker pools; pull-with-leasing preferred (clean crash recovery). Job lifecycle: `assigned → in_progress → review/done/failed`. Components: gateway · dispatcher · worker registry · queue · artifact store · supervisor. Headless Claude Code workers (`--print`, restricted `--allowedTools`) are one valid worker type; non-LLM executors (compile/test/deploy) are another.

### 9.4 MCP vs A2A, and federation

| Interface | Mental model |
|-----------|--------------|
| **MCP** | "Use Workflow Plane's capabilities as *tools*." (primary harness-facing surface — the baseline) |
| **A2A** | "Collaborate with Workflow Plane as another *agent*." (external peer interop **and** internal delegation) |
| **Function-calling** | Fallback for harnesses without MCP. |

Topology: `harness → local Workflow Plane server (MCP) → peer servers (A2A)`. Distribution at the **server layer**, never harness↔harness. One server is the **workflow authority** per top-level run; delegated peers return signed results/receipts, state changes, policy decisions, capability evidence. **Hub-and-spoke** is the recommended first topology (vs. local cluster / enterprise mesh).

---

## 10. Packaging, deployment & supply-chain trust *(Phase 2+)*

- **Two-phase deployment.** *Bootstrap:* a skill drives the harness to read the manifest, download artifact + signature, **verify before execution**, refuse on failure, register as an MCP server, confirm via health/metadata. *Operational:* use only the runtime MCP surface.
- **Manifest:** `name`, `version`, `artifact{type,url,sha256}`, `signature{type:sigstore, bundleUrl, certificateIdentity, certificateOidcIssuer}`, `mcp{transport,command,args}`. Sigstore/Cosign for signing/verification.
- **Verification policy lives in skill + manifest, not the model:** pinned signer identities, required issuer, digest match, minimum version, expected tool set. The install must be constrained, auditable, reject-on-failure (so a model can't "helpfully" bypass it).
- **Runtime MCP governance tools** (extending the baseline 16): `workflow_compile`, `workflow_verify_receipt`, `get_server_attestation`, plus governed wrappers around start/step/approve/audit.
- **Trust stack:** artifact signature · manifest digest · SBOM/provenance · signed runtime receipts · state token.
- **Self-attestation:** `get_server_attestation` returns live build identity + hashes (artifact digest, version, interface set, MCP tool-manifest hash, policy-bundle hash, signer) so an agent can confirm the running service matches the signed package.

---

## 11. Implementation: language & workspace

### 11.1 Language

- **Baseline today:** TypeScript / Node 18+ (MCP SDK, TOON, Zod/AJV, Vitest).
- **Successor:** **Rust.** A security-sensitive, long-running control plane (identity, signing, policy, audit, multi-protocol adapters, federation) benefits from memory safety, no GC pauses, and type-level modeling; the one-binary/many-surface shape fits `axum`/`tokio`/`tower`/`hyper` (+ `tonic` if gRPC); crypto stays inside the trusted binary. Tradeoff: Go is the faster prototype, Rust the better final architecture. **This is a deliberate reimplementation**, not a port — Phase 1 parity is defined behaviourally, not by shared code.

### 11.2 Cargo workspace (full target)

```text
crates/
  wp-types/     ids, enums, DTOs, errors
  wp-domain/    workflow, run, role, capability, grant, receipt, audit
  wp-dsl/       Orchestra parser, AST, validation (rule families), lowering
  wp-ir/        normalized graph + node forms + graph projection
  wp-policy/    PDP: allow/deny/nudge/defer/await/escalate (OPA-or-native)
  wp-identity/  spawn tokens, runtime identities, role binding, handshake, PoP
  wp-crypto/    signing, verification, token minting, envelopes (HMAC + Ed25519)
  wp-runtime/   engine, planner, dispatcher, transitions, checkpoints, state machine
  wp-store/     persistence traits + memory/postgres + on-disk session model
  wp-worker/    spawn request, handshake, assignment, activation, heartbeat, lease queue
  wp-mcp/       MCP adapter (the 16 tools + governed extensions)
  wp-a2a/       peer/remote-agent delegation adapter
  wp-http/      admin + workflow HTTP, health, bootstrap, attestation
  wp-events/    event stream, audit feeds
  wp-trace/     trace tokens, fidelity layers
  wp-config/    typed config, feature flags
  wp-testkit/   golden corpus, parity harness
apps/
  workflow-plane-server/   production binary
  workflow-plane-cli/      validate/compile/inspect/test, mint test identities, replay traces
```

**Dependency direction (one-way; domain never depends on transport):**
`apps → wp-mcp/a2a/http/events → wp-runtime/worker → wp-policy/identity/store → wp-domain/types/crypto`.

**Trait seams:** `PolicyEngine`, `IdentityIssuer`, `RunStore`, `WorkerDispatcher` (swap memory↔Postgres, local↔A2A dispatch without touching the model).

### 11.3 Parity-minimal subset (Phase 1)

Ship Phase 1 with: `wp-types`, `wp-dsl`, `wp-ir`, `wp-runtime`, `wp-mcp`, `wp-store`, `wp-trace`, `wp-cli`. `wp-runtime` and `wp-mcp` must already implement dispatch, checkpoints, technique resolution, and the fidelity layers — those are baseline. Defer (stub, no behavioural effect): `wp-policy`, `wp-identity`, `wp-a2a`, `wp-http`, `wp-events`, the governed parts of `wp-worker`.

---

## 12. Migration strategy — parity-first

### 12.1 Objective

**Same observable behaviour, better internals.** The live `workflow-server` is the operational spec for Phase 1 — behavioural equivalence at the MCP surface and runtime semantics, not "close enough."

### 12.2 Parity domains

| Domain | Phase 1 target |
|--------|----------------|
| The 16 MCP tools | Equivalent names, argument/response shapes, error semantics |
| Workflow/Activity loading | Equivalent loading of the legacy TOON corpus (compatibility reader) + the TypeScript DSL as the new authoring surface; same Orchestra validation (rule families, severities) |
| Activity execution | steps, decisions (interactive + programmatic), loops, flows, scope precedence, transitions |
| **Technique resolution** | `::` addressing, current-workflow→`meta` precedence, contract inheritance, `Initial`/`Final` wrapping, bundle buckets |
| **Checkpoints** | yield/present/respond/resume, hard gate, three resolution modes, effects |
| **Dispatch** | `dispatch_child`, 3-level model, child sessions, parent snapshots |
| Session/state | server-owned sealed state, `session_index`, atomic writes, transparent resume |
| **Fidelity** | all 7 layers (HMAC tokens, checkpoint gate, validations, trace) |
| Resources | lazy `get_resource`, prefixing, `#section` |
| Trace | `get_trace`, HMAC-signed trace tokens, comparable event structure |

Authoring migrates from TOON to the TypeScript DSL: `wp-dsl` reads the legacy TOON corpus via a compatibility front-end (and may transpile it once to the DSL); both surfaces lower to behaviourally-equivalent IR, so the live server (TOON) and Workflow Plane can be trace-diffed on the same workflows.

### 12.3 The compatibility rule

> If a design choice improves elegance but changes baseline semantics, **defer it.** Mirror the legacy shape first (even the `skill:` grammar field, the self-referencing-retry pattern, the checkpoint shape); redesign later.

### 12.4 Testing model

1. **Golden corpus** from the live `workflows/` submodule (linear flows; interactive + variable + condition decisions; loops with break; activity transitions; qualified cross-activity refs; checkpointed flows; dispatch chains; technique bundles).
2. **Golden MCP responses** — stored expected payloads from the live server per tool.
3. **Trace diffing** — run both, compare visited activities/steps/decisions, branch choices, checkpoint states, dispatch lineage, final state, termination path. (The trace tokens make this directly possible.)
4. **Semantic regression** — the Orchestra rule families (`PROV`/`SYM`/`FLOW`/`LOOP`/`DEC`/`TERM`/`SCOPE`) as automated suites, mirroring `constraints/activity.als`.
5. **Strangler-fig rollout** — side-by-side, compare, cut over by capability slice once parity gates are green.

### 12.5 Delivery phases (subordinate to the architecture)

| Phase | Deliverable |
|-------|-------------|
| **0 — Contract capture** | Freeze the live server's observable contract: 16 tools, payloads, technique bundle shape, checkpoint/dispatch semantics, fidelity fields. Build the corpus. |
| **1 — Parse & validate** | Loading, Orchestra parse/AST/diagnostics, rule-family validation, technique resolution, compile-to-IR. No execution. |
| **2 — Lower & execute** | Deterministic execution: steps/decisions/loops/flows + scope; checkpoints; dispatch. |
| **3 — Session/fidelity parity** | Server-owned state, resume, all 7 fidelity layers, trace emission comparable to baseline. |
| **4 — Cutover readiness** | MCP surface compatible; golden-response + trace-diff suites green; documented/accepted deltas. |

---

## 13. Scope boundaries

### 13.1 Phase 1 — parity

The 16 MCP tools · TypeScript-DSL authoring + legacy-TOON reader + Orchestra validation · Activity execution · **Technique resolution/bundling** · **JIT checkpoints** · **`dispatch_child` + 3-level dispatch** · server-owned deterministic state · **all 7 fidelity layers** · resources · traces.

### 13.2 Phase 2+ — governance (what the baseline lacks)

- **Cross-process cryptographic identity** — spawn-token → handshake → minted runtime identity, PoP, Ed25519 receipts (vs. today's HMAC-over-server-state).
- **Policy engine** — PDP/PEP, OPA/Rego, CBAC (workflow-state + time gating), nudge/defer/escalate, the operation envelope gating skill/tool/file/web.
- **Role substantiation** — server-proven, signed roles + role manifests + curated delegation registry (vs. today's structural `executionModel`).
- **A2A federation** — peer-server delegation, multi-harness adapters (the server is MCP-only today), function-calling fallback.
- **Governed deployment** — signed artifact, manifest, Cosign verification, self-attestation, two-phase bootstrap skill.
- **Governed-approval & capability nodes** — `RequireApproval` (role-qualified/escalating) over `Checkpoint`; `CapabilityGate`; identity-backed `Delegate` over `Dispatch`.

---

## 14. Decisions log & open questions

### 14.1 Decisions

| Decision | Rationale |
|----------|-----------|
| Gateway-first, harness-second | Multi-harness support; harness replaceable; governance stable |
| Own canonical runtime | Avoid harness lock-in; server compiles/executes, model never interprets at runtime |
| DSL → IR → runtime → adapters | Determinism, auditability, portability |
| Carry the Technique model forward as canon | It is a clean, composable capability system; preserve, don't redesign |
| Parity defined behaviourally vs the live repo | Parity includes dispatch/checkpoints/techniques/traces |
| Rust for the successor (reimplementation) | Security-sensitive control plane; one-binary/many-surface |
| MCP edge / A2A core / function-calling fallback | Matches the protocols' intended roles |
| Operation envelope as the single PDP/PEP path | One choke point for governance regardless of entry protocol |
| Spawn authorization ≠ runtime identity | Zero-trust; stolen bootstrap tokens unusable |
| Roles are server-proven, not agent-claimed | Substantiates the structural `executionModel` |
| Teach via nudge, not bare deny | Agents learn norms; never self-authorize privilege change |

### 14.2 Open questions

- Exact frozen contract for all 16 tools' response schemas (Phase 0).
- Orchestra variants for **Workflow / Technique / Resource** (still TBD in `orchestra-specification.md`) — design, or keep legacy schemas through Phase 1?
- The `skill:` grammar field vs the `technique` model: keep `skill:` for parity, rename later?
- Exact TypeScript-DSL builder API (the §5.1 example is illustrative): the surface for steps, decisions, loops, flows, transitions, checkpoints, and dispatch.
- Whether technique authoring also moves to a TypeScript surface or stays markdown (§5.4).
- Whether the legacy TOON corpus is transpiled once to the DSL or read permanently via a compatibility front-end.
- Persistence model for the successor (on-disk `session.json` + `.session-token` today; Postgres timing?).
- How `dispatch_child`'s child-session lineage maps onto the identity-backed handshake (session-lineage trust → cryptographic trust).
- Tolerance for bug-fix deviations from baseline behaviour.

---

## 15. Living-document policy

Internal working artifact, revised as decisions mature. Update **architecture** sections when primitives/crates/runtime semantics/compatibility assumptions change; update **phase** sections only when sequencing changes; keep **Phase 1 parity** separate from **Phase 2+ ambitions**; record material changes with a version/date note.

---

## Appendix A — Glossary

| Term | Meaning |
|------|---------|
| **Workflow Plane** | The governed, cross-harness successor (crates `wp-*`) |
| **`workflow-server`** | The live MCP server at `/home/mike1/projects/main/workflow-server`; the Phase 1 baseline |
| **Orchestra** | The surface-independent semantic model & constraints for the Activity model (`docs/orchestra-specification.md`; `constraints/activity.als`); concrete syntaxes are legacy TOON (`grammar/activity.ebnf`) and the TypeScript DSL |
| **TypeScript DSL** | Workflow Plane's authoring surface for workflow/activity artifacts — a typed builder API compiled to AST/IR; replaces TOON |
| **TOON** | Legacy on-disk workflow/activity format (`@toon-format/toon`) — the baseline authoring surface, superseded by the TypeScript DSL |
| **Technique** | Hierarchical, composable capability (markdown, `::`-addressed, `Initial`/`Final` wrapping) |
| **Checkpoint** | JIT human-in-the-loop pause/resume gate (yield/present/respond/resume) |
| **Dispatch** | Child-agent spawning (`dispatch_child`; Meta→Workflow→Activity 3-level model) |
| **session_index** | Deterministic 6-char base32 handle; the only state token agents carry |
| **Operation envelope** | The single internal `OperationRequest` every privileged action passes (Phase 2+) |
| **PDP/PEP** | Policy Decision Point / Policy Enforcement Point |
| **Runtime identity** | Short-lived, scoped, signed credential minted after a worker handshake (Phase 2+) |
| **A2A** | Agent-to-Agent protocol; agent-peer interop + server federation |

## Appendix B — Sources & caveats

- **Sources.** This specification draws on two research threads — *"are Claude workflows reusable?"* and *"Does the MCP protocol have a specification?"* (both in `/home/mike1/Incoming/`) — and the live `workflow-server` repository at `/home/mike1/projects/main/workflow-server`, which is authoritative for all baseline facts.
- **External technical claims** (Sigstore/Cosign verification, A2A, OPA/Rego, Ed25519 hash-chained receipts, the Rust crate stack) should be re-verified against current upstream documentation at implementation time.
- **Claude Code's dynamic workflows** are referenced only as an existence proof of code-as-orchestration; Workflow Plane defines its own DSL and does not depend on Claude Code's workflow runtime.
