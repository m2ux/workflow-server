---
metadata:
  version: 1.0.0
---

## Capability

Shared base contract inherited by sibling techniques. Any Inputs, Outputs, Rules, or Errors defined here are inherited by every sibling technique, and any Protocol here is prepended (and renumbered) before each technique's own. The technique set is implied by the folder contents — do not list techniques here. Keep this minimal: only genuinely cross-technique contract belongs here.

## Inputs

### target_path

Path to the document, proposal, codebase, or artifact set being evaluated.

### evaluation_description

The user's description of what to evaluate, the evaluation goals, focus areas, and concerns.

### output_path

Directory where the evaluation artifacts are read from and written to.
