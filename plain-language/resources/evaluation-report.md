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

## Controlled language

|| Check | Verdict | Basis |
||-------|---------|-------|
|| Writing rules | met / open | [the rule, and where it breaks] |
|| Approved words | met / open | [the word, and where it appears] |

## Open issues

|| # | Location | Principle | Issue | Fix |
||---|----------|-----------|-------|-----|
|| 1 | [where] | [principle] | [what the reader hits] | [the change] |
~~~~

## Rules

- **Evaluate as the reader.** Reread the draft with the readers' understanding, purpose, and context in mind — the profile governs the verdict, not the writer's sense of the prose.
- **A verdict names its basis.** Each principle's verdict cites the guidelines that carry it from [plain-language-standard](plain-language-standard.md#principles).
- **Open issues are actionable.** Each open issue locates the passage and names the fix, so the revision pass has no interpretation to redo.
- **The overlay is verified where it applied.** A run that drafted under the ASD-STE100 overlay carries a Controlled language verdict against [Writing Rules](asd-ste100.md#writing-rules) and [Approved Words](asd-ste100.md#approved-words). A run that drafted without it omits the section rather than recording it as not applicable.
- **An overlay breach is an open issue.** It joins the same list and the same count as a principle failure, naming the STE rule in its Principle cell, so delivery is gated on one number.
- **The count gates delivery.** Delivery is blocked while open issues remain; the report's open-issue count is the gate's input.
