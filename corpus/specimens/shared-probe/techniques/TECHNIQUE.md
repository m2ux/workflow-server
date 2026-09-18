---
metadata:
  version: 1.0.0
---

## Capability

Shared Inputs, Outputs and Rules for every technique in this library, which no workflow declares and every workflow may reach.

## Inputs

### component_path

Path of the component being probed, relative to the component root — `.` for a regular repository. Declared here rather than on each operation, so a technique added to this library inherits it by sitting in the folder.

## Rules

### reachable-under-either-name

This library answers to `shared-probe` and to `specimens/shared-probe` alike: the directory name a reference ordinarily carries, and the path from the corpus root that names this one and no other. A site writes whichever it wants, and both deliver this file's contract along with the operation.

### no-definition-of-its-own

The folder holds no `workflow.yaml`, so it offers operations without being a product an operator can start. What keeps it out of the catalogue is that it declares nothing to run, rather than any list of names the catalogue skips.
