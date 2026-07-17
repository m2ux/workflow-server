# Workflow Design Resources

> Part of the [Workflow Design Workflow](../README.md)

Markdown resources for design principles, construct inventories, anti-pattern catalog, mode guidance, elicitation, and **creation guides** for every planning-folder artifact (Template + Rules).

---

## Resource Index

| Index | Resource | Purpose |
|-------|----------|---------|
| `00` | [Design Principles](design-principles.md) | Prefer/before stance that avoids smell families (no Detect triad) |
| `01` | [Schema Construct Inventory](schema-construct-inventory.md) | Prose-to-formal construct mapping tables |
| `02` | [Anti-Patterns](anti-patterns.md) | Specific smell instances — Detect/Do not flag/Fix |
| `03` | [Update Mode Guide](update-mode-guide.md) | Change-request category vocabulary for update mode |
| `04` | [Compliance Report](compliance-report.md) | Creation guide: `compliance-review.md` / `post-update-review.md` |
| `05` | [Design Context README](design-context-readme.md) | Creation guide: planning-folder `README.md` |
| `06` | [Completion Artifact](completion-artifact.md) | Creation guide: `COMPLETE.md` |
| `07` | [Design Assumptions](design-assumptions.md) | Creation guide: `assumptions-log.md` |
| `08` | [Design Assumption Reconciliation](design-assumption-reconciliation.md) | Audit vs open resolvability vocabulary |
| `09` | [Elicitation Guide](elicitation-guide.md) | Mode dimension sets + per-dimension capture/question bank |
| `10` | [Convention Conformance](convention-conformance.md) | Reference conventions vs sibling workflows |
| `11` | [Structural Inventory](structural-inventory.md) | Creation guide: `structural-inventory.md` |
| `12` | [Format Conventions](format-conventions.md) | Creation guide: `format-conventions.md` |
| `13` | [Applicable Constructs](applicable-constructs.md) | Creation guide: `applicable-constructs.md` |
| `14` | [Design Specification](design-specification.md) | Creation guide: `design-specification.md` |
| `15` | [Impact Analysis](impact-analysis.md) | Creation guide: `impact-analysis.md` |
| `16` | [Pattern Analysis](pattern-analysis.md) | Creation guide: `pattern-analysis.md` |
| `17` | [Scope Manifest](scope-manifest.md) | Creation guide: `scope-manifest.md` |
| `18` | [Drafting Plan](drafting-plan.md) | Creation guide: `drafting-plan.md` |
| `19` | [File Review Note](file-review-note.md) | Creation guide: `file-review-note.md` |
| `20` | [Draft Attestation](draft-attestation.md) | Creation guide: `draft-attestation.md` |
| `21` | [Findings Satellite](findings-satellite.md) | Shared creation guide for audit finding satellites |

---

## Planning artifact → guide map

| Bare filename | Guide |
|---------------|-------|
| `README.md` | [design-context-readme](design-context-readme.md) |
| `COMPLETE.md` | [completion-artifact](completion-artifact.md) |
| `assumptions-log.md` | [design-assumptions](design-assumptions.md) |
| `structural-inventory.md` | [structural-inventory](structural-inventory.md) |
| `format-conventions.md` | [format-conventions](format-conventions.md) |
| `applicable-constructs.md` | [applicable-constructs](applicable-constructs.md) |
| `design-specification.md` | [design-specification](design-specification.md) |
| `impact-analysis.md` | [impact-analysis](impact-analysis.md) |
| `pattern-analysis.md` | [pattern-analysis](pattern-analysis.md) |
| `scope-manifest.md` | [scope-manifest](scope-manifest.md) |
| `drafting-plan.md` | [drafting-plan](drafting-plan.md) |
| `file-review-note.md` | [file-review-note](file-review-note.md) |
| `draft-attestation.md` | [draft-attestation](draft-attestation.md) |
| `compliance-review.md` / `post-update-review.md` | [compliance-report](compliance-report.md) |
| `expressiveness-findings.md`, `conformance-findings.md`, `rule-hygiene-findings.md`, `enforcement-findings.md`, `principle-findings.md`, `anti-pattern-findings.md`, `verified-findings.md` | [findings-satellite](findings-satellite.md) |

Each creation guide has a **Template** section and **Rules** for lean, decision-facing population. Persist techniques cite these guides; layout authority lives here, not in ad-hoc protocol prose.

---

## Resource Details

### 00 — Design Principles

*Prefer / before / only after* stance — broader than any one defect; avoids families of smells. No Detect triad here; specific bad instances live in the anti-pattern catalog. Includes **§26 Creation Guide for Generated Documents** (every persisted planning artifact maps to a Template+Rules guide).

### 01 — Schema Construct Inventory

Four mapping tables that translate informal prose patterns into formal schema equivalents (activity, workflow, technique, condition).

### 02 — Anti-Patterns

Specific smell instances — Detect / Do not flag / Fix. Cite by kebab-case smell **name**.

### 03 — Update Mode Guide

Change-request category vocabulary (activity, technique, resource, metadata, structural refactor).

### 04–07, 11–21 — Creation guides

Template + Rules for planning-folder artifacts. See the map above.

### 08 — Design Assumption Reconciliation

Resolvability vocabulary (`audit` vs `open`).

### 09 — Elicitation Guide

Mode dimension sets and per-dimension capture/question bank.

### 10 — Convention Conformance

Reference-convention checklist (naming, field order, structure).

---

## Cross-Workflow Access

Other workflows may consult these by resource id:

- `workflow-design/design-principles`
- `workflow-design/schema-construct-inventory`
- `workflow-design/anti-patterns`
