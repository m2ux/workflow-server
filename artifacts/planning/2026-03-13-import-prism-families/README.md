# Import New Prism Families (SDL, Behavioral, Domain-Neutral)

| Field | Value |
|-------|-------|
| **Date** | 2026-03-13 |
| **Status** | Planning |
| **Issue** | [#53](https://github.com/m2ux/workflow-server/issues/53) |
| **PR** | [#54](https://github.com/m2ux/workflow-server/pull/54) |
| **Branch** | `enhancement/53-import-prism-families` |
| **Type** | Enhancement |

## Executive Summary

Extend the prism workflow to support three new prism families from the agi-in-md project: structural SDL lenses (7 lenses covering trust, coupling, abstraction, identity, and reachability analysis), a behavioral pipeline (4 independent lenses + 1 synthesis pass for error resilience, optimization, evolution, and API surface analysis), and domain-neutral variants (3 lenses enabling behavioral analysis on non-code targets). This brings the total resource count from 12 to approximately 33 and introduces a new `behavioral` pipeline mode.

## Links

| Resource | URL |
|----------|-----|
| GitHub Issue | https://github.com/m2ux/workflow-server/issues/53 |
| Draft PR | https://github.com/m2ux/workflow-server/pull/54 |
| Source Prisms | `/home/mike/projects/vendor/agi-in-md/prisms/` |
| Prism Workflow | `workflows/prism/` |

## Problem Overview

The prism workflow currently provides 12 analytical lenses organized into two modes: a 3-pass L12 pipeline (structural, adversarial, synthesis) and a 6-lens portfolio (pedagogy, claim, scarcity, rejected-paths, degradation, contract). While these cover foundational structural analysis well, they do not include the SDL family of lenses that target specific architectural concerns like trust boundaries, temporal coupling, and identity displacement, nor the behavioral pipeline that analyzes how code handles errors, optimizes performance, evolves over time, and exposes API surfaces.

Without these lenses, users who need coupling analysis, trust topology mapping, or behavioral resilience assessment must run the analysis manually outside the workflow. This means the workflow's plan-analysis skill cannot recommend these lenses, the portfolio-analysis skill cannot compose them into complementary sets, and there is no automated pipeline for the behavioral analysis sequence. The result is that a significant portion of the proven analytical toolkit remains inaccessible through the workflow's routing and orchestration capabilities.

## Solution Overview

This enhancement imports 21 new analytical lenses into the prism workflow, expanding the resource catalog from 12 to 33 lenses organized into eight families. The new lenses include the SDL structural family (which targets specific architectural concerns like trust boundaries, temporal coupling, and abstraction violations), a four-prism behavioral pipeline (which analyzes how code handles errors, manages performance, evolves over time, and fulfills its API promises), domain-neutral variants for non-code analysis, and several hybrid and specialized lenses. The behavioral pipeline introduces a new analysis mode where four independent lenses run in parallel and then feed into a synthesis lens that finds convergence points and blind spots across all four perspectives.

The changes are confined to the workflow definition files — no modifications to the MCP server source code are needed. The 21 new resource files are copied from the upstream agi-in-md project with their calibration metadata preserved. The existing skill files (plan-analysis, portfolio-analysis, orchestrate-prism) are updated with expanded routing tables that map analytical goals to the appropriate new lenses, and a new behavioral-pipeline skill and behavioral-synthesis-pass activity are added to orchestrate the four-plus-one behavioral analysis sequence. All existing analysis modes (single-pass L12, three-pass Full Prism, and portfolio) continue to work exactly as before — the changes are purely additive.

## Progress

| Activity | Status | Notes |
|----------|--------|-------|
| Start Work Package | Complete | Issue #53, PR #54, branch created |
| Design Philosophy | Complete | Problem classified as inventive goal (improvement), complexity: complex, full workflow path selected |
| Codebase Comprehension | Complete | Architecture surveyed, 8/10 questions resolved, 2 design decisions deferred to planning |
| Requirements Elicitation | Complete | 13 requirements (R1-R8 + AR1-AR5) covering resources, pipeline mode, routing, model sensitivity, quality metadata |
| Research | Complete | Critical finding: behavioral pipeline composition mismatch between prism.py and behavioral_synthesis.md |
| Implementation Analysis | Complete | 11 gaps identified, 23 files to create, 9 to modify, 4 unchanged |
| Plan & Prepare | Complete | 6 change blocks, 23 files to create, 9 to modify, test plan with 6 test categories |
| Assumptions Review | Complete | Stakeholder approved; resources 03-05 deprecated, 00-02 used for all target types |
| Implementation | Complete | 6 change blocks, 8 commits, self-review caught stale 03-05 references in 4 files |
| Post-Impl Review | Complete | Code review (0 critical), structural analysis, test suite review, architecture summary. GAP-1 fixed (depth-preference mapping). |
