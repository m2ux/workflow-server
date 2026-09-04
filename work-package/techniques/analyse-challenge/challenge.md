---
metadata:
  version: 1.2.0
---

## Capability

Adversarial challenge perspectives over the current concern set for the combine step.

## Inputs

### target_path

*(optional)* Reference codebase root for evidence-backed challenges.

## Outputs

### challenge_findings

Ordered collection of per-perspective findings (keyed by perspective name): concerns confirmed, weakened, newly surfaced, or marked still-irreducible — each with brief evidence notes. Isolated until combine.

## Protocol

### 1. Scatter

- Build one work unit per entry in `{challenge_perspectives}`
- Dispatch via [scatter-gather](../../../meta/techniques/scatter-gather.md); the mode available to this context follows [depth-1-only](../../../meta/techniques/harness-compat/spawn-agent.md#depth-1-only)
- Each unit receives only the concern set (or a read-only summary) plus its perspective name — not other units' findings

### 2. Per-Perspective Challenge

- For the bound perspective, attack the open set: look for missing evidence, rejected alternatives, stakeholder gaps misclassified as code-resolvable, and questions answerable from `{target_path}` or artifacts
- Record for each item: `confirmed` | `weakened` | `resolved-by-challenge` | `newly-surfaced` | `irreducible`, with a one-line evidence note

### 3. Gather

- Assemble `{challenge_findings}` in input-perspective order
- Return the collection to [combine](./combine.md); do not merge into `{concern_document}` here

## Rules

### isolation-then-combine

Per-perspective outputs stay in `{challenge_findings}` until combine. No per-instance bag clobber on shared flags.

### evidence-over-rhetoric

Every `resolved-by-challenge` or `weakened` claim cites code, artifact, or prior log evidence — not preference.
