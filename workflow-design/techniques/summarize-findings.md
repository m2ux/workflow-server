---
metadata:
  version: 1.0.0
---

## Capability

Compile a severity-rated summary of post-update audit findings — a clean pass when there are none, per-finding file/location/severity/fix when there are — and present pass/fail counts by severity alongside any new findings introduced by the update.

## Protocol

### 1. Compile Summary

- When no findings exist, compile a clean pass; otherwise compile per finding: file, location, severity, and fix
- Do not repeat the full compliance report structure unless findings exist

### 2. Present Results

- Present pass/fail counts by severity and any new findings introduced by the update
