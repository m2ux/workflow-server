# Audit Prompt Template Reference

## Location

The audit prompt template is located at:

```
.engineering/artifacts/planning/2026-02-06-audit-strategy-reverse-engineering/01-audit-prompt-template.md
```

## Version

The template includes the following key strategies:

1. **Severity scoring rubric** (§4) — Impact x Feasibility matrix replaces intuitive assignment
2. **Mandatory struct diff** (§3.3) — field-by-field event vs storage struct comparison table
3. **Invariant extraction** (§5.15) — extract preconditions/postconditions before applying checklist
4. **Toolkit minimum checklist** (§5 item 11) — 7-item mandatory checklist for helpers/toolkit code
5. **Adversarial verification** (§5 Phase 4) — mandatory decomposition of High/Medium PASS items
6. **Cross-layer trace agents** (§5 Group C) — timestamp source and input validation layer-by-layer
7. **Dependency scanning fallback** (§2.2) — structured crate table for manual inspection

## Workflow v3 Additions

The workflow adds the following structural improvements:

8. **Two-wave agent dispatch** — Wave 1 (priority-1 + B + C), Wave 2 (priority-2 + D + E)
9. **Group E mechanical verification** — dedicated agent for historically-missed pattern searches (impl Ord completeness, take_while truncation, buffer preallocation, RPC fan-out, StorageInit consistency)
10. **Anti-anchoring instructions** — Group A agents must verify ALL fields/sites independently, not just the first matching instance
11. **Checklist completion gate** — Group A agents must produce PASS/FAIL/NA for every numbered item
12. **Field-enumeration step** — adversarial verification enumerates all instances before verifying
13. **Severity cross-check** — report generation re-evaluates Feasibility from attacker's perspective for I >= 3 findings
14. **Fully automated execution** — no user checkpoints; all phase gates are set via exitActions

## Template Sections

| Section | Purpose | When Used |
|---------|---------|-----------|
| §1 Audit Setup | Scope, reconnaissance, ingestion | Phase 0-1a |
| §2 Static Analysis | Grep-based pattern detection | Phase 1b (Group B + E agents) |
| §3 Manual Review | Per-component checklist | Phase 1b (Group A agents) |
| §4 Reporting | Finding format, severity rubric | Phase 3 |
| §5 Execution Strategy | Multi-agent protocol, requirements, limitations | All phases |

## Usage in This Workflow

The template is the **checklist** — this workflow is the **execution framework**. The workflow handles:
- Phase sequencing and automatic transitions (no checkpoints)
- Two-wave agent dispatch and result collection
- Adversarial verification with field-enumeration as a separate phase
- Severity calibration via the skill rubric with cross-check
- Ensemble and gap analysis orchestration
- Mechanical verification of historically-missed patterns (Group E)

The template handles:
- What to look for (§2 patterns, §3 checklists)
- How to evaluate findings (PASS/FAIL criteria)
- What invariants to extract (§5.15)
- How to structure the report (§4)
