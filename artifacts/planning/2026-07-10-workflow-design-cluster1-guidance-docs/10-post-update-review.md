# Post-Update Review — Cluster 1 (guidance & docs + server changes)

> Cluster 1 · m2ux/workflow-server#189 · UPDATE mode · target = workflow-server repo root (`.`) · reviewed 2026-07-10 · activity prefix `10`
>
> Post-commit compliance audit of the committed change as it stands in the two DRAFT PRs (#207 workflows, #208 server). Review-only: no code edits, no commits, no pushes, PRs left DRAFT. Audit ran against the **committed** state (main checkout is on `feat/189-cluster1-context-derived-bundling`; `workflows` submodule holds commit `1aa52e52`), not cached pre-update state.

## Committed state audited

| PR | Base | Branch | Commit | Files | Draft |
|----|------|--------|--------|-------|-------|
| #208 (server) | `main` | `feat/189-cluster1-context-derived-bundling` | `b8c4cfed` | 19 | yes |
| #207 (workflows) | `workflows` | `workflow/189-cluster1-worker-prompt-bundling` | `1aa52e52` | 2 | yes |

**#208 files (19):** `docs/api-reference.md`, `docs/ide-setup.md`, `schemas/README.md`, `schemas/activity.schema.json`, `schemas/workflow.schema.json`, `scripts/smoke/smoke-orchestrator.ts`, `scripts/smoke/worker-brief.md`, `site/api/tools.html`, `src/config.ts`, `src/schema/activity.schema.ts`, `src/tools/resource-tools.ts`, `src/tools/workflow-tools.ts`, `src/utils/delivery.ts`, `src/utils/session/params.ts`, `tests/config.test.ts`, `tests/e2e/walker.ts`, `tests/hybrid-bundling.test.ts`, `tests/mcp-server.test.ts`, `tests/reference-delivery.test.ts`.

**#207 files (2):** `meta/resources/activity-worker-prompt.md` (+3/-3), `meta/resources/bootstrap-protocol.md` (+1/-1).

## Audit-pass results (applied where each fits)

Because the "target workflow" is the workflow-server codebase itself (server code + docs + two meta resources), the workflow-content audit passes are applied where they fit: the two meta-resource markdown files get the full workflow-design treatment; server code + docs are checked for correctness/consistency against the As-Built spec and documentation-voice conformance; structural guards re-run against the committed state.

| Pass | Result |
|------|--------|
| Expressiveness | **Clean** — meta-resource edits are worker-facing instructional prose (correct home); no prose substitutes for a formal YAML construct; no corpus activity/technique YAML touched. |
| Conformance (incl. doc voice) | **Clean** — the `not`/`never` in the worker-prompt carve-out ("resources are never inlined", "do NOT ping the server per bundled step") are behavioural directives to the worker, not evolution-narration against a prior design; doc changes state current behaviour in positive declarative present tense; `#189 C1c` / prior-design-contrast comments live in `src/` (planning-exempt code), not corpus documentation. |
| Rule-to-structure | **Clean** — no new `rules[]` entries in any YAML; the `context_tokens`-required invariant is enforced at the strongest structural layer (zod MCP-boundary hard rejection), with two dedicated rejection tests, not text. |
| Anti-patterns | **Clean** — meta-resource edits add no I/O ids, protocol-variable bindings, or rule slugs; code-like tokens in the prose (`step_techniques`, `get_technique`, `{ delivery: "unchanged", content_hash }`, `get_resource`) are correctly backticked; `▶ step <step_id>` / `▼ STEP` are literal worker directives, not unbraced designators. |
| Schema validation | **Clean** — against the committed working tree: `tsc --noEmit` clean; `check-all-refs` 0 unresolved (2/2 workflow-design refs resolve); `check-binding-fidelity` 263 total / 263 baselined / **0 NEW** / 0 fixed; `check-resource-anchors` OK. |

## Correctness / consistency vs As-Built (spot-checked against the committed diff)

- **`context_tokens` genuinely REQUIRED** — `contextTokensParam` is `z.number().int().positive()` (no `.optional()`), destructured in the handler; MCP-boundary rejection asserted by `mcp-server.test.ts` ("should error when context_tokens is omitted") and `hybrid-bundling.test.ts` ("rejects get_activity without the required context_tokens param"). Confirmed.
- **Budget derivation from config, no magic numbers** — `eagerBudgetChars = context_tokens × headroomFraction × charsPerToken`, sourced from `config.bundleHeadroomFraction ?? DEFAULT_BUNDLE_HEADROOM_FRACTION` (0.8) and `config.bundleCharsPerToken ?? DEFAULT_BUNDLE_CHARS_PER_TOKEN` (4), both env-overridable via `envNumberOrDefault`; `config.test.ts` asserts both defaults. Confirmed.
- **Stop-and-break inlining (LOW-1 fix)** — `src/tools/workflow-tools.ts` overflow branch is `break` (not `continue`); document-order prefix preserved as the spec/docs promise. Confirmed.
- **Unified marker in both emitters, ledger key preserved** — `delivery.ts#unchangedMarker` returns `{ delivery: 'unchanged', content_hash }`; `resource-tools.ts` `get_technique` stub spreads `...unchangedMarker(hash)` keeping `id`/`note` as siblings; shared `technique:<id>` ledger key intact. Confirmed.
- **`▼ STEP` arrival marker on every bundled entry** (full and collapsed) — asserted in `hybrid-bundling.test.ts`. Confirmed.
- **`maxChars: 0` opt-out** — schema relaxed `.positive()` → `.nonnegative()`; generated JSON schemas regenerated (`exclusiveMinimum: 0` → `minimum: 0`); dedicated opt-out + rejection tests. `SERVER_VERSION` 1.0.0 → 2.0.0. Confirmed.
- **C6 doc-drift** — api-reference Enforcement Boundary reclassifies variable `defaultValue`/`type` out of the agent-interpreted class; `schemas/README.md` drops the two stale activity `artifacts` rows. Confirmed.
- **Cross-PR coherence** — the marker shape `{ delivery: "unchanged", content_hash }` and the resources-stay-lazy / `▶ step` begin-beat prose in #207's two meta resources match the server behaviour and `step_techniques_note` in #208 exactly. The PRs are internally coherent and merge-ordered (#207 first, then #208, then the §3 submodule-pointer bump).

## Scope-discipline audit (`scope_drift_findings`)

Committed file sets compared against the confirmed scope manifest (`06-scope-and-draft.md` §A–E + As-Built).

**Unaddressed manifest items (documented, non-drift):**

- Manifest §B #9 `tests/fetch-observability.test.ts` — planned as "add `context_tokens`", but As-Built records it "needed no change (no get_activity calls)". Correctly omitted; not drift.
- Manifest §C #13 `scripts/generate-site-data.ts` — planned as "verify (no change expected)"; correctly absent from the PR.
- Manifest §E guards — "re-run only, no edits expected"; correctly absent.

**Additions beyond the original §A–C tables (all justified by As-Built):**

- `tests/config.test.ts` — not in the original §B table but added in As-Built to assert `SERVER_VERSION 2.0.0` + the two budget-constant defaults. Justified: the config-derivation change (§A #2) requires a test; recorded in As-Built.
- `schemas/workflow.schema.json` and `site/api/tools.html` — regenerated artifacts (`build:schemas` / `build:site`), listed in As-Built "Regenerated". `workflow.schema.json` carries the same `maxChars` `exclusiveMinimum:0 → minimum:0` change as `activity.schema.json` (the `bundleTechniques` block appears in both generated schemas). Justified: mechanical regeneration of an already-scoped schema change.

**Excluded-from-staging discipline honoured:** the server PR carries the server change set ONLY — no `workflows/` gitlink, no `.engineering/` gitlink, no untracked `.agents/` / `.claude/skills/*` / `skills-lock.json` noise (confirmed via `gh pr view 208 --json files`).

**Result: no scope drift.** Every committed file maps to a manifest item or an As-Built-recorded justified addition; every unaddressed manifest item is an explicitly-documented no-op. The two-repo split matches the plan (§1 server / §2 workflows), and the workflows edits are committed on the `workflows` branch in the dedicated worktree, never in the main checkout — repo discipline satisfied.

## Findings

**No new compliance findings.** All five audit passes are clean, the scope-discipline audit shows no drift, and the committed state passes every applicable structural guard. The single prior finding (LOW-1, skip-vs-break phrasing) was already remediated in validate-and-commit (the overflow branch is now `break`), so it does not carry forward.

- `review_findings_count` = **0**
- `has_critical_finding` = **false**
- `needs_audit_fixes` = **false**

The committed update is **clean** — it carries no new compliance debt.

## Disposition

Post-update review clean → the natural disposition is **accept** (transition to `retrospective`). Surfaced to the orchestrator via the `post-update-disposition` checkpoint; the decision is the user's.
