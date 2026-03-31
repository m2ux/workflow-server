# Eliminate Standalone rules.toon — March 2026

**Created:** 2026-03-31  
**Status:** In Progress  
**Type:** Refactor

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Migrate all behavioral guidance from the standalone `meta/rules.toon` file into two new meta skills (`session-protocol` and `agent-conduct`), then remove the rules file, its loader, and the rules payload from `start_session`. This eliminates the only instance of a parallel rules-loading mechanism, aligning all behavioral content delivery with the standard skill system.

---

## Problem Overview

The workflow server delivers behavioral guidance to AI agents through a structured skill system — agents call `get_skills` and receive the protocols they need for each activity. However, one set of guidance lives outside this system: a standalone rules file that gets bundled into the session startup response. This means the server maintains two separate delivery mechanisms for the same type of content — one through skills (used by every workflow) and one through a dedicated rules loader (used only by the meta workflow). This creates extra code to maintain, an inconsistent API surface, and confusion about where behavioral guidance should live.

The practical consequences are threefold. First, the `start_session` response is heavier than necessary because it carries the full rules payload alongside the token and metadata. Second, the rules file mixes orchestration concerns (how to handle tokens and step manifests) with IDE-specific concerns (how to manage tasks and recover from errors) that don't belong in the workflow server at all. Third, any developer extending the system must understand two loading paths instead of one, increasing the learning curve and the risk of guidance being missed or duplicated.

---

## Solution Overview

Split `meta/rules.toon` content into two new meta skills delivered through the standard skill system. The `session-protocol` skill (12 rules) covers token mechanics, step manifests, resource usage, and the bootstrap sequence. The `agent-conduct` skill (27 rules) covers code-modification boundaries, file restrictions, communication standards, documentation, domain-tool discipline, and build commands. Three IDE-specific sections (task-management, error-recovery, context-management) are dropped as not the workflow server's domain.

On the server side, `start_session` is slimmed to return only `{ workflow, session_token }` — no rules payload. The `rules-loader.ts` module, `rules.schema.ts`, and `RulesNotFoundError` are deleted. The `help` tool bootstrap guide is externalized to a versioned meta resource. Net effect: -293 lines, one fewer loader module, one fewer schema file, one fewer error class, and a consistent single delivery path for all behavioral guidance.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| — | Implementation | 8 tasks: skills, deletions, server changes, tests | 1-2h | ✅ Complete |
| 09 | [Change block index](09-change-block-index.md) | Indexed diff hunks for manual review | 5m | ✅ Complete |
| 09 | [Code review](09-code-review.md) | Automated code quality review | 10m | ✅ Complete |
| 09 | [Structural findings](09-structural-findings.md) | Conservation law, meta-law, bug table | 10m | ✅ Complete |
| 09 | [Test suite review](09-test-suite-review.md) | Test quality and coverage assessment | 10m | ✅ Complete |
| — | Validation | Build, test, lint verification | 5m | ✅ Complete |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#90](https://github.com/m2ux/workflow-server/issues/90) |
| PR | [#91](https://github.com/m2ux/workflow-server/pull/91) |

---

**Status:** Post-implementation review complete, proceeding to validation
