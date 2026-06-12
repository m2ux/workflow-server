# Test Plan: Workflow-Server Documentation System

**Issue:** [#132](https://github.com/m2ux/workflow-server/issues/132)
**PR:** [#133](https://github.com/m2ux/workflow-server/pull/133)
**Plan:** [`06-work-package-plan.md`](06-work-package-plan.md)

---

## Overview

This test plan validates the MkDocs Material documentation **frame** stood up over the existing workflow-server docs — a single discoverable entry point, a complete manual `nav`, and a build that mechanically rejects orphans, broken links, and dead anchors, all without renaming or moving any existing document.

This is a documentation/tooling change with no runtime code, so validation is **build-based and review-based** rather than unit/integration code. The primary mechanical gate is `mkdocs build --strict` (exposed as `npm run docs:build`), which fails on missing nav targets, broken intra-site links, dead anchors, and `omitted_files` orphans.

Key changes to validate:
1. `docs/index.md` — grid-card landing page (single entry point).
2. `mkdocs.yml` — Material theme, manual `nav`, and `validation:` block (single source of nav truth + drift guard).
3. `docs/how-it-works.md` — thin page linking the README "How It Works" section (no duplication).
4. Section overview pages (`docs/getting-started.md`, `docs/agent-guidance.md`) and the reused `docs/architecture.md` hub.
5. Symlinks of in-tree files (`schemas/README.md`; `SETUP.md` where surfaced) into `docs/`.
6. Layer B tooling — `requirements.txt`, `package.json` `docs:*` scripts, `.gitignore += site/`.

---

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR133-TC-01 | Verify `mkdocs build --strict` (via `npm run docs:build`) exits 0 with no warnings | Integration |
| PR133-TC-02 | Verify the landing page `docs/index.md` exists and every grid card links to a valid in-site target | Manual |
| PR133-TC-03 | Verify all 12 `docs/*` files plus the symlinked schema reference appear in `mkdocs.yml` `nav` (0 orphans) | Integration |
| PR133-TC-04 | Verify the `validation:` block flags an injected orphan / broken link / dead anchor (negative test) | Integration |
| PR133-TC-05 | Verify all high-fan-in inbound `.md` links and the 2 anchor-fragment links still resolve (zero link rot) | Manual |
| PR133-TC-06 | Verify `docs/how-it-works.md` links the README "How It Works" section and duplicates no prose | Manual |
| PR133-TC-07 | Verify in-tree symlinks (`schemas/README.md`; `SETUP.md` where surfaced) resolve under `docs/` | Manual |
| PR133-TC-08 | Verify `requirements.txt` and `package.json` `docs:serve` / `docs:build` scripts are present and correct | Integration |
| PR133-TC-09 | Verify `.gitignore` ignores `site/` so a local build leaves the tree clean | Manual |
| PR133-TC-10 | Verify no ADR section, FAQ/Troubleshooting page, or `mike` config was introduced | Manual |
| PR133-TC-11 | Verify `git diff --stat` touches only docs + docs-tooling files (no `src/`, `schemas/*.schema.json`, or workflow TOON) | Manual |
| PR133-TC-12 | Verify new/overview pages describe the system as-is (no invented behavior; describe-as-it-is voice) | Manual |

*Detailed steps, expected results, and source links will be added after implementation by the finalize-documentation technique.*

---

## Acceptance Criteria Matrix

| Success Criterion (from plan) | Verifying Test Cases |
|-------------------------------|----------------------|
| Single discoverable entry point (G1) | PR133-TC-02 |
| Defined home for every doc — 0 orphans (G2/G3) | PR133-TC-03, PR133-TC-01 |
| Navigable structure builds clean (`--strict`) | PR133-TC-01, PR133-TC-04 |
| Zero link rot (~50 inbound + 2 anchors) | PR133-TC-05 |
| Thin How It Works, no duplication (Q-IMPL-6) | PR133-TC-06 |
| In-tree files surfaced via symlink (Q-IMPL-3) | PR133-TC-07 |
| Local build toolchain present (G4) | PR133-TC-08 |
| `site/` git-ignored (G7) | PR133-TC-09 |
| Exclusions honored — no ADRs/FAQ/`mike` (DP-6/Q-IMPL-1, Q-IMPL-5, R-3) | PR133-TC-10 |
| Documentation-only boundary (DP-5) | PR133-TC-11 |
| No drift introduced | PR133-TC-12 |

---

## Running Tests

*Commands will be confirmed after implementation. Anticipated:*

```bash
# Mechanical gate: build with orphan/broken-link/dead-anchor validation promoted to fatal
npm run docs:build          # = mkdocs build --strict

# Local preview
npm run docs:serve          # = mkdocs serve

# Boundary check
git diff --stat             # confirm only docs + docs-tooling files changed
```
