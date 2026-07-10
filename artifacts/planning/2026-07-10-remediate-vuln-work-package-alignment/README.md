# remediate-vuln — Design Session

**Created:** 2026-07-10
**Mode:** Update (entered via Review → fix-issues)
**Status:** Planning

---

## 🎯 Executive Summary

remediate-vuln (1.1.0) borrows 12 of its 15 activities from work-package, which has moved substantially (now 3.27.0). The review phase found fidelity broken (borrowed step-technique refs unresolvable, validation silently skipped, plan-prepare hard-blocked, ~25 undeclared variables) and non-privacy drift in the three own activities. This update session applies the fixes so remediate-vuln is functionally equivalent to work-package except for privacy-assurance deviations.

---

## Design Decisions

- **`stealth_mode` gate (A-002, user-corrected):** consumer-agnostic boolean in work-package (default false) gating every disclosure-capable step; remediate-vuln seeds it true and retires `is_sec_vuln_mode`.
- **Reuse depth 14/15 (user-directed pivot):** remediate-vuln borrows strategic-review and submit-for-review too; only `start` + `security-setup` stay local. rv's unsigned-commit flow and isolation ops were generalized INTO work-package (strategic-review, manage-git) rather than forked.
- **Start parity is minimal (A-003):** reference resolution (private checkout doubles as reference), project-type detection, signing preflight; no worktree/GitNexus adoption — `worktree_created`/`gitnexus_indexed` seeded false.
- **F1 fixed server-side:** borrowed activities' technique refs resolve against their source workflow (mirrors #166 B10 fragment scoping); content stays convention-clean.
- **Leakage verification:** `check:stealth` guard — static reachability of disclosure constructs under seeded defaults + runtime private-repo probe of push targets (user-requested; runtime approach pending final user confirmation).

---

## Compliance Findings

Full report: [08-compliance-review.md](08-compliance-review.md) — 14 findings.

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| Critical | F1 borrowed step-technique refs unresolvable (~65 bindings) | server loader seam | resolve borrowed activities' techniques against source workflow (mirror #166 B10) |
| Critical | F2 project_type never set → validation skipped | 01-start | bind project-type-detection |
| High | F3 reference_path never set → plan-prepare blocks | 01-start | add reference resolution |
| High | F4 ~25 undeclared variables read by borrowed activities | workflow.yaml | mirror wp declarations |
| Medium | E1 stale strategic-review fork (pre-#192 shape) | 02-strategic-review | mirror wp 12 v2.7.0 |
| Medium | E2 stale review-scope technique (missing #203) | techniques/strategic-review | port authored-surface diff |
| Medium | E3 missing DCO attestation at submit | 03-submit | add dco-provenance::record-attestation |
| Medium | E4 start missing non-privacy wp steps | 01-start | adopt signing preflight etc. |
| Medium | P1 disclosure paths text-only suppressed | borrowed activities | structural gate |
| Medium | P2 is_sec_vuln_mode dead | workflow.yaml / wp | remove or repurpose as disclosure gate |
| Low | L1–L4 hygiene items | various | see report |

---

## Scope Manifest

28 blocks across 3 surfaces — see [06-scope-and-draft.md](06-scope-and-draft.md). Reuse depth (user decision): 14/15 borrowed; remediate-vuln keeps only `start` + `security-setup`. Worktrees: `workflow/remediate-vuln-wp-alignment` (workflows), `feat/borrowed-activity-technique-resolution` (server).

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Update | ✅ Complete ([assumptions-log.md](assumptions-log.md)) |
| 05 | Impact Analysis | Update | ✅ Complete ([05-impact-analysis.md](05-impact-analysis.md)) |
| 06 | Scope and Draft | Update | ✅ Complete ([06-scope-and-draft.md](06-scope-and-draft.md), attested) |
| 08 | Quality Review | All | ✅ Complete (review: [08-compliance-review.md](08-compliance-review.md); update audits: [08-quality-review.md](08-quality-review.md)) |
| 09 | Validate and Commit | All | ◐ In Progress |
| 10 | Post-Update Review | Update | ⬚ Pending |
| 11 | Retrospective | All | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/remediate-vuln/` (→ 2.0.0) |
| Baseline workflow | `workflows/work-package/` (3.27.0 → 3.28.0) |
| Leakage guard | `scripts/check-stealth-isolation.ts` (`npm run check:stealth`) |

---

**Status:** Awaiting pre-commit attestation
