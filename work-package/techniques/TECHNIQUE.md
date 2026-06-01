---
name: work-package-techniques
description: Shared base contract inherited by the work-package workflow's techniques.
metadata:
  version: 1.0.0
---

## Capability

Base contract for the Work Package workflow's techniques. Any Inputs, Outputs, Rules, or Errors defined here are inherited by every technique in this workflow, and any Protocol here is prepended (and renumbered) before each technique's own. The technique set is implied by the folder contents — do not list techniques here. Keep this minimal: only genuinely cross-technique contract belongs here.
