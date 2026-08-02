# Shared capability homes — consolidation record

This folder is the investigation-detail home for the shared-homes epic, which consolidates four issues that break the same rule from four directions: a capability more than one workflow needs lives once, in a shared home, and each workflow binds it — keeping only its own domain content.

## Consolidated issues

| Work item | Issue | Capture in this folder | Prior investigation folder |
|---|---|---|---|
| W1 — name the parallel fan-out contract | #382 | [issue-382-reusable-parallel-fan-out.md](./issue-382-reusable-parallel-fan-out.md) | [2026-08-01-formalise-reusable-parallel-fan-out](../2026-08-01-formalise-reusable-parallel-fan-out/) — change brief, impact analysis, migration candidates, findings register |
| W2 — inventory sequential sites and plan the migration | #384 | [issue-384-parallelisation-inventory.md](./issue-384-parallelisation-inventory.md) | [2026-08-01-identify-plan-workflow-parallelisation](../2026-08-01-identify-plan-workflow-parallelisation/) — session opened, inventory not yet produced |
| W3 — lift concern convergence into meta | #266 | [issue-266-concern-convergence.md](./issue-266-concern-convergence.md) | — |
| W4 — comprehension onto the codebase-wiki techniques | #148 | [issue-148-comprehension-migration.md](./issue-148-comprehension-migration.md) | — |

Each capture is the issue body verbatim at consolidation time, so placement tables, the knowledge-versus-metadata split, and the open design questions stay reachable after the issue closes.

## Why these four consolidate

- Each is an instance of one defect shape: a reusable structure held as a private copy (a forked technique group, a bespoke artifact format) or as free prose (a fan-out described in a protocol step), instead of a named contract in a shared group that call sites bind.
- W1 supplies the fan-out contract; W2 is the demand-side survey that decides where it (and the existing formal patterns) get bound. They were deliberately split across two issues and belong under one epic so the supply and demand halves stay sequenced together.
- W3 and W4 are the two known cases where a whole capability sits under one workflow: the analyse-challenge loop under work-package (already fully parameterized), and comprehension writing a bespoke per-area artifact instead of binding the citation-backed wiki operations.
- The acceptance shape is identical everywhere: the shared home owns the structure, the consuming workflow keeps only domain content, and no call site re-describes the shared structure in prose.

## Boundaries preserved from the source issues

- Worker fan-out and concern convergence stay distinct repertoires — the pattern catalog must make the split legible.
- The residual-question user experience, the interview and batch checkpoints, and the domain analyse operations stay with work-package.
- The comprehension migration must lose nothing: the deep-dive loop, the data-flow and operational-context analysis, and every declared outcome of the comprehension activity survive, with durable knowledge going to the wiki and task metadata staying in planning.
