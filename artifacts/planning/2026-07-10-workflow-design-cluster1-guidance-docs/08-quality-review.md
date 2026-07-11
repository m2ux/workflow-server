# Quality Review — Cluster 1 (guidance & docs + server changes)

> Cluster 1 · m2ux/workflow-server#189 · UPDATE mode · target = workflow-server repo root (`.`) · reviewed 2026-07-10 · activity prefix `08`

## Scope of this review

UPDATE mode (`is_review_mode != true`), so the active audit passes are **expressiveness**, **conformance**, **rule-hygiene**, **rule-enforcement**, then **verify-high-findings** + classification + the audit-fix loop. Because the "target workflow" here is the **workflow-server codebase itself** (server code + docs + two meta resources), the workflow-content audits are applied where they fit:

- **Meta resources** (`activity-worker-prompt.md`, `bootstrap-protocol.md`) — the corpus-facing surface — get the full workflow-design treatment (voice/conformance, schema/anchor/fragment integrity, binding fidelity).
- **Server code + docs** — checked for correctness/consistency against the As-Built spec in `06-scope-and-draft.md`.
- Repo checks (typecheck, full suite, guards, schema/site regen) re-run and confirmed green.

## Verification results (all green)

| Check | Result |
|-------|--------|
| `npm run typecheck` (`tsc --noEmit`) | clean |
| `npx vitest run` (full suite) | **535 passed / 14 skipped / 0 failed** (38 files passed, 1 skipped) |
| e2e definition snapshot (`snapshot.test.ts`) | 6 passed; `.snap` unmodified (corpus YAML untouched) |
| `check:site` | PASS — all site links/anchors resolve |
| `check:anchors` | OK — every relative `.md#anchor` resolves |
| `check:binding` | 263 total / 263 baselined / **0 NEW** / 0 fixed |
| `check:fragments` | OK — refs resolve, all fragments used, no inline dupes |
| `check:review-mode` | OK — 6 total / 6 baselined / 0 NEW |
| `check:variable-model` | OK — defaults/gates/setVariable coherent |
| `build:schemas` regen | no new drift (only already-staged `activity/workflow.schema.json` remain) |
| `build:site` regen | no new drift (only already-staged `tools.html` remains) |

## Correctness / consistency audit vs As-Built spec

Every As-Built claim was checked against the actual working-tree diff and confirmed:

- **`context_tokens` genuinely REQUIRED** — `contextTokensParam` uses `z.number().int().positive()` (no `.optional()`), destructured in the handler; a dedicated MCP-boundary rejection test (`mcp-server.test.ts` "should error when context_tokens is omitted") and a `hybrid-bundling.test.ts` "rejects get_activity without the required context_tokens param" both assert `isError`. **Confirmed.**
- **Budget derivation uses config constants (no magic numbers)** — `eagerBudgetChars = context_tokens * headroomFraction * charsPerToken`, sourced from `config.bundleHeadroomFraction ?? DEFAULT_BUNDLE_HEADROOM_FRACTION` (0.8) and `config.bundleCharsPerToken ?? DEFAULT_BUNDLE_CHARS_PER_TOKEN` (4), both env-overridable in `loadConfig` via a robust `envNumberOrDefault`. `config.test.ts` asserts the two defaults. **Confirmed.**
- **Marker unified in BOTH emitters, ledger key preserved** — `delivery.ts#unchangedMarker` now returns `{ delivery: 'unchanged', content_hash }`; `resource-tools.ts` `get_technique` stub spreads `...unchangedMarker(hash)` (dropping its own hand-rolled `delivery`/`content_hash`), keeping `id`/`note` as sibling context. Shared `technique:<id>` ledger key intact at both the bundle path and get_technique. `reference-delivery.test.ts` predicate + equality updated; `hybrid-bundling.test.ts` asserts the collapsed entry uses `delivery: 'unchanged'` and retains its `▼ STEP` marker. **Confirmed.**
- **C6 doc-drift fixed** — `api-reference.md` Enforcement Boundary reclassifies variable `defaultValue` (server-seeded via `variables_seeded`) and `type` (warn-only on `setVariable`) out of the agent-interpreted class; `schemas/README.md` drops the two stale activity `artifacts` rows (L581, L1208). **Confirmed.**
- **Worker-prompt carve-out** — `activity-worker-prompt.md` step 3 carves out inlined `step_techniques` from the "one per step, never all at once" mandate while preserving the deliberate `▶ step <id>` begin-beat, and step 2 states resources are never inlined (still `get_resource` on demand). **Confirmed.**
- **Resources stay lazy (C4)** — budget accounts for technique body only; `step_techniques_note`, `api-reference.md`, the worker prompt, and the budget-code comment all state resources are not inlined. **Confirmed.**
- **SERVER_VERSION 1.0.0 → 2.0.0**, schema `.positive()` → `.nonnegative()` with `maxChars: 0` opt-out (dedicated test), generated JSON schemas regenerated (`exclusiveMinimum: 0` → `minimum: 0`). **Confirmed.**

## Findings

### Expressiveness pass
No findings. No prose in the meta-resource edits substitutes for a formal construct; the edits are worker-facing instructional prose (correct home for it) and add no rules/steps to workflow YAML (RR-4 dropped the corpus opt-ins).

### Conformance pass
No findings. Documentation-voice check on the two meta-resource diffs: the edits state current behaviour in positive declarative present tense. The one `not`/`never` occurrence ("Resources are never inlined … do NOT ping the server per bundled step") is a **behavioural directive to the worker**, not an evolution-narration contrast against a prior design — this is the same voice the surrounding bootstrap prose already uses and is not an AP voice violation. Server-code comments referencing "#189 C1c" and prior-design contrast are in `src/` comments and planning-exempt code, not corpus documentation.

### Rule-hygiene pass
No findings. No `rules[]` entries were added or modified in any workflow/activity/technique YAML (the change is server + docs + meta-resource prose only).

### Rule-enforcement pass
No findings. No new `rules[]` entries introduced, so there is nothing new requiring structural backing. The `context_tokens`-required invariant is itself enforced structurally at the strongest possible layer — the zod MCP boundary (hard rejection), not text.

### LOW-1 — "document order until overflow" is skip-and-continue, not stop-and-break
- **Construct:** `src/tools/workflow-tools.ts` L524 — `if (spentChars + text.length > eagerBudgetChars) continue;`
- **Observation:** On budget overflow the loop `continue`s rather than `break`s, so a large technique at document position N is skipped while a *smaller* later technique that still fits is inlined. The code comment ("stop inlining once it would overflow"), the api-reference prose ("in document order until adding the next would overflow the budget; the remainder stay lazy"), and As-Built (A) ("until the next would overflow") all read as first-overflow-terminates.
- **Adversarial re-derivation:** Reproduced independently from the construct. The skip-and-continue behaviour is **safe** (budget is never exceeded) and arguably preferable (packs more useful content), but the stated contract phrasing describes a break. Neither behaviour is tested distinctly (the "tiny budget" test uses `context_tokens: 1`, so nothing fits under either reading).
- **Severity: LOW** — a comment/doc-vs-code phrasing imprecision, not schema-invalid or structurally broken. Not remediated in this pass; recorded for optional tightening (either `break` to match the phrasing, or reword the comment/doc to "skip any technique that would overflow, continuing in document order"). Does not gate the transition.

## verify-high-findings outcome

No High findings surfaced by any pass. The single finding (LOW-1) was adversarially re-derived and confirmed as real but correctly rated Low. No Medium findings required confirmation.

## Classification

- `review_findings_count` = **1** (LOW-1)
- `needs_audit_fixes` = **false** — the one finding is Low, safe, and left as-is; no fix elected, so the audit-fix loop does not run.
- `has_critical_finding` = **false** — nothing schema-invalid or structurally broken.

## Blocker gate

`has_critical_finding = false` → **no-blocker** (default branch). Proceed to `validate-and-commit`.

> **Flag for validate-and-commit (carried from `06`):** the two meta-resource edits live in the `workflows` submodule and MUST be committed on the `workflows` branch in a dedicated worktree; server-repo changes go on their own branch. The main checkout is currently on `main` (not a dedicated worktree) — establish the correct commit topology before committing.
