# Code Review Report

> code-review · PR #366 / issue #365 Context Fidelity and Observability · 2026-07-31 · 16 files reviewed · methodology: [Rust/Substrate Code Review](https://github.com/m2ux/workflow-server/blob/workflows/work-package/resources/rust-substrate-code-review.md) (TS/Node project — architecture, error handling, safety axes applied; Substrate pallet criteria N/A)

## Summary

**Overall Quality:** 4/5 — Critical: 0 · High: 0 · Medium: 0 · Low: 1 · Informational: 2

Head `a9c3ea2d` on `feat/365-context-fidelity-observability` vs `main`. Lean-coding audit findings were applied earlier (`09-code-review.md`); this pass is post-impl correctness and architecture review of the shipped surface.

## Module Overview

Four mechanisms on the workflow MCP server, one advisory channel (`_meta.validation` / inspect projections):

| Item | Mechanism | Primary surfaces |
|------|-----------|------------------|
| S3 | Reduction + attribution | `record_usage` optional `agent_id`; `projectUsage` `{rows,totals}`; DELTA contract text |
| S5 | Emission + filter + warn | Trace `aid`; agent filters; agent-scoped `validateTechniqueFetches`; resource qualify+warn; hybrid step events |
| S2 | Set-diff | `declaredArtifacts`; `artifacts_produced` merge-by-id; planning-folder undeclared-file warnings |
| S4 | Coverage + measure | `provenance_note` + split inherited `note`/`items` in `dedupTechniqueBlocks` |

GitNexus impact (graph CRITICAL at fan-out, plan-discounted d=1): `projectUsage` ← `projectSessionView` only; `dedupTechniqueBlocks` ← workflow + resource tool registrations.

## Manual Diff Review

> feat/365-context-fidelity-observability vs main · 16 files reviewed · reviewer: stakeholder · No Issues

## Findings

No Critical, High, or Medium findings on the authored surface.

### Low Issues

#### CR-1: Artifact cover matching accepts basename substring on declared id

**File:** [`src/tools/workflow-tools.ts`](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L656) · **Severity:** Low  
**Issue:** Undeclared-file suppression uses `f.includes(id)` after exact name/stem checks. A short or common artifact id could suppress a warning for an unrelated filename that merely contains that substring.  
**Recommendation:** Prefer tokenized / prefix-aware matching (e.g. `NN-<id>.md` or whole-path stem equality) if false suppressions appear in the wild. Warn-only channel limits blast; not a correctness break for declared-path success criteria.  
**Classification:** Nit (does not route a fix cycle).

### Informational

#### CR-I1: `projectUsage` return shape is additive object

**File:** [`src/tools/workflow-tools.ts`](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L283)  
Clients that treated `view:usage` as a bare array must read `.rows`. Oracle + PR366 tests lock the shape; note for external consumers.

#### CR-I2: Hybrid step clocks are server-side only

Starts on technique delivery; completions on non-empty `step_manifest` at `next_activity`. Bundled steps without reported output never complete — by design (RE-8). Operators reading the timeline should not expect wall-clock ends for every start.

## Structural Analysis

> L12 structural · change set head `a9c3ea2d` · complex problem_complexity (inline prism step gated off; analysis performed in-worker against authored surface) · full write-up: [10-structural-analysis.md](10-structural-analysis.md)

**Claim (transformed):** The deepest structure is not “missing observability APIs” but **attribution asymmetry** — multiple agent contexts share one session bag and history, while delivery ledgers are already per-agent; fidelity and cost evidence must re-key every consumer of shared history without inventing a second session.

**Conservation law:** *Shared session history may accumulate multi-agent evidence iff every read that claims “this worker did X” is filtered (or explicitly unscoped for solo/legacy).* Producer/clearer ledger: see standalone structural analysis. **No unmatched producer** that creates unbounded session state on the authored paths; `declaredArtifacts` and delivery hashes grow with real activity but are session-scoped and bounded by work-package lifetime.

**Bug table (authored surface):** empty of Critical/Major/Minor; CR-1 noted as Nit/Low above.

## Strengths

- DELTA usage contract is explicit on tool schema and dispatch docs; no price field (D-4).
- Agent filters consistently exclude unattributed rows when filtering (documented, tested SC-11).
- Unresolvable resources warn in both delivery modes without failing `get_activity`.
- S2 is warn-only; outside-folder declared paths are *unknown*, not *missing*.
- Lean extract of `appendStepStartedIfAbsent` / `stageField` keeps dual call sites honest.

## Recommendations Summary

1. **Immediate:** None.
2. **Near-term:** Tighten artifact basename cover matching if false suppressions appear (CR-1).
3. **Long-term:** External client docs for `usage` object shape if any out-of-tree consumers remain.

## Compliance

| Category | Status | Notes |
|----------|--------|-------|
| Rust Idioms | N/A | TypeScript/Node server |
| Substrate Framework | N/A | Not a pallet |
| Architecture | ✓ | Four mechanisms, one validation channel |
| Documentation | ✓ | Positive-present tool/schema comments |
| Testing | ✓ | PR366 SC cases + oracle parity green |

All applicable compliance categories met for this stack.

## Lean-Coding Audit (prior)

See [09-code-review.md](09-code-review.md) — seven findings applied; re-score lean.

