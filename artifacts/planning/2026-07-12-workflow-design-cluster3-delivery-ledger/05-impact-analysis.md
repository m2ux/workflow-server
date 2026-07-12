# Impact Analysis — Cluster 3 (C2 + C12)

> #189 · updated 2026-07-12. Server-only, additive. Adapts the workflow impact-analysis technique to a server-module blast-radius map.

## Change classes

- **C2** — extend reference-not-repeat delivery to the **block level** inside a composed technique payload (the `inherited_inputs` / `inherited_outputs` / `rules` blocks), in the `get_technique` path and get_activity's eager step-technique bundling path.
- **C12** — bring `get_workflow`'s orchestrator ops bundle **into the ledger** under persistent mode.

Both are additive and gated on reference delivery (`contextMode: persistent` or per-call `bundle:reference`); default/fresh sessions and dispatched workers are byte-for-byte unchanged.

## File / module impact

| File | Impact | What changes |
|------|--------|--------------|
| `src/utils/delivery.ts` | **Directly modified** | Add a block-dedup helper — given the composed technique **object**, the ledger, and referenceMode, replace each dedup-eligible block field (`inherited_inputs`, `inherited_outputs`, `rules`) with `unchangedMarker(hash)` when its per-block hash is already in the ledger, and return `{ object, newDeliveries }`. Add block key-namespace constants + doc. Also a small ops-bundle dedup helper for C12. |
| `src/tools/resource-tools.ts` (`get_technique`, ~586-671) | **Directly modified** | After compose + provenance decoration (line 601) and BEFORE the whole-technique hash (638): in referenceMode, run block-dedup on the composed object, then project. Record block hashes alongside the whole-technique key. Whole-technique exact-refetch collapse (640) stays as the cheapest path and layers above block dedup (DP-5). |
| `src/tools/workflow-tools.ts` (`get_activity` eager bundling, ~588-696) | **Directly modified** | Apply the same block-dedup to each eager-bundled step technique's composed object before projection (DP-6) — one implementation, both paths benefit. |
| `src/tools/workflow-tools.ts` (`get_workflow`, ~283-348) | **Directly modified (C12)** | In persistent mode, hash the composed ops bundle; if `workflow_bundle:<hash>` is in the ledger, emit a marker in place of the ops section; else deliver full and record. Whole-bundle single key (DP-7). |
| `src/loaders/technique-loader.ts` (`composeLoaded` ~548-554, projection) | **Verified-intact / minor** | Block fields are already discrete on the composed object; block-dedup operates on that object post-`safeValidateTechnique` (556). Projection (`projectTechniqueToYaml`) serializes marker objects unchanged. No composition-logic change; possibly export a block-field accessor for the helper. |
| `src/utils/serialization.ts` (`stringifyForResponse`) | **Verified-intact** | Markers are plain objects; ordered serialization already handles nested objects at block positions. Confirm block keys are in the key-order list. |
| `src/schema/technique.schema.ts` | **Verified-intact — NO change** | Markerization is delivery-time, AFTER `safeValidateTechnique`. The schema never sees a marker in a block position; the marker lives only in wire text, never re-parsed. |
| `src/schema/session.schema.ts` (`deliveredContent`) | **Verified-intact — NO change** | Ledger stays `Record<agentId, Record<key, hash>>`; C2/C12 only add more keys. |
| `src/schema/state.schema.ts` (history events) | **Verified-intact — NO change** | No new event types; `technique_fetched` / `technique_bundled` unchanged. |

## Integrity checks (adapted from the technique)

- **Delivery-channel integrity.** New block keys stay in the technique/eager-bundle channel (candidate namespaces `technique:contract_in:<hash>`, `technique:contract_out:<hash>`, `technique:rules:<hash>`; C12 uses `workflow_bundle:<hash>`). They do NOT cross-reference the get_activity `bundle:*` channel — honouring `delivery.ts`'s channel-isolation invariant. A marker only ever points at content the same channel delivered in full earlier.
- **Whole-vs-block layering.** Whole-technique key `technique:<id>` is hashed on the FULL (pre-marker) projected text and recorded regardless of block outcome, so a future exact refetch still collapses whole. Block markers fire only on the full-delivery path.
- **Content-key correctness (DP-2).** Blocks are content-keyed by hash, so per-step `source:` annotation variance on `inherited_inputs` and any contract change auto-invalidate (annotated → different hash → delivered full). No staleness.
- **Escape hatch.** `full: true` (get_technique) / `bundle: "full"` (get_activity) re-delivers the whole technique with all blocks full — the same B1 recovery path; covers the "block delivered earlier, later summarized out of context" case.

## Removals

**None.** C2/C12 are additive. The `preservation-confirmed` gate has nothing to confirm.

## Blast radius & back-compat

- **Default/fresh sessions & dispatched workers:** zero behavioural change (block dedup is referenceMode-only; `workers-need-full-delivery` holds).
- **Old-client / new-server (persistent solo agent):** receives block-position markers. Same canonical `{ delivery: "unchanged", content_hash }` contract the agent already honours for whole-technique/bundle markers — now at finer granularity. Needs a one-line `bundle_note`/tool-description update telling the agent blocks can be markers; behaviourally low-risk.
- **New-client / old-server:** client sends nothing new; no effect.
- **Risk:** LOW (matches the epic). Same failure mode as existing B1 dedup (context eviction → `full` escape). No schema/session-model change.

## Test / baseline surface

- `tests/reference-delivery.test.ts` — add block-marker expectations; a cross-technique contract-dedup case (technique B's shared blocks collapse after technique A delivered them); a C12 resume-collapse case; old/new transition cases.
- `tests/binding-fidelity.test.ts`, `tests/binding-provenance.test.ts` — expect **structurally unchanged** snapshots (markerization is post-composition/post-annotation), mirroring cluster 2.
- Docs (ride the impl PR, not this design): `delivery.ts` header, api-reference block-key/semantics note, `get_technique`/`get_activity` tool-description mention of block dedup.
