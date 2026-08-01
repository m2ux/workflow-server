# Knowledge Base Research - when expressions: parentheses, precedence, OR readiness

> #379 · 2026-08-01 · Complete

## Research Approach

| Activity | Technique Used | Results Summary |
|----------|----------------|-----------------|
| concept-rag activities index | `concept-rag://activities` → understand-topic / identify-patterns / identify-best-practices | Matched pattern + best-practice activities; concept_search hit titles but often **0 chunks** |
| catalog_search | Beautiful Code; Introduction to Compilers and Language Design (Thain) | Catalog confirms library holds **operator-precedence parsing**, top-down operator precedence, recursive descent, grammar ambiguity — applicable patterns; chunk text for those sections was not returned by concept/broad search (noise hits on “operator”) |
| broad_chunks_search | boolean/precedence query | Low-relevance Industry 4.0 / QA “closed” hits only — **no usable boolean-parser passages**; rely on catalog metadata + web + codebase |
| GitNexus + code read | `query` + direct reads of `evaluateWhen`, `evaluateCondition`, keep-site YAML, `evalWhen` | Confirmed dual incomplete `when` evaluators, full structured AST evaluator, four OR keep-sites |
| Web research | MDN operator precedence; Pratt/precedence-parser literature | C-style `()` > `!` > comparisons > `&&` > `\|\|` ratified; Pratt or layered recursive-descent are standard implementations |

## Relevant Concepts Discovered

### Dual dialect (inline `when` vs structured `Condition`)

**Source:** [when-step-gates.md](../../comprehension/when-step-gates.md); `src/schema/activity.schema.ts`; `src/schema/condition.schema.ts`  
**Relevance:** Production step gates use agent evaluation of `when` strings; structured `condition` remains for OR/nested OR, exists, checkpoints, loops.  
**Key Insight:** #379 completes the **inline dialect** so four OR step gates can leave structured form without changing bag semantics.

### Agent-evaluated production model

**Source:** `activity.schema.ts` `when` describe — "Evaluated by the executing agent… the server never evaluates gates."  
**Relevance:** SC-1 / §0 — multi-agent *harnesses* stay deferred; short agent grammar + fixtures are production safety.  
**Key Insight:** "Server evaluator" in issue language maps to a **shared reference module + walker/tests**, not an MCP authority move in this package.

### Incomplete mechanical `when` evaluators (fail-open / partial)

**Source:** `tests/e2e/walker.ts` `evaluateWhen` (lines ~306–326); `scripts/check-stealth-isolation.ts` `evalWhen`  
**Relevance:** Both only split on `&&`; walker returns `true` (execute) on unparseable input; stealth returns `undefined` (treat as reachable).  
**Key Insight:** Naïve `\|\|` string-split without parentheses/precedence still mismatches nested keep-sites. Fail-closed invalid expressions are a **behavior change** for the walker.

### Full structured boolean tree (reference for parity)

**Source:** `evaluateCondition` in `condition.schema.ts` — recursive `and`/`or`/`not`/`simple`  
**Relevance:** SC-11 side-by-side parity for four keep-sites; migration safety bar.  
**Key Insight:** Structured path already implements correct OR trees; inline path must match those truth tables, not invent left-to-right-only rules.

### Binding inventory — four OR step gates

**Source:** migration register `06-migration-register.md` (Kept — OR-shaped compound: **4**); live YAML  

| # | Workflow / file | Step id | Logical shape (target `when`) |
|---|-----------------|---------|--------------------------------|
| 1–2 | work-package `14-complete.yaml` | `create-adr`, `update-adr-status` | `is_review_mode != true && (problem_complexity == "moderate" \|\| problem_complexity == "complex")` |
| 3 | workflow-design `01-intake-and-context.yaml` | `persist-structural-inventory` | `operation_type == "update" \|\| operation_type == "review"` |
| 4 | prism `01-structural-pass.yaml` | `run-structural` | `(current_unit.pipeline_mode == "single" && current_unit.lens_name == "l12") \|\| current_unit.pipeline_mode == "full-prism"` |

**Key Insight:** Two shapes are parentheses-load-bearing under C-style precedence; flat OR still needs `\|\|` support.

### C-style operator precedence (external canon)

**Source:** [MDN Operator precedence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence) (2026)  
**Relevance:** DP-4 / SC-3 — `()` > `!` > comparisons > `&&` > `\|\|`.  
**Key Insight:** Matches issue recommendation and ECMAScript logical operators; mandatory parentheses when mixing `&&`/`\|\|` is an **authoring** rule layered on top of precedence so readers never rely on silent binding alone.

### Precedence-parser implementation patterns

**Source:** Wikipedia / Pratt literature; example Pratt tiers in Hyperformula (`||` bp 10, `&&` bp 20, comparisons higher, unary `!` highest among logicals)  
**Relevance:** Implementation analysis packaging — recursive-descent layers or Pratt both fit a small boolean dialect.  
**Key Insight:** Prefer one shared module over growing `split('&&')` clones in walker + stealth + future guards.

## Applicable Design Patterns

| Pattern | Source | How It Applies | Confidence |
|---------|--------|----------------|------------|
| Single reference evaluator | Comprehension + dual script drift | One parse/eval module imported by e2e walker (and stealth/guards over time) | HIGH |
| Fail closed on invalid input | Issue SC-6; contrast walker fail-open | Unparseable `when` → do not execute step | HIGH |
| Explicit parentheses for mixed ops | Authoring rule + lint | Reject bare `a && b \|\| c`; require `(a && b) \|\| c` or `a && (b \|\| c)` | HIGH |
| Side-by-side AST parity | `evaluateCondition` vs new `when` | Fixture bags flip branches for four keep-sites | HIGH |
| Pratt or layered recursive descent | Web / compiler practice | Small grammar; either is fine — pick one, test truth tables | MEDIUM |
| Agent-facing grammar card | §0 production model | Short rule: honor parens; same precedence as reference module | HIGH |

## Best Practices Found

### Document grammar once; implement once

**Source:** Comprehension dual-dialect gap; MDN single precedence table  
**Description:** Advertised boolean algebra without a shared evaluator causes author/doc/walker drift.  
**Application:** Schema/docs section + unit tests + walker all bind to one module.

### Prefer parentheses over silent mixed-operator reliance

**Source:** MDN notes that mixed logical forms are easy to misread; requirements SC-4  
**Description:** Even when precedence is defined, authors and agents mis-group.  
**Application:** Lint/guard rejects mixed `&&`/`\|\|` without parentheses; legal parenthesized forms pass.

### Fail closed at trust boundaries for mechanical walkers

**Source:** Walker currently fails open; issue acceptance  
**Description:** Test robots that execute on junk greenwash incomplete parsers.  
**Application:** Invalid expression → skip/fail path consistent with "gate not satisfied," never silent execute.

### Migrate corpus only after evaluator truth tables

**Source:** Issue hazard framing; SC-9  
**Description:** OR keep-sites stay structured until SC-2–SC-6 land.  
**Application:** Packaging: evaluator + fixtures + walker first; four YAML migrations immediately after (same or sequential PR).

## Risks and Anti-Patterns

| Risk/Anti-Pattern | Source | Mitigation |
|-------------------|--------|------------|
| Naïve `split('\|\|')` without parens | Comprehension deep-dive | Real parser with grouping |
| Second parallel `when` evaluator in scripts | stealth `evalWhen` vs walker | Import shared module; delete/fork clones |
| Treating multi-agent harness as merge gate | Issue §0 | Deferred (D-1); fixtures + agent rule only |
| Moving MCP gate authority in same PR as dialect | Q5 / D-2 | Out of package; module may feed later server path |
| Changing comparison operators or bag names during migration | RE-3 / RE-4 | `==`/`!=` + dotted paths only for v1 four sites |
| Fail-open residual in any consumer | walker today | Fail-closed policy + tests for garbage strings |

## Recommended Approach

Based on research findings:

1. **Primary Pattern:** Shared reference `when` parse/eval module (recursive-descent or Pratt) with C-style precedence, parentheses, `!`, `&&`, `\|\|`, comparisons (`==`/`!=` minimum), dotted identifiers; fail-closed API.
   - Rationale: Eliminates dual incomplete evaluators; matches structured-tree parity needs; unlocks four keep-sites safely.

2. **Key Practices to Apply:**
   - Truth-table fixtures: flat OR; bare mixed vs parenthesized variants; `14-complete` nested shape; prism nested shape; invalid → closed.
   - Authoring rule + preferred lint: mixed `&&`/`\|\|` requires parentheses.
   - Wire e2e `evaluateWhen` to the module; plan stealth/guards as follow-on consumers.
   - Short agent-facing grammar rule (workflow-engine / activity-worker guidance).
   - Migrate four YAML sites only after fixtures green; update migration register.

3. **Risks to Monitor:**
   - Walker fail-closed is a **behavior change** for existing typos that currently execute — intentional per SC-6.
   - String quoting / bare identifiers must match current walker semantics for bag values (`true`/`false`/`null`/numbers/quoted strings).
   - Do not expand v1 to `exists`/`>` unless keep-sites need them (they do not).

## Open Research Candidates

| ID | Candidate | Classification | Rationale | Resolution / Handoff | Outcome |
|----|-----------|----------------|-----------|----------------------|---------|
| RC-1 | Exact module path / export surface (`src/schema/when-expression.ts` vs `src/utils/…`) | Irreconcilable | Packaging is plan/implementation judgment, not further research | Handoff: code-analysis / plan-prepare | Irreconcilable (code-analysis) |
| RC-2 | Whether short-circuit evaluation is observable for bag reads | Partially Resolved | Gate vars are pure bag lookups without side effects; short-circuit optional; outcome must match full boolean eval | Prefer simple full eval of both sides unless short-circuit is free; document pure-eval | Partially Resolved |
| RC-3 | Lint home (definition-lint vs new guard vs schema refine) | Irreconcilable | Guard suite choice is implementation analysis | Handoff: code-analysis | Irreconcilable (code-analysis) |
| RC-4 | Same-PR vs sequential-PR for four-site corpus migration | Irreconcilable | Delivery packaging decision (DP-6 already prefers tight sequence) | Handoff: stakeholder if contested; else plan default | Irreconcilable (stakeholder) — default: sequential OK if evaluator lands first |
| RC-5 | KB library depth on boolean parsers | Resolved | concept-rag returned empty chunks; web + codebase sufficient | Gap noted; no blocker | Resolved |

## Findings Synthesis (requirements map)

| Requirement / SC | Research support |
|------------------|------------------|
| SC-1 §0 execution model | Schema + comprehension: agent evaluates; harness deferred; agent rule in scope |
| SC-2–SC-4 grammar/precedence/parens | MDN C-style; mandatory parens as authoring rule |
| SC-5–SC-7 fixtures + walker share module | Dual evaluators today; four keep-site shapes documented |
| SC-6 fail-closed | Walker fail-open is the hazard; change required |
| SC-8 agent rule | Production path is agents; short grammar card |
| SC-9–SC-11 migration parity | Register + YAML + `evaluateCondition` as oracle |
| Out of scope D-1–D-6 | Confirmed deferred; research does not reopen |

## Applicable Patterns → Needs

| Need | Pattern |
|------|---------|
| Unlock OR `when` safely | Reference evaluator + truth tables + structured parity |
| Stop greenwash | Fail-closed invalid expressions |
| Author clarity | Mandatory parentheses on mixed ops + lint |
| Agent fidelity | Grammar rule matching evaluator |
| Avoid dual code | One module; retire split-based clones over time |

## Synthesis Assumptions

| ID | Assumption | Notes |
|----|------------|-------|
| SA-1 | Recursive-descent or Pratt are interchangeable for this dialect size | Confidence HIGH — pick for readability |
| SA-2 | v1 comparisons stay `==`/`!=` (+ bare truthiness if already supported) | Matches four keep-sites |
| SA-3 | Fail-closed means "step does not run" in walker (same as false gate), not throw aborting whole walk | Align with current `continue` on false |
| SA-4 | Stealth script can lag one PR if walker is primary safety net | Prefer same module when cheap |

## Web Research Findings

### Search Queries Used

| Query | Sources Consulted | Key Findings |
|-------|-------------------|--------------|
| boolean expression parser operator precedence Pratt C-style && \|\| | crates.io logical_expression_parser; Hyperformula Pratt; Wikipedia Pratt | Precedence tiers; parentheses as primary; binding powers for `\|\|` < `&&` < comparisons < `!` |
| ECMAScript operator precedence logical AND OR unary not MDN | MDN Operator precedence (fetched 2026-08-01) | Grouping highest; `!` above comparisons; `&&` above `\|\|`; left-associative logicals |

### External Documentation

| Source | URL | Key Insights | Relevance |
|--------|-----|--------------|-----------|
| MDN Operator precedence | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence | C-style order for `()`, `!`, `==`/`!=`, `&&`, `\|\|` | HIGH — DP-4 / SC-3 |
| MDN Logical AND | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND | `&&` binds tighter than `\|\|` | HIGH |
| Pratt parsing overview | https://en.wikipedia.org/wiki/Pratt_parser | Top-down operator precedence for mixed ops | MEDIUM — implementation option |
| Hyperformula Pratt tiers (example) | https://github.com/codetalcott/hyperformula/blob/main/packages/core/src/parser/pratt-parser.ts | Concrete bp table: or 10, and 20, comparisons 30, unary high | MEDIUM |

### Community Practices

| Practice | Source | Application |
|----------|--------|-------------|
| Encode precedence in binding powers or parse layers | Pratt literature / Hyperformula | Avoid ad-hoc multi-split string hacks |
| Parentheses override all | MDN grouping operator | Required for load-bearing nested keep-sites |

### Alignment with KB Research

KB concept-rag returned **no usable chunks** for precedence/DSL/fail-closed (titles only). External sources **confirm** C-style precedence and parser patterns already assumed from issue #379 and comprehension. Repo-local evidence remains authoritative for execution model and keep-sites.

| KB / repo finding | Web validation | Notes |
|-------------------|----------------|-------|
| C-style precedence target | Confirmed (MDN) | No contradiction |
| Prefer real parser over split | Confirmed (Pratt/RD practice; Beautiful Code / Thain catalog concepts) | Extended |
| Fail-closed invalid | Not a language default — product policy | Issue-driven; keep |
| Catalog: operator-precedence parsing | Confirmed as library topic (Beautiful Code) | Metadata-level only; web MDN still primary precedence authority |

## Sources Referenced

| Document | Relevance | Key Sections |
|----------|-----------|--------------|
| `.engineering/artifacts/comprehension/when-step-gates.md` | Primary architecture | Dual dialect, evaluateWhen, keep-sites, §0 |
| `src/schema/activity.schema.ts` | Production evaluation model | `when` field describe |
| `src/schema/condition.schema.ts` | Structured oracle | `evaluateCondition` |
| `tests/e2e/walker.ts` | Mechanical net | `evaluateWhen` fail-open |
| `scripts/check-stealth-isolation.ts` | Second incomplete consumer | `evalWhen` |
| `workflows/work-package/activities/14-complete.yaml` | Nested OR keep-sites | create-adr / update-adr-status |
| `workflows/workflow-design/activities/01-intake-and-context.yaml` | Flat OR | persist-structural-inventory |
| `workflows/prism/activities/01-structural-pass.yaml` | Nested AND-in-OR | run-structural |
| `…/migrate-legacy…/06-migration-register.md` | Inventory count 4 | Kept — OR-shaped |
| `03-requirements-elicitation.md` | SC-1–SC-11 | Acceptance bar |
| MDN Operator precedence | External canon | Logical tiers |

**Status:** Complete
