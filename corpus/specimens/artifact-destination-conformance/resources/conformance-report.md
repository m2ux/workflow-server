---
name: conformance-report
description: Template and rules for the artifact destination conformance report.
metadata:
  version: 1.0.0
  order: 1
---

# Artifact Destination Conformance Report Guide

## What this guide is for

The shape of the conformance report and what each section claims. A reader opens this document to verify that an artifact with a bound destination lands at that destination, while session state remains confined to the session planning directory.

## Template

```markdown
# Artifact Destination Conformance Report

> {destination_path} · {session_index}

## Destination Verification

| Expected Location | Actual Location | State Files Present |
|-------------------|-----------------|---------------------|
| {expected_path}   | {actual_path}   | none                |

## Summary

One paragraph stating whether the artifact landed at the bound destination and whether session state remained isolated.
```

## Rules

### destination-report.record-exact-location

State the exact path where the artifact was written.
