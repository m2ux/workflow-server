# midnight-system-review — Design Session

**Created:** 2026-07-14  
**Mode:** Create  
**Status:** Planning

---

## 🎯 Executive Summary

This session creates `midnight-system-review`, a new workflow that recreates the Jina simulation bot's system-level review methodology as a native workflow-server workflow: given a midnight-node change-set, it derives investigation areas from the changed surface, runs bounded evidence-gathering probes per area (source tracing, code-graph queries, metadata comparisons, SCALE/size probes), adjudicates evidence-graded findings, and renders a merge-readiness verdict with per-area accounting. The design is grounded in the review evidence from midnight-node PR #1849 (three Jina review runs; the strict run investigated 10 areas over 33 tasks and produced 8 findings) and system-under-test insight from the midnight-agent-eng repo.

---

## Design Decisions

*Key design decisions and their rationale, captured as the session progresses (activity sequencing, checkpoint necessity, technique bindings, rule enforcement). Left as placeholder until requirements refinement populates it.*

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
| 03 | Requirements Refinement | Create, Update | ⬚ Pending |
| 04 | Pattern Analysis | Create | ⬚ Pending |
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

**Status:** Ready for requirements refinement
