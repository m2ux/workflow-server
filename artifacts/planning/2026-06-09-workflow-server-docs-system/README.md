# Workflow-Server Documentation System - June 2026

**Created:** 2026-06-09  
**Status:** In Progress  
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Establish a coherent documentation system for the workflow-server that gives every existing document a defined purpose, audience, and home, with a single discoverable entry point and navigable cross-links. This reduces onboarding and integration cost and prevents the documentation from drifting out of sync with the system it describes.

---

## Problem Overview

The workflow-server is an MCP server that lets AI agents discover and run structured workflows, and like any growing project it has accumulated documentation in several places at once: a top-level README, a setup guide, a docs folder, a schema guide, and various rule files. Each of these was written at a different time for a different reason, and there is nothing tying them together into a single, organized whole. Someone arriving at the project, whether a new contributor, an engineer trying to wire the server into their tools, or an agent following a workflow, has no clear starting point and no map showing which document answers which question.

When information lives in many unconnected places, people waste time hunting for the right document, and they cannot easily tell whether two documents actually agree with each other. Over time the documents drift apart and begin to contradict one another and the software itself, which quietly erodes trust in all of the documentation. Each new document added without a clear home makes the problem worse, so the cost of understanding and maintaining the project keeps rising until the structure is deliberately fixed.

---

## Solution Overview

This work gives the workflow-server's documentation a single front door and a clear map. Today the project's guides are scattered across the README, a setup file, a folder of a dozen technical documents, and a schema guide, with nothing tying them together. We add a hand-authored static HTML documentation site (semantic HTML, one shared stylesheet, inline SVG diagrams — no site-generator toolchain) that opens with a landing page of clickable section cards and organizes the material into a user guide, technical specifications, and API usage sections, so any reader can quickly find the document that answers their question. None of the current documents are moved or renamed — markdown stays canonical and every existing link keeps working; the site is a rendered, diagram-rich layer over it.

The change is purely additive and built to stay honest. The API and schema reference pages are regenerated from the server source and JSON schemas at build time, with a staleness check that fails when the committed pages drift from the code, and a link checker that fails on broken internal links or anchors. Narrative pages only describe the system as it actually is. The site publishes to GitHub Pages through a continuous-deployment workflow on every push to `main` — approved at the Layer C decision checkpoint (see the [plan revision](07-plan-revision-html-site.md)).

> **Plan revision (2026-07-07):** the original MkDocs Material approach was superseded by a Claude-authored HTML site; see [07-plan-revision-html-site.md](07-plan-revision-html-site.md) for the decision, rationale, and what carries over.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 14 | [Documentation-system comprehension](../../comprehension/documentation-system.md) | Doc-surface inventory + concept-rag reference pattern + deep-dive, lens, and Deep-Dive 2 findings (ADR/toolchain/nav-sync/inbound-links) | 20-45m | ✅ Complete |
| 04 | [KB & web research](04-kb-research.md) | MkDocs Material patterns; de-risks nav-sync, link-preservation, ADR-surfacing, toolchain-depth decisions | 20-45m | ✅ Complete |
| 05 | [Implementation analysis](05-implementation-analysis.md) | Current doc surface, baselines, concrete file manifest, layering; ADRs excluded from docs (Q-IMPL-1/DP-6) | 10-20m | ✅ Complete |
| 05 | [Work package plan](06-work-package-plan.md) | Implementation tasks, estimates, dependencies (approach superseded — see 07) | 20-45m | ✅ Complete |
| 07 | [Plan revision — HTML site](07-plan-revision-html-site.md) | Supersedes the MkDocs approach with a Claude-authored HTML site; Layer C approved (GitHub Pages CD) | 15-30m | ✅ Complete |
| 05 | [Test plan](test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | Documentation changes per plan | 1-4h | ⬚ Pending |
| 06 | `Code review` | Automated documentation quality review | 10-20m | ⬚ Pending |
| 07 | [Strategic review](strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | Validation | Build, link, and consistency verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | `Completion summary` | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#132](https://github.com/m2ux/workflow-server/issues/132) |
| PR | [#133](https://github.com/m2ux/workflow-server/pull/133) |

---

**Status:** In Progress
