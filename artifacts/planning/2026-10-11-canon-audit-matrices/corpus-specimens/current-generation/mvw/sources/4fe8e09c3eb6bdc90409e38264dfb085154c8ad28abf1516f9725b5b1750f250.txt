---
metadata:
  version: 1.0.0
---

## Capability

Apply P2 Pwn Request detection: identify `pull_request_target` workflows that checkout PR head and execute code after checkout.

## Protocol

### 1. P2 Pwn Request

- Identify workflows with `pull_request_target` trigger
- Check for checkout of PR head (`ref: github.event.pull_request.head.sha` or `head.ref`)
- Check for code execution after checkout (`run:`, `uses:` with local action, build commands)  
  > A `pull_request_target` trigger alone is not a finding; it becomes one only when combined with fork code checkout and execution.
