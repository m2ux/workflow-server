---
name: findings-report
description: Shared shape for every report that states findings — the finding layout, the designator and severity contracts, and the split between a report and its methodology record.
metadata:
  version: 1.0.0
  order: 19
---

# Findings Report Guide

## Shared Shape

A report that states findings has an addressee: the person who must act on them. Every report of that kind carries its findings in one shape, so a reader moving between two of them meets the same object twice rather than re-learning where the remedy sits.

This guide owns that shape. A report guide declares only what is its own — its designator prefix and its field list — and states them against the sections below, which no report restates.

## Report and Methodology

Each review emits two artifacts.

- **The report** — the findings, in one ID-ordered list, plus the outcome. This is what the summary links and what the author reads.
- **The methodology record** — how the review was conducted: the baseline and the commands that reproduce it, the enumerations walked, the sweeps that came back clean, the coverage and ratio tables, the scope and necessity passes. Same numbered-prefix family as the report, linked once from the report header.

A negative result is methodology, not a finding: *every added line scanned, no debugging macro found* is evidence that the review was thorough and is nothing the author acts on.

Two boundaries decide what goes where:

- **A finding's own evidence stays with the finding.** The split is between the review's method and its conclusions, never between a conclusion and its support. The arithmetic that shows a limit is exceeded belongs to the finding; the sweep that found no occurrences anywhere is method.
- **The methodology record is checked like the report.** It is the half nobody re-reads, so it is the half a stale claim survives in. Whatever conformance pass runs over the report runs over it.

## Finding Layout

A finding is a heading, then one labelled paragraph per declared field, in the order the report declares them.

```markdown
### CR-1 — the cursor advances before the bounds check

**Category:** Rust Idioms

**Description:** [resolve_cursor](https://github.com/owner/repo/blob/<sha>/src/parser.rs#L190) advances the cursor before the bounds check, so a request at the limit reads one element past the end.

**Impact:** A caller at the limit receives a value from outside the buffer.

**Recommendation:** Move the bounds check above the advance.
```

Four properties make it checkable:

- **A finding is a heading.** It is the anchor the summary's designator column links to, and bold title text is unlinkable. One heading per finding, with no grouping heading between them — a severity or category heading inserted between findings breaks every anchor pointing past it, and severity is a field.
- **The label set is closed.** Only the report's declared fields may open a paragraph, and content that does not fit one of them belongs inside the field it qualifies, never under a new heading of its own. The permitted labels for a findings section are exactly the report's declared list, so a paragraph opening with anything else is a breach rather than a judgement call:

  ```
  ^\*\*(Field|Field|…):\*\*
  ```

- **The labels appear in declared order**, every finding the same.
- **The site is carried by the link in the prose**, not by a separate location field — the first mention of the named thing is an inline link to it, per the shared artifact rule that governs code references. A `Location:` field beside that link states the site twice in one artifact.

## Designators

Each finding carries a stable designator: the prefix its report declares, then its number. A report's prefix is the one declared for the summary section that indexes it, in [Review Categories](./review-mode.md#review-categories) — link text and link target naming different things is what an undeclared prefix produces, and a reader clicking one lands on a section headed by the other.

**Findings order by ID.** A findings list and a findings table both run in ascending designator order. Class, severity and category are fields, not sort keys: grouping by any of them leaves the one column a reader scans for an ID out of order.

## Severity

Every finding a report states carries a severity, and the value is a member of the render scale in [Severity Definitions](./review-mode.md#severity-definitions) — a report that produces findings and supplies no severity leaves the summary's column blank, which is silent degradation rather than an omission.

Two constraints, both checkable from what the run already records:

- **The value is from the scale, and nothing else.** A classification-scale term used where the render scale is meant, or an empty cell, fails.
- **The value equals the map applied to that finding's own classification.** The classified severity is recorded on the finding, so this is a lookup rather than a judgement.

A qualifier is not part of a severity value: `Medium (harness defect)` is a severity and a note sharing one cell, and the note belongs in the finding's description.

## Delivery Completeness

Every finding a run produces appears in exactly one delivery class — carried to the pull request, or handed to the audit, or held. A finding named in no class reached neither, and a finding named in two leaves its destination unsettled. Hand-written ranges are where findings fall through: enumerate the designators the run produced, enumerate the designators each class names, and compare the sets rather than reading the ranges.

A parenthetical mention inside another finding's text is not a classification. A designator classified only as an aside in someone else's row is unclassified.

## Anchor Integrity

Every `[…](file#anchor)` within the planning folder resolves against the target file's actual headings. A markdown anchor that does not resolve renders as a working link that goes nowhere, so removing a heading, renaming a designator, or converting a finding to a bold title invalidates every link into it with nothing failing. Resolve the whole folder after any restructuring, not the files that were edited.
