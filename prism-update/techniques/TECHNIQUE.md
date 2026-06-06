---
metadata:
  version: 1.0.0
---

## Capability

Base contract inherited by sibling techniques. Any Inputs, Outputs, Rules, or Errors defined here are inherited by every technique in the set, and any Protocol here is prepended (and renumbered) before each technique's own. The technique set is implied by the folder contents — do not list techniques here. Keep this minimal: only genuinely cross-technique contract belongs here.

## Inputs

### change-set

Categorized change set — new, modified, renamed, and deleted entries — ready to apply to the resources directory. Produced by diff-upstream and consumed by the import/verify techniques.

### resource-path

Relative path to the prism workflow resources directory

#### default

prism/resources/
