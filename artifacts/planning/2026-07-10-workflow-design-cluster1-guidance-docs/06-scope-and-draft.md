# Scope Manifest & Draft — Cluster 1 (guidance & docs + server changes)

> Cluster 1 · m2ux/workflow-server#189 · UPDATE mode · target = workflow-server repo root (`.`) · created 2026-07-10 · activity prefix `06`

## Worktree precondition

- **Main checkout** `/home/mike1/projects/main/workflow-server` is on branch `chore/200-bump-workflows-v3.27.0` (NOT a dedicated worktree for this work).
- **`workflows` submodule** is checked out on the `workflows` branch (correct). Only meta-resource files under `workflows/meta/resources/` are touched in the corpus; no corpus activity/technique YAML is edited (bundling opt-ins dropped per RR-1).
- **Drafting-only activity** — no commits/branches created here. FLAG for validate-and-commit: workflows-submodule changes (the two meta resources) MUST be committed in a dedicated `workflows`-branch worktree, and the server-repo changes on their own branch, per repo discipline.

## Scope Manifest — every file to create / modify / remove

Nothing is created or removed as a file; all changes are in-place modifications (plus two table-row deletions inside `schemas/README.md`, and one wire-shape removal inside server source). No new files.

### A. Server source (`src/`) — the real behaviour change

| # | File | Action | Type | Change |
|---|------|--------|------|--------|
| 1 | `src/utils/session/params.ts` | modify | server | Add a reusable `contextTokensParam` zod spread — REQUIRED `context_tokens: z.number().int().positive()` with a describe. Mirrors `sessionIndexParam`. `sessionIndexParam` itself unchanged. |
| 2 | `src/config.ts` | modify | server | (a) Bump `SERVER_VERSION` default `1.0.0` → `2.0.0` (breaking API). (b) Add two derivation constants to `ServerConfig` + `loadConfig` (env-overridable): `bundleHeadroomFraction` (default `0.8`) and `bundleCharsPerToken` (default `4`). These feed the eager-bundle budget so the factor/headroom are config, not inline magic numbers. |
| 3 | `src/tools/workflow-tools.ts` | modify | server | (a) `get_activity` param block (L354–357): add `...contextTokensParam`; destructure `context_tokens` in the handler (L358); update tool description (L353) to state the REQUIRED param and the derived budget. (b) Bundle-ceiling derivation (L436–501): derive a **cumulative per-activity eager budget** = `context_tokens × bundleHeadroomFraction × bundleCharsPerToken`; the `if (bundleConfig …)` guard at L449 is no longer the entry condition — bundling runs corpus-wide; `bundleConfig.maxChars` (when present) stays a per-technique size cap, `maxChars: 0` opts the activity out entirely; inline ungated step techniques in document order until the running total would exceed the budget, remainder stay lazy. (c) Bundle-note prose (L511) reconciled to the unified marker shape (see B). (d) Marker call sites at L416/430/487/546 inherit the unified `unchangedMarker` shape automatically. |
| 4 | `src/utils/delivery.ts` | modify | server | Unify the marker (R14): `unchangedMarker()` (L47–49) + module-doc references (L10–11, L21) emit the ONE canonical shape (see open detail B). |
| 5 | `src/tools/resource-tools.ts` | modify | server | Unify the marker (R14): `get_technique` unchanged-stub (L640–649) + `_meta.delivery` emit the SAME canonical shape as `delivery.ts`. Preserve the shared `technique:<id>` ledger key (L631) — integrity constraint. `note` prose reconciled. |
| 6 | `src/schema/activity.schema.ts` | modify | server | `BundleTechniquesSchema.maxChars` `.describe()` (L17) + the `bundleTechniques` block comment (L12–15): reword from "sole opt-in trigger" to "explicit per-technique size cap layered on the server-derived per-activity budget; `0` opts the activity out". No structural schema change (maxChars stays `int().positive()` — but see note: `0` opt-out requires relaxing `.positive()` to `.nonnegative()`; flagged in open detail A). |

### B. Tests / harness call sites — add the required param, update marker assertions

| # | File | Action | Type | Change |
|---|------|--------|------|--------|
| 7 | `tests/reference-delivery.test.ts` | modify | test | Add `context_tokens` to all `get_activity` calls (6 sites); update `unchangedMarker` equality (L63–64) + marker predicate (L14–21) + get_activity marker assertions (L169, L233) to the unified shape; `get_technique` stub assertions (L410–411, L464) unchanged in key names if the canonical shape keeps `delivery`+`content_hash`. |
| 8 | `tests/hybrid-bundling.test.ts` | modify | test | Add `context_tokens` to `get_activity` calls (2 sites); `maxChars` schema accept/reject (L315–322) — update if `0` opt-out relaxes `.positive()`; marker `_meta.delivery` (L276) + re-delivery marker (L290–291) to unified shape; **INVERT** the "no `bundleTechniques` → no `step_techniques`" assertion (L302) — corpus-wide auto-bundling now bundles ungated small techniques even without an opt-in; add a `context_tokens`-too-small → nothing bundled case. |
| 9 | `tests/fetch-observability.test.ts` | modify | test | Add `context_tokens` to `get_activity` call(s); unchanged-reference-in-persistent assertion (L119) to unified shape. |
| 10 | `tests/mcp-server.test.ts` | modify | test | Add `context_tokens` to all `get_activity` calls (11 sites); add one missing-`context_tokens` → validation-error case. |
| 11 | `tests/e2e/walker.ts` | modify | harness | `callTool('get_activity', { session_index })` (L266) → add `context_tokens`. |
| 12 | `scripts/smoke/smoke-orchestrator.ts` | modify | harness | `get_activity` call (L171) → add `context_tokens`. |
| 13 | `scripts/generate-site-data.ts` | verify | harness | Uses `get_activity` output; confirm no param-adding needed (reads output, not a live authenticated call in the same shape) — verify during drafting. |

`tests/e2e/harness.ts` reads `get_activity` output downstream of walker — no direct param change (covered by #11). `tests/e2e/__snapshots__/snapshot.test.ts.snap` snapshots definitions, not live output — re-run only; no pre-emptive re-baseline.

### C. Docs (`docs/`, `schemas/README.md`)

| # | File | Action | Type | Change |
|---|------|--------|------|--------|
| 14 | `docs/api-reference.md` | modify | doc | (a) `get_activity` row (L30): add `context_tokens` (required) to Parameters + prose on the derived budget. (b) Enforcement Boundary (L116): move "variable types and defaults" out of *agent-interpreted* — `defaultValue` server-seeded (`variables_seeded`), `type` warn-only on `setVariable` (B7). (c) Reference Delivery §/Hybrid Bundling § (L200–218) + `get_technique` row (L42): unified marker shape; surface `get_technique { full: true }` opt-in (C1d, already present at L204/208 — confirm). |
| 15 | `docs/ide-setup.md` | modify | doc | Add `context_mode: "persistent"` + canonical `agent_id` guidance; document the REQUIRED `context_tokens` on the worker's `get_activity` entry fetch. |
| 16 | `schemas/README.md` | modify | doc | Remove the two stale activity `artifacts` rows (L581, L1208) — B4 removed authored activity `artifacts[]` (now synthesized from technique `## Outputs`). |

### D. Meta resources (`workflows/meta/resources/`)

| # | File | Action | Type | Change |
|---|------|--------|------|--------|
| 17 | `workflows/meta/resources/activity-worker-prompt.md` | modify | resource | (a/C1e) Amend the "load progressively — one per step, never all at once" mandate (L21) to CARVE OUT inline bundled `step_techniques` (no `get_technique` fetch for bundled entries). (b/C6) Reconcile bundle-shape wording with the real `step_techniques` delivery. No new rule (RR-4). |
| 18 | `workflows/meta/resources/bootstrap-protocol.md` | modify | resource | `context_mode` already documented (L21). Add canonical `agent_id` steer for solo/persistent mode. `get_workflow` step (L23) UNCHANGED w.r.t. `context_tokens` (get_workflow does no technique bundling). |

### E. Guards — re-run only (no edits expected)

`scripts/check-site-links.ts`, `scripts/check-resource-anchors.ts`, `scripts/generate-schemas.ts` (+ `schemas/activity.schema.json` regen if `.describe()` is treated as contract), `scripts/check-binding-fidelity.ts` (baseline stable — no corpus YAML edited). `scripts/smoke/worker-brief.md` — MEDIUM: mention `context_tokens` in the worker brief prose (add to #12 group).

## Drafting order

Server source is the reference-dependency root (marker shape + param + budget), so it drafts first; tests/harness follow the source they assert against; docs and resources describe the settled behaviour last.

1. `src/utils/delivery.ts` (marker shape — settles B)
2. `src/tools/resource-tools.ts` (marker consumer — same shape)
3. `src/utils/session/params.ts` (`contextTokensParam`)
4. `src/config.ts` (version bump + derivation constants)
5. `src/tools/workflow-tools.ts` (param wiring + budget derivation + note prose)
6. `src/schema/activity.schema.ts` (describe/comment reword)
7. tests: `reference-delivery`, `hybrid-bundling`, `fetch-observability`, `mcp-server`
8. harness: `tests/e2e/walker.ts`, `scripts/smoke/smoke-orchestrator.ts` (+ `worker-brief.md`)
9. docs: `docs/api-reference.md`, `docs/ide-setup.md`, `schemas/README.md`
10. resources: `activity-worker-prompt.md`, `bootstrap-protocol.md`

## Open implementation details — pinned recommendations (surfaced at scope/approach checkpoint)

### (A) Derivation formula
**Recommended:** cumulative per-activity eager-delivery budget:
```
budget_chars = context_tokens × bundleHeadroomFraction(0.8) × bundleCharsPerToken(4)
```
`get_activity` inlines ungated step techniques in **document order** until adding the next would exceed `budget_chars`; the remainder stay lazy via `get_technique`. Per-activity `bundleTechniques.maxChars` remains a **per-technique size cap** on top (skip any single technique larger than it). `maxChars: 0` = opt the activity out of eager bundling entirely. `bundleHeadroomFraction` and `bundleCharsPerToken` are **`ServerConfig` constants** (env-overridable), not inline magic numbers.
- **Sub-decision flagged:** supporting `maxChars: 0` as opt-out requires relaxing `BundleTechniquesSchema.maxChars` from `.positive()` to `.nonnegative()` (a schema-shape change) OR treating "absent `bundleTechniques`" as the opt-in-to-auto and reserving a separate opt-out flag. Recommendation: relax to `.nonnegative()` and treat `0` as the sentinel (minimal, keeps one field).

### (B) Canonical unified marker shape
**Recommended:** `{ delivery: "unchanged", content_hash }` as the single shape emitted by BOTH `delivery.ts#unchangedMarker` and the `get_technique` stub.
- **Rationale:** `delivery: "unchanged"` is self-describing (a discriminant string reads better in a wire payload than a bare boolean), it already matches the `_meta.delivery: "unchanged"` channel `get_technique` sets today, and it aligns the bundle path to the richer of the two existing shapes rather than the leaner. The `get_technique` stub drops its extra `id`/`note` fields from the marker core (they can stay as sibling context fields but are not part of the canonical marker).
- **Back-compat:** this rides the `2.0.0` major, so a wire-shape change is acceptable; no migration shim. The shared `technique:<id>` ledger key is preserved unchanged.
- **Alternative considered:** `{ unchanged: true, content_hash }` (the current bundle shape) — rejected as the canonical because a boolean is less self-describing and it would force the `get_technique` path (and its `_meta.delivery`) to change more.

## As-Built (drafting complete)

Design decided at the scope/approach checkpoint (both open details + two refinements), then drafted:

- **(A) Budget — DECIDED cumulative.** `context_tokens` REQUIRED on `get_activity` (omission = validation error). Cumulative eager budget = `context_tokens × bundleHeadroomFraction(0.80) × bundleCharsPerToken(4)`, both env-overridable `ServerConfig` fields with in-code fallback constants (`DEFAULT_BUNDLE_HEADROOM_FRACTION`, `DEFAULT_BUNDLE_CHARS_PER_TOKEN`). Inline ungated step techniques in document order until the next would overflow. `bundleTechniques.maxChars` = per-technique size cap; `0` = opt out; schema relaxed `.positive()` → `.nonnegative()`. `SERVER_VERSION` 1.0.0 → 2.0.0.
- **(B) Marker — DECIDED `{ delivery: "unchanged", content_hash }`** emitted by both `delivery.ts#unchangedMarker` and the `get_technique` stub (routed through the shared factory). Shared `technique:<id>` ledger key preserved. Rides 2.0.0, no shim.
- **(C) Intentional-stepping preserved — ALL THREE.** (1) Each inlined `step_techniques` entry leads with a `▼ STEP <step_id> · technique <name>` arrival marker (technique fields follow at the same level). (2) The worker prompt prescribes deliberate in-order engagement + a `▶ step <step_id>` emitted begin-beat per bundled step. (3) That emitted beat is the observability substitute for the per-step fetch event — no server ping per bundled step; delivery-time `technique_bundled` events record coverage.
- **(C4/refinement) Resources stay lazy.** Bundling inlines step TECHNIQUES only. Inlined entries carry `resources[]` refs unchanged; the worker still calls `get_resource` on demand. Budget measures technique body size only (not resolved resource content). Shared-resource dedup deferred to the C2 block-level-ledger cluster. Documented in `activity-worker-prompt.md`, `api-reference.md`, and the budget-derivation code comment.

**Files changed (all in-place, no files created/removed):**
- Server: `src/utils/delivery.ts`, `src/tools/resource-tools.ts`, `src/utils/session/params.ts`, `src/config.ts`, `src/tools/workflow-tools.ts`, `src/schema/activity.schema.ts`
- Tests: `tests/reference-delivery.test.ts`, `tests/hybrid-bundling.test.ts`, `tests/mcp-server.test.ts`, `tests/config.test.ts` (fetch-observability.test.ts needed no change — no get_activity calls)
- Harness: `tests/e2e/walker.ts`, `scripts/smoke/smoke-orchestrator.ts`, `scripts/smoke/worker-brief.md`
- Docs: `docs/api-reference.md`, `docs/ide-setup.md`, `schemas/README.md`
- Meta resources: `workflows/meta/resources/activity-worker-prompt.md`, `workflows/meta/resources/bootstrap-protocol.md`
- Regenerated: `schemas/activity.schema.json`, `schemas/workflow.schema.json`, `site/api/tools.html` (from `build:schemas` / `build:site`)

**Verification:** `npm run typecheck` clean; full suite 535 passed / 14 skipped / 0 failed; guards green (check:site, check:anchors, check:binding 263/0 NEW, check:fragments, check:review-mode, check:variable-model). e2e definition snapshot unchanged (corpus YAML untouched).
