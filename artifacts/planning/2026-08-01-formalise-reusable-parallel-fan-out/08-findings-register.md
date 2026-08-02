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

> **Remediation rounds:** (1) `pass-orchestration-in-technique` false negative — see [10-ap114-redesign-note.md](10-ap114-redesign-note.md). (2) `technique-stage-agnostic`: redesign technique prose used “binding activity owns…” as composition instruction — techniques are **activity-blind**; Detect tightened; redesign surface scrubbed.

## Findings

### meta (primary bag target)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| High | `pass-orchestration-in-technique` | `cargo-operations/run-suite.md` Protocol `Apply [unit-fan-out]`; cargo `TECHNIQUE.md` multi-op rule | Protocol Apply of strategy technique for suite fan-out | quality-review false-negative; redesign | **addressed** — run-suite is pure combine over `unit_results`; validate activity steps bind process-unit spine then run-suite |
| High | `technique-stage-agnostic` | `run-suite.md` rule `activity-owns-fan-out`; `unit-fan-out.md` Protocol/Rules naming binding activity; cargo `TECHNIQUE.md`; `scatter-gather.md` | Technique prose named activity graph actors / sibling-step ownership | user catch after pass-orchestration redesign | **addressed** — activity-blind I/O and peer-contract cites only; rule renamed `combine-only` |
| Medium | `container-names-inheriting-ops` | cargo `TECHNIQUE.md` `fmt-uses-only-nice`; multi-op rule citing `run-suite` | Group contract named/carved-out inheriting child ops | user catch | **addressed** — `resource-budget` by invocation class; child carve-out deleted; multi-op names no descendant |
| — | `technique-references-technique` (retired) | generalised hard ban on any technique→technique cite | User later reversed: cites remain permissible; server parser will resolve them | design reversal | **retired** — entry removed; catalogue renumbered; peer cites restored; activity-layer dispatch preference kept (`pass-orchestration-in-technique` / `prose-based-dispatch-patterns` / `coordination-in-technique`) |

**Changed files (redesign + `technique-stage-agnostic` scrub):**

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
| High | `prose-based-dispatch-patterns` Fix steered into `pass-orchestration-in-technique` | Fix text | “Apply the unit-kind-correct contract” from technique façade | redesign | **addressed** — Fix: bind in activity structure; cross-link `pass-orchestration-in-technique` |
| Medium | `technique-stage-agnostic` Detect under-specified | Detect/examples | “binding activity” euphemism not listed; Fix elsewhere taught the phrase into techniques | user catch | **addressed** — Detect includes binding activity / activity-owned; Keep Orchestration activity-blind; dispatch Fix no longer names binding activity in technique-facing text |
| Medium | `container-names-inheriting-ops` new | anti-patterns + State Contract Contribution | container must not name inheriting descendants | user catch | **addressed** — entry + principle |
| — | `pass-orchestration-in-technique` exemplar | title line | added `run-suite: Apply unit-fan-out` | redesign | clean (exemplar of smell) |

**Changed files:** `design-principles.md` orchestration / atomic-technique / fan-out principles, `anti-patterns.md` (`technique-stage-agnostic`, `prose-based-dispatch-patterns`, `container-names-inheriting-ops`), `resources/README.md`.

### prism (co-edit)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| High | `pass-orchestration-in-technique` | `independent-lenses.md` Apply scatter-gather | Protocol technique→technique Apply | false-negative | **addressed** — atomic lens work; peer fan-out contracts named without activity actors |
| High | `technique-stage-agnostic` | `independent-lenses.md` Capability/Protocol/Rules | “binding activity owns parallel” | user catch | **addressed** — activity-blind |

### work-package (co-edit — scope expansion)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| — | — | `activities/11-validate.yaml` | process-unit pattern spine + pure `run-suite`; step gates on inline `when:` | redesign + #383 dialect | clean |
| Medium | Divergent OR keep-sites vs #383 | `14-complete` create-adr / update-adr (and peer keep-sites on co-edit surfaces) | Fan-out branch still carried structured OR trees while [PR #383](https://github.com/m2ux/workflow-server/pull/383) migrated them to parenthesized `when:` | resume accounting for #383 | **addressed** — merge workflows pin `d891ed73` onto `workflow/meta-formalise-reusable-parallel-fan-out` |
| High | Stale principle anchors after § renumber | `yaml-authoring`, `readme-authoring`, `audit-rule-enforcement`, `workflow-authoring/.../readme-authoring` | `check-resource-anchors` failed on `#9-encode…` / `#11-complete…` / `#17-document…` after inserting §2 | quality-review guards | **addressed** — anchors → `#10` / `#12` / `#18` |
| High | `procedure-in-protocol` / `no-rationale-in-description` / `no-sequence-in-description` procedure in activity prose | `06-process-unit-fan-out.yaml` activity + set `description`s; `11-validate.yaml` set `description`s | Activity/set descriptions held seed→run→wait-all→gather HOW and concurrency policy essays | user catch after false-green quality-review | **addressed** — WHAT-only one-liners; structure owns procedure |

### Cross-cutting (PR #383)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| Medium | Host guard dependency | `check:when` + shared evaluator live on server PR, not this orphan branch | Definition branch alone cannot run the new guard until host has the module | resume | **known** — validate/commit on host after #383 or against the #383 worktree |
| Low | Loop gates remain structured | `11-validate` `fix-revalidate-cycle` | Schema loop field is `condition:`; not a step `when:` | #383 scope | **known** — correct dialect split |

## Coverage ledger (redesign Detect)

| Check | Result |
|-------|--------|
| Grep Protocol `Apply [` on changed techniques | **zero** work-invoke hits (canon exemplars only) |
| `pass-orchestration-in-technique` Detect on run-suite / independent-lenses / cargo TECHNIQUE | clean after redesign |
| Atomic Techniques / Bind Sibling structural evidence | validate activity step graph; prism structural-pass already declares scatter-gather |
| Definition guards `--root` worktree | **19/19 PASS** |

## Audit false-negative retrospective

Full write-up: [10-ap114-redesign-note.md](10-ap114-redesign-note.md).

Root causes in brief:

1. Protocol family marked “walked” without per-entry Detect.
2. `Apply unit-fan-out` / `Apply scatter-gather` treated as formalisation success, not `pass-orchestration-in-technique` Detect.
3. `prose-based-dispatch-patterns` Fix = Protocol Apply (itself `pass-orchestration-in-technique`).
4. Atomic Techniques principle walked without activity-bind structural evidence.
5. No automated guard for `pass-orchestration-in-technique` — agent narrative optimized for “kill free prose.”
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
| `pass-orchestration-in-technique` redesign / false-negative | [10-ap114-redesign-note.md](10-ap114-redesign-note.md) |
| Scope manifest | [06-scope-manifest.md](06-scope-manifest.md) |
