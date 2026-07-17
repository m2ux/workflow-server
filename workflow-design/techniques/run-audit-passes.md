---
metadata:
  version: 1.1.0
---

## Capability

Run the post-update compliance audit over a committed workflow: expressiveness, conformance, principles, anti-patterns, and schema validation.

## Protocol

### 1. Run Audit Passes

- Apply [audit-expressiveness](audit-expressiveness.md) over the committed content
- Apply [audit-conformance](audit-conformance.md) against reference workflows
- Apply [audit-principles](audit-principles.md) against the design principles
- Apply [audit-anti-patterns](audit-anti-patterns.md) over all content (covers Rule Hygiene, `structure-backed-constraints`, Tool-Technique-Doc Consistency, and the rest of the catalog)
- Apply [audit-schema-validation](audit-schema-validation.md) over every YAML file

Do not restate each technique's protocol here. Create/update drafting still uses the separate `audit-rule-hygiene` / `audit-rule-enforcement` checkpoints in quality-review; this post-update pass relies on the full anti-patterns catalog for those concerns.
