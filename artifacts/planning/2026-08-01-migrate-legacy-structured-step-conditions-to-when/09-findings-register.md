# Findings Register — corpus-when-migration

**Date:** 2026-08-01 · **Mode:** Update
**Base ref:** `e2e70e68` · **Targets:** work-package · workflow-design · prism · meta · prism-audit · substrate-node-security-audit

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | 0 | 0 |
| High     | 0 | 0 |
| Medium   | 0 | 0 |
| Low      | 0 | 0 |

## Findings

### work-package v3.41.0

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| — | — | — | No audit findings on this target | quality-review | clean |

Consumer surface: remediate-vuln borrows 11 activity files — paths/ids unchanged; gate dialect only. Fail count: 0. Migration: +~65 `when`; residual non-ckpt condition=6 kept (exists/OR/NOT). Guards: all definition guards PASS against worktree `--root`.

### workflow-design v1.32.0

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| — | — | — | No audit findings on this target | quality-review | clean |

Consumer surface: empty. Fail count: 0. Migration: +~65 `when` sites; residual OR-shaped step gates migrated after [PR #383](https://github.com/m2ux/workflow-server/pull/383). Guards: all definition guards PASS against worktree `--root`.

### prism v2.4.0

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| — | — | — | No audit findings on this target | quality-review | clean |

Consumer surface: prism-update prose path refs — no break risk. Fail count: 0. Migration: +8 `when`; residual OR on `run-structural` migrated after [PR #383](https://github.com/m2ux/workflow-server/pull/383). Guards: all definition guards PASS against worktree `--root`.

### meta v5.15.0

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| — | — | — | No audit findings on this target | quality-review | clean |

Consumer surface: workflow-design resource pattern citations — paths stable. Fail count: 0. Migration: +3 `when`; `00-discover-session` kept exists-shaped (no edit); patterns/03 keeps loop continuation condition. Guards: all definition guards PASS against worktree `--root`.

### prism-audit v1.3.0

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| — | — | — | No audit findings on this target | quality-review | clean |

Consumer surface: empty. Fail count: 0. Migration: +1 `when`. Guards: all definition guards PASS against worktree `--root`.

### substrate-node-security-audit v4.20.0

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| — | — | — | No audit findings on this target | quality-review | clean |

Consumer surface: empty. Fail count: 0. Migration: +1 compound `when` with `&&` (precedented). Guards: all definition guards PASS against worktree `--root`.

## Known

Binding-fidelity triage keys for in-scope targets (all `harmless`); no prior findings-register rows accepted as open debt. Detail: [08-quality-review-register-sections.json](08-quality-review-register-sections.json) `known_finding_keys` (75 entries).

| Class | Check | Count | Verdict |
|-------|-------|------:|---------|
| binding-fidelity-triage | read-resolution / dead-output / orphan-input | 75 | harmless |

## Sources

| Label | Path |
|-------|------|
| Change brief | [01-change-brief.md](01-change-brief.md) |
| Impact analysis | [01-impact-analysis.md](01-impact-analysis.md) |
| Scope manifest | [06-scope-manifest.md](06-scope-manifest.md) |
| Migration register | [06-migration-register.md](06-migration-register.md) |
| Quality-review register sections | [08-quality-review-register-sections.json](08-quality-review-register-sections.json) |
