---
target: src/tools/ (index.ts, workflow-tools.ts, resource-tools.ts, state-tools.ts)
loc: 541
analysis_date: 2026-03-27
lens: L12 structural (meta-conservation law)
workflow: prism / structural-pass
---

# L12 Structural Analysis — `src/tools/`

## 1. Claim

**Falsifiable claim**: The tools layer conflates orchestration-protocol enforcement (session-token validation, workflow consistency, version drift) with domain logic (loading workflows, reading skills, persisting state), forcing every handler to independently compose a bespoke validation choreography. Any handler that gets the choreography wrong silently degrades the protocol guarantees the server advertises.

Falsification condition: if a centralized validation middleware existed, or if the validation composition were identical and mechanized (not manually assembled per handler), the claim would be false.

## 2. Dialectic

### Expert A — Defender

Agrees. Evidence:

| File | Lines | Validation set |
|---|---|---|
| `workflow-tools.ts` | 75–78 | consistency + version |
| `workflow-tools.ts` | 139–146 | consistency + transition + version + manifest + condition + activity-manifest |
| `workflow-tools.ts` | 190–194 | consistency + version |
| `workflow-tools.ts` | 211–214 | consistency + version |
| `resource-tools.ts` | 111–114 | consistency + version (but NOT skill association) |
| `resource-tools.ts` | 137–141 | consistency + version + skill association |
| `state-tools.ts` | 34, 76 | token decoded, `buildValidation()` with **zero** validators |
| `state-tools.ts` | 89, 107 | token decoded, `buildValidation()` with **zero** validators |

Every handler manually composes a different subset. `get_skills` validates consistency + version but omits skill-association validation; `get_skill` includes it. `save_state`/`restore_state` decode the token but validate nothing.

### Expert B — Attacker

Challenges the claim's centrality. The deeper issue is that the tools layer is the **sole integration seam** between the MCP SDK's raw `server.tool()` API and the workflow domain. Each handler independently performs the same skeleton:

1. Decode session token
2. Load workflow
3. Build validation
4. Execute domain logic
5. Advance token
6. Construct `_meta` with updated token + validation
7. Return `{ content, _meta }`

This skeleton is repeated 10 times but never abstracted. The validation-composition inconsistency is a symptom; the disease is a missing tool-registration abstraction.

### Expert C — Prober

Both experts assume validation is the core issue but neither examines what the tools layer's **file organization** conceals. `start_session` (a session-lifecycle tool) lives in `resource-tools.ts` alongside skill-access tools. The actual semantic grouping is:

| Category | Tools | Current file |
|---|---|---|
| Session lifecycle | `help`, `list_workflows`, `start_session`, `health_check` | Split across `workflow-tools.ts` and `resource-tools.ts` |
| Workflow navigation | `get_workflow`, `next_activity`, `get_activities`, `get_checkpoint` | `workflow-tools.ts` |
| Skill / resource access | `get_skills`, `get_skill` | `resource-tools.ts` |
| State persistence | `save_state`, `restore_state` | `state-tools.ts` |

Four categories, three files, no alignment. The file names ("workflow", "resource", "state") describe data domains, not protocol roles.

### Transformed claim

The tools layer's deepest structural problem is that it **lacks a taxonomy of its own tool categories**, causing cross-cutting concerns (session protocol, validation composition, token advancement, error handling) to be threaded through each handler independently, while the file organization actively conceals the actual semantic groupings.

### Diagnostic (gap between original and transformed claim)

What appeared to be a "validation composition" problem is actually a "missing classification" problem. The validation inconsistency is a predictable downstream effect of having no shared structure for tool categories with different validation requirements.

## 3. Concealment Mechanism

**Uniform handler signature**. Every tool handler has the same shape: receive params → decode token → load workflow → validate → do work → return content + `_meta`. This surface uniformity conceals that different tools have fundamentally different validation obligations. The `withAuditLog` wrapper reinforces the concealment by providing a single cross-cutting concern that makes all handlers _look_ like they share infrastructure, when they each independently compose different validation subsets.

## 4. Improvement 1 — Deepening the Concealment

Extract a `withWorkflowValidation` higher-order function:

```typescript
function withWorkflowValidation(
  handler: (
    params: Record<string, unknown>,
    token: DecodedToken,
    workflow: Workflow,
    validation: string[]
  ) => Promise<ToolResult>,
): ToolHandler {
  return async (params) => {
    const token = await decodeSessionToken(params.session_token);
    const result = await loadWorkflow(config.workflowDir, params.workflow_id);
    if (!result.success) throw result.error;
    const validation = buildValidation(
      validateWorkflowConsistency(token, params.workflow_id),
      validateWorkflowVersion(token, result.value),
    );
    return handler(params, token, result.value, validation);
  };
}
```

This passes code review — it DRYs up the common decode + load + base-validate pattern. But it deepens concealment because:

1. It canonizes the token + workflow pattern as THE pattern, making tools that don't use it (`save_state`, `restore_state`, `help`, `health_check`) look like exceptions rather than legitimate categories.
2. It creates a "validated by default" illusion: wrapped tools appear validated, but the _specific_ validation composition (transition? manifest? skill association?) remains ad-hoc inside the handler callback.
3. It conceals that `start_session` _creates_ tokens rather than _consuming_ them — a fundamentally different lifecycle role forced into the same registration surface.

### Three properties visible because we tried to strengthen

1. **Session-exempt tools have no shared abstraction either.** `help`, `list_workflows`, `health_check` independently call `listWorkflows`, construct JSON, and return content. The improvement makes their lack of abstraction MORE visible by contrast.

2. **`start_session` creates tokens but doesn't validate them.** It would be excluded from `withWorkflowValidation` because it produces the token rather than consuming it. This reveals `start_session` is a fundamentally different category but is filed alongside skill-access tools in `resource-tools.ts`.

3. **`advanceToken` has different semantics per handler.** Some advance with `{ wf: workflow_id }`, some with `{ wf, act }`, some with `{ wf, skill }`, some with no args. The improvement can't absorb `advanceToken` because its parameters encode per-tool semantics — revealing that token advancement is semantically meaningful, not mechanical boilerplate.

## 5. Diagnostic on Improvement 1

The `withWorkflowValidation` wrapper conceals that **the validation composition IS the tool's semantic identity**. The specific set of validations a tool runs defines what kind of tool it is. By extracting the common subset, we hide that the _differences_ are the classification scheme.

**Recreated property**: The improvement recreates the ad-hoc composition problem inside the handler callback — each handler still manually adds transition validation, manifest validation, etc. The improvement moved the easy parts out and left the hard parts in, proving that the hard parts (per-tool validation semantics) are a classification problem, not a pattern-extraction problem.

## 6. Improvement 2 — Addressing the Recreated Property

Define tool-category descriptors with validation profiles:

```typescript
type ToolCategory =
  | 'session-lifecycle'
  | 'workflow-navigation'
  | 'skill-access'
  | 'state-persistence';

const TOOL_PROFILES: Record<ToolCategory, {
  requiresToken: boolean;
  requiresWorkflow: boolean;
  validations: ValidationFn[];
  tokenAdvance: (params: Record<string, unknown>) => TokenAdvanceArgs;
}> = {
  'session-lifecycle': {
    requiresToken: false,
    requiresWorkflow: false,
    validations: [],
    tokenAdvance: () => ({}),
  },
  'workflow-navigation': {
    requiresToken: true,
    requiresWorkflow: true,
    validations: [validateWorkflowConsistency, validateWorkflowVersion],
    tokenAdvance: (p) => ({ wf: p.workflow_id as string }),
  },
  // ...
};
```

**Diagnostic**: The categories have internal variance. `next_activity` requires transition + manifest + condition validation; `get_checkpoint` requires only consistency + version. Both are "workflow-navigation." The category system must either (a) force every navigation tool to run ALL validations (over-validating) or (b) allow per-tool overrides (recreating ad-hoc composition inside the category framework).

## 7. Structural Invariant

**Each tool's validation composition is irreducibly specific to that tool's semantic role in the session protocol.**

No abstraction can eliminate per-tool validation decisions because those decisions ARE the tool's identity. The validation set is not boilerplate — it is the encoding of which protocol guarantees this tool provides.

## 8. Inversion

Design where the "impossible" property (uniform validation) becomes trivially satisfiable — every tool runs ALL validations always:

```typescript
function registerTool(name: string, handler: BusinessLogicFn) {
  server.tool(name, async (params) => {
    const token = params.session_token
      ? await decodeSessionToken(params.session_token)
      : null;
    const workflow = params.workflow_id
      ? await loadWorkflow(config.workflowDir, params.workflow_id)
      : null;
    const validation = buildValidation(
      token && params.workflow_id
        ? validateWorkflowConsistency(token, params.workflow_id) : null,
      token && workflow?.success
        ? validateWorkflowVersion(token, workflow.value) : null,
      token && workflow?.success && params.activity_id
        ? validateActivityTransition(token, workflow.value, params.activity_id) : null,
      // ... every validator, each guarded by parameter presence
    );
    return handler(params, token, workflow, validation);
  });
}
```

Each validation function returns `null` when its parameters are undefined/irrelevant.

**New impossibility**: The uniform validation design eliminates the ability to distinguish between "this tool doesn't need this validation" and "the caller forgot to provide the parameter." If `validateSkillAssociation` returns null because `skill_id` is undefined, is that because this is a workflow-navigation tool that doesn't use skills, or because the caller omitted a required argument? Uniform validation makes every parameter effectively optional.

## 9. Conservation Law

> **Validation Specificity ↔ Parameter Obligation**
>
> In any tool-registration framework for this protocol, the precision of validation (knowing which validations a tool SHOULD run) is conserved against the ability to enforce parameter requirements (knowing which parameters a tool MUST receive). If validation is per-tool specific, parameter obligations are clear but validation composition is fragile and ad-hoc. If validation is uniform, parameter obligations become ambiguous but validation composition is mechanical. The total "protocol knowledge embedded in the registration layer" is conserved.

## 10. Meta-Diagnostic (Diagnostic applied to the conservation law)

**What the law conceals**: Both "specificity" and "obligation" are STATIC properties being managed at RUNTIME. The tools layer resolves validation dynamically (at request time) when the tool categories and their validation requirements are fully known at registration time (build time). The conservation between specificity and obligation only holds because the system resolves both at the wrong time.

**Structural invariant of the law**: The law persists through improvements because the MCP SDK registers tools dynamically via `server.tool()` calls with runtime callbacks. The SDK's imperative API shape forces runtime resolution of what could be static constraints.

**Inversion of the law's invariant**: A declarative tool registration where types encode the category:

```typescript
type WorkflowNavTool<P extends { session_token: string; workflow_id: string }> = {
  category: 'workflow-navigation';
  params: P;
  validates: ['consistency', 'version'];
  advances: { wf: string };
};
```

This creates a new impossibility: the type system cannot express **conditional** validation (e.g., `next_activity` validates transitions only when `token.act` exists). Type-level encoding forces all-or-nothing validation per category, losing the ability to express "validate this IF that session state exists."

## 11. Meta-Law

> **The Conditional Validation Paradox**
>
> The conservation law conceals that validation requirements in this codebase are not fixed per tool — they are **conditional on session state**. `next_activity` validates step manifests only IF `token.act` exists (`workflow-tools.ts:122–127`). `get_skill` validates skill association only IF `token.act` exists AND the workflow loaded successfully (`resource-tools.ts:140`). The validation composition is irreducibly specific per tool NOT because each tool has a different fixed set, but because each tool has different **state-dependent validation branches**.

**Concrete, testable prediction**: Any attempt to centralize validation composition will either (a) lose the conditional branches and silently skip validations that should run, or (b) require the centralized layer to encode per-tool state predicates, which will grow to replicate the current per-handler logic exactly. Specifically: if someone extracts a `withWorkflowValidation` wrapper for `get_skill`, they will either lose the `token.act` guard on skill-association validation (introducing false negatives where a skill is accessed outside its activity without warning) or re-introduce the conditional inside the wrapper (gaining no abstraction benefit).

## 12. Bug Table

| # | Location | What breaks | Severity | Classification |
|---|---|---|---|---|
| 1 | `resource-tools.ts:16` — `loadSkillResources` casts `skillValue` to `Record<string, unknown>` | Runtime crash if `skillValue` is null, undefined, or a primitive. The function is private but not type-guarded. | Low | **Fixable** — add a runtime type check |
| 2 | `resource-tools.ts:97–109` — `get_skills` silently swallows skill-load failures | If a skill referenced by an activity fails to load, it is silently absent from the response. The agent receives no warning. | Medium | **Structural** — making failures visible requires per-skill error reporting in the response schema, adding parameter obligation complexity (predicted by conservation law) |
| 3 | `resource-tools.ts:111–114` vs `137–141` — `get_skills` omits skill-association validation | `get_skills` validates consistency + version but NOT skill association. `get_skill` validates all three. An activity could reference non-associated skills and `get_skills` would not warn. | Medium | **Structural** — `get_skills` loads skills BY activity (association is implicit), while `get_skill` loads by arbitrary `skill_id` (association must be checked). The asymmetry is a consequence of different tool semantics, predicted by the conservation law. |
| 4 | `workflow-tools.ts:94` — `(wf as Record<string, unknown>)['initialActivity']` | Bypasses TypeScript's type system to access `initialActivity`. If the workflow type excludes this field, the cast hides a type mismatch. | Low | **Fixable** — add `initialActivity` to the `Workflow` type definition |
| 5 | `workflow-tools.ts:122–127` vs `134–137` — asymmetric manifest warnings | Missing `step_manifest` generates a warning when `token.act` exists. Missing `activity_manifest` generates no warning. Inconsistent expectation signaling. | Low | **Structural** — the two manifest types have different state predicates; the meta-law predicts this state-conditional asymmetry |
| 6 | `workflow-tools.ts:161–162` — non-null assertions on trace segment events | `segment.events[0]!` and `segment.events[segment.events.length - 1]!` assert non-null after `length > 0` check. Safe in single-threaded Node.js but fragile pattern. | Low | **Fixable** — replace with safe access or optional chaining |
| 7 | `state-tools.ts:36` — `JSON.parse(stateJson)` without try/catch | Malformed JSON throws a raw `SyntaxError` to the MCP client. No user-friendly validation message. | Medium | **Fixable** — wrap in try/catch with a descriptive error |
| 8 | `state-tools.ts:43–47` — session token encryption keyed on hard-coded string `'session_token'` | If the variable name in the state schema changes, encryption silently doesn't happen and the token is saved in plaintext. The hard-coded key creates a concealed coupling to a dynamic schema. | Medium | **Structural** — static binding to dynamic schema; conservation law predicts the coupling cannot be eliminated without making the schema aware of encryption-sensitive fields |
| 9 | `state-tools.ts:99–103` — `decryptToken` fails on server-key rotation | If the server key has rotated since state was saved (different instance, key file deleted), `decryptToken` throws a cryptographic error, not a meaningful message. | Medium | **Structural** — state persistence conserves session continuity against server-identity continuity. Both require a key-versioning scheme that doesn't exist. |
| 10 | `state-tools.ts:34, 89` — state tools decode token but never validate workflow consistency | `save_state` and `restore_state` call `decodeSessionToken()` but never `validateWorkflowConsistency`. The token could be for workflow X while the state is for workflow Y. No cross-check. | Medium | **Structural** — meta-law prediction: state tools have no `workflow_id` parameter, so the validation CAN'T run. Adding it would create a new parameter obligation that breaks the current "state tools are workflow-agnostic" design. |
| 11 | `workflow-tools.ts:27–57` — `help` tool hardcodes the `session_protocol` object | If the session protocol evolves, the help response becomes stale. No mechanism derives help text from the actual protocol implementation. | Low | **Fixable** — extract protocol description to a shared constant or derive from tool registrations |
| 12 | `resource-tools.ts:46` — `workflow.version ?? '0.0.0'` fallback | If a workflow lacks a version, the session token is created with `'0.0.0'`. Later `validateWorkflowVersion` fires version-drift warnings when the workflow gains a real version, obscuring the root cause. | Low | **Fixable** — warn or fail on missing workflow version at session start |
| 13 | `workflow-tools.ts:205` — `get_activities` is the only tool that checks `token.act` existence | `get_activities` throws if `token.act` is absent. Other tools that logically need a current activity (`get_checkpoint` needs an activity to scope the checkpoint) don't check, producing undefined behavior if called without a prior `next_activity`. | Low | **Structural** — another manifestation of the conditional validation paradox: `token.act` precondition checking is ad-hoc per handler |

---

*Analysis complete. 13 findings classified: 6 fixable, 7 structural. All structural findings are predicted by the Validation Specificity ↔ Parameter Obligation conservation law or the Conditional Validation Paradox meta-law.*
