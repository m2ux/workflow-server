---
metadata:
  version: 1.0.0
---

## Capability

Base contract inherited by sibling techniques. Any Inputs, Outputs, Rules, or Errors defined here are inherited by every technique in the set, and any Protocol here is prepended (and renumbered) before each technique's own. The technique set is implied by the folder contents — do not list techniques here. Keep this minimal: only genuinely cross-technique contract belongs here.

## Inputs

### planning_folder_path

The initiative [planning folder](../resources/planning-folder-template.md#folder-location) holding the analysis, plan documents, and roadmap for the initiative.

### planning_root

The root directory under which all initiative planning folders live.

#### default

`.engineering/artifacts/planning/`
