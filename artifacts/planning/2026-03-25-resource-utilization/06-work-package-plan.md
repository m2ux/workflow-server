# Work Package Plan: Resource Utilization Fix

**Issue:** [#61](https://github.com/m2ux/workflow-server/issues/61)
**Branch:** `fix/61-resource-utilization`
**PR:** [#62](https://github.com/m2ux/workflow-server/pull/62)
**Date:** 2026-03-25

---

## Summary

Fix agent resource utilization by restructuring the `get_skill` response to eliminate the `_resources` naming issue and updating TOON file language from "Load resource" (implying tool call) to "Use attached resource" (matching actual delivery mechanism).

---

## Tasks

### Task 1: Restructure `get_skill` response

**Goal:** Eliminate `_resources` underscore prefix by restructuring the response from a flat skill object to `{ skill: {...}, resources: {...} }`, matching the `get_skills` response structure.

**Files:**
- `src/tools/resource-tools.ts` (lines 98-136)

**Changes:**
1. In the `get_skill` handler, instead of spreading `_resources` into the skill object:

   ```typescript
   // Before
   const response = Object.keys(resources).length > 0
     ? { ...result.value as Record<string, unknown>, _resources: resources }
     : result.value;
   ```

   Wrap the skill in a `{ skill, resources }` structure:

   ```typescript
   // After
   const response = Object.keys(resources).length > 0
     ? { skill: result.value, resources }
     : { skill: result.value };
   ```

2. Update the `get_skill` tool description to mention the `resources` field.

**Tests to update:**
- `tests/mcp-server.test.ts` lines 232-256 — update assertions from `skill.id` → `response.skill.id` and `skill._resources` → `response.resources`

**Risk:** Medium — response shape change. Mitigated by the fact that agents consume JSON text, not typed clients.

---

### Task 2: Replace "Load resource" language in TOON files

**Goal:** Change all instances of "Load resource XX" to "Use attached resource XX" across workflow TOON files, making it clear that resources are already present in the response rather than requiring a separate tool call.

**Files (33 total):**

*work-package skills (15):*
- `workflows/work-package/skills/00-review-code.toon`
- `workflows/work-package/skills/01-review-test-suite.toon`
- `workflows/work-package/skills/02-respond-to-pr-review.toon`
- `workflows/work-package/skills/03-create-issue.toon`
- `workflows/work-package/skills/04-classify-problem.toon`
- `workflows/work-package/skills/05-elicit-requirements.toon`
- `workflows/work-package/skills/06-research-knowledge-base.toon`
- `workflows/work-package/skills/07-analyze-implementation.toon`
- `workflows/work-package/skills/08-create-plan.toon`
- `workflows/work-package/skills/09-create-test-plan.toon`
- `workflows/work-package/skills/12-review-strategy.toon`
- `workflows/work-package/skills/14-manage-artifacts.toon`
- `workflows/work-package/skills/15-manage-git.toon`
- `workflows/work-package/skills/18-update-pr.toon`
- `workflows/work-package/skills/22-build-comprehension.toon`

*work-package activities (4):*
- `workflows/work-package/activities/01-start-work-package.toon`
- `workflows/work-package/activities/06-plan-prepare.toon`
- `workflows/work-package/activities/08-implement.toon`
- `workflows/work-package/activities/12-submit-for-review.toon`

*work-packages skills (5):*
- `workflows/work-packages/skills/01-analyze-initiative-context.toon`
- `workflows/work-packages/skills/02-plan-work-package-scope.toon`
- `workflows/work-packages/skills/03-prioritize-packages.toon`
- `workflows/work-packages/skills/04-document-roadmap.toon`
- `workflows/work-packages/skills/05-orchestrate-package-execution.toon`

*Other workflows (9):*
- `workflows/meta/skills/08-gitnexus-operations.toon`
- `workflows/prism/skills/00-structural-analysis.toon`
- `workflows/prism-evaluate/skills/00-plan-evaluation.toon`
- `workflows/cicd-pipeline-security-audit/activities/05-sub-workflow-scan.toon`
- `workflows/cicd-pipeline-security-audit/skills/01-score-cicd-severity.toon`
- `workflows/cicd-pipeline-security-audit/skills/03-scan-injection-patterns.toon`
- `workflows/cicd-pipeline-security-audit/skills/07-write-cicd-report.toon`
- `workflows/substrate-node-security-audit/workflow.toon`
- `workflows/workflow-design/activities/08-quality-review.toon`

**Pattern:** Replace "Load resource NN" with "Use attached resource NN" in all contexts. Preserve the rest of the sentence (parenthetical name, purpose description).

**Risk:** Low — language-only change, no logic impact.

---

### Task 3: Update `execute-activity` bootstrap-skill protocol

**Goal:** Explicitly name the `resources` field in the bootstrap instructions so agents know where to find resources in the response.

**File:** `workflows/meta/skills/05-execute-activity.toon`

**Changes:**
1. In `protocol.bootstrap-skill`, update the second bullet from:

   > "Read each skill's protocol, rules, tools, inputs, and output definitions. Referenced resources are included in the response — no separate get_resource calls needed."

   To:

   > "Read each skill's protocol, rules, tools, inputs, and output definitions. Referenced resources are included in the 'resources' field of the response — apply them as templates when executing steps that reference resource indices."

2. In `tools.get_skill`, update the `returns` field to mention the new response structure:

   > "Skill definition wrapped in { skill, resources } — the skill object contains protocol, tools, rules, inputs, output; the resources object contains pre-loaded template content keyed by index"

**Risk:** Low.

---

### Task 4: Add resource-handling rule to `meta/rules.toon`

**Goal:** Add a global rule that unambiguously tells agents how to consume resources from skill responses.

**File:** `workflows/meta/rules.toon`

**Changes:**
1. Add a new section after `session-protocol`:

   ```
   - id: resource-handling
     title: Resource Handling
     priority: high
     rules[3]:
       - "Resources (templates, guides, checklists) are pre-loaded into skill responses. In get_skill responses, find them in the 'resources' field alongside the 'skill' field. In get_skills responses, find them in the top-level 'resources' field alongside 'skills'. Do NOT attempt to load resources via separate tool calls."
       - "When a skill step says 'Use attached resource NN', look up key 'NN' in the resources object. The value is the full resource content — apply it as a template or reference for the step's output."
       - "Resource content may be in TOON format (structured) or Markdown format (prose). Both are valid — parse TOON as structured data, use Markdown as-is."
   ```

**Risk:** Low.

---

### Task 5: Remove `note_resources` tool entries from TOON files

**Goal:** Remove the `note_resources` entries from skill `tools` sections. The global rule in `rules.toon` (Task 4) makes them redundant, and their current placement is part of the problem (buried in `tools`, not visible during protocol execution).

**Files (42 total):**

*work-package skills (17):*
- `workflows/work-package/skills/00-review-code.toon`
- `workflows/work-package/skills/01-review-test-suite.toon`
- `workflows/work-package/skills/03-create-issue.toon`
- `workflows/work-package/skills/04-classify-problem.toon`
- `workflows/work-package/skills/05-elicit-requirements.toon`
- `workflows/work-package/skills/06-research-knowledge-base.toon`
- `workflows/work-package/skills/07-analyze-implementation.toon`
- `workflows/work-package/skills/08-create-plan.toon`
- `workflows/work-package/skills/09-create-test-plan.toon`
- `workflows/work-package/skills/11-review-diff.toon`
- `workflows/work-package/skills/12-review-strategy.toon`
- `workflows/work-package/skills/15-manage-git.toon`
- `workflows/work-package/skills/17-finalize-documentation.toon`
- `workflows/work-package/skills/18-update-pr.toon`
- `workflows/work-package/skills/19-conduct-retrospective.toon`
- `workflows/work-package/skills/20-summarize-architecture.toon`
- `workflows/work-package/skills/22-build-comprehension.toon`

*Other workflow skills (25):*
- `workflows/work-packages/skills/01-05` (5 files)
- `workflows/prism/skills/00-03,05-12` (13 files)
- `workflows/cicd-pipeline-security-audit/skills/00,01,03-05,07-08` (7 files)
- `workflows/substrate-node-security-audit/skills/02-execute-sub-agent.toon`

**Pattern:** Remove the `note_resources` line (and its value) from each file's `tools` section.

**Risk:** Low — removing redundant hint that is now covered by the global rule.

---

### Task 6: Update `workflow-execution` skill error recovery

**Goal:** Update the `resource_not_found` error recovery text to reference the new `resources` field (not `_resources`).

**File:** `workflows/meta/skills/01-workflow-execution.toon`

**Change:** Line 94, update:
> "Resources are attached to skill responses — check the _resources field in get_skill output"

To:
> "Resources are attached to skill responses — check the 'resources' field in get_skill and get_skills output"

**Risk:** Low.

---

## Execution Order

1. **Task 1** (server code) — restructure `get_skill` response + update tests
2. **Task 4** (rules.toon) — add global resource-handling rule
3. **Task 3** (execute-activity) — update bootstrap protocol
4. **Task 6** (workflow-execution) — update error recovery text
5. **Task 2** (TOON language) — replace "Load resource" across 33 files
6. **Task 5** (note_resources) — remove from 42 files

Tasks 2-6 are workflow content changes that should be committed together. Task 1 is a server code change committed separately.

---

## Commit Strategy

| Commit | Content | Type |
|--------|---------|------|
| 1 | Task 1: `resource-tools.ts` + `mcp-server.test.ts` | `fix: restructure get_skill response to use resources field (#61)` |
| 2 | Tasks 2-6: All TOON file updates | `fix: update resource language and rules in workflow definitions (#61)` |
