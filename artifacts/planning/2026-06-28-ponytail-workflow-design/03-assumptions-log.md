# Assumptions Log

**Work Package:** ponytail Workflow Design
**Workflow:** workflow-design → requirements-refinement (create mode)
**Created:** 2026-06-28
**Last Updated:** 2026-06-28
**Status:** Finalized — all assumptions resolved (12 surfaced: 8 audit-resolved, 4 accepted at interview); 0 deferred

---

## Summary

| Phase/Task | Assumptions | Confirmed | Corrected | Deferred |
|------------|-------------|-----------|-----------|----------|
| Requirements Refinement (elicitation) | 8 | 8 | — | — |
| Requirements Refinement (reconciliation + interview) | 12 | 12 (8 audit-resolved + 4 accepted) | 0 | 0 |
| **Total** | **20** | **20** | **0** | **0** |

The 8 elicitation-phase rows are the per-dimension design decisions (each carries an implicit assumption), all confirmed at the `dimension-confirmed` checkpoints. The 12 reconciliation rows are the assumptions surfaced by the `collect` step; 8 were settled autonomously by audit passes and 4 genuine design judgements (PA-10, PA-2, PA-11, PA-1) were **accepted** at the `assumption-decision` checkpoints. No assumption was corrected or deferred (`has_deferred_assumptions = false`).

---

# Pre-Implementation Phases

## Requirements Elicitation

**Date:** 2026-06-28

This section records the design decisions made for each of the create-mode design dimensions (`design_dimensions = purpose, activity list, activity model, checkpoints, artifacts, variables, techniques, rules`), elicited one dimension at a time per the [elicitation-guide](../../../../workflows/workflow-design/resources/elicitation-guide.md). Under delegated design authority the worker proposed each dimension; the orchestrator confirms on the user's behalf at the `dimension-confirmed` checkpoint.

### Dimension 1 — Purpose

**Decision:** The `ponytail` workflow drives a coding task, change, or codebase toward the leanest solution that still clears a non-negotiable safety floor, tracking every deliberate simplification as `ponytail:`-marked debt. Target domain: any coding/engineering task where over-engineering, bloat, or unnecessary dependencies are a risk. Value over ad-hoc: the discipline is enforced as structure (the ladder is applied only *after* the problem is understood; the safety floor is a gate, not a guideline; deferrals are harvested into a ledger so "later" cannot become "never").

**Rationale:** Direct distillation of the ponytail skill's thesis ("the best code is the code never written; lazy = efficient not careless") plus the safety-floor section ("When NOT to be lazy"). A workflow adds value over the raw skill by making the ordering (understand → climb → mark → harvest) and the gate (safety floor) first-class structure rather than prose an agent can drift past.

### Dimension 2 — Activity list

**Decision:** Five activities (sequential spine of three, two optional/gated):

| # | Activity | Purpose | Optional? | Artifact |
|---|----------|---------|-----------|----------|
| 01 | `intake-and-scope` | Capture the task or repo target, set intensity (lite/full/ultra), read and trace the code the change touches before climbing the ladder | required | `lean-brief.md` |
| 02 | `apply-ladder` | Produce the minimal solution by climbing the 7-rung ladder, mark `ponytail:` ceilings, enforce the safety floor + one runnable check | required | `lean-change.md` |
| 03 | `over-engineering-review` | Diff-scoped review using the 5-tag taxonomy (delete/stdlib/native/yagni/shrink), one line per finding, ending in a `net: -N lines` scoreboard | required | `review-findings.md` |
| 04 | `repo-audit` | Repo-wide over-engineering hunt, biggest-cut-first, ending in `net: -N lines, -M deps` | optional (gated) | `audit-findings.md` |
| 05 | `harvest-debt-and-report` | Harvest `ponytail:` markers into a debt ledger (ceiling + upgrade trigger, `no-trigger` flag); optionally emit the honesty-bounded gain scoreboard | required | `debt-ledger.md` |

**Rationale:** Maps the six ponytail skills onto the workflow's activities: `ponytail` (the always-on mode) splits across intake (understand) + apply-ladder (build); `ponytail-review` → over-engineering-review; `ponytail-audit` → repo-audit; `ponytail-debt` → harvest-debt; `ponytail-gain` → the report tail of activity 05. `ponytail-help` (a reference card, low distil value per the brief) is NOT given an activity — it becomes a resource/reference only. Collapsing gain into the debt-harvest activity (rather than a sixth activity) reflects that gain is a one-shot display, not a phase that produces a durable workflow artifact, and the debt ledger is the only honest per-repo number — so the two belong together (DA-9).

### Dimension 3 — Activity model

**Decision:** Linear spine `intake-and-scope → apply-ladder → over-engineering-review` with a conditional branch at the review's exit:
- `over-engineering-review → repo-audit` when `intensity == ultra` OR `scope == repo` (the gate)
- `over-engineering-review → harvest-debt-and-report` otherwise (default)
- `repo-audit → harvest-debt-and-report` (always)

`initialActivity: intake-and-scope`. Terminal activity: `harvest-debt-and-report`. No rework loops at the activity level — within-activity iteration (forEach over review findings, forEach over `ponytail:` markers) lives inside the activities, not as activity-graph loops.

**Rationale:** The three-activity spine is the unconditional ponytail run (understand → build lean → review the diff). Repo-audit is the only branch because it is the only genuinely optional, expensive scope expansion — gated exactly as the brief proposes (`intensity == ultra` or explicit repo scope), following prism's precedent of a string `pipeline_mode`/`mode` variable gating activity transitions via `simple` `==` conditions. Debt harvest is always reached because every run that climbed the ladder may have left `ponytail:` markers worth tracking.

### Dimension 4 — Checkpoints

**Decision:** Three checkpoints, all minimal-interaction (the brief and ponytail's output discipline both favour low ceremony):

| Activity | Checkpoint | Question | Options | Blocking |
|----------|------------|----------|---------|----------|
| 01 intake-and-scope | `intensity-and-scope-confirmed` | Confirm intensity (lite/full/ultra) and scope (change/repo) before climbing | lite / full / ultra each with `setVariable: intensity`; scope captured alongside | blocking |
| 02 apply-ladder | `safety-floor-cleared` | Confirm the minimal solution clears the safety floor (validation, error-handling, security, accessibility, hardware calibration, the one runnable check) before proceeding to review | confirmed / needs-work (loops back within activity) | blocking |
| 04 repo-audit | (none — autonomous once gated in) | — | — | — |

**Rationale:** The safety floor is the workflow's single non-negotiable invariant, so it gets a *blocking* checkpoint (design principle 10: encode constraints as structure, not just text — DA-3 reconciled this against the principle). Intensity must be set before the ladder runs because it governs strictness and whether repo-audit fires, so it is captured at intake. Review/audit/debt activities are read-only reporting passes (the skills are explicit: "lists findings, applies nothing") so they need no decision gate — matching prism's "minimal interaction" rule. `ponytail-gain`'s honesty boundary is enforced as a rule + resource, not a checkpoint, because it is a constraint on output content, not a user decision.

### Dimension 5 — Artifacts

**Decision:** One artifact per activity, each named by its producing technique's output:
- `lean-brief.md` (intake) — task/target, intensity, scope, and the end-to-end trace of what the change touches
- `lean-change.md` (apply-ladder) — the minimal solution with `ponytail:` ceiling comments and the one runnable check
- `review-findings.md` (over-engineering-review) — tagged findings + `net: -N lines` scoreboard
- `audit-findings.md` (repo-audit, optional) — ranked repo-wide findings + `net: -N lines, -M deps`
- `debt-ledger.md` (harvest-debt-and-report) — the `ponytail:` marker ledger with ceiling/upgrade/`no-trigger`, plus optional gain scoreboard appended

**Rationale:** Each ponytail skill that produces a durable output maps to exactly one artifact. `ponytail-gain` produces no durable artifact of its own (it is a one-shot scoreboard) so it appends to the debt-ledger artifact rather than minting a new file — consistent with the artifact-location rule's "one logical artifact per bare filename." Naming follows the lean/findings/ledger vocabulary the skills themselves use.

### Dimension 6 — Variables

**Decision:** Workflow-level state variables:

| Variable | Type | Default | Required | Purpose |
|----------|------|---------|----------|---------|
| `task_description` | string | — | true | The coding task, change, or audit target the user wants made lean |
| `target_path` | string | `.` | false | Path to the code or repo under the lazy lens |
| `intensity` | string | `full` | false | `lite` / `full` / `ultra` — governs strictness and gates repo-audit |
| `scope` | string | `change` | false | `change` (diff-scoped) or `repo` (whole-tree) — gates repo-audit |
| `safety_floor_cleared` | boolean | `false` | false | Gate set by the `safety-floor-cleared` checkpoint before review |
| `has_debt_markers` | boolean | `false` | false | True iff `ponytail:` markers were found during harvest; gates ledger emission |

**Rationale:** `intensity` and `scope` are plain string variables (NOT schema enums) gated by `simple` `==` conditions — exactly prism's `pipeline_mode` pattern (DA-5 reconciled this against the convention). The brief is explicit on this point. `safety_floor_cleared` backs the blocking checkpoint as structure. Defaults mirror ponytail's own resolution (`full` is the default mode; `change`/diff scope is the common case).

### Dimension 7 — Techniques

**Decision:** A workflow-local `ponytail-operations` technique group (base `TECHNIQUE.md` + one operation file per op), holding five operations:
- `apply-ladder` — capability: climb the 7 rungs after understanding the problem; inputs: task, traced-context, intensity; protocol: the rung sequence + safety-floor gate + mark ceilings + leave one runnable check; outputs: `lean_change` (artifact `lean-change.md`)
- `review-over-engineering` — diff-scoped; inputs: diff/change; outputs: `review_findings` (artifact `review-findings.md`) with the `net:` scoreboard
- `audit-repo` — repo-wide; inputs: target_path; outputs: `audit_findings` (artifact `audit-findings.md`)
- `harvest-debt` — grep `ponytail:` markers; outputs: `debt_ledger` (artifact `debt-ledger.md`), `has_debt_markers`
- `report-gain` — honesty-bounded benchmark-median scoreboard; outputs: `gain_scoreboard` (side-effect; appended to ledger, no per-repo fabrication)

Reuse before authoring: the activity-level strategy techniques are the existing meta `scatter-gather` (for the forEach-over-findings and forEach-over-markers loops) and `variable-binding` (universal). The five ponytail operations are genuinely new domain capabilities with no existing equivalent, so they are authored locally as a group.

**Rationale:** Convention from the review-assumptions group (base TECHNIQUE.md + per-op files, activity-group-shorthand resolution). Each operation owns its artifact identity. `report-gain` is modelled as a technique even though it persists nothing durable, so its honesty-boundary rule lives in one authoritative place. Per the activity-group-shorthand rule, steps inside the `harvest-debt-and-report` activity whose ops are collected into a same-named group reference them bare (`technique: harvest-debt`); foreign refs (`scatter-gather`, meta ops) stay qualified.

### Dimension 8 — Rules

**Decision:** Workflow-level cross-activity rules, each with enforcement classification:

| Rule | Enforcement |
|------|-------------|
| Safety floor is never simplified away (understand-first, input validation at trust boundaries, error handling preventing data loss, security, accessibility, hardware calibration, anything explicitly requested, ONE runnable assert-based check for non-trivial logic) | structural — `safety-floor-cleared` blocking checkpoint + the gate variable |
| Understand the problem before climbing — read the task and trace the real end-to-end flow first | structural — the intake activity precedes apply-ladder in the activity graph; trace is an intake artifact |
| Bug fix = root cause, not symptom — grep all callers, fix the shared function once | guidance — encoded in the `apply-ladder` technique protocol |
| Present approach before implementation | guidance (mirrors design principle 11) — encoded in apply-ladder protocol |
| Output discipline — code first, then ≤3 lines (skipped X, add when Y); no unrequested prose | guidance — encoded in the apply-ladder + review technique rules |
| Honesty boundary on reporting — never fabricate a per-repo savings number; benchmark medians only | structural-ish — encoded as a `report-gain` technique rule + the honesty-boundary resource |
| Take the higher rung when two work; deletion over addition; no unrequested abstractions | guidance — ladder/rules encoded in the single-source ladder resource every technique points at |

**Rationale:** Critical constraints (safety floor, understand-first, honesty boundary) get structural backing (checkpoint / activity-ordering / technique-rule), per design principle 10. The remaining ponytail rules are output/style discipline that an agent applies while executing a technique, so they are guidance encoded in technique `rules`/protocol rather than the workflow rules block — keeping `workflow.yaml rules[]` reserved for genuinely cross-activity invariants.

### Resources decided (cross-cutting, referenced by techniques)

A single-source design avoids restating the ladder in every technique:
- `the-ladder.md` — the 7 rungs + safety floor + when-NOT-to-be-lazy, the ONE source every operation points at
- `review-taxonomy.md` — the 5 tags (delete/stdlib/native/yagni/shrink) shared by review + audit
- `ponytail-marker-convention.md` — the `ponytail: <ceiling>, <upgrade path>` ceiling-comment convention + `no-trigger` rule
- `honesty-boundary.md` — the gain-reporting rule (benchmark medians, never per-repo fabrication)

---

### User Response

**Review Status:** ✅ Confirmed — every dimension confirmed at its `dimension-confirmed` checkpoint under delegated authority; `requirements_confirmed = true`.

### Outcome

| Dimension | Decision | Outcome |
|-----------|----------|---------|
| Purpose | Lean-solution-above-safety-floor with tracked debt | ✅ Confirmed |
| Activity list | 5 activities (3 required spine + repo-audit optional + report) | ✅ Confirmed |
| Activity model | Linear spine + repo-audit branch gated by intensity/scope | ✅ Confirmed |
| Checkpoints | intensity-and-scope, safety-floor (blocking), no review/audit gates | ✅ Confirmed |
| Artifacts | lean-brief, lean-change, review-findings, audit-findings, debt-ledger | ✅ Confirmed |
| Variables | task_description, target_path, intensity, scope, safety_floor_cleared, has_debt_markers | ✅ Confirmed |
| Techniques | ponytail-operations group (5 ops) + meta scatter-gather/variable-binding | ✅ Confirmed |
| Rules | 7 rules, safety-floor + understand-first + honesty structurally enforced | ✅ Confirmed |

---

## Assumption Reconciliation & Interview

**Date:** 2026-06-28

The `collect` step surfaced 12 design assumptions across the categories *Activity Boundaries, Checkpoint Necessity, Technique Selection, Rule Scope, Variable State, Schema Construct Choice*. The `reconcile-design-assumptions` step then ran the audit lens over each: **8 were audit-resolvable** (schema-validity, convention/naming, consistency, principle-adherence) and are marked resolved here with their evidence; **4 are genuine design judgements** and remain open for the assumption-interview loop.

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale |
|----|----------|------|------------|-----------|
| PA-1 | Activity Boundaries | M | `ponytail-help` warrants no activity (reference card only, low distil value) | Brief flags it low-value; it persists no artifact and makes no decision |
| PA-2 | Activity Boundaries | M | `ponytail-gain` collapses into the debt-harvest activity rather than its own activity | Gain is a one-shot display, not a phase; debt ledger is the only honest per-repo number |
| PA-3 | Checkpoint Necessity | H | The safety floor must be a *blocking* checkpoint, not just a rule | It is the single non-negotiable invariant; design principle 10 requires structural backing |
| PA-4 | Checkpoint Necessity | L | Review / audit / debt activities need no user checkpoint (read-only reporting) | Skills state they apply nothing; matches prism minimal-interaction |
| PA-5 | Schema Construct Choice | M | `intensity` is a plain string variable + `simple` `==` conditions, not a schema enum | Brief is explicit; prism's `pipeline_mode` is the precedent |
| PA-6 | Technique Selection | L | Reuse meta `scatter-gather` for the forEach-over-findings / forEach-over-markers loops rather than authoring a local loop technique | scatter-gather is the canonical accumulate-then-combine primitive |
| PA-7 | Technique Selection | M | The five ponytail ops are authored as one workflow-local `ponytail-operations` group | review-assumptions group is the convention; ops are genuinely new |
| PA-8 | Rule Scope | M | Output discipline / root-cause / take-higher-rung are technique-level guidance, not `workflow.yaml rules[]` | They are per-execution style, not cross-activity invariants |
| PA-9 | Variable State | L | A single `the-ladder.md` resource is the one source every technique points at | Modular-over-inline (principle 9); avoids restating the ladder per technique |
| PA-10 | Activity Boundaries | H | Intake and apply-ladder are *separate* activities (understand vs build) rather than one combined activity | Ponytail's "never lazy about understanding" makes the read/trace phase a distinct gateable concern |
| PA-11 | Variable State | M | `scope` (change/repo) is a distinct variable from `intensity` | They gate the repo-audit branch independently; an ultra run on a single change shouldn't force a repo scan, and vice versa |
| PA-12 | Schema Construct Choice | M | The repo-audit branch is gated by an activity `transition` with an `or` condition, not a checkpoint option's `skipActivities` | The gate is a state-derived branch, not a user decision; transitions are the schema-correct construct |

**Categories:** Activity Boundaries, Checkpoint Necessity, Technique Selection, Rule Scope, Variable State, Schema Construct Choice

**Risk Levels:** H = High (validate before proceeding), M = Medium (confirm at checkpoint), L = Low (log for reference)

### Reconciliation — Audit-Resolved (autonomous, no user interaction)

| ID | Audit lens | Verdict | Evidence |
|----|-----------|---------|----------|
| PA-3 | audit-principles | ✅ Validated | Design principle 10 (encode constraints as structure) mandates a checkpoint/condition/validate backing for a critical rule; the safety floor is critical, so a blocking checkpoint is required, not optional |
| PA-5 | audit-conformance + audit-schema-validation | ✅ Validated | `workflows/prism/workflow.yaml` declares `pipeline_mode` as a plain `type: string` variable; `workflows/prism/activities/01-structural-pass.yaml` gates transitions on it via `condition.type: simple` `operator: ==`. Schema admits string variables + simple conditions; no enum construct needed |
| PA-6 | audit-consistency | ✅ Validated | `scatter-gather` is a composed activity technique in this very activity; its `one-gather-contract-two-scatter-modes` + `accumulate-never-overwrite` rules are exactly the forEach-accumulate semantics the findings/markers loops need |
| PA-7 | audit-conformance | ✅ Validated | `workflows/work-package/techniques/review-assumptions/` is a group: `TECHNIQUE.md` base + `collect.md`/`interview.md`/`reconcile.md`/`record.md` op files. `ponytail-operations` follows the identical shape |
| PA-8 | audit-principles | ✅ Validated | Design principle 4 + workflow-rules-authoritative: `workflow.yaml rules[]` holds cross-activity invariants; per-execution style belongs in technique `rules`. Output discipline is per-execution, so it is technique-level — confirmed |
| PA-9 | audit-principles | ✅ Validated | Design principle 9 (modular over inline; content in exactly one location) requires the ladder live in one resource that techniques reference, not be restated per technique |
| PA-12 | audit-schema-validation + audit-principles | ✅ Validated | The `or` condition on a transition is schema-valid (prism uses `condition.type: or` on a transition in `01-structural-pass.yaml`); a state-derived branch is a transition, not a user-decision checkpoint (principle 4: most-specific construct) |
| PA-4 | audit-principles | ✅ Validated | Principle 3 (one question at a time) + minimal-interaction precedent: a checkpoint is an *explicit user decision gate*; read-only reporting passes present no decision, so no checkpoint is warranted |

### Open Assumptions — Genuine Design Judgements (assumption-interview)

These four are not audit-resolvable — they are design judgements where alternatives are each defensible and the choice commits the workflow's shape. Presented at the `assumption-decision` checkpoints under delegated authority, ordered by decision impact.

| ID | Category | Risk | Reversibility | Open question |
|----|----------|------|---------------|---------------|
| PA-10 | Activity Boundaries | H | path-committing | Should intake (understand/trace) and apply-ladder (build) be **separate** activities, or one combined "lazy-pass" activity? |
| PA-2 | Activity Boundaries | M | easily-reversible | Should `ponytail-gain` be a **tail of the debt-harvest activity**, or its own activity 06? |
| PA-11 | Variable State | M | easily-reversible | Should `scope` (change vs repo) be a **separate variable** from `intensity`, or folded so that `intensity == ultra` alone implies repo scope? |
| PA-1 | Activity Boundaries | L | easily-reversible | Should `ponytail-help` be **dropped entirely** (the brief's "low distil value"), or distilled into a thin reference resource? |

#### PA-10 — Intake/apply-ladder split vs combined (HIGH, path-committing)

**Decision space:**
- (A) Separate activities — `intake-and-scope` (understand, trace, set intensity/scope) then `apply-ladder` (climb, mark, check).
- (B) One combined `lazy-pass` activity that reads, then climbs, in a single phase.

**Trade-offs:**
- *Consistency with existing patterns:* (A) matches the workflow-server convention of one concern per activity and lets the safety-floor checkpoint sit cleanly at the build phase's exit. (B) is terser but blurs two concerns.
- *Risk of unintended side-effects:* (B) risks an agent skating past comprehension straight into climbing — exactly the failure ponytail warns against ("laziness that skips comprehension ships a confident wrong fix"). (A) makes the understand phase a structural gate that must complete first.
- *Reversibility:* path-committing — merging or splitting activities later cascades through transitions, artifacts, and the README.

**Non-resolvability rationale:** No schema rule or convention forbids either; it is a judgement about how strongly to enforce understand-before-build as structure.

**Agent's position (recommended): (A) Separate activities.** Ponytail's strongest safety statement is "never lazy about understanding the problem." Making intake a distinct, must-complete-first activity encodes that as structure (principle 10) rather than trusting prose inside a combined activity. The extra activity is cheap; the failure it prevents is the dangerous-wrong-fix.

#### PA-2 — ponytail-gain placement (MEDIUM, easily-reversible)

**Decision space:**
- (A) Gain is the reporting tail of `harvest-debt-and-report` (activity 05).
- (B) Gain is its own activity 06.

**Trade-offs:**
- *Implementation complexity:* (A) one fewer activity, one fewer transition. (B) cleaner one-skill-per-activity mapping.
- *Alignment with the source:* gain produces no durable per-repo artifact (its honesty boundary forbids per-repo numbers); the debt ledger is the only real per-repo figure, and gain's card explicitly points at the ledger. They are two faces of "what did this buy us," so co-locating them is faithful.

**Non-resolvability rationale:** Both are schema-valid; it is a granularity judgement.

**Agent's position (recommended): (A) tail of debt-harvest.** Gain is a one-shot display, not a phase that leaves an artifact; folding it into the debt activity keeps the artifact count honest (one durable file) and mirrors the gain card's own "see /ponytail-debt" pointer.

#### PA-11 — `scope` separate from `intensity` (MEDIUM, easily-reversible)

**Decision space:**
- (A) `scope` is its own variable (change/repo); repo-audit fires on `intensity == ultra` OR `scope == repo`.
- (B) No `scope` variable; repo-audit fires on `intensity == ultra` alone.

**Trade-offs:**
- *Alignment with requirements:* the brief proposes the gate as "intensity==ultra OR explicit scope=repo," which needs both inputs. (B) loses the ability to run a repo audit at `full` intensity, or to run `ultra` on a single change without forcing a whole-tree scan.
- *Implementation complexity:* (A) one extra variable + an `or` condition; (B) simpler but conflates strictness with breadth.

**Non-resolvability rationale:** A modelling judgement about whether strictness and breadth are independent dimensions.

**Agent's position (recommended): (A) separate `scope` variable.** Strictness (how hard you cut) and breadth (diff vs repo) are genuinely orthogonal — a user may want an ultra-strict review of one diff, or a routine full-intensity repo sweep. Keeping them separate matches the brief and prism's pattern of independent string variables.

#### PA-1 — ponytail-help drop vs thin resource (LOW, easily-reversible)

**Decision space:**
- (A) Drop `ponytail-help` entirely.
- (B) Distil it into a thin reference resource (no activity, no technique).

**Trade-offs:**
- *Maintenance burden:* (A) nothing to maintain. (B) a small static reference that can drift from the workflow's actual options.
- *Value:* the help card's content (levels, skills, triggers) is largely re-expressed by the workflow's own variables, activities, and the ladder resource, so a dedicated help resource is near-redundant.

**Non-resolvability rationale:** A trivial scope judgement; either is defensible.

**Agent's position (recommended): (A) drop it.** The brief flags it "low distil value." Its content is already covered by the workflow's variables (intensity levels) and the ladder/taxonomy resources; a separate help card would be the kind of redundant artifact ponytail itself would delete (YAGNI). If a reference card is later wanted, it is cheap to add.

---

### User Response

**Review Status:** ✅ Resolved — all four open assumptions presented one at a time at the `assumption-decision` checkpoints under delegated authority and **accepted**. Each accept carries no `setVariable` effect; `has_deferred_assumptions` stays `false`.

### Outcome

| ID | Original Assumption | Decision | Outcome |
|----|---------------------|----------|---------|
| PA-10 | Intake/apply-ladder split | accept (separate activities) | ✅ Accepted — confirmed |
| PA-2 | gain placement | accept (tail of debt-harvest) | ✅ Accepted — confirmed |
| PA-11 | scope separate variable | accept (separate variable) | ✅ Accepted — confirmed |
| PA-1 | ponytail-help | accept (drop entirely) | ✅ Accepted — confirmed |

All four resolved as **accepted (confirmed)**: the design proceeds with intake/apply-ladder as separate activities (PA-10), `ponytail-gain` folded into the debt-harvest activity tail (PA-2), a distinct `scope` variable alongside `intensity` (PA-11), and `ponytail-help` dropped entirely (PA-1).

### Deferred Decisions

None. Every open assumption was accepted at interview; nothing was rejected or deferred (`has_deferred_assumptions = false`).
