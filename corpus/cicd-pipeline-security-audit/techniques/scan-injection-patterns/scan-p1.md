---
metadata:
  version: 1.0.0
---

## Capability

Apply P1 expression injection detection: search `run:` blocks for `${{ }}` expressions, cross-reference against the untrusted context variable list, and document each unsafe source-to-sink flow.

## Protocol

### 1. P1 Expression Injection

- Search `run:` blocks for `${{ }}` expressions
- Cross-reference each expression against the untrusted context variable list
- Distinguish safe contexts (`if:` conditions, action version pins) from unsafe contexts (shell interpolation, script content, action inputs that reach shell)
- For each unsafe expression, document the source context variable and the sink (`run:` block, script, action) into `{scan_results.findings}`
- Treat expressions in `if:` conditions, `env:` key-value (not interpolated into shell), and action version pins as safe contexts — exclude them from P1 findings.
