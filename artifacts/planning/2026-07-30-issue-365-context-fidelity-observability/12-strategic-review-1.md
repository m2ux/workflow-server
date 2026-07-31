# Strategic Review

> strategic-review · #365 context-fidelity-observability · main → feat/365-context-fidelity-observability · 2026-07-31 · agent

**Diff:** 16 files committed on tip, +753 / −82 (`origin/main...HEAD`). Working tree also carries unstaged validation tip: `site/api/tools.html`, `tests/e2e/__snapshots__/snapshot.test.ts.snap` (+67 / −59).

## Findings Summary

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Investigation Artifacts | 0 | — |
| Over-Engineering | 0 | — |
| Orphaned Infrastructure | 1 | Keep tip uncommitted until staged (or discard if regenerable noise) |
| Scope creep | 0 | — |
| PR body conformance | 6 | Refresh Final body before submit-for-review |
| Commit signatures | 5 | User decision at unsigned-commits-prompt |
| **Total** | **12** | |

## Orphaned Infrastructure

| File | Description | Action | Rationale |
|------|-------------|--------|-----------|
| `site/api/tools.html` + `tests/e2e/__snapshots__/snapshot.test.ts.snap` (unstaged) | Validation-era regen: tools.html drops stale “usage on next_activity” wording, documents DELTA/`artifacts_produced`/`agent_id`; e2e baseline flips several `manifestStatus` values from `valid` to `warning` (S2 undeclared-file warnings in the walk fixture). Present on disk, absent from tip commits. | Commit on feature tip before merge (user context: tip should include validation snapshot fixes if present) | Required for CI snapshot parity and for SC-6 site/doc alignment; not dead code — unfinished landing of validation output |

## Scope Assessment

All changes in scope — minimal and focused.

Committed surface maps to S2 / S3-token-aggregate / S4 / S5 only: session `declaredArtifacts` + `next_activity` warn path; `record_usage` optional `agent_id` + `projectUsage` plain-sum; `DEDUP_BLOCKS` / `stageField` delivery; trace `aid`, filters, resource qualify/warn, hybrid step events; tests and inspect oracle. No price/cost field (D-4). No debug leftovers. Lean audit already applied (`a9c3ea2d`). No root `changes/` convention — fragment steps N/A.

## PR Body Conformance

Live body on #366 (fetched during review; Final re-render blocked by host `gh` auth failure — token invalid / connection reset) still matches **Initial** template shape:

| Finding | Detail |
|---------|--------|
| lifecycle-tense | Changes headed **Implementation (pending)** with future-tense task list after implementation has landed |
| mandated-sections | Missing `## 🤖 AI Assistance` required by Final template |
| submission-checklist | Final expects completed checkboxes; live body still all unchecked Initial items |
| changes-grouped-by-component | Live Changes is a task id list (T1–T8), not component-grouped present/past bullets |
| todo-tracks-premerge | Only “Ready for review”; does not track unstaged validation tip or signature work |
| final-render-blocked | `gh api` PATCH failed (`hosts.yml` token invalid / connection reset). Prepared Final body is held for retry at submit-for-review once auth is restored |

## Minimality Assessment

All 5 minimality checks pass on the committed feature surface (lean cycle already removed seven over-engineering items; no unused deps or speculative config). Residual gap is **landing** the two unstaged validation files, not extra code.

## Commit signatures

`git log --format='%h %G? %s' origin/main..HEAD`:

| Hash | %G? | Subject |
|------|-----|---------|
| a9c3ea2d | N | refactor(server): apply lean-coding audit shrinks for #365 |
| a6b970b0 | N | test(server): PR366 coverage for context fidelity and observability |
| 870e0df7 | N | feat(server): context fidelity and observability for #365 |
| 3008eddb | N | chore: merge remote feat/365-context-fidelity-observability |
| f87f8745 | N | chore(server): open the work package for the #365 backlog |
| 092b0c1b | G | chore(server): open the work package for the #365 backlog |

`unsigned_commits_in_pr`: **true**. Five commits without valid GPG signature (N); one signed seed (G). Re-sign rewrites history and may need force-with-lease — gated at `unsigned-commits-prompt`.

## Review Result

**Outcome:** Minor cleanup remaining (docs/PR body + optional tip commit + signature decision) — implementation scope is clean.

**Rationale:** Feature commits stay inside #365 S2/S3/S4/S5; lean already applied; no investigation or over-engineering residue in source. Open strategic items are process landing (validation tip, Final PR body, signatures), not design bloat.

**Next Step:** User decides re-sign; then finish Final PR body when `gh` auth works; proceed toward submit-for-review when `review_passed`.
