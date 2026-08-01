# Assumptions Log

> when expressions: parentheses and precedence before OR step-gate migration · #379 · updated 2026-08-01

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence
(DP-1, RE-1, RS-1, IA-1, PL-1) or task number (1.1, 2.3).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| DP-1 | Design Philosophy | Problem Interpretation | M | This is an inventive improvement (extend `when` dialect + evaluator fidelity), not a specific defect in live gates — PR #374 intentionally kept OR structured; nothing fails today for those sites. Ambiguity source: observation of #374 disposition vs issue framing as "hazard". | Code: issue #379 body; migration register 4 OR keep-rows (`06-migration-register.md`); `09-COMPLETE.md` OR disposition | Validated |
| DP-2 | Design Philosophy | Complexity Assessment | M | Complexity is complex because grammar/precedence, fail-closed policy, four nested production fixtures, packaging splits, and open §0 product decision create multi-approach trade-offs — not a single known-pattern fix. | User: classification-and-path-confirmed → full-workflow (problem_complexity=complex) | Confirmed |
| DP-3 | Design Philosophy | Workflow Path | M | Full path (elicitation + research) is warranted so §0 and acceptance boundaries are settled before implementation analysis; skipping discovery would leave agent-track scope and fail-closed policy underspecified. | User: classification-and-path-confirmed → full-workflow (needs_elicitation=true, needs_research=true) | Confirmed |
| DP-4 | Design Philosophy | Problem Interpretation | L | Recommended C-style precedence (`()` > `!` > comparisons > `&&` > `\|\|`) from the issue is the default design target unless elicitation/research surfaces a stronger project-local rule — issue states it as recommend, not ratified. | — | Open (precedence ratification is a requirements/design decision) |
| DP-5 | Design Philosophy | Workflow Path | H | Issue §0 defaults agent comprehension **out of scope** until an explicit decision — but schema prose today states the server never evaluates `when` gates (agent-evaluated). That execution-model fact reopens whether "agent comprehension" is optional tooling or the production evaluation path. | Code: `src/schema/activity.schema.ts` `when` describe — "Evaluated by the executing agent against current variable state; the server never evaluates gates."; e2e `tests/e2e/walker.ts:306-316` `evaluateWhen` is `&&`-only and unparseable → execute (pass-through) | Open (stakeholder §0 decision must account for agent-evaluated gates; not auto-closed by issue default wording alone) |
| DP-6 | Design Philosophy | Problem Interpretation | M | First delivery may split shared evaluator/fixtures work from corpus migration (issue proposed shape) — packaging is a plan decision, not fixed by classification. "Server evaluator" wording in the issue may mean shared module + walker, not a server runtime gate engine, given activity.schema.ts. | Code: activity.schema.ts agent-evaluates claim; walker.ts helper is test-side only today | Open (elicitation must align vocabulary: shared grammar module vs server runtime evaluation) |
| DP-7 | Design Philosophy | Problem Interpretation | H | Four OR step-gate sites are the binding migration inventory for the first corpus pass — register count 4 "Kept — OR-shaped compound". | Code: `06-migration-register.md` rollup + rows 108–109 (14-complete), workflow-design persist-structural-inventory, prism run-structural | Validated |

## Open Assumptions

### DP-4: Precedence default
**Assumption:** C-style precedence from the issue is the default design target until ratified.  
**Decision space:** Adopt issue-recommended C-style as-is; adopt a different documented order; require parentheses for all mixed ops so precedence is rarely load-bearing for authors.  
**Why not code-resolvable:** Precedence is a language-design choice; code can implement any order once chosen.  
**Technical context:** Issue §1 recommends C-style; e2e walker has no `||` / paren path today (`walker.ts` `evaluateWhen`).  
**Agent's position:** Prefer C-style plus mandatory parentheses when mixing `&&`/`||` (issue §2) so readers never rely on silent precedence alone.  
**Reversibility:** path-committing once corpus `when` expressions and fixtures lock order

### DP-5: Agent comprehension / execution model (§0)
**Assumption:** §0 remains a blocking stakeholder decision; the issue's "out of scope by default" must be reconciled with schema text that agents evaluate `when`.  
**Decision space:** (A) Keep agent-evaluated model — then grammar docs + agent-facing rules + fixtures that prove workers match the reference evaluator are in scope for safe OR migration; (B) Move evaluation to server/walker-authoritative and treat agent reading as non-gating guidance; (C) Hybrid (server validates, agent still must not invent divergent skips).  
**Why not code-resolvable:** Product/architecture choice about who is the authority for step gates.  
**Technical context:** `activity.schema.ts` when-describe; `evaluateCondition` exists for structured conditions in `condition.schema.ts`; e2e walker is `&&`-only pass-through on unparseable.  
**Agent's position:** Prefer documenting the true model first in elicitation; if agents remain the evaluators, §3-style comprehension criteria become safety-relevant rather than optional theatre — size them lean (fixtures + short rule), not multi-agent harness by default.  
**Reversibility:** path-committing for acceptance criteria and test strategy

### DP-6: Delivery packaging and "evaluator" locus
**Assumption:** Shared grammar + reference evaluator module (used by e2e walker and any future server path) then corpus migration is the hazard-correct order; issue "server/test PR" label may need renaming once §0 settles runtime locus.  
**Decision space:** Single PR; evaluator+fixtures then corpus; include agent-rule docs in evaluator PR vs later.  
**Why not code-resolvable:** Release and review preference plus §0.  
**Technical context:** Draft PR #383; issue proposed delivery shape; walker gap at `evaluateWhen`.  
**Agent's position:** Prefer reference evaluator + walker upgrade + truth-table fixtures before migrating the four OR gates.  
**Reversibility:** easily-reversible during plan-prepare
