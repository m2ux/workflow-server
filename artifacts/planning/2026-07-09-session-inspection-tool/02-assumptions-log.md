# Assumptions Log

> Session Inspection Tool · #193 · updated 2026-07-11

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence
(DP-1, RE-1, RS-1, IA-1, PL-1) or task number (1.1, 2.3).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| DP-1 | Design Philosophy | Problem Interpretation | M | `scripts/inspect_session.py` accurately reflects the current session schema (`schemaVersion: 1`) and is usable as the normative output contract — it was written against a live session two days ago, but the schema may have moved since | Code: `src/schema/session.schema.ts:57-196` (SessionFile — all 9 identity keys, `variables`, `completedActivities`/`skippedActivities`, `checkpointResponses`, `history`, `triggeredWorkflows[n].state` as recursive full SessionFile; `schemaVersion` still `z.literal(1)` at :59); `src/schema/state.schema.ts:47-55` (CheckpointResponse = `optionId`/`respondedAt`/`effects.variablesSet`, exactly what the script projects); `:6-43` (all six milestone event types in the script's filter are valid `HistoryEventType` members; entries carry `type`/`activity`/`checkpoint`) | Validated |
| DP-2 | Design Philosophy | Problem Interpretation | L | "Advisory step notes" means non-enforcing guidance text added to the four close-out techniques' protocols — no workflow-schema change and no new formal step binding; the issue phrases it as "a step note", not a bound step | Code: issue #193 body ("Each gains a step note: obtain session state via `inspect_session`, not by reading `session.json` directly"); target files exist as plain markdown operation docs — `workflows/meta/techniques/workflow-engine/verify-outcomes.md`, `generate-summary.md`, `workflows/work-package/techniques/conduct-retrospective/` — so a protocol note is a content edit only | Validated |
| DP-3 | Design Philosophy | Complexity Assessment | M | The existing session-store read path already exposes everything the projections need (variables, checkpoints, activities, history, `triggeredWorkflows[n].state` children), so the tool is a pure read-side addition following the `src/tools/` module pattern — simple complexity rests on this | Code: `src/utils/session/store.ts:268` (`readSessionFile`), `:404` (`resolveSessionLocation` — index → folder + jsonPath); `src/utils/session/resolver.ts:20,63,96` (`navigatePath` into embedded children, `sessionView`); registration is additive `server.tool(...)` inside `registerWorkflowTools` (`src/tools/workflow-tools.ts:112`; 12 + 2 tools today) with `withSessionStoreErrors` (`:47`) as the shared error wrapper | Validated |
| DP-4 | Design Philosophy | Workflow Path | L | Skipping elicitation and research is safe because proposal.md already embodies both (fixed param/view/output contract; alternatives weighed and rejected) — re-running discovery would re-derive an existing artifact | User (checkpoint `classification-and-path-confirmed`, option `skip-optional`) | Confirmed |
| DP-5 | Design Philosophy | Complexity Assessment | L | The test/snapshot infrastructure tolerates an additive tool — existing baselines shift only by tool registration, not by changes to existing payloads | Code: no hardcoded tool-count or tool-list assertion in `tests/mcp-server.test.ts`; e2e snapshots (`tests/e2e/__snapshots__`) capture workflow-walk payloads, not the tool registry, so an additive tool leaves baselines untouched | Validated |

## Wrap-Up

5 assumptions — all validated/confirmed. One consideration surfaced for plan-prepare
(not an assumption): `resolveSessionLocation` already resolves a *child's own*
`session_index` to its embedded state via a jsonPath, so the proposal's `child_index`
parameter overlaps with direct child-index resolution — the plan should decide whether
`child_index` addresses children positionally from a root session (as proposed) or
leans on the existing resolver, and keep the reference implementation's positional
semantics as the contract either way.
