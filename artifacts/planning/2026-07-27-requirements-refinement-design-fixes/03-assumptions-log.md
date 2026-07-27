# Design Assumptions Log

**Workflow:** `requirements-refinement`
**Mode:** Update
**Created:** 2026-07-27
**Last Updated:** 2026-07-27

---

## Summary

| Category | Surfaced | Audit-resolved | Confirmed | Corrected | Deferred |
|----------|----------|----------------|-----------|-----------|----------|
| Activity Boundaries | 2 | 2 | 0 | 0 | 0 |
| Checkpoint Necessity | 1 | 0 | 0 | 0 | 0 |
| Technique Selection | 1 | 1 | 0 | 0 | 0 |
| Rule Scope | 2 | 1 | 0 | 0 | 0 |
| Variable State | 2 | 1 | 0 | 0 | 0 |
| Schema Construct Choice | 2 | 2 | 0 | 0 | 0 |
| **Total** | **10** | **7** | **0** | **0** | **0** |

Three genuine design judgements remain open for the Gate 2 batch. No assumption was decided mid-flow: the decision list for this activity is empty by design.

---

## Log

One row per assumption, updated in place across its lifecycle — surfaced, reconciled, and resolved.

| ID | Category | Risk | Resolvability | Assumption | Rationale | Outcome | Changes |
|----|----------|------|---------------|------------|-----------|---------|---------|
| A-1 | Schema Construct Choice | H | audit | A correction cap cannot be expressed as a variable-to-variable comparison, so a literal in the transition condition is the only enforceable home | The cap appears as both a declared variable and a literal; one of the two must be authoritative | ✅ Validated | `condition.schema.json` restricts a `simple` condition's `value` to `string \| number \| boolean \| null`, and `maxIterations` is an `integer` — neither admits a variable reference. Cap is authoritative at the transition condition |
| A-2 | Variable State | H | audit | The iteration counter must advance as a declared technique output rather than via `action: set` | Only checkpoint effects and worker-reported outputs mutate the bag; the increment is currently prose only | ✅ Validated | `activity.schema.json` documents `set` as agent-executed and "slated for removal at the next workflow-schema major"; `signature-is-the-contract` requires every emitted value to be a declared output |
| A-3 | Variable State | M | open | Variables written-but-never-read should be removed rather than given a structural read | Removal is the smaller definition, but confirm flags may be wanted as an audit trail | open — Gate 2 batch | No audit settles it: Non-Destructive Updates makes the removal approval-gated whatever the hygiene verdict |
| A-4 | Activity Boundaries | M | audit | Activity files stay at their present numbers; the `02` gap is not closed | Renumbering changes every server-computed artifact prefix, for cosmetic gain | ✅ Validated | [format conventions](01-format-conventions.md) records that numbering gaps are tolerated repo-wide; the prefix is filename-derived, so renumbering renames existing artifacts |
| A-5 | Checkpoint Necessity | M | open | The single-option failure acknowledgement remains a gate rather than becoming a plain announcement | A human arguably must see a terminal failure, but a one-option gate is not a decision | open — Gate 2 batch | Operator policy, not schema: both shapes are expressible and conformant |
| A-6 | Technique Selection | L | audit | The specification may carry a Technique-surface section beyond the five update dimensions | The change categories name Technique, so omitting it would hide in-scope work | ◐ Partially Validated | The design-specification guide constrains content economy and line budget, not the section set; section retained and flagged for the conformance pass |
| A-7 | Rule Scope | M | open | Rework options route via a back-edge to the same activity rather than to a new hold activity | A self back-edge is expressible today; a hold activity would add membership, which is out of scope | open — Gate 2 batch | Sets how a corrected run replays earlier steps — a behavioural preference no criteria home settles |
| A-8 | Schema Construct Choice | M | audit | Artifact announcements require producing techniques to expose a path value to interpolate | Techniques declare bare filenames only, so no link target exists today | ✅ Validated | [format conventions](01-format-conventions.md) names `[label]({path_variable})` the dominant repo form; the server names files `{artifactPrefix}-{bare_filename}`, which no current message matches |
| A-9 | Rule Scope | L | audit | A technique missing `## Rules` is a defect worth fixing | Section order is fixed but sections are individually optional | ◐ Partially Validated | Sections are individually optional, so absence alone is not a violation; the fix is justified only where a real invariant exists to state — the correction-pass invariant qualifies |
| A-10 | Activity Boundaries | L | audit | The last two activities omitting `transitions[]` is the terminal convention, not a routing defect | The intake lead read them as dead ends; no terminal marker exists in the schema | ✅ Validated | Activity-level transition items require `to` (`activity.schema.json:535`); only step-level branches may omit it for terminal branches (`:492`). `workflow-design/activities/11-retrospective.yaml` is terminal by omitting the block |

---

## Open Assumptions

**A-3 — Dead variable disposition**  
**Statement:** `max_correction_iterations`, `sources_confirmed`, and `finalization_confirmed` are removed rather than given a structural read.  
**Alternatives:** (a) remove all three; (b) give each a structural read in a gate condition; (c) retain as documented-intent variables with no reader.  
**Why no audit settles it:** the removal is content-reducing, so it needs explicit approval whatever the hygiene verdict.  

**A-5 — Terminal acknowledgement gate**  
**Statement:** The failure acknowledgement remains a blocking gate, gaining an effect.  
**Alternatives:** (a) gate with an effect; (b) plain announcement on a terminal activity; (c) leave as is.  
**Why no audit settles it:** whether a human must acknowledge a terminal failure is operator policy; all three shapes are schema-conformant.  

**A-7 — Rework destination**  
**Statement:** Rework options route back to the activity that raised them.  
**Alternatives:** (a) self back-edge; (b) `transitionTo` effect on the option; (c) a dedicated hold activity.  
**Why no audit settles it:** the choice sets how a corrected run replays earlier steps, which is a behavioural preference.  
