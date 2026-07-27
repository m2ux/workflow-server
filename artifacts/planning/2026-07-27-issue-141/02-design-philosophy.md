# Design Philosophy

> design-philosophy · Hierarchical Path-Scoped Resource Section References · #141 Hierarchical path-scoped resource section references (no flat-slug flattening) + anchor validation · 2026-07-27

## Problem Statement

A resource section is addressed by one flat GitHub-style slug (`id#slug`), and two independent slug implementations disagree: the runtime resolver collapses whitespace runs and has no duplicate-heading dedupe, while the CI guard follows GitHub semantics. A link can therefore pass every automated check and still resolve to `null` at agent runtime — two such links are live in the corpus today. Separately, because the only namespace is the filename, a leaf heading cannot be addressed through its parent, so files that repeat a heading expose only the first copy and consumers are forced to load whole files. The cost lands as either a hard `get_resource` failure or silently wrong content, in both cases invisible to CI.

### System Context

Single definition site — `src/utils/resource-ref.ts`: `parseResourceRef`, `extractMarkdownSection`, `extractResourceIds`.

| Consumer | Path | Coupling |
|----------|------|----------|
| `get_resource` | `src/tools/resource-tools.ts:774-786` | Throws when a section resolves to `null` |
| Eager bundling | `src/utils/resource-delivery.ts:30-47` | Its `fullText` is hashed into `resource:<resource_id>` delivery-ledger keys |
| Eager-bundle discovery | `src/tools/workflow-tools.ts:787`, `scripts/run-token-benchmark.ts:345` | Via `extractResourceIds`; its id regex rejects `/` inside the section part |
| Anchor guard | `scripts/check-resource-anchors.ts` | Own divergent slugger; asserted hard-zero by `tests/resource-anchors.test.ts` |

The corpus itself is a **git submodule** (`workflows`, branch `workflows`), separate from the code repo. Existing section coverage is `tests/extract-section.test.ts` (2 cases). The project carries five runtime dependencies and no `github-slugger`.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | High |
| Scope | Every workflow that addresses a resource by `#section`. Measured on the current corpus: 5 of 403 unique anchor links resolve to `null` at runtime (2 of them CI-approved, so invisible); 10 duplicate heading slugs sit in `resources/` directories, and **7 live references actually target one** — all in `prism-evaluate`, where a template file carries its own title as both an H1 and an H2. |
| Business Impact | Two distinct failure modes, neither caught by CI. A hard failure aborts the tool call mid-workflow. The subtler one is **silent over-delivery**: `evaluation-report-template.md#evaluation-report-template` looks precise and CI approves it, but first-match binds the H1 at line 9 whose body runs to EOF, so the caller receives the whole ~88-line file instead of the `## Evaluation Report Template` section at line 17. The ref is not wrong-looking and nothing errors; the cost is context the task needed. The `injection-pattern-catalog.md` duplicates (7× `#grep-patterns`) have **zero** referencers precisely because the consumer gave up on anchors and loads all 326 lines — the same cost paid up front instead. |

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Complex

**Rationale:** Composite issue, classified by its centre of gravity. Five of seven acceptance criteria concern new path-scoped addressing, guard coverage, and tests — an improvement goal, consistent with the bound `issue_type: feature`. It embeds a separable known-cause defect (divergent sluggers plus a naive fence toggle) that the issue says to fix first, independently; that element read literally would classify as specific-cause-known, so the primary-type choice is recorded as assumption [DP-1](02-assumptions-log.md) and was confirmed by the user rather than revised.

Complex, not simple, on five independently sufficient grounds:

1. **Open architectural decision delegated to us** — the section-path delimiter (`/` vs `::`); the issue states "Decide on adoption".
2. **Multiple viable approaches to AC 1** — extract one shared slugger module, have the guard resolve through the runtime resolver, or adopt `github-slugger` as a new dependency.
3. **A genuine requirements contradiction** — adopt GitHub slug semantics *and* keep `resource-delivery` hashes byte-identical for existing refs. Both are acceptance criteria; they pull against each other and must be reconciled explicitly.
4. **Objective complexity signal** — gitnexus upstream impact on both target symbols reports risk **CRITICAL**: 18 impacted symbols for `extractMarkdownSection`, 17 for `parseResourceRef`, 10 execution processes and 4 modules affected. The issue's "contained to `src/utils/resource-ref.ts`" describes the edit surface, not the blast radius, which reaches the delivery-ledger hashing path.
5. **Cross-repo change from a red baseline** — code in the main repo, corpus in the `workflows` submodule, and `tests/resource-anchors.test.ts` already fails on three pre-existing broken anchors that must be fixed or explicitly descoped for the hard-zero guard to pass.

## Workflow Path Decision

**Selected Path:** Full workflow

**Activities Included:**
- [x] Requirements Elicitation
- [x] Research
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** Confirmed by the user at the classification checkpoint. Elicitation is needed not to discover requirements — the acceptance criteria are unusually explicit and out-of-scope is stated — but to settle decisions only the user can make: the delimiter choice, which AC-1 slugger strategy to take, how to reconcile GitHub slug semantics against the byte-identical delivery-hash invariant, whether the three pre-existing red anchors are in scope, and how the two-repo change is sequenced. Research is non-vacuous: exact `github-slugger` semantics (punctuation stripping, Unicode, and how per-document `-N` dedupe counters interact with path scoping) and CommonMark's closing-fence rules must be pinned before AC 1 and AC 6 are testable at all. Codebase comprehension is mandatory on every path and is load-bearing here, because the blast radius reaches the delivery-ledger hashing path and a consumer the issue does not name.

The complexity assessment also scopes how much of the design framework applies at plan time: complex admits inventive solutions alongside problem definition, classification, conventional solutions, and synthesis.

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | None imposed. The issue notes Defect 2 is not blocking any current PR, so sequencing is free — but Defect 1 is a live correctness bug and should land first and separately. |
| Technical | Single-segment refs must behave exactly as today, and resolution must stay fence-aware. On the delivery-hash invariant, note the mechanism before treating it as a correctness gate: `deliveredContent[agentId][key] = hash` (`src/utils/delivery.ts:42-55`), so a changed `fullText` for an existing `resource:<resource_id>` key simply **fails to match and re-delivers in full** — graceful degradation costing tokens, not breakage. The real correctness exposure is different and sharper: if adopting GitHub slug semantics makes an existing single-segment ref resolve to a *different section*, callers silently get different content. That is what must be pinned, and this session's own `session.json` already carries 10 persisted `resource:*` keys, so the surface is live. |
| Dependencies | The corpus is the `workflows` submodule; the feature worktree's `workflows/` directory is empty and the worktree has no `node_modules`, so guards and tests run from the main repo via the guard's `--root` flag. Corpus-side acceptance criteria need the submodule initialised in the worktree or a separate workflows-branch worktree plus a pointer bump. |
| Resources | Adding an npm dependency is not free — the sandbox is offline and the project deliberately carries five runtime dependencies — which biases AC 1 toward extracting a shared slugger over adopting `github-slugger`. |

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria) once elicited.

## Notes

Verified during classification, by execution against the current corpus rather than read from the issue — carry into elicitation and research:

- **Two issue claims did not fully reproduce.** `resources: [id#section]` array entries number **zero** in the corpus, so AC 6's coverage of them is latent rather than live. The nested-fence guard gap is real but yields exactly **one** hidden link — `work-package/resources/architecture-summary.md:214 -> work-package-plan.md#dependencies--risks`, a genuine missing-file break, since the file is `wp-plan.md` — not a broad class. Both acceptance criteria should be re-derived against these numbers.
- **A consumer the issue omits.** `extractResourceIds` (`src/utils/resource-ref.ts:72-94`) rejects `/` inside the section part, so path-scoped refs would be silently dropped from eager-bundle discovery.
- **The two CI-approved / runtime-`null` links need no corpus edit** if the runtime adopts GitHub semantics — they are already GitHub-correct. The three guard-red links are separate, genuine heading breaks.
- This planning folder's README links to `design-philosophy.md` and `assumptions-log.md` without the `NN-` prefix the on-disk convention uses; the links are broken as written.
- The assumption challenge pass narrowed the case for Defect 2 specifically: every corpus case the issue cites for hierarchical addressing proved reachable without it. Four assumptions remain open for elicitation, including whether path-scoping should be built in this package at all. The complexity classification above is unaffected — it rests on the delimiter decision, the AC 1 strategy choice, the blast radius, and the cross-repo red baseline, all of which stand regardless. See [02-assumptions-log.md](02-assumptions-log.md), which is the record of truth for the assumptions.
