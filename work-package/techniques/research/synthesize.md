---
metadata:
  version: 1.0.0
---

## Capability

Synthesize the knowledge base and web findings against the work package requirements, mapping applicable patterns to specific needs.

## Inputs

### kb_findings

Knowledge base findings connected to requirements during synthesis.

### web_findings

Web research findings connected to requirements during synthesis.

### requirements

Work package requirements that the findings are synthesized against to map applicable patterns to specific needs.

## Outputs

### findings_synthesis

The findings connected to work package requirements: which kb/web findings apply, how, and to which requirement.

### applicable_patterns

Patterns from the findings that apply to this work, each mapped to the specific need it addresses.

### synthesis_assumptions

Documented assumptions about pattern applicability — where a pattern's fit to the requirements is inferred rather than established.

## Protocol

### 1. Synthesize Findings

- Connect `{kb_findings}` and `{web_findings}` to work package requirements
- Map applicable patterns to specific needs
- Document assumptions about pattern applicability
