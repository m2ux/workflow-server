---
metadata:
  version: 1.1.0
---

## Capability

Synthesize the knowledge base and web findings against the work package requirements, mapping applicable patterns to specific needs.

## Inputs

### kb_findings

Knowledge base findings connected to requirements during synthesis.

### web_findings

Web research findings connected to requirements during synthesis.

## Outputs

### findings_synthesis

The findings connected to work package requirements: which kb/web findings apply, how, and to which requirement.

### applicable_patterns

Patterns from the findings that apply to this work, each mapped to the specific need it addresses.

### synthesis_assumptions

Documented assumptions about pattern applicability — where a pattern's fit to the requirements is inferred rather than established.

### context_scope

Provenance scope of the sources that informed the design: `repo-only` where no external web source did, `web-retrieval` where only a web source did, `mixed` where both a repository or knowledge-base source and a web source did.

### context_scope_uncertain

True where the run's evidence settles none of the three `{context_scope}` values, false where one of them is established.

## Protocol

### 1. Synthesize Findings

- Connect `{kb_findings}` and `{web_findings}` to work package requirements
- Map applicable patterns to specific needs
- Document assumptions about pattern applicability

### 2. Scope the Provenance

- Emit `{context_scope}` from which of `{kb_findings}` and `{web_findings}` carried a source that informed the design, and `{context_scope_uncertain}` from whether that evidence settles one value
  > Where the evidence settles none of the three, leave `{context_scope}` at its bound value and emit `{context_scope_uncertain}` true.
