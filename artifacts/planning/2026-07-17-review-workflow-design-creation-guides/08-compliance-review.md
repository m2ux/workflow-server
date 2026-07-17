# Compliance Review: workflow-design

**Date:** 2026-07-17
**Workflow:** workflow-design v1.24.3
**Files audited:** 73 (PR #254 worktree — not catalog 1.24.1 pin)
**Mode:** review

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 1 |
| Medium   | 0 |
| Low      | 1 |
| Pass     | YAML schema + refs; creation-guide structure intact |

Creation-guide structure validates: every planning bare filename maps to a Template+Rules guide; `resources/README.md` map is complete; persist techniques cite guides (minor `#template` drift); guides stay lean. One High: `pattern-analysis` braces an undeclared assemble product (binding-fidelity NEW).

Satellites: [principle](08-principle-findings.md) · [anti-pattern](08-anti-pattern-findings.md) · [verified](08-verified-findings.md)

## Principle Compliance Findings

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| Medium | Undeclared assemble product (Partial: Expressiveness / Contract) | `pattern-analysis.md` | Declare `pattern_analysis` Output |

## Anti-Pattern Findings

| Severity | Entry | Location | Fix |
|----------|-------|----------|-----|
| High | `technique-outputs-declared` | `techniques/pattern-analysis.md:33` | Declare `### pattern_analysis` |
| Low | cite-anchor inconsistency | several persist techniques | Use `#template` on persist cites |

## Schema Validation Results

| Check | Result |
|-------|--------|
| `validate-workflow-yaml.ts` → PR worktree | **PASS** — workflow + 9 activities; technique anchors OK |
| `check-all-refs.ts --root` PR worktree | **PASS** — workflow-design refs resolve |
| `check-binding-fidelity.ts --root` PR worktree | **FAIL** — 1 PR-unique NEW: `read-resolution` `pattern-analysis.md:33`; other NEW dead-output/orphan rows also on catalog tip (baseline stale) |

**pass_count:** 10 YAML roots (1 workflow + 9 activities)  
**fail_count:** 0 schema; 1 binding NEW unique to this tip

## Other pass summaries

| Pass | Count | Satellite |
|------|------:|-----------|
| Expressiveness (supplemental skim) | 1 | same as H-1 — no separate satellite |
| Conformance (supplemental skim) | 0 structural; L-1 cite style | — |
| Rule hygiene / Enforcement | — | not run (review-mode activity path) |

## Recommended Fixes

1. **High — declare `pattern_analysis` Output** on `techniques/pattern-analysis.md`; keep `{pattern_analysis_path}` artifact; bump technique version.
2. **Low — normalize persist cites** to `…md#template` (optional before merge).
3. **Baseline hygiene (out of disposition):** refresh `binding-fidelity-baseline.json` for corpus-wide dead-output/orphan noise after intentional review — not required to accept creation-guide structure.
