---
metadata:
  version: 1.1.0
---

## Capability

Present a drafted file: highlight the schema constructs used and notable design decisions, and — in update mode — compare the new content against the existing content and surface any material being removed.

## Inputs

### current_file

The scope-manifest entry just drafted — its path, action, type, and one-line description.

### is_update_mode

Whether update mode is active. In update mode the review compares the drafted content against the file's existing committed content and surfaces removals.

## Outputs

### removal_inventory

In update mode, the list of material being removed relative to the committed content; empty when none or when not in update mode.

### has_unflagged_removals

True when the update-mode content comparison detects material being removed that was not already inventoried during impact analysis; false otherwise.

## Protocol

### 1. Present Drafted Content

- Present the drafted content for `{current_file}`, highlighting the schema constructs used and notable design decisions

### 2. Compare And Flag Removals

- In update mode, compare the new content against the existing content; record `{removal_inventory}` and set `{has_unflagged_removals}` true when a removal was not inventoried during impact analysis
