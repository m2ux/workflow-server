---
metadata:
  version: 1.2.0
---

## Capability

Scope-manifest completeness check against the reviewed draft.

## Inputs

### manifest_entries

The confirmed file manifest for this run — one entry per file to create, modify or remove, each with its path, its action and a one-line statement of the change.

## Outputs

### total_count

Total number of items in `{manifest_entries}`.

### addressed_count

Number of scope-manifest items confirmed addressed.

### unaddressed_count

Number of scope-manifest items still unaddressed (`{total_count}` − `{addressed_count}`).

## Protocol

### 1. Check Manifest Items

- For every item in `{manifest_entries}`, check file presence, the performed action (create/modify/remove), and a content match against the reviewed draft

### 2. Flag Unaddressed Items

- Flag any item that remains unaddressed
- Set `{total_count}`, `{addressed_count}`, and `{unaddressed_count}` (0 when the manifest is fully addressed)

