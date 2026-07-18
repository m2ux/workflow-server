---
metadata:
  version: 1.1.0
---

## Capability

Shared Inputs, Outputs, and Rules for every technique in this workflow.

## Inputs

### user_description

Free-form description of the workflow the user wants to create or modify

### target_workflow_id

*(optional)* Existing workflow id to modify (update mode), or the current review-mode audit target. When multiple targets are audited, each iteration binds this id from `{target_workflow_ids}`.

### target_workflow_ids

*(optional)* Ordered list of workflow ids to audit in review mode. Single-target review uses a one-element list. Update/create modes leave this unset and use `{target_workflow_id}` alone.

## Outputs

### workflow_files

Complete workflow definition: `workflow.yaml`, activity files, technique files, resource files, README

#### workflow_definition

Root workflow definition with metadata, variables, rules, and techniques

#### activity_files

One `.yaml` file per activity with steps, checkpoints, transitions

#### technique_files

One `.md` file per technique with capability, protocol, inputs, outputs, rules

#### resource_files

Markdown resource files for agent guidance

#### readme_file

Workflow README with description, activity table, and usage

## Rules

### workflow-rules-authoritative

Cross-cutting design invariants live in `workflow.yaml` `rules[]`. Apply those as the single source of truth; this technique does not duplicate them.

### consult-referenced-resources

Before relying on a referenced resource's content, load that resource. Do not restate harness tool recipes here (`no-tool-usage-prescription`).

### apply-anti-patterns-when-authoring

When authoring or revising workflow definition content (YAML prose fields, technique/resource markdown, README orientation), apply [anti-patterns](../resources/anti-patterns.md) as write-time constraints — especially Schema Expressiveness and Description Hygiene — rather than deferring discovery to a later audit. Do not restate entry Detect criteria here.

### single-source-and-link

Every planning fact has exactly one canonical artifact. When another artifact or the session README needs it, link to the canonical home with at most a one-line pointer — never restate the body.

### canonical-home-map

The canonical home for each shared design-session fact category. Templates carry link-only slots for every category they don't home; [verify-artifact-conforms](./verify-artifact-conforms.md) enforces the map at the end of `scope-and-draft`.

| Fact category | Canonical home |
|---|---|
| Purpose, dimension deltas, change goals | `design-specification.md` |
| Assumptions and outcomes | `assumptions-log.md` |
| Impact classification, integrity, removals | `impact-analysis.md` |
| File manifest, structural design, drafting order | `scope-manifest.md` |
| Format / YAML literacy | `format-conventions.md` |
| Applicable schema constructs | `applicable-constructs.md` |
| Structural inventory baseline | `structural-inventory.md` |
| Pattern analysis findings | `pattern-analysis.md` |
| Compliance / audit findings | `compliance-report.md` (and findings satellites) |
| Session index (Progress, Links, Design Decisions pointers) | `README.md` |

README Problem Overview and Solution Overview are link-only slots pointing at `design-specification.md` (Solution also links `scope-manifest.md` for the file breakdown).

### line-budget

Fill-template `## Rules` line budgets are hard under [verify-artifact-conforms](./verify-artifact-conforms.md) — over-budget prose is a `line-budget` violation.
