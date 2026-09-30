# Canon Re-audit — commit `9049523a` (PR #1003)

**Base ref:** `07a3daf0` · **Coverage:** 222 of 222 units × 11 of 11 paths · **Change surface:** 11 files (touched: 7 · closure: 4 · consumers: 0) · **Guards:** clean

**Verdict at `9049523a`:** Live 0 · Contract 2 · Hygiene 3, plus one unlabelled observation. One came from the commit (R2-A1) and is fixed at `8259835b`. The rest were there before it. Residual: 0 files `unread`, 0 units `blocked`. Walks: [A](reaudit2-walk-A.md) catalog, [P](reaudit2-walk-P.md) principles, conformance, inventory, fix fidelity. [Surface](reaudit2-surface.md).

## Prior findings closed by the commit

| Finding | Status |
|---|---|
| R-A2 | Closed: no writer or reader of `spec_basename` remains; the `{spec basename}` Template placeholders are filled from `{target_doc_path}`, which both fillers hold |
| R-A7 | Closed |
| R-A8 | Closed; its replacement wording opened R2-A1 |
| R-A9 | Closed by a one-line cite (the entry's pointer carve-out) |

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Outcome |
|----|------|----------|-------|----------|----------|--------|---------|
| R2-A1 | Contract | Medium | `cited-home-owns-claim` | `update-specification.md` § 1 `initial` note | "…update existing requirements, and deprecate as directed, each status per [Status Conventions]" — the section sets no status for an updated requirement | diff | Fixed at `8259835b`: the cite covers a new or deprecated requirement |
| R2-P2 | Contract | Medium | Cite Resource Policy; Do Not Restate It | `update-specification.md` `initial` note; protocol § Reference Documents | The only statement of a section-2 entry's form is cited by nothing; the 2.2 form it mirrors is stated nowhere | pre-existing | Fixed at 4272bad2 |
| R2-A2 | Hygiene | Low | `no-technique-resource-dual-home` | `update-specification.md` `initial` note | "Preserve the existing section structure when `{target_doc_exists}`" restates the Template's augment line | pre-existing | Fixed at 4272bad2 |
| R2-P1 | Hygiene | Low | Output Economy | activity 05 | The finalize action message and `finalization-confirmed` state the same fact with the same links | pre-existing | Fixed at 4272bad2 |
| R2-P3 | Hygiene | Low | Edit the Owner | protocol frontmatter `description`; `resources/README.md` row | Both still list the resource's sections, and the list omits Reference Documents and Rules; R-P8 added the Template to it rather than stopping the listing | pre-existing (left by R-P8) | Fixed at 4272bad2 |
| — | — | — | (no catalog entry) | report-failure Capability, `failure_report` output, activity 06 description and message | Each promises "the correction history"; the failure-report guide keeps pass history in the validation reports | pre-existing | Fixed at 4272bad2 |

Walk A also carries two proposed Do-not-flag clauses for `anti-patterns.md` (`constraint-as-blockquote`, `omit-null-sections`) from the prior walk, and names `cited-home-owns-claim` and `no-technique-resource-dual-home` as guard candidates (second consecutive walk; judgement entries, so a guard needs a triage ledger).

Checks at `8259835b`: guards 236 of 236. The engine suite was last run at `9049523a` (2200 pass); `8259835b` changes one prose sentence.
