# Scope and Draft — remediate-vuln ↔ work-package alignment

Reuse depth (user decision): **14/15 borrowed** — remediate-vuln keeps only `start` + the `security-setup` technique group. Worktrees: workflows changes on `workflow/remediate-vuln-wp-alignment` (`~/projects/work/workflows/2026-07-10-remediate-vuln-wp-alignment`); server changes on `feat/borrowed-activity-technique-resolution` (`~/projects/work/workflow-server/2026-07-10-borrowed-technique-resolution`).

## Block-indexed draft review

### work-package (v3.27.0 → 3.28.0)

| # | Block | File | Change | Rationale |
|---|-------|------|--------|-----------|
| 1 | `stealth_mode` variable | workflow.yaml | added (default false) | consumer-agnostic no-disclosure gate (A-002); inert for wp runs |
| 2 | `push_remote`/`push_remote_url` variables | workflow.yaml | added (origin/"") | parameterized push target; stealth consumers override to their private remote |
| 3 | unsigned-commit variables ×3 | workflow.yaml | added | signature scan/re-sign flow moved from rv fork into wp-12 |
| 4 | gh-auth validate gate | activities/06-plan-prepare.yaml (v1.9.0) | stealth-gated | gh auth is a PR-flow prerequisite; not needed in stealth |
| 5 | update-pr render gate | activities/06-plan-prepare.yaml | AND stealth != true | PR description must never be rendered in stealth (P1) |
| 6 | posting gates ×3 | activities/07-assumptions-review.yaml (v2.3.0) | AND stealth != true | Jira/GitHub deferred-assumption posting structurally off in stealth (P1) |
| 7 | unsigned-commits-prompt + resign step | activities/12-strategic-review.yaml (v2.8.0) | added (ungated; fires only when unsigned found) | rv's re-sign flow generalized — signature hygiene isn't security-only |
| 8 | fragment issue-URL validate gate | activities/12-strategic-review.yaml | stealth-gated | change fragment must not reference a public issue in stealth |
| 9 | signature scan + no-PR base path | techniques/strategic-review/review-scope.md (v1.3.0) | added; pr_number now optional | #203 authored-surface diff gains a stealth/no-PR base-branch path; scan feeds block 7 |
| 10 | resign-commits op | techniques/strategic-review/resign-commits.md | added (from rv, `security`→`{push_remote}`) | re-sign flow's op home follows the flow |
| 11 | verify-remote-private + verify-commit-signatures ops | techniques/manage-git/ | added (from rv secure-submit, genericized) | pre-push isolation checks as consumer-agnostic manage-git ops |
| 12 | push_remote input | techniques/manage-git/push-commits.md (v1.1.0) | added (default origin) | single push op serves both public and private destinations |
| 13 | stealth isolation constructs ×4 | activities/13-submit-for-review.yaml (v1.10.0) | injected, gated stealth == true | verify private remote → isolation confirmation → signature check → confirm push, ahead of push-commits |
| 14 | PR-lifecycle gates ×8 | activities/13-submit-for-review.yaml | AND stealth != true | render/verify-body/non-conformant/merge-strategy×2/mark-ready/review-received/process-comments/analyze/review-outcome gated out in stealth |
| 15 | activities README §12/§13 | activities/README.md | updated prose + mermaid | truth-in-docs for blocks 7/13/14 |
| 16 | manage-git group capability | techniques/manage-git/TECHNIQUE.md (v2.1.0) | updated | names the new pre-push verification concern |

### remediate-vuln (v1.1.0 → 2.0.0)

| # | Block | File | Change | Rationale |
|---|-------|------|--------|-----------|
| 17 | workflow.yaml | workflow.yaml | rewritten | 14/15 borrowed activities list; ~30 wp-mirrored variable declarations with defaults; `stealth_mode: true`, `push_remote: security`, `is_review_mode: false`, `worktree_created/gitnexus_indexed: false`; `is_sec_vuln_mode`/`has_failures` removed; PRIVATE RESEARCH ONLY rule added |
| 18 | start activity | activities/01-start.yaml (v2.0.0) | modified | sets `stealth_mode`; adds `work-package::reference-resolution` (discovered_path=target_path), `work-package::project-type-detection`, signing preflight — fixes F2/F3 |
| 19 | 02-strategic-review.yaml + 03-submit.yaml | activities/ | **deleted** | superseded by borrowed wp-12/wp-13 (user-approved pivot) |
| 20 | strategic-review + secure-submit groups, analyze-findings.md | techniques/ | **deleted** | forks superseded: flows moved into wp (blocks 7/9/10/11), analysis replaced by wp strategic-findings-analysis |
| 21 | READMEs ×3 | README.md, activities/, techniques/ | rewritten | privacy model, borrowed-activity table, mermaid flow (L3) |

### workflow-server (feat branch)

| # | Block | File | Change | Rationale |
|---|-------|------|--------|-----------|
| 22 | activitySourceWorkflow on diagnostics | src/loaders/workflow-loader.ts | added to WorkflowWithDiagnostics | per-activity source map, already computed at load (B10), now exposed |
| 23 | source-scoped get_technique | src/tools/resource-tools.ts | scope = activity's source workflow | F1: borrowed activities' refs resolve [source → meta], mirroring fragment scoping |
| 24 | source-scoped bundling + provenance | src/tools/workflow-tools.ts, src/utils/binding-provenance.ts | same scope threading | keeps eager bundling and provenance annotation identical to lazy fetch |
| 25 | regression tests ×4 | tests/borrowed-technique-resolution.test.ts | added | synthetic fixture + real-corpus mapping assertions |
| 26 | stealth-isolation guard | scripts/check-stealth-isolation.ts + `check:stealth` | added | user-requested leakage smoke test: static gate evaluation + reachable-protocol text scan + runtime private-repo probe (`--target`) |
| 27 | walker compound-when | tests/e2e/walker.ts | `&&` clause support | corpus already uses compound `when`; new stealth gates rely on it |
| 28 | binding baseline | scripts/binding-fidelity-baseline.json | regenerated (263→262) | dead-output entries migrated with the moved ops; 0 NEW drift |

## Validation status at draft time

- Server: typecheck clean; full suite 544 passed / 14 skipped; snapshots match after walker fix.
- Corpus guards (against drafted worktree): binding ✓, variable-model ✓, fragments ✓, review-mode ✓, identifiers ✓, technique-template ✓, activity-tech ✓, self-input ✓, anchors ✓.
- `check:stealth` static layer: **OK** on drafted corpus; correctly FAILS on pre-fix corpus (3 findings) — negative test held.
- Empirical resolution probe: borrowed refs (`review-assumptions::collect`, bare `define`, `implement-task`, `manage-git::sync-branch`) all resolve under source scoping.

## Draft attestation

Attested by user 2026-07-10 (draft-attestation checkpoint, option `attested`): every drafted block reviewed, understood, and intentional. No blocks flagged for revision.
