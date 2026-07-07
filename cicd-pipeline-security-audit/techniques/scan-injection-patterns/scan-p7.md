---
metadata:
  version: 1.0.0
---

## Capability

Apply P7 dangerous execution pattern detection: search `run:` blocks and referenced scripts for `curl|bash`, `wget|sh`, `eval`, `base64` decode-and-execute, and dynamic script generation.

## Protocol

### 1. P7 Dangerous Execution

- Search `run:` blocks for `curl|bash`, `wget|sh`, `eval`, and `base64` decode + execute patterns
- Search referenced shell scripts for the same patterns
- Flag dynamic script generation (`echo` commands building scripts then executing them)
