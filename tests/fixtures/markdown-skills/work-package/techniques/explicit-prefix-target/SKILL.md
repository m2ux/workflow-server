---
name: explicit-prefix-target
description: workflow-local override — explicit-prefix-target (work-package).
metadata:
  version: 1.0.0
---

# Explicit Prefix Target (work-package override fixture)

## Capability

Work-package-local override paired with the meta fixture for PR126-TC-05b.
The explicit `meta/<id>` ref must bypass this override and return the meta
version.

## Rules

### override-marker

This rule exists solely so the override is non-empty and distinguishable
from the meta fixture by description.
