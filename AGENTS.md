# AGENTS.md — Engineering folder

Instructions for AI coding agents working in this `.engineering/` directory (artifacts, planning, history, and scripts).

## Project overview

This folder contains:

- **Artifacts** — Planning work packages under `artifacts/planning/`
- **History** — Project history and change logs in `history/`
- **Scripts** — Utilities in `scripts/` (e.g. `update-metadata.sh`, `update-resources.sh`)

The main application (MCP server) lives at the repo root. See the root `README.md` for quick start, schema guide, and API docs.

## Setup commands

- **Build (repo root):** `npm run build`
- **Run tests (repo root):** `npm test`
- **Typecheck (repo root):** `npm run typecheck`
- **Workflow data:** Workflows are typically in a `workflows` worktree; see root README and `SETUP.md`.

Run these from the **repository root**, not from `.engineering/`.

## Code and doc style

- Use clear, professional language in all artifacts and comments.
- Do not add process attribution in code comments (e.g. “Added by agent”).
- Place new planning artifacts under `artifacts/planning/` (see root README for structure).

### Documentation voice — describe the system as it is

Documentation (specs, READMEs, schema docs, technique/workflow content, code comments) describes the
system **as it currently is**, in plain declarative present tense. Do **not** narrate evolution in
documentation: avoid “deprecated”, “no longer”, “formerly”, “previously”, “replaces”, “instead of”,
“now”, “unified”/“one kind”, contrasts against a prior design, and “there is no X” / “X was removed”.
State what the system does and how it is structured — not what it stopped doing or used to do. A
reader who has never seen an earlier version should notice nothing missing.

**Planning artifacts are the exception.** Documents under `artifacts/planning/` are *meant* to record
evolution — the decision, the before/after, the rationale, the alternatives weighed, and deferred
items. Capture the journey there; keep it out of the system's own documentation.

## Task management

- Complete **one** task at a time unless the user asks for multiple.
- For multi-step work, create todos and mark them complete as you finish; only one todo should be `in_progress` at a time.
- Request permission before proceeding to a new task or making changes outside the current request.

## Boundaries

- Do **not** modify the MCP server source (e.g. `src/`, `schemas/`) or workflow TOON files unless the user explicitly asks.
- When following workflows, respect workflow fidelity as defined in the TOON files and the workflow-server rules (see root `docs/ide-setup.md` and `get_rules`).

## Testing instructions

- After changing server code or schemas, run from repo root: `npm test` and `npm run typecheck`.
- If you add or change scripts under `.engineering/scripts/`, run them to confirm they work.
- When editing workflow or rule definitions, ensure they align with the schema and IDE setup docs.

## PR and commit instructions

- Follow the repo’s usual PR/commit conventions.
- Run `npm run typecheck` and `npm test` from the repo root before committing when code or schemas are touched.
- Keep commits focused: one logical change per commit when touching multiple files.
