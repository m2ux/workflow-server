# WP-006: Migrate Guides to Local Workflows Branch

**Issue:** [#6](https://github.com/m2ux/workflow-server/issues/6)
**PR:** [#7](https://github.com/m2ux/workflow-server/pull/7)
**Branch:** 6-migrate-work-package-guides
**Status:** In Progress

## Objective

Migrate work-package guide documents from the external `agent-resources` repository to the local `workflows` orphan branch, converting them to TOON format.

---

## Requirements Elicitation

### Problem Statement

The work-package workflow currently references guides hosted externally at:
`https://raw.githubusercontent.com/m2ux/agent-resources/main/workflows/work-package/`

This creates external dependencies and inconsistency with local TOON format.

### Target Structure

```
workflows branch:
  work-package/
    work-package.toon                      # moved from root
    requirements-elicitation.guide.toon
    implementation-analysis.guide.toon
    knowledge-base-research.guide.toon
    plan.guide.toon
    design-framework.guide.toon
    test-plan.guide.toon
    ... (all 23 guides)
```

### TOON Conversion Approach

**Hybrid approach:**
- Structural elements (headers, lists, code blocks) → TOON syntax
- Prose content → preserved in content blocks

### Guide Reference Pattern

**URI Pattern:** `workflow://<workflow-id>/guides/<guide-id>`

Examples:
- `workflow://work-package/guides/requirements-elicitation`
- `workflow://work-package/guides/implementation-analysis`

### Guide Loader Implementation

New `guide-loader.ts` following existing loader patterns:
- Similar to `workflow-loader.ts`, `intent-loader.ts`, `skill-loader.ts`
- Exposes guides as MCP resources
- Resolves workflow-namespaced guide URIs

---

## Scope

### In Scope

- Migrate 23 guide documents from `agent-resources` repo
- Convert guides to TOON format (hybrid approach)
- **Extract embedded templates** from guides as discrete `.template.md` files
- Create `work-package/` folder structure on workflows branch
- Move `work-package.toon` into this folder
- Implement `guide-loader.ts` with workflow-namespaced loading
- Implement `template-loader.ts` with index-based URI routing
- Implement guide resources: `workflow://<workflow-id>/guides/<guide-id>`
- Implement template resources: `workflow://<workflow-id>/templates/<index>`
- Update `work-package.toon` to use new resource URIs
- Update guides to reference templates by index URI

### Out of Scope

- Migrating guides for other workflows (only work-package)
- Modifying guide instructional content (just format/structure changes)
- Removing the original guides from `agent-resources` repo
- **Formalizing ASCII flow diagrams** - Deferred to future work package
  - ASCII diagrams remain as prose content blocks
  - Future WP: Convert to Zod-validated flow schema elements
  - Guides affected: requirements-elicitation, implementation-analysis, plan, architecture-review, workflow-retrospective, strategic-review

---

## Acceptance Criteria

1. **Migration Complete**
   - [ ] All 23 guide documents migrated to `work-package/` folder
   - [ ] `work-package.toon` moved to `work-package/` folder
   - [ ] All ~12 templates extracted as discrete `.template.md` files

2. **TOON Conversion Valid**
   - [ ] All guides converted to `.toon` format
   - [ ] Structural elements use TOON syntax
   - [ ] Prose content preserved in content blocks
   - [ ] Files parse without errors

3. **Template Extraction Complete**
   - [ ] Templates use `{NN}-{name}.template.md` naming convention
   - [ ] Templates remain as Markdown (not TOON)
   - [ ] Guides reference templates by index URI

4. **Loaders Implemented**
   - [ ] `guide-loader.ts` with workflow-namespaced loading
   - [ ] `template-loader.ts` with index-based filename parsing
   - [ ] Guide resources: `workflow://<workflow-id>/guides/<guide-id>`
   - [ ] Template resources: `workflow://<workflow-id>/templates/<index>`

5. **References Updated**
   - [ ] `work-package.toon` uses new resource URIs
   - [ ] Guides reference templates via `workflow://work-package/templates/{NN}`
   - [ ] No external `agent-resources` URL dependencies

6. **Tests Pass**
   - [ ] Existing workflow tests continue to pass
   - [ ] New guide loader tests added and passing
   - [ ] New template loader tests added and passing

---

## Template Extraction

### Overview

Guides contain embedded document templates that should be extracted as discrete files for reusability and independent access.

### Naming Convention

**Filename Format:** `{NN}-{descriptive-name}.template.md`
**URI Pattern:** `workflow://{workflow-id}/templates/{NN}`

The numeric index (`NN`) serves as the stable reference in URIs, while the descriptive name provides human readability. The loader parses filenames to extract the index for URI routing.

### Templates to Extract

| Index | Filename | Source Guide | Purpose |
|-------|----------|--------------|---------|
| 01 | `01-implementation-analysis.template.md` | implementation-analysis.guide | Analysis document |
| 02 | `02-kb-research.template.md` | knowledge-base-research.guide | Research findings |
| 03 | `03-work-package-plan.template.md` | plan.guide | Implementation plan |
| 04 | `04-test-plan-initial.template.md` | test-plan.guide | Initial test plan (placeholder) |
| 05 | `05-test-plan-final.template.md` | test-plan.guide | Final test plan |
| 06 | `06-adr.template.md` | architecture-review.guide | Architecture Decision Record |
| 07 | `07-complete.template.md` | complete.guide | Completion record |
| 08 | `08-pr-description-initial.template.md` | pr-description.guide | Initial PR description |
| 09 | `09-pr-description-final.template.md` | pr-description.guide | Final PR description |
| 10 | `10-github-issue.template.md` | github-issue-creation.guide | GitHub issue |
| 11 | `11-jira-issue.template.md` | jira-issue-creation.guide | Jira issue |
| 12 | `12-checkpoint.template.md` | (various) | Checkpoint presentation |

### Target Structure

```
work-package/
  work-package.toon                           # workflow definition
  
  # Guides (instructional, reference templates by index)
  requirements-elicitation.guide.toon
  implementation-analysis.guide.toon
  ...
  
  # Templates (discrete, indexed for URI lookup)
  01-implementation-analysis.template.md
  02-kb-research.template.md
  03-work-package-plan.template.md
  04-test-plan-initial.template.md
  05-test-plan-final.template.md
  06-adr.template.md
  07-complete.template.md
  08-pr-description-initial.template.md
  09-pr-description-final.template.md
  10-github-issue.template.md
  11-jira-issue.template.md
  12-checkpoint.template.md
```

### URI Examples

| URI | Resolves To |
|-----|-------------|
| `workflow://work-package/templates/01` | `01-implementation-analysis.template.md` |
| `workflow://work-package/templates/06` | `06-adr.template.md` |
| `workflow://work-package/guides/plan` | `plan.guide.toon` |

### Implementation

1. **Template Loader** - Parse `{index}-*.template.md` pattern to build index→file mapping
2. **Template Resources** - Expose via `workflow://{workflow-id}/templates/{index}`
3. **Guide References** - Guides reference templates by index URI instead of embedding

---

## Research Findings

### TOON Format Specification (v2.0)

**Source:** https://github.com/toon-format/spec

**Key Characteristics:**
- Line-oriented, indentation-based (default 2 spaces)
- Encodes JSON data model with explicit structure
- Designed for token efficiency in LLM contexts

**Syntax Summary:**

| Element | Syntax |
|---------|--------|
| Primitive field | `key: value` |
| Nested object | `key:` (fields at depth+1) |
| Inline array | `key[N]: v1,v2,...` |
| Expanded array | `key[N]:` then `- item` at depth+1 |
| Tabular array | `key[N]{f1,f2}:` then rows at depth+1 |

**Quoting Rules:**
Strings MUST be quoted if:
- Empty, has leading/trailing whitespace
- Equals `true`, `false`, `null`
- Numeric-like pattern
- Contains `:`, `"`, `\`, `[`, `]`, `{`, `}`
- Contains newline, carriage return, tab
- Contains active delimiter
- Starts with `-`

**Escape Sequences (only these 5):**
- `\\` → backslash
- `\"` → double quote
- `\n` → newline
- `\r` → carriage return
- `\t` → tab

### Guide TOON Structure (Proposed)

For hybrid conversion (structural + prose blocks):

```toon
id: requirements-elicitation
version: 1.0.0
title: Requirements Elicitation Guide
purpose: Discover and clarify work package requirements
sections[N]:
  - id: overview
    title: Overview
    content: """
      Multi-line prose content preserved as-is.
      Markdown formatting within content blocks.
    """
  - id: steps
    title: Process Steps
    steps[M]:
      - step: 1
        title: Explore Problem Space
        description: Ask one question at a time
```

### Existing Loader Pattern Analysis

From `workflow-loader.ts` and `skill-loader.ts`:
- Use `decodeToon()` from `../utils/toon.js`
- Pattern: `listX()` returns manifest entries, `loadX()` returns full content
- Error handling via `Result<T, Error>` type
- Logging via `logInfo()`, `logError()`

---

## Implementation Analysis

### Current State

**Directory Structure:**
```
workflow-data/
  workflows/
    example-workflow.toon
    work-package.toon          # at root level
  guides/
    project-setup.guide.md     # flat, single placeholder
```

**Guide Loader (`guide-loader.ts`):**
- Reads from flat `guideDir` configuration
- Supports `.md` files only (patterns: `{name}.guide.md`, `{name}.md`)
- Not workflow-namespaced

**Guide Resources (`guide-resources.ts`):**
- URI pattern: `workflow://guides/{name}` (flat)
- Returns markdown content

**Config (`config.ts`):**
- Separate `workflowDir` and `guideDir` paths

### Required Changes

| Component | Change Required |
|-----------|-----------------|
| Directory structure | Create `work-package/` folder with workflow, guides, and templates |
| `workflow-loader.ts` | Support subdirectory structure `{workflowDir}/{id}/{id}.toon` |
| `guide-loader.ts` | Add TOON support, workflow-namespaced loading |
| `template-loader.ts` | **New** - Index-based loading, parse `{NN}-*.template.md` pattern |
| `guide-resources.ts` | Update URI: `workflow://{workflowId}/guides/{guideId}` |
| `template-resources.ts` | **New** - URI: `workflow://{workflowId}/templates/{index}` |
| `config.ts` | Remove separate `guideDir` (guides/templates in workflow dirs) |
| `errors.ts` | Add `TemplateNotFoundError`, update `GuideNotFoundError` |

### Implementation Tasks

1. **Fetch guides** - Download all 23 guides from agent-resources
2. **Extract templates** - Parse guides, extract embedded templates to discrete files
3. **Convert guides to TOON** - Hybrid conversion (structural + prose blocks)
4. **Index templates** - Name templates with `{NN}-{name}.template.md` pattern
5. **Restructure directories** - Create `work-package/` folder on workflows branch
6. **Implement guide-loader** - Workflow-namespaced TOON guide loading
7. **Implement template-loader** - Index-based template loading with filename parsing
8. **Implement resources** - Guide and template resource handlers
9. **Update workflow** - Change guide references in `work-package.toon`
10. **Update guides** - Reference templates by index URI
11. **Add tests** - Guide and template loader tests

---

## Implementation Progress

### Session: 2026-01-22

**Completed Tasks:**

1. ✅ **Fetch guides** - Downloaded all 23 guides from agent-resources to `/tmp/guide-migration/`
2. ✅ **Extract templates** - Extracted 12 templates to `/tmp/guide-migration/templates/`
3. ⏳ **Convert guides to TOON** - Proof of concept completed (3 of 23 guides)

**Proof of Concept TOON Conversions:**

| Guide | Lines (MD) | Lines (TOON) | Status |
|-------|-----------|--------------|--------|
| start-here.guide.md | 238 | 123 | ✅ Converted |
| requirements-elicitation.guide.md | 403 | 186 | ✅ Converted (includes ASCII flow) |
| knowledge-base-research.guide.md | 338 | 176 | ✅ Converted |

**Conversion Pattern Established:**
- Top-level fields: `id`, `version`, `title`, `purpose`
- `sections[]` array with `id`, `title`, optional `content` blocks
- Tabular data uses TOON `{field1,field2}:` syntax
- ASCII flow diagrams preserved in `flow:` content blocks (deferred formalization)
- Template references use `template: workflow://work-package/templates/{NN}`
- Related guides use `guides[]` with workflow URIs

**Extracted Templates (12 total):**
- 01-implementation-analysis.template.md
- 02-kb-research.template.md
- 03-work-package-plan.template.md
- 04-test-plan-initial.template.md
- 05-test-plan-final.template.md
- 06-adr.template.md
- 07-complete.template.md
- 08-pr-description-initial.template.md
- 09-pr-description-final.template.md
- 10-github-issue.template.md
- 11-jira-issue.template.md
- 12-checkpoint.template.md

**Remaining Tasks:**
- Convert remaining 20 guides to TOON format
- Create work-package/ folder structure on workflows branch
- Implement guide-loader.ts and template-loader.ts
- Implement guide-resources.ts and template-resources.ts
- Update work-package.toon with new URIs
- Add tests

**Files Location:**
- Downloaded guides: `/tmp/guide-migration/*.md`
- Extracted templates: `/tmp/guide-migration/templates/*.template.md`
- TOON conversions: `/tmp/guide-migration/toon/*.guide.toon`

---

## Documents to Migrate

| # | Guide | Purpose |
|---|-------|---------|
| 1 | work-package.md | Main workflow guide |
| 2 | requirements-elicitation.guide.md | Phase 2 guide |
| 3 | implementation-analysis.guide.md | Phase 3 guide |
| 4 | knowledge-base-research.guide.md | Phase 4 guide |
| 5 | plan.guide.md | Phase 5 planning |
| 6 | design-framework.guide.md | Design approach |
| 7 | test-plan.guide.md | Test planning |
| 8 | pr-description.guide.md | PR documentation |
| 9 | assumptions-review.guide.md | Assumption validation |
| 10 | task-completion-review.guide.md | Task review |
| 11 | architecture-review.guide.md | ADR guidance |
| 12 | strategic-review.guide.md | Phase 8 review |
| 13 | complete.guide.md | Completion documentation |
| 14 | workflow-retrospective.guide.md | Post-implementation |
| 15 | github-issue-creation.guide.md | GitHub issue templates |
| 16 | jira-issue-creation.guide.md | Jira issue templates |
| 17 | start-here.guide.md | Entry point |
| 18 | readme.guide.md | README guidance |
| 19 | _START_HERE.md | Entry point (alt) |
| 20 | README.md | Directory readme |
| 21 | references.md | Reference links |
| 22 | resume-work.md | Resume guidance |
| 23 | work-packages.md | Work package overview |
