# Ponytail Workflow — Compliance Review

Workflow-design hygiene review of `workflows/ponytail/`. Two Medium findings fixed in this session; three Low findings accepted as intentional or borderline.

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 0 |
| Medium   | 2 |
| Low      | 3 |

## Validation Results

All validators run against `workflows/ponytail/` after the fixes.

| Check | Result |
|-------|--------|
| `validate-workflow-yaml.ts workflows/ponytail` | PASS |
| `validate-activities.ts workflows/ponytail` | PASS |
| `check-all-refs.ts` | PASS (0 unresolved across all workflows) |
| `check:binding` | PASS (40 baselined, 0 new drift) |
| `check:steps` | PASS |
| `check:identifiers` | PASS (0 new bare-word ids) |
| `check:artifacts` | PASS |
| `check:self-input` | PASS |
| `check:activity-tech` | PASS |
| `typecheck` | PASS |

## Findings

### F1 — AP-44 reverse caller-coupling (Medium) — FIXED

`resources/README.md` carried a **"Consumed by"** column mapping each resource to the techniques that consume it, and the top-level `README.md` advertised the catalog as carrying "per-technique consumer mapping." A resource catalog describes what each resource *is*, not who consumes it — the reverse coupling forces a catalog edit on every technique change, and sibling workflows (prism, work-package, meta) carry no such column.

**Fix:** Removed the "Consumed by" column from the resource catalog table (kept Resource / Owns / Anchors), removed the "what each resource owns and which techniques consume it" clause from the intro, dropped the "per-technique consumer mapping" clause from the top-level README resources description, and aligned the file-structure tree comment ("Resource catalog with consumer mapping" → "Resource catalog"). The forward "Cross-Workflow Access" / `get_resource` usage section was left intact (legitimate forward reference per AP-44).

### F2 — AP-27 cross-level rule duplication (Medium) — FIXED

`techniques/ponytail-operations/TECHNIQUE.md` declares the group-base rule `report-only-no-apply`, inherited by every operation in the group and explicitly covering the review, audit, debt-harvest, and gain operations. Three operations *also* declared a redundant per-op `report-only` rule restating the same constraint: `audit-repo.md`, `harvest-debt.md`, `report-gain.md`.

**Fix:** Deleted the per-op `report-only` rule from all three files, relying on the inherited group rule as the single source. For `audit-repo.md` and `harvest-debt.md` the rule was the sole `## Rules` entry, so the empty section was removed; `report-gain.md` retains its `honesty-boundary-on-reporting` rule. The group rule `report-only-no-apply` remains in TECHNIQUE.md as the single source of truth. `review-over-engineering.md` states report-only inline within its protocol (step 2) rather than as a duplicate rule block — left as-is (protocol guidance, not a duplicate rule); no rule added there.

### F3 — Low: intensity-and-scope gate restates the transition

The `intensity-and-scope` checkpoint guidance restates the gated transition condition (`lazy_intensity == ultra OR pass_scope == repo`) that already lives on the activity transition into the repo audit. Mild prose overlap; the restatement aids the user at the decision point. **Accepted** as intentional — the checkpoint is where the user sets the dials, so surfacing the consequence there is useful, not harmful duplication.

### F4 — Low: "Backed by" tails on universal rules

Some rules append a "Backed by …" / resource-anchor tail even where the rule is universal across operations. Borderline: the anchor links are the workflow's single-source discipline (link, don't restate), so the tails are consistent with the linking convention rather than redundant restatement. **Accepted** as borderline/intentional.

### F5 — Low: present-approach not structurally enforced

The "build at the leanest rung for the *present* concrete need, not the imagined future one" stance is expressed in rule prose (`take-higher-rung`, `deletion-over-addition`, `no-scaffolding-for-later`) rather than enforced by a structural gate. There is no clean structural mechanism to enforce a judgment-based discipline, and the rules already state it clearly. **Accepted** as intentional — prose is the right altitude for this guidance.

## Disposition

- **F1 (AP-44)** and **F2 (AP-27)** were **FIXED** in this session.
- **F3, F4, F5** were **accepted** as intentional or borderline; no change made.
- All validators PASS post-fix.
