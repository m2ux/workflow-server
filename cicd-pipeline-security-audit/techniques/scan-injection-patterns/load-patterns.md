---
metadata:
  version: 1.0.0
---

## Capability

Load the injection pattern catalog and detection heuristics, and scope the scan to the assigned workflow files with their pre-classified inventory data.

## Protocol

### 1. Load Patterns

- Load the [injection-pattern-catalog](../../resources/injection-pattern-catalog.md) for grep patterns, untrusted context lists, and detection heuristics.  
  > If the [injection-pattern-catalog](../../resources/injection-pattern-catalog.md) cannot be loaded, fall back to the built-in pattern definitions.
- Scope the scan to the `{workflow_files}` paths and load `{workflow_inventory}` so each file's pre-classified triggers, permissions, and checkout behavior is available to the pattern checks below.  
  > If a workflow file cannot be read, record it as unscanned and flag it in `{scan_results.coverage}`.
