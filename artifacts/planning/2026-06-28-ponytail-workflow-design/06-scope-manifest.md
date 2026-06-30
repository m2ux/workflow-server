# Scope Manifest & Structural Approach — ponytail Workflow

**Work Package:** ponytail Workflow Design
**Workflow:** workflow-design → scope-and-draft (create mode)
**Created:** 2026-06-28
**Status:** Scope + approach drafted; presented at `scope-and-structure-confirmed` for adoption (content-drafting loop is a later dispatch)

This document is the SCOPE + APPROACH output of the `scope-and-draft` activity (`scope-definition` technique). It enumerates every file to create under `workflows/ponytail/`, fixes the structural approach against the adopted reference patterns (from [04-pattern-analysis.md](04-pattern-analysis.md)), and gives a per-file drafting spec detailed enough to draft from. No files under `workflows/ponytail/` are created in this dispatch.

---

## 0. Worktree precondition (verified)

- `workflows` worktree present at `workflows/`, checked out on branch `workflows` (verified clean except untracked `.idea/`).
- `workflows/ponytail/` does NOT yet exist — every entry below is action `create`.
- `$schema` convention (verified across `work-package`, `workflow-design`, `requirements-refinement`, `meta`): `workflow.yaml` line 1 is `$schema: ../../schemas/workflow.schema.json` (relative path from `workflows/<id>/workflow.yaml` to the repo-root `schemas/`). Activity and technique files carry NO `$schema` header (none of the reference activity YAMLs do). Technique op files are markdown (`.md`) with a `metadata` YAML front-matter block only.

---

## 1. Directory layout (proposed)

```
workflows/ponytail/
├── workflow.yaml                              # create — root definition: metadata, 6 variables, audience-partitioned rules, techniques.activity
├── README.md                                  # create — root orientation (prism style; AP-76)
├── activities/
│   ├── README.md                              # create — activities-folder orientation
│   ├── 01-intake-and-scope.yaml               # create — capture task/target/intensity/scope + trace; intensity-and-scope-confirmed checkpoint
│   ├── 02-apply-ladder.yaml                   # create — climb the ladder; safety-floor-cleared blocking checkpoint + needs-work loop
│   ├── 03-over-engineering-review.yaml        # create — diff-scoped review; scatter-gather forEach over findings; gated transition to repo-audit
│   ├── 04-repo-audit.yaml                     # create — repo-wide audit (required:false, gated-in); scatter-gather; no checkpoint
│   └── 05-harvest-debt-and-report.yaml        # create — harvest ponytail: markers + gain report tail; terminal
├── techniques/
│   ├── README.md                              # create — techniques-folder orientation
│   └── ponytail-operations/
│       ├── TECHNIQUE.md                       # create — group base contract (shared inputs/rules, inherited by all 5 ops)
│       ├── apply-ladder.md                    # create — op: climb 7 rungs; output lean_change (#### artifact lean-change.md)
│       ├── review-over-engineering.md         # create — op: diff-scoped tag review; output review_findings (review-findings.md)
│       ├── audit-repo.md                       # create — op: repo-wide hunt; output audit_findings (audit-findings.md)
│       ├── harvest-debt.md                     # create — op: grep ponytail: markers; outputs debt_ledger (debt-ledger.md), has_debt_markers
│       └── report-gain.md                      # create — op: honesty-bounded scoreboard; output gain_scoreboard (NO #### artifact)
└── resources/
    ├── README.md                              # create — resources-folder orientation/catalog
    ├── the-ladder.md                          # create — 7 rungs + safety floor + when-NOT-to-be-lazy (single source)
    ├── review-taxonomy.md                     # create — 5 tags: delete/stdlib/native/yagni/shrink
    ├── ponytail-marker-convention.md          # create — `ponytail: <ceiling>, <upgrade>` + no-trigger
    └── honesty-boundary.md                    # create — gain-reporting: benchmark medians, never per-repo fabrication
```

**Total: 20 files** (1 workflow.yaml + 5 activities + 1 group base + 5 op files + 4 resources + 4 READMEs).

Note on intake operation: there is no `intake.md` op file. The intake activity's understand-first work is a pure capture/trace step that binds the cross-workflow `gitnexus-operations::query`/`::context` for tracing (referenced qualified), plus the `intensity-and-scope-confirmed` checkpoint. The `lean-brief.md` artifact named in the assumptions log is the intake activity's captured brief; per AP-65 the activity's artifact contract is server-synthesized from the bound op's `## Outputs`. **DRAFTING DECISION TO CONFIRM:** intake binds `gitnexus-operations::context` for the trace and a lightweight capture — OR a sixth `ponytail-operations` op `scope-intake` is authored to own `lean_brief` / `lean-brief.md`. Recommended: author `scope-intake.md` as a sixth op so `lean-brief.md` has a clean technique owner (AP-43) rather than leaving the intake artifact unowned. This adds one op file (21 files total). See §5 open question.

---

## 2. Transition diagram

```
                  intensity-and-scope-confirmed (blocking)
[intake-and-scope] ──────────────────────────────► [apply-ladder]
                                                          │
                                          safety-floor-cleared (blocking;
                                          needs-work loops within activity)
                                                          ▼
                                              [over-engineering-review]
                                                   │            │
              intensity==ultra OR scope==repo (or-cond)         │ isDefault
                                                   ▼            ▼
                                            [repo-audit] ──► [harvest-debt-and-report]  (terminal)
                                              isDefault ──────────┘
```

- `initialActivity: intake-and-scope`.
- `over-engineering-review` has TWO transitions: gated `→ repo-audit` (`condition.type: or` over two `simple ==`) + `→ harvest-debt-and-report` `isDefault: true`.
- `repo-audit` has ONE transition: `→ harvest-debt-and-report` `isDefault: true`.
- `harvest-debt-and-report` has NO transitions (terminal).
- No activity-graph loops; iteration is within-activity (forEach over findings/markers).

---

## 3. Per-file drafting spec

### 3.1 `workflow.yaml`

```
$schema: ../../schemas/workflow.schema.json
id: ponytail
version: 1.0.0
title: Ponytail Lean-Coding Workflow
description: Drive a coding task, change, or codebase toward the leanest solution that still clears a non-negotiable safety floor, tracking every deliberate simplification as ponytail: debt.   # NO process narration, NO sequence prose (AP-36/38)
author: m2ux
tags: [lean-coding, over-engineering, yagni, refactoring, technical-debt, code-review]
```

**rules** (audience-partitioned, grouped, positive slugs — AP-26/60(4), AP-71):
- `rules.universal`:
  - `safety-floor-never-simplified` — The safety floor (problem understanding, input validation at trust boundaries, error handling that prevents data loss, security, accessibility, hardware calibration, anything explicitly requested, ONE runnable assert-based check for non-trivial logic) is never simplified away. (Backed structurally by the `safety-floor-cleared` blocking checkpoint + `safety_floor_cleared` gate.)
  - `understand-before-climb` — The real end-to-end flow the change touches is understood and traced before the ladder is climbed. (Backed structurally by intake preceding apply-ladder in the activity graph.)
- `rules.workflow` (orchestrator): minimal — likely just the standard `On completing each activity, update the planning-folder README.md progress tracker …` activity-progress rule IF a planning folder applies; otherwise omit. (ponytail is a runtime coding workflow, not a planning workflow — confirm whether it produces planning artifacts at all; its artifacts are code-adjacent `*.md` in `target_path`, not the planning folder. **Open: §5.**)
- NO honesty-boundary rule at workflow root — it is worker-facing report-content constraint → lives as a `report-gain` technique rule + `honesty-boundary.md` resource (AP-71).
- NO output-discipline / root-cause / take-higher-rung at workflow root — per-execution style → technique rules/protocol (PA-8).

**techniques**:
```
techniques:
  activity:
    - variable-binding        # inherited by every activity (AP-75)
```
`scatter-gather` is NOT workflow-wide — it is listed only on the fan-out activities' own `techniques[]` (review/audit/harvest).

**variables** (6; prism `pipeline_mode` string model, NO enum; affirmative-predicate booleans — AP-60(1)):
| name | type | defaultValue | required | description |
|------|------|--------------|----------|-------------|
| `task_description` | string | — | true | The coding task, change, or audit target to be made lean |
| `target_path` | string | `.` | false | Path to the code or repo under the lazy lens |
| `intensity` | string | `full` | false | lite / full / ultra — governs strictness and gates repo-audit |
| `scope` | string | `change` | false | change (diff-scoped) or repo (whole-tree) — gates repo-audit |
| `safety_floor_cleared` | boolean | `false` | false | Gate set by the safety-floor-cleared checkpoint before review |
| `has_debt_markers` | boolean | `false` | false | True iff ponytail: markers were found during harvest |

(Schema uses `defaultValue` not `default`; `required` boolean per variable. Match work-package/prism variable shape exactly.)

`initialActivity: intake-and-scope`

---

### 3.2 `activities/01-intake-and-scope.yaml`

```
id: intake-and-scope
version: 1.0.0
name: Intake and Scope
description: Capture the task or repo target, set intensity and scope, and trace the real end-to-end flow the change touches before the ladder is climbed.   # WHAT only, no procedure prose
# NO techniques[] (no fan-out here) — variable-binding is inherited
# NO rules[]  (AP-62)
# NO artifacts[]  (AP-65; server-synthesized from the bound op's Outputs)
steps:
  - kind: technique
    id: capture-and-trace
    technique: ponytail-operations::scope-intake     # (per §5 recommendation) — OR a gitnexus-operations::context binding + capture
  - kind: checkpoint
    id: intensity-and-scope-confirmed
    blocking: true
    message: "Confirm intensity (lite / full / ultra) and scope (change / repo) before climbing the ladder."
    options:
      - id: lite   → effect.setVariable: { intensity: lite }
      - id: full   → effect.setVariable: { intensity: full }    # defaultOption: full
      - id: ultra  → effect.setVariable: { intensity: ultra }
      - id: scope-repo → effect.setVariable: { scope: repo }     # OR fold scope into the same options matrix
    defaultOption: full
transitions:
  - to: apply-ladder
    isDefault: true
outcome:
  - The task and the real flow it touches are understood and recorded before any simplification begins   # value, not "lean-brief.md written" (AP-66)
```

**Pattern mirror:** present-then-checkpoint (work-package `02-design-philosophy` `classify-problem`→`classification-confirmed`). Checkpoint is an INLINE step at its position with a stable `id` (AP-64). Bound step is `id`+`technique` only — no `description`/`name` (AP-64). **Checkpoint options modelling to confirm in §5:** intensity (3 levels) and scope (2 values) are two independent variables — either one combined options matrix or capture scope separately. Cleanest is intensity options set `intensity` and a separate scope confirmation, but a single checkpoint can carry both via paired options. Recommended: ONE checkpoint, options set `intensity`, scope defaulted to `change` and overridable by a `scope-repo` option (keeps to one decision gate).

---

### 3.3 `activities/02-apply-ladder.yaml`

```
id: apply-ladder
version: 1.0.0
name: Apply Ladder
description: Produce the minimal solution by climbing the rungs, marking ponytail: ceilings and leaving one runnable check, and confirm it clears the safety floor.
steps:
  - kind: technique
    id: climb-ladder
    technique: ponytail-operations::apply-ladder
  - kind: checkpoint
    id: safety-floor-cleared
    blocking: true
    message: "Confirm the minimal solution clears the safety floor (validation, error handling, security, accessibility, calibration, the one runnable check) before review."
    options:
      - id: confirmed   → effect.setVariable: { safety_floor_cleared: true }
      - id: needs-work  → effect.setVariable: { safety_floor_cleared: false }   # loops back within activity
  - kind: technique
    id: address-safety-gaps
    technique: ponytail-operations::apply-ladder
    when: { condition simple safety_floor_cleared == false }   # re-run when needs-work (research `further-research` pattern)
transitions:
  - to: over-engineering-review
    isDefault: true
outcome:
  - The minimal solution is built and verified to clear the safety floor, with its ceilings marked for later harvest
```

**Pattern mirror:** present-then-checkpoint + blocking safety gate (PA-3, design-principle-10). The `needs-work` re-run is a `when`-gated repeat step (work-package research `further-research`), NOT an activity-graph loop. **Loop vs gated-step to confirm in §5** — a `kind: loop` while `safety_floor_cleared == false` is the more faithful "loops back within activity" construct; recommended over a single gated re-run so iteration can repeat until cleared (maxIterations bound).

---

### 3.4 `activities/03-over-engineering-review.yaml`

```
id: over-engineering-review
version: 1.0.0
name: Over-Engineering Review
description: Review the change against the over-engineering taxonomy, one line per finding, ending in a net line-count scoreboard.
techniques:
  - scatter-gather                       # fan-out activity → lists scatter-gather here (AP-75)
steps:
  - kind: technique
    id: review-change
    technique: ponytail-operations::review-over-engineering
  # scatter-gather forEach over findings with a `set` accumulator (prism `unit-cycle` shape) IF findings are
  # iterated per-unit; otherwise review-over-engineering emits the full review_findings collection in one pass.
transitions:
  - to: repo-audit
    condition:
      type: or
      conditions:
        - { type: simple, variable: intensity, operator: ==, value: ultra }
        - { type: simple, variable: scope, operator: ==, value: repo }
  - to: harvest-debt-and-report
    isDefault: true
outcome:
  - The change's over-engineering is tagged and quantified so a cut decision can be made
```

**Pattern mirror:** prism `01-structural-pass` transitions (`condition.type: or` + lone `isDefault`). No checkpoint (PA-4 — read-only reporting). **scatter-gather usage to confirm in §5:** whether review iterates findings via a `kind: loop` forEach + `set` accumulator (true scatter-gather) or the op emits the whole `review_findings` collection in one pass. Recommended: the op emits the collection in one pass (review is a single diff-scoped read); `scatter-gather` is listed only if a genuine per-unit forEach exists. **If no forEach, drop `techniques: [scatter-gather]` from this activity** — listing it without a fan-out step is an AP violation. Re-confirm against the assumptions-log "forEach over findings" claim.

---

### 3.5 `activities/04-repo-audit.yaml`

```
id: repo-audit
version: 1.0.0
name: Repo Audit
description: Hunt repo-wide over-engineering biggest-cut-first, ending in a net lines-and-deps scoreboard.
required: false                          # gated-in; reached only via the or-condition transition
techniques:
  - scatter-gather                       # repo-wide fan-out (per-area/per-file findings)
steps:
  - kind: technique
    id: audit-repo
    technique: ponytail-operations::audit-repo
  # scatter-gather forEach over repo areas/findings if iterated
transitions:
  - to: harvest-debt-and-report
    isDefault: true
outcome:
  - The whole tree's biggest over-engineering cuts are ranked and quantified
```

**Pattern mirror:** `required: false` + reached only by gated transition (work-package `04-research` `required: false`). No checkpoint (PA-4). Same scatter-gather caveat as §3.4 — list only with a real forEach step.

---

### 3.6 `activities/05-harvest-debt-and-report.yaml`

```
id: harvest-debt-and-report
version: 1.0.0
name: Harvest Debt and Report
description: Harvest ponytail: markers into a debt ledger and, when markers exist, append an honesty-bounded gain scoreboard.
techniques:
  - scatter-gather                       # forEach over ponytail: markers
steps:
  - kind: technique
    id: harvest-markers
    technique: ponytail-operations::harvest-debt          # sets has_debt_markers, produces debt_ledger
  - kind: technique
    id: report-gain
    technique: ponytail-operations::report-gain
    when:
      condition: { type: simple, variable: has_debt_markers, operator: ==, value: true }   # gain appends to ledger only when there is debt to report
# terminal: NO transitions
outcome:
  - Every deliberate simplification is recorded as trackable debt with its upgrade trigger, and the honest gain is shown
```

**Pattern mirror:** scatter-gather forEach over markers; `report-gain` tail appends to `debt-ledger.md` via the `harvest-debt` artifact (write-artifact update-in-place — `manage-artifacts::write-artifact` shape). `report-gain` declares NO `#### artifact` (AP-65). Refs are QUALIFIED (`ponytail-operations::harvest-debt`) — the group is capability-named, not activity-named, so activity-group-shorthand does NOT apply (AP-63; matches review-assumptions `::collect` always-qualified). Terminal activity — no `transitions`.

---

### 3.7 `techniques/ponytail-operations/TECHNIQUE.md`

Front-matter: `metadata: { version: 1.0.0 }` (mirror review-assumptions/TECHNIQUE.md, which also carries `ontology`/`kind`/`order`/`legacy_id` — those legacy fields are optional; the minimal `version` form is used by newer op files like reconcile.md/record.md). Body:
- `## Capability` — Own the lean-coding capability: climb the ladder, review and audit for over-engineering, harvest ponytail: debt, and report honest gain. Operations inherit the shared inputs and rules below.
- `## Inputs` (inherited by all 5/6 ops — AP-52): `task_description`, `target_path`, `intensity`. Each `### <id>` with description; `target_path` and `intensity` carry `#### default` (`.` / `full`).
- `## Rules`: `output-discipline` — code first, then ≤3 lines (skipped X; add when Y); no unrequested prose. `take-higher-rung` — when two rungs both work, take the higher (lazier) one; deletion over addition; no unrequested abstractions. (These are the per-execution style rules — PA-8.) References `the-ladder.md` for the rung definitions (hyperlink the noun — AP-42).

**Pattern mirror:** `work-package/techniques/review-assumptions/TECHNIQUE.md` (shared Capability/Inputs/Outputs/Rules inherited by ops).

---

### 3.8 Op files (`techniques/ponytail-operations/<op>.md`)

Each: front-matter `metadata: { version: 1.0.0 }`; body `## Capability` / `## Inputs` (only op-specific, beyond inherited) / `## Outputs` (with `#### artifact` literal) / `## Protocol` (numbered or titled blocks) / `## Rules`. Protocol references canonical output ids `{lean_change}` etc. and hyperlinks resources by `#section` (AP-42/48/59). No stage-position prose (AP-61). Generic-not-overfit inputs (AP-41/55) — describe what the value IS, never naming a producer activity.

| File | Capability | Op inputs (beyond inherited) | Outputs | `#### artifact` | Resource refs |
|------|------------|------------------------------|---------|-----------------|---------------|
| `scope-intake.md` (per §5 rec) | Capture task/target/intensity/scope and trace the real end-to-end flow the change touches | (inherited only) | `lean_brief` | `lean-brief.md` | binds `gitnexus-operations::query`/`::context` for tracing (qualified, AP-48) |
| `apply-ladder.md` | Climb the rungs after understanding the problem; mark ceilings; leave one runnable check | `traced_context` (the understood flow) | `lean_change` | `lean-change.md` | `the-ladder.md#rungs`, `the-ladder.md#safety-floor`, `ponytail-marker-convention.md` |
| `review-over-engineering.md` | Tag the change's over-engineering one line per finding; emit a net-lines scoreboard | (inherited; reviews the change/diff — generic, not "apply-ladder's output") | `review_findings` | `review-findings.md` | `review-taxonomy.md`, `the-ladder.md` |
| `audit-repo.md` | Hunt repo-wide over-engineering biggest-cut-first; emit net lines-and-deps | (inherited; `target_path`) | `audit_findings` | `audit-findings.md` | `review-taxonomy.md`, `the-ladder.md` |
| `harvest-debt.md` | Grep ponytail: markers and record each as ceiling + upgrade trigger (no-trigger flag) | (inherited) | `debt_ledger`, `has_debt_markers` | `debt-ledger.md` | `ponytail-marker-convention.md` |
| `report-gain.md` | Show an honesty-bounded gain scoreboard appended to the ledger | (inherited) | `gain_scoreboard` | NONE (appends to debt-ledger.md) | `honesty-boundary.md` |

`report-gain.md` `## Rules`: `honesty-boundary` — never fabricate a per-repo savings number; benchmark medians only (phrased as purpose, not "before the report checkpoint" — AP-61).

**Pattern mirror:** review-assumptions op files + `strategic-review/document-findings.md` SHAPE for the tagged-findings ops (do NOT bind it). full-prism `#### artifact` for artifact identity.

---

### 3.9 Resource files (`resources/<name>.md`)

Single-source; NO back-reference to consuming techniques (AP-44). Markdown with `#section` anchors techniques link to.

| File | Content | Sections (anchors) |
|------|---------|--------------------|
| `the-ladder.md` | The 7 rungs (YAGNI → reuse → stdlib → native → installed dep → one line → minimum code that works) + the safety floor + when-NOT-to-be-lazy | `#rungs`, `#safety-floor`, `#when-not-to-be-lazy` |
| `review-taxonomy.md` | The 5 tags: delete / stdlib / native / yagni / shrink (one definition each + example) | `#tags` |
| `ponytail-marker-convention.md` | `ponytail: <ceiling>, <upgrade path>` ceiling-comment convention + the `no-trigger` rule | `#convention`, `#no-trigger` |
| `honesty-boundary.md` | The gain-reporting rule: benchmark medians only, never per-repo fabrication | `#rule` |

**Pattern mirror:** prism lens resources (single-source, many consumers) + `prism/resources/README.md` catalog style.

---

### 3.10 READMEs (4)

prism style; AP-76 / principle-14 — orient, do NOT transcribe steps/checkpoints/transitions/variables/rules; KEEP a flow diagram at the root. Describe the system as-is (no evolution narration — `.engineering` doc-voice rule).

| File | Content |
|------|---------|
| `README.md` (root) | Purpose; "why this over ad-hoc"; the mermaid flow diagram (§2); activities table (5 rows, value per activity); variables overview; techniques overview; resources overview; file-structure tree; links |
| `activities/README.md` | Activities-folder orientation: the 5 activities, the linear spine + gated branch, one-line value each, link to root |
| `techniques/README.md` | The `ponytail-operations` group (base + 5/6 ops), the inherited base contract, reused meta `scatter-gather`/`variable-binding`, qualified-ref note |
| `resources/README.md` | The 4 single-source resources, what each owns, which techniques consume each |

---

## 4. Drafting order (reference-dependency chain)

1. `workflow.yaml` — declares ids/variables/techniques every downstream file references.
2. Activities `01`→`05` — reference workflow variables + bind `ponytail-operations::*` ops (which must exist next).
3. Techniques — `ponytail-operations/TECHNIQUE.md` first (base contract), then the op files (inherit it); op files reference resources.
4. Resources — `the-ladder.md`, `review-taxonomy.md`, `ponytail-marker-convention.md`, `honesty-boundary.md` (referenced by ops).
5. READMEs — last; they orient over the finished structure (root, then activities/, techniques/, resources/).

Rationale: each tier references the tier above it (activities→workflow vars; ops→base+resources; READMEs→everything), so drafting top-down keeps every reference resolvable as it is written. Matches the activity rule "Draft files in the confirmed order: workflow.yaml first, then activities, then techniques, then resources, then README."

---

## 5. Open drafting decisions surfaced for the checkpoint

These are deliberate structural choices the content-drafting dispatch will commit; flagged here so they can be revised at `scope-and-structure-confirmed` before drafting:

1. **Sixth op `scope-intake`** (recommended) so `lean-brief.md` has a technique owner (AP-43), vs. an intake step that binds `gitnexus-operations::context` + a capture with no dedicated op. Affects file count (20 vs 21).
2. **Intake checkpoint shape** — one checkpoint whose options set `intensity` with a `scope-repo` override, vs. two confirmations. Recommended: single gate, intensity options + scope override.
3. **apply-ladder needs-work** as a `kind: loop` (while `safety_floor_cleared == false`, maxIterations-bounded) vs. a single `when`-gated re-run step. Recommended: `kind: loop` (faithful to "loops back within activity").
4. **scatter-gather presence** on review/audit/harvest — keep `techniques: [scatter-gather]` + a `kind: loop` forEach + `set` accumulator ONLY where a genuine per-unit fan-out exists. The harvest-over-markers loop is the clearest forEach; review/audit may be single-pass collection emits. Recommended: scatter-gather on harvest (forEach markers) confirmed; review/audit list it only if a per-finding forEach is drafted, else drop it to avoid an unused-strategy AP violation. **This refines the assumptions-log "forEach over findings" claim.**
5. **Planning-folder vs target_path artifacts** — ponytail's runtime artifacts (`lean-brief.md` etc.) are code-adjacent outputs written to `target_path`, not the workflow-design planning folder. Confirm `workflow.yaml rules.workflow` carries (or omits) the activity-progress README rule accordingly. Recommended: omit the planning-progress rule (ponytail is a runtime coding workflow, not a planning workflow).

---

## 6. Alignment against adopted patterns (checkpoint summary)

| Dimension | Manifest choice | Pattern source | Alignment |
|-----------|-----------------|----------------|-----------|
| `$schema` header | `workflow.yaml` only, `../../schemas/workflow.schema.json` | work-package/workflow-design/meta | ✅ |
| Mode variables | `intensity`/`scope` plain strings + `simple ==` | prism `pipeline_mode` | ✅ |
| Branch gate | transition `condition.type: or` | prism `01-structural-pass` | ✅ |
| Checkpoints | 2 blocking (intensity, safety-floor), present-then-checkpoint | design-philosophy / research | ✅ |
| Bound-step purity | `id`+`technique` only, no description/name | work-package `04-research` (AP-64) | ✅ |
| Technique group | `ponytail-operations` base + op files | review-assumptions group | ✅ |
| Group refs | capability-named, QUALIFIED everywhere | AP-63 + review-assumptions `::collect` | ⚠️ deliberate (no activity-group-shorthand) — confirm |
| Artifact identity | per-op `#### artifact`, no activity `artifacts[]` | AP-43/65, full-prism | ✅ |
| Reuse | scatter-gather + variable-binding reused; ops new | meta library | ✅ |
| Rules placement | safety/understand structural, rest technique-level | AP-62/71, work-package split | ✅ |
| READMEs | 4, orient + keep diagram | prism, AP-76 | ✅ |
