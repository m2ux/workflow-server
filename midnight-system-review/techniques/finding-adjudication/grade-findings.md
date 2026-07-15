---
metadata:
  version: 1.0.0
---

## Capability

Grade every candidate finding with the complete grade tuple defined by the [grading-rubric](../../resources/grading-rubric.md) — verifying each candidate's evidence anchor first, then assigning every tuple dimension from the rubric's definitions, never from intuition.

## Inputs

### candidate_findings

The aggregated candidate findings from evidence consolidation, each with its area and anchors.

## Outputs

### graded_findings

Every candidate with its complete grade tuple and grading rationale, in area order.

#### evidence_anchor

The concrete anchor the finding stands on — file:line, command output, or graph result.

#### risk_impact

What goes wrong in production and how badly, per the rubric scale.

#### evidence_confidence

How strongly the evidence supports the finding — low, medium, or high per the rubric's definitions.

#### production_likelihood

How likely the faulty path executes in production, per the rubric scale.

#### finding_category

The rubric category the finding belongs to (correctness, consensus-safety, data-integrity, operational, hygiene).

#### validation_mode

How the finding was validated — which probe class produced the evidence, or blocked when full validation needed an unavailable toolchain.

## Protocol

### 1. Verify Anchors

- For each entry in `{candidate_findings}`, confirm the evidence anchor is concrete and re-checkable against `{target_repo_path}`; a candidate whose anchor cannot be verified is graded at low evidence confidence with the failure noted — it is never silently dropped.

### 2. Grade

- Assign every tuple dimension for each candidate from the [grading-rubric](../../resources/grading-rubric.md) definitions and calibration anchors, recording a one-line rationale per dimension that cites the rubric line applied.
- Grade every candidate independently before any disposition thinking — acceptance is registration's decision, not grading's.
- Emit `{graded_findings}`.
