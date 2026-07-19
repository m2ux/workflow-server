---
metadata:
  version: 1.0.0
---

## Capability

Fan out adversarial challenge perspectives against the current concern set in parallel, gather ordered findings, and return them for [combine](./combine.md). Uses scatter-gather (isolation-then-combine) — does not mutate shared convergence or residue flags.

## Inputs

### challenge_perspectives

Ordered list of perspective or lens names to apply (e.g. `stakeholder-gap`, `rejected-paths`, `evidence-strength`, or prism portfolio lens ids).

### concern_kind

Domain of the open set under challenge (`assumptions`, `open_questions`, …).

### assumptions_log

*(optional)* Assumptions log when challenging assumptions.

### comprehension_artifact

*(optional)* Comprehension artifact / open-questions table when challenging open questions.

### target_path

*(optional)* Reference codebase root for evidence-backed challenges.

## Outputs

### challenge_findings

Ordered collection of per-perspective findings (keyed by perspective name): concerns confirmed, weakened, newly surfaced, or marked still-irreducible — each with brief evidence notes. Isolated until combine.

## Protocol

### 1. Scatter

- Build one work unit per entry in `{challenge_perspectives}`
- Dispatch via scatter-gather (sequential when concurrency is 1; parallel spawn-concurrent when the binding activity enables concurrency > 1)
- Each unit receives only the concern set (or a read-only summary) plus its perspective name — not other units' findings

### 2. Per-Perspective Challenge

- For the bound perspective, attack the open set: look for missing evidence, rejected alternatives, stakeholder gaps misclassified as code-resolvable, and questions answerable from `{target_path}` or artifacts
- Record for each item: `confirmed` | `weakened` | `resolved-by-challenge` | `newly-surfaced` | `irreducible`, with a one-line evidence note
- Do not write `{has_resolvable_assumptions}`, `{has_open_assumptions}`, `{needs_comprehension}`, or `{has_open_questions}` from a unit — isolation-then-combine

### 3. Gather

- Assemble `{challenge_findings}` in input-perspective order
- Return the collection to [combine](./combine.md); do not merge into the log here

## Rules

### isolation-then-combine

Per-perspective outputs stay in `{challenge_findings}` until combine. No per-instance bag clobber on shared flags.

### evidence-over-rhetoric

Every `resolved-by-challenge` or `weakened` claim cites code, artifact, or prior log evidence — not preference.
