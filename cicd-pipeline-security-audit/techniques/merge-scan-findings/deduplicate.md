---
metadata:
  version: 1.1.0
---

## Capability

Merge duplicate findings sharing the same file, line, and pattern, keeping the most complete evidence and recording the duplicate mappings for reconciliation.

## Outputs

### duplicate_mappings

Mapping of each duplicate scanner finding to the retained finding it was merged into.

## Protocol

### 1. Deduplicate

- Group findings by (`file_path`, `line_range`, `pattern_id`)
- For duplicates, keep the finding with the most complete evidence
- Record `{duplicate_mappings}` for reconciliation
