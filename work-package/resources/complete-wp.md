---
name: complete-wp
description: Template for the COMPLETE.md close-out document — the work package's single terminal artifact.
metadata:
  version: 2.1.0
  order: 21
  legacy_id: 21
---


# Work Package Close-Out Guide

`COMPLETE.md` is the **single terminal artifact** of a work package. It answers "what was actually delivered, what remains, and what did we learn?" — and it links to canonical artifacts rather than restating them. There is no separate retrospective, session-summary, or close-out-summary document.

It is the **canonical home** for exactly one thing: known limitations. Everything else it carries by link — deferred items live in the [deferred-items register](deferred-items.md).

## Template

```markdown
# [Work Package Name] — Complete

> [Type] · branch `[branch-name]` · PR #[N] · [date]

## Summary

[2-3 sentences: what was built, why it matters, key measurable outcomes.
Link the [implementation plan](NN-work-package-plan.md) — do not restate its tasks.]

## Results

- Validation: all checks green — see [validation report](NN-validation.md).
  [If anything is not green, say what and why here.]
- Success criteria: all N met ([plan §Success Criteria](NN-work-package-plan.md#success-criteria)).
  [Rows only for divergences:]
  | Criterion | Target | Actual |
  |---|---|---|
  | [only criteria that missed, or exceeded in a way that matters] | | |
- Files changed: see [change-block index](NN-change-block-index.md).
- Design decisions: recorded in the [plan](NN-work-package-plan.md#proposed-approach) and
  [assumptions log](NN-assumptions-log.md). [List here ONLY decisions made during
  implementation that are recorded nowhere else, each in the form
  Context / Decision / Rationale / Alternatives considered.]

## Deferred Items

[One line, omit if no register exists: Deferred items: [register](NN-deferred-items.md) — N open, M raised as issues.]

## Known Limitations

<!-- Canonical home. Caveats about what WAS delivered: edge cases, boundaries, assumptions that must hold. -->
- **[Limitation]** — [caveat]

## Lessons Learned

- [What went well / what to change — specific, not generic. Omit the section if nothing rises above noise.]

## Workflow Retrospective

[Written by conduct-retrospective — see the [retrospective section template](workflow-retrospective.md#output-section-template). Omitted when the skip-if-trivial rule applies.]
```

## Rules

- **Link, don't restate.** Tasks live in the plan, test results in the validation report, files in the change-block index. A reader follows one link; a copy goes stale.
- **Exception-only results.** "All N criteria met" is one line. A table appears only when a row diverges from its target.
- **Omit null sections.** No "What Was NOT Implemented: none" — drop the heading.
- **Update in place** if post-merge changes occur; the close-out reflects the final delivered state.
