# Cluster 3 — Delivery Ledger — Design Spec (C2 + C12)

> #189 · updated 2026-07-12 · server-only, additive, target semver **minor**. Implementation ships as a separate server PR.

## 1. Goals & motivation

After #166 B1 (whole-payload reference delivery) shipped, the largest remaining repetition moved *down a level*:

- **C2 (R2, ▲ high):** inside composed `get_technique` payloads, the `inherited_inputs` / `inherited_outputs` (the shared workflow **contract**) and `rules` blocks are identical across most techniques of a workflow, but the whole-payload hash (`technique:<id>`) always differs on the technique-specific core, so these blocks re-deliver every fetch — ≈131k chars/walk (~25% of technique delivery). Measured headroom: **~+13% of a work-package walk** under persistent mode, on top of B1's 27%.
- **C12 (R12, ○ low):** `get_workflow`'s orchestrator ops bundle (55.1k wp / 32.9k ponytail) is always full, outside the ledger, re-paid on every resume.

**Design principle:** extend the existing B1 mechanism to a finer granularity; no new architecture, no schema change, opt-in with a full-content escape. Default (fresh) sessions and dispatched workers are byte-for-byte unchanged.

## 2. C2 — block-level delivery ledger

### 2.1 What is a "block"

A composed technique object (built by `composeLoaded`, `src/loaders/technique-loader.ts:548-554`) carries these discrete fields:

| Field | Origin | Shared? | Dedup-eligible |
|-------|--------|---------|:---:|
| `id`, `version`, `capability`, `provenance_note` | technique-specific | no | — |
| `inputs` (own), `outputs` (own) | technique-specific | no | — |
| `protocol` (own + ancestor Initial/Final wrap, renumbered) | technique-specific | no | — |
| **`inherited_inputs`** (`{note, items}`) | workflow-root contract | **yes** — identical across the contract scope | ✅ |
| **`inherited_outputs`** (`{note, items}`) | workflow-root contract | **yes** | ✅ |
| **`rules`** (merged ancestor + own) | mostly contract | **mostly** — identical when the technique adds no own rules | ✅ |

The three eligible blocks are exactly R2's "inherited-contract and rules blocks."

### 2.2 Keying — content-keyed, channel-isolated (DP-2)

Each eligible block is hashed independently over its stable projection and keyed by **content** (not by workflow id, refining the eval report's `contract:<workflowId>` sketch):

```
technique:inherited_inputs:<hash>
technique:inherited_outputs:<hash>
technique:rules:<hash>
```

- **Content-keyed** so a contract change or a per-step `source:` annotation on `inherited_inputs` (added by `binding-provenance`) auto-invalidates — an annotated block simply has a different hash and is delivered full. No staleness, matching the existing content-keyed `bundle:rules:<hash>` / `activity_rules:<hash>` blocks.
- **`technique:` namespace prefix** keeps these keys in the same delivery channel as the whole-technique key (`technique:<id>`) and get_activity's eager step-technique bundling — honouring `delivery.ts`'s invariant that channels never cross-reference. A block marker only ever points at content this channel delivered in full earlier.

### 2.3 Layering with the whole-technique key (DP-5)

Delivery is a two-tier decision, cheapest first:

1. Compute the whole-technique hash on the **full, pre-marker** projected text (unchanged from today) and record it under `technique:<id>` regardless of outcome.
2. If reference delivery is active **and** the whole hash is already in the ledger → emit the existing whole-technique unchanged-marker (cheapest path; a re-fetch of the *same* technique). Done.
3. Otherwise (a not-yet-seen technique) → project with per-block markers: each eligible block whose hash is already delivered collapses to a marker; the rest deliver full and are recorded.

So block dedup captures the *new-technique-but-shared-contract-already-delivered* case that whole-payload hashing structurally cannot.

### 2.4 Wire format

Block markers reuse the one canonical `unchangedMarker` shape (`delivery.ts:52`), placed at the block position (DP-4):

```yaml
id: elicitation
version: 2.0.0
capability: Elicit a single design dimension …
inputs:
  - id: current_dimension
    source: bound by loop 'dimension-elicitation-loop'
inherited_inputs:            # ← collapsed: already delivered by an earlier technique this session
  delivery: unchanged
  content_hash: a1b2c3d4e5f60718
protocol:
  - title: Elicit One Dimension
    steps: [ … ]             # full — technique-specific
inherited_outputs:           # ← collapsed
  delivery: unchanged
  content_hash: 90ab...
rules:                       # ← collapsed (this technique adds no own rules)
  delivery: unchanged
  content_hash: cc68b9a6...
```

The agent already reuses `{ delivery: unchanged, content_hash }` from context for whole-technique/bundle markers; block-position markers are the same contract at finer granularity. A one-line addition to the `get_technique` / `get_activity` `bundle_note` states that blocks can now be markers.

### 2.5 Semantics & escape (DP-3)

- Active only when reference delivery is on: `contextMode: "persistent"` or per-call `bundle: "reference"` (get_activity). For `get_technique`, the existing `full: true` gate governs — when `full: true`, no whole-marker and no block markers (everything full).
- `full: true` (get_technique) / `bundle: "full"` (get_activity) re-delivers the whole technique with every block full — the B1 recovery path for a context that summarized an earlier block away.
- Default/fresh sessions and dispatched workers: never markered (`referenceMode` false).

### 2.6 Implementation points

**New helper — `src/utils/delivery.ts`:** operates on the **projected ordered record** (`projectTechnique`'s `Record<string,unknown>` output) — not the typed `Technique` — so substituting a marker for a typed `{note,items}` / rules block carries no TS friction, and it reuses the exact shape get_activity already spreads (`{ marker, ...projectTechnique(technique) }`, `workflow-tools.ts:685`). Block hashes are computed over the same per-block projection the reader will hash, so they match across techniques.

```ts
const DEDUP_BLOCKS = ['inherited_inputs', 'inherited_outputs', 'rules'] as const;

/**
 * Replace dedup-eligible blocks of a PROJECTED technique record with
 * unchanged-markers when their per-block content hash is already delivered.
 * Delivery-time only: runs AFTER projectTechnique (and after compose/validate),
 * so neither the schema nor projectTechnique's typed input ever sees a marker.
 * Accumulates newly-delivered block hashes into `newDeliveries`.
 */
export function dedupTechniqueBlocks(
  projected: Record<string, unknown>,       // projectTechnique(technique)
  state: SessionFile,
  newDeliveries: Record<string, string>,
): Record<string, unknown> {
  const out = { ...projected };
  for (const block of DEDUP_BLOCKS) {
    if (out[block] === undefined) continue;
    const hash = contentHash(stringifyForResponse({ [block]: out[block] }));
    const key = `technique:${block}:${hash}`;
    if (deliveredHash(state, key) === hash || newDeliveries[key] === hash) {
      out[block] = unchangedMarker(hash);
    } else {
      newDeliveries[key] = hash;
    }
  }
  return out;
}
```

**`get_technique` — `src/tools/resource-tools.ts` (~605-666):** after provenance decoration (line 601), compute `ordered = projectTechnique(technique)`; the whole-technique hash is `contentHash(stringifyForResponse(ordered))` (the pre-marker full text, unchanged from today) and the whole-technique collapse (640) stays. On the full-delivery branch, when `contextMode==='persistent' && full!==true`, run `dedupTechniqueBlocks(ordered, …)`, stringify the result, and record `{ [ledgerKey]: hash, ...blockDeliveries }`. When `full===true` or fresh mode, stringify `ordered` untouched. (This replaces the single `projectTechniqueToYaml(technique)` call at line 605 with the project → maybe-dedup → stringify split.)

**`get_activity` eager bundling — `src/tools/workflow-tools.ts` (~588-696):** each eager-bundled step technique is already spread as `{ marker, ...projectTechnique(technique) }` (line 685); run `dedupTechniqueBlocks` on that `projectTechnique(technique)` record before the spread (DP-6) — one helper, both paths. Merge block hashes into the existing `newDeliveries`.

**No change:** `technique.schema.ts` (markerize after `safeValidateTechnique`), `session.schema.ts` (`deliveredContent` just gains keys), `state.schema.ts` (no new events), `serialization.ts` (ordered serialization already handles marker objects — confirm block keys are in the ordering list).

## 3. C12 — get_workflow slimming

`get_workflow` (`src/tools/workflow-tools.ts:283-348`) touches the ledger not at all. Bring the orchestrator ops bundle in, under persistent mode only:

```ts
const opsText = stringifyForResponse(formatTechniqueBundle(resolved));
let opsBlock = opsText;
if (state.contextMode === 'persistent') {
  const h = contentHash(opsText);
  const key = `workflow_bundle:${h}`;                 // content-keyed, own channel
  if (deliveredHash(state, key) === h) {
    opsBlock = stringifyForResponse({ ...unchangedMarker(h),
      note: 'Orchestrator ops bundle unchanged — reuse from context.' });
  } else {
    newDeliveries[key] = h;                           // record + advanceSession
  }
}
// text = `${opsBlock}\n\n---\n\n${summaryData}`
```

- **Single whole-bundle key** (`workflow_bundle:<hash>`), content-keyed, in its own channel (DP-7). Minimal, matched to the ○-low, resume-only win. Per-technique reuse of `bundle:<ref>` (extra solo-mode cross-dedup) is deliberately **not** done — it would couple the get_workflow and get_activity channels, breaking the channel-isolation invariant.
- **Gate:** persistent mode only, so fresh sessions pay nothing. The epic's "only if resume traffic justifies" is satisfied structurally — it is free when unused. The open empirical question (does resume traffic exist to benefit?) is a **validation note**, not a blocker (DP-8).
- The post-`---` workflow summary/metadata stays full (small, and structurally load-bearing).

## 4. Test plan / re-baseline (DP-9)

- **`tests/reference-delivery.test.ts`** (extend):
  - Block-marker emission: a persistent-mode technique fetch whose contract/rules blocks were delivered by an earlier technique returns those blocks as markers, core full.
  - Cross-technique contract dedup: fetch technique A (all full), then technique B (shared blocks → markers, B's own core full).
  - `full: true` re-delivers all blocks full even when block-delivered.
  - Fresh mode: never markers blocks.
  - C12: `get_workflow` collapses the ops bundle on a second (resume) call in persistent mode; full in fresh mode.
- **`tests/binding-fidelity.test.ts` / `tests/binding-provenance.test.ts`:** snapshots **structurally unchanged** — block markerization is delivery-time, after composition + annotation (mirrors cluster 2).
- **Regression:** existing whole-technique and bundle dedup cases stay green (layering must not perturb the cheapest path).

## 5. Docs (ride the impl PR)

- `src/utils/delivery.ts` header: document the new block key namespaces (`technique:<block>:<hash>`, `workflow_bundle:<hash>`) and content-keying rationale; refresh the stale `bundle:rules` line to `bundle:rules:<hash>` while there (small, in-scope).
- `docs/api-reference.md`: block-level delivery + C12 note.
- `get_technique` / `get_activity` tool descriptions + `bundle_note`: state that inherited-contract/rules blocks can be delivered as markers.

## 6. Risks & back-compat

- **Risk: LOW** (matches the epic). Additive; no schema/session-model change; same failure mode as B1 (context eviction → `full` escape).
- **Old-client / new-server (persistent solo agent):** receives block-position markers — same canonical marker contract, finer granularity; the `bundle_note` update tells it blocks can be markers.
- **New-client / old-server:** client sends nothing new; no effect.
- **Interaction with binding-provenance:** annotated `inherited_inputs` variants carry different hashes and deliver full — correct, no false dedup.

## 7. Rollout

Single server PR, additive, semver **minor**. Sequence: `delivery.ts` helper + tests → wire into `get_technique` → wire into `get_activity` eager bundle → C12 in `get_workflow` → re-baseline `reference-delivery.test.ts` → docs. Optional: an instrumented persistent-mode work-package re-walk to confirm the projected ~+13% (C2) and quantify C12's resume delta.

## 8. Open items for the design-approval gate

All design judgements are resolved (see [03-assumptions-log.md](03-assumptions-log.md)); the two worth an explicit nod:

1. **C2 block set = contract + rules only** (not protocol/core). Protocol is technique-specific and its ancestor-wrap is interleaved — low shared value, high isolation cost.
2. **C12 kept minimal** (single whole-bundle key, persistent-gated) rather than the more aggressive per-technique cross-channel reuse.
