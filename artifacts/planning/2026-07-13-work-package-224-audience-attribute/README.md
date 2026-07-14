# Audience Attribute on Technique Output Declarations - July 2026

> Enhancement · Created 2026-07-13 · **Status:** Lean-coding audit complete — clean over-engineering scoreboard (`Lean already. Ship.`, net -0) and clean debt ledger (0 markers); no simplifications to apply, proceeding to post-impl-review

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Adds an `audience` attribute (`human | agent`) to technique output / `#### artifact` declarations so the intended reader of each artifact is known at authoring time. Agent-audience artifacts are serialized as JSON under the `artifactPrefix` rule, letting later work convert agent-state artifacts to structured data. This is PR #1 of epic #224 (cluster 2 / backlog item V4) and the RC4 enabler for the downstream verbosity-reduction work.

## Problem Overview

The workflow server delivers "techniques" — reusable instruction blocks — to the AI agents doing the work, and each technique names the documents (artifacts) it will produce. Today those declarations say nothing about who the document is really for. Some artifacts are written for people to read and review; others exist only so the agent can hand information to a later step in the same process. Because the two kinds look identical, every artifact is written as free-flowing prose, which is verbose, slow to produce, and awkward for an agent to read back reliably later in the run.

This work package lets each artifact declaration state its intended reader — a person or the agent itself. Knowing the reader up front means agent-only artifacts can be written as compact structured data instead of prose, which is faster to produce, cheaper in tokens, and far more dependable to read back. It is the first, enabling step of a larger effort to reduce planning-artifact verbosity: on its own it changes nothing a reader sees, but it unlocks the later changes that convert agent-only documents to structured form.

## Solution Overview

The plan adds one small, optional label to the place where a technique names a document it will produce: a reader tag that says whether the document is meant for a person or for the agent itself. The label is threaded through every part of the system that carries an artifact declaration — the written specification, the validation rules, the part that reads the definitions from disk, and the part that hands them to the agent doing the work — plus a new automated check that keeps the corpus honest. Crucially, the label is optional: every existing declaration that has no reader tag keeps working exactly as before, so nothing already written needs to change.

Because the change is purely additive, nothing a reader sees today changes when this ships — no document looks different and no workflow behaves differently. What it delivers is the missing foundation: once each artifact can state its intended reader, the follow-on work can safely convert agent-only documents into compact structured form, which is faster to produce, cheaper, and more reliable for the agent to read back later. The work is scoped deliberately to just this foundation, with automated tests and a corpus check guarding that the new label validates correctly and that existing declarations remain untouched.

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 06 | [Work package plan](06-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| — | Implementation | Spec, schema, loader, projection, lint changes | 2-4h | ✅ Complete |
| 08 | [Provenance log](08-provenance-log.md) | Per-task DCO attribution rows | 5-10m | ✅ Complete |
| 06 | `Change block index` | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 09 | [Code review](09-code-review.md) | Lean-coding audit — over-engineering scoreboard | 10-20m | ✅ Complete |
| 09 | [Debt ledger](09-debt-ledger.md) | Harvested ponytail-marker debt ledger | 5-10m | ✅ Complete |
| 06 | [Test suite review](test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| 15 | [Codebase comprehension](15-codebase-comprehension.md) | Six V4 surfaces · extension points · blast radius | 20-45m | ✅ Complete |
| — | [Comprehension artifact](../../comprehension/technique-output-audience-pipeline.md) | Persistent codebase knowledge (pipeline + prism lenses) | 20-45m | ✅ Complete |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Close-out (COMPLETE.md)](complete-wp.md) | Deliverables, known limitations, lessons, retrospective | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Parent Epic | [#224](https://github.com/m2ux/workflow-server/issues/224) — Epic: work-package planning-artifact verbosity reduction |
| PR | [#227](https://github.com/m2ux/workflow-server/pull/227) |
