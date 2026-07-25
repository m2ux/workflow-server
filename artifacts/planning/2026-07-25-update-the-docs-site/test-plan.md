# Test Plan: Update the Docs Site

> test-plan · PR #293 · initial (pre-implementation) · 2026-07-25  
> Ticket: _skipped_ · ADR: —

## Overview

Documentation and site-validation package. Coverage is **automated site/link/SVG/generator freshness**, **claim-drift guards (Batch 7)**, and **manual golden-path / accuracy spot-checks**. No MCP server unit-test expansion is required unless a new check script needs a small harness.

Central symbols / entrypoints:

- `scripts/generate-site-data.ts` — SITE_ROUTES, tool capture, nav
- `scripts/check-site-links.ts` / `check-svg-layout.ts`
- `tests/site.test.ts`
- Product docs under `README.md`, `setup.md`, `http.md`, `stdio.md`, `docs/**`, `site/**`

## Test Cases

| Test ID | Objective | Steps | Expected Result | Type |
|---------|-----------|-------|-----------------|------|
| PR293-TC-01 | Verify generated site regions match a fresh `build:site` | 1. Run site render comparison used by `tests/site.test.ts`  <br> 2. Fail if committed HTML ≠ render | Test passes; no stale API/nav regions | Unit |
| PR293-TC-02 | Verify every SITE_ROUTES page is in global nav | 1. Run `checkSiteNavigation` path from site test | Empty error list | Unit |
| PR293-TC-03 | Verify internal links and anchors resolve | 1. Run `npm run check:site` | Exit 0 | Integration |
| PR293-TC-04 | Verify SVG diagram text clearance | 1. Run `npm run check:svg` | Exit 0 | Integration |
| PR293-TC-05 | Verify registered MCP tool count is 17 and matches api-ref table | 1. Enumerate `server.tool` + `registerTool` names  <br> 2. Compare to `docs/api-reference.md` tool rows  <br> 3. (Batch 7) automated guard | 17 names; sets equal | Unit |
| PR293-TC-06 | Verify no false “sixteen MCP tools” / wrong anatomy counts remain | 1. Search site+docs for outdated count strings  <br> 2. Spot-check server-anatomy 13+4 | Zero false positives | Manual |
| PR293-TC-07 | Verify agent docs use session_index and Technique vocabulary | 1. Search `session_token`, Skill-in-model-line in AGENTS/CLAUDE/ide-setup/examples | No hits | Manual |
| PR293-TC-08 | Verify documentation-system paths exist or are retargeted | 1. Open claimed paths from documentation-system.md | No ghost paths | Manual |
| PR293-TC-09 | Verify setup §4 / day-two cross-links | 1. Follow http/stdio “§4” links to setup anchors  <br> 2. Open site getting-started day-two | Anchors resolve; names agree | Manual |
| PR293-TC-10 | Verify HTTP route docs include GET/DELETE /mcp | 1. Read api-reference HTTP table  <br> 2. Compare to `src/transports/http.ts` | Methods match code | Manual |
| PR293-TC-11 | Verify golden path: install → init → rule → discover → start_session | 1. Follow setup + one transport guide as new user  <br> 2. Configure MCP from docs  <br> 3. Run discover and start_session with repo | First workflow can start without reading `src/` | Manual / E2E |
| PR293-TC-12 | Verify typecheck still clean after script changes | 1. `npm run typecheck` if TS scripts changed | Exit 0 | Unit |

## Acceptance Criteria Matrix

| Requirement / SC | Tests | Notes |
|------------------|-------|-------|
| SC-1 Accuracy | TC-05–TC-10 | Close C-* or list residuals in COMPLETE |
| SC-2 Golden path | TC-11 | Blocking for package complete |
| SC-3 Setup IA | TC-09 | Shared sequence + transport deltas |
| SC-4 Canonical owners | TC-06 spot + review | Duplication map |
| SC-5 Terminology | TC-07 | session_index, Technique |
| SC-7 md/site agree | TC-01–TC-04, TC-08 | |
| SC-8 Automated checks | TC-01–TC-05, TC-12 | |
| SC-9 Analysis then batches | Process gate | approach-confirmed before implement |
| SC-10 Limitations | Close-out | Not this plan phase |

## Running Tests

```bash
# From docs worktree or repo root with deps installed
npm run build:site
npm run check:site
npm run check:svg
npm test -- tests/site.test.ts
npm run typecheck   # if scripts/src touched
```

Manual: walk [setup.md](../../../setup.md) + [http.md](../../../http.md) or [stdio.md](../../../stdio.md) through first `start_session` (TC-11).
