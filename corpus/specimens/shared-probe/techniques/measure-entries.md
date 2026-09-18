---
metadata:
  version: 1.0.0
---

## Capability

Count what one directory of the component holds, so a site binding this library has something cheap to bind.

## Inputs

### probe_target

The directory to count, relative to `{component_path}`.

## Outputs

### entry_count

How many entries the target holds.

### probe_home

The library this operation was delivered from, as the delivery reported it. A site reads this to say which folder answered its reference.
