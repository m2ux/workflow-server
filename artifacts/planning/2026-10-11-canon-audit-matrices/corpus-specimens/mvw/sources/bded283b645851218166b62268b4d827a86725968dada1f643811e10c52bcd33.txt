---
metadata:
  version: 1.0.0
---

## Capability

Count what one directory of the component holds, so a site binding this library has something cheap to bind.

## Inputs

### probe_target

The directory to count, relative to `{component_path}`.

## Protocol

### 1. Count the Entries

- Count the entries directly inside `{probe_target}` and report the number in the step manifest.

The count lands in the manifest and nowhere else: what a site binding this library evidences is which folder answered its reference, and that is a property of the delivery rather than of any value the technique produces.
