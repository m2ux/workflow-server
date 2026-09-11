---
metadata:
  version: 1.0.0
---

## Capability

Correlate compound vulnerability chains across patterns, creating compound findings that capture the full attack chain and preserve all constituent pattern evidence.

## Protocol

### 1. Cross Pattern Correlation

- Group remaining findings by workflow file
- Identify compound chains where multiple patterns affect the same workflow
- Create compound findings that capture the full attack chain (e.g., P2+P1+P4 = Pwn Request with expression injection and excessive permissions)
- Compound chains must preserve all constituent pattern evidence
