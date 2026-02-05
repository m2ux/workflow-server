# Implementation Analysis: TOON to Markdown Conversion

**Date:** 2026-01-28  
**Status:** Complete

---

## Executive Summary

The TOON resource files are **compressed versions** of the original markdown guides, with 40-80% less content. The original markdown files contain:
- Embedded templates (TOON uses external references)
- Extended Good/Bad examples
- Explanatory prose sections ("Why This Matters", "Benefits")
- Integration guidance

**Recommendation:** Use original markdown guides as the base, then augment with TOON-unique content.

---

## Content Comparison Summary

| Metric | TOON Files | Original Markdown |
|--------|------------|-------------------|
| Average compression | ~50% | 100% (baseline) |
| Templates | External URI references | Embedded inline |
| Examples | Minimal/condensed | Extensive Good/Bad comparisons |
| Explanatory prose | Minimal | Rich (Why, Benefits, Research Context) |

### Detailed Comparisons

| File Pair | TOON Lines | Original Lines | Compression | Key Differences |
|-----------|------------|----------------|-------------|-----------------|
| start-here | 124 | 237 | 48% | Template embedded vs referenced |
| plan | 140 | 392 | 36% | Extended examples removed |
| assumptions-review | 145 | 435 | 33% | Templates + explanatory sections removed |
| design-framework | 172 | 287 | 60% | Step 5 template, Integration section removed |
| architecture-review | 168 | 815 | 21% | 13+ sections removed (tooling, checklist, examples) |
| complete | 145 | 362 | 40% | Full template, 8+ examples removed |

---

## Content Unique to TOON Files

These elements exist in TOON but **not** in original markdown and MUST be preserved:

### 1. Metadata Fields (all files)
```yaml
id: <resource-id>
version: 1.0.0
title: <Title>
purpose: <description>
```

### 2. Template References
TOON files reference templates via URIs instead of embedding:
```yaml
template: workflow://work-package/templates/XX
```

**Decision needed:** Keep as reference or re-embed templates?

### 3. Applicability Fields (some files)
```yaml
applicability: "Throughout implementation, after completing each task."
```

### 4. Related Guides URIs
```yaml
related-guides[3]:
  - workflow://work-package/guides/work-package
  - workflow://work-package/guides/readme
  - workflow://work-package/guides/work-packages
```

---

## Content Unique to Original Markdown

These elements exist in original markdown but were **removed** in TOON. All should be restored:

### 1. Embedded Templates
Full markdown templates with 100-145 lines each, including:
- START-HERE.md template
- Work Package Plan template
- Assumptions Log template
- ADR template
- COMPLETE.md template

### 2. Extended Examples
Good/Bad comparison examples for each section, e.g.:
```markdown
**Good:**
> Implement hybrid search combining vector similarity with BM25...

**Bad:**
> This work package improves search.
```

### 3. Explanatory Prose Sections
- "Why This Matters" (assumptions-review)
- "Benefits" subsections
- "Research Context" guidance
- "Integration with Workflow" sections

### 4. Visual Diagrams
ASCII flow diagrams with more detail than TOON versions.

### 5. Checklists and Tooling Guidance
- Architecture review checklist (detailed verification)
- ADR tooling recommendations (ADR-tools, Log4brains)
- Writing style Do/Don't lists

---

## Files Without Original Markdown Counterpart

### `19-end-here.toon` - NEW CONTENT

This file has **no corresponding markdown guide**. It must be converted directly from TOON.

**Content summary:**
- Completion checklist (10 verification items)
- 6 finalization steps with checkpoints
- Completion summary template
- Completion rules
- Post-implementation tasks (retrospective, archive, follow-ups)

**Note:** `complete.guide.md` is NOT a match - it covers creating the COMPLETE.md document, while `end-here.toon` covers the workflow ending procedure.

---

## File Mapping

| Index | TOON File | Original Markdown | Notes |
|-------|-----------|-------------------|-------|
| 00 | start-here.toon | start-here.guide.md | Restore original |
| 02 | readme.toon | readme.guide.md | Restore original |
| 03 | github-issue-creation.toon | github-issue-creation.guide.md | Restore original |
| 04 | jira-issue-creation.toon | jira-issue-creation.guide.md | Restore original |
| 05 | requirements-elicitation.toon | requirements-elicitation.guide.md | Restore original |
| 06 | implementation-analysis.toon | implementation-analysis.guide.md | Restore original |
| 07 | knowledge-base-research.toon | knowledge-base-research.guide.md | Restore original |
| 08 | design-framework.toon | design-framework.guide.md | Restore original |
| 09 | plan.toon | plan.guide.md | Restore original |
| 10 | test-plan.toon | test-plan.guide.md | Restore original |
| 11 | pr-description.toon | pr-description.guide.md | Restore original |
| 12 | assumptions-review.toon | assumptions-review.guide.md | Restore original |
| 13 | task-completion-review.toon | task-completion-review.guide.md | Restore original |
| 14 | architecture-review.toon | architecture-review.guide.md | Restore original |
| 15 | strategic-review.toon | strategic-review.guide.md | Restore original |
| 16 | complete.toon | complete.guide.md | Restore original |
| 17 | workflow-retrospective.toon | workflow-retrospective.guide.md | Restore original |
| 18 | resume-here.toon | resume-work.md | Restore original |
| 19 | end-here.toon | NONE | Convert from TOON |

---

## Loader Infrastructure

The `resource-loader.ts` already supports both formats:

```typescript
function parseResourceFilename(filename: string): { index: string; name: string; format: 'toon' | 'markdown' } | null {
  // Match pattern: {digits}-{name}.toon
  const toonMatch = filename.match(/^(\d+)-(.+)\.toon$/);
  // Match pattern: {digits}-{name}.md  
  const mdMatch = filename.match(/^(\d+)-(.+)\.md$/);
```

**No infrastructure changes required.**

---

## Conversion Strategy

### For Files with Original Markdown (18 files)

1. Copy original markdown guide to `resources/` folder with new naming
2. Add TOON metadata as YAML frontmatter:
   ```yaml
   ---
   id: <resource-id>
   version: 1.0.0
   ---
   ```
3. Preserve any TOON-unique content (applicability fields, etc.)
4. **Replace embedded templates with references** to standalone template files:
   ```markdown
   **Template:** See [workflow://work-package/templates/XX](../templates/XX-name.md)
   ```
5. Delete the .toon file

### For New TOON File (1 file: 19-end-here.toon)

1. Convert TOON structure to markdown prose
2. Expand structured arrays into markdown tables/lists
3. Add appropriate headers and formatting
4. Create as `19-end-here.md`
5. Delete the .toon file

---

## Estimated Effort

| Task | Files | Effort |
|------|-------|--------|
| Copy & rename originals | 18 | 10 min |
| Add YAML frontmatter | 19 | 15 min |
| Convert end-here.toon | 1 | 20 min |
| Delete TOON files | 19 | 5 min |
| Test loader | 1 | 10 min |
| **Total** | | ~1 hour |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Missing TOON-unique content | Diff each file before replacing |
| Loader compatibility | Run tests after conversion |
| Template references broken | Keep templates embedded (already in original) |
