# Delivery Ledger — Reference-not-repeat delivery subsystem

Work package: cluster 3 delivery ledger (#189) · activity codebase-comprehension · 2026-07-12

Covers the server's **reference-not-repeat delivery** mechanism (`delivery.ts` + its two consumer tools) — the subsystem the cluster-3 work package extends to **block-level** dedup and to `get_workflow`. Reference codebase: `workflow-server` (worktree `feat/189-cluster3-delivery-ledger`). GitNexus-indexed.

Related comprehension: [utils-layer.md](utils-layer.md) (utils overview — does not yet cover `delivery.ts`), [state-tools.md](state-tools.md) (session ledger sizing note), [work-package-workflow-content.md](work-package-workflow-content.md).

## Architecture Overview

The delivery ledger is a thin, four-function utility (`src/utils/delivery.ts`, 54 lines) plus per-consumer wiring in the two tools that emit composed technique/bundle payloads. It exists to stop re-sending byte-identical content to a long-lived (`persistent`) agent context that already holds it.

**Layered position:** utility layer (`src/utils/`) consumed by the tool layer (`src/tools/`), reading/writing session state (`src/schema/session.schema.ts`) through the session store. No new architecture is introduced by this subsystem — it is a cross-cutting concern threaded into existing tool handlers.

Module boundaries and responsibilities:

| Unit | File | Responsibility |
|------|------|----------------|
| Ledger primitives | `src/utils/delivery.ts` | `contentHash`, `deliveredHash`, `recordDeliveries`, `unchangedMarker` — hash, look up, record, and marker-shape. Channel-key namespacing is documented in the file header. |
| Technique projection | `src/loaders/technique-loader.ts` | `projectTechnique` (ordered record), `projectTechniqueToYaml` (= `stringifyForResponse(projectTechnique(...))`), `formatTechniqueBundle`, `composeLoaded` (contract composition). |
| `get_technique` | `src/tools/resource-tools.ts` (~601–670) | Composes one technique, decorates provenance, then whole-technique dedup under `technique:<id>`. |
| `get_activity` | `src/tools/workflow-tools.ts` (~543–780) | Worker bundle: per-technique dedup (`bundle:<ref>`), rules dedup (`bundle:rules:<hash>`), eager step-technique inlining (`technique:<id>`), inherited worker-rules dedup (`activity_rules`). |
| `get_workflow` | `src/tools/workflow-tools.ts` (~283–350) | Orchestrator ops bundle — **currently outside the ledger** (the C12 target). |
| Session state | `src/schema/session.schema.ts:156,186` | `deliveredContent?: Record<agentId, Record<key, hash>>`. |
| Serialization | `src/utils/serialization.ts` (18 lines) | `stringifyForResponse` = `yaml.stringify(v, {lineWidth:0})`; **insertion-order** key emission, no explicit ordering list. |
| Tests | `tests/reference-delivery.test.ts` (716 lines) | Helpers `isUnchangedMarker`, `splitActivityResponse`; persistent-mode, cross-activity, `full`-escape, on-disk-ledger, per-agent cases. |

**Overarching pattern:** content-addressed caching with an explicit per-recipient ledger. The "cache" is the receiving agent's own conversation context; the ledger records what was last delivered *in full* so the next delivery can be replaced by a marker. It is a delivery-time transform layered *after* composition and validation — the schema and the typed `Technique` object never see a marker.

## Key Abstractions

- **Content key + channel namespace.** Every dedupable payload is keyed by a string namespaced to its delivery channel so the two composition paths never cross-reference. Existing channels (documented in `delivery.ts` header): `bundle:<technique-ref>`, `bundle:rules` (actually emitted as `bundle:rules:<hash>`, content-keyed — the header line is stale), `activity_rules`, `technique:<id>`. **Invariant:** a marker only ever points at content *this same channel* delivered in full earlier.
- **Content-keyed vs. id-keyed.** `technique:<id>` and `bundle:<ref>` are id-keyed (last-delivered-hash-wins). `bundle:rules:<hash>` is content-keyed (set semantics — *any* previously delivered set collapses). Content-keying auto-invalidates on any content change: a changed payload simply has a different hash and delivers full. The cluster-3 block keys (`technique:<block>:<hash>`) and C12's `workflow_bundle:<hash>` are content-keyed for the same reason.
- **`unchangedMarker(hash)` → `{ delivery: 'unchanged', content_hash }`** (`delivery.ts:52`). The single canonical marker shape, emitted identically by every path. Consumers may attach sibling context (`get_technique` adds `id` + a `note`; the eager bundle adds `marker: "▼ STEP …"`).
- **`referenceMode` gate.** Dedup is active only when reference delivery is on: `state.contextMode === 'persistent'`, or per-call `bundle: 'reference'` (get_activity). `get_activity` computes `referenceMode` at `workflow-tools.ts:543`; `get_technique` inlines the equivalent (`contextMode === 'persistent' && full !== true`). Fresh/default sessions and dispatched workers are never markered → byte-for-byte unchanged.
- **Escape hatch.** `get_technique { full: true }` / `get_activity { bundle: 'full' }` force full re-delivery — the recovery path when a context has summarized an earlier delivery away.
- **`newDeliveries` accumulator + `recordDeliveries` mutator.** get_activity threads a single `newDeliveries: Record<key,hash>` map through all its dedup sites, then commits it in one `advanceSession(reloaded.state, draft => recordDeliveries(draft, agentId, newDeliveries))` at `workflow-tools.ts:775`. get_technique records its single key inline. The ledger merges per-agent (`recordDeliveries`).

## Design Rationale (hypotheses)

- **Why a projected-record helper, not a typed transform.** `projectTechnique` returns `Record<string,unknown>` with `inherited_inputs`/`inherited_outputs`/`rules` as discrete top-level keys at canonical positions. Operating the proposed `dedupTechniqueBlocks` on that record (not the typed `Technique`) means substituting a marker for a typed `{note,items}`/rules block carries no TypeScript friction, and it reuses the exact shape get_activity already spreads (`{ marker, ...projectTechnique(technique) }`). Trade-off: the helper depends on `projectTechnique`'s key names, so a rename of those keys would need to touch the `DEDUP_BLOCKS` constant too.
- **Why block dedup is delivery-time, after compose + provenance decoration.** Composition (`composeLoaded`) merges the contract; `decorateTechniqueProvenance` annotates per-step `source:`/`destination:` lines. Running dedup only on the final projected text means an annotated `inherited_inputs` variant hashes differently and correctly delivers full — no false dedup against an un-annotated variant. This is why binding-fidelity/binding-provenance snapshots stay structurally unchanged (markerization is invisible to composition).
- **Why two-tier layering (whole-technique first, then blocks).** Cheapest-first: a re-fetch of the *same* technique collapses wholesale under `technique:<id>` (one hash compare). Only a *not-yet-seen* technique whose shared contract was already delivered by a *sibling* technique needs per-block markers — the case whole-payload hashing structurally cannot catch (the technique-specific core always changes the whole hash).
- **Why content-keying for blocks.** Matches the existing `bundle:rules:<hash>` precedent and gives automatic staleness-freedom under provenance annotation. Sacrifices the (marginal) id-keyed "last wins" compactness for correctness.
- **Why C12 stays minimal (single `workflow_bundle:<hash>`).** Per-technique cross-channel reuse of `bundle:<ref>` would couple the get_workflow and get_activity channels, breaking the channel-isolation invariant. The ○-low, resume-only win doesn't justify that coupling. It is free when unused (persistent-gated).

## Domain Glossary

| Term | Technical construct |
|------|---------------------|
| Reference-not-repeat delivery | The whole subsystem: `delivery.ts` + consumer wiring. |
| Ledger | `session.deliveredContent[agentId]` — content-key → last-delivered-hash map. |
| Channel | A key namespace (`bundle:*`, `technique:*`, `activity_rules`, and the new `workflow_bundle:*`) whose markers only reference content delivered in that same channel. |
| Marker / unchanged-reference | `{ delivery: 'unchanged', content_hash }` substituted for known content. |
| Reference mode | Dedup-active state (`contextMode: 'persistent'` or per-call `bundle: 'reference'`). |
| Block (this WP) | One dedup-eligible field of a projected technique: `inherited_inputs`, `inherited_outputs`, `rules`. |
| Contract | The workflow-root `TECHNIQUE.md` inherited inputs/outputs + rules shared across a workflow's techniques — the source of the shared blocks. |
| Whole-technique key | `technique:<id>` — the id-keyed whole-payload hash. |

## Deep-Dive: data-flow traces

### get_technique delivery path (`resource-tools.ts` ~601–670)

1. Compose + optionally `decorateTechniqueProvenance` (line ~601).
2. `const text = projectTechniqueToYaml(technique)` (**line ~605**) — the single project→stringify call the WP splits into project → maybe-dedup → stringify.
3. `ledgerKey = 'technique:' + techniqueId`; `hash = contentHash(text)`.
4. **Whole-marker branch** (`contextMode === 'persistent' && full !== true && deliveredHash === hash`): advance session, record fetch, return `{ id, ...unchangedMarker(hash), note }`. (Stays as-is.)
5. **Full-delivery branch:** `recordDeliveries(draft, agentId, { [ledgerKey]: hash })`, return full `text`. **← block dedup hooks here:** compute `ordered = projectTechnique(technique)`, whole-hash on `stringifyForResponse(ordered)` (pre-marker), and when persistent && !full run `dedupTechniqueBlocks(ordered, state, blockDeliveries)`, stringify the result, and record `{ [ledgerKey]: hash, ...blockDeliveries }`.

### get_activity eager-bundle path (`workflow-tools.ts` ~543–780)

1. `referenceMode` (543). `newDeliveries` accumulator threaded throughout.
2. Per-technique bundle dedup (**~565–572**): `bundle:<key>` id-keyed. Rules dedup (**~578–586**): `bundle:rules:<hash>` content-keyed. *(This is the "existing per-block bundle dedup at 565-579" anchor.)*
3. Eager step-technique inlining (~600–695): for each ungated step, compose + decorate, `text = projectTechniqueToYaml(technique)`, `ledgerKey = technique:<techniqueId>`; if already-delivered → `{ marker, ...unchangedMarker(hash) }`; else budget-check, `newDeliveries[ledgerKey]=hash`, `bundledStepTechniques[step.id] = { marker, ...projectTechnique(technique) }` (**line ~685**). **← block dedup hooks here:** run `dedupTechniqueBlocks` on that `projectTechnique(technique)` record before the spread, merge block hashes into `newDeliveries`.
4. Inherited worker-rules dedup (~761): `activity_rules`. Commit: `recordDeliveries(draft, agentId, newDeliveries)` at **775**.

**Budget subtlety:** eager-bundle budget accounting measures `projectTechniqueToYaml(technique).length` (full, pre-marker) at ~666. Block markers shrink the *emitted* payload but the spec keeps budget draw on full text — a stop-and-break document-order prefix. Block dedup therefore reduces bytes-on-wire without changing which steps get inlined. (Consistent, but worth noting: the win is not reflected in the budget calculation.)

### get_workflow ops bundle (`workflow-tools.ts` ~283–350) — C12 target

- `const opsBlock = stringifyForResponse(formatTechniqueBundle(resolvedOrchestrator))` (**line ~308**). Never touches the ledger today.
- **Ordering gap vs. spec snippet:** `get_workflow` calls `advanceSession(state)` with **no mutator at line 299**, *before* `opsBlock` is built at 308. C12 must decide the marker (build `opsBlock`, content-hash, look up/record `workflow_bundle:<hash>`) and fold the `recordDeliveries` into a mutator — i.e. move/augment the `advanceSession` call so the new ledger key is committed. The spec's inline `newDeliveries[key]=h; // record + advanceSession` comment assumes this reordering; the current single-arg `advanceSession` at 299 does not carry it. **This is the main non-trivial wiring point of C12.**
- `referenceMode` is not computed in `get_workflow`; C12 uses `state.contextMode === 'persistent'` directly (matches spec).

## Confirmed "no change" points (spec §2.6)

- `session.schema.ts`: `deliveredContent` is `Record<record<string>>` — new keys need no schema change. ✅
- `serialization.ts`: insertion-order emission, **no ordering list exists** — so the spec's "confirm block keys are in the ordering list" is moot; marker substitution at a block position in `projectTechnique`'s ordered record preserves position automatically. ✅ (minor spec-phrasing correction)
- `technique.schema.ts`: markerization runs after `safeValidateTechnique` (in `composeLoaded`), so the schema never sees a marker. ✅

## Blast radius (GitNexus impact)

- `projectTechnique` upstream impact = **CRITICAL** (shared primitive; direct callers `projectTechniqueToYaml` + get_activity in `registerWorkflowTools`; 8 processes). The design deliberately **does not modify** `projectTechnique` — `dedupTechniqueBlocks` is a *new* helper operating on its *output record* at delivery time, so the CRITICAL blast radius is avoided. All changes are additive: one new `delivery.ts` export + call-site edits in the two tool handlers.

## Lens findings (pedagogy + rejected-paths)

Portfolio analysis of the design spec — full findings in [portfolio-delivery-ledger-synthesis.md](portfolio-delivery-ledger-synthesis.md) ([pedagogy](portfolio-delivery-ledger-pedagogy.md), [rejected-paths](portfolio-delivery-ledger-rejected-paths.md)). Both lenses converge on one seam: **determinism of delivery inputs is the load-bearing invariant and a precondition, not a structural guarantee** — block dedup is correct only because the hashed projection is deterministic and every varying input (incl. provenance annotations) is inside the hash, and nothing enforces this for *future* `projectTechnique` fields. Unique to rejected-paths: the existing `reference-delivery.test.ts` shape-assertions are the guardrail against a tempting state-dependent-bundling regression (see Q6).

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| 1 | Where exactly does block dedup hook into `get_technique`? | Resolved | Full-delivery branch (~658–668), after the whole-marker branch; split the `projectTechniqueToYaml` call at line ~605 into project→dedup→stringify. | get_technique delivery path |
| 2 | Where in `get_activity` does block dedup hook in? | Resolved | On the `projectTechnique(technique)` record at line ~685 before the spread; merge into `newDeliveries` (committed at 775). | get_activity eager-bundle path |
| 3 | Does C12 need to change `get_workflow`'s `advanceSession`? | Resolved | Yes — line 299 currently advances with no mutator before `opsBlock` is built (308); C12 must reorder to decide the marker then commit `workflow_bundle:<hash>` via a `recordDeliveries` mutator. | get_workflow ops bundle |
| 4 | Any schema/serialization change required? | Resolved | No — `deliveredContent` gains keys only; `stringifyForResponse` is insertion-order (no ordering list). | Confirmed "no change" points |
| 5 | Is `projectTechnique` itself modified? | Resolved | No — the new helper operates on its output; avoids the CRITICAL blast radius. | Blast radius |
| 6 | Does the eager-budget calculation account for block-marker savings? | Open (out of scope for impl) | No — budget draws on full `projectTechniqueToYaml` text; block markers reduce wire bytes but not budget draw. A later optimisation could measure post-dedup length, but the spec intentionally keeps the document-order prefix stable. | get_activity budget subtlety |

### Remaining follow-up items (out of scope)

- Empirical validation of the projected ~+13% (C2) headroom and C12's resume delta via an instrumented persistent-mode work-package re-walk (spec §7, a validation note not a blocker).
- The stale `bundle:rules` header line in `delivery.ts` should be refreshed to `bundle:rules:<hash>` (spec §5 docs; rides the impl PR).
