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

## Manual Diff Review

> feat/224-v4-audience-attribute vs main · 13 files reviewed · reviewer: user · No Issues

User reviewed the 13-block change index ([`10-change-block-index.md`](10-change-block-index.md)) in a side-by-side diff tool and confirmed all rationale paragraphs as accurate with no flagged blocks (checkpoint `file-index-table` → `rationale-confirmed`). Confirmation stands as the provenance attestation for each change block.

## Code Review

> code-review · PR #227 (feat/224-v4-audience-attribute) vs main · 13 files reviewed · commit `482332e4`

**Overall Quality:** 5/5 — Critical: 0 · High: 0 · Medium: 0 · Low: 0

Project is TypeScript, not Rust/Substrate — the [review guide](../../../../workflows/work-package/resources/rust-substrate-code-review.md) criteria were applied by analogy (error handling, type-system correctness, module boundaries, documentation, testing); the Substrate-specific categories (pallets, weights, storage migrations, extrinsics) do not apply.

### Bounded review scope

The GitNexus index at the reference checkout is stale, so blast radius was bounded from the diff plus a targeted symbol lookup. The only non-trivial code change is the `parseEntrySubsections` signature widening (single reserved key → array). A GitNexus symbol lookup confirms it is called by exactly `parseInputsSection` and `parseOutputsSection` — both are in the diff and both were migrated to the new `reserved.<key>` map access. There are no other callers, so the signature change is fully contained within the file. `composeActivityArtifacts` gains an optional return field consumed only at the two `get_activity` delivery surfaces (body `{artifacts}` block + `_meta.artifacts`), both fed by one computed array.

**Producer/clearer conservation walk:** the change introduces no persistent state, storage record, queue entry, or allocation with a lifecycle — it threads one optional read-only enum field through a markdown parser and a contract composer. There is no producer/clearer pair to conserve; the walk is vacuously balanced. No unbounded-state-growth, economic-spam, liveness-halt, or migration-upgrade axis is engaged (the field is optional and additive, so existing definitions load unchanged — no persisted-shape migration is required).

### Findings

No findings at any severity.

### Strengths

- **Single-validator discipline.** The loader passes the authored `audience` through as an unrefined `string` (`IndexParse.outputs`), so a mistyped value reaches the `OutputItemDefinitionSchema` `z.enum(['human','agent'])` and is rejected loudly at load (technique dropped with a logged warning) rather than being silently narrowed away in the parser. Comments state this *why* rather than the *what*, per house style.
- **Minimal, contained refactor.** Widening `reserved` from `'artifact' | 'default'` to `readonly ReservedKey[]` with a `Partial<Record<ReservedKey,string>>` return is driven by a concrete present need (outputs now carry two reserved keys on one entry) — not speculation. Backtick-stripping and case-insensitive matching are preserved verbatim.
- **Absent-means-human on the wire.** The `...(o.audience ? { audience } : {})` conditional spread omits the key entirely when undeclared rather than writing `audience: undefined`, keeping the default semantics clean across the contract surface.
- **Three-surface schema lockstep.** The Zod schema, the hand-maintained JSON schema, and the spec carry identical enum wording, so external validators and runtime validation agree.

### Recommendations Summary

None. The change is ready for validation.

### Compliance

All applicable compliance categories (Type-System/Idioms, Architecture, Documentation, Testing) met. Substrate Framework category is not applicable (TypeScript project).

## Structural Analysis

> L12 structural lens · PR #227 (feat/224-v4-audience-attribute) vs main · commit `482332e4`. GitNexus structural context was limited (stale index); the one blast-radius claim below (`parseEntrySubsections` has exactly two callers) is graph-confirmed, the rest is diff-derived.

### Claim

The deepest structural problem this change *could* introduce is a **format-declaration / format-enforcement split**: `audience` states that an agent artifact is JSON, but nothing in the write path actually serializes agent artifacts as JSON — the attribute is a declaration whose enforcement lives entirely in a corpus-lint guard, not at the point of writing.

### Dialectic

- **Defender:** The split is intentional and correct. V4's stated scope is *declaration only* — "who reads, and that an agent artifact is JSON" — with per-artifact JSON field schemas explicitly deferred to V5. The guard (`check-audience`) is the enforcement appropriate to the declaration layer: it holds the *naming* convention (`.json` suffix) so a future agent artifact cannot land mis-declared. Runtime serialization is a V5 concern by design.
- **Attacker:** A declaration with no runtime consumer is latent dead weight. `composeActivityArtifacts` carries `audience` onto the contract, but no code reads it to *do* anything — the worker is trusted, by prose in the spec, to serialize JSON. Trusting prose is exactly the failure mode `audience` was meant to remove.
- **Probe (what both assume):** Both assume the field must eventually gate behaviour. But the field's present job is purely *informational carry-through to a human/agent reader* of `get_activity`, plus a *ratchet* (the guard). It is a contract annotation, not a control input. The attacker's "dead weight" and the defender's "V5 will consume it" both presuppose the value's worth is its future runtime use; its present worth is that it is *delivered and lint-guarded*, which the tests prove.

**Claim transformation:** the claim collapses from "format-declaration/enforcement split (a defect)" to "the attribute is a *deferred-consumer* contract field — correctly delivered and ratcheted now, with runtime consumption scoped out." The gap between the two is the diagnostic: what *looked* like an enforcement hole is a deliberately-drawn increment boundary, and the guard + carry-through are exactly the machinery that keeps the boundary honest until V5.

### Concealment Mechanism

The change conceals its own incompleteness *by design and in the open* — the spec's explicit "Out of scope (V5)" note and the empty `audience-baseline.json` both advertise "no adoption yet." This is the opposite of a hidden problem: the concealment mechanism is *disclosure*. Applying it: there is no place where a reader is misled into thinking JSON serialization is enforced at write time — the docs say the worker serializes JSON by convention, and the guard only checks the *name*.

### Improvements (and what they reveal)

1. *Legitimate-looking improvement that would deepen concealment:* make the guard assert the artifact's on-disk *content* is valid JSON, not just its name. This passes review ("stronger guard!") but conceals that there is **no on-disk artifact to inspect at lint time** — the corpus holds technique *definitions*, not produced artifacts. Revealed property: the guard can only ever check *declarations*, never *instances*; format-of-instance is unavoidably a runtime concern.
2. *Second improvement addressing the recreated property:* move enforcement into the write path (serialize JSON when `audience==='agent'`). This recreates the original split from the other side: now the *server* must know how to serialize every agent artifact's shape — which is precisely the V5 per-artifact schema work. Revealed: you cannot enforce format-of-instance without owning shape-of-instance.

### Structural Invariant

**Format enforcement requires shape ownership.** Across every improvement, the property that persists is: you can guard a *naming* convention with zero shape knowledge, but you cannot enforce *serialization* without owning each artifact's schema. `audience` deliberately sits on the near side of this line — it declares a reader and a coarse format class (JSON vs prose) without claiming any shape.

### Conservation Law

**Declared format is conserved against owned shape:** every increment either declares format without owning shape (V4 — cheap, additive, no runtime risk) or owns shape to enforce format (V5 — expensive, per-artifact). You cannot enforce more format than you own shape. V4 spends exactly at the "declare, don't own" end, which is why it is a pure additive field + a name-only guard with zero runtime code path.

#### Producer/clearer ledger

The conserved *resource* in this diff is parser/loader state, not any persistent allocation. The ledger is trivially balanced:

| Resource | Producer(s) | Clearer(s) | Termination paths checked | Verdict |
|----------|-------------|------------|---------------------------|---------|
| `reserved` metadata map (per entry) | `parseEntrySubsections` builds one `{}` per call | function-local; garbage-collected on return | normal return (only path — no throw, no early return, no async) | **Matched** — value is local, no lifecycle to leak |
| `audience` on contract entry | `composeActivityArtifacts` spread | none needed — plain data on returned array | normal return | **Matched** — pure data, no resource |
| agent-audience artifact on disk | *no producer in this diff* (zero corpus adoption; write path unchanged) | n/a | n/a | **Vacuous** — nothing created |

No unmatched producer exists. The change creates no persistent state, no queue entry, no allocation with a lifecycle — it threads one optional read-only enum through a synchronous parser and a data composer. The conservation law holds: "no new bug."

### Meta-Law

What the conservation law conceals about *this specific problem*: it treats "declare" and "enforce" as a clean two-rung ladder, but the guard occupies a **third, in-between rung** — it enforces a *proxy* for format (the `.json` name) without owning shape. Concrete testable consequence: **the guard will pass an agent artifact named `foo.json` that a worker writes as prose markdown.** The name-suffix check is satisfiable without the content being JSON, so the V4 guard's guarantee is strictly "an agent artifact is *named* like JSON," never "*is* JSON." This is not a V4 defect (instance content is out of scope and un-inspectable at lint time), but it is the precise, falsifiable limit of the guard — and it predicts what V5 must add: content/shape validation at the point an agent artifact is actually written.

### Bug Table

| # | Location | What breaks | Severity | Fixable / Structural |
|---|----------|-------------|----------|----------------------|
| 1 | `scripts/check-audience.ts` `isJsonArtifactName` | An agent artifact named `foo.json` but written as prose passes the guard — the check is name-only, so JSON *content* is never verified | Informational | **Structural** — instance content is un-inspectable at corpus-lint time (no produced artifact exists to read); resolvable only at write time, which is V5 shape-ownership scope. Not a V4 defect. |
| 2 | `src/tools/workflow-tools.ts` `composeActivityArtifacts` (dedup-by-name) | If two techniques declare the same artifact filename with *differing* `audience`, first-in-step-order wins silently | Informational | **Fixable** but out of scope — same pre-existing dedup contract as `id`; a cross-technique audience conflict on one filename is a corpus authoring error, and corpus adoption is zero. No action for V4. |

No Critical/Major/Minor bug found. Both entries are Informational: #1 is a structural limit correctly deferred to V5 and already disclosed in the spec's out-of-scope note; #2 is a latent authoring-conflict edge with no present trigger (empty baseline). Neither sets a routing flag.
