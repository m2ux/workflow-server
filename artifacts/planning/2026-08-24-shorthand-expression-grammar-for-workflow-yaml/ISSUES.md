# Issues raised from this run

This run produced two kinds of finding. The evaluation's own findings — 48 dispositions on the
shorthand expression grammar — are in `EVALUATION-REPORT.md` and `MITIGATION-PLAN.md`, and are the
input to follow-on implementation work rather than to an issue.

Separately, the run surfaced nine defects in the workflow definitions that ran it. Those are recorded
in `04-workflow-definition-defects.md` and are carried by the three issues below.

## The nine definition defects

| Issue | Defects | What it carries |
|---|---|---|
| [#400 Decision Integrity](https://github.com/m2ux/workflow-server/issues/400) | 2, 3, 4, 5, 8 | Four names used without being declared, and a gate whose answer moves nothing. Folded in as a section extending W2 and W3. |
| [#401 Session Creation](https://github.com/m2ux/workflow-server/issues/401) | 1 | A planning folder nothing seeds has nothing to record progress against. Folded in as a section extending W2. |
| [#512 Unsatisfiable routing](https://github.com/m2ux/workflow-server/issues/512) | 6, 7, 9 | Workers owe a destination they are forbidden the means to find; a finished sub-workflow indistinguishable from an abandoned one; a target classified one way and analysed as another. Raised new, as no epic owned these shapes. |

Defect numbering follows `04-workflow-definition-defects.md`, which remains the full record — each
defect with the evidence behind it, and which two were found during close-out.

## Raised nowhere

Two items from the run are deliberately unraised, and are named as non-goals in #512 so they are not
silently dropped:

- **Delivering the routing graph into worker contexts.** Considered as an alternative to #512's stage
  1 and set aside on delivery cost.
- **The artifact line-budget overrun.** Four artifacts overran a template written for roughly twelve
  findings, at 20, 34, 47 and 48 findings respectively. Each writer judged the overrun structural
  rather than verbose. This is a question about the template, not about any definition.

## The evaluation's own outputs

`EVALUATION-REPORT.md` — 47 consolidated findings across four dimensions, from 54 raised by the two
analysis runs in `consistency/` and `dimensions/`.

`MITIGATION-PLAN.md` — 48 dispositions, each with the ladder rung it reaches, and the migration table
the corpus rewrite is sized and sequenced by.
