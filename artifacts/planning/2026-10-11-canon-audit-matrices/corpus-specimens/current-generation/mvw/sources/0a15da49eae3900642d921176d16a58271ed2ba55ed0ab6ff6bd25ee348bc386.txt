---
metadata:
  version: 1.0.0
---

## Capability

Record CODEOWNERS presence per target for P6 detection, since a `CODEOWNERS` file gates AI config protection.

## Protocol

### 1. Record CODEOWNERS

- For each target, record whether a `CODEOWNERS` file exists and its path into `{ai_config_inventory}`, since it gates P6 (AI config protection).
