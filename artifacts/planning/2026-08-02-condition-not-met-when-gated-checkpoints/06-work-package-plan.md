# Condition not met / rule fragments / AP-134 — Implementation Plan

> plan · HIGH · Ready · 2–3.5h agentic + 45–60m review · 2026-08-02

## Overview

### Problem & Scope

Problem, scope, and success criteria: [design philosophy](02-design-philosophy.md#success-criteria) (elicitation skipped). Three server deliverables on PR #373; branch is opening-chore only.

## Inputs

- [Design philosophy](02-design-philosophy.md#problem-statement) — three-item scope, simple path, skip-optional
- [Comprehension](../../comprehension/when-merge-condition-not-met.md#architecture-overview) — seam map, rejected paths, present-gate predicate
- [Implementation analysis](05-implementation-analysis.md#gap-analysis) — G1–G8 baselines and file targets
- [Assumptions log](02-assumptions-log.md) — validated DP rows; planning rows appended this activity

## Proposed Approach

### Solution Design

Close three independent server surfaces that share one PR and one “parity with existing machinery” theme:

1. **Dismissal legality** — Treat a checkpoint as dismissible when it carries a structured `condition` **or** a non-empty `when` string. Server still does not evaluate gate truth. Unconditional checkpoints keep rejecting `condition_not_met`. Update schema describe text to positive-present parity (both forms enable dismissal; agent evaluates truth).

2. **Activity-file rule fragments** — Widen `Activity.rules` to the same `RuleEntry` union as workflow partitions. Call `materializeRuleEntries` from activity fragment materialization (typed path). On the raw get_activity path, splice activity-level `{ ref }` rule entries to plain strings (same “agents never see refs” contract as workflow rules and checkpoint inject). Teach `check-fragments` to resolve and usage-track activity-file rule refs.

3. **AP-134 citation-grain hard-zero** — New corpus guard: for each technique markdown file, run citation extraction (reuse `extractResourceIds` or equivalent link scan after the same conventions), group by base resource id, flag when both bare and `#section` appear for the same base. Register in `GUARDS`, add `package.json` npm script, land fixture/emptiness coverage. Mechanical tell only; no heading-name NLP.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Presence of `condition` **or** non-empty `when` | Matches PR intent; no new interpreter; keeps unconditional reject | Dual dialect remains until corpus migrates | **Selected** |
| Server-evaluate `when` on dismiss | Single source of truth for gate | Contradicts agent-authority model; out of PR scope | Rejected |
| Always allow `condition_not_met` | Tiny code | Breaks unconditional tests; unsafe | Rejected |
| Activity rules only on workflow partitions | Already works | Does not close W6 residual | Rejected for this PR’s W6 item |
| Full AP-134 prose detector | Closer to catalog | Ambiguous; high false positives | Rejected — mechanical co-cite first |

### Design Decisions

1. **Predicate helper** — Prefer a tiny local predicate (e.g. `checkpointHasDismissibleGate(cp)`) next to the tool branch so tests can unit-assert without spinning MCP when useful; acceptable to inline if one-liner stays clear.
2. **Error copy** — Message names both gate fields (positive present): dismissible when a gate field is present.
3. **Materialize home** — Extend `materializeActivityFragments` to accept/mutate `rules` on the activity object (widen the parameter type). Raw path: either inject rule refs in YAML text or re-serialize rules after parse-materialize-rewrite — choose the smallest path that keeps get_activity body free of `{ ref }` objects (checkpoint inject is the precedent for YAML rewrite).
4. **RuleEntry import** — Reuse `RuleEntrySchema` from workflow.schema in activity.schema (or shared export) to avoid a second union definition.
5. **Citation exception list** — Start empty; document header comment for any later economical exception; do not invent corpus exceptions until the collector is red for a justified overview case.
6. **Commit grain** — One commit per deliverable (dismissal / activity-rule refs / citation guard); no squash of the three.

### Assumptions

Assumptions underlying the approach: [assumptions log](02-assumptions-log.md).

## Implementation Tasks

### Task 1: Dismissal parity for when-gated checkpoints (45–75 min)

**Goal:** `condition_not_met` accepts checkpoints gated by non-empty `when` as well as structured `condition`; unconditional still rejected.

**Deliverables:**

- `src/tools/workflow-tools.ts` — widen `condition_not_met` presence check
- `src/schema/activity.schema.ts` — when/condition `.describe` parity prose (positive present)
- `schemas/activity.schema.json` — matching describe strings on step when/condition
- `tests/mcp-server.test.ts` — when-only accept case; keep unconditional reject + structured accept

**Depends on:** none

### Task 2: Activity-file rule fragment references (50–80 min)

**Goal:** Activity YAML `rules` accept `{ ref }` and materialize to plain strings on load and delivery; fragments guard covers the slot.

**Deliverables:**

- `src/schema/activity.schema.ts` — `rules: z.array(RuleEntrySchema)`
- `schemas/activity.schema.json` — RuleEntry anyOf items (mirror workflow rules items)
- `src/loaders/fragment-resolver.ts` — materialize activity `rules` in `materializeActivityFragments`; raw delivery support for activity rule refs
- `src/loaders/workflow-loader.ts` — ensure load path already calling materialize picks up rules (via extended materialize)
- `scripts/check-fragments.ts` — resolve/usage-track activity-file `{ ref }` entries
- `tests/fragment-resolver.test.ts` (and/or fragments guard tests) — activity rules ref materialize + unresolved ref

**Depends on:** none (parallelizable with Task 1)

### Task 3: AP-134 citation-grain hard-zero guard (40–70 min)

**Goal:** `check:all` fails on technique files that cite both a bare resource id and the same id with `#section`.

**Deliverables:**

- `scripts/check-citation-grain.ts` — collector + CLI (`resolveWorkflowsRoot`, hard-zero exit)
- `scripts/guards.ts` — register guard (`scope: corpus`)
- `package.json` — `check:citation-grain` (or short name consistent with peers)
- `tests/` — emptiness or fixture test for collector
- Optional tiny fixture under test fixtures if the suite pattern requires an intentional red fixture isolated from live corpus

**Depends on:** none (parallelizable)

### Task 4: Docs touch for schema examples (10–20 min)

**Goal:** Any activity `rules` example in `schemas/README.md` that claims string-only is updated to admit `{ ref }` in positive present.

**Deliverables:**

- `schemas/README.md` — only if examples assert string-only rules

**Depends on:** Task 2

## Success Criteria

Success criteria: [design philosophy](02-design-philosophy.md#success-criteria); baselines and measurement: [implementation analysis](05-implementation-analysis.md#baseline-metrics).

Task-level acceptance (linked to gaps):

- G1/G2/G3 — when-only dismiss green; unconditional still red; schema prose parity
- G4/G5/G6 — activity `{ ref }` loads, delivers as strings, guard resolves
- G7 — GUARDS includes citation-grain; corpus green; intentional co-cite fixture fails collector

## Testing Strategy

Test cases and acceptance matrix: [test plan](06-test-plan.md).

Ordering: land Task 1 tests first (fast MCP path), then fragment unit tests, then guard collector tests. Run `npm run typecheck` and targeted vitest per task; full `npm run test:ci` and `npm run check:all` before PR ready.

## Dependencies & Risks

### Requires (Blockers)

- [ ] Worktree provisioned and on `feat/when-merge-rule-fragments-ap134-guard` (done)
- [ ] Host `gh` keyring for PR body update at submit-for-review (host auth was degraded in this worker sandbox — orchestrator/implement must use full host permissions)

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Raw activity body still exposes rule `{ ref }` | HIGH | MEDIUM | Dual-path materialize like checkpoints; integration assertion on get_activity text |
| Citation false positives | MEDIUM | LOW | Mechanical co-cite only; empty allowlist until justified |
| JSON/Zod schema drift | MEDIUM | MEDIUM | Edit both; validate-activities |
| Scope creep into corpus when-migration | HIGH | MEDIUM | Explicit non-goal; zero when-only sites is OK |

**Status:** Ready for implementation
