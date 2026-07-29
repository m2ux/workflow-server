---
metadata:
  version: 1.1.0
---

## Capability

Shared Inputs, Outputs, Rules, and Errors for every technique in this set.

## Inputs

### host_repo_path

Absolute path to the host repository the session belongs to — the outermost superproject when the component is a submodule, the checkout itself otherwise.

### component_path

Path of the component being worked on, relative to `{host_repo_path}` — `.` for a regular repo. The two together locate the component directory.
