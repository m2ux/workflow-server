# Canon audit — work-package

**Date:** 2026-09-06
**Target:** `workflows/work-package` at `c1d07a291510eb13d9ec6e49c73a5aed55b3c538` (169 definition files)
**Base ref:** `75777ca2453d788acf52d8ab69778c9491686436` — the base of the [2026-09-05 pass](../2026-09-05-canon-audit-work-package/README.md), making this a post-remediation delta over a 63-file change surface
**Verdict:** 21 findings — 7 High, 11 Medium, 3 Low, all applied on branch `workflow/work-package-canon-followups`. No Criticals: the guard failure the first pass recorded turned out to be the corpus branch running ahead of the pointer `main` pins.

A standalone canon audit run with the `workflow-canon` skill, then applied. Eleven of the prior pass's thirteen findings are closed; the two that remain are the adoption commit this corpus change owes.

| File | Holds |
|---|---|
| `README.md` | This index |
| [findings-register.md](./findings-register.md) | The findings table with the commit each was applied in, the eight withdrawn candidates, the change surface, coverage, and the adoption obligation |
| [prior-pass-reconciliation.md](./prior-pass-reconciliation.md) | Per-finding disposition of the 2026-09-05 register, the two fixes that traded one entry for another, and the walk verdicts |

## What the fixes changed

Five commits on `workflow/work-package-canon-followups`:

| Commit | Findings | Subject |
|---|---|---|
| `803746ea` | 3, 5, 7 | Commit task source paths and declare the blocks review-diff flags |
| `2ea964b4` | 4 | Take the stakeholder transcript at the elicitation gate |
| `1447cbd7` | 1, 2 | Record what the attestation and delivery gates decide |
| `b8a71ea5` | 6, 10–14, 16, 17, 19–21 | Settle the contract, orientation and gate residues |
| `91dcced5` | 8, 9, 15, 18 | Name one assumption-assembly operation per presentation shape |

The one with runtime consequence rather than hygiene cost is finding 7: the per-task source commit bound `manage-git::artifact-commits`, which commits planning artifacts in the engineering checkout under a docs subject and pushes an engineering branch, with none of its four inputs bound. It now binds `manage-git::commit-paths` with the paths `implement-task` declares.

## Measuring the right tree

The first pass ran its checks in the shared checkout, whose `workflows/` worktree sits 35 corpus commits ahead of the pointer `main` pins. Three reported failures were properties of that gap. A provisioned worktree checks out the pinned corpus and all 36 guards pass there. The register's [Measuring the right tree](./findings-register.md#measuring-the-right-tree) records what each check says against which tree, and [Adoption](./findings-register.md#adoption) records what the code branch owes.

## Coverage caveat

Twenty-three of the 169 files were read whole; the rest were reached by validated Detect-derived scans covering roughly twenty of the catalogue's tests. The remediation scope this audit certifies is those 23 files plus the specific scan-returned sites the register names — and the fixes stayed inside it. The register's Coverage section states the bound and gives a demonstrated instance of it.
