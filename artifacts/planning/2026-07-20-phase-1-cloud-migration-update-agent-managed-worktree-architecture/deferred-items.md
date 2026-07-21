# Deferred Items

> Phase 1 Cloud Migration Update — Agent-Managed Worktree Architecture · issue skipped · updated 2026-07-21

| ID | Deferred at | Item | Reason | Follow-up |
|----|-------------|------|--------|-----------|

*(No deferred rows yet.)* In-task work still meant for this WP lives in [follow-ups.md](follow-ups.md), not here.

## Workflow retrospective notes (interim)

> Feedback on the **work-package workflow / orchestration** for the dedicated retrospective interview — **not** product backlog. Captured mid-walk until the formal retrospective interview session exists.

### Block-interview protocol

The `post-impl-review` block-interview must process reviewer feedback **one item at a time** and **confirm with the reviewer before exiting the loop**. Batching feedback, or auto-advancing out of interview after a single `issue-recorded` without a further feedback turn, is a workflow process defect.

### Session bag / `project_type` fidelity

During validation/review, the session bag lacked `project_type` while established context assumed a TypeScript worktree. Downstream steps should not re-infer project type from ambient state — the workflow should seed `project_type` (or equivalent) into the session bag when later activities depend on it.

### Retrospective interview (dedicated session)

The retrospective activity should run its **own dedicated interview session** in the **same format as the block-change interview**: one item at a time, confirm with the reviewer before continuing or exiting. Expect the user to provide a **sequential list of items** to be recorded as workflow feedback — do not dump ad-hoc notes into deferred files mid-walk or treat in-task fixes as retrospective content.

### Model-switch checkpoints around implement

The `switch-model-pre-impl` and `switch-model-post-impl` prompts around the implement activity can be **deprecated**. They add friction without clear value for this workflow’s implement/review handoff.

### Implementation-analysis confirmation

`implementation-analysis` does **not** require a user confirmation gate (`analysis-confirmed`). The workflow should autonomously resolve any implementation knowledge gaps using the **same loop mechanism already used for codebase comprehension**, then **proceed automatically** to the next activity without pausing for confirm / clarify / more-analysis.

### Change-block index navigation

In the change block index artifact, each **Block X** title in the block-rationale section should **hyperlink to the file and line** of that block so reviewers can jump straight to the change.

Remove the **Instructions** section and the **file index table** from the change block index — block-level hyperlinked titles are sufficient.

### Block-interview: detect manual review edits → retro candidates

The block-change index interview should **detect manual user changes made during review** (diffs the reviewer applied outside the agent) and, after examining those changes, **surface candidate patterns for the retrospective**. Example: if the user reduced comment verbosity, that pattern should be recorded as a workflow retro item after examination — not ignored as incidental noise.

### Candidates from manual review edits (2026-07-21, confirmed)

Examined uncommitted reviewer diffs on `feat/phase-1-agent-managed-worktree` (`Dockerfile`, `README.md`, `SETUP.md`, `docker-compose.yml`, deleted `docs/agent-managed-worktrees.md`, `src/config.ts`). Confirmed for retrospective.

| ID | Pattern | Evidence |
|----|---------|----------|
| MR-1 | **Cut comment / JSDoc verbosity** — state what the thing is in one short line; do not restate CLI/env precedence, derivation paths, or call-site rationale in comments | Dockerfile header → one line; `workspaceDir` / `planningRelativeDir` JSDoc stripped of bind/precedence/`setPlanningRelativeDir` narrative; compose dropped “Phase 1…” title comment |
| MR-2 | **No dense prose after config examples** — MCP JSON should stand alone; do not append a paragraph restating binds, planning slug, and doc links | README/SETUP removed the long `--workspace` explanation paragraph after the JSON block |
| MR-3 | **Prefer worktree-root placeholders over “your project”** | `--workspace=/path/to/worktree-root` in README/SETUP examples |
| MR-4 | **Do not ship a parallel runbook when SETUP already covers it** — delete redundant `docs/` guides rather than maintain two homes | Deleted `docs/agent-managed-worktrees.md` |

### Formalise in-task follow-ups vs deferred-items

Differentiate **in-task follow-ups** (still in scope for the current WP) from the **deferred-items register** (consciously deferred / out of scope / post-completion). Today `follow-ups.md` was agent-invented mid-walk and is not a templated resource. Formalise that split: template + technique + canonical-home map for an in-task follow-ups artifact (or an explicit register section), so agents do not overload deferred-items or invent unregistered filenames.
