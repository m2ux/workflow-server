# Requirements Elicitation: Hierarchical Path-Scoped Resource Section References

> 2026-07-27 · Confirmed · #141

## Problem Statement

A resource section is addressed by one flat GitHub-style slug (`id#slug`), and two independent slug implementations disagree: the runtime resolver collapses whitespace runs and has no duplicate-heading dedupe, while the CI guard follows GitHub semantics. A link can therefore pass every automated check and still resolve to `null` at agent runtime — two such links are live in the corpus today, and 75 further resource headings slug differently under the two implementations, so the next GitHub-correct link written against them re-creates the defect. Separately, when a file repeats a heading slug the resolver silently binds the first match and returns its whole body, so a precise-looking ref over-delivers an entire file — 7 live references do exactly this, and nothing in CI can see it.

## Goal

One slug specification, honoured identically by the guard and the runtime, with CI able to prove it. Every anchor the guard approves resolves at runtime, and an anchor that cannot identify one heading fails loudly instead of silently returning the wrong content. Every reference that resolves today resolves to byte-identical content afterwards.

Hierarchical path-scoped addressing — the issue's Defect 2 — is **deferred out of this package** (see [Deferred](#deferred)). Measurement during elicitation showed every case the issue cites for it is reachable without new syntax.

## Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| Workflow author | To write an anchor link once and have it work in the editor, on GitHub, and at agent runtime — without knowing which of two slug rules applies | As a workflow author, I want one slug rule so that a link CI accepts is a link the runtime resolves |
| Executing agent | To receive the section it asked for, or a clear error — never a silently larger or different slice | As an agent, I want `get_resource { resource_id: "x#y" }` to return exactly `#y` or fail loudly, so that I do not silently burn context on a whole file |
| CI / the anchor guard | To be able to fail on the defect class it exists to catch, including anchors that resolve to the wrong heading | As the guard, I want to assert the runtime actually resolves what I approve, so that I stop certifying links that fail in production |

### Secondary Stakeholders

- **`prism-evaluate` workflow owner** — owns the deliberate H1/H2 duplicate-title convention in all three template resources ([DP-14](02-assumptions-log.md)). The chosen approach repoints the 7 referring links to their `-1` form and leaves that convention untouched, so this owner's agreement is no longer on the critical path.
- **`cicd-pipeline-security-audit` workflow owner** — owns `injection-pattern-catalog.md`, the one file where hierarchical addressing would beat positional `-N`. Deferred (register [D-6](deferred-items.md)).

## Context

### Integration Points

- **`src/utils/resource-ref.ts`** — `parseResourceRef`, `extractMarkdownSection`, `extractResourceIds`; the sole runtime resolver and the primary edit site.
- **`scripts/check-resource-anchors.ts`** — the CI guard, with its own divergent slugger and its own `-N` dedupe counting pass; asserted hard-zero by `tests/resource-anchors.test.ts`.
- **`src/tools/resource-tools.ts` (`get_resource`)** — throws when a section resolves to `null`; the loud consumer.
- **`src/utils/resource-delivery.ts` → `src/tools/workflow-tools.ts` (eager bundling)** — reproduces `get_resource`'s exact `fullText` so both share `resource:<id>` ledger keys; silently skips a failed lookup.
- **`workflows/` submodule** — the corpus every link lives in, versioned independently of the code.

### Dependencies

- The corpus is the `workflows` git submodule (branch `workflows`). Every corpus-side criterion requires a prepared submodule worktree plus a pointer bump.
- No markdown library and no `github-slugger`: every markdown parse in the codebase is hand-rolled regex.

### Constraints

- **Technical:** Single-segment refs must resolve to byte-identical content, and resolution must stay fence-aware. The `resource:<id>` delivery-ledger key is ref-keyed, not content-keyed, so changed bytes cost tokens rather than correctness ([DP-3](02-assumptions-log.md)) — but a ref resolving to a *different section* is a real correctness exposure and is what must be pinned.
- **Timeline:** None imposed. Defect 1 is a live correctness bug; the issue itself says to land it first and separately.
- **Resources:** Adding an npm dependency is not free — the sandbox is offline and the project deliberately carries five runtime dependencies. `github-slugger` is rejected on this basis; see the accepted limitation in [SC-8](#success-criteria).
- **Baseline:** `tests/resource-anchors.test.ts` is RED today on three pre-existing links. A strengthened guard cannot merge red, so the baseline is a gate, not a backlog item.

## Scope

### In Scope

1. **One shared slugger module**, seeded from the guard's GitHub-accurate implementation and imported by both `scripts/check-resource-anchors.ts` and `src/utils/resource-ref.ts`. The runtime gains full GitHub semantics: no whitespace-run collapse, and `-N` dedupe suffixes resolvable as addresses. No new npm dependency.
2. **A differential guard check** — the guard asserts the runtime resolver returns non-`null` for every `resources/*.md` link it approves. The guard retains its own slug and `-N` counting pass so it remains an independent oracle.
3. **A third guard reason, `ambiguous-anchor`**, so that a link whose bare slug targets a heading with duplicates turns CI red instead of silently over-delivering. This is a **guard capability, not a resolver behaviour** ([RE-2](02-assumptions-log.md)): the runtime keeps GitHub `-N` semantics exactly and does **not** throw on a bare slug that legally denotes the first of N, because doing so would make a guard-valid, GitHub-valid link fail at runtime — the very divergence class this package exists to end ([RE-1](02-assumptions-log.md)). `BrokenAnchor`'s current vocabulary (`missing-file` / `missing-anchor`) cannot express "resolves, but to the wrong heading", which is why the class is invisible to CI today.
4. **Repoint the 7 live over-delivering `prism-evaluate` refs** to their `-1` disambiguated form. Derived requirement, not stated in the issue, and confirmed as standing: items 2 and 3 both turn these 7 links red, so repointing them is a **merge gate in this package, not optional corpus polish** ([RE-3](02-assumptions-log.md)).
5. **Fix the 3 currently-red anchor links** in the corpus (`dispatch-activity.md#accumulate-trace-tokens`, `assumptions-review.md#open-assumptions`, `test-suite-review.md#test-suite-review-report-template`).
6. **Prepare a `workflows`-branch worktree**, make all corpus edits there, and bump the submodule pointer. This is a task in the package, not an assumed precondition.
7. **Tests** covering duplicate leaf slugs, `-N` addressing, single-segment back-compat, fenced-code headings being ignored, and slug parity between guard and runtime. `tests/extract-section.test.ts` grows from its current two cases.
8. **Measure the fence-hardening exposure** — count the anchor links a CommonMark-correct fence tracker newly exposes across the corpus. An implementation-analysis task, and the only part of the fence work committed here ([SC-9](#success-criteria)).
9. **`resources: [id#section]` array coverage** in the guard — independent of fence handling and of path syntax; latent today (zero such entries in the corpus) but cheap alongside the guard changes already in scope.

### Out of Scope

1. **Path-scoped hierarchical section addressing** — the issue's Defect 2, its third acceptance criterion, the multi-segment half of its fourth, and the path-ref half of its sixth. Deferred; every measured case proved reachable without it.
2. **Adopting `github-slugger`** — offline sandbox and a deliberately lean five-dependency runtime.
3. **Refactoring any workflow's resource files or their referencers** — the issue's own out-of-scope section, including splitting `injection-pattern-catalog.md` referencers onto per-pattern anchors.
4. **Renaming the `prism-evaluate` duplicate H1/H2 headings** — a deliberate, thrice-repeated convention ([DP-14](02-assumptions-log.md)); superseded by repointing to `-1`.
5. **Nested resource directories** (`resources/<sub>/<id>.md`, where `sub` is misread as a workflow) — zero occurrences, same regexes, not an acceptance criterion.
6. **Widening `extractMarkdownSection` to a diagnostic `Result`** — only needed to distinguish multi-segment failure modes, which leave with Defect 2.
7. **A runtime error on an ambiguous bare slug** — rejected as a design, not merely descoped: it would introduce a fresh guard-valid / runtime-error divergence ([RE-1](02-assumptions-log.md)). The resolver's GitHub semantics stay exactly faithful.
8. **Committing the guard's fence hardening** — held pending the measurement in [In Scope](#in-scope) item 8 ([RE-5](02-assumptions-log.md)); a strengthened guard cannot merge red, so the count decides whether it lands here or alongside register row [D-2](deferred-items.md).

### Deferred

Deferred scope items: [deferred-items register](deferred-items.md) — record each item there, not here.

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | Exactly one slug implementation exists in the repository, imported by both the guard and the runtime | Grep for slug-producing functions returns one definition; both call sites import it; unit tests pin GitHub semantics (`Plan & Prepare` → `plan--prepare`, tab handling, `-N` dedupe) |
| SC-2 | The two guard-approved / runtime-`null` corpus links resolve, and slug parity is pinned against regression | Direct resolver assertion on `activities/README.md#06-plan--prepare` and `resources/README.md#planning-artifact--guide-map` — **not** via `get_resource`, since both target `README.md` files the loader never opens ([RE-7](02-assumptions-log.md)); plus a parity test over the corpus heading set |
| SC-3 | Every guard-approved link targeting a `resources/*.md` file resolves at runtime | New guard collector + sibling hard-zero test returns `[]` against the corpus at the bumped pointer |
| SC-4 | An anchor whose bare slug targets a heading with duplicates is **merge-blocking in CI**, and the 7 live over-deliveries are eliminated | `check:anchors` reports the new `ambiguous-anchor` reason for such links and the sibling hard-zero test fails on them; the 7 refs resolve to their intended H2 after repointing to `-1`. Verified at the guard, **not** by a resolver throw — the runtime deliberately keeps GitHub `-N` semantics ([RE-1](02-assumptions-log.md), [RE-2](02-assumptions-log.md)) |
| SC-5 | Every ref that resolves today resolves to byte-identical content, so `resource:<id>` hashes for existing refs are unchanged | Corpus-wide differential over resolved bytes before/after (0 regressions and 0 collision-splits are already measured — comprehension Q2); hash stability follows from content stability, so no live-session replay is required ([RE-6](02-assumptions-log.md)) |
| SC-6 | `tests/resource-anchors.test.ts` is green at merge | `npm run check:anchors` exits 0 with the submodule pointer bumped; requires the 3 red links fixed and the 7 refs repointed |
| SC-7 | Tests cover duplicate leaf slugs, `-N` addressing, single-segment back-compat, and fenced-code headings | `tests/extract-section.test.ts` case count and content review; no nested-path cases (deferred) |
| SC-8 | The slugger's known divergences from real `github-slugger` are documented as accepted limitations, not silently owned | Unicode-letter stripping and inline-markdown reduction (`## [Foo](bar)` → `foobar`, GitHub gives `foo`) recorded in register row [D-5](deferred-items.md); both are zero-occurrence in resource files today |
| SC-9 | The number of anchor links a CommonMark-correct fence tracker newly exposes is measured and recorded, and the fence-hardening decision is taken against that number rather than ahead of it | A counted, enumerated list produced as an implementation-analysis task. The fence half of AC 6 is committed only if that count is tractable within this package; otherwise it defers to register row [D-2](deferred-items.md). Nothing else in scope depends on the outcome ([RE-5](02-assumptions-log.md)) |
| SC-10 | The code change and the corpus remediation land as separate commits | Commit log: shared slugger + runtime semantics + differential check in the code repo; 3 red-link fixes + 7 repoints in the corpus submodule; no Defect 2 commit exists in this package ([RE-10](02-assumptions-log.md)) |

## Assumptions

Assumptions surfaced during elicitation: [assumptions log](02-assumptions-log.md) — record each there (categories: Requirement Interpretation, Scope Boundaries, Implicit Requirements, Success Criteria Interpretation), not here.

## Elicitation Log

### Questions Asked

| Domain | Question | Response Summary |
|--------|----------|------------------|
| Problem | Which of the issue's two defects is the live problem worth solving now? | Defect 1 only, plus making ambiguous flat slugs fail loudly. Defect 2's addressing capability is deferred — user decision D4, option (d) |
| Problem | What happens if the slug divergence is left alone? | 75 resource headings slug differently under the two implementations; CI actively teaches authors GitHub semantics the resolver does not honour, so the next GitHub-correct link re-creates the defect. Repairing the current two links is not the justification — preventing the next occurrence is |
| Stakeholder | Whose agreement does the fix need? | Repointing to `-1` avoids the `prism-evaluate` heading convention entirely, taking that owner off the critical path. The `cicd-pipeline-security-audit` owner is only involved in the deferred work |
| Context | Where does the change have to land, given the corpus is a submodule? | A `workflows`-branch worktree is prepared as a package task, corpus edits go there, then the pointer is bumped — user decision D5, option (a) |
| Context | Is a new dependency acceptable to get exact GitHub slug fidelity? | No. One shared internal module seeded from the guard's implementation, plus the guard asserting the runtime resolves what it approves — user decision D2, option (a) + the strong half of (b). The resulting fidelity obligation is accepted and recorded |
| Scope | Are the pre-existing red anchor links this package's problem? | Yes for the 3 currently red; the hidden 4th is deferred — user decision D3, option (c) |
| Scope | Does the guard's fence hardening come along? | Conditionally. Its corpus cost is unmeasured and a stronger guard cannot merge red, so the count must be produced before it is committed |
| Success | How is "hashes unchanged" verified without replaying a live session? | It reduces to content stability, which is already measured as zero-change corpus-wide; a byte-level differential suffices |
| Success | How is the ambiguity fix verified, given the guard currently approves the ambiguous form? | The differential check turns those links red, which is what makes the 7 repoints a gate rather than an improvement |

### Clarifications Made

- **The issue's strongest case for hierarchy does not need hierarchy.** `substrate-node-security-audit/resources/static-analysis-patterns.md` — the "eight sweeps all pointing at the same ~100-line `#grep-patterns`" case — has 13 `###` leaves under `## Grep Patterns`, every one with a **file-unique slug**. All 8 links can be repointed to unique flat anchors today with zero code changes, and they stay GitHub-clickable.
- **The second duplicate-slug file has no live victim.** In `intermediate-artifact-schemas.md` (`field-descriptions` ×5), all 12 live referencers target other, unique anchors. Zero live refs hit a duplicate.
- **3 of the 4 known anchor breaks are one previously-unnamed class: links into a heading that exists only inside a fenced template body.** `assumptions-review.md#open-assumptions` (line 70, inside fence 46–91), `test-suite-review.md#test-suite-review-report-template` (line 51, inside fence 50–147), and the hidden 4th `wp-plan.md#dependencies--risks` (line 65, inside fence 16–77). The corpus convention of wrapping guide templates in fences is what generates the class, and fence hardening will expose more of it — which is why SC-9 exists.
- **The remaining case for hierarchy is one file with no anchored consumer.** `injection-pattern-catalog.md` (7× `### Grep Patterns` under `## P1`–`## P7`) is the only place a path ref beats a positional `-N` ref on meaning and stability — and its consumer (`load-patterns.md:14`) loads all 326 lines with no anchor, so nothing breaks today and repointing it is a referencer refactor the issue excludes.
- **AC 1 and AC 4 do not actually conflict.** The "adopt GitHub semantics *and* keep hashes byte-identical" contradiction recorded at design philosophy dissolves on measurement: adopting GitHub semantics changes the resolved content of zero existing refs, so hash stability is satisfied automatically rather than traded against.

### Open Questions Resolved

- **Comprehension Q9** (which of the 3 red anchors are in scope): all 3, with the hidden 4th deferred — user decision D3(c).
- **DP-5** (delimiter): deferred with Defect 2. If path-scoping is later built, assume `/`, confined to tool calls and `resources: [...]` entries and never prose links, because no hierarchical syntax can be GitHub-clickable.
- **DP-6** (slugger strategy), **DP-7** (red-baseline scope), **DP-10** (whether path-scoping belongs here): all resolved by user decision; see the log.

- **[RE-2](02-assumptions-log.md)** (how the loud ambiguity failure is realised): guard reason only. `ambiguous-anchor` makes the over-delivery class merge-blocking in CI, while the resolver keeps GitHub `-N` semantics exactly — so the package adds no divergence of its own. Also closes comprehension Q10.
- **[RE-5](02-assumptions-log.md)** (whether fence hardening lands here): measure first. The exposure count is an implementation-analysis task (SC-9) and the criterion is conditional on it.

### Requirements Not Taken

Recorded because they were live candidates, not oversights:

- **A runtime error on an ambiguous bare slug.** The intuitive reading of the issue's fifth criterion, and rejected on analysis: under the GitHub semantics the first criterion adopts, a bare `#slug` legally denotes the first of N, so a resolver throw would fail a link that both GitHub and the guard accept. That is the same defect shape as Defect 1, relocated. The check belongs where the intent mismatch is visible — the guard.
- **Landing fence hardening on the strength of the one link the issue cites.** The known breaks show the exposure is a systemic class, not a single case, so the criterion is gated on a count rather than an estimate.

## Confirmation

**Confirmed by:** User — decisions D1–D5 at the `stakeholder-transcript` gate, and RE-2 / RE-5 at the `elicitation-complete` gate
**Date:** 2026-07-27
**Notes:** Stakeholder discussion was skipped (`has_stakeholder_input = false`), so requirements rest on the issue, the [comprehension artifact](../../comprehension/resource-section-addressing.md), corpus measurement, and the user's direct decisions rather than on independent stakeholder input. No assumptions remain open. The one dependency on an owner outside this package — the `prism-evaluate` duplicate-title convention — was designed around rather than negotiated: the 7 refs are repointed to `-1` and the headings are left untouched.
