---
metadata:
  version: 1.2.0
---

## Capability

Autonomously resolve the design assumptions that the schema and conventions can settle — using audit evidence against the drafted workflow — leaving only genuine design judgements open. Emits `{has_resolvable_assumptions}` (true while audit-resolvable rows remain) and `{has_open_assumptions}` for remaining judgements.

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

### has_resolvable_assumptions

Boolean — true while open audit-resolvable assumptions remain; false once no open assumption is audit-resolvable (convergence).

## Protocol

### 1. Classify Resolvability

- Read all open assumptions from `{assumptions_log}` — the artifact follows the [Design Assumptions Guide](../resources/design-assumptions.md#assumptions-log-template)
- For each, decide whether an audit pass could settle it using the resolvability vocabulary in [design-assumption-reconciliation](../resources/design-assumption-reconciliation.md): schema-validity → [audit-schema-validation](./audit-schema-validation.md); convention / naming → [audit-conformance](./audit-conformance.md); tool / technique / doc consistency (including Tool-Technique-Doc Consistency anti-patterns) → [audit-anti-patterns](./audit-anti-patterns.md); design-principle adherence → [audit-principles](./audit-principles.md)
- An assumption that is a genuine design judgement (activity boundaries, whether a gate is needed, model choice) is **open** and stays open
- If the log contains no open assumptions, set `{has_resolvable_assumptions}` and `{has_open_assumptions}` to false and skip further work
- If every open assumption classifies as open (not audit-resolvable), set `{has_resolvable_assumptions}` to false and proceed to Update Open Assumptions

### 2. Resolve Via Audits

- For each audit-resolvable assumption, run the relevant audit technique against the drafted files and record the evidence (file, construct, verdict) in `{assumptions_log}`, marking it Validated, Invalidated, or Partially Validated
- Note any newly surfaced assumptions during investigation — add them as open rows with their resolvability classification

### 3. Check Convergence

- Re-classify all open assumptions after the audit pass
- If any open assumptions are still audit-resolvable (including newly surfaced ones), set `{has_resolvable_assumptions}` to true
- If no open assumptions are audit-resolvable, set `{has_resolvable_assumptions}` to false (convergence)

### 4. Update Open Assumptions

- Update `{open_assumptions}` to the remaining genuine design judgements and set `{has_open_assumptions}` true iff any remain, false when all assumptions were settled by audits

### 5. Record Open Rationales

- For each remaining open assumption, record the rationale for why no audit can settle it — durable evidence for the consumer that batches open judgements

## Rules

### no-user-interaction

Reconciliation runs autonomously, without user interaction — emit `{assumptions_log}`, `{open_assumptions}`, `{has_open_assumptions}`, and `{has_resolvable_assumptions}` only.

### convergence-definition

Convergence means no open assumption remains audit-resolvable. Stakeholder-dependent judgements may still be open in `{open_assumptions}`.
