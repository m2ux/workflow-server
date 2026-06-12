# Workflow Plane authoring DSL — Design B (Lens B: maximal agent writability & reviewability)

Status: candidate design, 2026-06-12.
Inputs: `/tmp/wp-dsl-work/inventory-legacy-semantics.md`, `inventory-technique-contracts.md`, `inventory-runtime-model.md`, `inventory-newspec-requirements.md`; spec sources `docs/orchestra-specification.md` (§3.4 L686–836), `.engineering/proposals/workflow-plane/design-specification.md` (§5.1 L151–175, §6 L233–289).

---

## 0. Lens B stance (the rubric every choice below is scored against)

1. **An artifact is one object literal plus a small vocabulary of flat constructor functions.** LLMs are most reliable filling in object literals against a known interface; fluent chains (the §5.1 illustrative `a.loop(..).forEach(..).over(..).max(..)`) require recalling method names *and order* and diff poorly. No chaining anywhere in this surface.
2. **The activity body reads top-to-bottom as the execution order.** The `run:` array IS the main flow. A reviewer reads the diff like a checklist; nothing requires jumping to a `flows:` section to learn what executes.
3. **Generics exist only in the `.d.ts`, never at the author site.** Type inference from literal properties (the `technique:` string) carries all contract typing; the author writes zero type annotations.
4. **References are strings where a position is unambiguously a reference** (`over:`, `match` variable, `goTo` target); the `v()` wrapper appears only where a literal and a reference could be confused (`bind` values). Fewer wrappers = fewer first-try mistakes.
5. **Weaker static guarantees are accepted where they cost readability; the compile step (sandboxed single-shot execution + semantic passes) picks up everything tsc gives up.** Severity-graded, rule-id'd diagnostics are the product feature (P4), not the type system.

---

## 1. Topology decision table

### 1.1 Orchestrator hypotheses (a)–(g)

| Move | Verdict | Reasoning |
|---|---|---|
| (a) Composition by value | **ADOPT (modified)** | Sequences are host arrays; branches/loop bodies are inline arrays; declare-then-reference dissolves into `const` + reuse of the same node value. SYM-004, FLOW-001/002/003, LOOP-001 discharge. **Modification:** two by-id reference tokens survive because value composition cannot express cycles in literal style: `retry(decisionId)` (legacy decision self-reference, SPEC:771–777) and `rerun(loopId)` (legacy `- loop:` re-entry from inside the loop's own body, SPEC:794–795). A node value bound to a `const` and used at two sites is ONE declaration with two reference occurrences (exactly legacy declare/reference, e.g. `stakeholder-discussion` referenced from two decisions in §3.4) — uniqueness checking is identity-aware (§4 ID rules). |
| (b) Decision split by constructor | **ADOPT** | `ask()` (interactive; branchless = ack gate), `match()` (variable multi-way), `ifElse()` (boolean). DEC-003/DEC-004 unrepresentable. Three obvious names beat one constructor with a mode discriminant for first-try LLM correctness. The legacy `default:` magic branch key becomes a separate `otherwise:` option, so any literal case value (including the string `"default"`) is expressible — the third legacy magic string dissolves (with `main` → `run:` and `- flow: continue` → empty array `[]`). |
| (c) Loop body as callback with handle + scoped break token | **MODIFY → plain array body + module-level `endLoop` sentinel** | The callback discharges LOOP-002 by construction but costs a closure, nesting, and a handle the author must thread. Lens B takes the array body (`run: [...]`, identical shape to every other Seq) and downgrades LOOP-002 to a trivial compile containment walk (ERROR if `endLoop` appears outside a loop body). The iteration variable is declared as `each: 'current_domain'` (a snake_case symbol) and referenced through the unchanged scope chain — no typed handle, no new concept. |
| (d) Typed variable handles + expression builders | **MODIFY: ADOPT expression builders, REFUTE mandatory typed handles** | `eq/ne/gt/lt/gte/lte/exists/notExists/and/or/not` replace string boolean algebra entirely (string grammar survives only in the TOON reader) — SCOPE-002's parse half discharges. Typed variable handles are rejected: they force a generic workflow context to thread through every activity (often a separate file), which is exactly the ceremony Lens B forbids. Variable references are plain strings; resolvability is a compile pass (SCOPE-002 name half, PROV-001) with the full scope chain implemented in the compiler. |
| (e) Typed activity-output handles for cross-activity refs | **MODIFY: qualified strings stay canonical; optional shape-typed helper** | The qualified `NN.step-id.symbol` string is what technique defs, trace events, and the corpus already use (PROV-002); the LLM knows it. Typed handles would require the producer activity's value in scope of the consumer module and would couple authoring order to workflow ordinal assignment. Surface: `inputs: ['raw_responses', '01.create-issue.issue_number']`. tsc assist: the optional `outputOf(1, 'create-issue', 'issue_number')` helper returns the template-literal type `` `${number}.${string}.${string}` `` so literals get shape checking; resolution (the ordinal names a preceding activity that contains that step and output) is compile (PROV-002/ID-003). |
| (f) Explicit stable ids on every node | **ADOPT** | Mandatory first positional argument on `step/ask/match/ifElse/forEach/checkpoint/dispatch/artifact`. Ids survive verbatim into IR `NodeId`s, step manifests, and trace events (R-PAR-3). Anonymous-by-design nodes (`msg`, transitions, `end`, tokens) get deterministic path-derived ids at canonicalization (§5.3) because legacy gives them no identity either. |
| (g) Workflow and Activity retained as primitives | **ADOPT** | Activity stays the unit of L2 dispatch, checkpoint scope, artifact prefixing (`NN-` from ordinal), the transition graph, and qualified-ref addressing. `activity()` returns a value mounted in `workflow({ activities: [...] })`; array position assigns the ordinal (overridable with `{ ordinal, activity }` for corpus parity). |

### 1.2 Own moves (beyond the list)

| Move | Verdict | Reasoning |
|---|---|---|
| (h) Single `run:` array replaces `flows:` + `main` | **ADOPT** (corollary of (a)) | Factoring a long body uses host `const part = [...]` + spread `...part`. FLOW-001 becomes a required property (tsc). Orphan factored arrays are caught by `noUnusedLocals` (FLOW-002's moral equivalent). |
| (i) Declarative literal style, not imperative registration callbacks | **ADOPT** | The §5.1 example's `(wf) => { wf.activity(...) }` side-effecting registration is order-sensitive hidden state and diffs badly. Here constructors are **pure functions returning tagged frozen values**; the default export is the built definition. This still satisfies locked decision 1 ("builder calls construct the definition") — the calls run once at compile time in the sandbox. |
| (j) `bind:` subsumes `technique_args` | **ADOPT** | One explicit-wiring concept: `bind: { input_id: v('scope_symbol') | literal }`. Literal values lower to the `technique_args` IR slot; `v()` refs lower to `Invoke.bindings`. Unbound required inputs resolve implicitly by name through the scope chain (legacy semantics, PROV-001 compile pass). Aligns with the canonical-rename-over-args memory note while keeping the legacy capability expressible. |
| (k) Per-workflow generated contracts module exports **pre-bound constructors** | **ADOPT** | `contracts.gen.ts` (generated from markdown techniques) exports `const { workflow, activity, step, ... } = makeDsl<ThisWorkflowRegistry>()`. The artifact has exactly one import line and zero visible generics, yet every `technique:` literal and every `bind:` key is tsc-checked against the executing workflow's composed, own-then-meta-resolved namespace. Composition strategy = pre-composed per (workflow × technique) (inventory-technique-contracts §8 option (a)) — correct because the registry is per-workflow anyway; the runtime-mirroring generic form (option b) is the ceremony Lens B rejects. |
| (l) `skill:` → `technique:` at the surface | **ADOPT (logged against OQ-4)** | The legacy field name is grammar debt (inventory-legacy §12). Parity is parity of IR and semantics (R-PAR-2), not of field spelling; the TOON reader maps `skill:` → the same IR slot. |
| (m) `while`/`doWhile` loop kinds NOT surfaced | **REFUTE surfacing** | Orchestra defines only `forEach` (EBNF:77); while-like behavior is decision self-reference (SPEC:231). `activity.schema.json` carries while/doWhile but the Phase-1 IR table lists only `Iterate{forEach}` (R-IR-2). The TOON reader passes legacy while/doWhile through to IR directly if encountered in the corpus; the authoring surface stays forEach + `retry`. |

### 1.3 Every legacy primitive → disposition

| Legacy construct | Disposition | New form |
|---|---|---|
| Activity header (`id/version/description`) | keep | `activity(id, { version, describe })` |
| `inputs:` (bare + qualified) | keep | `inputs: [SymbolId \| QualifiedRef]` |
| `steps:` section | dissolve section | `step()` nodes inline by value |
| `skill:` field | replace name | `technique:` (TOON reader maps) |
| Trivial step (description only) | keep | `step(id, { describe })` overload |
| `decisions:` section | dissolve + split | `ask()` / `match()` / `ifElse()` |
| Interactive branchless ack-gate | keep | `ask(id, message)` (no branches arg) |
| Self-referencing retry | keep | `retry(decisionId)` token |
| `default:` branch | replace | `otherwise:` option on `match` |
| `condition:` string algebra | replace | expression builders (Expr) |
| `loops:` section / `forEach` | dissolve section | `forEach(id, { each, over, max, run })` inline |
| `maxIterations` | keep | `max:` (default 100 per activity.schema) |
| `flows:` + `main` | replace | `run:` array; host consts for factoring |
| `- flow: X` | dissolve | array spread / const reuse |
| `- flow: continue` | dissolve | empty branch `[]` / omitted |
| `- message:` | keep | `msg(text)` (`{symbol}` interpolation made official, compile-checked) |
| `- activity:` | keep | `goTo(activityId)` layered terminal |
| `- break` | keep | `endLoop` sentinel |
| `- loop:` (re-entry) | keep | `rerun(loopId)` |
| Explicit completion | new (R-IR-2 `Terminate`) | `end()` |
| 4-level scope chain | keep verbatim | runtime mechanism + compile resolver |
| Qualified `NN.step.name` | keep | canonical string; `outputOf()` shape helper |
| Workflow `variables` | keep | `vars:` (scalar shorthand or `VarSpec`) |
| Workflow `modes` | keep | `modes:` literal array |
| `executionModel` | keep, **made required** | `executionModel: { roles: [...] }` (resolves schema drift, R-GOV-2; TOON reader synthesizes a default single-`agent` role with WARN for the live corpus) |
| `artifactLocations` | keep | record; `{variable}` path interpolation compile-checked |
| `initialActivity` | keep | optional iff all activities have `recognition` (WF-001) |
| Workflow/activity `techniques.primary/supporting` | keep | typed against registry keys |
| `recognition` / independent activities | keep | `recognition: string[]` on activity |
| `triggers` (WorkflowTrigger) | keep | `dispatch()` node, usable inline and in `triggers:` |
| `transitions[]` | keep | `next: [on(expr, id), ..., otherwise(id)]` ordered first-match |
| activity.schema `decisions[]` (automated routing w/ transitionTo) | dissolve | `match`/`ifElse` with `goTo` branches, or `next:`; TOON reader maps |
| `checkpoints[]` + `step.checkpoint` | keep, inline-first | `checkpoint()` node placed inline in `run`; reader lowers `step.checkpoint` to a preceding inline node |
| Checkpoint options/effects/blocking/defaultOption/autoAdvanceMs/condition | keep, full | `checkpoint(id, message, { options, blocking, defaultOption, autoAdvanceMs, when })` |
| `entryActions`/`exitActions`/`step.actions` | keep (minimal) | `entry:`/`exit:` plain `ActionItem` object literals |
| `artifacts[]` | keep | `artifact(id, nameTemplate, { location, action })`; `{token}` compile-checked |
| `artifactPrefix` | keep excluded | server-computed from ordinal; never authored (IR carries the ordinal) |
| `when` string vs structured `condition` dual | unify | one `Expr` surface, both legacy forms read into it |
| `technique_args` | subsume | `bind:` with literal values |
| Resource refs (slug / wf/slug / #section; mode `resource` path) | keep, unify | `ResourceRef` string, one grammar for all three sites |
| `outcome`, `context_to_preserve`, `required`, `estimatedTime`, `problem`, activity `rules` | keep | optional literal fields |
| while/doWhile | not surfaced | reader-only passthrough (move m) |
| Phase-2 `RequireApproval`/`CapabilityGate`/`Delegate` | reserve | `approve()`/`gate()`/`delegate()` typed, compile-rejected GOV-000 |

---

## 2. Authoring surface — normative `.d.ts` sketch (L1)

```ts
// ============================================================================
// @wp/dsl — core declarations (L1 normative authoring surface, Lens B)
// All constructors are PURE: they return frozen tagged values; the artifact's
// default export is the built definition. Executed once in the compile sandbox.
// ============================================================================

// ---------- identifier & reference strings ----------------------------------
/** kebab-case node/activity/workflow/option id — ID-001 regex at compile; verbatim IR NodeId. */
type KebabId = string;
/** snake_case runtime symbol (AP-60); binds by exact string match (R-BIND). */
type SymbolId = string;
/** SymbolId with optional dotted member path: 'validation_results.validation_passed'. */
type VarPath = string;
/** Cross-activity qualified ref 'NN.step-id.symbol' (PROV-002). tsc checks SHAPE on literals
 *  built via outputOf(); resolution is a compile pass. */
type QualifiedRef = `${number}.${string}.${string}`;
declare function outputOf(activityOrdinal: number, stepId: KebabId, symbol: SymbolId): QualifiedRef;
/** Resource ref: 'slug' | '<workflow>/slug' | '<workflow>/slug#section' (R-RT-7). */
type ResourceRef = string;
type ActivityId = KebabId; type WorkflowId = KebabId; type RoleId = KebabId;
type SemVer = `${number}.${number}.${number}`;

// ---------- values & condition expressions ----------------------------------
type Lit = string | number | boolean | null;
interface VarRef { readonly kind: 'var'; readonly path: VarPath }
/** Explicit variable reference — needed ONLY in value positions (bind values,
 *  checkpoint setVariable) where a bare string would read as a literal. */
declare function v(path: VarPath | QualifiedRef): VarRef;
type ValueRef = Lit | VarRef;

/** Opaque condition node; lowers to IR BoolExpr / Guard (R-IR-5). */
interface Expr { readonly kind: 'expr' }
declare function eq(path: VarPath | QualifiedRef, value: Lit): Expr;
declare function ne(path: VarPath | QualifiedRef, value: Lit): Expr;
declare function gt(path: VarPath, value: number): Expr;  // ordering ops: EXPR-101 in --parity
declare function lt(path: VarPath, value: number): Expr;  // profile when used inside ask/match/
declare function gte(path: VarPath, value: number): Expr; // ifElse (no TOON equivalent there);
declare function lte(path: VarPath, value: number): Expr; // always fine in next:/when:/checkpoints.
declare function exists(path: VarPath): Expr;
declare function notExists(path: VarPath): Expr;
declare function and(...exprs: Expr[]): Expr;  // arity >= 2 checked at compile
declare function or(...exprs: Expr[]): Expr;
declare function not(expr: Expr): Expr;

// ---------- run items: ONE flat union, everything composes by value ---------
type Item =
  | StepNode | AskNode | MatchNode | IfElseNode | ForEachNode
  | CheckpointNode | DispatchNode | MessageNode
  | GoToNode | EndNode | EndLoopToken | RetryNode | RerunNode
  | GovernanceNode; // Phase-2 reserved — compile rejects (GOV-000)
type Seq = readonly Item[];

// ---------- leaf / control constructors --------------------------------------
/** Inline user-facing message. '{symbol}' interpolation resolved via scope chain (INT-001). */
declare function msg(text: string): MessageNode;
/** Layered terminal (TERM-001): exits loop + flow + activity, transitions to target. */
declare function goTo(target: ActivityId): GoToNode;
/** Explicit completion — IR Terminate (R-IR-2). Omitted next:-with-no-match is also terminal. */
declare function end(): EndNode;
/** Legacy `- break`: exits the INNERMOST enclosing loop only (LOOP-003); compile ERROR
 *  if it appears outside a loop body (LOOP-002). */
declare const endLoop: EndLoopToken;
/** Decision self-reference retry (legacy `- decision: <self>`): re-evaluates the named
 *  ENCLOSING decision. RET-001: target must enclose every occurrence site. DEC-002: the
 *  target decision must keep >=1 branch with no transitive retry. */
declare function retry(decision: KebabId): RetryNode;
/** Legacy `- loop: <id>` re-entry/restart, by id (value reference would be cyclic). REF-001. */
declare function rerun(loop: KebabId | ForEachNode): RerunNode;

// ---------- decisions (split by constructor — DEC-003/004 by construction) ---
/** Interactive decision. Presents message, offers branch keys as user choices, blocks.
 *  No `branches` argument = branchless acknowledgment gate (SPEC:116).
 *  Empty Seq = pass-through; branches rejoin unless terminal (TERM-002 semantics). */
declare function ask(id: KebabId, message: string, branches?: Readonly<Record<KebabId, Seq>>): AskNode;

/** Programmatic multi-way match on a variable (legacy `variable:` form).
 *  Case keys are literal match values — no reserved words ('default' is matchable).
 *  Missing `otherwise` => DEC-001 WARN; unmatched value passes through at runtime. */
declare function match(
  id: KebabId,
  variable: VarPath | QualifiedRef,
  cases: Readonly<Record<string, Seq>>,
  opts?: { otherwise?: Seq },
): MatchNode;

/** Programmatic boolean decision (legacy `condition:` form). `otherwise` optional
 *  (true-only form per grammar/activity.ebnf:65). */
declare function ifElse(id: KebabId, condition: Expr, then: Seq, otherwise?: Seq): IfElseNode;

// ---------- loop --------------------------------------------------------------
/** forEach over a collection in scope. `each` introduces the iteration symbol
 *  (scope level 2). Body is a plain Seq — endLoop is the break. */
declare function forEach(id: KebabId, opts: {
  each: SymbolId;
  over: VarPath | QualifiedRef;
  max?: number;          // maxIterations, default 100
  run: Seq;
}): ForEachNode;

// ---------- checkpoint (full legacy shape; R-RT-4) ----------------------------
interface CheckpointOptionDef {
  id: KebabId;
  label: string;
  describe?: string;
  effect?: {
    setVariable?: Readonly<Record<SymbolId, Lit | readonly Lit[] | Readonly<Record<string, unknown>>>>;
    transitionTo?: ActivityId;
    skipActivities?: readonly ActivityId[];
  };
}
declare function checkpoint(id: KebabId, message: string, opts: {
  options: readonly [CheckpointOptionDef, ...CheckpointOptionDef[]];
  blocking?: boolean;        // default true
  defaultOption?: KebabId;   // CKPT-001: must name an option; meaningful only with blocking:false
  autoAdvanceMs?: number;    // CKPT-002: requires blocking:false AND defaultOption
  when?: Expr;               // presentation gate; presence enables condition_not_met (CKPT-004)
  required?: boolean;        // default true
}): CheckpointNode;
// approve() layers on this node shape in Phase 2 (R-IR-4) — no reshaping needed.

// ---------- dispatch (sub-workflow; R-IR-3 / R-RT-5) ---------------------------
declare function dispatch(id: KebabId, opts: {
  workflow: WorkflowId;
  passContext?: readonly SymbolId[];
  describe?: string;
}): DispatchNode;
// delegate() layers on this node shape in Phase 2.

// ---------- artifacts -----------------------------------------------------------
/** name supports '{symbol}' interpolation (INT-001). Bare filename receives the
 *  server-computed 'NN-' activity prefix at write time — the prefix is NOT authorable. */
declare function artifact(id: KebabId, name: string, opts?: {
  location?: KebabId | string;   // key into workflow artifactLocations, or explicit path
  action?: 'create' | 'update';  // default 'create'
  describe?: string;
}): ArtifactDef;

// ---------- transitions (activity-level; ordered, first-match — R-RT-2) --------
interface TransitionDef { readonly kind: 'transition' }
declare function on(condition: Expr, target: ActivityId): TransitionDef;
declare function otherwise(target: ActivityId): TransitionDef; // isDefault; must be last & unique (TRN-002)

// ---------- entry/exit/step actions (closed object shapes — no constructors) ----
type ActionItem =
  | { do: 'set';      target: SymbolId; value?: ValueRef; describe?: string; when?: Expr }
  | { do: 'log';      message: string; when?: Expr }
  | { do: 'message';  message: string; when?: Expr }
  | { do: 'validate'; target: Expr; message: string; when?: Expr }
  | { do: 'emit';     target: string; value?: unknown; when?: Expr };

// ---------- activity -------------------------------------------------------------
interface ActivityOpts<Addr extends string = string> {
  version: SemVer;
  describe: string;
  problem?: string;
  inputs?: readonly (SymbolId | QualifiedRef)[];   // PROV-001/002 over these at compile
  recognition?: readonly string[];                  // independent-entry intent patterns
  techniques?: { primary?: Addr; supporting?: readonly Addr[] };
  run: Seq;                                         // THE body (legacy main flow) — required
  next?: readonly TransitionDef[];                  // ordered; no match => terminal activity
  artifacts?: readonly ArtifactDef[];
  triggers?: readonly DispatchNode[];               // activity-level WorkflowTrigger parity
  entry?: readonly ActionItem[];
  exit?: readonly ActionItem[];
  outcome?: readonly string[];
  contextToPreserve?: readonly string[];
  required?: boolean;                               // default true
  estimatedTime?: string;                           // legacy pattern-checked at compile
  rules?: readonly string[];
}
interface ActivityDef { readonly kind: 'activity'; readonly id: ActivityId }

// ---------- workflow ----------------------------------------------------------------
interface VarSpec {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  describe?: string;
  default?: unknown;
  required?: boolean;
}
/** Scalar shorthand infers {type, default}: vars: { mode: 'implement' } */
type VarInit = string | number | boolean | VarSpec;
interface ModeDef {
  id: KebabId; name: string; describe?: string;
  activationVariable: SymbolId;
  recognition?: readonly string[];
  skipActivities?: readonly ActivityId[];
  defaults?: Readonly<Record<SymbolId, unknown>>;
  resource?: ResourceRef;
}
interface WorkflowOpts<Addr extends string = string> {
  version: SemVer; title: string;
  describe?: string; author?: string; tags?: readonly string[];
  rules?: readonly string[];
  /** First-class and REQUIRED (resolves workflow.schema drift; R-GOV-2 policy keying). */
  executionModel: { roles: readonly [{ id: RoleId; describe: string }, ...{ id: RoleId; describe: string }[]] };
  vars?: Readonly<Record<SymbolId, VarInit>>;
  modes?: readonly ModeDef[];
  artifactLocations?: Readonly<Record<KebabId, string | { path: string; describe?: string; gitignored?: boolean }>>;
  techniques?: { primary?: Addr; supporting?: readonly Addr[] };
  initialActivity?: ActivityId;     // WF-001: required unless every activity has recognition
  /** Array order assigns ordinal NN (artifact prefix, qualified refs). Override for corpus parity. */
  activities: readonly (ActivityDef | { ordinal: number; activity: ActivityDef })[];
}
interface WorkflowDef { readonly kind: 'workflow'; readonly id: WorkflowId }

// ============================================================================
// GENERATED technique contracts + the per-workflow bound DSL (move k)
// ============================================================================
interface ContractInput  { required: boolean; hasDefault: boolean; components?: readonly SymbolId[] }
interface ContractArtifact { name: string; action: 'create' | 'update'; tokens: readonly SymbolId[] }
interface ContractOutput { artifact?: ContractArtifact }
interface TechniqueContract {
  address: string;                                   // canonical '::' literal
  shape: 'standalone' | 'container' | 'nested' | 'workflow-root';
  version: string;
  inputs: Readonly<Record<SymbolId, ContractInput>>;  // verbatim snake_case keys; same id may
  outputs: Readonly<Record<SymbolId, ContractOutput>>;// appear in both maps (idempotent resolver)
  rules: readonly string[];                           // kebab rule-name literals ('.'-citation set)
}
/** Keys = every '::' address resolvable FROM this workflow (own-then-meta pre-resolved,
 *  slashes normalized, container/workflow-root composition pre-applied local-wins,
 *  group-* expansions materialized). Workflow-root contract excluded as a key (not
 *  invocable) but already unioned into every entry. */
type Registry = Readonly<Record<string, TechniqueContract>>;

interface Dsl<R extends Registry> {
  // trivial step (legacy description-only step)
  step(id: KebabId, opts: { describe: string; when?: Expr }): StepNode;
  // technique-backed step — T inferred from the `technique` property literal.
  // tsc end-to-end check: `technique` must index R (unresolved address unrepresentable,
  // replacing the runtime `unresolved` bundle bucket); `bind` keys must be inputs of
  // that contract (excess-property error = BIND-001). Required-input COVERAGE is not
  // tsc (implicit name resolution may satisfy it) — that is compile pass PROV-001.
  step<T extends keyof R & string>(id: KebabId, opts: {
    technique: T;
    describe?: string;
    bind?: { readonly [K in keyof R[T]['inputs'] & string]?: ValueRef };
    when?: Expr;
  }): StepNode;

  workflow(id: WorkflowId, opts: WorkflowOpts<keyof R & string>): WorkflowDef;
  activity(id: ActivityId, opts: ActivityOpts<keyof R & string>): ActivityDef;

  // re-exports bound to R where relevant; identical to module-level declarations otherwise
  ask: typeof ask; match: typeof match; ifElse: typeof ifElse; forEach: typeof forEach;
  checkpoint: typeof checkpoint; dispatch: typeof dispatch; artifact: typeof artifact;
  msg: typeof msg; goTo: typeof goTo; end: typeof end; endLoop: EndLoopToken;
  retry: typeof retry; rerun: typeof rerun; on: typeof on; otherwise: typeof otherwise;
  v: typeof v; outputOf: typeof outputOf;
  eq: typeof eq; ne: typeof ne; gt: typeof gt; lt: typeof lt; gte: typeof gte; lte: typeof lte;
  exists: typeof exists; notExists: typeof notExists; and: typeof and; or: typeof or; not: typeof not;
}
declare function makeDsl<R extends Registry>(): Dsl<R>;

// ============================================================================
// RESERVED — Phase 2+ governance constructs (design spec §6.2/§13; R-IR-4).
// Declared NOW so the union and node shapes never reshape; the Phase-1 compiler
// rejects any occurrence with GOV-000 (ERROR). Role refs key into
// workflow.executionModel.roles (compile-checked when activated).
// ============================================================================
interface GovernanceNode { readonly kind: 'governance' }
/** Layers on Checkpoint: human approval gate bound to a role. */
declare function approve(id: KebabId, opts: {
  role: RoleId; message: string;
  options?: readonly CheckpointOptionDef[];
  onDeny?: 'fail_node' | 'fail_workflow' | 'escalate';
}): GovernanceNode;
/** CapabilityGate over the following Seq scope. */
declare function gate(id: KebabId, opts: {
  capabilityScope: readonly string[];
  onViolation?: 'deny' | 'fail_node' | 'fail_workflow' | 'escalate' | 'nudge';
  run: Seq;
}): GovernanceNode;
/** Layers on Dispatch: governed delegation with role + (Phase-2) task-packet overlay. */
declare function delegate(id: KebabId, opts: {
  workflow: WorkflowId; role: RoleId; passContext?: readonly SymbolId[];
}): GovernanceNode;
```

### 2.1 Example generated module (shape, abbreviated)

```ts
// workflows/work-package/contracts.gen.ts — GENERATED from markdown techniques. Do not edit.
import { makeDsl, type Registry } from '@wp/dsl';

export interface WorkPackageRegistry extends Registry {
  'domain-question': {
    address: 'domain-question'; shape: 'standalone'; version: '1.2.0';
    inputs: {
      current_domain:  { required: true;  hasDefault: false };
      elicitation_log: { required: false; hasDefault: false };
      // + workflow-root shared entries unioned in (planning_folder_path, ...), local wins
      planning_folder_path: { required: true; hasDefault: false };
    };
    outputs: { question_text: {}; user_response: {} };
    rules: readonly [];
  };
  'jira-comment': {
    address: 'jira-comment'; shape: 'standalone'; version: '1.0.0';
    inputs: { categorized_assumptions: { required: true; hasDefault: false };
              issue_number: { required: true; hasDefault: false } }; // declared '01.create-issue.issue_number' in markdown
    outputs: { posted_comment_url: {} };
    rules: readonly ['comment-approval-before-post'];
  };
  'gitnexus-operations::impact': { shape: 'nested'; /* container chain composed */ };
  // ... every address resolvable from work-package (own first, then meta)
}

/** sha256 over the source markdown set; compile re-derives and errors CTR-001 on mismatch. */
export declare const CONTRACT_DIGEST: 'sha256-1f3a...';

export const {
  workflow, activity, step, ask, match, ifElse, forEach, checkpoint, dispatch, artifact,
  msg, goTo, end, endLoop, retry, rerun, on, otherwise, v, outputOf,
  eq, ne, gt, lt, gte, lte, exists, notExists, and, or, not,
} = makeDsl<WorkPackageRegistry>();
```

How step bindings type-check end-to-end: the author writes `technique: 'domain-question'`; tsc
infers `T = 'domain-question'`, indexes the registry, and constrains `bind` keys to
`'current_domain' | 'elicitation_log' | 'planning_folder_path' | ...`. A typo in the address fails
to index `keyof R`; a typo in a bind key fails excess-property checking. Optionality/defaults and
required-coverage, name resolution, and artifact tokens are compile passes that re-derive contracts
from the markdown ground truth (never trusting the .gen module — the digest guard keeps the two in
lockstep, extending the existing binding-fidelity drift guard, commit ed514218).

---

## 3. Complete port: `requirements-elicitation` (orchestra-specification.md §3.4, L690–836)

```ts
// workflows/work-package/activities/02-requirements-elicitation.ts
import {
  activity, step, ask, match, ifElse, forEach,
  msg, goTo, endLoop, retry, rerun,
  eq, ne, and,
} from '../contracts.gen';

// --- nodes referenced from more than one site (legacy declare-once/reference) ---

const stakeholderDiscussion = step('stakeholder-discussion', {
  describe: 'Prompt user to initiate discussion with key stakeholders.',
}); // trivial step — no technique binding

const postAssumptionsToJira = step('post-assumptions-to-jira', {
  describe: 'Prepare assumptions as Jira comment, get approval, post to ticket.',
  technique: 'jira-comment',
  // contract inputs: categorized_assumptions <- local flow;
  // issue_number <- qualified '01.create-issue.issue_number' in the technique definition (PROV-002)
});

const jiraCommentReview = ask('jira-comment-review', 'Review the Jira comment before posting.', {
  'post-comment': [],                                   // empty = pass-through
  'edit-comment': [postAssumptionsToJira, retry('jira-comment-review')], // self-ref retry (DEC-002: exits exist)
  'skip-posting': [],
});

const stakeholderTranscript = ask('stakeholder-transcript',
  'Provide the stakeholder transcript or summary here.', {
  'provide-transcript': [stakeholderDiscussion],
  'skip-discussion': [],                                // empty = pass-through
});

// --- activity --------------------------------------------------------------------

export default activity('requirements-elicitation', {
  version: '3.0.0',
  describe: 'Discover and clarify what the work package should accomplish through structured sequential conversation.',
  inputs: ['raw_responses', '01.create-issue.issue_number', '01.check-issue.issue_platform'],

  run: [
    msg('Starting requirements elicitation'),

    // mode branching — workflow-level variable (legacy mode-elicitation-path)
    match('mode-elicitation-path', 'mode', {
      implement: [stakeholderDiscussion],
      review: [goTo('implementation-analysis')],        // layered terminal (TERM-001)
    }),                                                  // no otherwise -> DEC-001 WARN, pass-through

    stakeholderTranscript,

    forEach('domain-iteration', {
      each: 'current_domain',
      over: 'question_domains',
      max: 5,
      run: [                                             // legacy flow: domain-body, now inline
        step('ask-question', {
          describe: 'Present ONE question from current domain. Wait for response.',
          technique: 'domain-question',
          // inputs current_domain, elicitation_log resolve from loop var + scope (PROV-001);
          // outputs question_text, user_response injected into scope
        }),

        ask('user-intent', 'How would you like to proceed?', {
          answered: [
            step('record-response', {
              describe: 'Capture answer or mark as skipped. Adapt follow-up.',
              technique: 'response-capture',
              // output elicitation_log accumulates across iterations
            }),
          ],                                             // rejoins after the decision
          'skip-question': [],
          'skip-domain': [endLoop],                      // exits innermost loop (LOOP-002/003)
          done: [endLoop],
        }),

        ask('domain-complete', "Domain '{current_domain}' complete.", {
          'next-domain': [],
          revisit: [rerun('domain-iteration')],          // legacy `- loop: domain-iteration`
          'finish-early': [endLoop],
        }),
      ],
    }),

    step('collect-assumptions', {
      describe: 'Identify assumptions made when interpreting user responses.',
      technique: 'assumptions-review',
      // input raw_responses resolves from activity inputs
    }),

    // route by platform — match on a QUALIFIED cross-activity variable
    match('platform-routing', '01.check-issue.issue_platform', {
      jira:   [postAssumptionsToJira, jiraCommentReview],
      github: [
        step('post-assumptions-to-github', {
          describe: 'Post assumptions as GitHub issue comment.',
          technique: 'github-comment',
        }),
      ],
    }),                                                  // no otherwise -> DEC-001 WARN (faithful)

    step('create-document', {
      describe: 'Create requirements document using elicitation output template.',
      technique: 'artifact-management',
    }),

    step('update-assumptions-log', {
      describe: 'Add requirements-phase assumptions to the assumptions log.',
      technique: 'assumptions-log-update',
    }),

    // boolean-condition decision (legacy requirements-confirmed)
    ifElse('requirements-confirmed',
      and(eq('elicitation_complete', true), ne('requirements_document', null)),
      [goTo('research')],                                // TERM-001
      [stakeholderTranscript],                           // retry path: re-runs the transcript decision
    ),

    msg('Requirements elicitation complete'),
  ],
});
```

Port notes (fidelity audit against §3.4):
- Every legacy primitive is present: 8 steps, 7 decisions (1 variable-mode, 3 interactive incl.
  self-ref retry and 2 with break branches, 1 variable-platform, 1 condition), 1 forEach loop with
  max 5, 2 messages, 2 activity terminals, 3 empty pass-through branches, both flows (main → `run`,
  domain-body → the loop's inline `run`).
- Legacy kebab variable spellings (`current-domain`, `question-domains`, `elicitation-complete`,
  `requirements-document`, `raw-responses`) are ported to snake_case symbols per the locked symbol
  model; the TOON compatibility reader keeps legacy spellings verbatim (parity profile) — only
  newly-authored artifacts enforce AP-60 (ID-001).
- `{current_domain}` message interpolation is now an official, compile-checked feature (INT-001) —
  legacy had it by example only (SPEC:792, undocumented in the grammar).
- Reuse sites: `stakeholderDiscussion` (2 sites), `postAssumptionsToJira` (2 sites),
  `jiraCommentReview` (referenced by platform-routing + self-retry), `stakeholderTranscript`
  (main + requirements-confirmed false branch) — identity-aware SYM checking treats each as one
  declaration with multiple reference occurrences, exactly the legacy reference graph.

---

## 4. Constraint disposition table

Dispositions: **DBC** = discharged by construction (unrepresentable), **TSC** = checked by tsc,
**COMPILE** = semantic pass in the sandbox/compiler (severity preserved), **IR** = checked over
canonical IR (L3 Alloy mirror), **N/A** = informational/dissolved.

| Legacy rule | Sev | Disposition | How |
|---|---|---|---|
| PROV-001 | ERROR | COMPILE (+partial TSC) | Compile resolves every required, defaultless contract input through the 4-level scope chain at each step's site (contracts re-derived from markdown). TSC half: explicit `bind` keys must be contract inputs. |
| PROV-002 | ERROR | COMPILE (+TSC shape via `outputOf`) | Dot-containing input strings must parse `NN.step.symbol`, NN names a preceding activity, step+output exist there. `outputOf()` literals get tsc shape checking. |
| SYM-001 | ERROR | COMPILE | Identity-aware: same object value at 2+ sites = one declaration (legal reference); two distinct `step()` calls sharing an id = ERROR. |
| SYM-002 | ERROR | COMPILE | Same, over ask/match/ifElse. |
| SYM-003 | ERROR | COMPILE | Same, over forEach. |
| SYM-004 | ERROR | **DBC/N-A** | Named flows do not exist. |
| FLOW-001 | ERROR | **DBC (TSC)** | `run:` is a required property of `ActivityOpts`. |
| FLOW-002 | WARN | **DBC** | Factoring uses host consts; orphan const arrays are tsc `noUnusedLocals`. |
| FLOW-003 | ERROR | **DBC** + COMPILE residue | Value refs cannot dangle. Residual string targets — `retry(id)`, `rerun(id)`, `goTo(id)`, transition targets — are REF-001/TRN-001 compile checks. |
| LOOP-001 | ERROR | **DBC** | Loop body is an inline array value. |
| LOOP-002 | ERROR | COMPILE | `endLoop` containment walk (chose array body over scoped-token callback — Lens B trade, §1.1(c)). |
| LOOP-003 | INFO | N/A (semantics) | Innermost binding computed structurally at lowering; documented. |
| DEC-001 | WARN | COMPILE | `match` without `otherwise`; runtime pass-through preserved. |
| DEC-002 | ERROR | COMPILE | Transitive: target decision must have >=1 branch from which no `retry(target)` is reachable. |
| DEC-003 | ERROR | **DBC** | `ask()` has no variable/condition parameters. |
| DEC-004 | ERROR | **DBC** | `match`/`ifElse` are distinct constructors; exactly-one-of holds by construction. |
| TERM-001 | INFO | N/A (semantics) | `goTo` lowers to `GotoActivity`, layered-terminal semantics in lowering. |
| TERM-002 | ERROR | **DBC** + new WARN | Rejoin is the array-sequencing semantics; nothing expressible violates it. New TERM-101 WARN: unreachable items after a terminal within a Seq. |
| SCOPE-001 | INFO | N/A (semantics) | Resolve order implemented identically in compile resolver and runtime. |
| SCOPE-002 | ERROR | split: structure **DBC**, names COMPILE | Expression builders eliminate string parsing; every `VarPath` operand resolved through the scope chain at compile. |

### New rule families this surface needs

| Family | Rules (severity) |
|---|---|
| **BIND** binding conformance | BIND-001 bind key not a contract input (TSC ERROR); BIND-002 bind VarRef unresolvable (COMPILE ERROR); BIND-003 explicit bind shadows an implicit same-name resolution to a different producer (COMPILE WARN). |
| **CTR** contract fidelity | CTR-001 contract digest drift vs markdown (COMPILE ERROR — regenerate); CTR-002 technique address not in registry (TSC ERROR + compile re-verify; makes the bundle `unresolved` bucket unrepresentable); CTR-003 artifact `{token}` not in scope at the producing step (COMPILE ERROR). |
| **ID** stable-id discipline | ID-001 id grammar (kebab node ids, snake symbols; parity profile relaxes for transpiled corpus) (COMPILE ERROR); ID-002 cross-kind id collision within an activity (COMPILE WARN — legacy namespaces were per-kind); ID-003 qualified-ref ordinal does not name the producing activity after reorder (COMPILE ERROR); ID-004 explicit `ordinal:` duplicates (COMPILE ERROR). |
| **RET/REF** reference tokens | RET-001 `retry` target must enclose every occurrence site (COMPILE ERROR); REF-001 `rerun`/`goTo`/transition target must exist (COMPILE ERROR). |
| **CKPT** checkpoint gating | CKPT-001 defaultOption names an option (ERROR); CKPT-002 autoAdvanceMs requires blocking:false ∧ defaultOption (ERROR); CKPT-003 effect transitionTo/skipActivities targets exist (ERROR); CKPT-004 documented: `condition_not_met` valid only when `when` present (runtime-enforced; IR/Alloy invariant). Nested-yield prohibition is runtime (no authoring shape can express it). |
| **TRN** transitions | TRN-001 targets exist (ERROR); TRN-002 `otherwise` unique and last (ERROR); TRN-003 transition after `otherwise` unreachable (WARN). |
| **INT** interpolation | INT-001 `{symbol}` tokens in msg/checkpoint messages/artifact names/location paths resolve via scope chain (workflow vars for locations) (ERROR). |
| **WF** workflow shape | WF-001 `initialActivity` required unless all activities carry `recognition` (ERROR); WF-002 mode `activationVariable`/`skipActivities`/`defaults` keys resolve (ERROR). |
| **EXPR** expression profile | EXPR-101 ordering comparators (`gt/lt/gte/lte`) inside ask/match/ifElse positions have no TOON equivalent — ERROR under `--parity` profile, allowed otherwise (P10). |
| **DET** sandbox determinism | DET-001 non-allowlisted import (ERROR); DET-002 ambient API touched (clock/random/IO stubs throw) (ERROR); DET-003 default export is not a WorkflowDef/ActivityDef (ERROR); DET-004 non-data value (function/promise/symbol/class instance) embedded in a node (ERROR — nothing executable survives into IR, R-P2/R-P3); DET-005 builder threw (ERROR, with sandbox stack). |
| **GOV** reserved constructs | GOV-000 `approve`/`gate`/`delegate` used in Phase 1 (ERROR, message names the activation phase). |

L3 (Alloy over IR) retains the semantic mirror of: DEC-002 transitive exit, LOOP-002/003 break
scoping, TERM-002 rejoin, scope-chain resolution (PROV/SCOPE), plus the checkpoint invariants
(autoAdvance ⇒ ¬blocking ∧ defaultOption; respond-mode exclusivity; no nested active checkpoints;
first-match transition ordering; maxIterations > 0) — verifying the compiler, not the author.

---

## 5. Compile-pipeline implications

**5.1 Sandbox (locked decision 1, operationalized).** The artifact module graph is bundled
deterministically (author file + `contracts.gen` + `@wp/dsl` + relative pure imports only — DET-001
allowlist), then executed exactly once in a frozen realm (SES/hardened-`vm`): `Date`, `Math.random`,
`process`, `fetch`, timers, and dynamic `import()` are replaced by throwing stubs (DET-002).
JS object-literal key order is spec-deterministic (insertion order), so `cases:`/`vars:` literals
are reproducible; constructors return frozen tagged plain-data values; the default export is
validated as pure data (DET-004) — no callbacks survive into IR (R-P2/P3). Identical source ⇒
byte-identical IR.

**5.2 Canonicalization (L2 target).** Built value → AST (with source spans) → IR per the R-IR-2/3
lowering table: `step`→`Invoke{technique_ref, bindings, outputs}`, `ask`→`AwaitInput`,
`match`/`ifElse`→`Branch{MatchVar|Condition}`, `forEach`→`Iterate`, `msg`→`EmitMessage`,
`goTo`→`GotoActivity`, `endLoop`→`LoopExit`, Seq→`Block` (activity `run` = entry), `end`→`Terminate`,
`checkpoint`→`Checkpoint`, `dispatch`→`Dispatch`, `artifact`→`EmitArtifact`. Every node wraps in
`NodeEnvelope{id, node, policy}` with inert Phase-1 `ExecutionPolicy` (R-IR-ENV). Serialization:
semantic arrays (run, branches' Seqs, options, transitions) preserve author order; non-semantic maps
key-sorted; UTF-8/NFC; content-hashed (signable, R-GOV-4). Source spans live in the AST sidecar
(R-PIPE-2's three stored representations), never in IR — reformatting the artifact cannot change
the IR hash.

**5.3 Stable-id strategy.** Authored ids pass verbatim into `NodeId`s, manifests, and trace events
(R-PAR-3). A node value reused at N sites lowers to one declaration + N reference occurrences
(mirroring legacy declare/reference, preserving trace-diff parity with the TOON corpus). Anonymous
nodes (`msg`, transitions, `end`, tokens) get path-derived ids
`<activity>/<enclosing-id-chain>/<kind>@<sibling-ordinal>` — stable under edits elsewhere, shifting
only on local reorder (legacy gives these no identity, so no parity loss). Activity ordinals come
from `activities[]` position (or explicit `ordinal:` for corpus-matching); compile breaks loudly
(ID-003) when a reorder dangles a qualified ref.

**5.4 Contract generation from markdown.** `wp-contracts gen <workflow>`: load techniques
(loader parity with `composeLoaded`), resolve own-then-meta, normalize slashes, apply
container/workflow-root keyed-union composition (local wins), materialize `group-*` expansions and
rule-name unions, derive structural optionality from the prose `*(optional)*` marker and
`#### default` presence, extract artifact `{token}` lists — emit `contracts.gen.ts` (registry types
+ pre-bound constructors + `CONTRACT_DIGEST`). The compiler never trusts the generated module for
semantics: it re-derives contracts from markdown for PROV/BIND/CTR passes; the digest (CTR-001)
guarantees tsc's view and the compiler's view cannot drift silently. Regeneration is part of the
technique-edit workflow (extends the existing binding-fidelity drift guard).

**5.5 Diagnostics model.** Three layers, one vocabulary: (1) tsc errors — the generated registry is
authored so failures point at the offending literal (bad address ⇒ "not assignable to keyof
WorkPackageRegistry"; bad bind key ⇒ excess-property naming the key); (2) sandbox DET errors with
in-realm stacks mapped through the bundle's source map; (3) semantic-pass diagnostics — rule-id'd
(legacy ids preserved: PROV/SYM/FLOW/LOOP/DEC/TERM/SCOPE; new families above), severity-graded
ERROR/WARN/INFO, source-spanned via the AST sidecar, emitted both human-readable and as machine
JSON (agents iterate on the JSON). `--parity` profile adds EXPR-101-class checks for
corpus-equivalence work; `workflow_compile` is exposable as a governed MCP tool later (R-GOV-4)
without changing the pipeline.

**5.6 TOON compatibility reader.** Lowers to the same AST: flows inline to Blocks preserving the
declare/reference graph; `skill:`→technique ref slot; `- flow: continue`→empty Seq; `default:`→
otherwise; string boolean algebra + structured `condition` + `when` strings→Expr; `step.checkpoint`
→ preceding inline Checkpoint node; activity.schema `decisions[]`→match/ifElse+goTo; legacy
while/doWhile→Iterate passthrough; missing `executionModel`→synthesized single-`agent` role (WARN);
legacy kebab variable ids kept verbatim (parity). Ids byte-identical ⇒ trace-diff parity (§12.4).

**5.7 Known risks / open items.**
- LOOP-002 and RET-001 are compile-time only (Lens B trade vs Lens-A-style scoped tokens) — the
  checks are cheap tree walks, but an editor without the compiler running shows no squiggle; the
  language-service plugin (future) can host them.
- Pre-composed per-workflow registries mean meta-technique edits require regenerating every
  consuming workflow's `contracts.gen.ts`; CTR-001 makes staleness loud, CI runs `gen --check`.
- Snake-vs-kebab symbol migration for transpiled corpus is profile-gated (ID-001 parity relaxation);
  the eventual corpus rename is a one-time mechanical pass outside this design.
- `Registry` value types are opaque (`ValueRef`); AP-60 shape-derived refinement (predicate→boolean,
  plural→array) is a flagged optional lint layer, not baked into the contract (inventory-technique-
  contracts §5).
