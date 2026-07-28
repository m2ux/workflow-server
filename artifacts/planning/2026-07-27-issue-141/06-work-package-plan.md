# Hierarchical Path-Scoped Resource Section References - Implementation Plan

> plan · HIGH · Ready · 5-8h agentic + 2h review · 2026-07-27

## Overview

### Problem & Scope

Problem, scope, and success criteria: [requirements](03-requirements-elicitation.md). Path-scoped addressing (the issue's Defect 2) is deferred — [D-1](deferred-items.md).

## Inputs

- [Requirements — In Scope 1–14](03-requirements-elicitation.md#in-scope) — the committed item list this breakdown covers one-for-one; nothing here widens it.
- [Implementation analysis — Plan Preconditions](05-implementation-analysis.md#plan-preconditions) — five inherited decisions; the fence/ATX/remedy unit and the commit split follow them.
- [Implementation analysis — Gap Analysis](05-implementation-analysis.md#gap-analysis) — G1/G2 set the coupling, G3/G4 the baseline position, G7 the fence test strategy, G10 the sizing of In Scope item 9.
- [Implementation analysis — Measurement Strategy](05-implementation-analysis.md#measurement-strategy) — probe 3 becomes Task 2's deliverable; probes 1, 2, 5 and 9 become the re-run set.
- [KB research — Recommended Approach](04-kb-research.md#recommended-approach) — the module shape, the Unicode strip class, the skip loop, the §2c fence tracker.
- [KB research — Applicable Design Patterns](04-kb-research.md#applicable-design-patterns) — the anchor table as the shareable unit is the pattern that decided the design.
- [Comprehension — resource section addressing](../../comprehension/resource-section-addressing.md) — the seven-stage pipeline and the dual-resolution property the design must not break.

## Proposed Approach

### Solution Design

**One shared module — `src/utils/heading-anchors.ts` — is the design.** It exports `slug(renderedText)` (no trim; strip class `/[^\p{Alphabetic}\p{M}\p{Nd}\p{Pc} -]/gu`; `/ /g`, no run collapse), `renderInline(text)` (reduces `!?[text](url)` to `text` before slugging), `stripFrontmatter(raw)`, `fenceMask(text)` (the CommonMark 0.31.2 §4.5 tracker), and `buildAnchorTable(text) → Array<{slug, baseSlug, level, lineIndex}>` carrying `github-slugger`'s exact stateful counter **including the skip loop**. The shareable unit is the *table*, not the slug function: `-N` resolution is a whole-file property and the `ambiguous-anchor` predicate needs base-slug multiplicity, neither expressible per-heading.

Three consumers then shrink rather than grow. `extractMarkdownSection` becomes a table lookup plus a window computed from `lineIndex`/`level`, deleting its inline slugger and **both** of its independently-desyncing fence scans. The guard drops its own `slugify` and its counter, keeps its corpus-scanning pass, and adopts the shared tracker in its link scanner too. A second exported collector in the guard resolves every approved `<wf>/resources/<id>.md` link through the **real** loader and resolver, so the guard asserts the runtime resolves what it approves; the check is not tautological because input normalisation, file resolution and window computation still differ, and that is precisely where the residual split lives.

Directional strictness is preserved deliberately: the guard gains a third reason, `ambiguous-anchor`, over **base** slugs; the resolver keeps GitHub `-N` semantics exactly and never throws on a bare slug that legally denotes the first of N. The resolver additionally lowercases the incoming anchor, so guard-approved ⊆ runtime-resolvable by construction rather than by luck (0 mixed-case corpus anchors today — prevention, the same shape as the 75-heading gap).

Fence hardening, ATX 0–3-space indentation and the 2-line corpus remedy are **one unit** in one module and one commit, with no flag selecting between them, because the measured 2×2 has exactly one strictly-worst cell and a severable design is what would reach it.

Two things this deliberately does not unify. `splitSections` — the fourth heading parser, in the technique loader — keeps its own matching and stays fence-blind; it is insulated by exact-title matching and is not on the resolution path, so folding it in would widen the blast radius for no criterion. And the guard keeps its **corpus-scanning** pass (walk, link extraction, per-file table construction, GitHub verdict); what it gives up is only its slug specification.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Shared module exporting `slug` + `buildAnchorTable`; differential guard check; guard-only `ambiguous-anchor`; fence work on both surfaces + corpus remedy | Satisfies every criterion at once; removes 2 of 4 heading parsers and 2 of 3 fence toggles | Needs a corpus commit in a second repo; edits two files owned elsewhere | **Selected** |
| Share only `slug()`; guard keeps its own anchor collector | Preserves an independent oracle at the table level | Leaves the unfaithful `-N` counter duplicated; cannot express the base-slug predicate ([RS-5](02-assumptions-log.md), [RS-12](02-assumptions-log.md)) | Rejected |
| Harden the fence tracker in the guard only | Same +1 verdict, 0 SC-5 exposure, no corpus edit | Keeps two fence trackers — the split this package exists to end — and forces ATX indent to column 0 | Rejected at [IA-11](02-assumptions-log.md) |
| Adopt `github-slugger` | Exact fidelity, zero maintenance | Offline sandbox; deliberate five-dependency runtime | Rejected ([Out of Scope](03-requirements-elicitation.md#out-of-scope) 2) |
| Runtime throw on an ambiguous bare slug | One loud failure, no guard change | Fails a link GitHub and the guard both accept — Defect 1 relocated ([RE-1](02-assumptions-log.md)) | Rejected on design |
| Edit the 2 divergent corpus links to the collapse form, change no code | Two characters; zero regression risk | Leaves the 75-heading latent gap and CI teaching semantics the resolver ignores | Rejected |

### Assumptions

Assumptions underlying the approach: [assumptions log](02-assumptions-log.md) rows PL-1..PL-13.

## Implementation Tasks

### Task 1: Prepare the corpus worktree (10-20 min)
**Goal:** A `workflows`-branch checkout of the corpus submodule at the feature worktree's empty `workflows/` path, so guards and tests resolve the corpus in place.
**Deliverables:**
- `.worktrees/2026-07-27-issue-141/workflows/` — populated, on branch `workflows`, at pointer `d9b30234`
- In-place placement is required, not stylistic: two guard tests hardcode `../workflows` and ignore `WORKFLOWS_DIR` ([D-10](deferred-items.md)), so any other placement leaves them vacuous

### Task 2: SC-5 measurement instrument (30-45 min)
**Goal:** Make [SC-5](03-requirements-elicitation.md#success-criteria) a re-runnable assertion instead of a one-off narrative, and capture the "before" manifest while the code is still unchanged.
**Deliverables:**
- `scripts/resource-ref-manifest.ts` — enumerates the addressable ref population (authored resource-target links + every resource file × every guard-approved anchor + every bare id) and emits `ref → status, hash, bytes` through the real `loadResourceDelivery` with `sessionIndex` pinned
- Deliberately **not** a hard-zero guard with a committed baseline: a corpus-pointer-keyed baseline goes stale on every submodule bump, which is [D-10](deferred-items.md)'s vacuity shape

### Task 3: Shared anchor module (60-90 min)
**Goal:** One GitHub-faithful slug specification and one anchor table, owned in one place.
**Deliverables:**
- `src/utils/heading-anchors.ts` — `slug`, `renderInline`, `stripFrontmatter`, `fenceMask`, `buildAnchorTable`, and an `ambiguousBaseSlugs(table)` helper
- Module docstring naming the two accepted deviations from CommonMark (no container-block-relative fence indentation; no tab-stop expansion) with their measured zero-occurrence bound, and the two seeding corrections (skip loop; `.trim()` in the extractor, never in `slug`)
- `stripFrontmatter` mirrors `resource-loader.ts`'s frontmatter regex and stays a *sibling* export rather than being folded into `buildAnchorTable`, so no body can be stripped twice

### Task 4: Runtime resolver on the shared table (30-45 min)
**Goal:** The resolver gains full GitHub semantics and loses its duplicate parsers.
**Deliverables:**
- `src/utils/resource-ref.ts` — `extractMarkdownSection` rewritten as table lookup + window; inline `slugify` and both fence scans deleted; incoming anchor lowercased; final `.trim()` on the returned section retained for byte-identity

### Task 5: Guard on the shared table, plus the differential and ambiguity checks (60-90 min)
**Goal:** The guard stops owning a slug specification and starts asserting the runtime honours the one that remains.
**Deliverables:**
- `scripts/check-resource-anchors.ts` — imports the shared module; link scanner uses `fenceMask`; `BrokenAnchor.reason` gains `ambiguous-anchor` (predicate: the link's bare anchor equals a base slug carried by ≥2 headings); header comment states the differential check's scope where the "imports nothing from `src/`" rationale currently sits
- Second exported collector resolving every approved `<wf>/resources/<id>.md` link through `readResourceStructured` + `extractMarkdownSection`; the CLI reports both collectors so one command remains the merge gate
- A scanning pass for `resources: [id#section]` array entries — sized as pure forward-proofing (0 corpus instances, 0 producers, [G10](05-implementation-analysis.md#gap-analysis))

### Task 6: Tests and the stale-fixture repoint (90-120 min)
**Goal:** Pin the semantics against the reference implementation's own fixtures, and restore the regression net on the tool being changed.
**Deliverables:**
- `tests/heading-anchors.test.ts` — new; `github-slugger` fixture pairs, the five-row `echo` sequence, no-trim rows, the Unicode class, inline reduction, ATX indentation and closing sequences, the fence tracker's five fixed errors, and characterisation fixtures for its two accepted deviations
- `tests/extract-section.test.ts` — grows from 2 cases: duplicate leaf slugs, `-N` addressing, single-segment back-compat, fenced-code headings, plus both [SC-2](03-requirements-elicitation.md#success-criteria) links by the strongest method each admits
- `tests/resource-anchors.test.ts` — sibling hard-zero for the differential collector; `ambiguous-anchor` and base-slug false-positive fixtures
- `tests/mcp-server.test.ts` — the 3 `get_resource` cross-workflow cases repointed off the removed `meta/activity-worker-prompt` fixture onto `meta/bootstrap-protocol`

### Task 7: Corpus remediation (20-30 min)
**Goal:** Turn the guard green under the strengthened rules and remove the fence work's only content exposure.
**Deliverables:**
- `meta/techniques/workflow-engine/workflow-orchestrator.md` — the `#accumulate-trace-tokens` parenthetical repointed to `#protocol`, where the accumulate half is actually stated; no rule heading is invented, because `resolve-trace-at-close-out` already declares it owns that half and a sibling rule would duplicate the Protocol
- `work-package/techniques/review-assumptions/interview.md` → `#assumptions-log-template`; `work-package/techniques/review-test-suite.md` → `#report-template` — both former targets exist only inside fenced template bodies
- 7 `prism-evaluate` link sites (3 distinct ref strings) repointed to their `-1` form — the producer half already admits it: `rewriteResourceLinks`' anchor class `(#[A-Za-z0-9_-]+)?` and `extractResourceIds`' `#[a-z0-9][a-z0-9_-]*` both accept a trailing `-1`, so the repointed links still rewrite and are still discovered for eager bundling
- `cicd-pipeline-security-audit/resources/cicd-audit-report-template.md` (18, 111) and `work-package/resources/architecture-summary.md` (66, 227) — outer ```` ```markdown ```` fences and their closers widened to four backticks, the idiom `scope-manifest.md` already uses

### Task 8: Submodule pointer bump (5-10 min)
**Goal:** Publish the remediated corpus to the code repo as its own reviewable, bisectable commit.
**Deliverables:**
- `workflows` submodule pointer advanced to the Task 7 commit, in a commit separate from Tasks 2–6

### Task 9: Publish the resolution contract (15-25 min)
**Goal:** `-N` addressability is a new agent-facing capability that nothing currently documents, and the published contract is presently false for the runtime.
**Deliverables:**
- `docs/resource_resolution_model.md` — the `#section` "GitHub-style heading slug" sentence made true, plus `-N` disambiguation published as part of the contract ([RS-11](02-assumptions-log.md))

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria); baselines and measurement: [implementation analysis](05-implementation-analysis.md#baseline-metrics). Task-level acceptance items that live nowhere else:

- The shipped configuration can never be naive-fence + ATX-indent: one module, one commit, no selecting flag ([G2](05-implementation-analysis.md#gap-analysis)).
- The package fixes **4** of the 18 baseline failures — `resource-anchors` ×1 and the 3 `get_resource` fixture cases — and documents **14** as pre-existing ([G3](05-implementation-analysis.md#gap-analysis), [G4](05-implementation-analysis.md#gap-analysis), [D-7](deferred-items.md)). `reference-delivery.test.ts`'s 3 reds assert `activity_rules` / `bundle:rules` markers and do not blind the `resource:` channel; Task 2's manifest is that channel's actual detector.
- Both fence-tracker deviations appear in the module docstring and in a characterisation fixture ([G7](05-implementation-analysis.md#gap-analysis)).
- In Scope item 9 lands as one scanning pass plus one fixture, sized as forward-proofing ([G10](05-implementation-analysis.md#gap-analysis)).

## Testing Strategy

Test cases and acceptance matrix: [test plan](06-test-plan.md). Ordering and fixture constraints it does not carry:

- Task 1 precedes every guard or test run; Task 2 precedes Tasks 3–5 so the "before" manifest is captured pre-change, and its fingerprint is compared against the recorded `sha256 891248…52c6` / 1,232 ok / 101 FAIL as a fidelity control before any after-run is believed.
- Task 7 precedes the final guard run, and the guard is re-measured **after** the corpus edits, not only before them ([probe 9](05-implementation-analysis.md#measurement-strategy)) — the remedy moves the input the guard walks.
- The 2×2 lever attribution is a measurement performed on scratch copies, never a shipped switch.
- **Neither commit order is individually safe, so both must reach the default branch in one merge** ([PL-15](02-assumptions-log.md)). Corpus-first leaves the 3 repointed `-1` refs unresolvable to today's resolver, which has no counter — `get_resource` would throw for them until the code lands. Code-first leaves `check:anchors` red on the 3 links and 7 ambiguous anchors until the corpus lands. On the branch itself the pointer bump precedes the code commit, so no branch commit is red for a reason the next one fixes.

## Dependencies & Risks

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| The delivered window rule differs from the prospective module the SC-5 predictions ran through ([IA-12](02-assumptions-log.md)) | HIGH | MEDIUM | Task 2 first; fixture conformance and per-file anchor-table parity against the shipped guard are gates before the corpus differential is read |
| Fence and ATX correctness land apart, reaching the one strictly-worst 2×2 cell | HIGH | LOW | One module, one commit, no flag; a fixture asserts indentation handling only inside a tracked fence context |
| The three red-link fixes change what their referencers deliver — all three former targets are unreachable for structural reasons, so each needs a new target chosen rather than a typo corrected | MEDIUM | MEDIUM | Target named per link in Task 7, each an existing rendered heading; no corpus content is invented ([PL-5](02-assumptions-log.md)) |
| A green run in the feature worktree is vacuous for the two tests that hardcode `../workflows` | MEDIUM | HIGH | Task 1 places the worktree in-place; [D-10](deferred-items.md) stays deferred but is not silently relied on |
| Widening two outer fences changes github.com rendering in files owned by other workflows | LOW | HIGH | Accepted at the [IA-11](02-assumptions-log.md) gate; restores each anchor table to exactly the shipped guard's |
| An intermediate state reaches the default branch: corpus-first makes 3 live refs throw at runtime, code-first leaves the merge gate red | HIGH | MEDIUM | Both land in one merge; the bump commit precedes the code commit on the branch ([PL-15](02-assumptions-log.md)). A squash collapses them, which is harmless — the [SC-10](03-requirements-elicitation.md#success-criteria) separation that matters is code-repo vs corpus-repo, and the corpus commit is in another repository |

**Status:** Ready for implementation
