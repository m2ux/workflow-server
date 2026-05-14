# Codebase Comprehension Refresh — Doc Refresh Work Package

**Date:** 2026-05-14
**Work package:** `2026-05-14-refresh-workflow-server-docs`
**Activity:** codebase-comprehension (v1.5.0)

---

## Existing comprehension portfolio (reviewed)

The repo already has a comprehensive comprehension portfolio under `.engineering/artifacts/comprehension/`, last updated 2026-04-24/26 — recent enough to ground a doc refresh.

| Artifact | Coverage | Last updated | Relevance to doc refresh |
|---|---|---|---|
| `workflow-server.md` | Architecture, project structure, key modules | 2026-04-26 | Anchors `README.md` rewrite |
| `orchestration.md` | Workflow execution, dispatch protocol, checkpoint flow | 2026-04-26 | Anchors `AGENTS.md` / `CLAUDE.md` orchestration text |
| `hierarchical-dispatch.md` | Meta → child workflow dispatch | 2026-04-26 | Anchors hierarchical-dispatch sections |
| `state-tools.md` | Session state lifecycle and MCP tools | 2026-04-26 | Anchors `docs/api-reference.md` state tool entries |
| `utils-layer.md` | TOON, session token, audit utilities | 2026-04-26 | Anchors schema and serialization references |
| `json-schemas.md` | JSON Schema definitions and validation | 2026-04-26 | Anchors `schemas/README.md` JSON section |
| `zod-schemas.md` | Zod runtime schemas | 2026-04-26 | Anchors `schemas/README.md` Zod section |
| `workflow-server-schemas.md` | Cross-cutting schema view | 2026-04-26 | Anchors schema doc consolidation |
| `prism-workflow.md` | Prism workflow (separate concern) | 2026-04-24 | Out of scope unless prism docs are stale |

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|---|---|---|---|
| Q1 | Have any source files or MCP tools been added/removed/renamed since 2026-04-26 that the existing comprehension does not capture? | Resolved | Spot-check against current `src/tools/workflow-tools.ts` and `src/tools/resource-tools.ts` confirms tool roster aligns with comprehension portfolio. Any deltas will surface in plan-prepare's per-file diff. | — |
| Q2 | Are the schema artifacts (`schemas/*.json`, Zod schemas in `src/schema/`) materially different from what the existing comprehension and current docs describe? | Resolved | Schema files are versioned and the comprehension artifacts list each one explicitly; doc drift will be detected file-by-file in `plan-prepare`. | — |
| Q3 | Do the existing comprehension artifacts cover the **documentation surface** (what users see) as well as the code surface? | Resolved | They cover code. The doc surface (README/SETUP/AGENTS/CLAUDE/docs/) is what we are refreshing, so coverage of the docs themselves is the *output* of this work package, not a prerequisite. | — |

All identified questions are resolved by existing artifacts or are deferred (correctly) to `plan-prepare`. **`has_open_questions = false`, `needs_comprehension = false`.**

## Comprehension Sufficiency

The existing comprehension portfolio is sufficient to ground the doc refresh. No deep-dive iteration is needed for this work package. The `comprehension-sufficient` checkpoint does not surface (its condition `has_open_questions == true` is not met).

## Variables to carry forward

| Variable | Value |
|---|---|
| `comprehension_artifact_path` | `.engineering/artifacts/comprehension/` (portfolio) |
| `architecture_overview` | See `workflow-server.md` |
| `key_abstractions` | See `workflow-server.md` + `utils-layer.md` |
| `design_rationale_hypotheses` | See per-artifact rationale sections |
| `domain_glossary` | Distributed across the portfolio |
| `needs_comprehension` | `false` |
| `has_open_questions` | `false` |

## Next activity

Transition to `plan-prepare` per the `skip_optional_activities == true` branch of `codebase-comprehension`'s transition table.
