---
metadata:
  version: 1.0.0
---

## Capability

Generate a plain-language overview of the vulnerability risk and record it in the private planning README.

## Inputs

### planning_readme

The planning-folder README the risk overview is written into.

## Outputs

### security_overview

Plain-language summary of the vulnerability's risk, written into `{planning_readme}` for a non-specialist reader.

## Protocol

### 1. Present Security Overview

- Read the advisory at `{sec_vuln_url}` and draft `{security_overview}` as a plain-language statement of the risk.
- Write `{security_overview}` into `{planning_readme}` under `{planning_folder_path}`.
