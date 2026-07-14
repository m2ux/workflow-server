# Lean-Coding Audit — #224 V4 (audience attribute)

> lean-coding-audit · commit `482332e4` · 13 files, +522/−23 · 2026-07-14

Over-engineering lens applied against the [review taxonomy](../../../../workflows/work-package/... "ponytail/review-taxonomy") — `delete` / `stdlib` / `native` / `yagni` / `shrink`. Scope is over-engineering only; correctness, security, and performance are held by the safety floor and are out of scope here. Default intensity (clear wins).

## Findings

Per-surface scan of the diff:

- **`src/schema/technique.schema.ts`** — one optional `z.enum(['human','agent'])` field beside `destination`. Minimal additive change. No finding.
- **`schemas/technique.schema.json`** — one matching enum property, kept in lockstep by hand (the file is deliberately not generated). Minimal. No finding.
- **`src/loaders/markdown-technique-loader.ts`** — `parseEntrySubsections`'s `reserved` widened from a single string (`'artifact' | 'default'`) to `readonly ReservedKey[]`, return from `reserved?: string` to `Partial<Record<ReservedKey, string>>`. **Not YAGNI:** outputs now genuinely carry two reserved keys on one entry (`artifact` + `audience`), so the multi-key generalization has a present, concrete second caller — the array is the minimal representation of "match any of N reserved titles," and the alternative (two scalar params) is more code. The two added comments explain the strict-schema-rejects-loudly rationale (why, not what). No finding.
- **`src/tools/workflow-tools.ts`** — one-line carry-through; the conditional spread `...(o.audience ? { audience } : {})` cleanly omits the key when absent (matching absent⇒human) rather than writing `audience: undefined`. A single computed `composedArtifacts` feeds both the body `{artifacts}` block and `_meta.artifacts` — one computation, two consumers, no duplication. No finding.
- **`scripts/check-audience.ts` (153 lines)** — the largest addition, and the one place the lens pushes hardest: it enforces a convention (agent-audience artifact ⇒ `.json` name) with **zero corpus adoption** (`audience-baseline.json` is `[]`; per-artifact JSON schemas are explicitly deferred to V5). Under the ladder a lazier rung exists — defer the guard to V5 when the first agent-audience artifact lands. **But the guard's existence is explicitly-requested, documented scope** (work-package-plan Task 6, design-philosophy), which puts it on the safety floor ("anything explicitly requested"), so its existence is not a finding. Scanning its *construction*: `collectAudienceViolations` / `diffBaseline` both have real callers (CLI + `audience-guard.test.ts`); the baseline-diff / `--update-baseline` / `fixed`-reporting machinery mirrors the sibling guards (`check-identifier-qualification`, `check-review-mode-gating`) exactly — the established house pattern, and the mechanism that lets a not-yet-adopted guard ship green. The corpus-walk (`loadWorkflowTechniques`) loads through the real loader with grouped/nested/flat handling that no existing helper provides, so it is not a reuse miss; extracting a shared walker now (second concrete user) would touch other guards and is itself out of scope for an additive PR. No import is dead. No finding.
- **`docs/technique-protocol-specification.md`, `docs/development.md`** — documentation of the attribute + authoring guidance (explicitly-requested, Task 4). Out of over-engineering scope.
- **`scripts/audience-baseline.json`, `package.json`** — one empty-array snapshot + one script wiring line. Minimal. No finding.
- **Tests (4 files)** — parser, schema, projection round-trip, contract carry-through, and guard fixtures. All exercise real behaviour of the new field across the surfaces it touches; the safety floor requires a runnable check for non-trivial logic and this is proportionate (no frameworks/fixtures beyond tmpdir corpus fixtures). Out of over-engineering scope; not bloat.

## Scoreboard

```
Lean already. Ship.
```

net: -0 lines. The change follows the established additive-output-field precedent (`destination` / `action`), reuses the existing `#### <reserved>` parse grammar rather than inventing new grammar, needs zero projection edit (verified by test, not changed), and its one non-trivial refactor is driven by a concrete second reserved key. The only large addition (`check-audience.ts`) is explicitly-requested, floor-protected scope built to the sibling-guard pattern. No over-engineering finding holds up.
