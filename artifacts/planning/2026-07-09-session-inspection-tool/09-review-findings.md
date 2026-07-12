# Lean-Coding Audit — Over-Engineering Review Findings

**Activity:** lean-coding-audit (work-package v3.28.0) · **Issue:** #193 · **Intensity:** lite (problem_complexity=simple)
**Change under review:** commit `d21f1d73` — `inspect_session` read-only MCP tool (+617/-5; core is `src/tools/workflow-tools.ts` +184).
**Lens:** over-engineering only. Correctness / security / performance are safety-floor and out of scope for this pass.

## Findings

```
src/tools/workflow-tools.ts:248: shrink redundant `case 'summary':` label above `default:` with identical body — the `z.enum` default('summary') makes `view` exhaustive, so `default:` alone covers it. -1 line. (Marginal: the label also documents summary as the intended fallback.)
src/tools/workflow-tools.ts:123-250: yagni nine `export`s (INSPECT_SESSION_VIEWS, InspectSessionView, project{Identity,Checkpoints,Activities,History,Children,Summary}, projectSessionView) with no external consumer — the parity test drives everything through the MCP tool (callInspect), not by importing the pure functions, so the stated "lets the parity test drive them directly" rationale does not hold. Narrow to module-local. ~0 lines (visibility keyword only; functions stay, all used internally).
```

```
net: -1 line possible (plus 9 export-keyword narrowings, ~0 lines).
```

## Assessment

The change is **structurally lean**. The seven pure projections + `projectSessionView` dispatch + `projectSummary` composite are a faithful 1:1 mirror of the normative reference `tests/fixtures/inspect-session/inspect_session.py` (`identity`/`checkpoints`/`activities`/`history`/`children`/`summary` functions + a `main` dispatch). Collapsing that structure would diverge from the reference contract the parity test (PR215-TC-08) pins — so it is safety floor, not bloat.

Everything else holds the floor and carries no over-engineering:

- **All three params** (`view`, `child_index`, `variable`) map to reference CLI flags (`view`, `--child`, `--variable`) — no dead params.
- **`child_index` descent reuses the in-repo `navigatePath` helper** (ladder rung 2) rather than hand-rolling traversal — the lazy choice.
- **`HISTORY_MILESTONE_TYPES` Set** is used; the six milestone types mirror the reference.
- **Doc-comments explain *why*** (reference provenance, purity rationale, read-only intent) — why-not-what compliant, not restatement; no `delete` on comments.
- **Docs/site/README changes** are minimal required registration — no bloat.

## Recommendation

**Accept the audit as-is.** The two findings are near-zero-value (1 line + a visibility narrowing) and the sole substantive one — the redundant `case 'summary':` label — is defensible as intent documentation. No simplification here would repay the churn or the divergence risk against the parity contract. Recommend the `audit-accepted` option.
