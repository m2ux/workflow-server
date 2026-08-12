---
metadata:
  version: 1.2.0
---

> The `§X.Y` identifiers used throughout this technique refer to the audit checklist taxonomy in [§2 Static Analysis Phase](../resources/audit-template-reference.md#2-static-analysis-phase), [§3 Systematic Manual Review Strategies](../resources/audit-template-reference.md#3-systematic-manual-review-strategies) and [§5 Execution Strategy](../resources/audit-template-reference.md#5-execution-strategy).

## Capability

Run a second independent audit pass over the priority-1/2 components, verifying known blind spots first, and emit a second-pass findings artifact whose existence attests that the pass actually executed.

## Outputs

### second_pass_findings

Findings from the second independent pass, including at least one sub-agent result.

#### artifact

`second-pass-findings.md`

#### audience

`human`

## Protocol

### 1. Configure Pass

- Scope the second pass to the priority-1/2 components, taking the supplementary files each blind-spot item needs from the [Supplementary File Assignments](../resources/target-profile.md#supplementary-file-assignments).
- Use a different model or temperature when available; the same model with a different system prompt is acceptable.

### 2. Verify Blind Spots

- Verify the universal blind-spot items first — (1) §3.1 weight accounting (non-zero `on_finalize` weight), (2) §3.3 event filtering (trace every event field independently on partial success), (3) §3.2 pagination counter (trace first-iteration behavior), (4) §2.10 serialization pairing (produce the size/serialize pairing table) — then the [Target-Specific Ensemble Blind Spot Items](../resources/target-profile.md#target-specific-ensemble-blind-spot-items), recording a CONFIRMED / REFUTED / INSUFFICIENT verdict for each.

### 3. Execute Second Pass

- Dispatch at least one sub-agent that independently applies the §3 checklist to the priority-1/2 crates, following the same §3 checklist and §5 execution requirements.
  > Under context-window pressure, scope to the top 3-5 files by priority rather than skipping — a reduced-scope pass is always preferable to a skipped one.
- Record the results into `{second_pass_findings}` per [second-pass-findings](../resources/second-pass-findings.md#template) and its [Rules](../resources/second-pass-findings.md#rules), and persist it to its declared artifact file.

## Rules

### second-pass-actually-dispatched

At least one sub-agent independently applies the §3 checklist; declaring the pass complete with no sub-agent dispatched is invalid.

### artifact-attests-execution

The `{second_pass_findings}` artifact is the execution attestation — it must exist, containing at least one sub-agent result, even when scope is reduced under context pressure.
