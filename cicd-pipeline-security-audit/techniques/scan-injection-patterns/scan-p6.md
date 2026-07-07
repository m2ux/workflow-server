---
metadata:
  version: 1.0.0
---

## Capability

Apply P6 AI config poisoning detection: check whether AI config files exist, are CODEOWNERS-protected, and are loaded by any workflow as trusted context.

## Protocol

### 1. P6 Ai Config

- Using `{ai_config_inventory}`, check whether AI config files (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`) exist in the submodule
- Verify they are listed in `CODEOWNERS` with mandatory review protection, and check whether any workflow loads them as trusted context.  
  > When no `CODEOWNERS` file exists, flag every AI config file.
