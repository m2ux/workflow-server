# Midnight System Review — PR #1849 (blind run)

**Status:** Finding adjudication complete — 10 candidates graded against the rubric; 5 entries accepted (4 distinct defects: unversioned host-boundary decode, unbumped spec_version, doc decode-tag mismatch [dedupes A6-1≡A9-1], unanchored benchmark bound), 5 observations, 0 dismissed. Next: verdict and report.

Independent first-principles review of pull request #1849 of `midnightntwrk/midnight-node` ("feat(1474): expose ledger-emitted events from the node"), pinned to head commit `61c9c3498db07e8b6457b9165d8bf0df29a2faad`.

- **Review target:** PR #1849 (`feat/1474-ledger-events-v2` → `main`), OPEN
- **Target repo path:** `/home/mike1/projects/work/midnight-node/2026-07-14-msr-blind-run-pr1849` (detached HEAD at review head)
- **Base ref:** `origin/main`
- **has_pr_surface:** true
- **Toolchain gates:** gitnexus_available = false · cargo_available = true · node_binary_available = false

## Progress

| Activity | Prefix | Artifact | Status |
|---|---|---|---|
| scope-intake | 01 | [change-surface.md](01-change-surface.md) | Complete |
| area-derivation | 02 | [investigation-plan.md](02-investigation-plan.md) | Complete — plan approved |
| evidence-probes | 03 | [evidence-log.md](03-evidence-log.md) | Complete — 9 areas, 10 candidate findings |
| finding-adjudication | 04 | [findings-register.md](04-findings-register.md) | Complete — 10 graded, 5 accepted / 5 observations / 0 dismissed |
