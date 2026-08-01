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
| DP-4 | Design Philosophy | Problem Interpretation | L | Recommended C-style precedence (`()` > `!` > comparisons > `&&` > `\|\|`) from the issue is the default design target unless elicitation/research surfaces a stronger project-local rule — issue states it as recommend, not ratified. | Agent-led elicitation (stakeholder discussion skipped): adopt C-style as requirements baseline; mandatory parentheses when mixing `&&`/`\|\|` so precedence is rarely load-bearing for authors | Confirmed |
| DP-5 | Design Philosophy | Workflow Path | H | Issue §0 defaults agent comprehension **out of scope** until an explicit decision — but schema prose today states the server never evaluates `when` gates (agent-evaluated). That execution-model fact reopens whether "agent comprehension" is optional tooling or the production evaluation path. | Agent-led §0 split: multi-agent *harness/trials* out of scope by default; short agent-facing grammar rule + truth-table fixtures **in scope** because agents are production evaluators (`activity.schema.ts` when-describe). Does not move MCP gate authority. | Confirmed |
| DP-6 | Design Philosophy | Problem Interpretation | M | First delivery may split shared evaluator/fixtures work from corpus migration (issue proposed shape) — packaging is a plan decision, not fixed by classification. "Server evaluator" wording in the issue may mean shared module + walker, not a server runtime gate engine, given activity.schema.ts. | Agent-led: "server/test" means reference evaluator module + walker + fixtures; corpus four-site migration immediately after (same or sequential PR). MCP runtime gate authority not required in this package. | Confirmed |
| DP-7 | Design Philosophy | Problem Interpretation | H | Four OR step-gate sites are the binding migration inventory for the first corpus pass — register count 4 "Kept — OR-shaped compound". | Code: `06-migration-register.md` rollup + rows 108–109 (14-complete), workflow-design persist-structural-inventory, prism run-structural | Validated |
| RE-1 | Requirements Elicitation | Requirement Interpretation | H | §0 "agent comprehension" means multi-agent trial harnesses, not the mere existence of agent-facing grammar guidance — issue language is ambiguous between trials and production agent evaluation. | Agent-led split recorded in `03-requirements-elicitation.md` (SC-1/SC-8); issue default "out of scope" applies to harnesses only | Confirmed |
| RE-2 | Requirements Elicitation | Scope Boundaries | M | Fail-closed invalid `when` is required for this package even though today's walker fails open — issue acceptance §1 and semantic-hazard framing override current pass-through. | Issue #379 acceptance §1; comprehension artifact fail-open observation | Confirmed |
| RE-3 | Requirements Elicitation | Implicit Requirements | M | Comparison surface for v1 stays at least `==` / `!=` (current walker); richer operators are not required to unlock the four OR sites. | Code: `evaluateWhen` comparison match; four keep-sites use only `==` / `!=` | Confirmed |
| RE-4 | Requirements Elicitation | Success Criteria Interpretation | M | Side-by-side parity with structured `evaluateCondition` on the four keep-sites is the migration safety bar (SC-11), not only isolated `when` unit tests. | Issue hazard framing + inventory nested shapes | Confirmed |
| RE-5 | Requirements Elicitation | Scope Boundaries | L | Checkpoint/loop/exists OR work stays deferred unless a companion track unblocks `condition_not_met` on `when`. | Issue §5 out of scope; companion server track noted | Confirmed |
| RE-6 | Requirements Elicitation | Requirement Interpretation | M | Moving production evaluation into MCP tools is **not** a success criterion for unlocking OR migration in this package (open product Q5 answered provisionally for this delivery). | Comprehension Q5 + agent-evaluated schema; SC-1 documents model without requiring server authority move | Confirmed |
| RS-1 | Research | Pattern Applicability | H | A single shared parse/eval module (recursive-descent or Pratt) is the right shape vs extending `split('&&')` clones in walker and stealth. | Code: dual incomplete evaluators; MDN/Pratt practice; catalog operator-precedence parsing | Validated |
| RS-2 | Research | Source Relevance | M | concept-rag has little usable boolean-parser chunk text for this topic; codebase + MDN are sufficient authorities for this package. | concept_search empty chunks; broad_chunks noise; catalog titles only | Validated |
| RS-3 | Research | Synthesis Decisions | L | Short-circuit evaluation is optional for pure bag lookups; truth-table outcome must match full boolean evaluation of both sides. | Gate vars have no side effects; MDN short-circuit note | Confirmed |
| RS-4 | Research | Risk Assessment | M | Fail-closed walker is an intentional behavior change for currently unparseable expressions that execute today. | walker.ts return true on junk; SC-6 | Confirmed |
| RS-5 | Research | Pattern Applicability | L | Module path, lint home, and same-vs-sequential PR packaging remain plan/implementation choices (RC-1, RC-3, RC-4). | Analyse-challenge: not stakeholder-judgement; packaging defaults from DP-6 (evaluator + fixtures first, four-site corpus immediately after). Exact path/lint home = implementation-analysis. | Handoff (IA/plan) |

## Open Assumptions

None — research residue empty after analyse-challenge. RS-5 is an implementation/plan handoff, not a stakeholder open.

## Wrap-Up

18 assumptions after research — RS-1–RS-4 validated/confirmed; RS-5 handed to implementation-analysis / plan-prepare (no residual interview). Deferred multi-agent harness and server-authority move tracked in [deferred-items](deferred-items.md).
