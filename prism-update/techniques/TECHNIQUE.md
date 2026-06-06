---
metadata:
  version: 1.0.0
---

## Capability

Base contract inherited by sibling techniques. Any Inputs, Outputs, Rules, or Errors defined here are inherited by every technique in the set, and any Protocol here is prepended (and renumbered) before each technique's own. The technique set is implied by the folder contents — do not list techniques here. Keep this minimal: only genuinely cross-technique contract belongs here.

## Inputs

### changes

Approved, categorized change set (new, modified, renamed, deleted entries plus next index) to apply against the resources directory

### resource-path

Relative path to the prism workflow resources directory

#### default

prism/resources/
