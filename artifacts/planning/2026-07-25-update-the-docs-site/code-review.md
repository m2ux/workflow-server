# Code Review — Update the Docs Site

> PR [#293](https://github.com/m2ux/workflow-server/pull/293) · branch `docs/update-the-docs-site` · tip `0c263b37`

## Scope

Docs/site/editorial + `tests/docs-drift.test.ts` only. No MCP server behavior changes. Root `README.md` rewrite **out of scope** (stakeholder).

## Lean-Coding Audit

Over-engineering lens on the PR diff (`origin/main...HEAD`, ~+340/−70 across 23 files).

### Findings

| Tag | Location | Simpler alternative | Lines |
|-----|----------|---------------------|-------|
| shrink | `tests/docs-drift.test.ts` (~113 lines) | Custom `walk` + multi-glob is fine for CI; optional later: fold into `scripts/check-docs-drift.ts` shared with a package script — **not required to ship** | ~0 (defer) |
| yagni | Spec “Before the formal rules” blocks (~14–19 lines each) | Keep: they are intentional progressive-disclosure intros (Batch 4), not bloat | 0 |
| — | Duplicate troubleshooting tables in http/stdio/setup | Acceptable owner+link pattern; setup is shared hub | 0 |

**net: -0 lines** (no accepted simplifications that shrink without losing SC coverage)

**Lean already. Ship.**

### Notes (not over-engineering)

- Drift test is the Batch 7 acceptance guard (SC-1/SC-5/SC-7); deleting it would fail the package.
- `setup.md` growth is the onboarding spine after README was descoped.
- No `ponytail:` markers in the tree.

## Debt harvest

See [debt-ledger.md](debt-ledger.md) — clean ledger.
