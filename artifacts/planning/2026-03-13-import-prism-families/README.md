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

*To be defined during comprehension and design activities.*

## Progress

| Activity | Status | Notes |
|----------|--------|-------|
| Start Work Package | Complete | Issue #53, PR #54, branch created |
| Comprehension | Pending | Understand current workflow structure and plan changes |
| Design Philosophy | Pending | — |
| Implementation | Pending | — |
| Review | Pending | — |
