---
metadata:
  version: 1.1.1
---

## Capability

Autonomously resolve the design assumptions that the schema and conventions can settle — using audit evidence against the drafted workflow — leaving only genuine design judgements open.

## Inputs

### assumptions_log

The running [log](../resources/design-assumptions.md#assumptions-log-template) of open and resolved design assumptions to reconcile.

## Outputs

### assumptions_log

The [log](../resources/design-assumptions.md#assumptions-log-template) with audit-resolvable assumptions marked resolved (carrying the audit evidence) and only genuine design judgements left open.

### open_assumptions

The assumptions still open after reconciliation — the genuine design judgements that remain unsettled; empty when audits settled everything.

### has_open_assumptions

Boolean — true iff open design judgements remain after reconciliation.

## Protocol

### 1. Classify Resolvability

- Read all open assumptions from `{assumptions_log}` — the artifact follows the [Design Assumptions Guide](../resources/design-assumptions.md#assumptions-log-template)
- For each, decide whether an audit pass could settle it using the resolvability vocabulary in [design-assumption-reconciliation](../resources/design-assumption-reconciliation.md): schema-validity → [audit-schema-validation](./audit-schema-validation.md); convention / naming → [audit-conformance](./audit-conformance.md); tool / technique / doc consistency (including Tool-Technique-Doc Consistency anti-patterns) → [audit-anti-patterns](./audit-anti-patterns.md); design-principle adherence → [audit-principles](./audit-principles.md)
- An assumption that is a genuine design judgement (activity boundaries, whether a gate is needed, model choice) is **open** and stays open

### 2. Resolve Via Audits

- For each audit-resolvable assumption, run the relevant audit technique against the drafted files and record the evidence (file, construct, verdict) in `{assumptions_log}`, marking it Validated, Invalidated, or Partially Validated

### 3. Update Open Assumptions

- Mark every audit-resolvable assumption resolved; update `{open_assumptions}` to the remaining genuine design judgements and set `{has_open_assumptions}` true iff any remain, false when all assumptions were settled by audits

### 4. Record Open Rationales

- For each remaining open assumption, record the rationale for why no audit can settle it

## Rules

### no-user-interaction

Reconciliation runs autonomously, without user interaction — emit `{assumptions_log}`, `{open_assumptions}`, and `{has_open_assumptions}` only.
