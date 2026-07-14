# midnight-system-review — Design Session

**Created:** 2026-07-14  
**Mode:** Create  
**Status:** Planning

---

## 🎯 Executive Summary

This session creates `midnight-system-review`, a new workflow that recreates the Jina simulation bot's system-level review methodology as a native workflow-server workflow: given a midnight-node change-set, it derives investigation areas from the changed surface, runs bounded evidence-gathering probes per area (source tracing, code-graph queries, metadata comparisons, SCALE/size probes), adjudicates evidence-graded findings, and renders a merge-readiness verdict with per-area accounting. The design is grounded in the review evidence from midnight-node PR #1849 (three Jina review runs; the strict run investigated 10 areas over 33 tasks and produced 8 findings) and system-under-test insight from the midnight-agent-eng repo.

---

## Design Decisions

Confirmed workflow specification (requirements refinement, all 8 dimensions user-confirmed via delegated checkpoints; assumptions in [03-assumptions-log.md](03-assumptions-log.md)):

- **Activity spine:** `scope-intake → area-derivation → evidence-probes → finding-adjudication → verdict-and-report` (+ conditional `publish-review` tail); verdict-review checkpoint carries a `revise-investigation` rework transition back to `area-derivation`.
- **Checkpoints (4):** `scope-confirmed` (non-blocking, 30s auto-advance), `investigation-plan-approved` (blocking, doWhile amendment), `verdict-review` (blocking, rework option), `publish-decision` (blocking, gated on `has_pr_surface`). Probing and adjudication run checkpoint-free, per Jina autonomy and substrate-audit precedent.
- **Evidence model:** areas derived from change surface × subsystem map; 2–4 bounded probes per area (`probe_budget_per_area = 4`); toolchain degradation is structural (`gitnexus_available`/`cargo_available`/`node_binary_available` gates) with blocked validations recorded, never failing the run.
- **Adjudication:** full grade tuple per finding (anchor, risk/impact, evidence confidence, production likelihood, category, validation mode); accepted-issue rubric at medium/high confidence; verdict 1–5 computed from accepted findings only, per rubric resource.
- **Techniques:** meta `variable-binding` + `scatter-gather` (sequential default) as strategy layers; `gitnexus-operations` for graph probes; `work-package::update-pr::post-review-comment` as publish reuse candidate (signature fit checked at pattern-analysis); six workflow-local activity groups.
- **Variables:** config + boolean gates only (prior-art convention); rich data flows via artifacts (`change-surface.md`, `investigation-plan.md`, `evidence-log.md`, `findings-register.md`, `review-report.md`, `publication-record.md`).
- **Rules:** 9 cross-activity rules, 7 structurally backed (validate actions for grade-tuple completeness and accounting reconciliation, condition gates for plan/publish, fragment reuse via `substrate-node-security-audit::planning-artifacts-gitignored`).

---

## Compliance Findings

*Severity-rated findings from quality review, populated when that activity runs. "No findings" until then.*

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| — | *None yet* | — | — |

---

## Scope Manifest

*Files to create, modify, or remove for this workflow, confirmed during scope-and-draft. Left as placeholder until then.*

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Create, Update | ✅ Complete |
| 04 | Pattern Analysis | Create | ✅ Complete |
| 06 | Scope and Draft | Create, Update | ⬚ Pending |
| 08 | Quality Review | All | ⬚ Pending |
| 09 | Validate and Commit | All | ⬚ Pending |
| 11 | Retrospective | Create, Update | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/midnight-system-review/` |
| Related workflow | [substrate-node-security-audit](../../../../workflows/substrate-node-security-audit/README.md) |
| Source evidence | [midnight-node PR #1849](https://github.com/midnightntwrk/midnight-node/pull/1849) |
| System-under-test reference | `/home/mike1/projects/dev/midnight-agent-eng` |

---

**Status:** Patterns confirmed (adopt-all, 5 justified divergences) — ready for scope and draft
