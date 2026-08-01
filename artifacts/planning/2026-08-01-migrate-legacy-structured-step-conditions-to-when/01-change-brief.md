# Change Brief — Corpus condition-to-when step-gate migration

**Workflow:** `work-package` v3.40.0 · `workflow-design` v1.31.0 · `prism` v2.3.0 · `meta` v5.14.0 · `prism-audit` v1.2.0 · `substrate-node-security-audit` v4.19.0 — corpus-wide update; register-only (kept sites, no file edits): `codebase-wiki`, `remediate-vuln`, `workflow-authoring`, `midnight-system-review`, `ponytail`
**Mode:** Update
**Date:** 2026-08-01
**Change categories:** Structural refactor · Activity
**Change request:** Migrate every legacy structured step `condition:` that is a plain step gate to the equivalent inline `when:` expression across the corpus, keeping checkpoint, exists-shaped and loop-continuation sites structured, with every site's disposition recorded in a migration register (#338 W7 / #189 C8, [PR #374](https://github.com/m2ux/workflow-server/pull/374)).
**Baseline:** Branch `workflow/338-when-migration` @ `e2e70e68` — the run's edit surface; per-file blast radius in the [impact analysis](01-impact-analysis.md).

---

## Purpose

The activity schema documents structured `condition` as legacy with `when` as the preferred step gate, yet the corpus still carries both dialects — the last surviving duplicate-declaration duality from #189 F7. This run converts every structured step gate that has an exact `when` equivalent, so guards and readers face one gate dialect, while sites whose structured form is load-bearing (checkpoint dismissal, exists predicates, loop continuation) stay structured with their reasons on record. Semantics are preserved exactly: no gate is added, removed, reordered or re-scoped.

| Goal | Meaning |
|------|---------|
| Single step-gate dialect | Every plain-comparison step gate reads as a `when:` expression; the structured form remains only where it is load-bearing |
| Exact semantics preservation | Each migrated expression is the literal equivalent of the structured block it replaces — same variable, operator, value, and combinator |
| Complete disposition record | Every one of the 238 structured step-condition sites gets a migrate/keep row with reason in the migration register |
| Guard-clean delivery | Binding-fidelity and variable-model guards run clean against the pre-migration baseline; no new findings |

**Out of scope:**

- Checkpoint step `condition` blocks — on a checkpoint step only `condition` (not `when`) enables `condition_not_met` dismissal; migration of these is gated on the server PR `feat/when-merge-rule-fragments-ap134-guard` and excluded from this run
- Exists-shaped predicates — the `when` dialect has no live exists form
- `while` / `doWhile` loop `condition` blocks — these are loop-continuation predicates, not step gates (corpus evidence: loops in `work-package` carry `when` entry gates and `condition` continuation predicates side by side)
- Workflow-level `transitions[].condition` and checkpoint option effects — not step gates
- Any behavioral or structural change beyond the dialect swap: no activities, transitions, variables, techniques, resources or checkpoint options change

---

## Dimensions

None of the update dimension set's members (purpose, activity list, checkpoints, artifacts, rules) changes membership; the change is a cross-cutting step-gate dialect swap inside existing activities.

| Dimension | This run's shape |
|-----------|------------------|
| Step gates (cross-cutting) | Up to 152 candidate sites in 31 activity files across 6 workflows become `when:` — `work-package` 71, `workflow-design` 66, `prism` 9, `meta` 4, `prism-audit` 1, `substrate-node-security-audit` 1. Includes 9 `forEach`-loop entry gates (`over` drives iteration, so their `condition` is a pure gate). Compound sites migrate only under live `when` precedent: `&&` is precedented (20 live uses); `||` has none, so OR-shaped compounds stay structured with a register row |
| Kept sites | 86 sites stay structured with a reason each: 63 checkpoint gates, 6 exists-shaped predicates, 17 `while`/`doWhile` continuation predicates |

---

## Open judgements

| # | Judgement | Why it is open | Effect if decided either way |
|---|-----------|----------------|------------------------------|
| 1 | Include deprecated `workflow-design` (66 candidate sites)? | The catalog marks it "DEPRECATED — use workflow-authoring", and PR #374 scopes the migration "across the corpus" without exempting deprecated definitions | Include: the corpus fully converges on one dialect, at the cost of churn in a definition slated for removal. Exclude: 66 fewer edits, but the largest structured tail survives and the register carries a deprecation exclusion for every one of its sites |

---

## Confirmation ask

Approving this brief commits the run to a semantics-preserving dialect migration of up to 152 step gates across 6 workflows, with structured conditions remaining only where checkpoint dismissal, exists predicates, loop continuation, or missing compound precedent requires them — every disposition recorded in the migration register.
