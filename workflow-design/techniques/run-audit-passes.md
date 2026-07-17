---
metadata:
  version: 1.2.0
---

## Capability

Run the post-update compliance audit over a committed workflow: expressiveness, conformance, principles, anti-patterns, and schema validation.

## Protocol

### 1. Audit Expressiveness

- Apply [audit-expressiveness](audit-expressiveness.md) over the committed content

### 2. Audit Conformance

- Apply [audit-conformance](audit-conformance.md) against reference workflows

### 3. Audit Principles

- Apply [audit-principles](audit-principles.md) against the design principles

### 4. Audit Anti-Patterns

- Apply [audit-anti-patterns](audit-anti-patterns.md) over all content (covers Rule Hygiene, `structure-backed-constraints`, Tool-Technique-Doc Consistency, and the rest of the catalog)

### 5. Audit Schema Validation

- Apply [audit-schema-validation](audit-schema-validation.md) over every YAML file

## Rules

### do-not-restate-child-protocols

Do not restate each child technique's protocol here. Create/update drafting still uses separate rule-hygiene and rule-enforcement audit techniques; this post-update pass relies on the full anti-patterns catalog for those concerns.
