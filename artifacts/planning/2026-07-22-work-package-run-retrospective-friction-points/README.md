# Work-Package Run Retrospective Friction Points — July 2026

> Update · Created 2026-07-22 · **Status:** Planning

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

This session designs updates to `work-package`, `meta`, and related harness/technique surfaces so nine friction points from a real work-package run ([issue #272](https://github.com/m2ux/workflow-server/issues/272)) become first-class, supported paths instead of improvisations. The goal is fewer stuck workers, clearer orchestrator routing, and safer hand-offs when the agent cannot build or present a one-option gate.

## Problem Overview

A recent end-to-end work-package run hit nine gaps that the workflow definitions themselves own: workers are told to call tools they are forbidden to use, the orchestrator must guess the next activity from ambiguous worker reports, validation and build-artifact regen have no supported “hand this to the user” path, single-option checkpoints cannot be shown, foreground-dispatch rules disagree with how the host actually spawns agents, lean-coding audit misses comment bloat, artifact writes can mint duplicates, and PR text stays stuck in future tense after implementation.

Those gaps force improvisation, lost transitions, and late CI surprises. Fixing them in `work-package`, `meta`, and harness-compat (rather than only filing harness bugs) should make the same kind of run finish with clearer routing, explicit user hand-offs, and fewer hand reconciliations.

## Solution Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## Design Decisions

- Purpose / dimension deltas → design-specification.md (not yet drafted)
- Assumptions and outcomes → assumptions-log.md (not yet drafted)

## Compliance Findings

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| — | *None yet* | — | — |

## Scope Manifest

*Link/pointer to the scope-manifest artifact once confirmed.*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Structural inventory](01-structural-inventory.md) | Baseline inventory + #272 update scope | 15-30m | ✅ Complete |
| — | Intake and context | Classify update; schema literacy | 20-40m | ✅ Complete |
| — | Requirements refinement | Dimension deltas; assumptions | 30-60m | ⬚ Pending |
| — | Pattern analysis | Reference patterns for friction fixes | 30-60m | ⬚ Pending |
| — | Impact analysis | Blast radius across meta/WP | 30-60m | ⬚ Pending |
| — | Scope and draft | Manifest + draft YAML/techniques | 1-2h | ⬚ Pending |
| — | Quality review | Conformance / expressiveness audits | 45-90m | ⬚ Pending |
| — | Validate and commit | Attest and commit workflow changes | 30-60m | ⬚ Pending |
| — | Post-update review | Optional follow-up review | 20-40m | ⬚ Pending |
| — | Retrospective | Session close-out | 15-30m | ⬚ Pending |
| — | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables, decisions, limitations | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Primary target | `workflows/work-package/` |
| Coupled target | `workflows/meta/` (incl. harness-compat) |
| Issue | [#272](https://github.com/m2ux/workflow-server/issues/272) |
