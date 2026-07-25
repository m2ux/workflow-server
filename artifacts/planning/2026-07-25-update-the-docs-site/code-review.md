# Code Review Report

> code-review · PR [#293](https://github.com/m2ux/workflow-server/pull/293) `docs/update-the-docs-site` · 2026-07-25 · 33 files reviewed · methodology: docs/site editorial review (Rust/Substrate guide adapted — no Substrate surface in this PR)

## Summary

**Overall Quality:** 5/5 — Critical: 0 · High: 0 · Medium: 0 · Low: 0 · Informational: 1

Docs/site/editorial + `tests/docs-drift.test.ts` only. No MCP server behavior changes. Root `README.md` rewrite remains out of scope except the committed Quick Start Cursor note. GitNexus `detect_changes` (compare `main`) reports **no changed symbols / no affected processes** (risk: low).

## Module Overview

Onboarding spine (`setup.md`, `http.md`, `stdio.md`, example Cursor workspace), agent identity rules, site guide/design/API pages, and CI drift guards. Manual review flagged blocks 10/11/17; corrections were applied and interviews resolved with `skip-block`.

## Manual Diff Review

> `docs/update-the-docs-site` vs `main` · 23 indexed blocks · reviewer: stakeholder · Issues Found (then corrected)

Checkpoint `file-index-table` → `rationale-confirmed-with-issues` (`has_flagged_blocks=true`). Block interviews `#10`, `#11`, `#17` → `skip-block` after corrections (`has_critical_blocker=false`).

### MD-1: Example workspace must mirror live Cursor layout

**File:** `examples/cursor-workspace/*` · **Block:** 10 · **Severity:** Medium (resolved)  
**Issue:** Example workspace must mirror the canonical live Cursor workspace at `~/.local/share/cursor/workspaces/workflow-server` — five roots, one-line `AGENTS.md`, discover-first rules, MCP via mcp-remote.  
**Recommendation:** Applied — template realigned; interview skipped as no longer an issue.

### MD-2: HTTP Install/Start narrative and MCP path

**File:** `http.md` · **Block:** 11 · **Severity:** Medium (resolved)  
**Issue:** Install/Start must be state-bind only; prefer example Cursor workspace for MCP/IDE; planning under `$HOST_PROJECTS_ROOT/<repo>/.engineering/…`.  
**Recommendation:** Applied — interview skipped as no longer an issue.

### MD-3: Getting-started / setup path model

**File:** `site/guide/getting-started.html` (+ `setup.md` / `docs/ide-setup.md`) · **Block:** 17 · **Severity:** Medium (resolved)  
**Issue:** Primary path is **Setup Cursor workspace**; layout uses `$HOST_PROJECTS_ROOT` (not `$INSTALL/projects` / `$INSTALL/worktrees`); §2b is **Checkout the project**.  
**Recommendation:** Applied — interview skipped as no longer an issue.

## Findings

No Critical / High / Medium / Low findings remain on the authored surface after corrections.

### Informational

#### INFO-1: README still asserts an MCP tool inventory count

**File:** `README.md` (Quick Start / MCP Tools)  
**Evidence:** `The server registers 17 MCP tools across five concerns.`  
**Notes:** Drift suite intentionally excludes `README.md` (stakeholder: wholesale README rewrite out of scope). Same class of claim was removed from `site/` and guarded by `tests/docs-drift.test.ts`. Track for a future README pass; do not expand scope here.

## Strengths

- Onboarding converges on one recommended MCP path (example Cursor workspace) instead of competing hand-rolled JSON.
- Path model is consistent across setup, getting-started, http, and stdio (`$HOST_PROJECTS_ROOT/<repo>/` + nested `.engineering` / `.worktrees`).
- Batch 7 drift tests lock session_index language, Technique vocabulary, ghost paths, and inventory tallies on product docs/site.

## Recommendations Summary

1. **Immediate:** None.
2. **Near-term:** None for this PR.
3. **Long-term:** Remove or rephrase README tool-count prose when README rewrite is in scope (INFO-1).

## Compliance

All 5 compliance categories met for this docs-only change set (architecture/docs accuracy, agent bootstrap contract, testing via drift guards, no unsafe runtime patterns).

## Structural Analysis

> L12 structural · docs onboarding + published site · 2026-07-25 · findings land here per `findings_destination: code-review.md`

### Claim

The deepest structural problem is not missing sentences — it is **unbounded claim production**: docs surfaces can mint inventory/path/identity assertions faster than any single editor can clear them, so published guidance drifts even when authors are careful.

### Dialectic

- **Defend:** Drift is content debt; editing pages fixes it.
- **Attack:** Editing without a clearer for each claim class recreates the same stale assertions elsewhere (README vs site vs setup).
- **Probe:** Both sides assume a human will notice tallies and ghost paths; the system has no conservation between “claim minted” and “claim invalidated.”

### Concealment Mechanism

Honest-looking absolute counts and install-layout synonyms (`$INSTALL/projects`, “N MCP tools”) look like documentation quality while they are **snapshot claims** with no lifecycle.

### Improvements (constructive)

1. **Legitimate concealment:** Add more precise counts to more pages (passes review as “accuracy”).
2. **Visible only after strengthening:** Every new page becomes another producer; CI exclusion lists become the real policy.
3. **Second improvement:** Catalog links + drift tests (this PR) — clears producers on guarded surfaces.

### Structural Invariant

As long as prose may assert a live inventory or layout synonym without a matching invalidation rule, drift returns.

### Conservation Law

**Claim-mint / claim-clear conservation:** every producer of a brittle assertion (tool tally, ghost path, retired identity token, Skill vocabulary) must have a clearer on every publication path (edit, regenerate, or CI fail).

| Resource (claim class) | Producers | Clearers | Termination paths | Verdict |
|------------------------|-----------|----------|-------------------|---------|
| MCP tool inventory tally | Historical site/index/tools ledes; `generate-site-data.ts` lede; README MCP Tools | Site/script edits; drift test `avoids brittle MCP tool inventory tallies` | Site regen, CI, PR review | **Matched** on guarded globs; **Unmatched** on README (excluded by design) |
| session_token identity | Old rules/examples | Rule rewrites; drift test | CI | **Matched** |
| Skill in Goal→…→Tools line | AGENTS/CLAUDE | Vocabulary fix; drift test | CI | **Matched** |
| Ghost site paths | documentation-system / links | Retarget; drift test | CI | **Matched** |
| Install layout synonyms (`$INSTALL/projects`) | setup/http/stdio/getting-started | Path-model corrections (blocks 11/17) | Manual review | **Matched** on spine |

### Meta-Law

Surfaces explicitly excluded from clearers (here: root README) will reaccumulate the same claim class the PR cleared elsewhere — testable by grepping README for `\d+ MCP tools` after site tallies are gone (INFO-1).

### Bug Table

| ID | Location | What breaks | Severity | Fixable / structural |
|----|----------|-------------|----------|----------------------|
| SA-1 | `README.md` MCP Tools | Stale tool count can disagree with registrar | Informational | Structural while README remains out of clearer scope |
| — | Guarded product docs/site | No unmatched producers found post-correction | — | — |

No unmatched producer at Minor+ on the in-scope authored surface → does not set `needs_code_fixes`.

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
