# Assumptions Log

> Audience Attribute on Technique Output Declarations · #224 · updated 2026-07-14 (assumptions-review)

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence
(DP-1, RE-1, RS-1, IA-1, PL-1) or task number (1.1, 2.3).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| DP-1 | Design Philosophy | Problem Interpretation | M | The six V4 sub-deliverables in the work-package brief (spec, parser/schema, projection, get_activity carry-through, JSON conventions, corpus lint) faithfully represent epic #224's V4 scope — the brief was treated as authoritative because no bound tool was available to re-fetch the epic body in this activity | User | Confirmed: user affirmed the classification and scope at the path checkpoint |
| DP-2 | Design Philosophy | Complexity Assessment | L | The change is moderate, not complex, because it is additive/backward-compatible with no architectural contradictions — breadth of touch, not approach uncertainty | Code: GitNexus query over technique output parsing/projection — broad-but-shallow fan-out across `src/loaders/` (`parseFrontmatter`, `projectTechnique`, `projectTechniqueToYaml`), `src/schema/activity.schema.ts`, and lint scripts (`scripts/check-binding-fidelity.ts`, `scripts/check-all-refs.ts`); no single high-blast-radius hotspot | Validated |
| DP-3 | Design Philosophy | Workflow Path | L | Elicitation and research add little value because requirements are fully specified by the epic and this is an additive internal protocol change in a familiar domain | User | Confirmed: user selected skip-optional at the classification-and-path-confirmed checkpoint |
| PL-1 | Planning | Scope Decisions | L | The audience corpus-lint belongs in a standalone `scripts/check-audience.ts`, not an extension of `check-binding-fidelity.ts`, because they cover distinct concerns (one-guard-per-concern) | Code: `scripts/check-binding-fidelity.ts:1-52` — its four checks (arg-conformance, read-resolution, dead-output, orphan-input) treat `#### artifact` as opaque presence and never parse artifact metadata; audience is a separate concern | Validated |
| PL-2 | Planning | Design Approach | L | `projectTechnique` carries `audience` through opaquely with no source edit, because outputs are projected as opaque objects | Code: comprehension artifact + `02-design-philosophy.md:11` (projection opacity); locked by regression test (Task 5) rather than edited | Partially Validated — confirmed by design; final proof is the Task 5 test |
| PL-3 | Planning | Design Approach | L | `schemas/technique.schema.json` is hand-maintained and must be hand-edited, because it is not code-generated | Code: `scripts/generate-schemas.ts:24-29` emits workflow/state/condition/session-file/activity only — `technique` is absent | Validated |
| PL-4 | Planning | Task Breakdown | M | Schema (Task 1) must land before the loader emits the field (Task 2), because `TechniqueSchema` is `.strict()` and would reject an unknown `audience` key | Code: `src/schema/technique.schema.ts:95` `.strict()` on `TechniqueSchema` | Validated |
| PL-5 | Planning | Scope Decisions | L | No corpus adoption of `audience` is required in this PR — declarations without it stay valid and the guard passes the current corpus | User | Confirmed: additive/backward-compatible scope ratified in `02-design-philosophy.md` constraints and at the path checkpoint |

## Wrap-Up

8 assumptions — DP-2, PL-1, PL-3, PL-4 validated by code analysis; PL-2 partially validated (design-confirmed, final proof deferred to its Task 5 regression test); DP-1, DP-3, PL-5 confirmed by the user. No corrected, invalidated, or deferred assumptions. Takeaway: every planning assumption reduced to a code-resolvable fact and was settled against the actual source during planning, so no open stakeholder-dependent assumptions remain.
