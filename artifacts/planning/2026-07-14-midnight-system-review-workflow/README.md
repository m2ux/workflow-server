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

34 files, all **create** (create mode; the RR-15 fragment is consumed by qualified cross-workflow ref, so no existing workflow is modified). Drafting root: `/home/mike1/projects/work/workflows/2026-07-14-midnight-system-review/midnight-system-review/` (dedicated worktree, branch `workflow/midnight-system-review`).

| # | Path (relative to `midnight-system-review/`) | Action | Type | Description |
|---|---|---|---|---|
| 1 | `workflow.yaml` | create | workflow | Root definition: metadata, 12 variables (6 config + 6 gates), 9 sectioned rules + universal fragment ref, workflow-level `variable-binding`, `initialActivity: scope-intake` |
| 2 | `activities/01-scope-intake.yaml` | create | activity | Resolve three-dot change surface (emits `pr_number`, sets `has_pr_surface`), toolchain-gate probes, `scope-confirmed` non-blocking checkpoint; `change-surface.md` |
| 3 | `activities/02-area-derivation.yaml` | create | activity | Derive investigation areas from change surface × subsystem map; `investigation-plan-approved` blocking doWhile amendment loop; `investigation-plan.md` |
| 4 | `activities/03-evidence-probes.yaml` | create | activity | Sequential scatter-gather: forEach over `investigation_areas` bounded by `probe_budget_per_area`, combine via `consolidate-evidence`; `evidence-log.md` |
| 5 | `activities/04-finding-adjudication.yaml` | create | activity | Grade candidates per grading rubric (full tuple), accepted-issue threshold; grade-tuple completeness `validate` gate; `findings-register.md` |
| 6 | `activities/05-verdict-and-report.yaml` | create | activity | Verdict 1–5 from accepted findings, accounting-reconciliation `validate`, `verdict-review` blocking checkpoint (rework → `area-derivation`), gated `publish-decision`; conditional transition to `publish-review`; `review-report.md` |
| 7 | `activities/06-publish-review.yaml` | create | activity | Post review via `work-package::update-pr::post-review-comment` (explicit `review_type`); `publication-record.md` |
| 8 | `techniques/TECHNIQUE.md` | create | technique | Workflow base contract: shared `planning_folder_path` + `target_repo_path` inputs, workflow-wide rules |
| 9 | `techniques/scope-intake/TECHNIQUE.md` | create | technique | Group contract for scope-intake ops |
| 10 | `techniques/scope-intake/resolve-change-surface.md` | create | technique | Authoritative three-dot change surface from PR ref/base ref; emits `pr_number`, `has_pr_surface`, change-surface artifact |
| 11 | `techniques/scope-intake/detect-toolchain.md` | create | technique | Probe gitnexus / cargo / node binary availability; gate flips via post-probe `set` idiom (S5) |
| 12 | `techniques/area-derivation/TECHNIQUE.md` | create | technique | Group contract for area-derivation ops |
| 13 | `techniques/area-derivation/derive-areas.md` | create | technique | Map changed surface onto subsystem-map areas; emits `investigation_areas`; writes investigation plan |
| 14 | `techniques/area-derivation/amend-plan.md` | create | technique | `when`-gated plan amendment inside the approval doWhile loop |
| 15 | `techniques/evidence-probes/TECHNIQUE.md` | create | technique | Group contract for evidence-probes ops |
| 16 | `techniques/evidence-probes/probe-area.md` | create | technique | Per-area bounded probes (≤ `probe_budget_per_area`) from probe catalog, graceful toolchain degradation; per-area evidence scalar |
| 17 | `techniques/evidence-probes/consolidate-evidence.md` | create | technique | Combine op: gather per-area evidence into `evidence-log.md` with per-area accounting |
| 18 | `techniques/finding-adjudication/TECHNIQUE.md` | create | technique | Group contract for finding-adjudication ops |
| 19 | `techniques/finding-adjudication/grade-findings.md` | create | technique | Assign full grade tuple per candidate (anchor, risk/impact, evidence confidence, production likelihood, category, validation mode) |
| 20 | `techniques/finding-adjudication/register-findings.md` | create | technique | Apply accepted-issue threshold (medium/high confidence), disposition each candidate, write `findings-register.md` |
| 21 | `techniques/verdict-and-report/TECHNIQUE.md` | create | technique | Group contract for verdict-and-report ops |
| 22 | `techniques/verdict-and-report/compute-verdict.md` | create | technique | Compute 1–5 verdict from accepted findings per verdict rubric; emits `review_type` |
| 23 | `techniques/verdict-and-report/render-review.md` | create | technique | Render `review-report.md` per review format; canonical `review_summary` output (RR-7 condition 1) |
| 24 | `techniques/publish-review/TECHNIQUE.md` | create | technique | Group contract for publish-review op |
| 25 | `techniques/publish-review/record-publication.md` | create | technique | Record `review_posted` outcome in `publication-record.md` |
| 26 | `resources/subsystem-map.md` | create | resource | midnight-node subsystem topology snapshot (midnight-agent-eng insight; optional `insight_repo_path` enrichment, RR-13) |
| 27 | `resources/probe-catalog.md` | create | resource | Bounded probe classes grounded in Jina evidence: source tracing, code-graph queries, metadata comparison, SCALE/size probes |
| 28 | `resources/grading-rubric.md` | create | resource | Grade-tuple dimension definitions + accepted-issue threshold calibration from PR #1849 findings |
| 29 | `resources/verdict-rubric.md` | create | resource | 1–5 merge-readiness scale (anchors: 8-accepted → 1/5, zero-accepted+observation → 5/5) + verdict→`review_type` mapping |
| 30 | `resources/review-format.md` | create | resource | Posted `review_summary` structure incl. Review Details per-area task/issue accounting |
| 31 | `README.md` | create | readme | Prism-style root README: overview, flow, activities, techniques, resources, file structure |
| 32 | `activities/README.md` | create | readme | Activity index (prism style) |
| 33 | `techniques/README.md` | create | readme | Technique group index (prism style) |
| 34 | `resources/README.md` | create | readme | Resource index (prism style) |

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Create, Update | ✅ Complete |
| 04 | Pattern Analysis | Create | ✅ Complete |
| 06 | Scope and Draft | Create, Update | ✅ Complete |
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

**Status:** Draft complete and attested — 34 files drafted and schema-valid in worktree `workflow/midnight-system-review` — ready for quality review
