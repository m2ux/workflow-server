# Workflow Authoring Resources

> Part of the [Workflow Authoring Workflow](../README.md)

Read-guides for the design surface, and **creation guides** — Template plus Rules — for every planning-folder artifact this workflow persists.

---

## Resource index

| Resource | Purpose |
|----------|---------|
| [Change Brief](change-brief.md) | Creation guide: `change-brief.md` |
| [Impact Analysis](impact-analysis.md) | Creation guide: `impact-analysis.md` |
| [Scope Manifest](scope-manifest.md) | Creation guide: `scope-manifest.md` |
| [Findings Register](findings-register.md) | Creation guide: `findings-register.md`, section-delivered |
| [Close-Out](completion-artifact.md) | Creation guide: `COMPLETE.md` |
| [Elicitation Guide](elicitation-guide.md) | Mode dimension sets and the per-dimension question bank |
| [Update Mode Guide](update-mode-guide.md) | Change-request category vocabulary |
| [README Seed](readme-seed.md) | Progress inventory, classifier and mode-exclusion map for the planning-folder `README.md` |

---

## Planning artifact to guide map

Every bare filename this workflow persists maps to a guide that owns its Template.

| Bare filename | Guide |
|---------------|-------|
| `README.md` | [planning-readme](../../meta/resources/planning-readme.md) Template plus [readme-seed](readme-seed.md) |
| `change-brief.md` | [change-brief](change-brief.md) |
| `impact-analysis.md` | [impact-analysis](impact-analysis.md) |
| `scope-manifest.md` | [scope-manifest](scope-manifest.md) |
| `findings-register.md` | [findings-register](findings-register.md) |
| `COMPLETE.md` | [completion-artifact](completion-artifact.md) |

Layout authority lives in the guide, not in the protocol of the operation that persists the file.

---

## Criteria homes

The audit criteria this workflow applies are not held here. They are consulted where they already live, by cross-workflow reference, so the corpus keeps one physical copy of each:

- [Anti-Patterns](../../workflow-design/resources/anti-patterns.md) — specific smell instances, Detect / Do not flag / Fix
- [Design Principles](../../workflow-design/resources/design-principles.md) — prefer / before / only after stance
- [Schema Construct Inventory](../../workflow-design/resources/schema-construct-inventory.md) — prose-to-construct mapping tables
- [Convention Conformance](../../workflow-design/resources/convention-conformance.md) — reference conventions against sibling workflows

Fetch these by section. `anti-patterns.md` alone exceeds the per-resource eager-delivery cap, so a whole-file reference is never bundled.

---

## Cross-workflow access

Other workflows may consult this workflow's guides by resource id:

- `workflow-authoring/change-brief`
- `workflow-authoring/impact-analysis`
- `workflow-authoring/scope-manifest`
- `workflow-authoring/findings-register`
- `workflow-authoring/completion-artifact`
- `workflow-authoring/elicitation-guide`
- `workflow-authoring/update-mode-guide`
