# Change Block Index

> `docs/update-the-docs-site` vs `main` · 23 files · 45 hunks · est. review ~22 minutes (30 sec/change)

## Block Rationale

### [Block 1 — .claude/rules/workflow-server.md:4](../../../../.worktrees/2026-07-25-update-the-docs-site/.claude/rules/workflow-server.md:4)

Aligns the always-on Claude rule with the live auth contract: agents must pass `session_index` from `start_session` on every authenticated call. The prior `session_token` wording steered clients toward a retired identifier and caused bootstrap failures. Keeping this rule in lockstep with `docs/ide-setup.md` prevents IDE vs docs drift.

### [Block 2 — AGENTS.md:4](../../../../.worktrees/2026-07-25-update-the-docs-site/AGENTS.md:4)

Updates the agent mental model line from Skill vocabulary to Technique so first-contact agent docs match the workflow engine. This is a one-line identity fix, not a structural rewrite of AGENTS.md. Same change lands in CLAUDE.md so Cursor and Claude hosts stay synchronized.

### [Block 3 — CLAUDE.md:4](../../../../.worktrees/2026-07-25-update-the-docs-site/CLAUDE.md:4)

Mirrors the AGENTS.md Technique vocabulary update for Claude Code hosts. Dual files exist because different IDEs load different entry docs; both must carry the same Goal → Workflow → Activities → Techniques → Tools chain. No other CLAUDE.md sections change in this package.

### [Block 4 — README.md:9](../../../../.worktrees/2026-07-25-update-the-docs-site/README.md:9)

Trims the top catalog strip to links that still resolve and matter for newcomers; full README rewrite stays out of scope per stakeholder. Removes brittle Schemas/Engineering pointers that competed with the docs site and setup spine. Minimal diff preserves URL stability while reducing catalog noise.

### [Block 5 — docs/api-reference.md:10](../../../../.worktrees/2026-07-25-update-the-docs-site/docs/api-reference.md:10)

Documents GET and DELETE `/mcp` beside POST so Streamable HTTP session lifecycle is complete in the API table. Operators who only saw POST missed how server→client streams and session teardown work. Wording stays declarative and points at http.md for operational detail.

### [Block 6 — docs/documentation-system.md:10](../../../../.worktrees/2026-07-25-update-the-docs-site/docs/documentation-system.md:10)

Retargets ghost paths and drops brittle inventory-count conventions that rot whenever tools are added. The doc now describes how markdown and `site/` relate without promising fixed counts. Supports SC accuracy/IA goals without inventing a new docs platform.

### [Block 7 — docs/ide-setup.md:7](../../../../.worktrees/2026-07-25-update-the-docs-site/docs/ide-setup.md:7)

Rewrites the paste-ready rule and Verify steps so smoke tests prioritize `discover` → bootstrap → `start_session` with `repo`, not a catalog-only `list_workflows` check. session_index language matches the Claude/Cursor rules. Optional list-workflows remains as a catalog check, not a substitute for bootstrap.

### [Block 8 — docs/orchestra-specification.md:6](../../../../.worktrees/2026-07-25-update-the-docs-site/docs/orchestra-specification.md:6)

Adds a plain-language intro before the formal rules so authoring readers get progressive disclosure. Formal normative text is unchanged; the intro lowers the cost of first contact with orchestra semantics. Pairs with the specifications hub on the site.

### [Block 9 — docs/technique-protocol-specification.md:5](../../../../.worktrees/2026-07-25-update-the-docs-site/docs/technique-protocol-specification.md:5)

Same progressive-disclosure pattern as the orchestra spec, plus a Technique model line so vocabulary matches the engine. Keeps the formal protocol intact while making the document usable as a learning surface. Supports authoring-hub IA without renaming files or URLs.

### [Block 10 — examples/cursor-workspace/.claude/rules/workflow-server.md:6](../../../../.worktrees/2026-07-25-update-the-docs-site/examples/cursor-workspace/.claude/rules/workflow-server.md:6)

**Rationale correction (user):** Example workspace must mirror the canonical live Cursor workspace at `~/.local/share/cursor/workspaces/workflow-server` — five roots (workspace, project, workflows, planning, work trees), one-line `AGENTS.md`, discover-first rules without retired `session_token`, and MCP via mcp-remote. Copy/open docs treat that data-dir layout as the destination users should end up with.

### [Block 11 — http.md:1](../../../../.worktrees/2026-07-25-update-the-docs-site/http.md:1)

**Rationale correction (user):** Install/Start narrative is state-bind only (no projects/worktrees binds in the install story). Prefer the example Cursor workspace for MCP/IDE setup; demote hand-rolled mcp-remote JSON. Planning path uses `$HOST_PROJECTS_ROOT/<repo>/.engineering/…` (not `$INSTALL/projects/…`).

### [Block 12 — scripts/generate-site-data.ts:650](../../../../.worktrees/2026-07-25-update-the-docs-site/scripts/generate-site-data.ts:650)

Stops baking a live tool count into the generated tools.html lede so the site cannot claim a stale inventory. Generated pages stay source-driven; prose no longer races the registrar. Drift tests guard the convention elsewhere.

### [Block 13 — setup.md:1](../../../../.worktrees/2026-07-25-update-the-docs-site/setup.md:1)

**Rationale correction (user):** Onboarding spine after README descoping. §2b/§4 teach `$HOST_PROJECTS_ROOT/<repo>/` + nested `.worktrees` / `.engineering`; `$INSTALL` holds scripts, `state/`, and `workflows/` only. §3 is “Setup Cursor workspace.” stdio labeled soon-to-be-deprecated per user. Cite [install-projects-worktrees.md](../../../../.worktrees/2026-07-25-update-the-docs-site/docs/install-projects-worktrees.md).

### [Block 14 — site/api/tools.html:71](../../../../.worktrees/2026-07-25-update-the-docs-site/site/api/tools.html:71)

Regenerated lede matches generate-site-data.ts: list tools without asserting a count. Hand-authored structure preserved; only the inventory claim changes. Keeps generated HTML honest under tool churn.

### [Block 15 — site/design/request-lifecycle.html:68](../../../../.worktrees/2026-07-25-update-the-docs-site/site/design/request-lifecycle.html:68)

Removes a brittle tool tally from the design lede so diagrams stay about lifecycle, not inventory. Aligns with the same accuracy theme as index and server-anatomy pages. Filename and URL unchanged.

### [Block 16 — site/design/server-anatomy.html:72](../../../../.worktrees/2026-07-25-update-the-docs-site/site/design/server-anatomy.html:72)

Drops registrar tool-count claims and links readers to the live tools catalog instead. Anatomy prose should describe structure, not a snapshot number. Multiple hunks are the same accuracy fix across sections of one page.

### [Block 17 — site/guide/getting-started.html:89](../../../../.worktrees/2026-07-25-update-the-docs-site/site/guide/getting-started.html:89)

**Rationale correction (user):** Getting-started (and aligned setup.md / ide-setup.md) advises **Setup Cursor workspace** as the primary MCP/bootstrap path. Layout table and §2b use `$HOST_PROJECTS_ROOT` (not `$INSTALL/projects` / `$INSTALL/worktrees`).

### [Block 18 — site/index.html:131](../../../../.worktrees/2026-07-25-update-the-docs-site/site/index.html:131)

Removes tool-count claims from diagram and prose on the landing page. Landing should orient, not freeze an inventory that drifts. Complements the generated tools page change.

### [Block 19 — site/nav.js:17](../../../../.worktrees/2026-07-25-update-the-docs-site/site/nav.js:17)

Escape closes open nav groups so keyboard users can dismiss menus without hunting a click target. Small a11y improvement on the shared shell. No IA or URL impact.

### [Block 20 — site/specifications.html:115](../../../../.worktrees/2026-07-25-update-the-docs-site/site/specifications.html:115)

Turns the specifications page into an authoring hub that links orchestra, technique, and schemas without renaming paths. Supports progressive disclosure alongside the new markdown intros. Deletes stale link noise that pointed the wrong way.

### [Block 21 — site/style.css:141](../../../../.worktrees/2026-07-25-update-the-docs-site/site/style.css:141)

Improves skip-link and nav-summary focus rings and caps prose measure for readability without shrinking diagrams. Pure presentation/a11y; no content IA change. Uses existing focus-ring token.

### [Block 22 — stdio.md:1](../../../../.worktrees/2026-07-25-update-the-docs-site/stdio.md:1)

**Rationale correction (user):** Planning path uses `$HOST_PROJECTS_ROOT/<repo>/.engineering/…`. Mirrors http.md verify/troubleshoot pattern; points into setup.md as the shared hub.

### [Block 23 — tests/docs-drift.test.ts:1](../../../../.worktrees/2026-07-25-update-the-docs-site/tests/docs-drift.test.ts:1)

Adds CI drift guards for identity vocabulary, session_index language, ghost paths, and inventory-count claims so regressions fail the suite. This is the Batch 7 acceptance lock for SC accuracy goals. Prefer keep over delete even if lean-audit noted optional later extraction.

Reply with block numbers that have issues (e.g. `3, 7, 12`) or `none`.
