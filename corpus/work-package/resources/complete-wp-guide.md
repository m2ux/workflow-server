---
name: complete-wp-guide
description: Template and fill rules for the COMPLETE.md close-out document.
metadata:
  version: 2.2.3
  order: 21
  legacy_id: 21
---


# Work Package Close-Out Guide

## Template

```markdown
# [Work Package Name] — Complete

> [Type] · branch `[branch-name]` · PR #[N] · [date]

## Summary

[2-3 sentences: what was built, why it matters, key measurable outcomes.
Link the [implementation plan](NN-work-package-plan.md) — do not restate its tasks.]

## Results

- Validation: all checks green.
  [If anything is not green, say what and why here, and link the report that states it.]
- Success criteria: all N met ([plan §Success Criteria](NN-work-package-plan.md#success-criteria)).
  [Rows only for divergences:]
  | Criterion | Target | Actual |
  |---|---|---|
  | [only criteria that missed, or exceeded in a way that matters] | | |
- Files changed: see [change-block index](NN-change-block-index.md).
- Test coverage: see [test plan](NN-test-plan.md).
- Architecture decision: [ADR NNNN](NNNN-decision-title.md). [Omit where no ADR was accepted.]
- Design decisions: recorded in the [plan](NN-work-package-plan.md#proposed-approach) and
  [assumptions log](NN-assumptions-log.md). [List here ONLY decisions made during
  implementation that are recorded nowhere else, each in the form
  Context / Decision / Rationale / Alternatives considered.]

## Open Work

<!-- One line per register. Neither register's entries are restated here — the register is the single statement of each item. -->
[One line per register that exists:]
- Follow-ups: N open — [each open entry's ID and one-line item].
- Deferred items: N open, M raised as issues — [each open entry's ID and one-line item; each raised issue linked on its key].

## Cost

[One line, omit if no usage was recorded: Token use and cost estimate: [token-usage](NN-token-usage.md).]

## Known Limitations

<!-- Canonical home. Caveats about what WAS delivered: edge cases, boundaries, assumptions that must hold. -->
- **[Limitation]** — [caveat]

## Lessons Learned

- [What went well / what to change — specific, not generic. Omit the section if nothing rises above noise.]

## Workflow Retrospective

[Per the [retrospective section template](workflow-retrospective.md#output-section-template). Omitted when the skip-if-trivial rule applies.]
```

## Rules

- **Point, don't restate.** Tasks live in the plan, test results in the validation report, files in the change-block index, open work in its register, cost in `token-usage.md`. A reader follows one link, or reads one line per open entry; a copy goes stale.
- **Open work by register, never by table.** Read `follow-ups.json` and `deferred-items.json` before writing Open Work, and emit one line per register that exists, pointing at each open entry per `canonical-home-map.link-only-slots`. The register keeps each entry's full statement; a close-out table of open items is a second home that drifts from it the moment an entry changes.
- **Exception-only results.** "All N criteria met" is one line. A table appears only when a row diverges from its target.
- **Omit null sections.** No "What Was NOT Implemented: none" — drop the heading.
- **Update in place** if post-merge changes occur; the close-out reflects the final delivered state.
- **Line budget:** ~100 lines. The close-out links each artifact and restates none of them.
