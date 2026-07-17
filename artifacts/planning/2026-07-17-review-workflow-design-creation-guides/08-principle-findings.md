# Principle Findings — `workflow-design`

**Mode:** review · **Date:** 2026-07-17  
**Pass:** principles  
**Target:** `workflow-design` v1.24.3 (PR #254 worktree)

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| P-1 | Medium | Protocol braces undeclared `{pattern_analysis}` — contract incomplete | `techniques/pattern-analysis.md` Assemble Comparison | Declare `### pattern_analysis` under Outputs (guide-shaped body); keep path artifact |

**Finding count:** 1

## Classifications (stance score)

| # | Principle | Class | Evidence |
|---|-----------|-------|----------|
| 1–3 | Internalize / Scope / Clarify | Pass | Inventory + review scope confirmed; creation-guide map present |
| 4 | Maximize Schema Expressiveness | Partial | P-1; checkpoints otherwise statement-form with path links |
| 5 | One Authoritative Home | Pass | Creation guides own Template/Rules; techniques cite |
| 6 | Convention Over Invention | Pass | Guide map + sibling naming; minor `#template` cite drift (see AP) |
| 7–10 | Confirm / Structure / Non-destructive / Docs | Pass | Gates structural; README + construct READMEs; guides complete |
| 11 | Output Economy | Pass | Guides ≤85 lines; disposition links primary report only |
| 12 | Separate Contract from Procedure | Partial | P-1 (undeclared assemble product) |
| 13–25 | SST … Contract contribution | Pass | No new shadows; session interaction in activities; shared write-artifact |

## Summary

| Classification | Count |
|----------------|------:|
| Pass | 23 |
| Partial | 2 |
| Violation | 0 |

## Creation-guide focus

| Check | Result |
|-------|--------|
| Every planning bare filename → guide with `## Template` + `## Rules` | Pass (dedicated or `findings-satellite`) |
| `resources/README.md` artifact→guide map | Pass — complete vs produced bare names |
| Persist techniques cite guides | Pass with Low cite-anchor inconsistency |
| Guides lean | Pass |
