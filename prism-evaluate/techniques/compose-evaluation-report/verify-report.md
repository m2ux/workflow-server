---
metadata:
  version: 2.0.0
---

## Capability

Checks the written report against the invariants its readers depend on — unique findings, counts that agree, and no methodology showing through.

## Protocol

### 1. Verify Finding Identity

- Verify every finding ID in `{evaluation_report}` is unique and carries its dimension prefix.

### 2. Verify the Counts Agree

- Verify the severity counts in `{evaluation_report.executive_summary}` match the per-dimension detail.

### 3. Verify the Voice

- Verify `{evaluation_report}` names no lens, pass, pipeline mode, or analytical process (`methodology-stripping`).  
  > Where a check fails, correct the report in place and re-run the three checks over it.
