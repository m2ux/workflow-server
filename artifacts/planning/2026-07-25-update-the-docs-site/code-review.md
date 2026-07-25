# Code Review — Update the Docs Site

> PR [#293](https://github.com/m2ux/workflow-server/pull/293) · branch `docs/update-the-docs-site`

## Scope

Docs/site/editorial + `tests/docs-drift.test.ts` only. No MCP server behavior changes. Root `README.md` rewrite **out of scope** (stakeholder).

## Manual diff review — flagged blocks (file-index-table)

Checkpoint `file-index-table` → `rationale-confirmed-with-issues` (`has_flagged_blocks=true`). User corrections applied before automated reviews continued:

### Block 11 — `http.md`

- **Adopted** uncommitted Install/Start simplification (state bind only; no projects/worktrees binds in the install narrative; planning selected at session time).
- **MCP path:** primary recommendation is [examples/cursor-workspace/](../../.worktrees/2026-07-25-update-the-docs-site/examples/cursor-workspace/); raw `mcp-remote` JSON demoted to optional.
- Troubleshooting no longer tells operators to check projects/worktrees binds; “finish shared steps” points at setup §2–§4 without hand-rolled MCP as the spine.

### Blocks 10 + example workspace — `examples/cursor-workspace/*`

- Realigned to canonical live workspace `~/.local/share/cursor/workspaces/workflow-server`:
  - one-line `AGENTS.md` (`The Github repo for which this workspace is targeted is owner/repo.`)
  - `CLAUDE.md` → `AGENTS.md` symlink
  - five roots: workspace, project, workflows, planning, work trees (not a single `.engineering` root)
  - `.cursor/rules` / `.claude/rules` discover-first; no retired `session_token`
  - `.cursor/mcp.json` required workflow-server only; optional companions documented in README
- README copy/open instructions target the canonical Cursor workspaces data dir.

### Block 17 — `site/guide/getting-started.html` (+ `setup.md` / `docs/ide-setup.md`)

- Merged “Connect MCP client” / “Add bootstrap rule” into **Adopt the example Cursor workspace**.
- setup §3 and ide-setup lead with the same recommended path; hand-rolled MCP/rules are secondary.

## Lean-Coding Audit

Over-engineering lens on the PR diff (`origin/main...HEAD`).

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
