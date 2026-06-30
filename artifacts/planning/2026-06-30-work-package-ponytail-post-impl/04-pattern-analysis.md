# work-package — Pattern Analysis

**Mode:** Update
**Target workflow:** `work-package` (v3.13.0)
**Change:** Add a new `lean-coding-audit` activity at slot 09 (after `implement` 08, before `post-impl-review`), binding the standalone `ponytail` workflow's techniques cross-workflow.

This document extracts the concrete patterns/precedents the new activity will be modelled on, presented alongside the proposed structure so `scope-and-draft` can author faithfully. The settled design is in [03-requirements.md](03-requirements.md) + [03-assumptions-log.md](03-assumptions-log.md); this analysis confirms each settled decision has a real in-repo precedent and pins the exact syntax.

---

## 1. Reference selection

| Reference | Why selected |
|-----------|--------------|
| **`work-package/activities/09-post-impl-review.yaml`** | The closest structural twin: a `required: true` review activity that binds a **cross-workflow** technique (`prism/structural-analysis`), runs a **blocking** confirmation checkpoint, and drives a **bounded `doWhile` apply loop**. This is the primary precedent for the new activity's shape. |
| **`work-package/activities/14-codebase-comprehension.yaml`** | Second precedent: binds cross-workflow `prism/portfolio-analysis` using the **structured `technique: { name, inputs }` object form** (input deviation at the call-site), and runs a gated loop with an in-loop checkpoint. Shows the object-form binding the new steps will use. |
| **`ponytail/activities/03-over-engineering-review.yaml`, `05-harvest-debt-and-report.yaml`** | The source activities being collapsed: show how `review-over-engineering`, `harvest-debt`, `report-gain` are sequenced and `when:`-gated in their home workflow — the shape that must bind cleanly into ONE work-package activity. |
| `work-package/activities/10-validate.yaml`, `08-implement.yaml` | Transition-wiring references for the insertion + renumber (default linear `transitions: [{ to: <next>, isDefault: true }]`). |

All four are the same **model type as the target**: sequential single-default-transition activities in the linear `work-package` pipeline (matches the pattern-analysis rule "examine at least two existing workflows of the same model type").

---

## 2. Cross-workflow technique-reference syntax (the load-bearing precedent)

**Finding — the ref grammar is `<workflow>/<technique-file-id>` (slash), NOT `<workflow>::<group>::<op>`, for standalone root-level techniques.**

`post-impl-review` binds prism's standalone technique with:

```yaml
  - kind: technique
    id: structural-analysis-inline
    technique: prism/structural-analysis        # bare-string form, no deviation
```

`codebase-comprehension` binds prism's other standalone technique with the structured object form (call-site input deviation):

```yaml
  - kind: technique
    id: initial-lens-pass
    technique:
      name: prism/portfolio-analysis            # workflow / technique-file-id
      inputs:
        selected_lenses: '["pedagogy", "rejected-paths"]'
```

**Why slash, not `::group::op`:** `prism`'s `structural-analysis` and `portfolio-analysis` are **root-level standalone technique files** (`prism/techniques/structural-analysis.md`, `.../portfolio-analysis.md`) — prism's `workflow.yaml techniques:` declares only `variable-binding` as an activity-strategy technique; the analysis techniques are not collected into a named group. A reference to a standalone technique in another workflow is therefore `<workflow>/<technique-id>`. The `::group::op` form is for **grouped** operations (e.g. `cargo-operations::run-suite`, `review-assumptions::record`, `gitnexus-operations::detect-changes` — all grouped operations bound within work-package).

**Applies directly to ponytail:** `ponytail`'s `review-over-engineering`, `harvest-debt`, `report-gain`, `audit-repo`, `scope-intake`, `apply-ladder` are **all root-level standalone technique files** under `ponytail/techniques/*.md` (verified — no group subfolders; `ponytail/workflow.yaml techniques:` declares only `variable-binding`). They therefore bind exactly like prism's:

| Established design ref (prose) | **Exact ref to author** | Form |
|--------------------------------|-------------------------|------|
| `ponytail::review-over-engineering` | `ponytail/review-over-engineering` | bare string (or object if input deviation needed) |
| `ponytail::harvest-debt` | `ponytail/harvest-debt` | bare string |
| `ponytail::report-gain` | `ponytail/report-gain` | bare string (or object — see §4 input binding) |

> **Authoring note for scope-and-draft:** the established-design docs write these as `ponytail::<op>` in prose; the on-disk convention for standalone (ungrouped) cross-workflow techniques is the **slash form** `ponytail/<op>`, matching `prism/structural-analysis` and `prism/portfolio-analysis` verbatim. Use the slash form. (`get_resource` cross-workflow refs use `meta/bootstrap-protocol` slash form too; the `::` form is reserved for `group::op`.)

---

## 3. The ponytail techniques — composed signatures (what binds cleanly)

These inherit the `ponytail/techniques/TECHNIQUE.md` base contract (shared inputs `task_description`, `target_path` [default `.`], `lazy_intensity` [default `full`], `pass_scope` [default `change`]; rules incl. `report-only-no-apply`). The server composes the base into each on `get_technique`.

### `review-over-engineering` → produces `review-findings.md`

| | |
|---|---|
| **Inputs** | `lean_change` *(optional)* — the diff/solution to scan; when absent, read from `{target_path}` within `{pass_scope}`. Plus inherited `target_path` / `lazy_intensity` / `pass_scope`. |
| **Output** | `review_findings` → **artifact `review-findings.md`** — one line per finding (taxonomy tag, location, simpler alternative, lines saved), closing with a `net: -N lines` scoreboard; `Lean already. Ship.` when clean. |
| **Protocol** | (1) scan against taxonomy; (2) one line per finding; (3) score the net. **Reports only — applies nothing.** |

### `harvest-debt` → produces `debt-ledger.md`

| | |
|---|---|
| **Inputs** | inherited `target_path` only (greps the tree). |
| **Outputs** | `debt_ledger` → **artifact `debt-ledger.md`** — one row per `ponytail:` marker `<file>:<line>, <what simplified>. ceiling: <limit>. upgrade: <trigger>.`, grouped by file, no-trigger markers flagged; closes with `<N> markers, <M> with no trigger.` **and** `has_debt_markers` (boolean) — true when ≥1 row. |
| **Protocol** | (1) grep markers `(#\|//) ?ponytail:`; (2) build ledger; (3) signal result + set `has_debt_markers`. |

### `report-gain` → appends gain scoreboard to `debt-ledger.md`

| | |
|---|---|
| **Input** | `debt_ledger` — the harvested ledger whose foot the scoreboard is appended to (its row count is the only genuine per-repo figure). |
| **Output** | `gain_scoreboard` — honesty-bounded summary **appended to the foot of `debt-ledger.md`** (NOT a separate file): aggregate benchmark medians + real ledger row count + pointer to ledger. |
| **Rule** | `honesty-boundary-on-reporting` — never fabricate a per-repo savings number. |

**Clean-binding observations:**
- The three techniques map onto exactly the **two artifacts** the established design names (`review-findings.md`, `debt-ledger.md` with gain appended) — no new artifact names invented; the technique owns its artifact name (generic-not-overfit, per the activity rule).
- `harvest-debt` emits `has_debt_markers`; `report-gain` is gated on it. This is a producer→gate edge to replicate inside the new activity (mirrors ponytail's own `05-harvest-debt-and-report.yaml` step `when: has_debt_markers == true`).
- `report-gain` consumes `debt_ledger` (the producer's output name). Since `harvest-debt` lands its output as `debt_ledger` in the bag, the consumer binds by **implicit same-name binding** — no `step.technique.inputs` rename needed (honours `generic-not-overfit` / `binding-carries-only-deviations`).
- **`audit-repo` is deliberately NOT bound** — the work-package stage is change-scoped (review + harvest + report), not a whole-tree sweep (per 03-requirements §4.3).

---

## 4. The post-impl-review precedent — checkpoint + apply-loop shape (verbatim)

This is the exact structure the established design's `audit-findings-confirmed` + `simplification-apply-cycle` mirror.

### 4a. Blocking confirmation checkpoint (precedent: `file-index-table`)

```yaml
  - kind: checkpoint
    id: file-index-table
    message: "File index written to {change_block_index}. … confirm the rationale …"
    blocking: true
    options:
      - id: rationale-confirmed
        label: Rationale confirmed — no issues
        effect:
          setVariable:
            rationale_confirmed: true
      - id: rationale-confirmed-with-issues
        effect:
          setVariable:
            has_flagged_blocks: true
            rationale_confirmed: true
      - id: has-issues
        effect:
          setVariable:
            has_flagged_blocks: true
```

**Pattern:** `kind: checkpoint`, `blocking: true`, an interpolated `{var}` in the `message`, and each option carrying a `setVariable` effect that sets the boolean flag a downstream loop/condition reads. Some options set the "proceed" flag; the option that should drive the apply-loop additionally sets the loop-driver flag.

→ **Maps to `audit-findings-confirmed`:** message interpolates the scoreboard + `{audit_artifact}`; option `apply-simplifications` sets `audit_confirmed: true` + `needs_simplification: true`; option `audit-accepted` sets `audit_confirmed: true` only; `audit-findings-disputed` sets `needs_simplification: false`.

### 4b. Bounded `doWhile` apply loop (precedent: `review-fix-cycle`)

```yaml
  - kind: loop
    id: review-fix-cycle
    name: Review-Fix Cycle
    loopType: doWhile
    condition:
      type: or
      conditions:
        - { type: simple, variable: needs_code_fixes, operator: ==, value: true }
        - { type: simple, variable: needs_test_improvements, operator: ==, value: true }
    maxIterations: 3
    steps:
      - { kind: technique, id: apply-fixes, technique: apply-review-fixes }
      - kind: action            # reset the driver flags before re-review
        id: reset-fix-flags
        actions:
          - { action: set, target: needs_code_fixes, value: false, message: … }
          - { action: set, target: needs_test_improvements, value: false, message: … }
      - { kind: technique, id: re-…, technique: review-diff }   # re-run review to refresh scoreboard
```

**Pattern:** `kind: loop`, `loopType: doWhile`, a `condition` reading the driver flag(s), `maxIterations: N`, and loop body = apply step → **reset driver flag via `action: set`** → re-run the review/score step (UPDATES the same artifact instance in place).

→ **Maps to `simplification-apply-cycle`:** `loopType: doWhile`, `maxIterations: 3`, `condition` on `needs_simplification == true`; body = apply accepted simplifications → re-run `ponytail/review-over-engineering` to re-score net-lines (refreshing `review-findings.md` in place) → re-check safety floor → `action: set` reset `needs_simplification: false`.

### 4c. Decision gate / transition-override (precedent: `blocker-gate` decision)

post-impl-review also carries a `decisions:` block with a branch `transitionTo: implement` gated on `has_critical_blocker == true` (return-to-implement on a critical blocker). **Optional** for the new activity — the established design (§3) specifies a linear default transition to `post-impl-review` with no return-to-implement branch, but the `decisions:`/`transitionTo` mechanism is available if a safety-floor breach should bounce back to `implement`.

### 4d. Conditional / `when`-gated technique steps (precedent: both files)

- `when:` gate on a step (boolean expr): `when: gitnexus_indexed == true`, `when: has_debt_markers == true` (ponytail's own report-gain gate).
- `condition:` block (structured) on a step: `type: simple/not/and/or` with `variable`/`operator`/`value`.

→ The new activity's `report-gain` step uses `when: has_debt_markers == true`, identical to ponytail's `05-harvest-debt-and-report.yaml`.

---

## 5. Activity numbering / artifactPrefix / transition-wiring convention

### 5a. Numbering & file naming
- Activity files are `NN-<id>.yaml` under `activities/`, two-digit zero-padded, in pipeline order: `01-start-work-package.yaml` … `09-post-impl-review.yaml` … `14-codebase-comprehension.yaml`.
- The activity-file `id:` is the bare kebab id (no number) — e.g. `id: post-impl-review` inside `09-post-impl-review.yaml`.
- **artifactPrefix is server-assigned per slot, NOT authored in YAML.** The server stamps each artifact filename with the slot prefix (e.g. this pattern-analysis artifact is `04-pattern-analysis.md`; the new activity's artifacts become `09-review-findings.md`, `09-debt-ledger.md`). Authors name the bare artifact (`review-findings.md`) in the technique output; the server prefixes it. A logical artifact has exactly ONE numbered instance, updated in place by its own loop (artifact-location rule).

### 5b. Insertion + renumber (slot 09)
The new `lean-coding-audit` inserts at **09**; current 09–14 shift to 10–15:

| New # | File to create / rename | id |
|-------|--------------------------|-----|
| 08 | `08-implement.yaml` (unchanged) | `implement` |
| **09** | **`09-lean-coding-audit.yaml` (NEW)** | **`lean-coding-audit`** |
| 10 | `09-post-impl-review.yaml` → `10-post-impl-review.yaml` | `post-impl-review` |
| 11 | `10-validate.yaml` → `11-validate.yaml` | `validate` |
| 12 | `11-strategic-review.yaml` → `12-strategic-review.yaml` | `strategic-review` |
| 13 | `12-submit-for-review.yaml` → `13-submit-for-review.yaml` | `submit-for-review` |
| 14 | `13-complete.yaml` → `14-complete.yaml` | `complete` |
| 15 | `14-codebase-comprehension.yaml` → `15-codebase-comprehension.yaml` | `codebase-comprehension` |

> **Note:** activity `id:`s are referenced by-id in `transitions[].to` and `decisions[].branches[].transitionTo`, **not** by file number — so renaming the files does not by itself break transition refs. The only transition edits required are the two below.

### 5c. Transition edges to rewire (id-based, default linear form)
Default linear transition shape (verified in `10-validate.yaml`):
```yaml
transitions:
  - to: <next-activity-id>
    isDefault: true
```
- **`08-implement.yaml`:** change its terminal `transitions: [{ to: post-impl-review, isDefault: true }]` → `{ to: lean-coding-audit, isDefault: true }` (verified current value at the foot of 08: `to: post-impl-review`).
- **`09-lean-coding-audit.yaml` (new):** `transitions: [{ to: post-impl-review, isDefault: true }]`.
- **`post-impl-review` outbound is unchanged** (`to: validate`) and all downstream edges (`validate → strategic-review`, etc.) are unchanged — they reference ids, and the new activity does not sit on those edges.

### 5d. README + per-folder README convention
- `work-package/README.md` carries an activity table + a mermaid pipeline graph; the new activity adds one row and one node. (workflow-design activity rule: "Every workflow must include a README.md at the root and in each subfolder.")
- The cross-workflow binding reuses `ponytail/resources/*` (the-ladder, review-taxonomy, ponytail-marker-convention, honesty-boundary) and `ponytail/techniques/*` directly — **no new technique files are authored in `work-package`** for the bound ponytail operations (they live in ponytail and are referenced cross-workflow, exactly as prism's are).

---

## 6. Content conventions (rules, effects, conditions, artifact-location)

| Convention | Precedent | Application |
|------------|-----------|-------------|
| **Workflow-level rules** live in `work-package/workflow.yaml rules:` under `workflow:` / `activity:` keys | work-package `workflow.yaml rules.workflow[]` | The 5 settled rules (§5 of 03-requirements) append to `rules.workflow[]`; existing rules unchanged. Ponytail's own `safety-floor-never-simplified`, `report-only-no-apply` are the source statements. |
| **Structural backing for critical rules** (checkpoint/condition/transition, not prose) | post-impl-review's blocking checkpoint + `blocker-gate` decision; ponytail's `safety_floor_cleared` gate | `safety-floor-never-simplified` → `validate`/`condition` guard in the apply step; `report-before-apply` → blocking `audit-findings-confirmed` precedes the loop; `audit-after-implement-before-review` → transition ordering 08→09→10. |
| **Checkpoint effects** mutate state only via `setVariable` | every checkpoint option `effect.setVariable` | `audit_confirmed`, `needs_simplification` set via option effects; no ad-hoc mutation (variable-mutation-source rule). |
| **New variables** declared in `work-package/workflow.yaml variables[]` with type + default | the 60+ existing `variables[]` entries (e.g. `needs_code_fixes: boolean = false`) | New booleans `audit_confirmed`, `needs_simplification` (default `false`); `has_debt_markers` (the ponytail output, default `false`); optionally `safety_floor_cleared`. Mirror ponytail's variable declarations. |
| **Bound steps carry no `description`/`note`** — id + technique + structural only | post-impl-review steps (`id` + `technique` + optional `when`/`condition`/`actions`) | Every step in the new activity is `kind: technique` (bound) or a pure `kind: action`/`kind: checkpoint`/`kind: loop`; no prose description on bound steps (AP-64 / activity rule). |
| **Implicit same-name binding; deviations only** | validate's `run-suite` with `inputs: { build_scope: --workspace }` only when differing | Bind ponytail techniques bare-string unless an input differs from default/same-name. `report-gain` reads `debt_ledger` by same-name; no rename. A call-site `lazy_intensity`/`pass_scope` literal deviation is added only if the work-package stage wants non-default review depth. |

---

## 7. Proposed structure shown alongside the precedent (the comparison table)

| Dimension | post-impl-review precedent (09) | **Proposed `lean-coding-audit` (new 09)** | Alignment |
|-----------|---------------------------------|--------------------------------------------|-----------|
| File / id | `09-post-impl-review.yaml` / `post-impl-review` | `09-lean-coding-audit.yaml` / `lean-coding-audit` | ✅ aligned (NN-id) |
| `required` | `true` | `true` | ✅ aligned |
| Cross-wf technique ref | `prism/structural-analysis` (slash, standalone) | `ponytail/review-over-engineering`, `ponytail/harvest-debt`, `ponytail/report-gain` (slash, standalone) | ✅ aligned — same grammar |
| Object-form input deviation | `codebase-comprehension`'s `{ name: prism/portfolio-analysis, inputs: {...} }` | object form only if non-default `lazy_intensity`/`pass_scope`/`lean_change` needed; else bare string | ✅ aligned |
| Producer→gate edge | `gitnexus_indexed` gates preflight | `has_debt_markers` gates `report-gain` step (`when:`) | ✅ aligned — from ponytail's own activity |
| Blocking checkpoint | `file-index-table` (blocking, `setVariable`) | `audit-findings-confirmed` (blocking, `setVariable`) | ✅ aligned |
| Bounded apply loop | `review-fix-cycle` (`doWhile`, max 3, reset-flag + re-review) | `simplification-apply-cycle` (`doWhile`, max 3, reset `needs_simplification` + re-score) | ✅ aligned |
| Artifacts | (none new; reads diff) | `review-findings.md`, `debt-ledger.md` (gain appended) — server-prefixed `09-` | ➕ adds two; reuses ponytail's own artifact names |
| Transition | `to: validate` (default) | `to: post-impl-review` (default); inbound rewired from `implement` | ✅ aligned (linear default) |
| Return-to-implement decision | `blocker-gate` → `transitionTo: implement` | **Diverge:** linear only by default (no bounce-back); mechanism available if safety-floor breach should return to `implement` | ⚠️ divergence — justified by 03-requirements §3 (linear default) |
| Rules location | `workflow.yaml rules` | append 5 rules to `rules.workflow[]` | ✅ aligned |
| Resources | references prism resources | references `ponytail/resources/*` cross-workflow; no new technique files in work-package | ✅ aligned |

**Divergences to carry forward (for the `patterns-confirmed` checkpoint):**
1. **Slash vs `::` ref form** — established-design prose says `ponytail::<op>`; the verified on-disk convention for ungrouped standalone techniques is `ponytail/<op>`. *Recommend adopting the slash form* (matches prism precedent exactly).
2. **No return-to-implement decision branch** — post-impl-review has a `blocker-gate` decision with `transitionTo: implement`; the lean-coding-audit default is linear-only (per 03-requirements §3). The decision/`transitionTo` mechanism is documented as available but not adopted by default.
3. **Two artifacts, not one** — the default reuses ponytail's native artifact names (`review-findings.md` + `debt-ledger.md`) rather than folding into a single `lean-coding-audit.md` (generic-not-overfit: the technique owns its artifact name). The single-file fold is the noted alternative.

---

## 9. Checkpoint resolution — `patterns-confirmed` → `adopt-all`

**Decision (orchestrator, on the user's behalf): `adopt-all`.** Every extracted pattern in §8 is adopted wholesale. The three items listed above as "divergences to carry forward" are **settled** as follows — they are now the authoritative input to `scope-and-draft`, not open questions:

| # | Item | Settled resolution |
|---|------|--------------------|
| 1 | **Cross-workflow ref form** | **CORRECTED to the slash form.** Author `ponytail/review-over-engineering`, `ponytail/harvest-debt`, `ponytail/report-gain`. The `::` prose in the earlier established-design docs (03-requirements / 03-assumptions-log / the README "Integration pattern" note) was **wrong**: `<workflow>::<group>::<op>` is reserved for **grouped** operations only; ponytail's three ops are root-level standalone technique files, so they bind by `<workflow>/<technique-id>` exactly like `prism/structural-analysis` and `prism/portfolio-analysis`. This is a correction, not a stylistic preference — `scope-and-draft` MUST emit the slash form. |
| 2 | **Transition shape** | **Linear-only default, NO return-to-implement blocker-gate branch.** The new `lean-coding-audit` activity carries a single default transition `to: post-impl-review`; inbound is rewired from `implement`. No `decisions:`/`transitionTo: implement` branch is authored (per 03-requirements §3). The mechanism remains documented (§4c) as available for a future safety-floor-breach bounce-back, but is not part of the adopted design. |
| 3 | **Artifact shape** | **Two native artifacts, NOT one folded file.** Adopt ponytail's own `review-findings.md` (from `review-over-engineering`) and `debt-ledger.md` (from `harvest-debt`, with `report-gain`'s scoreboard appended to its foot). The single-file `lean-coding-audit.md` fold is rejected (generic-not-overfit: the technique owns its artifact name). Both land server-prefixed `09-`. |

**Net effect on `scope-and-draft`:** author the §8 pattern set verbatim, applying the three settled resolutions above. The only authoring change versus the raw established-design prose is the ref-form correction (item 1, `::` → `/`); items 2 and 3 confirm the established-design defaults unchanged.

---

## 8. Summary — patterns to adopt

1. **Cross-workflow ref:** `ponytail/review-over-engineering`, `ponytail/harvest-debt`, `ponytail/report-gain` (slash form; standalone techniques), bare-string unless a call-site input deviates — modelled on `prism/structural-analysis` and `prism/portfolio-analysis`.
2. **Step sequence inside the activity:** `review-over-engineering` → `harvest-debt` → `report-gain` (gated `when: has_debt_markers == true`), mirroring ponytail `03` + `05`.
3. **Blocking checkpoint `audit-findings-confirmed`** with `setVariable` option effects, modelled on post-impl-review's `file-index-table`.
4. **Bounded `doWhile` `simplification-apply-cycle`** (`maxIterations: 3`, reset-flag + re-score body), modelled on post-impl-review's `review-fix-cycle`.
5. **Insertion at slot 09 + renumber 10–15**, transition edges rewired by-id (`implement → lean-coding-audit → post-impl-review`); only `08-implement.yaml`'s outbound edge and the new file's transitions change.
6. **artifactPrefix is server-assigned** (`09-`); author bare artifact names; one instance updated in place by the loop.
7. **Rules append to `workflow.yaml rules.workflow[]`**; critical rules backed structurally (checkpoint/condition/transition), guidance-only rules carried in technique content.
8. **New variables** (`audit_confirmed`, `needs_simplification`, `has_debt_markers`) declared in `workflow.yaml variables[]` with defaults; mutated only via checkpoint `setVariable` / worker `variables-changed`.
