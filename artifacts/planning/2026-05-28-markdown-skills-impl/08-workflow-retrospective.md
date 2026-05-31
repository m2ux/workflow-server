# Workflow Retrospective — Markdown Skills Migration

**Work Package:** Markdown Skills Migration (issue [#125](https://github.com/m2ux/workflow-server/issues/125))
**Session:** `SUQLKL` (work-package) under parent `F4346H` (meta)
**Duration:** 2026-05-28 → 2026-05-31
**Workflow path:** simple (skip-optional selected at `design-philosophy`)

---

## What went well

- **Wire-compatibility-first design.** Framing `projectSkillToToon` as the irreducible bridge up front meant behaviour preservation was testable as a hard contract (round-trip + real-content parity) rather than discovered late. The strategic review found 0 actionable scope issues partly because the design constraint was explicit from `01-design-philosophy.md` onward.
- **Two-PR phasing held.** Splitting content (`#127` → `workflows`) from source (`#126` → `main`) with an explicit merge order kept the transition non-breaking and made each PR independently reviewable. The README's "Branches & worktrees" section documented the coordination clearly.
- **Path-gating fit the work.** Classifying the package as simple and skipping optional activities (elicitation, research) avoided ceremony disproportionate to a mechanical-but-large refactor. The skip decision was made deliberately at a checkpoint, not by default.
- **Review findings were tractable.** Post-impl review surfaced only 2 Minor + 4 Nit + 2 Informational findings; both Minors were resolved in a single fix-cycle iteration. The byte-deterministic translator meant the large content delta could be spot-checked rather than line-reviewed.

## What could improve

- **The implement → post-impl-review → re-implement loop.** A critical-blocker checkpoint (`block-interview` → `critical-blocker`, 2026-05-29) sent work back from review into implementation. This is the workflow functioning as designed, but the blocker (F1 — numeric-resource-indexing / flat-shape conversion) was a design-level question that surfaced only at review. Earlier validation of the resource-id contract during `plan-prepare` might have caught it before implementation.
- **Test-case consolidation drifted from the plan.** The implemented suite folded several planned cases (TC-01/02 into real-content tests; TC-09 into a round-trip rather than stored `.toon` baselines; TC-10/11 into edge-case tests). The plan's per-case rows were left with a "links added after implementation" placeholder until this completion step. Updating the plan incrementally as tests landed would have kept it in sync.
- **Worktree git metadata is fragile across environments.** The feature worktree's `.git` pointer referenced a path (`/home/mike1/projects/dev/...`) that did not resolve in the completion environment, so git operations against the worktree failed and files had to be read directly from disk. Worktree path portability is worth hardening for resumed/handed-off sessions.

## Lessons learned

- **Contract-level questions belong in `plan-prepare`, not review.** The resource-id (numeric vs slug) decision drove a re-implementation loop. Surfacing "what is the canonical identifier contract?" as an explicit planning question would have front-loaded it.
- **A wire-stable projection layer is the cheapest migration insurance.** Pinning the new code to byte-equivalent output against captured baselines turned a high-blast-radius refactor (every `get_*` consumer) into a low-risk one. This pattern generalises to any source-format migration behind a stable interface.
- **Keep the test plan a living document.** When implementation consolidates cases, reflect it immediately so the plan stays an accurate map rather than a pre-implementation forecast that needs a reconciliation pass at completion.
- **Checkpoint replay on resume works.** The `submit-for-review` activity replayed `dco-sign-off` / `merge-strategy-reminder` / `review-received` / `review-outcome` cleanly across multiple resumes (visible in session history), confirming the server-managed checkpoint state survives interruptions without re-prompting the user.

## Process metrics

| Dimension | Observation |
|-----------|-------------|
| Activities completed | 10 (start-work-package → complete) |
| Re-implementation loops | 1 (critical-blocker at post-impl-review) |
| Review findings (post-impl) | 0 Critical / 0 Major / 2 Minor / 4 Nit / 2 Info — all Minors resolved |
| Review findings (strategic) | 0 actionable |
| Final test state | 329 passing / 4 skipped (pre-existing), no regressions |
| Source diff | 26 files, +2577 / −460 |
| Content diff | ~170 SKILL.md files across meta + 10 workflows |
