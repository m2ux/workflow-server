# Assumptions Log

> workflow-design · #224 PR 2 (verbosity reduction, workflows corpus) · updated 2026-07-13

## Log

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| RR-1 | Requirements Refinement | Activity Boundaries | M | The V1 conformance gate binds in `14-complete.yaml` (the finalize boundary, after `ensure-docs`), not beside `verify-readme` in `12-strategic-review.yaml` — artifacts are still being written at 13/14, so earlier placement re-checks a moving set | User interview | Corrected: gate binds in `12-strategic-review` beside `verify-readme`; the 13/14 tail artifacts are made conformant at write time by their rewritten techniques |
| RR-2 | Requirements Refinement | Rule Scope | L | The canonical-home map lives once in `manage-artifacts/TECHNIQUE.md` as a group rule — inherited by `write-artifact` and the new verify op, same home as the existing style rules it operationalises | Convention: `manage-artifacts/TECHNIQUE.md` already carries `single-source-and-link` + all output-discipline rules; the map is their concretisation | Validated |
| RR-3 | Requirements Refinement | Technique Selection | H | prism `structural-analysis` and ponytail `review-over-engineering` advisory outputs merge into `code-review.md` via an optional destination input on those techniques (default = their own artifact, standalone behaviour unchanged) — the only structural way to redirect a technique-declared artifact without forking the ops | User interview | Confirmed |
| RR-4 | Requirements Refinement | Schema Construct Choice | L | V1 gate is a technique step with no checkpoint, loop, or routing variables | User precedent: #197/#218 direction — conformance gates verify + fix in place, no ceremony | Validated |
| RR-5 | Requirements Refinement | Rule Scope | L | Per-template line budgets are declared in each template's own `## Rules` section (the verify op reads them there), not as a global rule table | Convention: templates already carry local `## Rules` (wp-plan, kb-research, complete-wp); budgets are template-specific facts | Validated |
| RR-6 | Requirements Refinement | Variable State | L | No new workflow variables — the gate fixes in place and sets no routing flags | Convention: variable-model check forbids single-consumer flags; #218 gate shipped variable-free | Validated |
| RR-7 | Requirements Refinement | Activity Boundaries | L | `deferred-items.md` is created lazily by the first activity that defers an item (via `write-artifact`, one numbered instance updated in place thereafter) | Convention: artifact-location rule — first producer mints the prefix, later activities update in place | Validated |
| RR-8 | Requirements Refinement | Rule Scope | M | Canonical-home map: Problem Statement / Scope / Success Criteria → `requirements-elicitation.md`; Assumptions → `assumptions-log.md`; Design Decisions + planning Risks → `wp-plan.md`; `design-philosophy.md` keeps only Problem Classification plus a line-budgeted ticket-derived statement (it is written before requirements exists, so it cannot link forward) | User interview | Confirmed |
| RR-9 | Requirements Refinement | Schema Construct Choice | L | Corpus restructure is a MINOR version bump (work-package 3.29.0, workflow-design 1.8.0) | Convention: comparable restructures (artifact-efficiency 3.15.0, −8.7k lines) shipped as minor bumps; majors reserved for schema-breaking changes | Validated |

## Wrap-Up

9 assumptions — 6 validated by convention/precedent audits, 3 user-resolved:

- RR-1 corrected: the conformance gate binds in `12-strategic-review` (not `14-complete`); tail artifacts conform at write time.
- RR-3 confirmed: destination input on the prism/ponytail ops, defaults preserving standalone behaviour.
- RR-8 confirmed: canonical-home map as proposed.
