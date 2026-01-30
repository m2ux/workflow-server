---
id: readme
version: 1.0.0
---

# Work Package README Guide

**Purpose:** Guidelines for creating the `README.md` quick navigation document for work package planning folders.

---

## Overview

The `README.md` file serves as a quick-reference navigation hub for a work package folder. It provides:
- Brief overview of the work package
- Directory of all planning documents
- Priority summary
- Clear next steps

> **Key Insight:** This document answers "What's in this folder and where do I start?" in under 30 seconds.

---

## When to Create

**Always create the README artifact when:**
- Creating a new work package planning folder
- Work package has multiple planning documents

---

## Template

```markdown
# [Work Package Name]

**Created:** [Date]
**Status:** [Planning/Ready/In Progress/Complete]

---

## 📋 Overview

[1-2 sentences summarizing the work package]

---

## 📚 What's Inside

| Document | Description | Status |
|----------|-------------|--------|
| **[START-HERE.md](START-HERE.md)** | 👈 **Read first** | ✅ |
| Work package plan | Implementation details | 📋 Ready |
| KB research | Knowledge base research findings | 📋 Ready |
| Implementation analysis | Current implementation analysis | 📋 Ready |

---

## 🎯 Priority

| Priority | Feature | Effort |
|----------|---------|--------|
| 🔴 HIGH | [Feature] | X-Yh |

---

## 🚀 Next Steps

1. Read [START-HERE.md](START-HERE.md)
2. Review KB research and implementation analysis artifacts
3. Review work package plan
4. Follow implementation workflow

---

**Next Step:** 👉 Read [START-HERE.md](START-HERE.md)
```

---

## Section Guidelines

### Header Block

Keep the header minimal - detailed metadata belongs in START-HERE.md:

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Work package name (no date) | `Hybrid Search Implementation` |
| **Created** | Creation date | `2024-12-21` |
| **Status** | Current state | `Planning`, `Ready`, `In Progress`, `Complete` |

### Overview

Write 1-2 sentences only. This is a teaser, not the full summary:

**Good:**
```markdown
## 📋 Overview

Implement hybrid search combining vector similarity with BM25 keyword matching to improve search relevance.
```

**Bad:**
```markdown
## 📋 Overview

This work package implements a comprehensive hybrid search system that combines vector similarity scoring with BM25 keyword matching algorithms. The implementation will include query preprocessing, score normalization, result merging, and extensive testing. The goal is to improve search precision by at least 35% on benchmark queries while maintaining P95 latency under 200ms.
```

### What's Inside Table

List all documents in the planning folder with clear descriptions:

| Column | Purpose |
|--------|---------|
| **Document** | Linked filename |
| **Description** | What the document contains |
| **Status** | Document readiness |

**Status indicators:**

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete and ready |
| 📋 Ready | Available to read |
| 🚧 Draft | In progress |
| ⬚ Pending | Not yet created |

**Standard documents to include:**

| Document | Description |
|----------|-------------|
| `START-HERE.md` | Executive summary and entry point |
| Work package plan | Detailed implementation plan |
| KB research | Knowledge base research findings |
| Implementation analysis | Current implementation analysis |
| Test plan | Detailed testing plan (if needed) |
| `COMPLETE.md` | Completion summary (after done) |

### Priority Table

Summarize priority and effort for quick scanning:

| Priority | Symbol | When to Use |
|----------|--------|-------------|
| HIGH | 🔴 | Critical path, blocking other work |
| MEDIUM | 🟡 | Important but not blocking |
| LOW | 🟢 | Nice to have, can defer |

### Next Steps

Provide a clear ordered list of actions. Always start with "Read START-HERE.md":

```markdown
## 🚀 Next Steps

1. Read [START-HERE.md](START-HERE.md)
2. Review research and analysis documents
3. Review implementation plan
4. Follow implementation workflow
```

---

## Updating README.md

Update this document when:

1. **Adding new documents** - Update What's Inside table
2. **Status changes** - Update header status
3. **Completion** - Add link to COMPLETE.md

---

## Quality Checklist

- [ ] Header has current status
- [ ] Overview is 1-2 sentences only
- [ ] All planning documents are listed in What's Inside
- [ ] Document links are correct
- [ ] Priority and effort are specified
- [ ] Next steps start with START-HERE.md
- [ ] Footer links to START-HERE.md

---

## Differences from START-HERE.md

| Aspect | README.md | START-HERE.md |
|--------|-----------|---------------|
| **Purpose** | Navigation hub | Executive summary |
| **Length** | Very short | Moderate |
| **Detail** | Minimal | Comprehensive |
| **Progress tracking** | No | Yes |
| **Timeline** | No | Yes |
| **Success criteria** | No | Yes |

**Rule of thumb:**
- README.md = "What's in this folder?"
- START-HERE.md = "What is this work package?"

---

## Integration with Workflow

This guide supports work package planning:

1. **Create planning folder** → Create README.md alongside START-HERE.md
2. **Add documents** → Update What's Inside table
3. **Status changes** → Keep header status in sync with START-HERE.md

---

## Related Guides

- [Work Package Implementation Workflow](../workflow.toon)
- [Work Package START-HERE](00-start-here.md)
- [Work Packages Workflow](../../work-packages/workflow.toon)
