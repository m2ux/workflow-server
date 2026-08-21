# Prism Audit Resources

> Part of the [Prism Audit Workflow](../README.md)

The reference files hold the shape of the workflow's central artifact — the self-contained, codebase-tailored audit prompt — and the rubric its domains are calibrated against. Each artifact the audit writes also has a creation guide.

The authoritative content lives in each `.md` file and is served by `get_resource`. This file is the catalog — what each resource owns.

---

## Resource Catalog

| Resource | Owns |
|----------|------|
| [audit-prompt-template.md](audit-prompt-template.md) | The structure of the self-contained `audit-prompt.md` — codebase overview, evidence-based audit domains, the GitNexus-gated trust-boundary map, cross-cutting concerns, and output requirements — plus its "what good looks like" bar |
| [audit-domain-rubric.md](audit-domain-rubric.md) | The audit domains a target's characteristics are grouped into, and the risk levels each is calibrated against |
| [audit-report.md](audit-report.md) | Creation guide: `AUDIT-REPORT.md` — the summary report and the reference line that replaces its lifted findings section |
| [detailed-findings.md](detailed-findings.md) | Creation guide: `DETAILED-FINDINGS.md` — the five inherited fields, the severity-then-domain grouping, and the ID heading form |
| [design-trade-offs.md](design-trade-offs.md) | Creation guide: `DESIGN-TRADE-OFFS.md` — the trade-off catalogue, interaction map, and decision register |

---

## Planning artifact to guide map

| Bare filename | Guide |
|---------------|-------|
| `audit-prompt.md` | [audit-prompt-template](audit-prompt-template.md) |
| `AUDIT-REPORT.md` | [audit-report](audit-report.md) |
| `DETAILED-FINDINGS.md` | [detailed-findings](detailed-findings.md) |
| `DESIGN-TRADE-OFFS.md` | [design-trade-offs](design-trade-offs.md) |

---

## Cross-Workflow Access

Any workflow can load the template without depending on this workflow's activities:

```
get_resource({ session_index, resource_id: "prism-audit/audit-prompt-template" })
```

A `#section` suffix narrows the load to one anchor, e.g. `prism-audit/audit-prompt-template#audit-prompt-template`.
