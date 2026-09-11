# Requirements Refinement Workflow

> Refine a canonical requirements specification from a set of source documents (meeting transcripts and unstructured documents): classify, analyze, apply, validate, correct within a bounded loop, and stage the result for human promotion. Operates on local files; performs no version-control operations.

---

## Overview

This workflow turns one or more source documents — meeting transcripts and unstructured documents
(proposals, briefs, emails, or similar) — into reviewed changes against a canonical requirements
specification (an SRS-style document). It classifies each source, analyzes them for requirement changes,
applies them while preserving the [specification protocol](resources/specification-protocol.md)
verbatim, validates the result, iteratively corrects within a bounded loop, and stages a finalized
specification plus a change summary in the planning folder for a human to review and promote.

Each source is traced in its own right: a meeting transcript is recorded as an `SRC-MTG###` reference,
an unstructured document as an `SRC-DOC###` reference credited to its author. The source-coverage
matrix names the source each section came from, so a set of documents stays as traceable as a single
one.

It is parameterized: the source documents and the target specification are supplied as inputs, so the
workflow both **augments** an existing specification and **creates** one from scratch. Every
intermediate and final artifact lives in the run's planning folder; the workflow makes no commits and
never edits the canonical document in place.

**Use this workflow when you want to:**

- Fold the requirement changes from meetings and documents into a specification, with traceability.
- Keep a specification conformant to a fixed protocol (entry format, identifier schemes, status rules).
- Review proposed specification changes — analysis, working drafts, validation verdict, and a change
  summary — as artifacts before anything is promoted.

## Activities

| # | Activity | Purpose |
|---|----------|---------|
| 01 | [Intake and Analyze](activities/01-intake-and-analyze.yaml) | Establish readable, classified sources and a user-confirmed analysis of the requirement changes they imply |
| 03 | [Update Specification](activities/03-update-specification.yaml) | Apply the analysis (or corrections) to a versioned working specification |
| 04 | [Validate Specification](activities/04-validate-specification.yaml) | Validate (conformance + source coverage), categorize issues, and route |
| 05 | [Finalize Specification](activities/05-finalize-specification.yaml) | Stage the final specification and change summary for promotion |
| 06 | [Report Failure](activities/06-report-failure.yaml) | Compile a failure report when critical issues or the correction budget stop refinement |

## Flow

```
intake-and-analyze → update-specification → validate-specification
        │                     ▲                        │
        │                     │                        ├─ validation passed → finalize-specification
        │                     │                        ├─ critical / cap reached → report-failure
        │                     └────────────────────────┘  (correctable & under the cap)
        └─ source unreadable → end
```

No specification is promoted automatically.

## Structure

- [`workflow.yaml`](workflow.yaml) — metadata, variables, and rules.
- [`activities/`](activities/) — the pipeline activities.
- [`techniques/`](techniques/) — the procedures the activities apply.
- [`resources/`](resources/) — the specification protocol and the report/rubric/summary templates.
