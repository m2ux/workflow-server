---
metadata:
  version: 2.0.0
---

## Capability

Finds the security-relevant patterns a codebase actually contains, which is what grounds its audit domains in evidence.

## Outputs

### security_characteristics

The patterns found, each `{ category, location, description, severity_relevance }`.

### security_characteristics_count

How many characteristics the scan found. Zero says the codebase carries no security surface.

## Protocol

### 1. Scan for the Characteristics

- Search `{target_path}` for each category [Security Characteristics](../../resources/audit-domain-rubric.md#security-characteristics) names, and record `{security_characteristics}` with each hit's location and what makes its severity relevant.

### 2. Count What Was Found

- Record `{security_characteristics_count}` as the number of characteristics found.
