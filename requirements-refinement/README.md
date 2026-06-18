# Requirements Refinement Workflow

> v1.1.0 — Refine a canonical requirements specification from a source document (a meeting transcript or an unstructured document): classify, analyze, apply, validate, correct within a bounded loop, and stage the result for human promotion. Operates on local files; performs no version-control operations.

---

## Overview

This workflow turns a source document — a meeting transcript or an unstructured document (a proposal,
brief, email, or similar) — into reviewed changes against a canonical requirements specification (an
SRS-style document). It classifies the source, analyzes it for requirement changes, applies them while
preserving the [specification protocol](resources/specification-protocol.md) verbatim, validates the
result, iteratively corrects within a bounded loop, and stages a finalized specification plus a change
summary in the planning folder for a human to review and promote.

Each source is traced: a meeting transcript is recorded as an `SRC-MTG###` reference, an unstructured
document as an `SRC-DOC###` reference credited to its author.

It is parameterized: the source document and the target specification are supplied as inputs, so the
workflow both **augments** an existing specification and **creates** one from scratch. Every
intermediate and final artifact lives in the run's planning folder; the workflow makes no commits and
never edits the canonical document in place.

**Use this workflow when you want to:**

- Fold the requirement changes from a meeting or a document into a specification, with traceability.
- Keep a specification conformant to a fixed protocol (entry format, identifier schemes, status rules).
- Review proposed specification changes — analysis, working drafts, validation verdict, and a change
  summary — as artifacts before anything is promoted.

## Inputs

| Variable | Description |
|----------|-------------|
| `source_path` | Filesystem path to the source document to process (a meeting transcript or an unstructured document) |
| `target_doc_path` | Filesystem path to the canonical specification to augment or create |

## Activities

| # | Activity | Purpose |
|---|----------|---------|
| 01 | [Intake and Analyze](activities/01-intake-and-analyze.toon) | Establish trusted, classified sources and a user-confirmed analysis of the requirement changes they imply |
| 03 | [Update Specification](activities/03-update-specification.toon) | Apply the analysis (or corrections) to a versioned working specification |
| 04 | [Validate Specification](activities/04-validate-specification.toon) | Validate (conformance + source coverage), categorize issues, and route |
| 05 | [Finalize Specification](activities/05-finalize-specification.toon) | Stage the final specification and change summary for promotion |
| 06 | [Report Failure](activities/06-report-failure.toon) | Compile a failure report when critical issues or the correction budget stop refinement |

## Flow

```
intake-and-analyze → update-specification → validate-specification
                                ▲                      │
            (correctable & under the cap)  └───────────┤
                                                        ├─ validation passed → finalize-specification
                                                        └─ critical / cap reached → report-failure
```

The correction loop is bounded by `max_correction_iterations` (default 3). When validation passes the
workflow finalizes; when critical issues appear or the budget is exhausted it reports failure. No
specification is promoted automatically.

## Structure

- [`workflow.toon`](workflow.toon) — metadata, variables, rules, and artifact location.
- [`activities/`](activities/) — the five pipeline activities.
- [`techniques/`](techniques/) — the procedures the activities apply.
- [`resources/`](resources/) — the specification protocol and the report/rubric/summary templates.
