# Plain Language Resources

> Part of the [Plain Language Workflow](../README.md)

The **criteria home** for the plain-language standard, the controlled-language overlay, and **creation guides** — Template plus Rules — for every artifact this workflow persists.

---

## Resource index

| Resource | Purpose |
|----------|---------|
| [Plain Language Standard](plain-language-standard.md) | ISO 24495-1 principles and guidelines, section-delivered — the criteria home |
| [ASD-STE100](asd-ste100.md) | Controlled-language overlay for technical documentation |
| [Document Profile](document-profile.md) | Creation guide: `document-profile.md` |
| [Source Analysis](source-analysis.md) | Creation guide: `source-analysis.md` |
| [Evaluation Report](evaluation-report.md) | Creation guide: `evaluation-report.md` |
| [ISO Checklist](iso-checklist.md) | Creation guide: `iso-checklist.md` |
| [README Seed](readme-seed.md) | Progress inventory, classifier and mode-exclusion map for the planning-folder `README.md` |

---

## Planning artifact to guide map

Every bare filename this workflow persists maps to a guide that owns its Template.

| Bare filename | Guide |
|---------------|-------|
| `README.md` | [planning-readme](../../meta/resources/planning-readme.md) Template plus [readme-seed](readme-seed.md) |
| `document-profile.md` | [document-profile](document-profile.md) |
| `source-analysis.md` | [source-analysis](source-analysis.md) |
| `evaluation-report.md` | [evaluation-report](evaluation-report.md) |
| `iso-checklist.md` | [iso-checklist](iso-checklist.md) |
| `plain-document.md` | The delivered document itself — no creation guide; it is the run's product, not a planning artifact |

Layout authority lives in the guide, not in the protocol of the operation that persists the file.

---

## Criteria homes

The governing criteria live here, cited by section rather than restated:

- [Plain Language Standard](plain-language-standard.md) — the four principles and guidelines of ISO 24495-1, split for section delivery: [Principles](plain-language-standard.md#principles), [Relevance](plain-language-standard.md#relevance), [Findability](plain-language-standard.md#findability), [Understandability](plain-language-standard.md#understandability), [Usability](plain-language-standard.md#usability)
- [ASD-STE100](asd-ste100.md) — the controlled-language overlay: [When It Applies](asd-ste100.md#when-it-applies), [Writing Rules](asd-ste100.md#writing-rules), [Procedure and Description](asd-ste100.md#procedure-and-description), [Approved Words](asd-ste100.md#approved-words)

Techniques cite the section that governs their work; they do not restate the guidelines.

---

## Cross-workflow access

Other workflows may consult this workflow's resources and bind its operations by id:

- `plain-language/plain-language-standard`
- `plain-language/asd-ste100`
- `plain-language/document-profile`
- `plain-language/source-analysis`
- `plain-language/evaluation-report`
- `plain-language/iso-checklist`

Operations bind as `plain-language::<operation>` — for example `plain-language::evaluate-document` to run an evaluation from another workflow.
