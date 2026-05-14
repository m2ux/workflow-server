# Assumptions Log — Refresh Workflow-Server Docs

**Work package:** `2026-05-14-refresh-workflow-server-docs`
**Created:** 2026-05-14 (design-philosophy)
**Maintained across:** design-philosophy, codebase-comprehension, plan-prepare, implement, code-review, strategic-review

---

## How to read this file

Each row records an assumption and its disposition. Categories:

- **Problem Interpretation** — what the work package is/is not
- **Complexity Assessment** — why `simple` was chosen
- **Workflow Path** — implications of `skip-optional`
- **Documentation Scope** — which files are in/out of scope
- **Implementation Approach** — refresh strategy

Status values: `Open`, `Resolved`, `Carried-Forward`, `Invalidated`.

---

## Assumptions

| # | Assumption | Category | Status | Resolution |
|---|---|---|---|---|
| A1 | "Refresh docs" means update existing files to match the current implementation, not author net-new documentation surfaces. | Problem Interpretation | Resolved | Implied by user's "update and refresh" phrasing; confirmed by `skip-optional` path. |
| A2 | The current source tree (and existing comprehension artifacts) is the authoritative reference for what the docs should describe. | Problem Interpretation | Resolved | User is the project author/maintainer — any drift between docs and current code resolves in favor of code. |
| A3 | No source code or schema changes are expected as part of this work package. | Documentation Scope | Resolved | Reinforced by `simple` complexity and `skip-optional` path; the planning README scopes work to docs only. |
| A4 | The doc set in scope is: `README.md`, `SETUP.md`, `AGENTS.md`, `CLAUDE.md`, `docs/api-reference.md`, `docs/ide-setup.md`, `schemas/README.md`, plus cross-references between them. | Documentation Scope | Resolved | Superseded by A13 — sweep of `*.md` files at repo root, `docs/`, and `schemas/` produced the definitive 17-file list in `05-work-package-plan.md`. |
| A5 | The existing comprehension portfolio (`.engineering/artifacts/comprehension/*.md`) is current enough to ground doc updates without further investigation. | Complexity Assessment | Resolved | Verified during `codebase-comprehension` — `01-comprehension-refresh.md` confirms comprehension artifacts align with `main` and identifies the single live drift (session_index migration) which is handled via the "Tracked drift" appendix. |
| A6 | "Simple" complexity is appropriate because there are no new abstractions to design — the work is mechanical alignment. | Complexity Assessment | Resolved | Confirmed at the `classification-confirmed` checkpoint (2026-05-14T16:21:37Z). |
| A7 | Skipping `requirements-elicitation` is safe because the user authored the request and is the project maintainer. | Workflow Path | Resolved | Confirmed at the `workflow-path-selected` checkpoint (`skip-optional`, 2026-05-14T16:30:12Z). |
| A8 | Skipping `research` is safe because no external best-practice survey is needed — the source of truth is internal code. | Workflow Path | Resolved | Same checkpoint. |
| A9 | A single PR (`#119`, branch `chore/refresh-workflow-server-docs`) is the right delivery vehicle for the whole refresh. | Implementation Approach | Resolved | PR already exists per `start-work-package`. |
| A10 | The work package can be split into logical commit groups (top-level, docs/, schemas/) without breaking PR coherence. | Implementation Approach | Resolved | Superseded by A14 — plan defines ~3–4 commit groups (API/entry, architecture/model, schemas, cross-refs/PR update). |

---

## Planning-phase additions (plan-prepare)

| # | Assumption | Category | Status | Resolution |
|---|---|---|---|---|
| A11 | Docs align against the current state of `main`, not against unmerged feature branches. | Design Approach | Resolved | Confirmed by checking source: `main` still uses `session_token`; the `session_index` migration lives in a separate worktree (`server-managed-session-state`) that has not landed. |
| A12 | A "tracked drift" appendix is the right way to flag places that will need re-touching after the `session_index` merge lands. | Design Approach | Resolved | Cheaper than re-aligning later from scratch; appears as task T12 in the work package plan. |
| A13 | The doc set in scope is the 17 files listed in `05-work-package-plan.md` (root + docs/ + schemas/). | Documentation Scope | Resolved | Sweep of `*.md` files at repo root, `docs/`, and `schemas/` confirms this is the complete set; `.engineering/AGENTS.md` and `.engineering/CLAUDE.md` are out of scope (folder-local). |
| A14 | The work splits cleanly into ~3–4 commit groups under a single PR (#119). | Implementation Approach | Resolved | Grouping in plan: API/entry, architecture/model, schemas, cross-refs/PR update. |
| A15 | `npm run typecheck` and `npm test` pass cleanly today; the docs change should not regress them. | Test Strategy | Resolved | Accepted by user at `assumption-decision` checkpoint (assumptions-review, 2026-05-14). Mitigation: run `npm run typecheck` and `npm test` as the first action in `implement` to capture the baseline before any doc edits, and again after edits to confirm no regression. |
| A16 | The MCP server runtime currently bound to the orchestration tools is the `session_index` (server-managed) build, but `main` is still on `session_token`. This delta does not affect the docs work — docs follow `main`. | Dependency Assumptions | Resolved | Confirmed by grep: 0 `session_index` refs in main `src/`, 17 in `server-managed-session-state` worktree. |
| A17 | The "Tracked drift" appendix can live in the PR description (or a planning sub-doc) rather than as a doc surface — readers should not see it. | Scope Decisions | Resolved | Internal artifact for the maintainer; not a user-facing doc. |

## Carried-forward open assumptions

None. A15 was accepted at the `assumption-decision` checkpoint and is now Resolved (with mitigation tracked above). `stakeholder_review_complete = true`.

---

## Implementation-phase additions (implement)

| # | Assumption | Category | Status | Resolution |
|---|---|---|---|---|
| A18 | Most `docs/*.md` files in scope are already current (touched 2026-05-13); the refresh is targeted spot-fixes, not full rewrites. | Implementation Approach | Resolved | Confirmed by reading each file before editing — drift was concentrated in (a) host-specific framings (Cursor `Task`), (b) the legacy `get_skills` mention path, and (c) the env-var table in SETUP.md. |
| A19 | `docs/orchestra-specification.md` is a TBD spec document, not a server contract. It does not need grammar changes in this work package — only a "last reviewed" stamp. | Implementation Approach | Resolved | File header is `Status: Draft`; sections 2/4/5 are explicitly TBD. Touching the grammar would be out of scope. |
| A20 | The `workflows` worktree must be added to the worktree before `npm test` runs, otherwise `meta`/`work-package` loaders fail. | Test Strategy | Resolved | First `npm test -- --run` invocation failed with 113 tests because `./workflows` was empty; `git worktree add ./workflows workflows` then made tests pass (256 passed). The submodule pointer drift introduced by adding the worktree was reverted with `git checkout HEAD -- workflows` before any commits, so the chore branch carries no submodule-pointer change. |

All implementation-phase assumptions are Resolved. No open assumptions remain for the assumption-interview loop.
