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

> **Remediation rounds:** (1) AP-114 false negative — see [10-ap114-redesign-note.md](10-ap114-redesign-note.md). (2) AP-68: redesign technique prose used “binding activity owns…” as composition instruction — techniques are **activity-blind**; AP-68 Detect tightened; redesign surface scrubbed.

## Findings

### meta (primary bag target)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| High | AP-114 pass-orchestration-in-technique | `cargo-operations/run-suite.md` Protocol `Apply [unit-fan-out]`; cargo `TECHNIQUE.md` multi-op rule | Protocol Apply of strategy technique for suite fan-out | quality-review false-negative; redesign | **addressed** — run-suite is pure combine over `unit_results`; validate activity steps bind unit-fan-out then run-suite |
| High | AP-68 technique-stage-agnostic | `run-suite.md` rule `activity-owns-fan-out`; `unit-fan-out.md` Protocol/Rules naming binding activity; cargo `TECHNIQUE.md`; `scatter-gather.md` | Technique prose named activity graph actors / sibling-step ownership | user catch after AP-114 redesign | **addressed** — activity-blind I/O and peer-contract cites only; rule renamed `combine-only` |
| Medium | AP-141 container-names-inheriting-ops | cargo `TECHNIQUE.md` `fmt-uses-only-nice`; multi-op rule citing `run-suite` | Group contract named/carved-out inheriting child ops | user catch | **addressed** — `resource-budget` by invocation class; child carve-out deleted; multi-op names no descendant |
| High | AP-142 technique-references-technique | `scatter-gather` Protocol cites harness-compat/variable-binding; `independent-lenses` Protocol cites gitnexus-operations; scope Rules naming peer owners | Technique→technique refs on PR surface | user catch (generalised hard rule) | **addressed on PR surface** — harness/tool prose; graph tools unnamed; bare scope; canon AP-142. Corpus-wide debt out of scope |

**Changed files (redesign + AP-68 scrub):**

| Path | Role |
|------|------|
| `meta/techniques/unit-fan-out.md` | strategy — invocation-spec units; gather → `unit_results`; no activity actors |
| `meta/techniques/cargo-operations/run-suite.md` | pure combine; `combine-only` rule |
| `meta/techniques/cargo-operations/TECHNIQUE.md` | multi-op: use unit-fan-out then combine op (no “binding activity”) |
| `meta/techniques/scatter-gather.md` | process units → unit-fan-out peer contract |
| `meta/techniques/README.md` / `meta/README.md` | indexes |

### workflow-design (co-edit)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| High | AP-140 Fix steered into AP-114 | AP-140 Fix text | “Apply the unit-kind-correct contract” from technique façade | redesign | **addressed** — Fix: bind in activity structure; cross-link AP-114 |
| Medium | AP-68 Detect under-specified | AP-68 Detect/examples | “binding activity” euphemism not listed; Fix elsewhere taught the phrase into techniques | user catch | **addressed** — Detect includes binding activity / activity-owned; §20 activity-blind; AP-140 Fix no longer names binding activity in technique-facing text |
| Medium | AP-141 new | anti-patterns + §27 | container must not name inheriting descendants | user catch | **addressed** — AP-141 + §27 |
| — | AP-114 exemplar | AP-114 title line | added `run-suite: Apply unit-fan-out` | redesign | clean (exemplar of smell) |

**Changed files:** `design-principles.md` §20 + §27 + §33, `anti-patterns.md` AP-68/AP-140/AP-141, `resources/README.md`.

### prism (co-edit)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| High | AP-114 | `independent-lenses.md` Apply scatter-gather | Protocol technique→technique Apply | false-negative | **addressed** — atomic lens work; peer fan-out contracts named without activity actors |
| High | AP-68 | `independent-lenses.md` Capability/Protocol/Rules | “binding activity owns parallel” | user catch | **addressed** — activity-blind |

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
