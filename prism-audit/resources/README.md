# Prism Audit Resources

> Part of the [Prism Audit Workflow](../README.md)

One reference file holding the shape of the workflow's central artifact — the tailored audit prompt that the `compose-audit-prompt::compose-prompt` operation assembles.

The authoritative content lives in the `.md` file and is served by `get_resource`. This file is the catalog — what the resource owns.

---

## Resource Catalog

| Resource | Owns | Anchor |
|----------|------|--------|
| [audit-prompt-template.md](audit-prompt-template.md) | The structure of the self-contained `audit-prompt.md` — codebase overview, evidence-based audit domains, the GitNexus-gated trust-boundary map, cross-cutting concerns, and output requirements — plus its "what good looks like" bar | `#audit-prompt-template` |

---

## What the Resource Owns

### audit-prompt-template.md

The single source of truth for the audit prompt's shape. It defines the five sections a generated `audit-prompt.md` must contain — **Codebase Overview** (language, build system, LOC, architecture summary, module layout), **Audit Domains** (one risk-calibrated subsection per domain, included only when the target has corresponding code), **Trust Boundary Map** (cross-community call edges and security-critical symbol blast radii, present only when GitNexus indexed the target), **Cross-Cutting Concerns**, and **Output Requirements** — and sets the bar: a reviewer can begin auditing from the prompt and the codebase path alone, with no other context. The prompt this template shapes becomes the `analysis_focus` handed to the triggered prism workflow.

---

## Cross-Workflow Access

Any workflow can load the template without depending on this workflow's activities:

```
get_resource({ session_index, resource_id: "prism-audit/audit-prompt-template" })
```

A `#section` suffix narrows the load to one anchor, e.g. `prism-audit/audit-prompt-template#audit-prompt-template`.
