---
name: evaluation-report
description: Creation guide for the evaluation-report artifact — the structured result of evaluating a draft against the four principles, with the open issues that drive revision.
metadata:
  order: 4
---

# Evaluation Report Guide

The evaluation decision surface. Answers: does the draft meet the principles, and where does it still fail its readers? Canonical home for the per-principle verdict and the open-issue list that gates delivery.

## Template

~~~~markdown
# Evaluation Report — {document title}

**Round:** {n} · **Open issues:** {count}

[One line: the overall verdict on this draft.]

## Verdict by principle

|| Principle | Verdict | Basis |
||-----------|---------|-------|
|| Relevant | met / open | [why] |
|| Findable | met / open | [why] |
|| Understandable | met / open | [why] |
|| Usable | met / open | [why] |

## Open issues

|| # | Location | Principle | Issue | Fix |
||---|----------|-----------|-------|-----|
|| 1 | [where] | [principle] | [what the reader hits] | [the change] |
~~~~

## Rules

- **Evaluate as the reader.** Reread the draft with the readers' understanding, purpose, and context in mind — the profile governs the verdict, not the writer's sense of the prose.
- **A verdict names its basis.** Each principle's verdict cites the guidelines that carry it from [plain-language-standard](plain-language-standard.md#principles).
- **Open issues are actionable.** Each open issue locates the passage and names the fix, so the revision pass has no interpretation to redo.
- **The count gates delivery.** Delivery is blocked while open issues remain; the report's open-issue count is the gate's input.
