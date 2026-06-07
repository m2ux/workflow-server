---
name: explicit-prefix-target
description: meta-version — fixture for explicit-prefix override-suppression.
metadata:
  version: 1.0.0
---

# Explicit Prefix Target (meta fixture)

## Capability

meta-version — meta-side fixture for PR126-TC-05b. An explicit `meta/explicit-prefix-target`
reference must resolve to this version even when the requesting workflow
ships a tagged override under the same slug.

## Rules

### marker

This rule exists so the meta version is non-empty and distinguishable from
the workflow-local override by description.
