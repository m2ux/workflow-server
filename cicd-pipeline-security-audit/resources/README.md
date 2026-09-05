# CI/CD Pipeline Security Audit Resources

> Part of the [CI/CD Pipeline Security Audit Workflow](../README.md)

Reference content loaded on demand by the workflow's techniques. The authoritative content lives in each `.md` file and is served by `get_resource` addressed by bare slug (e.g. `resource_id: injection-pattern-catalog`). This file is the catalog — what each resource owns.

---

## Resource Catalog

| Resource | Owns |
|----------|------|
| [`start-here.md`](start-here.md) | Quick-start orientation and the entry procedure, and the shape of the run's `START-HERE.md` |
| [`injection-pattern-catalog.md`](injection-pattern-catalog.md) | The injection patterns and mechanical checks each scanner applies |
| [`cicd-severity-rubric.md`](cicd-severity-rubric.md) | The impact and feasibility scales, the severity mapping, and the crosscheck |
| [`sub-agent-output-schema.md`](sub-agent-output-schema.md) | The structured output schema every dispatched scanner conforms to |
| [`intermediate-artifact-schemas.md`](intermediate-artifact-schemas.md) | The JSON shapes of the artifacts that flow between reconnaissance, dispatch, verification, and merge |
| [`cicd-audit-report-template.md`](cicd-audit-report-template.md) | The document skeleton for the audit report |
| [`remediation-playbook.md`](remediation-playbook.md) | The remediation each finding class attaches |

---

## Planning artifact to guide map

| Bare filename | Guide |
|---------------|-------|
| `START-HERE.md` | [start-here](start-here.md) |
| `01-cicd-audit-report.md` | [cicd-audit-report-template](cicd-audit-report-template.md) |
| `reconnaissance-summary.json` | [intermediate-artifact-schemas](intermediate-artifact-schemas.md#workflow-inventory) |
| `scanner-assignments.json` | [intermediate-artifact-schemas](intermediate-artifact-schemas.md) |
| `verification-report.json` | [intermediate-artifact-schemas](intermediate-artifact-schemas.md) |
| `merged-findings.json` | [intermediate-artifact-schemas](intermediate-artifact-schemas.md) |
| `reconciliation-table.json` | [intermediate-artifact-schemas](intermediate-artifact-schemas.md) |
| `{scanner_id}.json`, `s{scanner_number}-{submodule_path}.json` | [sub-agent-output-schema](sub-agent-output-schema.md) |

---

## Addressing

Resources are addressed by bare slug; a `#section` suffix narrows the load to one anchor.
