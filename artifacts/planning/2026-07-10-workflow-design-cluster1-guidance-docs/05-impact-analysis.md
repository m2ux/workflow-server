# Impact Analysis — Cluster 1 (guidance & docs + server changes)

> Cluster 1 · m2ux/workflow-server#189 · UPDATE mode · target = workflow-server repo root (`.`) · updated 2026-07-10

## Scope note

This is a `workflow-design` UPDATE whose "target workflow" is the **workflow-server codebase itself**, not a single workflow YAML. The confirmed design carries real SERVER code changes plus docs/resources. The classic file-enumeration protocol (enumerate → classify → integrity → flag removals) is applied against the server source, docs, schema, meta resources, tests, and guard scripts.

**Design correction applied before this analysis (coordinator, user-directed):** `context_tokens` is REQUIRED on **`get_activity` ONLY**. `get_workflow` is NOT changed — it does no per-technique bundling (it delivers only the fixed orchestrator ops bundle + workflow metadata). `start_session` / `dispatch_child` are NOT changed. This reduces the impacted surface vs the earlier "both entry calls" framing. The RR-1 record in `03-assumptions-log.md` and the C1(c) bullet + Scope Manifest in the planning `README.md` were corrected to match.

---

## 1. Affected source modules / functions (server code)

### C1c — `context_tokens` REQUIRED on `get_activity` (BREAKING)

| Site | File · symbol | Impact | Risk |
|------|---------------|--------|------|
| **`get_activity` handler** | `src/tools/workflow-tools.ts` — `server.tool('get_activity', …)` param block at **L354–357** and handler body at **L358** (`async ({ session_index, bundle }) => …`) | Add REQUIRED `context_tokens` to the param object; destructure it in the handler; validate presence (zod `.number().int().positive()` — a missing/invalid value already rejects at the MCP boundary, matching the `sessionIndexParam` pattern). Update the tool description (L353) to state the required param. | **CRITICAL** — breaking API surface |
| **Bundle-ceiling derivation** | `src/tools/workflow-tools.ts` — hybrid bundling block **L436–501** (`bundleConfig`, the `text.length > bundleConfig.maxChars` gate at **L483**) | Today bundling runs ONLY when the activity declares `bundleTechniques`. New behaviour: derive a ceiling from `context_tokens` (×~80% headroom, ×token→char factor) and bundle corpus-wide (all ungated eligible step techniques), with `bundleConfig.maxChars` kept as an explicit per-activity override / `0` opt-out. This is the core logic change: the `if (bundleConfig && …)` guard at **L449** must no longer be the entry condition; eligibility/collection (`collectUngated`, L451–458) stays but the ceiling source changes. | **HIGH** |
| **Param helper (pattern only)** | `src/utils/session/params.ts` — `sessionIndexParam` (L9–13) | Reference pattern for a REQUIRED zod param. A sibling `contextTokensParam` spread may be added here for reuse, or inline it on `get_activity`. No change to `sessionIndexParam` itself. | LOW |

**Confirmed NOT changed** (verified read-only):
- `get_workflow` handler — `src/tools/workflow-tools.ts` L134–204. No `context_tokens`, no bundling ceiling. Leave as-is.
- `start_session` — `src/tools/resource-tools.ts` (param block ~L158, `context_mode` only). No `context_tokens`.
- `dispatch_child` — `src/tools/resource-tools.ts` (param block ~L386, `context_mode` only). No `context_tokens`.
- No session-level storage: `src/schema/session.schema.ts` (`contextMode` at L137, `deliveredContent` ledger) is untouched — the budget is per-call, never persisted.

### R14 / C6 — unify the two unchanged-marker dialects (SERVER)

Two distinct shapes exist today (grounded):

| Dialect | Shape | Emission sites |
|---------|-------|----------------|
| **Bundle path** | `{ unchanged: true, content_hash }` | `src/utils/delivery.ts` — `unchangedMarker()` **L47–49**; called from `src/tools/workflow-tools.ts` at **L416** (bundle techniques), **L430** (rules), **L487** (bundled step techniques), **L546** (`activity_rules`) |
| **`get_technique` path** | `{ id, delivery: 'unchanged', content_hash, note }` + `_meta.delivery: 'unchanged'` | `src/tools/resource-tools.ts` — **L640–649** (the stub) |

**Unification site:** pick ONE canonical shape (deferred impl detail — see assumptions log) and make both paths emit it. If the canonical shape becomes `{ delivery: 'unchanged', content_hash }`, then `unchangedMarker()` in `delivery.ts` changes and all four call sites in `workflow-tools.ts` inherit it; if it becomes `{ unchanged: true, … }`, the `resource-tools.ts` stub at L640–649 + its `_meta` change instead. Either way BOTH files are touched (the emitter and the shape definition). **Consumer note:** `bundle_note` (L511) and the `get_technique` stub `note` (L644) are human-facing prose that references the current shape and must be reconciled.

| Site | File · symbol | Risk |
|------|---------------|------|
| Marker factory | `src/utils/delivery.ts` — `unchangedMarker()` L47; module doc comment L10–11, L21 references the shape | **HIGH** — shape is a wire contract consumed by agents + tests |
| `get_technique` stub | `src/tools/resource-tools.ts` L640–649 (+`_meta.delivery`) | **HIGH** |
| Bundle notes (prose) | `workflow-tools.ts` L511 `bundle_note`; `resource-tools.ts` L644 `note` | MEDIUM |

---

## 2. Tests / snapshots to re-baseline

### Direct marker-shape / bundling assertions (WILL break on both C1c and R14)

| File | What it asserts | Break cause |
|------|-----------------|-------------|
| `tests/reference-delivery.test.ts` | `unchangedMarker(...)` equals `{ unchanged: true, content_hash }` (**L63–64**); marker predicate on `unchanged===true && content_hash` (**L14–21**); `get_activity` default-mode markers (**L169, L233**); `get_technique` stub `delivery==='unchanged'` + `content_hash` (**L410–411, L464**). Also 6 `get_activity` call sites. | R14 shape change; C1c required param |
| `tests/hybrid-bundling.test.ts` | `bundleTechniques.maxChars` schema accept/reject (**L315–322**); bundled-refetch `_meta.delivery==='unchanged'` (**L276**); re-delivery marker `unchanged===true` + `content_hash` (**L290–291**); "no `bundleTechniques` → no `step_techniques`" (**L302**) — this last assertion INVERTS under corpus-wide auto-bundling. 2 `get_activity` calls. | C1c corpus-wide bundling changes what bundles without opt-in; R14 shape |
| `tests/fetch-observability.test.ts` | unchanged-reference in persistent mode still records the fetch (**L119**) | R14 shape (marker read) |
| `tests/mcp-server.test.ts` | 11 `get_activity` call sites | C1c required param — all calls must pass `context_tokens` |

### Runtime harnesses that call `get_activity` without the param (WILL break at runtime once required)

| File | Site | Fix |
|------|------|-----|
| `tests/e2e/walker.ts` | **L266** `callTool('get_activity', { session_index })` | add `context_tokens` to the call |
| `scripts/smoke/smoke-orchestrator.ts` | **L171** `callTool('get_activity', { arguments: { session_index } })` | add `context_tokens` |
| `tests/e2e/harness.ts` | bundle-extraction helper (**L114**) reads `get_activity`/`get_workflow` ops — reads output, no param, but downstream of walker | none directly; downstream of walker fix |

### e2e definition snapshot

- `tests/e2e/__snapshots__/snapshot.test.ts.snap` (2822 lines) — snapshots workflow/activity DEFINITIONS, not live `get_activity` tool output (grep for `get_activity`/`step_techniques`/`context_tokens`/`unchanged` = 0 hits). **Not expected to break** from the param change. Re-baseline only if the corpus YAML changes (it does not — corpus bundling edits are dropped) OR if bundled-technique projection formats shift. Flag: re-run after implementation to confirm no incidental drift.

### Schema-shape tests

- `tests/generated-schemas.test.ts` and `tests/schema-validation.test.ts` — cover generated JSON schemas / activity schema. `bundleTechniques` schema (`src/schema/activity.schema.ts` L14–17, L282) is UNCHANGED in shape (maxChars kept), so no schema-file break expected; verify after.

---

## 3. Schema files

| File | Impact | Risk |
|------|--------|------|
| `src/schema/activity.schema.ts` (`BundleTechniquesSchema`, L14–17; `bundleTechniques` field L282) | **No structural change** — `maxChars` stays as an explicit override. The *semantics* shift (now an override on the derived ceiling, not the sole trigger); update the `.describe()` prose to match. | LOW |
| `schemas/activity.schema.json` (generated) | Regenerate only if the `.describe()` text is treated as contract; run `scripts/generate-schemas.ts`. | LOW |
| **Tool param schemas** | `context_tokens` is an MCP *tool* param (declared inline via zod in `workflow-tools.ts`), NOT a JSON-schema file under `schemas/`. No `schemas/*.json` file gains the param. | — |

**No new schema file, no session-schema change.** Confirmed `src/schema/session.schema.ts` needs no `context_tokens` field (per-call only).

---

## 4. Docs / resources to edit

### C1a/b — adoption guidance

| File | Edit |
|------|------|
| `docs/ide-setup.md` | Add `context_mode: "persistent"` + canonical `agent_id` guidance; document the new REQUIRED `context_tokens` on `get_activity`. (Bootstrap sequence at L22 lists the tool chain.) |
| `workflows/meta/resources/bootstrap-protocol.md` | `context_mode` already documented (L21, step 2). `get_workflow` step (L23) is **UNCHANGED w.r.t. `context_tokens`**. Add/clarify canonical `agent_id` steer for solo mode only. |

### C1c/d/e + C6 — required-param docs, full:true surfacing, worker-prompt carve-out, drift fixes

| File | Edit | Item |
|------|------|------|
| `docs/api-reference.md` | `get_activity` row (**L30**) gains `context_tokens` (required) in its params column + prose. | C1c |
| `docs/api-reference.md` | Enforcement Boundary (**L116**) — remove "variable types and defaults" from the *agent-interpreted (never checked by server)* class; per B7, `defaultValue` is server-seeded (`variables_seeded`) and `type` is warn-only validated on `setVariable` (see `respond_checkpoint` row L34). | C6 |
| `docs/api-reference.md` | `get_technique { full: true }` reference opt-in already documented (rows L42, L204, L208); confirm surfaced — docs-only. Update the unchanged-marker prose (L206 bundle `{ unchanged: true, content_hash }`, L207 `get_technique` `delivery: unchanged`) to the SINGLE unified shape (R14). | C1d + R14 |
| `schemas/README.md` | Remove/correct the two stale activity `artifacts` rows at **L581** and **L1208** (B4 removed authored activity `artifacts[]` — now synthesized from technique `## Outputs`, see `composeActivityArtifacts` in `workflow-tools.ts` L529). | C6 |
| `workflows/meta/resources/activity-worker-prompt.md` | Amend the progressive-disclosure mandate (**L21**: "one per step … never all at once") to CARVE OUT inline bundled `step_techniques` (no `get_technique` fetch needed for bundled entries). Reconcile bundle-shape wording with the real `step_techniques` delivery. **No new rule** (RR-4). | C1e + C6 |

**Reference-delivery / bundling narrative docs to reconcile with R14 shape:** `docs/api-reference.md` §Reference Delivery (L202–209) and §Hybrid Technique Bundling (L213–217) both name the current marker shapes — update to the unified shape.

---

## 5. Guards / lints touching these areas

| Guard | File | Relevance |
|-------|------|-----------|
| Site-links check | `scripts/check-site-links.ts`, `tests/site.test.ts` | Runs over `docs/` — re-run after doc edits (anchor/link integrity). LOW |
| Resource anchors | `scripts/check-resource-anchors.ts`, `tests/resource-anchors.test.ts` | Validates resource refs in meta resources — re-run after `activity-worker-prompt.md` / `bootstrap-protocol.md` edits. LOW |
| Generated schemas | `scripts/generate-schemas.ts`, `tests/generated-schemas.test.ts` | Re-run if activity-schema `.describe()` regenerated. LOW |
| Binding fidelity | `scripts/check-binding-fidelity.ts` + `binding-fidelity-baseline.json` | Corpus-level; corpus YAML is NOT edited (bundling edits dropped), so baseline should be stable — verify no drift. LOW |
| Smoke harness | `scripts/smoke/*` (`smoke-orchestrator.ts` L171, `worker-brief.md` L19) | Must pass `context_tokens` on `get_activity`; worker brief prose should mention it. MEDIUM (runtime break) |

No `check:*` guard directly validates the marker shape or the `context_tokens` param; the coverage is via the unit tests in §2.

---

## 6. Integrity check (transition-chain / reference)

Not a workflow-YAML edit — no `workflow-design` activity added/removed/reordered, no new checkpoint, no new workflow variable (RR-5, audit-validated). **Transition-chain integrity: intact / N/A.** **Reference integrity:** the meta-resource refs (`bootstrap-protocol`, `activity-worker-prompt`) are edited in place, not renamed — no orphaned references introduced. The `technique:<id>` delivery-ledger key is SHARED between the bundle path (`workflow-tools.ts` L484) and `get_technique` (`resource-tools.ts` L631); the R14 unification must preserve this shared key so persistent-context refetches still collapse correctly across both paths — **flag as an integrity constraint for scope-and-draft.**

---

## 7. Content being REMOVED (flag for explicit confirmation)

| Removal | Where | Intentional? |
|---------|-------|--------------|
| One of the two unchanged-marker shapes (whichever is not chosen as canonical) | `delivery.ts` `unchangedMarker` OR `resource-tools.ts` stub | Yes — R14 unification (RR-2 Corrected → UNIFY). Confirm the chosen canonical shape + back-compat stance (deferred impl detail). |
| The per-activity `bundleTechniques`-as-sole-trigger behaviour | `workflow-tools.ts` L449 guard | Yes — replaced by corpus-wide auto-bundling; `maxChars` retained as override. Confirm `0`-opt-out semantics. |
| Two stale `artifacts` rows | `schemas/README.md` L581, L1208 | Yes — B4 drift fix (C6). |
| "variable types and defaults" from agent-interpreted class | `docs/api-reference.md` L116 | Yes — B7 drift fix (C6); moved to server-seeded/warn-only, not deleted outright. |
| Worker-prompt "never all at once" absolutism for bundled techniques | `activity-worker-prompt.md` L21 | Yes — carve-out amendment (C1e/RR-4), not a rule deletion. |

No incidental/unintended removals detected. The `hybrid-bundling.test.ts` L302 assertion ("no `bundleTechniques` → no `step_techniques`") is EFFECTIVELY removed/inverted by corpus-wide bundling — flag as a test-behaviour change, not silent breakage.

---

## 8. Risk summary

| Risk | Items |
|------|-------|
| **CRITICAL** | `context_tokens` becomes REQUIRED on `get_activity` — breaking API change; server version bump (`SERVER_VERSION` default is `1.0.0` in `src/config.ts` L97 → `2.0.0`). Every `get_activity` caller (11 in `mcp-server.test.ts`, 6 in `reference-delivery.test.ts`, 2 in `hybrid-bundling.test.ts`, `walker.ts`, `smoke-orchestrator.ts`) breaks until updated. |
| **HIGH** | (1) Bundle-ceiling derivation logic change in `workflow-tools.ts` L436–501 (corpus-wide, ceiling from `context_tokens`). (2) R14 marker-shape unification — wire-contract change consumed by agents + `reference-delivery.test.ts` / `hybrid-bundling.test.ts` / `fetch-observability.test.ts`. |
| **MEDIUM** | Smoke harness + worker-brief runtime break; bundle-note prose reconciliation; shared `technique:<id>` ledger key must survive unification. |
| **LOW** | Activity-schema `.describe()` prose; doc-drift edits (C6); guard re-runs (site-links, resource-anchors, generated-schemas, binding-fidelity — no baseline change expected). |

**e2e definition snapshot (`snapshot.test.ts.snap`)** is NOT expected to break (it snapshots definitions, not live tool output, and corpus YAML is unedited) — re-run to confirm, do not pre-emptively re-baseline.
