# Requirements Refinement Workflow

> Refine a canonical requirements specification from a set of source documents (meeting transcripts and unstructured documents): classify, analyze, apply, validate, correct within a bounded loop, and stage the result.

---

## Overview

This workflow turns one or more source documents — meeting transcripts and unstructured documents
(proposals, briefs, emails, or similar) — into reviewed changes against a canonical requirements
specification (an SRS-style document). It classifies each source, analyzes them for requirement changes,
applies them while preserving the [specification protocol](resources/specification-protocol.md)
verbatim, validates the result, iteratively corrects within a bounded loop, and stages a finalized
specification plus a change summary in the planning folder.

Each source is traced in its own right: a meeting transcript is recorded as an `SRC-MTG###` reference,
an unstructured document as an `SRC-DOC###` reference credited to its author. The source-coverage
matrix names the source each section came from and records that section as the heading above the
passage. Each new or updated requirement carries those headings so the specification's source list
can link to them.

The request names the source documents, and usually the target specification too. When the request
names no target, the run asks for its path. The target may be an existing specification, which the run
**augments**, or a new path, where it **creates** one from scratch. Every intermediate and final
artifact lives in the run's planning folder.

**Use this workflow when you want to:**

- Fold the requirement changes from meetings and documents into a specification, with traceability.
- Keep a specification conformant to a fixed protocol (entry format, identifier schemes, status rules).
- Review proposed specification changes — analysis, working drafts, validation verdict, and a change
  summary — as planning-folder artifacts.

## Activities

| # | Activity | Purpose |
|---|----------|---------|
| 01 | [Intake](activities/01-intake.yaml) | Establish readable, classified sources and the target specification |
| 02 | [Analyze Sources](activities/02-analyze-sources.yaml) | Produce a confirmed analysis of the requirement changes the sources imply |
| 03 | [Update Specification](activities/03-update-specification.yaml) | Apply the analysis (or corrections) to a versioned working specification |
| 04 | [Validate Specification](activities/04-validate-specification.yaml) | Validate (conformance + source coverage) and categorize issues |
| 05 | [Finalize Specification](activities/05-finalize-specification.yaml) | Stage the final specification and change summary |
| 06 | [Report Failure](activities/06-report-failure.yaml) | Compile a failure report when a critical issue or the correction limit stops refinement |

## Flow

```
intake ── sources confirmed ──→ analyze-sources ── analysis confirmed ──→ update-specification
 │  ▲                             │  ▲                                        ▲  ▲         │
 │  └─ revise                     │  └─ revise                                │  │         ▼
 └─ source unreadable → end       │                                         │  │   validate-specification
                                  │                                         │  │     │  │  │
                                  │    revision requested ──────────────────┘  │     │  │  └─ critical / limit reached → report-failure
                                  │         ▲                                  └─────┘  │     (correctable & under the limit)
                                  │         │                                           │
                                  │   finalize-specification ←── validation passed ─────┘
                                  │         └─ accepted → end
```

The staged specification sits in the planning folder.

## Structure

- [`workflow.yaml`](workflow.yaml) — metadata and variables.
- [`activities/`](activities/) — the pipeline activities.
- [`techniques/`](techniques/) — the procedures the activities apply.
- [`resources/`](resources/) — the specification protocol and the report/rubric/summary templates.
