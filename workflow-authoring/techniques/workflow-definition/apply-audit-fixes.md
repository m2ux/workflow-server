---
metadata:
  version: 1.0.0
---

## Capability

Durable record of what a remediation round changed, per finding, with the post-edit validation result.

## Inputs

### selected_findings

The findings selected for repair, each naming the file, the construct and the corrective action its criteria entry prescribes.

## Outputs

### fixes_applied

Per-finding record of the file edited, the change made, and the schema-validation result for each affected file after the edit. An entry whose finding was resolved without an edit records that instead.

## Protocol

### 1. Record What Changed

- For each entry in `{selected_findings}`, record the file edited, the change made, and the validation result for that file after the edit
- Record a collateral change — anything altered that no finding named — as its own line against the finding whose fix caused it, so it is visible in the durable record rather than absorbed into it

## Rules

### every-change-is-in-the-record

A change absent from the record is a change nobody can review. Record what actually happened, including an edit that turned out wider than its finding called for, rather than the edit the finding described.
