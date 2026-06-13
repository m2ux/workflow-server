---
metadata:
  version: 1.0.0
---

## Capability

Shared base contract inherited by sibling techniques. Any Inputs, Outputs, Rules, or Errors defined here are inherited by every technique in this set, and any Protocol here is prepended (and renumbered) before each technique's own. The technique set is implied by the folder contents — do not list techniques here. Keep this minimal: only genuinely cross-technique contract belongs here.

## Inputs

### planning_folder_path

Absolute path to this audit run's planning folder; each technique reads prior audit artifacts from, and writes its own artifact into, this folder.

## Rules

### source-sink-mental-model

Every finding names the source (attacker-controlled input) and the sink (privileged execution point); an item without a clear source-to-sink flow is an observation, not a vulnerability.

### artifacts-confined-to-planning-folder

Every artifact is written under `{planning_folder_path}`; artifacts there are gitignored and are never referenced in pull requests or issues.

### agent-output-persisted

Every sub-agent writes its own structured output as a JSON file under `{planning_folder_path}` before returning.
