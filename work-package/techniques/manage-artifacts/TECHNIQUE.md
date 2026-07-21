---
metadata:
  version: 3.3.0
---

## Capability

Manage planning artifacts in `.engineering/artifacts/planning/` — create folders, enforce artifact prefixing, organize documents, and enforce the output-discipline rules below on every artifact written.

## Rules

### single-source-and-link

Every fact has exactly one canonical artifact. When another artifact needs it, link to the canonical home (a markdown link to the file or section) with at most a one-line pointer — never restate the content. Validation results, findings, decisions, and deferred items are the common offenders: record each once, reference everywhere else.

### canonical-home-map

The canonical home for each shared fact category. Templates carry link-only slots for every category they don't home; [verify-artifact-conforms](./verify-artifact-conforms.md) enforces the map at the strategic-review boundary.

| Fact category | Canonical home |
|---|---|
| Problem statement, scope, success criteria | `requirements-elicitation.md` |
| Problem classification | `design-philosophy.md` (plus a 2–4 sentence ticket-derived statement — written before requirements exists, so it carries its own budgeted statement) |
| Assumptions and their outcomes | `assumptions-log.md` |
| Design decisions, alternatives, planning risks | `work-package-plan.md` (durable decisions graduate to an ADR at completion) |
| Baseline metrics, gaps, measurement strategy | `implementation-analysis.md` |
| Research findings and recommended approach | `knowledge-base-research.md` |
| Test cases and acceptance matrix | `test-plan.md` |
| Review findings (code, test, structural, lean-coding, manual-diff) | `code-review.md` and the reviews' own artifacts — consolidated surfaces reference findings by ID + disposition |
| In-task follow-ups | `follow-ups.md` (see [follow-ups](../../resources/follow-ups.md)) |
| Out-of-scope deferred items | `deferred-items.md` (see [deferred-items](../../resources/deferred-items.md)) |

### exception-only-reporting

Status, verdict, and alignment tables report exceptions only. When every row would be a pass, replace the table with one line ("all N criteria met") and keep rows solely for the items that diverge — the ⚠️ rows are the payload, not the ✅ rows. The same applies to null results: record "no findings" in one line, not a template's worth of empty sections.

### state-once-per-artifact

Within an artifact, each fact appears once. No summary table that re-tabulates the prose above it, no closing recap that restates the sections, no per-item outcome table following per-item sections that already carry the outcome.

### lean-header

Open an artifact with a single context line (work package · activity · date), not a metadata block plus a paragraph describing what the document is. The filename and its README index entry already identify it.

### omit-null-sections

Omit template sections whose content would be "None", "N/A", or a restatement that the section does not apply. A template defines the maximum shape of an artifact, not its required shape. Content the user explicitly requested is exempt — requested detail is given in full.

### markdown-line-breaks

In a group of consecutive bold-label lines (`**Status:** value`), every line except the last MUST end with two trailing spaces — without them the lines collapse into a single rendered paragraph. Do NOT use bullet prefixes as a substitute. Applies to all planning artifacts that use bold-label fields (assumptions logs, design philosophy documents, research documents, analyses, comprehension artifacts).

### hyperlink-conventions

Symbol and test references hyperlink to their definition line (`path#L<line>` — the definition, not the first usage or assertion); same-repo links use relative paths, external references use full URLs. Verify every link resolves before committing the artifact.

### no-process-attribution

Artifacts describe the work, not the process that produced it: no "per user request", "AI suggested", "as discussed", or reviewer/agent attribution in artifact content.

### plain-technical-language

Specific, plain technical language: no vague descriptions ("various improvements", "might be better"), no unquantified claims where a number is known, no hidden negative consequences.

### artifact-prefix

Artifact filenames are prefixed with the server-provided `artifactPrefix`. Techniques declare bare names (e.g., `code-review.md`); the prefix is applied at write time (e.g., `09-code-review.md`). This groups related artifacts and sorts them in workflow order.

### committed-to-parent

Planning artifacts are regular files in the parent repo (`.engineering/artifacts/`). They MUST be committed and pushed to the parent repo before any PR or issue references them via URL, otherwise the link will 404.

### push-before-linking

Any engineering link included in a PR body (📐 Engineering) MUST resolve to a committed file on the remote. Commit and push the planning folder BEFORE creating or updating the PR.
