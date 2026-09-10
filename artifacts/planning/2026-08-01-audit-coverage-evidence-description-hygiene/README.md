# Audit coverage evidence + description-hygiene guard

**Date:** 2026-08-01  
**Status:** Complete (merged)  
**Mode:** Create / method fix  
**Host branch:** `feat/audit-coverage-evidence-description-hygiene` (merged)  
**Workflows branch:** `workflow/audit-coverage-evidence-description-hygiene` (merged)

## Goal

Prevent false-green quality-review: a criteria unit cannot be marked `walked` without field-level evidence on the change surface; Description Hygiene runs from a prose-field inventory; definition guards (including a new description-hygiene net) stay a separate mechanical net from canon coverage.

## Progress

| # | Item | Notes | Est. | Status |
|---|------|-------|------|--------|
| 1 | Host `check-description-hygiene` + registry | scripts + package.json | 30m | ✅ |
| 2 | `inventory-prose-fields` + quality-review step | ordered before audit-canon | 20m | ✅ |
| 3 | audit-canon walked-requires-evidence | coverage_ledger evidence | 30m | ✅ |
| 4 | findings-register + verify/compile/schema-validation | template + gates | 30m | ✅ |
| 5 | Self-audit with evidence ledger | this folder | 20m | ✅ |
| 6 | Guards on edit surface | check:all subset PASS | 15m | ✅ |
| 7 | Merge | #386 → main, #387 → workflows | — | ✅ |

## Links

| Kind | Ref |
|------|-----|
| Host PR | [#386](https://github.com/m2ux/workflow-server/pull/386) → `main` @ `31df227c` |
| Workflows PR | [#387](https://github.com/m2ux/workflow-server/pull/387) → `workflows` @ `d77ed286` |
| Host feature commit | `517a150a` |
| Workflows feature commit | `97dea78f` |
| Self-audit | [08-findings-register.md](./08-findings-register.md) |

## After merge (local)

- Host checkout: `git pull` on `main` (or rebase feature worktrees) for `check:description-hygiene`.
- Workflows submodule / worktree: advance pin to `workflows` @ `d77ed286` (or later) so quality-review serves inventory + evidence-required coverage.
