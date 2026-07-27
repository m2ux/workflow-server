# Post-Update Review: work-package

**Date:** 2026-07-27
**Workflow:** `work-package` v3.35.4
**Files audited:** 4 (commit `dd1521ba`, +22/-20)
**Mode:** post-update

Audited the committed change surface, not the whole workflow: `work-package` is 15 activities and 110 techniques, and its standing pre-existing state is tracked in [deferred items](01-deferred-items.md). Every pass below was applied to the 4 committed files and to the contracts they bind across.

**Five goals re-scored against the committed tree.** G-1 (publish ref resolves), G-3 (URL slots stay in the resource), G-4 (one statement of the source) and G-5 (judgements land) are **met**. **G-2 — "the engineering checkout is the git target" — is met for the git *reads* and not for the git *write*,** which is the High finding below.

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 1 |
| Medium   | 1 |
| Low      | 3 |
| Pass     | 24 of 29 principles compliant |

**Deduplicated finding total: 5.** Satellites classify per pass, so one defect can appear under two stances; the table below is the deduplicated decision surface.

| # | Severity | Defect | Owning satellite |
|---|----------|--------|------------------|
| 1 | High | Publish write still parent-repo-scoped while the reads address the engineering checkout | [principles F-1/F-2](10-principle-findings.md) |
| 2 | Medium | AP-129 sweep covered the retired symbol but not the retired behavioural claim | [principles F-3](10-principle-findings.md) |
| 3 | Low | Base-URL fence shows one layout arm while the adjacent prose states both | [expressiveness F-1](08-expressiveness-findings.md) |
| 4 | Low | "artifacts checkout" against the tree's established "engineering checkout" | [conformance F-1](08-conformance-findings.md) |
| 5 | Low | Input description names a sibling technique as the value's producer | [anti-patterns F-1](10-anti-pattern-findings.md) |

## Principle Compliance Findings

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| High | **18 Prefer Shared Capability — violating.** Step 1 resolves `{eng_branch}` from the engineering checkout (branch `engineering`); step 2 hands it to `version-control::commit-regular-files`, which is scoped to "the parent repo", declares no `repo_path`, and pushes from the parent-repo working tree (on `main`). A shared op already owns this capability in the right checkout: `manage-git::artifact-commits`, including the `pull --rebase` for parallel work packages. | `techniques/publish-review-artifacts.md:30` → `meta/techniques/version-control/commit-regular-files.md:8,26,29` | Route the write through the engineering checkout — preferably an activity-13 bind of `manage-git::artifact-commits` per AP-114. Exceeds the confirmed manifest; see Recommended Fixes. |
| High | **23 Close the Loop — partial.** Step 3 emits a `rev-parse HEAD` read from the engineering checkout, so the published ref is correct while the artifacts it names were pushed elsewhere — the exact failure [A-2](03-assumptions-log.md) anticipated, and a break of `manage-artifacts.push-before-linking`. | `techniques/publish-review-artifacts.md:29-31` | Same defect as above; filed once. |
| Medium | **3 Define Complete Scope — partial.** The manifest commits to an AP-129 sweep; it was run for the retired symbol (`reference_path`, 0 tree-wide) but not for the altered behavioural claim, which is what AP-129 specifies. The delegated op was never enumerated in the surface. | `06-scope-manifest.md:74` | Sweep the altered claim, not only the renamed symbol; enumerate delegated ops when a technique's git target changes. |

(Detail in the [principle-findings satellite](10-principle-findings.md); this table is the decision surface.)

## Anti-Pattern Findings

| Severity | Entry | Location | Fix |
|----------|-------|----------|-----|
| Low | **`io-agnostic-contract`** (AP-42) | `techniques/review-summary.md:34` | Drop "from `publish-review-artifacts`" — the sibling's own Outputs entry already states the meaning without the caller name. |
| — | **`duplicate-shared-capability`** (AP-110) and **`pass-orchestration-in-technique`** (AP-114) | `techniques/publish-review-artifacts.md:30` | Cross-reference to the High finding above, not a second count. |

(Detail in the [anti-pattern-findings satellite](10-anti-pattern-findings.md).)

## Schema Validation Results

**All 16 files pass — no divergences.** `pass_count` 16, `fail_count` 0: `workflow.yaml` (`work-package` v3.35.4) plus all 15 activity files. Reported as a one-line all-pass per `exception-only-verdict-tables` rather than 16 green rows.

Supporting guards, re-run post-commit against the branch worktree:

| Guard | Result |
|-------|--------|
| `validate-workflow-yaml.ts` | All YAML valid; "no unanchored protocol references" across 110 technique files |
| `check-all-refs.ts` | 0 unresolved across all workflows |
| `check-binding-fidelity.ts` | 234 total, 256 baselined, **0 NEW**, 22 fixed; `binding-fidelity-baseline.json` unmodified |
| `check-resource-anchors.ts` | Exactly the 3 pre-existing baseline-identical entries — no fourth |

No CI is configured on this repository, so these guards are the whole mechanical surface.

## Other pass summaries

| Pass | Count | Satellite |
|------|------:|-----------|
| Expressiveness | 1 | [08-expressiveness-findings.md](08-expressiveness-findings.md) |
| Conformance | 1 | [08-conformance-findings.md](08-conformance-findings.md) |
| Principles | 3 distinct | [10-principle-findings.md](10-principle-findings.md) |
| Anti-patterns | 1 | [10-anti-pattern-findings.md](10-anti-pattern-findings.md) |
| Scope discipline | 0 — clean | this document, below |

**Scope discipline: clean pass.** The 4 committed files are exactly the 4 manifest items — no file changed outside the manifest, no manifest item unaddressed. The worktree is clean and local `HEAD` equals `origin/workflow/work-package-review-mode-friction-271` at `dd1521ba`, so no source edit was made during this review.

## Recommended Fixes

Prioritized by severity.

1. **High — route the publish write through the engineering checkout** (`techniques/publish-review-artifacts.md:30`). **Not remediated in place, deliberately.** Every available fix crosses the boundary the confirmed scope manifest draws: an activity-13 bind is excluded explicitly (`06-scope-manifest.md:25`), adding a `repo_path` input to `commit-regular-files` edits `meta` — a second workflow, the widening D-10 was deferred for — and swapping the Apply target in place changes the commit-message contract, since `artifact-commits` carries the canonical `docs(work-package): {activity_name} artifacts for {issue_key}` pattern rather than this op's literal message. This is a scope and impact decision with real alternatives, not a mechanical repair. It is also this branch's own defect: `publish-review-artifacts.md` is new on this branch (37 insertions, 0 deletions against `origin/workflows`).
2. **Medium — re-run the AP-129 sweep on the behavioural claim**, then re-enumerate the surface. This is the finding that explains how (1) reached commit.
3. **Low ×3** — the three prose fixes (fence/prose arm disagreement, `artifacts checkout` → `engineering checkout`, drop the producer name from the Input description) are each single-line and inside the manifest. They are held with (1) rather than committed separately, so the branch takes one more review cycle instead of two.

**Carried as follow-up candidates, verified inherited and not this change's drift** (each byte-identical to `origin/workflows` for the offending content, and each already contradicting `render.md:54` / `artifact-commits.md:42` before this branch existed): `techniques/update-pr/TECHNIQUE.md:76` (`engineering-link-mandatory` resolves from the parent repo's remote and branch — the rule a verifier greps, so the likeliest re-introduction vector), `resources/pr-description.md:143` (hardcoded `/.engineering/artifacts/planning/` in the PR-body link row), `techniques/manage-artifacts/TECHNIQUE.md:70-72` (`committed-to-parent`), `meta/techniques/agent-conduct.md:98`. Fixing (1) without these leaves the same defect class live on the PR-description path.
