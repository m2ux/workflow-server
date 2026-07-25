# Golden-path walk (manual checklist)

PR branch: `docs/update-the-docs-site` · tip at push: `573f4c61` (Batches 2–7 commit).

## Automated (ran in worktree)

- [x] `npm run build:site`
- [x] `npm run check:site`
- [x] `npm run check:svg`
- [x] `npx vitest run tests/site.test.ts tests/docs-drift.test.ts`
- [x] `npm run typecheck`

## Reader path (spot-check against PR / local site)

1. [ ] README: value → transport choice → setup link → verify cues → deeper map
2. [ ] setup.md: three operations table → §2a deploy → §2b init-repo → §3 rule → §4 update (`#day-two`)
3. [ ] http.md / stdio.md: verify expected cues + troubleshooting tables
4. [ ] docs/ide-setup.md: discover + start_session(repo) + session_index
5. [ ] site/guide/getting-started.html: layout paths match setup; verify prioritizes discover/start_session
6. [ ] site/specifications.html: orchestra + technique + schemas linked
7. [ ] site/api/tools.html: no fixed tool count in lede (generated)

## Agent identity smoke (when MCP client available)

1. [ ] Workflow request → agent calls `discover` first
2. [ ] `start_session` includes `repo: "owner/repo"`
3. [ ] Subsequent calls use `session_index` (not `session_token`)
