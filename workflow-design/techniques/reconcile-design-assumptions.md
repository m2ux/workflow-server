---
metadata:
  version: 1.0.0
---

## Capability

Autonomously resolve the design assumptions that the schema and conventions can settle — running the audit techniques against the drafted workflow — leaving only genuine design judgements open.

## Inputs

### assumptions_log

The running [log](../resources/design-assumption-reconciliation.md) of open and resolved design assumptions to reconcile.

## Outputs

### assumptions_log

The [log](../resources/design-assumption-reconciliation.md) with audit-resolvable assumptions marked resolved (carrying the audit evidence) and only genuine design judgements left open.

### open_assumptions

The assumptions still open after reconciliation — the genuine design judgements that require user input; empty when audits settled everything.

### has_open_assumptions

Boolean gate — true iff open design judgements remain after reconciliation.

## Protocol

### 1. Classify Resolvability

- Read all open assumptions from `{assumptions_log}`
- For each, decide whether an audit pass could settle it: schema-validity → [audit-schema-validation](./audit-schema-validation.md); convention / naming → [audit-conformance](./audit-conformance.md); tool / technique / doc consistency (including Tool-Technique-Doc Consistency anti-patterns) → [audit-anti-patterns](./audit-anti-patterns.md); design-principle adherence → [audit-principles](./audit-principles.md) (see [design-assumption-reconciliation](../resources/design-assumption-reconciliation.md))
- An assumption that is a genuine design judgement (activity boundaries, checkpoint necessity, model choice) is not audit-resolvable and stays open

### 2. Resolve Via Audits

- For each audit-resolvable assumption, run the relevant audit technique against the drafted files and record the evidence (file, construct, verdict) in `{assumptions_log}`, marking it Validated, Invalidated, or Partially Validated

### 3. Check Convergence

- Mark every audit-resolvable assumption resolved; update `{open_assumptions}` to the remaining genuine design judgements and set `{has_open_assumptions}` true iff any remain, false when all assumptions were settled by audits
- For each remaining open assumption, record the rationale for why no audit can settle it

## Rules

### no-user-interaction

Reconciliation runs autonomously, without user interaction — the user is presented only the converged result.
