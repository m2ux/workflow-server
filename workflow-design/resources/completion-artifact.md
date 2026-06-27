---
name: completion-artifact
description: Template and guidelines for the COMPLETE.md completion summary of a workflow-design session.
metadata:
  order: 6
---

# Design Session Completion Guide

**Purpose:** Guidelines for the `COMPLETE.md` completion summary that records what a workflow-design session actually delivered — the workflow-design counterpart of the work-package [complete-wp](../../work-package/resources/complete-wp.md) guide, with design-authoring sections in place of code/test sections.

---

## Overview

`COMPLETE.md` is the completion record for a workflow-design session. It answers "what was actually delivered, what was decided, and what is left open?" and captures authoring reality that may differ from the original scope.

---

## Template

```markdown
# Workflow Design: [Workflow ID] — Complete ✅

**Date:** [Date]
**Mode:** [Create / Update]
**Status:** COMPLETED

---

## Summary

[2-3 sentences: what workflow was created or what changed, and why it matters]

---

## What Was Delivered

- **Activities:** [created / modified activities]
- **Techniques:** [created / modified techniques]
- **Resources:** [created / modified resources]
- **Variables / rules:** [notable additions]

(In update mode, frame each as added / modified / removed against the prior version.)

---

## Design Decisions

### Decision 1: [Title]
**Context:** [why the decision was needed]
**Decision:** [what was chosen]
**Rationale:** [why this option]
**Alternatives rejected:** [what else was considered, and why not]

---

## Scope Outcome

*Comparison against the confirmed scope manifest.*

| Manifest item | Action | Status |
|---------------|--------|--------|
| [file] | create / modify / remove | ✅ Done |

Drift (changes outside the manifest, or unaddressed items): [from the scope-discipline audit, or "none"]

---

## Known Limitations & Deferrals

- ⚠️ **[Limitation]** — [caveat about the delivered workflow]
- ❌ **[Deferred item]** — [reason / follow-up]

---

## Lessons Learned

### What Went Well
- [observation]

### What Could Be Improved
- [challenge encountered and how to avoid it next time]

---

**Status:** ✅ COMPLETE
```

---

## Section Guidelines

- **Header:** workflow id, date, mode (Create/Update), Status COMPLETED.
- **What Was Delivered:** concrete — name the activities, techniques, and resources produced or changed, not a vague summary.
- **Design Decisions:** capture the non-obvious choices and the alternatives rejected; this parallels the planning README's Design Decisions section and is the durable record of why the workflow is shaped as it is.
- **Scope Outcome:** compare against the scope manifest, folding in the scope-discipline audit's drift findings.
- **Known Limitations & Deferrals:** caveats about the delivered workflow and anything intentionally deferred.
- **Lessons Learned:** honest, specific observations — these feed the retrospective.

---

## Related Guides

- [Work Package Completion Guide](../../work-package/resources/complete-wp.md) — the work-package counterpart this template parallels
- [Design Context README](design-context-readme.md)
