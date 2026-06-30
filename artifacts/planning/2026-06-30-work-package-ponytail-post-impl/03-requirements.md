# work-package — Requirements Refinement

**Mode:** Update
**Target workflow:** `work-package`
**Change:** Add a new post-implementation **ponytail lean-coding audit** activity, inserted after `implement` (08), integrating the standalone `ponytail` workflow's techniques cross-workflow.

This document captures the workflow specification across its design dimensions. Update mode elicits **purpose, activity list, checkpoints, artifacts, rules**; the activity model, variables, and techniques dimensions are inherited from the established `work-package` design and are touched only where this change adds to them.

**Requirements confirmed.** All five dimensions are confirmed, and the design assumptions the spec rests on are reconciled — see [03-assumptions-log.md](03-assumptions-log.md). The five genuine design judgements (insertion point, run policy, artifact shape, gate mode, debt-ledger persistence) were each **accepted at the default captured here**; the values below are the settled spec.

---

## Design dimensions (ordered)

`purpose → activity list → checkpoints → artifacts → rules`

Status legend: ⬚ pending · 🔎 captured (awaiting confirmation) · ✅ confirmed

| # | Dimension | Status |
|---|-----------|--------|
| 1 | Purpose | ✅ confirmed |
| 2 | Activity list | ✅ confirmed |
| 3 | Checkpoints | ✅ confirmed |
| 4 | Artifacts | ✅ confirmed |
| 5 | Rules | ✅ confirmed |

---

## 1. Purpose

**Captured (default, grounded in confirmed intake context):**

Add a discrete post-implementation **lean-coding audit** stage to `work-package` that applies the `ponytail` lazy-senior-developer lens to the change just implemented, before it proceeds to validation and strategic review.

- **Outcome of the stage.** The just-implemented change is reviewed against the over-engineering taxonomy (delete / stdlib / native / yagni / shrink), quantified with a net-lines scoreboard, and every deliberate simplification already in the tree is harvested into a tracked `ponytail:`-marker debt ledger — all judged against a non-negotiable safety floor that is never simplified away.
- **Who triggers it, and when.** It runs automatically as the next stage after `implement` completes (every work package passes through it), not on ad-hoc request. It is part of the standard `work-package` pipeline.
- **Value over doing it ad hoc.** Leanness becomes a reviewed, recorded gate inside the pipeline rather than an informal habit: the over-engineering of each change is tagged and scored, and deliberate ceilings are captured as trackable debt with upgrade triggers, so a later reviewer can see what was simplified and why.
- **Boundary vs `strategic-review` (11).** Complementary, not duplicative. `strategic-review` judges whether the *scope* of the change matches the issue (was anything extraneous added relative to the requirement). The ponytail stage applies the *lean-coding* lens to whatever was implemented: tag-and-score over-engineering against the taxonomy and harvest deliberate-simplification debt, regardless of scope-vs-issue fit. The ponytail stage runs early (right after implement); strategic-review runs late (after validate).

---

## 2. Activity list

**Captured (default, grounded in confirmed purpose + the existing `work-package` pipeline).**

### 2.1 The new activity

| Field | Value |
|-------|-------|
| **id** | `lean-coding-audit` |
| **name** | Lean-Coding Audit |
| **one-line purpose** | Apply the ponytail lazy-senior-developer lens to the just-implemented change: tag-and-score over-engineering against the taxonomy, harvest deliberate-simplification debt, all against a fixed safety floor. |
| **user-interaction** | Yes — interactive. At least one blocking checkpoint where the user confirms the audit findings / scoreboard (and the harvested debt markers) before the pipeline proceeds. Detailed in the *checkpoints* dimension. |
| **required** | `required: true` — every work package passes through it (per the confirmed purpose: it runs automatically as the next stage, not on ad-hoc request). |
| **expected artifacts** | A durable audit artifact under the planning folder. Default: `lean-coding-audit.md` (server-prefixed to match its slot, e.g. `09-lean-coding-audit.md`), holding the over-engineering taxonomy findings (delete / stdlib / native / yagni / shrink), the net-lines scoreboard, the harvested `ponytail:`-marker debt ledger, and the safety-floor record. Detailed in the *artifacts* dimension. |

### 2.2 Placement in the ordered activity list

Inserted **immediately after `implement` (08)**, at the head of the post-implementation band, **before** the existing `post-impl-review` (code-quality review). Everything from the current slot 09 onward shifts down by one.

**Existing order (relevant tail):** … `implement` (08) → `post-impl-review` (09) → `validate` (10) → `strategic-review` (11) → `submit-for-review` (12) → `complete` (13) → `codebase-comprehension` (14).

**Proposed order (relevant tail):**

| New # | Activity | Status |
|-------|----------|--------|
| 08 | `implement` | unchanged |
| **09** | **`lean-coding-audit`** | **NEW** |
| 10 | `post-impl-review` | renumbered (was 09) |
| 11 | `validate` | renumbered (was 10) |
| 12 | `strategic-review` | renumbered (was 11) |
| 13 | `submit-for-review` | renumbered (was 12) |
| 14 | `complete` | renumbered (was 13) |
| 15 | `codebase-comprehension` | renumbered (was 14) |

**Rationale for slot 09 (before `post-impl-review`):** the confirmed purpose places the ponytail stage "early (right after implement)" and strategic-review "late (after validate)." Leaning the change before the broader code-quality review (`post-impl-review`) means the diff that downstream review reasons about is already the leaned diff, and the harvested debt ledger + scoreboard are available as inputs to those later reviews.

### 2.3 Transition wiring

- **Inbound:** `implement` (08) transitions to `lean-coding-audit` where it currently transitions to `post-impl-review`.
- **Outbound:** `lean-coding-audit` transitions to `post-impl-review` (the existing next stage). Default linear flow; any rework/refine loop internal to the audit is captured in the *checkpoints* and *activity model* (inherited) dimensions.

### 2.4 Not adding

No other activities are added, removed, or reordered beyond the single insertion + downstream renumber. The activity *model*, *variables*, and *techniques* dimensions are inherited from the established `work-package` design and touched only where this insertion adds to them.

---

## 3. Checkpoints

**Captured (default, grounded in the ponytail audit content + the `post-impl-review` checkpoint convention).**

Only the NEW `lean-coding-audit` activity introduces checkpoints; no existing activity's checkpoints change. The convention mirrors `post-impl-review` (09): a primary blocking confirmation gate with `setVariable` effects, plus a bounded apply-fixes loop driven by a flag. One blocking decision gate is the minimum; an optional simplification-apply loop is included as a default because the taxonomy review naturally surfaces simplifications to apply.

### 3.1 `audit-findings-confirmed` — primary gate (blocking)

The user reviews the audit output — taxonomy findings (delete / stdlib / native / yagni / shrink), the net-lines scoreboard, and the harvested `ponytail:`-marker debt ledger — and decides whether to accept it or apply simplifications.

| Field | Value |
|-------|-------|
| **message** | "Lean-coding audit complete. Net-lines scoreboard: {…}. Over-engineering findings under each taxonomy bucket and the harvested ponytail-debt ledger are in {audit_artifact}, all judged against the safety floor. Accept the audit as-is, or apply the recommended simplifications?" |
| **blocking** | `true` |

| Option | Label | Effect |
|--------|-------|--------|
| `audit-accepted` | Accept audit — no changes to apply | `setVariable: audit_confirmed: true` |
| `apply-simplifications` | Apply recommended simplifications | `setVariable: audit_confirmed: true`, `needs_simplification: true` (drives the apply loop) |
| `audit-findings-disputed` | Findings need correction | `setVariable: needs_simplification: false` (re-run / amend the audit; no simplifications applied this pass) |

### 3.2 `simplification-apply-cycle` — bounded loop (gated)

Mirrors `post-impl-review`'s `review-fix-cycle` (`doWhile`, `maxIterations: 3`). Runs only when `needs_simplification == true`. Applies the accepted simplifications, re-scores net-lines, re-checks the safety floor, and resets the flag — so the user's accepted simplifications are actually realized in the tree and the scoreboard reflects the post-simplification state.

### 3.3 Safety-floor guard (structural, not a checkpoint)

The "never simplify away the safety floor" constraint is backed structurally (a `validate`/`condition` action inside the audit technique, surfaced in the *rules* dimension) rather than relying solely on a checkpoint, so a simplification that breaches the floor cannot be applied silently.

### 3.4 Auto-advance / non-blocking

No auto-advancing checkpoints by default — the audit is a recorded gate, so the primary findings checkpoint is blocking (consistent with the confirmed purpose: "a reviewed, recorded gate inside the pipeline"). An optional non-blocking variant (auto-accept after Ns when the scoreboard shows net-negative lines and no floor risk) is noted as a possible refinement but is NOT the default.

---

## 4. Artifacts

**Captured (default, grounded in the ponytail techniques' declared `#### artifact` outputs + the work-package planning-folder artifact convention).**

Each artifact is named by its producing technique's `#### artifact` output (per the elicitation guide). The ponytail techniques being bound cross-workflow already declare their artifact names; the `work-package` integration reuses those names, landed under this work package's `planning_folder_path` with the server-assigned numeric prefix for the new activity's slot (09). Per the artifact-location rule, each logical artifact has exactly ONE numbered instance, created by `lean-coding-audit` and updated in place by its own loop.

### 4.1 Artifacts produced by `lean-coding-audit`

| Artifact (bare name) | Produced by (bound technique output) | Contents |
|----------------------|--------------------------------------|----------|
| `review-findings.md` | `ponytail::review-over-engineering` → `review_findings` | One line per over-engineering finding for the implemented change, each carrying a taxonomy tag (delete / stdlib / native / yagni / shrink), the location, the simpler alternative, and lines saved — closing with a `net: -N lines` scoreboard. Records a clean result when the change is already lean. |
| `debt-ledger.md` | `ponytail::harvest-debt` → `debt_ledger`; gain scoreboard appended by `ponytail::report-gain` | One row per harvested `ponytail:` marker (`<file>:<line>, <what was simplified>. ceiling: <limit>. upgrade: <trigger>.`), grouped by file; no-trigger markers flagged. The honesty-bounded **gain scoreboard** (`report-gain`) is appended to the foot of this same ledger — it is not a separate file. |

### 4.2 Naming & placement

- **Default consolidation:** the two artifacts above are the ponytail techniques' native outputs. For the `work-package` planning folder, the **default** is to keep them as the techniques emit them (`review-findings.md`, `debt-ledger.md`), each server-prefixed for slot 09 (e.g. `09-review-findings.md`, `09-debt-ledger.md`). 
  - *Alternative (noted, not default):* fold both into a single `lean-coding-audit.md` activity artifact. Kept as an option for the artifacts confirmation, but the grounded default reuses the techniques' own artifact names so the cross-workflow binding stays generic-not-overfit (the technique owns its artifact name).
- **Location:** under the work package's `planning_folder_path` (server-resolved absolute path), NOT a repo-local `PONYTAIL-DEBT.md`. The ledger is the workflow's artifact form of ponytail's optional persisted `PONYTAIL-DEBT.md`.
- **Lifecycle:** the `simplification-apply-cycle` loop UPDATES these instances in place (re-scored net-lines, refreshed ledger), preserving their original prefix — no new numbered instance per pass.

### 4.3 Not produced

The repo-wide `audit-repo` artifact (whole-tree audit) is NOT produced by this activity — the work-package stage is scoped to the just-implemented change (review-over-engineering + harvest-debt + report-gain), not a full-repo sweep. Whole-repo audit stays the standalone `ponytail` workflow's concern.

---

## 5. Rules

**Captured (default, grounded in ponytail's own `workflow.yaml` rules, adapted to the `work-package` pipeline; each classified structural vs guidance-only per the elicitation guide).**

These are added to `work-package`'s `workflow.yaml` `rules[]` (workflow-level, cross-activity) — they govern the new `lean-coding-audit` activity and its boundary with neighbouring stages. Existing `work-package` rules are unchanged.

| Rule id | Statement | Enforcement |
|---------|-----------|-------------|
| `safety-floor-never-simplified` | The safety floor is never simplified away during the lean-coding audit — understanding the problem, input validation at trust boundaries, error handling that prevents data loss, security, accessibility, anything explicitly requested by the issue, and one runnable check for non-trivial logic. A simplification that would breach the floor is rejected. | **Structural** — backed by a `validate`/`condition` guard in the audit technique (see checkpoint 3.3) plus a `safety_floor_cleared` gate, mirroring ponytail's own backing. NOT guidance-only. |
| `report-before-apply` | The over-engineering review, debt harvest, and gain report are read-only — they list findings into their artifacts and change no code. Code is only ever changed in the `simplification-apply-cycle`, and only on simplifications the user accepted at the `audit-findings-confirmed` gate. | **Structural** — backed by the blocking `audit-findings-confirmed` checkpoint preceding the `simplification-apply-cycle` loop, and inherited from ponytail's `report-only-no-apply` technique contract. |
| `audit-after-implement-before-review` | The lean-coding audit runs after `implement` and before the broader `post-impl-review`, so downstream review reasons about the leaned diff and can consume the scoreboard + debt ledger. | **Structural** — backed by the activity-graph transition ordering (08 → 09 lean-coding-audit → 10 post-impl-review). |
| `leanness-reported-honestly` | The net-lines scoreboard and gain figures are reported honestly — the harvested debt ledger is the source of the real per-change count; aggregate/benchmark figures never overstate the gain. | **Guidance-only** — an honesty norm carried in the `report-gain` technique content (ponytail's `honesty-boundary-on-reporting`); no structural backing beyond the artifact format. |
| `complementary-not-duplicative-with-strategic-review` | The lean-coding audit applies the over-engineering/leanness lens; it does NOT re-adjudicate scope-vs-issue fit, which remains `strategic-review`'s concern. The two stages stay complementary. | **Guidance-only** — a boundary norm in the activity description / technique content; the confirmed purpose (§1) is its source. |

**Classification summary:** three structural rules (safety floor, report-before-apply, ordering) backed by checkpoints/conditions/transitions per the "encode critical constraints as structure" activity rule; two guidance-only norms (honest reporting, boundary with strategic-review) that cannot be mechanically violated and so need no structural backing.
