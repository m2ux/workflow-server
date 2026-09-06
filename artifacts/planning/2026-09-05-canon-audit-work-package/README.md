# Canon audit — work-package

**Date:** 2026-09-05
**Target:** `workflows/work-package` (170 definition files)
**Base ref:** `75777ca2453d788acf52d8ab69778c9491686436`
**Verdict:** 13 open findings — 2 Critical, 3 High, 7 Medium, 1 Low. The guard suite passes 36 of 36; the option-coverage walk fails both its tests and is the source of the two Criticals.

A standalone canon audit of the whole target at HEAD, run with the `workflow-canon` skill. It was prompted by, and is directly comparable with, the audit merged the same day as PR #617.

| File | Holds |
|---|---|
| `README.md` | This index |
| [findings-register.md](./findings-register.md) | The findings table, the two withdrawn candidates, the coverage divergences, and the sources |
| [previous-pass-comparison.md](./previous-pass-comparison.md) | Per-finding attribution against PR #617 — what that pass introduced, what it never opened, and what it edited and missed |

## Comparison summary

Of the 13 findings, three arrived with PR #617 itself, one is a check that pass did not run, six sit in files it never opened, and four sit in files it edited. The register's Origin column reads `pre-existing` throughout because this audit's base ref is HEAD; the attribution against PR #617 is the comparison document's, and the two answer different questions.

The headline is C1. PR #617 added an option to the shared `assumption-decision` fragment that no walk can reach, and the option-coverage walk has been red since that merge. It takes ~25 minutes and `npm run test:ci` skips it, so every other check stayed green.

## Coverage caveat

This walk is partial and says so. The YAML and README layer — 19 files — was read whole. The 151 technique and resource files were covered by Detect-derived sweeps and targeted reads rather than whole-file walks, and are recorded as `blocked`. So is the `binding-fidelity` triage ledger, whose verdicts are stamped against a corpus 41 work-package files behind HEAD.
