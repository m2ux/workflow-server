# Assumptions Log

> Cluster 1 (guidance & docs) · m2ux/workflow-server#189 · updated 2026-07-10

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence (RR = Requirements Refinement).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| RR-1 | Requirements Refinement | Technique Selection | H | Original: hard-code `bundleTechniques: { maxChars }` onto the 3–5 highest-traffic `work-package` activities — rationale was that zero corpus adoption + these carrying the most ungated small step-techniques meant they benefit most from per-activity opt-in. | User interview | Corrected: opt-in per-activity bundling rejected. Root cause = `bundleTechniques` is opt-in with ZERO adoption; fix at source with AUTOMATIC per-agent context-derived bundling (the worker declares REQUIRED `context_tokens` on its `get_activity` entry call — `get_activity` ONLY; `get_workflow` is NOT affected because it does no technique bundling; omission is a validation error; no session storage, no default, no fallback; server derives a headroom-adjusted budget and auto-bundles corpus-wide; per-activity `maxChars` kept as an explicit override / `0` opt-out). BREAKING API change. Per-activity YAML opt-ins dropped. |
| RR-2 | Requirements Refinement | Schema Construct Choice | M | R14's two unchanged-marker dialects (`{ unchanged: true, content_hash }` in `bundleTechniques` deliveries vs `{ delivery: "unchanged", content_hash }` in `get_technique`) — should they be reconciled by DOCUMENTING the difference or UNIFIED into one shape? | User interview | Corrected: UNIFY. Server code change so both the bundle path and `get_technique` emit ONE marker shape (not merely a doc note). |
| RR-3 | Requirements Refinement | Technique Selection | L | C1(d) `get_technique { full: true }` per-call reference opt-in needs ONLY a docs-surfacing check (confirm it is documented where an agent would look) and no new code — because the mechanic already exists. | User interview | Confirmed: docs-surfacing is sufficient; the `full: true` / unchanged-reference mechanic already exists — surface it in the docs. |
| RR-4 | Requirements Refinement | Rule Scope | L | The worker-prompt change (C1(e)/C6) AMENDS the existing "load one technique per step, never all at once" mandate to carve out inline bundled `step_techniques`, rather than introducing a new rule — because a new rule would duplicate/contradict the existing progressive-disclosure invariant. | Conformance/consistency audit: the existing progressive-disclosure mandate lives in `activity-worker-prompt.md`; carving out inline `step_techniques` is an in-place wording amendment, no new rule construct | Validated |
| RR-5 | Requirements Refinement | Activity Boundaries / Checkpoint Necessity / Variable State | L | This cluster introduces NO new `workflow-design` activities, NO new checkpoints, and NO new workflow variables — it is a docs + `bundleTechniques` config-adoption UPDATE — so the existing activity model, checkpoint set, and variable set are unchanged. | Schema/consistency audit: intake-established scope enumerates only edits to existing docs/YAML and `bundleTechniques` field adoption; no new activity/checkpoint/variable construct appears | Validated |

## Open Assumptions

_All three surfaced open assumptions are resolved (RR-1 Corrected, RR-2 Corrected→UNIFY, RR-3 Confirmed); their outcomes live in the Log rows. The only items still OPEN are implementation details deferred to scope-and-draft, captured below — none block requirements sign-off._

### Deferred implementation details (for scope-and-draft, non-blocking)
**Auto-bundle derivation formula (from RR-1):** the exact token→char factor, and whether the derived value is a per-technique cap or a cumulative per-activity eager-delivery budget.  
**Canonical marker shape (from RR-2):** the single unified unchanged-marker shape both the bundle path and `get_technique` will emit — choose one of `{ unchanged: true, content_hash }` / `{ delivery: "unchanged", content_hash }` (or a superseding shape) and define the back-compat/migration stance for existing consumers.  

## Corrected Design Record — C1(c) automatic per-agent context-derived bundling (supersedes RR-1)

Rejected the per-activity opt-in approach; the confirmed requirement is automatic, context-sized bundling that fixes the zero-adoption root cause. **Uniform principle:** every agent declares its OWN context window on the call that delivers its payload — the budget is per-AGENT and is never stored on the session, never guessed, and never defaulted. A session is shared by the orchestrator and every worker it dispatches (each potentially a different context size), so a session-stored budget would mis-size for all but one agent; only the consuming agent knows its own window.

1. **`context_tokens` is a REQUIRED parameter on `get_activity` ONLY** (declared by the worker — its entry call, where activity technique bundling happens). **`get_workflow` is NOT affected** — it does no per-technique bundling (it delivers only the small, fixed orchestrator operations bundle plus workflow metadata), so a context budget there is pointless.
2. **Omitting `context_tokens` on either call is a VALIDATION ERROR** — the call is rejected. The server NEVER guesses, NEVER defaults, NEVER falls back.
3. **NO session-level `context_tokens`** — it is NOT on `start_session` and NOT on `dispatch_child`. No session storage, no fallback chain of any kind.
4. **Server derives the bundle ceiling** from the caller's declared `context_tokens` — apply ~80% availability headroom, then a token→char factor (server owns this policy).
5. **Automatic bundling** — `get_activity` inlines ungated step techniques that fit the derived ceiling; gated and oversized techniques stay lazy via `get_technique`, exactly as today. Applies corpus-wide, no per-activity opt-in required.
6. **Per-activity `bundleTechniques.maxChars` remains an explicit override** — applied on top of the derived ceiling; an activity can tighten/loosen, or set `0` to opt out.
7. Hard-coding `bundleTechniques` onto the 5 candidate activities is DROPPED — automatic bundling replaces it; no corpus activity-YAML edits needed for bundling.
8. **BREAKING API change → server version bump.** `docs/api-reference.md`, `docs/ide-setup.md`, and `activity-worker-prompt.md` are updated to require `context_tokens` on the worker's `get_activity` entry fetch. `bootstrap-protocol.md`'s `get_workflow` bootstrap step is UNCHANGED w.r.t. `context_tokens` (it only gains `context_mode`/`agent_id` adoption guidance for C1a/b).

**OPEN implementation details (defer to scope-and-draft, not blockers):** (1) the exact derivation formula — token→char factor, and whether the derived value is a per-technique cap or a cumulative per-activity eager-delivery budget; (2) the canonical unified marker shape (RR-2) + back-compat stance.
**Reversibility:** path-committing (new REQUIRED param on two entry calls + breaking API bump + server bundling policy).

## Wrap-Up

5 assumptions surfaced; RR-3 confirmed, RR-4/RR-5 audit-validated. Two were corrected into real server-side design changes:

- **RR-1 (Corrected):** per-activity `bundleTechniques` opt-in → automatic, per-agent context-derived bundling. `context_tokens` is a REQUIRED parameter the worker declares on its `get_activity` entry call — `get_activity` ONLY; `get_workflow` is NOT affected (it does no technique bundling); omitting it is a validation error. The budget is NEVER stored on the session (no `start_session`/`dispatch_child` param), never guessed, never defaulted, no fallback. Server applies ~80% headroom + a token→char factor; per-activity `maxChars` override retained. BREAKING API change (version bump). Corpus activity-YAML opt-ins dropped.
- **RR-2 (Corrected):** document-only → UNIFY the two unchanged-marker dialects into one shape emitted by both the bundle path and `get_technique` (server change).

**Takeaway:** the intake framing (docs-only cluster) was superseded — fixing the zero-adoption root cause required pulling genuine server changes (worker-declared `context_tokens` + auto-bundle derivation, and marker unification) forward from cluster 3 into this work package; user-approved.

**Deferred to scope-and-draft (open implementation details, non-blocking):** (1) the exact auto-bundle derivation formula (token→char factor; per-technique cap vs cumulative per-activity budget); (2) the canonical unified marker shape + back-compat stance.
