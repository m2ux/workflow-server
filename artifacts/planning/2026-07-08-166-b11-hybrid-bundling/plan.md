# #166 B11 — Opt-in hybrid technique bundling on activities

**Date:** 2026-07-08 · **Branch:** `feat/166-b11-hybrid-bundling` · **Scope:** server-only (no workflows-submodule change; the flag is opt-in and no corpus activity declares it yet) · **Risk:** medium per the epic (fidelity trade), mitigated by activity-declared opt-in + gated-step exclusion + per-technique size ceiling

## Objective

From the epic (#166): `bundleTechniques: {maxChars: 4000}` on an activity makes `get_activity` inline the composed content of that activity's small step-bound techniques, while large and gated ones stay lazy-fetched via `get_technique`. Addresses friction F2's turn-overhead half: the measured hybrid (payload-measurements §4, ≤4k policy row) removes 75 % of fetch round-trips (161→~40 on the instrumented work-package walk) for +19 % technique-delivery chars vs delta-only, ~3–8 min of protocol latency per walk.

**B8 caveat, recorded:** the epic sequenced B11 "informed by B8's fidelity data", and no real-session `technique_fetched` corpus has accumulated yet (B8 merged 2026-07-07). The 4000-char default therefore rests on the instrumented-walk measurement alone. Acceptable because the flag ships **opt-in with no corpus adoption in this change** — threshold tuning and any adoption decision remain open until B8 data exists.

## Design

### Schema (additive)

`BundleTechniquesSchema = { maxChars: positive int }` (strict), new optional `bundleTechniques` field on `ActivitySchema`. Corpus is untouched; the field is authoring-level opt-in per activity. `npm run build:schemas` regenerates the JSON schemas.

### get_activity composition

When the current activity declares `bundleTechniques`, after the existing inherited-bundle block:

- Walk the activity's technique-kind steps (top-level + loop bodies), **excluding gated ones** — any step carrying `when`/`condition` on itself or on an enclosing loop stays lazy, so bundling never delivers content whose step may not execute (the break-even concern in payload-measurements §5).
- For each eligible step, compose exactly what a step-bound `get_technique` would deliver: activity-group-shorthand resolution, ancestor-chain composition, B2 inherited-input partitioning, **B3 provenance decoration** (per-step, since bindings differ). Composition is shared by construction: the shorthand+compose sequence is extracted from the `get_technique` handler into a `composeActivityTechnique()` helper both paths call.
- Size gate: if the projected YAML wire form exceeds `maxChars`, the step stays lazy (per-technique ceiling, not a total budget — matching the measured policy).
- Deliver under a `step_techniques` map (keyed by step id) in the ops section, with a note stating that steps absent from the map must still be fetched with `get_technique { step_id }`. `_meta.bundled_steps` lists the bundled step ids for tooling.
- **B1 interplay:** each bundled entry is hashed with the same ledger key `get_technique` uses (`technique:<resolvedId>`, hash of the YAML projection), so the delivery ledger is shared across both tools: a bundled delivery collapses a later persistent-mode `get_technique` refetch to an unchanged stub, and reference-mode `get_activity` re-delivery collapses bundled entries to `{ unchanged, content_hash }` markers. `full: true` / `bundle: "full"` escapes unchanged.
- Provenance UNRESOLVED warnings surface in `_meta.validation`, same as a step-bound fetch.

### Fidelity observability

New `technique_bundled` history event (additive enum value), recorded per bundled step on both delivery paths (full and marker) with `data: { techniqueId, stepId, agentId }` — kept distinct from `technique_fetched` so B8's data stream still measures *agent-initiated* fetches and B11 tuning can tell the two delivery modes apart. `validateTechniqueFetches` accepts either event type as coverage, so bundled steps manifest warning-free.

### E2E walker

The robot walker reads `_meta.bundled_steps` from `get_activity` and skips its per-step `get_technique` call for those ids — mirroring what a real worker should do. No corpus activity opts in, so all baselines stay byte-identical.

## Execution log

1. Evidence review: payload-measurements §3/§4/§6 (hybrid ≤4k row: 40 calls, −36 % delivery chars), evaluation-report §3 verdict (opt-in, gated stay lazy) + B11 backlog row; B8 plan's deferred note. Confirmed no accumulated real-session fidelity data — recorded as the caveat above.
2. Impact analysis (GitNexus): `ActivitySchema`, `composeTechnique`, `projectTechniqueToYaml`, `validateTechniqueFetches` — all LOW, zero direct callers outside touched call sites (tool-handler closures are not indexed as callers, as in B8). `detect_changes` again scoped by diff review — linked worktree not visible to the index.
3. Implementation as designed. The activity-group-shorthand + compose sequence was extracted from the `get_technique` handler into `composeActivityTechnique()` (technique-loader), and `projectTechniqueToYaml` split into `projectTechnique` (ordered record, embedded in the bundle map) + the YAML wrapper — both refactors behavior-preserving. `npm run build:schemas` regenerated the four JSON schemas (additive only); `npm run build:site` refreshed the generated API pages (the site-staleness guard caught them).
4. Tests: new `tests/hybrid-bundling.test.ts` — 8 wire-level cases against a fixture corpus (bundling shape incl. shorthand resolution, per-step provenance decoration, `technique_bundled` history events, fidelity-warning split bundled-vs-lazy, cross-tool ledger in persistent mode both directions incl. `bundle: "full"` escape, no-opt-in unchanged, schema accept/reject). One `validateTechniqueFetches` unit case for `technique_bundled` credit. Walker reads `_meta.bundled_steps` and seeds its fetched-set. One test-authoring fix: the fidelity assertion originally used `not.toContain('record')`, which substring-matched the word “recorded” in the warning prose — replaced with an exact check on the bracketed step list.
5. Suite 507/0 (`npx vitest run`), typecheck clean, e2e snapshots byte-identical (no corpus activity opts in), guard tests green.
6. Docs: `api-reference.md` new **Hybrid Technique Bundling** section + get_activity/next_activity rows + validation list + Fidelity Observability; `workflow-fidelity.md` Layer 5 paragraph; `schemas/README.md` activity field tables + enforcement-boundary row + history event-types list; `get_activity`/`next_activity` tool descriptions.

## Deferred / follow-ups

- **Corpus adoption:** no workflow declares `bundleTechniques` yet. Adoption is a workflows-repo decision to be made per activity against accumulated B8 `technique_fetched` data (which activities re-fetch small ops most), with the measured 4000-char threshold as the starting point.
- **Threshold tuning:** `maxChars` is per-technique, matching the measured policy; a total-budget variant was considered and dropped — it would make delivery order-dependent.
- The corpus `check:*` guards are content-side and unaffected; no new guard is needed (the schema's `strict()` object rejects malformed declarations).
