---
id: workflow-retrospective
version: 1.0.0
---

# Workflow Retrospective Guide

## Overview

This guide provides methodology and templates for analyzing work package sessions to identify workflow improvements. The retrospective examines user interactions that were NOT direct responses to checkpoint questions to surface friction points, unclear instructions, and missing guidance.

**When to use this guide:** After completing a work package, before marking the PR ready for review.

---

## Analysis Methodology

### What to Analyze

Scan the chat history for non-checkpoint interactions that signal workflow issues:

| Signal Type | Examples | Indicates |
|-------------|----------|-----------|
| **Clarification requests** | "What do you mean by X?", "Can you explain Y?" | Unclear instructions or missing context |
| **Corrections** | "No, I meant...", "Actually, do this instead" | Ambiguous workflow steps or assumptions |
| **Frustration signals** | "Why are you doing X?", "I already said..." | Workflow friction or missed requirements |
| **Process questions** | "Should I do X first?", "What about Y?" | Missing guidance or unclear sequencing |
| **Feature requests** | "Can you also...", "It would be helpful if..." | Missing workflow capabilities |
| **Skipped steps** | User asks to skip or abbreviate | Unnecessary complexity or over-engineering |

### Analysis Process

```
┌─────────────────────────────────────┐
│ 1. Count total user messages        │
│    - Identify checkpoint responses  │
│    - Identify non-checkpoint msgs   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 2. Categorize non-checkpoint msgs   │
│    - Clarifications                 │
│    - Corrections                    │
│    - Process questions              │
│    - Frustration signals            │
│    - Feature requests               │
│    - Skip requests                  │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 3. Identify root causes             │
│    - Map to workflow sections       │
│    - Determine pattern frequency    │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 4. Formulate recommendations        │
│    - Prioritize by impact           │
│    - Specify affected sections      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 5. Create retrospective report      │
└─────────────────────────────────────┘
```

### Checkpoint vs Non-Checkpoint Messages

**Checkpoint responses** are direct answers to workflow checkpoint questions:
- "Yes, proceed"
- "Confirmed"
- "Looks good"
- Answers to elicitation questions
- Approval/rejection of proposed approaches

**Non-checkpoint interactions** are everything else:
- Questions about the process
- Corrections to agent behavior
- Requests for clarification
- Feature requests or suggestions
- Expressions of confusion or frustration

---

## When to Skip

Skip the retrospective if:
- Session was straightforward with only checkpoint responses
- No clarification requests, corrections, or process questions occurred
- Work package was trivial (single task, <30 min)

---

## Prioritization Criteria

### High Priority

Issues that should be addressed before the next work package:
- Repeated corrections for the same issue
- Frustration signals indicating significant friction
- Missing guidance that caused incorrect implementation
- Workflow steps that were consistently skipped

### Medium Priority

Issues worth addressing but not blocking:
- Single clarification requests
- Minor process questions
- Suggestions for convenience improvements

### Low Priority / Observations

Patterns worth noting for future consideration:
- Edge cases encountered
- Potential optimizations
- Ideas for new capabilities

---

## Output Document Template


**Template:**

```markdown
# Workflow Retrospective: [Work Package Name]

**Date:** YYYY-MM-DD
**Work Package:** [Name]
**PR:** #[number]

---

## Session Analysis

**Total User Messages:** [count]
**Checkpoint Responses:** [count]
**Non-Checkpoint Interactions:** [count]

---

## Observations

### Clarification Requests

| # | User Message | Context | Potential Issue |
|---|--------------|---------|-----------------|
| 1 | "[Quote]" | [Activity/step] | [What was unclear] |

### Corrections Made

| # | Original Action | User Correction | Root Cause |
|---|-----------------|-----------------|------------|
| 1 | [What agent did] | "[User correction]" | [Why this happened] |

### Process Questions

| # | Question | Answer Given | Workflow Gap |
|---|----------|--------------|--------------|
| 1 | "[Question]" | [Response] | [Missing guidance] |

### Frustration Signals

| # | Signal | Context | Friction Point |
|---|--------|---------|----------------|
| 1 | "[Quote]" | [Situation] | [What caused friction] |

---

## Improvement Recommendations

### High Priority

| # | Issue | Recommendation | Affected Section |
|---|-------|----------------|------------------|
| 1 | [Issue summary] | [Specific change] | [Workflow section] |

### Medium Priority

| # | Issue | Recommendation | Affected Section |
|---|-------|----------------|------------------|
| 1 | [Issue summary] | [Specific change] | [Workflow section] |

### Low Priority / Observations

| # | Observation | Consideration |
|---|-------------|---------------|
| 1 | [Pattern noticed] | [Potential improvement] |

---

## Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Activities completed | X/11 | [Any skipped] |
| Checkpoints triggered | X | [Expected vs actual] |
| User corrections | X | [Trend] |
| Workflow deviations | X | [Types] |

---

## Summary

**Overall Session Quality:** [Smooth / Minor friction / Significant issues]

**Key Takeaway:** [One sentence summary of most important finding]

**Action Required:** [Yes - create issue / No - informational only]
```

---

## Anti-Patterns to Avoid

| Don't | Why | Do Instead |
|-------|-----|------------|
| Ignore minor friction | Small issues compound | Document all observations |
| Blame the user | Users reveal workflow gaps | Focus on workflow improvements |
| Skip categorization | Loses pattern visibility | Always categorize signals |
| Make vague recommendations | Can't be actioned | Be specific about changes |
| Recommend too many changes | Overwhelming | Prioritize ruthlessly |

---

## Quick Reference

### Minimum Viable Retrospective

For simpler sessions, at minimum capture:
- [ ] Count of non-checkpoint interactions
- [ ] List of any corrections made
- [ ] One key takeaway
- [ ] Action required: yes/no

### Signal Priority

| Signal | Priority | Action |
|--------|----------|--------|
| Frustration | High | Immediate attention |
| Corrections | High | Root cause analysis |
| Process questions | Medium | Add guidance |
| Clarifications | Medium | Improve clarity |
| Feature requests | Low | Backlog consideration |
| Skip requests | Low | Simplification review |
