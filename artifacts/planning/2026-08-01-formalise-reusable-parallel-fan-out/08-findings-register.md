# Findings Register — Formalise reusable parallel fan-out

**Date:** 2026-08-01 · **Mode:** Update  
**Base ref:** `9922b20c` · **Primary target:** meta · **Co-edit surfaces:** workflow-design, prism, **work-package** (validate activity)  
**Edit surface:** `.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/`

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | 0 | 0 |
| High     | 0 | 0 |
| Medium   | 0 | 0 |
| Low      | 0 | 0 |

> **Remediation round:** Prior quality-review closed with a **false negative** on AP-114 (see [10-ap114-redesign-note.md](10-ap114-redesign-note.md)). Redesign applied; second Detect walk on changed surface finds **zero** Protocol `Apply [technique]` for work. High AP-114 on prior design sites is **addressed**.

## Findings

### meta (primary bag target)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| High | AP-114 pass-orchestration-in-technique | `cargo-operations/run-suite.md` Protocol `Apply [unit-fan-out]`; cargo `TECHNIQUE.md` multi-op rule | Protocol Apply of strategy technique for suite fan-out | quality-review false-negative; redesign | **addressed** — run-suite is pure combine over `unit_results`; activity binds unit-fan-out |
| — | — | — | No open audit findings on redesigned surface | redesign Detect | clean |

**Changed files (redesign):**

| Path | Role |
|------|------|
| `meta/techniques/unit-fan-out.md` | strategy — invocation-spec units; gather → `unit_results` only |
| `meta/techniques/cargo-operations/run-suite.md` | pure combine `unit_results` → `validation_results` |
| `meta/techniques/cargo-operations/TECHNIQUE.md` | multi-op suites bound via **activity steps** |
| `meta/techniques/scatter-gather.md` | process units bind unit-fan-out at activity layer |
| `meta/techniques/README.md` / `meta/README.md` | indexes |

### workflow-design (co-edit)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| High | AP-140 Fix steered into AP-114 | AP-140 Fix text | “Apply the unit-kind-correct contract” from technique façade | redesign | **addressed** — Fix: bind as activity step; cross-link AP-114 |
| — | AP-114 exemplar | AP-114 title line | added `run-suite: Apply unit-fan-out` | redesign | clean (exemplar of smell) |

**Changed files:** `design-principles.md` §33 (activity bind locus), `anti-patterns.md` AP-114/AP-140, `resources/README.md`.

### prism (co-edit)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| High | AP-114 | `independent-lenses.md` Apply scatter-gather | Protocol technique→technique Apply | false-negative | **addressed** — atomic lens work; activity owns parallel |

### work-package (co-edit — scope expansion)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| — | — | `activities/11-validate.yaml` | compose units → `unit-fan-out` → `run-suite` combine | redesign | clean |

## Coverage ledger (redesign Detect)

| Check | Result |
|-------|--------|
| Grep Protocol `Apply [` on changed techniques | **zero** work-invoke hits (canon exemplars only) |
| AP-114 Detect on run-suite / independent-lenses / cargo TECHNIQUE | clean after redesign |
| §26 structural evidence | validate activity step graph; prism structural-pass already declares scatter-gather |
| Definition guards `--root` worktree | **19/19 PASS** |

## Audit false-negative retrospective

Full write-up: [10-ap114-redesign-note.md](10-ap114-redesign-note.md).

Root causes in brief:

1. Protocol family marked “walked” without per-entry Detect.
2. `Apply unit-fan-out` / `Apply scatter-gather` treated as formalisation success, not AP-114 Detect.
3. AP-140 Fix = Protocol Apply (itself AP-114).
4. §26 walked without activity-bind structural evidence.
5. No automated AP-114 guard — agent narrative optimized for “kill free prose.”
6. structural-evidence-first inverted.

## Known

| Class | Check | Count | Verdict |
|-------|-------|------:|---------|
| binding-fidelity-triage | pre-existing corpus entries | 77 | harmless (host triage; stale run-suite features entry cleared when redesign lands with host triage update) |

## Definition guards

All run with `--root` = edit worktree. **TOTAL_FAILS=0** (19 pass).

## Sources

| Label | Path |
|-------|------|
| Change brief | [01-change-brief.md](01-change-brief.md) |
| AP-114 redesign / false-negative | [10-ap114-redesign-note.md](10-ap114-redesign-note.md) |
| Scope manifest | [06-scope-manifest.md](06-scope-manifest.md) |
