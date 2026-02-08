# Audit Prompt Template Reference

## Location

The audit prompt template is located at:

```
.engineering/artifacts/planning/2026-02-06-audit-strategy-reverse-engineering/01-audit-prompt-template.md
```

## Version

Template v2 (revised 2026-02-08) — includes 7 integrated strategies from cross-session gap analysis:

1. **Severity scoring rubric** (§4) — Impact x Feasibility matrix replaces intuitive assignment
2. **Mandatory struct diff** (§3.3) — field-by-field event vs storage struct comparison table
3. **Invariant extraction** (§5.15) — extract preconditions/postconditions before applying checklist
4. **Toolkit minimum checklist** (§5 item 11) — 7-item mandatory checklist for helpers/toolkit code
5. **Adversarial verification** (§5 Phase 4) — mandatory decomposition of High/Medium PASS items
6. **Cross-layer trace agents** (§5 Group C) — timestamp source and input validation layer-by-layer
7. **Dependency scanning fallback** (§2.2) — structured crate table for manual inspection

## Template Sections

| Section | Purpose | When Used |
|---------|---------|-----------|
| §1 Audit Setup | Scope, reconnaissance, ingestion | Phase 0-1a |
| §2 Static Analysis | Grep-based pattern detection | Phase 1b (Group B agent) |
| §3 Manual Review | Per-component checklist | Phase 1b (Group A agents) |
| §4 Reporting | Finding format, severity rubric | Phase 3 |
| §5 Execution Strategy | Multi-agent protocol, requirements, limitations | All phases |

## Usage in This Workflow

The template is the **checklist** — this workflow is the **execution framework**. The workflow handles:
- Phase sequencing and dependency management
- Agent dispatch and result collection
- Adversarial verification as a separate phase
- Severity calibration via the skill rubric
- Ensemble and gap analysis orchestration

The template handles:
- What to look for (§2 patterns, §3 checklists)
- How to evaluate findings (PASS/FAIL criteria)
- What invariants to extract (§5.15)
- How to structure the report (§4)
