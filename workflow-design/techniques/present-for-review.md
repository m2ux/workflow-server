---
metadata:
  version: 1.0.0
---

## Capability

Present a drafted file for review: highlight the schema constructs used and notable design decisions, and — in update mode — compare the new content against the existing content and surface any material being removed.

## Inputs

### current_file

The scope-manifest entry just drafted this iteration — its path, action, type, and one-line description.

### is_update_mode

Whether update mode is active. In update mode the review compares the drafted content against the file's existing committed content and surfaces removals.

## Outputs

### has_unflagged_removals

True when the update-mode content comparison detects material being removed that was not already flagged and approved during impact analysis; false otherwise. Gates the preservation-check checkpoint.

## Protocol

### 1. Present for Review

- Present the drafted content for `{current_file}` for user review, highlighting the schema constructs used and notable design decisions
- In update mode, compare the new content against the existing content and surface any material being removed; set `{has_unflagged_removals}` true when a removal was not flagged during impact analysis
