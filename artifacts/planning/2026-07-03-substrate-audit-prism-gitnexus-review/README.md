# substrate-node-security-audit — Design Session

**Created:** 2026-07-03
**Mode:** Update (review → remediation)
**Status:** Complete

---

## 🎯 Executive Summary

Focused review + remediation of `substrate-node-security-audit` (v4.17.0) against three goals: (1) effective prism-technique reuse / no content duplication, (2) effective use of gitnexus for codebase scan/analysis, (3) gitnexus preferred over grep where appropriate. The review found goal 1 a **pass** (no material prism duplication; no rebuild warranted) and surfaced **8 findings** driving gitnexus adoption for goals 2–3. All fixes are reuse-first (bind the existing `gitnexus-operations` meta group) and non-destructive (gated on `gitnexus_available`; grep/manual retained as fallback). Separate from the completed 2026-07-02 compliance session (PR #159, merged).

---

## Design Decisions

- **Goal 1 — no rebuild on prism.** `substrate-node-security-audit` and `prism-audit` are deliberately different-philosophy audit workflows (bespoke deep multi-agent review vs. prompt-generator over a lens engine). Technique overlaps are structural/orchestration, not content. Rebuilding on prism would destroy the deep-review model. Decision: document the divergence, reuse nothing wholesale from prism.
- **Reuse-first (AP-64):** every codebase-analysis need binds an existing `gitnexus-operations` op — author no new capability. `prism-audit` is the working adoption precedent.
- **Non-destructive (Principle 12):** gitnexus paths gate on `gitnexus_available`; the existing grep/manual method stays as the fallback branch. The deliberate "read full function bodies" + >200-line coverage-gate philosophy is preserved — gitnexus augments enumeration/relationships, not comprehension.
- **grep boundary:** pattern-*presence* sweeps (unwrap/panic/unsafe/RNG/casts/feature-gates) stay grep; *structural/relational* analysis (enumeration, call graph, reachability, cross-function) routes to gitnexus, per the group's own `query-not-grep` / `must-use-operations` rules.
- Version bump: minor (4.17.0 → 4.18.0) — additive, gated, no schema/contract break, no activity add/remove/rename.

---

## Compliance Findings

Authoritative source: [08-quality-review.md](08-quality-review.md).

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| High | F2 — no gitnexus index-build / availability gate | `activities/01-scope-setup.yaml`; `techniques/setup-audit-target.md` | Add `gitnexus-operations::analyze` + `verify-index`; set `gitnexus_available` (precedent: prism-audit 00-scope-definition) |
| High | F3 — reconnaissance & architecture mapping are hand-built | `techniques/map-codebase.md`, `analyze-architecture.md`; `activities/02-reconnaissance.yaml`, `13/16-sub-*` | gitnexus-enrich: `query`/`read-cluster`/`diagram-source-select`/`context`/`cypher`/`impact`, gated on availability |
| High | F6 — structural mechanical checks verified by manual tracing | `resources/static-analysis-patterns.md` (Ch1/3/5/15/16/17/29/31/32); `techniques/scan-storage-lifecycle.md` | Route structural verification through `context`/`impact`/`cypher`; grep stays for lead generation |
| Medium | F4 — function-registry enumeration is manual | `techniques/build-function-registry.md`; `apply-checklist.md:56` | Seed registry from symbol graph; replace `grep 'fn '` count with exact graph count |
| Medium | F5 — coverage/dispatch reconciliation is manual | `techniques/verify-sub-agent-output.md`; `resources/target-profile.md`; `workflow.yaml:21` | Use gitnexus inventory as coverage denominator; `context`/`impact` for reachability |
| Medium | F7 — grep↔gitnexus boundary uncodified | `resources/static-analysis-patterns.md`; `techniques/search-pattern-catalog.md` | Annotate per-entry execution class (PRESENCE=grep / STRUCTURAL=gitnexus) + boundary preamble |
| Low | F1 — prism-audit divergence undocumented | `README.md` | One-line "Relationship to prism-audit" note (no rebuild) |
| Low | F8 — preserve full-file-read philosophy | `resources/audit-prompt-template.md` | One stance line: structure→graph, comprehension→reads, presence→grep |

---

## Scope Manifest

*Confirmed during scope-and-draft — placeholder until then.*

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 08 | Quality Review (review pass) | All | ✅ Complete |
| 03 | Requirements Refinement | Update | ✅ Complete |
| 05 | Impact Analysis | Update | ✅ Complete |
| 06 | Scope and Draft | Update | ✅ Complete |
| 08 | Quality Review (drafting pass) | All | ✅ Complete |
| 09 | Validate and Commit | All | ✅ Complete |
| 10 | Post-Update Review | Update | ✅ Complete |
| 11 | Retrospective | All | ✅ Complete |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/substrate-node-security-audit/` (v4.17.0 @ workflows tip `e802ece2`) |
| Compliance report | [08-quality-review.md](08-quality-review.md) |
| Review-pass intake | [01-intake-and-context.md](01-intake-and-context.md) |
| gitnexus-operations (reuse target) | `workflows/meta/techniques/gitnexus-operations/` |
| prism-audit (adoption precedent) | `workflows/prism-audit/` |

---

**Status:** Complete. substrate-node-security-audit v4.18.0 committed (`53a35cc1` + fix `b2458d68`) on `workflow/substrate-audit-gitnexus`, draft PR [#161](https://github.com/m2ux/workflow-server/pull/161). Goal 1 = documented pass (no rebuild); goals 2–3 = reuse-first, non-destructive gitnexus adoption. Independent post-update review CLEAN (3 minor findings fixed). Close-out in [COMPLETE.md](COMPLETE.md). Issue #160 follow-ups deferred to a new chat.
