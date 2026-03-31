# Rule-to-Skill Migration - March 2026

**Created:** 2026-03-31  
**Status:** Complete  
**Revised:** 2026-03-31 (completed)  
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Extract duplicated behavioral rule groups from workflow TOON files into formal, reusable skill+resource sets. This eliminates ~140 duplicated rules across 10+ workflows by leveraging the new workflow-level skills capability (#86), replacing prose rule text with canonical skill definitions that provide structured protocols, inputs, outputs, and resources.

---

## Problem Overview

The workflow system currently embeds behavioral rules as prose text directly inside TOON configuration files. When multiple workflows need the same rules — such as orchestrator discipline or worker execution protocols — each workflow restates them independently, often with slightly different phrasing. This means a single conceptual rule can appear in as many as five different workflows, each maintaining its own copy with no formal link between them.

This duplication creates real maintenance problems. When a rule needs updating, every copy must be found and changed separately, and inconsistencies inevitably creep in over time. Agents consuming these workflows cannot programmatically discover or reference the protocols because they are buried in unstructured prose rather than being defined as formal, reusable components with clear inputs, outputs, and phases.

---

## Solution Overview

The fix reorganizes how the workflow server delivers behavioral rules to AI agents. Instead of embedding the same rules as prose text in every workflow file, the rules are consolidated into formal, reusable "skills" — structured definitions that agents can load on demand when they need them. This means each rule exists in exactly one place, agents get only the rules relevant to their current task, and the initial startup payload shrinks from 85 rules to just the essential connection protocol.

The migration works in three phases to avoid disrupting agents during the transition. First, new skills are created and existing skills are expanded to absorb the duplicated rules, so agents gain access to the formalized versions. Second, the duplicate rules are removed from individual workflow files and the global rules file is slimmed down. Third, a small server code change hides the internal "meta" workflow from agent discovery, since it serves as a skill repository rather than a workflow agents should run. Throughout, tests verify that every original rule is still accessible — just through the structured skill system instead of monolithic text payloads.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 04 | [KB research](04-kb-research.md) | Skill structure patterns, migration approach, start_session slimming | 20-45m | ✅ Complete |
| — | [Comprehension artifact](../../comprehension/rule-architecture.md) | Rule architecture, duplication map, migration paths | 20-45m | ✅ Complete |
| 06 | [Work package plan](06-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| — | Implementation | 13 tasks across 4 phases — all complete | 2-4h | ✅ Complete |
| 09 | [Change block index](09-change-block-index.md) | 28 blocks across 18 files | 5-10m | ✅ Complete |
| 09 | [Code review](09-code-review.md) | 0 critical, 2 low, 1 info — all acceptable | 10-20m | ✅ Complete |
| 09 | [Test suite review](09-test-suite-review.md) | 262 tests pass, coverage adequate | 10-20m | ✅ Complete |
| — | Validation | Build, test, lint — all pass | 15-30m | ✅ Complete |
| — | PR review | PR #89 ready for review | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, follow-up items | 10-20m | ✅ Complete |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#88](https://github.com/m2ux/workflow-server/issues/88) |
| PR | [#89](https://github.com/m2ux/workflow-server/pull/89) |
| Branch | `enhancement/88-rule-to-skill-migration` |
| Depends On | [#86](https://github.com/m2ux/workflow-server/issues/86) — Workflow-level skills |

---

**Status:** Complete — PR #89 submitted for review, all 262 tests pass
