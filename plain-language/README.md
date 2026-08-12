# Plain Language Workflow

> v1.0.0 — Author, rewrite, or audit a document so its readers can find what they need, understand what they find, and use it. Applies the four principles and guidelines of [ISO 24495-1](./resources/plain-language-standard.md), with an optional [ASD-STE100](./resources/asd-ste100.md) controlled-language overlay for technical documentation. `{headless_mode}` defaults to true, and a checkpoint declaring neither a default option nor an auto-advance interval always waits for a person.

---

## Overview

Activity `#` columns match the on-disk `NN-` file prefixes; the prefix is server-computed from the filename and orders both activities and the artifacts they produce, so gaps are intentional and renumbering is not free.

| # | Activity | Mode | Purpose |
|---|----------|------|---------|
| 01 | [**Intake and Profile**](./activities/README.md#01-intake-and-profile) | All | Classify author/rewrite/audit, settle the reader profile and content selection, persist the document profile |
| 02 | [**Source Analysis**](./activities/README.md#02-source-analysis) | Rewrite, Audit | Audit the existing document against the principles; record findings and strengths |
| 03 | [**Draft**](./activities/README.md#03-draft) | Author, Rewrite | Produce the plain-language document for its readers |
| 04 | [**Evaluate**](./activities/README.md#04-evaluate) | Author, Rewrite | Evaluate against the four principles, revise while issues remain, complete the ISO checklist |
| 05 | [**Deliver**](./activities/README.md#05-deliver) | Author, Rewrite | Write the document to its output path with its conformance record |

**Detailed documentation:**

- **Activities:** [activities/README.md](./activities/README.md) — the per-activity orientation map, linking the authoritative YAML.
- **Techniques:** [techniques/README.md](./techniques/README.md) — the local operation group and the shared operations this workflow binds.
- **Resources:** [resources/README.md](./resources/README.md) — the criteria home, the controlled-language overlay, and the creation guides.

---

## Modes

| Mode | Activation | Description |
|------|------------|-------------|
| **Author** | "write", "draft", "create a document" | Build a new plain-language document from a description of its readers and purpose |
| **Rewrite** | "rewrite", "make this plain", "simplify" | Rework an existing document, fixing recorded findings and preserving strengths |
| **Audit** | "review", "audit", "check this document" | Assess an existing document against the principles and report where it fails its readers |

`{operation_type}` is the sole mode state. Source analysis runs only in rewrite and audit modes; drafting, evaluation, and delivery run only in author and rewrite modes; an audit run closes on its source analysis.

`{controlled_language}` is an independent overlay flag, not a mode. When true, the [ASD-STE100](./resources/asd-ste100.md) writing rules and approved-word discipline layer over the ISO base for technical documentation.

---

## Criteria

The governing criteria this workflow applies — the four principles and guidelines of ISO 24495-1 — live in [plain-language-standard](./resources/plain-language-standard.md), cited by section rather than restated. The ASD-STE100 controlled-language overlay lives in [asd-ste100](./resources/asd-ste100.md). See [resources/README.md](./resources/README.md#criteria-homes).

---

## Outputs

The workflow seeds a **planning folder** under `.engineering/artifacts/planning/`: a `README.md` from the universal [planning-readme](../meta/resources/planning-readme.md) Template under this workflow's [readme-seed](./resources/readme-seed.md) profile, plus the working artifacts each activity persists via [`work-package::manage-artifacts::write-artifact`](../work-package/techniques/manage-artifacts/write-artifact.md).

**Author and rewrite modes:** a document profile, the plain-language document (also written to `{output_path}`), an evaluation report, and a completed ISO checklist. A rewrite run adds a source analysis.

**Audit mode:** the source analysis is the run's terminal record. No document is authored, no checklist is completed, and nothing is delivered — the run reports where the existing document fails its readers.

---

## File Structure

```
workflows/plain-language/
├── workflow.yaml                           # Workflow definition (variables, rules, inherited techniques)
├── README.md                               # This file
├── activities/
│   ├── README.md                           # Per-activity orientation map
│   ├── 01-intake-and-profile.yaml          # Classify mode, settle reader profile, persist document profile
│   ├── 02-source-analysis.yaml             # Audit the existing document, record findings and strengths
│   ├── 03-draft.yaml                       # Produce the plain-language document
│   ├── 04-evaluate.yaml                    # Evaluate, revise loop, complete the ISO checklist
│   └── 05-deliver.yaml                     # Write the document to its output path
├── techniques/
│   ├── README.md                           # Technique orientation map
│   └── plain-language/                     # Local operation group — cross-workflow addressable
│       ├── TECHNIQUE.md                    # Group contract
│       ├── intake-and-profile.md
│       ├── analyze-source.md
│       ├── draft-document.md
│       ├── evaluate-document.md
│       └── complete-checklist.md
└── resources/
    ├── README.md                           # Resource index and artifact-to-guide map
    ├── plain-language-standard.md          # ISO 24495-1 criteria home, section-delivered
    ├── asd-ste100.md                       # ASD-STE100 controlled-language overlay
    ├── document-profile.md                 # Creation guide
    ├── source-analysis.md                  # Creation guide
    ├── evaluation-report.md                # Creation guide
    ├── iso-checklist.md                    # Creation guide
    └── readme-seed.md                      # Progress inventory and mode map for the planning README
```
