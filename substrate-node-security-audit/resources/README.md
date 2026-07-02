# Security Audit Resources

> Part of the [Security Audit Workflow](../README.md)

Reference content loaded on demand by the workflow's techniques. The authoritative content lives in each `.md` file and is served by `get_resource` addressed by bare slug (e.g. `resource_id: static-analysis-patterns`). This file is the catalog — what each resource owns.

---

## Resource Catalog

| Resource | Owns |
|----------|------|
| [`start-here.md`](start-here.md) | Quick-start orientation and the entry procedure |
| [`audit-template-reference.md`](audit-template-reference.md) | The authoritative §1–§5 section index; every `§X.Y` reference in the workflow resolves to an entry here |
| [`audit-prompt-template.md`](audit-prompt-template.md) | The §1 Setup procedure and §4 Reporting Format in full, plus the §1–§5 taxonomy; the operative §2/§3/§5 bodies live in the techniques and resources each section points to |
| [`severity-rubric.md`](severity-rubric.md) | The Impact/Feasibility scales, severity mapping, the calibration benchmark table, the High/Critical crosscheck, and bias correction |
| [`static-analysis-patterns.md`](static-analysis-patterns.md) | The §2 grep patterns and mechanical checks executed by [`search-pattern-catalog`](../techniques/search-pattern-catalog.md) |
| [`toolkit-checklist.md`](toolkit-checklist.md) | The toolkit minimum checklist applied by [`apply-checklist`](../techniques/apply-checklist.md) for Group D |
| [`sub-agent-output-schema.md`](sub-agent-output-schema.md) | The structured output schema every dispatched sub-agent must conform to |
| [`target-profile.md`](target-profile.md) | Target-specific crate assignments, file paths, node agent scope split, verification-agent spec, calibration benchmarks, and ensemble blind-spot items |
| [`vulnerability-pattern-vocabulary.md`](vulnerability-pattern-vocabulary.md) | Known cross-project vulnerability patterns used as a recognition aid during architectural analysis |
| [`gap-analysis-template.md`](gap-analysis-template.md) | The document skeleton for the gap-analysis report |

---

## Addressing

Resources are addressed by bare slug via `get_resource`; a `#section` suffix narrows the load to one anchor. The `audit-template-reference` section index is the single home for the `§X.Y` taxonomy — techniques and activities cite section numbers rather than restating the checklist.
