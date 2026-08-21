---
metadata:
  version: 2.0.0
---

## Capability

Assembles the scope set an audit runs as, each scope carrying its own focused prompt.

## Protocol

### 1. Decide How Many Scopes

- Take one scope covering the whole codebase.  
  > Where `{total_loc}` exceeds 200K, or the codebase is smaller but its security boundaries are clearly separable, take one scope per trust domain or module group instead.

### 2. Assemble the Scopes

- Record `{audit_scopes}`, one entry per scope in the shape `{audit_scopes.scopes}` declares, `output_subdir` naming where that scope's run writes.
- Set each scope's `analysis_focus` from the composed prompt, narrowed to what that scope covers and naming its security domains, which is what yields domain-prefixed finding IDs.
