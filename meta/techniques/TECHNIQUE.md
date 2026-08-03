---
metadata:
  version: 1.2.0
---

## Capability

Shared Inputs, Outputs, Rules, and Errors for every technique in this set.

## Inputs

### host_repo_path

Absolute path of the outermost git host for the workspace checkout — the outermost superproject when the component is a submodule, the checkout itself otherwise.

### component_path

Path of the component being worked on, relative to `{host_repo_path}` — `.` for a regular repo. The two together locate the component directory.

### planning_folder_path

Path to the session's planning folder, as the server returned it. Techniques that read or write session artifacts take it from here; not every technique needs one.
