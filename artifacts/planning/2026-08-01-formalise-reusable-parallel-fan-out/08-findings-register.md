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
| — | AP-142 technique-references-technique (retired) | generalised hard ban on any technique→technique cite | User later reversed: cites remain permissible; server parser will resolve them | design reversal | **retired** — AP-142 deleted; peer cites restored on PR surface; activity-layer dispatch preference kept (AP-114 / AP-140 / AP-143) |

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
| — | — | `activities/11-validate.yaml` | process-unit pattern spine + pure `run-suite`; step gates on inline `when:` | redesign + #383 dialect | clean |
| Medium | Divergent OR keep-sites vs #383 | `14-complete` create-adr / update-adr (and peer keep-sites on co-edit surfaces) | Fan-out branch still carried structured OR trees while [PR #383](https://github.com/m2ux/workflow-server/pull/383) migrated them to parenthesized `when:` | resume accounting for #383 | **addressed** — merge workflows pin `d891ed73` onto `workflow/meta-formalise-reusable-parallel-fan-out` |
| High | Stale principle anchors after § renumber | `yaml-authoring`, `readme-authoring`, `audit-rule-enforcement`, `workflow-authoring/.../readme-authoring` | `check-resource-anchors` failed on `#9-encode…` / `#11-complete…` / `#17-document…` after inserting §2 | quality-review guards | **addressed** — anchors → `#10` / `#12` / `#18` |
| High | AP-15 / AP-26 / AP-28 procedure in activity prose | `06-process-unit-fan-out.yaml` activity + set `description`s; `11-validate.yaml` set `description`s | Activity/set descriptions held seed→run→wait-all→gather HOW and concurrency policy essays | user catch after false-green quality-review | **addressed** — WHAT-only one-liners; structure owns procedure |

### Cross-cutting (PR #383)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| Medium | Host guard dependency | `check:when` + shared evaluator live on server PR, not this orphan branch | Definition branch alone cannot run the new guard until host has the module | resume | **known** — validate/commit on host after #383 or against the #383 worktree |
| Low | Loop gates remain structured | `11-validate` `fix-revalidate-cycle` | Schema loop field is `condition:`; not a step `when:` | #383 scope | **known** — correct dialect split |

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

All run with `--root` = edit worktree (resume quality-review). **TOTAL_FAILS=0** after anchor retarget.

| Guard | Result |
|-------|--------|
| validate-workflow-yaml (meta, work-package, workflow-design, prism) | PASS |
| validate-activities | PASS (112) |
| check-all-refs | PASS |
| check-binding-fidelity | PASS (77 triaged debt) |
| check-resource-anchors | PASS (was 4 fail → fixed) |
| check-variable-model … check-stealth-isolation | PASS |
| check-when-expression (via [PR #383](https://github.com/m2ux/workflow-server/pull/383) tree + `WORKFLOWS_DIR`=edit surface) | PASS |

## Sources

| Label | Path |
|-------|------|
| Change brief | [01-change-brief.md](01-change-brief.md) |
| AP-114 redesign / false-negative | [10-ap114-redesign-note.md](10-ap114-redesign-note.md) |
| Scope manifest | [06-scope-manifest.md](06-scope-manifest.md) |
