# Scope Manifest — Requirements-Refinement Canon Conformance

**Target:** `requirements-refinement` v1.1.0 → v1.2.0 · **Mode:** update
**Basis:** [design specification](03-design-specification.md) · [impact analysis](05-impact-analysis.md)
**Worktree:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-27-requirements-refinement-design-fixes/` ✅ on `workflow/requirements-refinement` · folder layout unchanged

Sixteen files are modified; none is created or deleted. Intentional removals: **15** inventoried ([impact §3](05-impact-analysis.md#3-removals-inventory)) — rows 1–9 applied this pass, rows 10–15 held for Gate 2.

`file_count` = **16**

---

## File manifest

| # | Path (under `requirements-refinement/`) | Type | Action | One-line change |
|---|----------------------------------------|------|--------|-----------------|
| 1 | `workflow.yaml` | workflow | modify | Drops the `max_correction_iterations` declaration; version to 1.2.0 |
| 2 | `activities/01-intake-and-analyze.yaml` | activity | modify | Both gate messages become linked statements; two announcements link path outputs; the transition arm is left at baseline (row 13 is Gate 2) |
| 3 | `activities/03-update-specification.yaml` | activity | modify | Announcement states the pass and links `{working_specification_path}` |
| 4 | `activities/04-validate-specification.yaml` | activity | modify | Gains the announcement for the validation report; the `correction_iteration < 3` literal becomes the cap's sole home |
| 5 | `activities/05-finalize-specification.yaml` | activity | modify | Gate message becomes a linked statement; announcement links both staged artifacts |
| 6 | `activities/06-report-failure.yaml` | activity | modify | Gate message becomes a linked statement; announcement links the failure report |
| 7 | `activities/README.md` | readme | modify | Produces column names the artifacts by identifier rather than an unprefixed literal filename |
| 8 | `techniques/TECHNIQUE.md` | technique | modify | Drops the shared `max_correction_iterations` input and its default |
| 9 | `techniques/intake-sources.md` | technique | modify | Declares `intake_record_path` |
| 10 | `techniques/analyze-source.md` | technique | modify | Declares `requirements_analysis_path` |
| 11 | `techniques/update-specification.md` | technique | modify | Declares `correction_iteration` and `working_specification_path`; loop bookkeeping leaves the Protocol; gains `## Rules` |
| 12 | `techniques/validate-specification.md` | technique | modify | Four verdict Output descriptions state what each value is; declares `validation_report_path` |
| 13 | `techniques/finalize-specification.md` | technique | modify | Presentation phase leaves the Protocol; declares `final_specification_path` and `change_summary_path` |
| 14 | `techniques/report-failure.md` | technique | modify | Presentation phase leaves the Protocol; drops the removed-variable read; declares `failure_report_path` |
| 15 | `techniques/README.md` | readme | modify | Inherited-input list drops the removed variable |
| 16 | `README.md` | readme | modify | Cap stated as its literal; artifact-location claim dropped; version banner to 1.2.0 |

**Path-output ids pinned here** so tier 2 messages and tier 3 contracts agree: `intake_record_path`, `requirements_analysis_path`, `working_specification_path`, `validation_report_path`, `final_specification_path`, `change_summary_path`, `failure_report_path`.

**Out of scope this pass:**

- The five resource files ([impact §1](05-impact-analysis.md#1-impact-classification) unaffected) — no change goal reaches template content.
- Removal rows 10–15 and the four effect-less gate options they govern — batched for Gate 2 under A-3, A-5, and A-7 ([assumptions log](03-assumptions-log.md#open-assumptions)). This includes G3 on `01`'s transition arm: row 13 is a Gate 2 row, and dropping the `condition` there would strand `analysis_confirmed` as a fifth unread variable, so the arm stays at baseline this pass ([follow-ups](03-follow-ups.md), F-3).
- Activity-file renumbering and validation-rubric criteria, per the specification's [out-of-scope boundary](03-design-specification.md#purpose).

---

## Structural design

```
requirements-refinement/   # unchanged
├── workflow.yaml
├── activities/            # 01, 03, 04, 05, 06 + README
├── techniques/            # TECHNIQUE.md + 6 leaves + README
├── resources/             # 4 templates + README (untouched)
└── README.md
```

**Flow:** Topology is unchanged — five activities, five arms, the bounded correction cycle intact. `01`'s single arm keeps both the `condition` and `isDefault: true` it carried at baseline; shedding the condition is a Gate 2 decision, not this pass (see the out-of-scope note above).

| Pattern | This change |
|---------|-------------|
| Checkpoint message is a statement; the decision lives in `options[]` | All four gate messages rewritten |
| Artifact announced as `[label]({path_variable})`, never a hard-coded `NN-` prefix | Seven path outputs declared; six announcements plus four gate messages interpolate them across ten sites |
| A cap is enforced by the construct the engine evaluates | Cap authoritative as the `< 3` transition literal in `04`; the shadow variable removed |
| A counter advances as a declared technique output | `correction_iteration` declared on `update-specification` |
| Techniques are session-blind; activities own presentation | Two "Present …" Protocol phases removed |
| Terminal activities omit `transitions[]` | `05` and `06` unchanged (A-10) |

---

## Drafting order

1. **`workflow.yaml`** — the variable set contracts first, so every later file is written against the final declaration list.
2. **Activities (01, 03, 04, 05, 06)** — gate shapes, routing, and announcements; each interpolates a path id pinned above.
3. **Techniques (`TECHNIQUE.md`, then the six leaves)** — the contracts the activities bind, including the path outputs the tier-2 messages consume.
4. **READMEs (root, activities, techniques)** — documentation is corrected last, once the definition it describes is settled.

**Rationale:** Declarations before their readers, and prose describing the definition after the definition is final.
