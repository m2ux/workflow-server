---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 3.1.0
  order: 14
  legacy_id: 14
---

# Manage Artifacts

## Capability

Manage planning artifacts in `.engineering/artifacts/planning/` — create folders, enforce artifact prefixing, organize documents, and enforce the output-discipline rules below on every artifact written.

## Rules

### single-source-and-link

Every fact has exactly one canonical artifact. When another artifact needs it, link to the canonical home (a markdown link to the file or section) with at most a one-line pointer — never restate the content. Validation results, findings, decisions, and deferred items are the common offenders: record each once, reference everywhere else.

### exception-only-reporting

Status, verdict, and alignment tables report exceptions only. When every row would be a pass, replace the table with one line ("all N criteria met") and keep rows solely for the items that diverge — the ⚠️ rows are the payload, not the ✅ rows. The same applies to null results: record "no findings" in one line, not a template's worth of empty sections.

### state-once-per-artifact

Within an artifact, each fact appears once. No summary table that re-tabulates the prose above it, no closing recap that restates the sections, no per-item outcome table following per-item sections that already carry the outcome.

### lean-header

Open an artifact with a single context line (work package · activity · date), not a metadata block plus a paragraph describing what the document is. The filename and its README index entry already identify it.

### omit-null-sections

Omit template sections whose content would be "None", "N/A", or a restatement that the section does not apply. A template defines the maximum shape of an artifact, not its required shape. Content the user explicitly requested is exempt — requested detail is given in full.

### artifact-prefix

Artifact filenames are prefixed with the server-provided `artifactPrefix`. Techniques declare bare names (e.g., `code-review.md`); the prefix is applied at write time (e.g., `09-code-review.md`). This groups related artifacts and sorts them in workflow order.

### committed-to-parent

Planning artifacts are regular files in the parent repo (`.engineering/artifacts/`). They MUST be committed and pushed to the parent repo before any PR or issue references them via URL, otherwise the link will 404.

### push-before-linking

Any engineering link included in a PR body (📐 Engineering) MUST resolve to a committed file on the remote. Commit and push the planning folder BEFORE creating or updating the PR.
