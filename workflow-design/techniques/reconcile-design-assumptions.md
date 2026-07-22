---
metadata:
  version: 1.3.0
---

## Capability

Autonomous resolution of schema- and convention-settled design assumptions, leaving genuine judgements open.

## Inputs

### assumptions_log

The running [log](../resources/design-assumptions.md#assumptions-log-template) of open and resolved design assumptions to reconcile.

## Outputs

### assumptions_log

The [log](../resources/design-assumptions.md#assumptions-log-template) with audit-resolvable assumptions marked resolved (carrying the evidence) and only genuine design judgements left open.

### open_assumptions

The assumptions still open after reconciliation — the genuine design judgements that remain unsettled; empty when everything was settled.

### has_open_assumptions

Boolean — true iff open design judgements remain after reconciliation.

### has_resolvable_assumptions

Boolean — true while open audit-resolvable assumptions remain; false once no open assumption is audit-resolvable (convergence).

## Protocol

### 1. Classify Resolvability

- Read all open assumptions from `{assumptions_log}` — [Design Assumptions Guide](../resources/design-assumptions.md#assumptions-log-template)
- Classify each with the resolvability vocabulary in [design-assumption-reconciliation](../resources/design-assumption-reconciliation.md) (`audit` vs `open`). Criteria homes for `audit` rows: schema / `schemas/README.md`; [convention-conformance](../resources/convention-conformance.md); [anti-patterns](../resources/anti-patterns.md); [design-principles](../resources/design-principles.md). Do not Apply sibling `audit-*` techniques from this Protocol ([pass-orchestration-in-technique](../resources/anti-patterns.md#ap-114-pass-orchestration-in-technique)).
- Genuine design judgements stay **open**
- If the log has no open assumptions, set `{has_resolvable_assumptions}` and `{has_open_assumptions}` false and skip further work
- If every open assumption is a judgement (not audit-resolvable), set `{has_resolvable_assumptions}` false and proceed to Update Open Assumptions

### 2. Resolve Audit-Resolvable Rows

- For each `audit`-classified assumption, gather evidence against the drafted files using the cited criteria home; record `{ file, construct, verdict }` in `{assumptions_log}` and mark Validated, Invalidated, or Partially Validated
- Note newly surfaced assumptions as open rows with resolvability classification

### 3. Check Convergence

- Re-classify open assumptions after the evidence pass
- Set `{has_resolvable_assumptions}` true iff any open row remains audit-resolvable (including newly surfaced); otherwise false (convergence)

### 4. Update Open Assumptions

- Update `{open_assumptions}` to remaining genuine judgements; set `{has_open_assumptions}` true iff any remain

### 5. Record Open Rationales

- For each remaining open assumption, record why no audit can settle it — durable evidence for Gate 2 batch disposition

## Rules

### no-user-interaction

Reconciliation runs autonomously, without user interaction — emit `{assumptions_log}`, `{open_assumptions}`, `{has_open_assumptions}`, and `{has_resolvable_assumptions}` only.

### convergence-definition

Convergence means no open assumption remains audit-resolvable. Stakeholder-dependent judgements may still be open in `{open_assumptions}`.

### no-sibling-audit-invoke

Do not Apply / `::`-invoke `audit-*` techniques. Quality-review audit steps remain activity-bound elsewhere; this technique settles assumptions against criteria resources only.
