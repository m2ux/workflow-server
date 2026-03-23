# Prism Workflow Update Plan: New Pipeline Modes

> Change request specification for `workflow-design:update` targeting `prism` workflow v1.6.0

---

## 1. Change Summary

Extend the prism workflow's `pipeline_mode` variable from 4 values (`single`, `full-prism`, `portfolio`, `behavioral`) to 10 values by adding 6 new pipeline topologies derived from patterns in the upstream `prism.py` (agi-in-md). Each new mode composes existing prism resources through a distinct pipeline topology.

**New pipeline modes:**

| Mode | Topology | Calls | Key Property |
|---|---|---|---|
| `dispute` | 2 orthogonal prisms → disagreement synthesis | 3 | Self-correction at 1/3 full-prism cost |
| `subsystem` | AST split → calibration → per-region prisms → cross-subsystem synthesis | N+2 | Different prisms per code region |
| `verified` | L12 → gap detect (boundary+audit) → re-analyze with corrections | 4 | Iterative refinement via gap grounding |
| `reflect` | L12 → meta-analysis (claim on L12 output) → constraint synthesis | 3 | Meta-analysis as first-class operation |
| `smart` | prereq → knowledge fill → {subsystem OR L12} → dispute → profile | 5+ | Automatic pipeline composition |
| `adaptive` | Escalation: SDL → L12 → full-prism (stops at adequate signal) | 1-10 | Cost-minimizing depth selection |

**Selection model:** All modes are **manually selected** by the caller (or by `plan-analysis`). Only `smart` performs internal automatic composition. `adaptive` auto-escalates depth but is still explicitly triggered. This matches the upstream pattern where all modes except `smart` and `adaptive` are user-selected with automatic micro-decisions inside.

---

## 2. Design Decisions

### 2.1 Variable Design

Extend `pipeline_mode` description to include all 10 values. No separate "mode" variable — the existing `pipeline_mode` variable is the right place. Add supporting variables for mode-specific state:

| Variable | Type | Used By | Purpose |
|---|---|---|---|
| `dispute_outputs` | object | dispute | Map of `{prism_a: output, prism_b: output, synthesis: output}` |
| `subsystem_assignments` | object | subsystem | Map of `{subsystem_name: prism_name}` |
| `subsystem_outputs` | array | subsystem | Per-subsystem output objects |
| `verified_gap_data` | string | verified | Extracted gap JSON from boundary+audit |
| `reflect_history_context` | string | reflect | Loaded constraint history for synthesis |
| `smart_pipeline_steps` | array | smart | Steps the smart engine decided to execute |
| `adaptive_stage` | string | adaptive | Current escalation stage (sdl/l12/full) |
| `adaptive_signal_quality` | string | adaptive | Signal quality assessment at current stage |

### 2.2 Activity Model

**Option A (recommended): New activities per mode.**
Each new mode gets its own activity, following the existing pattern where `structural-pass`, `adversarial-pass`, `synthesis-pass`, and `behavioral-synthesis-pass` are separate activities. The `select-mode` activity gains new transition targets.

**Option B: Extend structural-pass.**
The `structural-pass` activity would handle all modes with conditional logic. This is simpler but makes the activity definition very large and harder to maintain.

**Recommendation: Option A.** The existing workflow already uses activity-per-mode (separate activities for adversarial, synthesis, behavioral-synthesis). New modes follow the same convention. Each new activity encodes its specific pipeline topology.

**New activities (6):**

| Activity ID | Mode | Prerequisite |
|---|---|---|
| `dispute-pass` | dispute | After `select-mode` when `pipeline_mode == "dispute"` |
| `subsystem-pass` | subsystem | After `select-mode` when `pipeline_mode == "subsystem"` |
| `verified-pass` | verified | After `select-mode` when `pipeline_mode == "verified"` |
| `reflect-pass` | reflect | After `select-mode` when `pipeline_mode == "reflect"` |
| `smart-pass` | smart | After `select-mode` when `pipeline_mode == "smart"` |
| `adaptive-pass` | adaptive | After `select-mode` when `pipeline_mode == "adaptive"` |

All new activities transition to `generate-report` on completion (same as existing modes).

### 2.3 Skill Model

Each new mode needs an execution skill. Some modes can reuse existing skills:

| New Skill | Purpose | Reuses |
|---|---|---|
| `dispute-analysis` | Run 2 orthogonal prisms + disagreement synthesis | Reuses `structural-analysis` for individual lens execution |
| `subsystem-analysis` | AST decomposition, calibration, per-region execution, cross-subsystem synthesis | Reuses `structural-analysis` for per-subsystem execution |
| `verified-analysis` | L12 → gap detect → re-analyze pipeline | Reuses `structural-analysis` for L12 passes |
| `reflect-analysis` | L12 → meta → constraint synthesis | Reuses `structural-analysis` for L12 and claim passes |
| `smart-analysis` | Adaptive chain composition engine | Composes existing skills: `structural-analysis`, `dispute-analysis`, `subsystem-analysis` |
| `adaptive-analysis` | Depth escalation with signal quality assessment | Reuses `structural-analysis` at each stage |

### 2.4 Resource Model

New resources (prompts) needed:

| Index | Name | Content Source |
|---|---|---|
| `62` | `dispute-synthesis` | `DISPUTE_SYNTHESIS_PROMPT` from prism.py (lines 218-239) |
| `63` | `subsystem-calibration` | `CALIBRATE_SUBSYSTEM_PROMPT` from prism.py (lines 255-268) |
| `64` | `subsystem-synthesis` | `SUBSYSTEM_SYNTHESIS_PROMPT` from prism.py (lines 270-292) |

These are internal pipeline prompts, not analytical lenses. They orchestrate multi-prism compositions. The 58 existing lens resources (00-61) are used by the new modes — no new lenses are needed.

### 2.5 Transition Design

Updated `select-mode` transitions (currently 5 paths, expanding to 11):

```
select-mode →
  ├── structural-pass      (single, full-prism)
  ├── structural-pass      (portfolio — handled by mode in structural-pass)
  ├── structural-pass      (behavioral — first behavioral lens)
  ├── dispute-pass          (dispute)      ← NEW
  ├── subsystem-pass        (subsystem)    ← NEW
  ├── verified-pass         (verified)     ← NEW
  ├── reflect-pass          (reflect)      ← NEW
  ├── smart-pass            (smart)        ← NEW
  └── adaptive-pass         (adaptive)     ← NEW
```

All new activities → `generate-report` → `deliver-result`.

### 2.6 Orchestration Model

The existing prism workflow uses an **orchestrator with disposable workers** (fresh sub-agent per pass). New modes follow the same pattern:

- **dispute**: 3 fresh workers (prism A, prism B, synthesis)
- **subsystem**: 1 calibration call + N fresh workers (per subsystem) + 1 synthesis worker
- **verified**: 3-4 fresh workers (L12, boundary+audit, optional KB fill, re-analysis)
- **reflect**: 3 fresh workers (L12, meta/claim, synthesis)
- **smart**: Orchestrator composes sub-pipelines; each sub-pipeline follows its own worker pattern
- **adaptive**: Sequential workers; stops when signal quality is adequate

### 2.7 Conditional Pipeline Steps

The `full-prism` mode should gain support for conditional steps (following upstream's `has_security_keywords` pattern). This is a modification to the existing `orchestrate-prism` skill, not a new mode.

Add to `orchestrate-prism`:
- `security_v1` step only dispatched when target contains security-relevant keywords
- Step condition evaluation before dispatch

---

## 3. Scope Manifest (Files to Create/Modify)

### New Files

| Path | Type | Description |
|---|---|---|
| `prism/activities/08-dispute-pass.toon` | Activity | Dispute pipeline (2 prisms + synthesis) |
| `prism/activities/09-subsystem-pass.toon` | Activity | Subsystem pipeline (split + calibrate + execute + synthesize) |
| `prism/activities/10-verified-pass.toon` | Activity | Verified pipeline (L12 + gap detect + re-analyze) |
| `prism/activities/11-reflect-pass.toon` | Activity | Reflect pipeline (L12 + meta + constraint synthesis) |
| `prism/activities/12-smart-pass.toon` | Activity | Smart adaptive chain engine |
| `prism/activities/13-adaptive-pass.toon` | Activity | Adaptive depth escalation |
| `prism/skills/07-dispute-analysis.toon` | Skill | Dispute execution skill |
| `prism/skills/08-subsystem-analysis.toon` | Skill | Subsystem execution skill |
| `prism/skills/09-verified-analysis.toon` | Skill | Verified execution skill |
| `prism/skills/10-reflect-analysis.toon` | Skill | Reflect execution skill |
| `prism/skills/11-smart-analysis.toon` | Skill | Smart composition skill |
| `prism/skills/12-adaptive-analysis.toon` | Skill | Adaptive escalation skill |
| `prism/resources/62-dispute-synthesis.md` | Resource | Dispute synthesis prompt |
| `prism/resources/63-subsystem-calibration.md` | Resource | Subsystem prism assignment prompt |
| `prism/resources/64-subsystem-synthesis.md` | Resource | Cross-subsystem synthesis prompt |

### Modified Files

| Path | Change Type | Changes |
|---|---|---|
| `prism/workflow.toon` | Modify | Add 8 new variables, extend `pipeline_mode` description, add 6 new activities to activity list with transitions, bump version to 2.0.0 |
| `prism/activities/00-select-mode.toon` | Modify | Add transitions to new activities for new pipeline modes |
| `prism/skills/03-plan-analysis.toon` | Modify | Add goal-mapping entries that route to new modes |
| `prism/skills/04-orchestrate-prism.toon` | Modify | Add dispatch logic for new pipeline modes, add conditional step support |
| `prism/README.md` | Modify | Add new modes to prompt guide, modes table, activity table, file structure, variables |
| `prism/activities/README.md` (if exists) | Modify | Add new activities |
| `prism/skills/README.md` | Modify | Add new skills |
| `prism/resources/README.md` | Modify | Add 3 new pipeline prompts |

### Unaffected Files

All existing activity files (01-07), skill files (00-02, 05-06), and lens resources (00-61) are unaffected. The new modes compose existing resources through new pipeline topologies.

---

## 4. Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| Transition integrity | Adding 6 new activities to `select-mode` transitions is complex | Enumerate all transitions explicitly in impact-analysis |
| Variable namespace growth | 8 new variables may clutter the workflow definition | Group mode-specific variables with clear naming conventions |
| Skill complexity for `smart` | Smart mode composes other modes, creating deep nesting | Smart's skill should reference other skills by ID, not inline their logic |
| `generate-report` compatibility | New modes produce different artifact structures | Each new mode must write artifacts in the format `generate-report` expects |
| Subsystem AST dependency | Subsystem mode requires language-specific parsing | Document as code-only mode; specify fallback behavior for unsupported languages |

---

## 5. Execution Order for `workflow-design:update`

The workflow-design update workflow will process these changes through its standard activity sequence:

1. **Intake** — Load prism workflow v1.6.0, parse this change request, confirm scope
2. **Context and Literacy** — Load TOON schemas, verify format conventions against existing prism workflow files
3. **Impact Analysis** — Enumerate all 30+ files in prism/, classify each, check transition/reference integrity
4. **Scope and Structure** — Confirm the 15 new + 8 modified file manifest, design folder layout
5. **Content Drafting** — Draft each file in dependency order:
   - `workflow.toon` first (defines variables and activity references)
   - New resources (62-64) next (referenced by skills)
   - New skills (07-12) next (referenced by activities)
   - New activities (08-13) next (referenced by workflow transitions)
   - Modified files last (plan-analysis, orchestrate-prism, select-mode)
   - Documentation updates (READMEs) final
6. **Quality Review** — Schema validation, expressiveness check, conformance audit
7. **Validate and Commit** — Schema validation pass, README generation, commit

**Estimated effort:** The content-drafting loop will iterate over ~23 files. At the workflow-design pace (approach → draft → validate → review per file), this is a substantial multi-session effort. Consider splitting into phases:

- **Phase 1**: Core infrastructure (workflow.toon, select-mode transitions, dispute + verified modes) — these are the highest-value, lowest-complexity additions
- **Phase 2**: Complex modes (subsystem, reflect, smart, adaptive) — these have more internal logic
- **Phase 3**: Documentation and routing updates (READMEs, plan-analysis, orchestrate-prism)

---

## 6. Dependencies and Sequencing

```
workflow.toon (variables, activity references)
    ↓
resources/ (62-64, pipeline prompts)
    ↓
skills/ (07-12, execution skills)
    ↓
activities/ (08-13, pipeline definitions)
    ↓
select-mode.toon (transition targets)
    ↓
plan-analysis.toon (goal-mapping entries)
orchestrate-prism.toon (dispatch logic)
    ↓
READMEs (documentation)
```

Files must be drafted in this order because each layer references the one above it.

---

## 7. Source Material

| Reference | Location | Relevance |
|---|---|---|
| `prism.py` analysis | `.engineering/artifacts/2026-03-22-prism-py-design-patterns-analysis.md` | Design patterns, prompt text, pipeline topologies |
| `prism.py` source | `/home/mike/projects/vendor/agi-in-md/prism.py` | `DISPUTE_SYNTHESIS_PROMPT` (L218), `CALIBRATE_SUBSYSTEM_PROMPT` (L255), `SUBSYSTEM_SYNTHESIS_PROMPT` (L270), `_run_dispute` (L7538), `_run_subsystem` (L8799), `_run_verified_pipeline` (L9187), `_run_reflect` (L7408), `_run_smart` (L8306), `_run_adaptive` (L7706) |
| Current prism workflow | `workflows/prism/` | Existing structure, conventions, skill patterns |
| Mode selection analysis | Conversation context | Manual vs automatic selection analysis per mode |
