# Implementation Analysis

> **Date**: 2026-03-13
> **Work Package**: #53 — Import New Prism Families

## Current State

### File Inventory

| Category | Count | Files | Total Lines |
|----------|-------|-------|-------------|
| Workflow definition | 1 | workflow.toon | 75 |
| Activities | 5 | 00-select-mode through 04-deliver-result | 292 |
| Skills | 5 | 00-structural-analysis through 04-orchestrate-prism | 566 |
| Resources | 12 + README | 00-l12-structural through 11-contract | 92 + 104 |
| **Total** | **24 files** | | **933 TOON + 196 resource** |

### Resource Format Baseline

Existing resources have **no YAML front matter**:

| Resources | Format | Lines per File |
|-----------|--------|----------------|
| 00 (L12 structural) | Markdown heading + single paragraph | 3 |
| 01-02 (adversarial, synthesis) | Multi-section markdown | 19-21 |
| 03-05 (general pipeline) | Same structure as 00-02 | 3-21 |
| 06-11 (portfolio lenses) | **Raw prompt text — single line, no headings** | 1 |

Upstream source files all include YAML front matter (calibration_date, model_versions, quality_baseline, notes) followed by the prompt text. New resources (12-32) will include front matter; existing resources (00-11) will not be modified.

### Skill Resource Declaration Baseline

Each skill declares which resources it uses:

| Skill | Resources Declared | Coverage |
|-------|-------------------|----------|
| 00-structural-analysis | `["00"]` | L12 code only |
| 01-full-prism | `["00","01","02","03","04","05"]` | L12 code + general pipeline |
| 02-portfolio-analysis | `["06","07","08","09","10","11"]` | 6 portfolio lenses |
| 03-plan-analysis | `["00"-"11"]` (all 12) | Complete current catalog |
| 04-orchestrate-prism | None declared (references indices in protocol) | Implicit via protocol text |

### Pipeline Mode Baseline

`pipeline_mode` is referenced **38 times** across 10 files. Current values: `single`, `full-prism`, `portfolio`.

| File | References | Context |
|------|-----------|---------|
| workflow.toon | 1 | Variable definition (description) |
| 00-select-mode.toon | 7 | Checkpoint options, transitions |
| 01-structural-pass.toon | 7 | Conditional steps, transitions |
| 02-adversarial-pass.toon | 5 | Loop conditions (`== "full-prism"`) |
| 03-synthesis-pass.toon | 5 | Loop conditions (`== "full-prism"`) |
| 04-deliver-result.toon | 2 | Artifact selection |
| 03-plan-analysis.toon | 4 | Mode recommendation |
| 04-orchestrate-prism.toon | 4 | Dispatch routing |
| README.md (workflow) | 1 | Mode listing |
| skills/README.md | 2 | Skill descriptions |

### Goal-Mapping Matrix Baseline

`plan-analysis.toon` line 101 defines 12 goal mappings:

| Goal | Maps To | Lenses |
|------|---------|--------|
| Bug detection | single | L12 (00) |
| Code review | single or portfolio | L12 (00) + contract (11) |
| Design review | portfolio | claim (07) + rejected-paths (09) |
| Comprehension | portfolio | pedagogy (06) + rejected-paths (09) |
| Pre-commit | full-prism | L12 pipeline (00-02) |
| Planning review | single | L12-general (03) |
| Maintainability | portfolio | degradation (10) + contract (11) |
| Assumption validation | portfolio | claim (07) + scarcity (08) |
| Security review | full-prism | L12 pipeline (00-02) |
| Strategy evaluation | portfolio | claim (07) + scarcity (08) |
| Implication exploration | portfolio | claim (07) + rejected-paths (09) |
| General exploration | single | L12-general (03) |

### Portfolio Lens Catalog Baseline

`portfolio-analysis.toon` lines 15, 28 define 6 lenses:

| Lens | Index | Selection Guide Mappings |
|------|-------|------------------------|
| pedagogy | 06 | assumptions, design rationale |
| claim | 07 | trade-offs, assumptions, interface quality |
| scarcity | 08 | trade-offs, assumptions |
| rejected-paths | 09 | trade-offs, design rationale |
| degradation | 10 | maintainability |
| contract | 11 | maintainability, interface quality |

### Activity Transition Baseline

```
select-mode → structural-pass (default)
structural-pass → adversarial-pass (if pipeline_mode == "full-prism")
structural-pass → deliver-result (default)
adversarial-pass → synthesis-pass (default)
synthesis-pass → deliver-result (default)
```

---

## Gap Analysis

### G1: Resource Files (21 new files needed)

**Gap**: 12 resources exist (00-11). Target: 33 resources (00-32).

**Action**: Create 21 new resource files in `resources/`:
- Copy from `/home/mike/projects/vendor/agi-in-md/prisms/` with standardized `{NN}-{name}.md` naming
- Preserve YAML front matter (unlike existing 00-11 which strip it)
- Content copied verbatim from upstream

**Effort**: Low — file copy with rename. No content transformation.

### G2: plan-analysis Skill (major update)

**Gap**: Goal-mapping matrix has 12 entries covering only L12 + portfolio lenses. Needs expansion to ~24 entries covering SDL, behavioral, hybrid/specialized lenses.

**Specific Changes**:
1. **Line 101 (goal-mapping-matrix rule)**: Add ~12 new goal mappings per AR4 key questions
2. **Line 102 (code-vs-general rule)**: Expand code set (add 12-22, 29-32), expand general set (add 15, 18, 24-26)
3. **Line 104 (single-lens-default rule)**: No change (L12 remains default)
4. **Lines 36-39 (query-recommendation protocol)**: Add behavioral and SDL lenses to general set mappings
5. **Lines 41-43 (single-unit-recommendation protocol)**: Add new goal→lens mappings
6. **Lines 57-64 (select-strategy/select-lenses protocol)**: Add behavioral pipeline mode routing
7. **Lines 71-75 (build-analysis-units protocol)**: Handle behavioral pipeline_mode in unit construction
8. **Lines 108-120 (resources list)**: Expand from 12 to 33

**Effort**: Medium-high — the goal-mapping matrix is the most complex change. Requires careful mapping of each new lens to appropriate goals.

### G3: portfolio-analysis Skill (moderate update)

**Gap**: Lens catalog has 6 entries (06-11). Needs expansion to ~20+ entries including SDL (12-17), individual behavioral (19-22), and hybrid/specialized (29-32) lenses.

**Specific Changes**:
1. **Line 15 (selected-lenses input description)**: Update lens name list
2. **Lines 22-26 (select-lenses protocol)**: Update selection guide with new combinations
3. **Line 28 (load-lenses protocol)**: Update index mapping
4. **Line 64 (contract-is-code-only rule)**: Add rules for sdl-abstraction (15) as universal, 73w (18) as Sonnet-only
5. **Lines 68-74 (resources list)**: Expand from 6 to ~20+

**Effort**: Medium — catalog expansion with new selection guide entries.

### G4: orchestrate-prism Skill (major update)

**Gap**: No behavioral pipeline dispatch protocol. Hardcoded index mapping covers only 00-11.

**Specific Changes**:
1. **Lines 34-38 (determine-lens-indices protocol)**: Add SDL indices (12-18), behavioral indices (19-23), other indices (24-32)
2. **New protocol section: dispatch-behavioral-passes**: Dispatch 4 behavioral lenses in parallel (like portfolio), collect 4 artifact paths
3. **New protocol section: dispatch-behavioral-synthesis**: Construct labeled input from 4 artifacts, dispatch synthesis worker
4. **Lines 59-64 (dispatch-portfolio-passes)**: No change needed — portfolio dispatch pattern is reusable for understanding but behavioral has its own protocol

**Effort**: Medium-high — new protocol sections with label mapping.

### G5: workflow.toon (minor update)

**Gap**: `pipeline_mode` description lists 3 modes. Need to add "behavioral".

**Specific Changes**:
1. **Line 36 (pipeline_mode variable)**: Update description to include "behavioral"
2. **Possibly add behavioral output path variables** (behavioral_errors_path, behavioral_costs_path, etc.)

**Effort**: Low.

### G6: select-mode Activity (minor update)

**Gap**: Confirm-mode checkpoint has 4 options (accept, single, full-prism, portfolio). Needs "behavioral" option.

**Specific Changes**:
1. **Lines 36-56 (confirm-mode checkpoint options)**: Add behavioral option with setVariable effect
2. **Lines 7-8 (recognition keywords)**: Add "behavioral", "error analysis", "behavioral pipeline"

**Effort**: Low.

### G7: structural-pass Activity (moderate update)

**Gap**: Conditional branches handle only single/full-prism and portfolio. Need behavioral branch.

**Specific Changes**:
1. **Add conditional steps for behavioral mode** (after portfolio steps, lines 58-84): dispatch 4 behavioral lenses in parallel
2. **Lines 89-97 (transitions)**: Add transition to new behavioral-synthesis-pass activity when `pipeline_mode == "behavioral"`

**Effort**: Medium — pattern follows portfolio implementation.

### G8: New Activity — behavioral-synthesis-pass (new file)

**Gap**: No activity exists for the behavioral synthesis pass.

**Action**: Create `05-behavioral-synthesis-pass.toon`:
- forEach loop over analysis_units (like adversarial/synthesis pass)
- Condition: `pipeline_mode == "behavioral"`
- Steps: read 4 behavioral artifacts, construct labeled input, load behavioral_synthesis resource (23), execute, write `behavioral-synthesis.md`
- Transition to deliver-result

**Effort**: Medium — follows existing synthesis-pass pattern but with 4 labeled inputs.

### G9: deliver-result Activity (minor update)

**Gap**: Handles single, full-prism, and portfolio modes. Needs behavioral mode.

**Specific Changes**:
1. **Lines 9-11 (read-final-artifact step)**: Add behavioral mode case — read `behavioral-synthesis.md` as primary result

**Effort**: Low.

### G10: New Skill — behavioral-pipeline (new file)

**Gap**: No skill defines the behavioral pipeline worker-side execution.

**Action**: Create `05-behavioral-pipeline.toon`:
- Defines the 4+1 pass structure
- Encodes label mapping: error_resilience→ERRORS, optim→COSTS, evolution→CHANGES, api_surface→PROMISES
- Specifies artifact naming convention
- Input: target content, 4 behavioral lens resource indices, synthesis resource index, output path, prior artifact paths
- Output: per-lens artifacts + synthesis artifact

**Effort**: Medium — follows full-prism skill pattern.

### G11: Resources README (major update)

**Gap**: Documents 12 resources in 3 groups. Needs to document 33 resources in 8 groups.

**Action**: Expand to include all new families with:
- Index, name, word count, target type, purpose for each resource
- Family groupings (L12, General, Portfolio, SDL, Behavioral, Domain-Neutral, Compressed, Hybrid)
- Updated recommended combinations
- Model sensitivity notes (AR1)
- Key question mapping (AR4)

**Effort**: Medium — documentation expansion.

---

## Baseline vs Target Summary

| Dimension | Baseline | Target | Delta |
|-----------|----------|--------|-------|
| Resources | 12 (00-11) | 33 (00-32) | +21 new files |
| Pipeline modes | 3 | 4 | +behavioral |
| Activities | 5 | 6 | +behavioral-synthesis-pass |
| Skills | 5 | 6 | +behavioral-pipeline |
| Goal mappings | 12 | ~24 | +12 new mappings |
| Portfolio lenses | 6 | ~20 | +14 portfolio-eligible lenses |
| Files modified | 0 | 9 | workflow.toon + 5 activities + 3 skills |
| Files created | 0 | 23 | 21 resources + 1 activity + 1 skill |
| Total TOON lines | 933 | ~1150 | +~220 lines |

---

## Change Manifest

### Files to Create (23)

| # | Path | Type | Source |
|---|------|------|--------|
| 1-21 | `resources/12-deep-scan.md` through `resources/32-state-audit.md` | Resource | Copy from agi-in-md/prisms/ |
| 22 | `activities/05-behavioral-synthesis-pass.toon` | Activity | New (follows synthesis-pass pattern) |
| 23 | `skills/05-behavioral-pipeline.toon` | Skill | New (follows full-prism pattern) |

### Files to Modify (9)

| # | Path | Changes | Gap Ref |
|---|------|---------|---------|
| 1 | `workflow.toon` | pipeline_mode description | G5 |
| 2 | `activities/00-select-mode.toon` | Add behavioral checkpoint option | G6 |
| 3 | `activities/01-structural-pass.toon` | Add behavioral conditional branch + transition | G7 |
| 4 | `activities/04-deliver-result.toon` | Add behavioral mode case | G9 |
| 5 | `skills/02-portfolio-analysis.toon` | Expand lens catalog | G3 |
| 6 | `skills/03-plan-analysis.toon` | Expand goal-mapping matrix, code-vs-general rule, resources | G2 |
| 7 | `skills/04-orchestrate-prism.toon` | Add behavioral dispatch protocols, expand index mapping | G4 |
| 8 | `resources/README.md` | Full catalog expansion | G11 |
| 9 | `README.md` (workflow) | Update mode list, file structure | Minor |

### Files Unchanged (4)

| Path | Reason |
|------|--------|
| `activities/02-adversarial-pass.toon` | Only handles full-prism mode — no behavioral changes |
| `activities/03-synthesis-pass.toon` | Only handles full-prism mode — no behavioral changes |
| `skills/00-structural-analysis.toon` | L12-specific — no behavioral changes |
| `skills/01-full-prism.toon` | L12 pipeline-specific — no behavioral changes |

---

## Analysis Assumptions

| ID | Assumption | Category | Resolvability | Status |
|----|-----------|----------|---------------|--------|
| A-028 | The adversarial-pass and synthesis-pass activities do not need modification for behavioral pipeline — they only filter on `pipeline_mode == "full-prism"` and will naturally skip behavioral units | Current Behavior | code-analyzable | Validated |
| A-029 | The existing portfolio dispatch pattern in structural-pass (parallel up to 4) can be adapted for behavioral lens dispatch within the same activity | Current Behavior | code-analyzable | Validated |
| A-030 | The resource file naming convention (`{NN}-{name}.md`) can accommodate hyphenated names like `12-deep-scan.md` (matching existing patterns like `09-rejected-paths.md`) | Current Behavior | code-analyzable | Validated |
