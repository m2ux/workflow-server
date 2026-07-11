# Design Philosophy

> design-philosophy · Session Inspection Tool · #193 Add read-only inspect_session tool to remove ad-hoc session.json introspection in close-out activities · 2026-07-11

## Problem Statement

The workflow-server exposes no first-class, read-only way for a worker agent to read a session's own state back out of `session.json` — the variable bag, checkpoint responses, completed/skipped activity lists, the history event stream, and embedded child sessions under `triggeredWorkflows[].state`. Close-out activities therefore fall back to inline `python3 -c` reads: eight in one observed meta + client run, four of which were pure schema-probing (the worker iterating to find where a field lived). Each inline call is a unique command string, so it triggers a non-suppressible permission prompt; the location-scoped allow-hook refuses `-c` inline code by design, so the form can never be allow-listed; and the projection logic is regenerated per call, where a wrong-key probe silently reports nothing — a correctness risk for close-out summaries.

### System Context

- **Server** — TypeScript MCP server (`src/` at repo root). Tools live as per-domain modules under `src/tools/` (e.g. `resource-tools.ts`, `workflow-tools.ts`) with shared session plumbing already present: `sessionIndexParam` (`src/utils/session/params.ts`) and `withSessionStoreErrors` (`src/tools/workflow-tools.ts`). The server already resolves a 6-char `session_index` to the on-disk `session.json` under the planning folder.
- **Session schema** — `schemaVersion: 1`; root sessions hold `variables` at top level, children embed state under `triggeredWorkflows[n].state` — exactly the asymmetry that caused the observed schema-probing.
- **Consumers** — close-out techniques in the `workflows` orphan-branch worktree: `workflow-engine::verify-outcomes`, `workflow-engine::generate-summary` (meta `end-workflow`), `conduct-retrospective::retrospective` / `::select-next` (client `complete`).
- **Reference implementation** — `scripts/inspect_session.py` in this planning folder implements the exact projections and is the normative output contract for the tool.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium |
| Scope | Every work-package close-out (meta + client); the supervising user (8 permission prompts per observed run) |
| Business Impact | Recurring supervisor interruptions, wasted tokens on per-call schema re-discovery, and silent-omission risk in close-out artifacts when a probe guesses a wrong key |

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Simple

**Rationale:** Nothing is currently broken or failing — close-out works, with friction and risk — so the decision tree lands on inventive goal; it enhances an existing capability (session-state access during close-out) rather than preventing a future failure, hence improvement. Complexity is simple: the problem is clear and quantified; the solution is fully pre-designed (proposal.md fixes the parameter table, view enum, and defaults; `scripts/inspect_session.py` is the behavioral spec for the output contract); implementation slots into the existing `src/tools/` module pattern with shared session plumbing; and the change is additive — GitNexus shows zero existing callers and no modified execution flows, a low objective complexity signal. The two-surface footprint (server tool + four technique advisory notes) adds breadth, not approach uncertainty: no architectural decisions or trade-offs remain — the proposal's Alternatives section already resolved them.

## Workflow Path Decision

**Selected Path:** Direct to planning (skip optional activities)

**Activities Included:**
- [ ] Requirements Elicitation
- [ ] Research
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** The proposal already embodies the optional discovery work. Elicitation is done — the parameter table (`session_index` required; `view` enum `summary|identity|variables|checkpoints|activities|history|children` defaulting to `summary`; optional `child_index` and `variable`), output contract, and success evidence are fixed. Research is done — alternatives (static script + allow-hook; returning the whole `session.json`) were weighed and rejected with recorded rationale. Re-running either activity would re-derive an existing artifact. Codebase comprehension remains mandatory (as on every path): the TS session-store internals and the workflows-worktree technique layout still need comprehension before planning. Design-framework scope at plan time is the simple tier: problem definition, conventional solutions, synthesis. Confirmed at the `classification-and-path-confirmed` checkpoint (option `skip-optional`).

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | None stated |
| Technical | Read-only — no session mutation; return a compact structured projection, never the raw `session.json` (large: history + `deliveredContent`); output shape must match `scripts/inspect_session.py` (`schemaVersion: 1`); server changes additive so existing tool snapshots are unaffected beyond registration |
| Dependencies | Two surfaces — server source (`src/`) and technique content in the `workflows` orphan-branch worktree; both must land for the feature to be complete |
| Resources | Reference implementation is normative for the projection logic — port it, don't redesign it |

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| `inspect_session` tool exists | Tool registered and callable; params `session_index` (required), `view` (enum, default `summary`), `child_index` (optional), `variable` (optional) | All views return the projection specified by `scripts/inspect_session.py` |
| Read-only guarantee | Code inspection + tests | No session mutation on any code path; no raw-file passthrough |
| Techniques advise the tool | Content inspection in `workflows` worktree | Advisory step notes in `workflow-engine::verify-outcomes`, `workflow-engine::generate-summary`, `conduct-retrospective::retrospective`, `conduct-retrospective::select-next` |
| Ad-hoc introspection eliminated | Close-out runs after adoption | Zero inline `python3 -c` session.json reads (baseline: 8 per run) |
| Quality gates | `npm run typecheck` && `npm test` | Green |

## Notes

- The checkpoint effect set `path_gating_complexity=simple`; the assessed `problem_complexity` is likewise simple.
- The static script (`scripts/inspect_session.py`) remains the documented fallback for environments without the tool, per the proposal — the tool does not delete it.
- For plan-prepare: `resolveSessionLocation` (`src/utils/session/store.ts:404`) already resolves a child's own `session_index` to its embedded state via a jsonPath, so the `child_index` parameter overlaps with direct child-index resolution. The plan should decide how `child_index` composes with that resolver while keeping the reference implementation's positional semantics (`triggeredWorkflows[n]` from the addressed session) as the contract.
