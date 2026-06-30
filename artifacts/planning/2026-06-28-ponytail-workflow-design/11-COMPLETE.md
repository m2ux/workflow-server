# Workflow Design: ponytail — Complete ✅

**Date:** 2026-06-29
**Mode:** Create
**Status:** COMPLETED

---

## Summary

This session designed a new `ponytail` workflow that encodes the "lazy senior dev" discipline — lazy meaning efficient, not careless; the best code is the code never written. The workflow drives an agent through the ladder (YAGNI → reuse → stdlib → native → installed dep → one line → minimum code that works) behind a non-negotiable safety floor, then exposes the ponytail review / audit / debt / gain operations. It matters because it turns a prose skill an agent can drift past into first-class structure: understand-before-build is activity ordering, the safety floor is a gated loop, and every deliberate simplification is harvested into a `ponytail:` debt ledger so "later" cannot become "never". Delivered as 21 files on `workflow/ponytail`, committed at `76b607c3`, draft PR [#140](https://github.com/m2ux/workflow-server/pull/140) against `workflows`.

---

## What Was Delivered

- **Activities (5):** `intake-and-scope` → `apply-ladder` → `over-engineering-review` → (`repo-audit`, `required: false`, gated on `intensity == ultra` OR `scope == repo`) → `harvest-debt-and-report` (terminal).
- **Techniques:** one workflow-local `ponytail-operations` group — base `TECHNIQUE.md` (shared `task_description` / `target_path` / `intensity` inputs + output-discipline rules, inherited by all ops) plus 6 operation files: `scope-intake`, `apply-ladder`, `review-over-engineering`, `audit-repo`, `harvest-debt`, `report-gain`. Reuses meta `variable-binding` (workflow-wide) and `scatter-gather` (only on the fan-out activities).
- **Resources (4, single-source):** `the-ladder.md` (7 rungs + safety floor + when-NOT-to-be-lazy), `review-taxonomy.md` (5 tags: delete / stdlib / native / yagni / shrink), `ponytail-marker-convention.md` (`ponytail: <ceiling>, <upgrade>` + `no-trigger`), `honesty-boundary.md` (benchmark medians, never per-repo fabrication).
- **Variables / rules:** 5 workflow variables — `task_description`, `target_path`, `lazy_intensity` (lite/full/ultra string), `pass_scope` (change/repo string), `safety_floor_cleared`, `has_debt_markers`. Audience-partitioned rules: `safety-floor-never-simplified` and `understand-before-climb` structurally backed (blocking checkpoint + gate variable / activity ordering); honesty-boundary and output-discipline carried as technique rules.
- **READMEs (4):** root (with the flow diagram) + `activities/` + `techniques/` + `resources/`, prism-style orientation.

---

## Design Decisions

### Decision 1: Intake and apply-ladder are separate activities (PA-10)
**Context:** Ponytail's strongest safety statement is "never be lazy about understanding the problem." The build phase could be folded into one combined lazy-pass activity.
**Decision:** Keep `intake-and-scope` (understand/trace) and `apply-ladder` (build) as distinct activities.
**Rationale:** Making understand-first a must-complete-first activity encodes it as structure (design principle 10) rather than trusting prose inside a combined activity — it structurally prevents the dangerous-wrong-fix ponytail warns against.
**Alternatives rejected:** One combined `lazy-pass` activity — terser but blurs comprehension and climbing into one phase and risks an agent skating straight to climbing.

### Decision 2: ponytail-gain is the reporting tail of harvest-debt, not its own activity (PA-2)
**Context:** The six ponytail skills map onto activities; `ponytail-gain` could be a sixth activity.
**Decision:** Fold gain into `harvest-debt-and-report` as a `when: has_debt_markers == true` tail step that appends to `debt-ledger.md`.
**Rationale:** Gain is a one-shot display that persists no durable artifact (its honesty boundary forbids per-repo numbers); the debt ledger is the only honest per-repo figure, so the two belong together — keeping the artifact count honest (one durable file).
**Alternatives rejected:** A standalone activity 06 — cleaner one-skill-per-activity mapping but adds a phase that leaves no artifact and an extra transition.

### Decision 3: `pass_scope` is a distinct variable from `lazy_intensity` (PA-11)
**Context:** Strictness and breadth could be conflated so that `intensity == ultra` alone implies a repo scan.
**Decision:** Model `pass_scope` (change/repo) as its own string variable; repo-audit fires on `lazy_intensity == ultra` OR `pass_scope == repo`.
**Rationale:** Strictness (how hard you cut) and breadth (diff vs whole tree) are genuinely orthogonal — a user may want an ultra-strict review of one diff, or a routine full-intensity repo sweep.
**Alternatives rejected:** Drop `scope`, gate on intensity alone — simpler but loses the ability to run a repo audit at `full` intensity or an `ultra` pass on a single change.

### Decision 4: `ponytail-help` dropped entirely (PA-1)
**Context:** The brief flags `ponytail-help` as low distil value.
**Decision:** Drop it — no activity, no technique, no resource.
**Rationale:** Its content (levels, skills, triggers) is already re-expressed by the workflow's own variables and the ladder/taxonomy resources; a separate help card would be the kind of redundant artifact ponytail itself would delete (YAGNI).
**Alternatives rejected:** A thin reference resource — near-redundant and liable to drift from the workflow's actual options.

### Decision 5: Safety floor encoded as a `doWhile` loop, not a default-transition condition (quality-review F1)
**Context:** The first draft exited `apply-ladder` via a single `isDefault: true` transition carrying `condition: safety_floor_cleared == true`.
**Decision:** Restructure the climb + blocking checkpoint into a `kind: loop` (`doWhile`, continuation `condition: safety_floor_cleared == false`, `maxIterations: 5`) with an unconditional exit transition.
**Rationale:** The engine ignores conditions on default transitions, so the original shape made the workflow's central safety gate a no-op — the workflow would exit even when the floor was not cleared. A gate that must iterate-until-cleared is a loop (design principle 10: constraints as structure).
**Alternatives rejected:** A single `when`-gated re-run step — does not repeat until cleared; keeping the condition-on-default-transition — silently unenforced.

### Decision 6: `ponytail-operations` is capability-named and referenced qualified (PA-7 / AP-63)
**Context:** A same-named-as-activity group would earn the terser activity-group-shorthand bare reference.
**Decision:** Name the group for its capability (`ponytail-operations`) and reference its ops qualified (`ponytail-operations::apply-ladder`) from every activity.
**Rationale:** The ops are consumed across multiple activities (a cross-activity capability group per AP-63), so capability-naming + qualified refs is the conformant choice — matching how `review-assumptions::collect` is always qualified.
**Alternatives rejected:** Activity-naming a group to earn shorthand — would not fit ops shared across four activities.

---

## Scope Outcome

*Comparison against the confirmed scope manifest ([06-scope-manifest.md](06-scope-manifest.md)).*

The manifest enumerated 20 files and surfaced the sixth-op decision (`scope-intake`) as an open drafting choice (§5.1, recommended). That recommendation was adopted, bringing the total to 21.

| Manifest item | Action | Status |
|---------------|--------|--------|
| `workflow.yaml` | create | ✅ Done |
| `README.md` (root) | create | ✅ Done |
| `activities/` (README + 5 activity files) | create | ✅ Done (6) |
| `techniques/README.md` | create | ✅ Done |
| `techniques/ponytail-operations/TECHNIQUE.md` | create | ✅ Done |
| `ponytail-operations` op files | create | ✅ Done (6 — `scope-intake` adopted per §5.1) |
| `resources/` (README + 4 resources) | create | ✅ Done (5) |

**Drift:** Two intentional, manifest-flagged refinements, both within the confirmed open-decision set:
- The sixth op `scope-intake.md` was adopted (manifest §5.1 recommendation; 20 → 21 files) so `lean-brief.md` has a clean technique owner.
- The `apply-ladder` needs-work iteration was drafted as a `kind: loop` (manifest §5.3 recommendation) — which the quality-review then found was also the only correct way to make the safety floor enforceable (F1).

No unaddressed manifest items; no out-of-manifest files.

---

## Known Limitations & Deferrals

- ⚠️ **Runtime, not yet exercised** — `ponytail` is a runtime coding workflow. It validates structurally (schema + binding/identifier/step-purity/artifact checks) and all 386 server tests pass, but it has not yet been run end-to-end against a live coding task. The `maxIterations: 5` bound on the safety-floor loop is an untested guess at a reasonable ceiling.
- ⚠️ **`scope-intake` binds gitnexus tracing optimistically** — the intake op references `gitnexus-operations::query` / `::context` for the understand-first trace; on a repo with no GitNexus index that trace degrades to a plain read. The op does not gate on index presence.
- ❌ **`ponytail-help` deferred (PA-1)** — dropped as YAGNI; if a reference card is later wanted it is cheap to add as a single resource.
- ❌ **scatter-gather on review/audit** — `scatter-gather` is listed only where a genuine per-unit forEach exists (harvest over markers). Review and audit emit their findings collection in one pass; if per-finding iteration is later wanted, add the loop + `set` accumulator and list the technique then.

---

## Lessons Learned

### What Went Well
- The distillation was clean: Ponytail's ladder, safety floor, and review/audit/debt/gain taxonomies mapped onto schema-conformant constructs (string-gated branch, blocking checkpoint, capability group, single-source resources) with almost no new primitives — `variable-binding` and `scatter-gather` were reused, only the 6 domain ops were authored.
- The `adopt-all` pattern decision at pattern-analysis meant the prism/work-package/review-assumptions precedents carried directly into the draft, so the scope manifest was drafting-ready.
- Every validator and all 386 tests stayed green through the commit.

### What Could Be Improved
- The most important catch was the safety-floor no-op: the central gate was authored as a condition on a default transition, which the engine ignores. It was caught at quality-review, not at draft time. The durable lesson — a gate variable referenced only by a default transition's condition is NOT enforcement; encode iterate-until-cleared gates as a loop — is recorded in the retrospective so the next design checks for it up front.

---

**Status:** ✅ COMPLETE
