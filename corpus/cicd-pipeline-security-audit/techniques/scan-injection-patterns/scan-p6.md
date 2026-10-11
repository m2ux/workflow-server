---
metadata:
  version: 1.2.0
---

## Capability

Apply P6 AI config poisoning detection: check whether AI config files exist, are CODEOWNERS-protected, and are loaded by any workflow as trusted context.

## Inputs

### scanner_assignment

This scanner's [roster entry](../../resources/intermediate-artifact-schemas.md#scanner-assignments): its designator at `id`, the submodule directory at `submodule`, the workflow file paths it scans at `workflow_files`, and the submodule's AI configuration files at `ai_config_files`.

## Protocol

### 1. P6 Ai Config

- Using `{scanner_assignment.ai_config_files}`, check whether AI config files (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.cursor/rules/`, and any comparable agent-instruction file the roster entry carries) exist in the submodule
- Verify they are listed in `CODEOWNERS` with mandatory review protection, and check whether any workflow loads them as trusted context.  
  > When no `CODEOWNERS` file exists, flag every AI config file.
