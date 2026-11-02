## Overview

This PR introduces Work Designer as a general assistant for reasoning about goals, requirements, architecture, contracts and design decisions. Its two modes are **Review**, which produces an evidence-backed integration report, and **Revise**, which maintains the skill using the work-planner authoring pattern.

## Changes

The change adds shared work-design procedures, project configuration and linked test evidence so reviewers can assess the work, its validation and the limits of its evidence.

### Review Procedure

- **Coverage follows the project.**
  Checks trace architecture, requirements, declarations and consumers using each affected branch’s languages, constructs, schemas and responsibilities.
- **Findings identify the reviewed result.**
  Reports record heads, targets, merge bases, tested combinations and proposed merge or deployment order; revision freshness and CI checkout evidence determine applicability.
- **Missing evidence remains visible.**
  Executed checks, inspection and inference remain distinct; skipped checks, unavailable environments and stale pairings constrain readiness claims.

### Project Configuration

- **Projects own their variants.**
  `variants/<project>/VARIANT.md` supplies project identity, planning settings, document homes and mode configuration, with concrete invocations in its adjacent command reference.
- **Selection follows project context.**
  Selection uses an explicit choice or a unique repository match; unconfigured projects derive settings from their own sources.
- **Workflow-server has a supplied variant.**
  It covers engine and schema checks on `main`, definitions and walks on `workflows`, packaging on `docker`, and scripts, hooks and skills on `workspace`.
- **Planning is shared across modes.**
  A shared guide resolves the planning location and reuses the work’s record; the selected project supplies its root and naming convention.

### Skill Maintenance

- **Revise follows existing skill conventions.**
  Revisions use a worktree, authoritative rule homes, link and structure checks, representative walkthroughs and commit/push delivery.
- **Authoring rules preserve the skill’s structure.**
  Rules precede Dependencies, core guidance names individual projects only as examples, and project configuration and shared planning each have one home.
- **Shared guidelines govern selective reading.**
  Authors state applicability beside conditional links, preserve section boundaries in batched reads, name prerequisites and keep required output complete.
- **Representative scenarios belong to Work Designer.**
  Its mode and variant scenarios remain local and link to the shared authoring rules; required consumer guidance can cross modes.
- **Verification observes delivered instructions.**
  Reading-path changes require repeated realistic requests in independent fresh contexts and inspection of actual tool calls, returned content and task results.
- **Claims follow the evidence.**
  Structural checks and live behavior are reported separately; context-token savings require a comparable baseline.

### Pull Request Evidence

- **Test results link to supporting evidence.**
  The shared template and Test Plan rules keep brief checks and results in the table, with procedures, revisions, observations and limitations in the published planning document.
- **Delivery recognizes linked results.**
  A linked tick counts as a pass; Partial, Fail, Not run and mixed tick/Partial labels keep the plan incomplete.

## Test Plan

| Test | Description | Coverage | Pass |
| --- | --- | --- | --- |
| T1 | Work-planner regression suite | | [✓](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-10-1295-work-designer-test-evidence/test-evidence.md#t1) |
| T2 | Work Designer and Work Planner skill validation | | [✓](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-10-1295-work-designer-test-evidence/test-evidence.md#t2) |
| T3 | Local links, anchors and mode structure | | [✓](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-10-1295-work-designer-test-evidence/test-evidence.md#t3) |
| T4 | Project source links | | [✓](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-10-1295-work-designer-test-evidence/test-evidence.md#t4) |
| T5 | Guidance walkthroughs | | [✓](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-10-1295-work-designer-test-evidence/test-evidence.md#t5) |
| T6 | Whitespace validation | | [✓](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-10-1295-work-designer-test-evidence/test-evidence.md#t6) |
| T7 | Docker Review-planning evaluations | | [Partial](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-10-1295-work-designer-test-evidence/test-evidence.md#t7) |
| T8 | Revise disclosure evaluations | | [Partial](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-10-1295-work-designer-test-evidence/test-evidence.md#t8) |
| T9 | Linked-result delivery checks | | [✓](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-10-1295-work-designer-test-evidence/test-evidence.md#t9) |

---

**Appendix — reading record, outside the proposed PR body**

Skill paths below are relative to `/home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-planner/`.

| File | Content actually read |
| --- | --- |
| `/tmp/work-designer-pr-format-input.md` | Entire file, lines 1–85 |
| `SKILL.md` | Entire file, lines 1–218 |
| `templates/pull-request.md` | Entire file, lines 1–25 |
| `references/work-breakdown.md` | Entire file, lines 1–263; Test Plan rules at 181–202 |
| `references/deliver-mode.md` | Heading index only: lines 1, 5, 38 and 61 |
| `/home/mike1/.codex/memories/MEMORY.md` | Keyword-search matches only: lines 47, 49, 60, 69, 75 and 123; no relevant drafting evidence used |

Evidence URLs use the supplied publication target. Accessibility and publication verification remain with the caller.
