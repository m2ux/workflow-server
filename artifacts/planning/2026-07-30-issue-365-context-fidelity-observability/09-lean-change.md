# Lean Change — #365 / PR #366

## Change under review

| Field | Value |
|-------|--------|
| Branch | `feat/365-context-fidelity-observability` |
| Worktree | `.worktrees/2026-07-30-issue-365-context-fidelity-observability` |
| Diff base | merge-base with `origin/main` (`3b72a760`) |
| Feature commits | `870e0df7` feat · `a6b970b0` test · lean polish (this pass) |

## What shipped (present tense)

- **S3 usage:** optional `record_usage.agent_id` → `data.agentId`; `projectUsage` returns `{ rows, totals }` with plain-sum over `USAGE_TOKEN_KEYS`; inspect/oracle parity includes `usage` + agent filter.
- **S5 agent:** trace `aid` from call `agent_id`; `get_trace` / history+usage filters; `validateTechniqueFetches` scopes by `data.agentId`.
- **S5 resources:** `qualifyResourceId` when technique workflow ≠ delivery workflow; unresolvable refs warn in full and reference mode without failing `get_activity`.
- **S5 steps:** hybrid `step_started` on bundle/lazy fetch via `appendStepStartedIfAbsent`; `step_completed` from non-empty `step_manifest` at `next_activity`.
- **S2 artifacts:** session `declaredArtifacts`; `artifacts_produced` merge-by-id; planning-folder undeclared-file warnings with compact cover-name set; outside-folder → unknown not missing.
- **S4 delivery:** `provenance_note` + split inherited `note`/`items` via shared `stageField` in `dedupTechniqueBlocks`.

## Simplifications applied (audit cycle 1)

Accepted at `audit-findings-confirmed` → `apply-simplifications`. All seven findings from `09-code-review.md`:

1. Removed unused `parseResourceRef` import from `workflow-tools.ts`.
2. Extracted `appendStepStartedIfAbsent` (`src/utils/step-events.ts`); wired from bundle path and lazy `get_technique`.
3. Compacted artifact cover-name construction (single key loop + combined membership check).
4. Unified delivery staging on `stageField` (nested note/items + top-level with `assignFull`).
5. One-line comment on call `agent_id` in `logging.ts`.
6. Dropped redundant stamp-length assert in PR366-TC-23.
7. Dropped weak `every(… || undefined)` aid assert in mcp-server PR366-TC-12/13.

No new `ponytail:` ceilings — pure delete/shrink of audit findings, no deferred abstraction.

## Validation

- `npm run typecheck` — pass
- `vitest` PR366 filter on fetch-observability, reference-delivery, resource-ref, validation, mcp-server — 16 passed

## Lean scoreboard

| Source | Result |
|--------|--------|
| Pre-apply review | net: −36 lines possible |
| Post-apply re-score | **Lean already. Ship.** (no remaining over-engineering findings on the applied set) |
| Ponytail debt harvest | 0 markers |
| Diff this polish | 6 files −39 / +29 lines; +1 helper file (~25 lines) — net local shrink on call sites |

## Apply stance

`needs_simplification`: false after this cycle. Safety floor held (behaviour-preserving; SC tests green).
