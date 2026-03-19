# Workflow Creation Workflow — March 2026

**Created:** 2026-03-19
**Status:** Analysis Complete — Design Pending
**Type:** Meta-workflow

---

## Executive Summary

This work package defines a structured workflow whose purpose is to guide agents through the creation, modification, and update of workflow definitions. The need for this workflow is evidenced by a systematic analysis of **175+ historical sessions across two projects** (workflow-server and midnight-agent-eng) in which workflows were created or modified informally — without a guiding process. That analysis revealed recurring patterns of misalignment between user intent and agent output, clustering around major themes including: architectural misunderstanding, schema under-utilization, incomplete scope coverage, convention non-adherence, checkpoint violations, unverified assumptions, rules loaded but not followed, and destructive updates.

A key finding is that agents consistently under-utilize the schema's formal constructs — encoding steps as prose paragraphs, describing checkpoints in natural language instead of defining them with options and effects, writing "repeat for each item" instead of defining a forEach loop. The workflow must enforce maximal utilization of the schema's expressiveness so that produced workflows are machine-readable, validatable, and deterministically executable.

The proposed workflow will encode guardrails, validation gates, and mandatory checkpoints that eliminate these failure modes at the process level rather than relying on agent discipline alone.

---

## Problem Overview

When workflows are created or modified through ad-hoc conversation, the agent consistently produces output that diverges from user expectations in predictable ways. The most damaging failures are not random mistakes but systematic patterns:

1. **The agent doesn't internalize the project's conceptual model** before making structural decisions, leading to content placed in wrong locations, inline vs. modular confusion, and schema-vs-runtime boundary violations.

2. **Scope is consistently underestimated on refactoring tasks**, with the agent completing changes in one location (e.g., source code) while missing parallel locations (e.g., workflow worktree, README files, template files).

3. **Established conventions are ignored or reinvented**, with the agent inventing new naming patterns, placing content in non-standard locations, or encoding structured information as prose when the schema provides dedicated constructs.

4. **The agent makes irreversible changes without confirmation**, particularly around domain terminology changes, architectural decisions, and scope-expanding modifications.

5. **Corrections don't stick across the session**, with the agent repeating the same error after explicit correction — a pattern severe enough that users resort to profanity-laden repetition.

These are not occasional lapses. Across the 25+ sessions analyzed, **every session involving structural workflow creation or ontological change** exhibited at least two of these failure patterns. The sessions that showed zero misalignment were exclusively narrow, prescriptive tasks (search-and-replace, data gathering) where the user left no room for agent interpretation.

The conclusion is clear: workflow creation requires a workflow.

---

## Analysis Artifacts

| # | Document | Description | Status |
|---|----------|-------------|--------|
| 00 | [History analysis](00-history-analysis.md) | Detailed per-session findings from 25+ history files | Complete |
| 01 | [Design principles](01-design-principles.md) | 13 principles, rules, and structural requirements for the workflow creation workflow | Complete |

---

## Identified Misalignment Themes

The full analysis (see [00-history-analysis.md](00-history-analysis.md)) spans two projects and identified **twelve major themes** of misalignment, summarized below with combined frequency and severity ratings.

| # | Theme | Combined Occurrences | Severity | Root Cause |
|---|-------|:--------------------:|----------|------------|
| 1 | Incomplete scope / implementation | 16 | High | Agent completes changes in one location but misses parallel locations (worktrees, READMEs, templates, related files) |
| 2 | Architectural / ontological misunderstanding | 12 | Critical | Agent lacks internalized model of the project's conceptual hierarchy, schema-vs-runtime boundaries, and inline-vs-modular design philosophy |
| 3 | Assumption without verification / premature execution | 12 | High | Agent proposes architectural changes, executes domain terminology renames, or commits to approaches without confirmation |
| 4 | Convention / pattern non-adherence | 12 | High | Agent invents new naming conventions, places content in non-standard locations, or ignores established project patterns |
| 5 | Schema under-utilization / prose over formal constructs | 10 | High | Agent encodes structured information (steps, checkpoints, decisions, loops, transitions) as prose instead of using formal schema constructs |
| 6 | Checkpoint and interaction pattern violations | 10 | Critical | Agent collapses granular checkpoints, asks multiple questions at once, or bypasses blocking checkpoints entirely |
| 7 | Content duplication / staleness-prone artifacts | 7 | Medium | Agent creates hand-curated copies instead of referencing source-of-truth files, or leaves duplicates after migration |
| 8 | Schema / format compliance failures | 7 | Medium | Agent misuses schema fields, produces invalid TOON syntax, or fails schema validation |
| 9 | Failure to learn from corrections / incorrect pushback | 6 | Critical | Agent repeats identical errors after correction, or defends its output rather than re-examining |
| 10 | Rules loaded but not followed | 3 | Critical | Agent demonstrably reads and acknowledges rules, then violates them in the very next action. Strongest evidence that text rules alone are insufficient |
| 11 | Act first, plan later / destructive updates | 6 | High | Agent moves to implement without presenting approach, or overwrites existing content without preservation audit |
| 12 | Informal execution outside workflow boundaries | 3 | High | Agent executes work outside the workflow's formal structure, manually combining results instead of using defined activities |

---

## Recommended Next Steps

1. **Design the workflow structure** — Define activities, checkpoints, and validation gates based on the design principles document
2. **Create the workflow TOON files** — Encode the workflow as TOON following existing schema and conventions
3. **Create supporting resources** — Guides, templates, and skills needed by each activity
4. **Validate against historical failures** — Replay problematic scenarios against the new workflow to verify coverage
5. **Integrate with workflow server** — Register the workflow so it can be discovered and executed via the MCP tools

---

**Status:** Analysis complete — ready for workflow design
