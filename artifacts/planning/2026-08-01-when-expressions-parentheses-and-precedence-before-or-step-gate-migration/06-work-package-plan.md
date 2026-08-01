# when expressions: parentheses, precedence, OR readiness - Implementation Plan

> plan · HIGH · Ready · 2-4h agentic + 45-90m review · 2026-08-01

## Overview

### Problem & Scope
Problem, scope, and success criteria: [requirements](03-requirements-elicitation.md).

## Inputs

- [Knowledge Base Research](04-kb-research.md#recommended-approach) — shared reference evaluator, fail-closed, mandatory mixed-op parens, structured parity
- [Implementation Analysis](05-implementation-analysis.md#gap-analysis) — G1–G10; module path `src/schema/when-expression.ts`; LOW walker blast radius
- [Design Philosophy](02-design-philosophy.md) — inventive improvement; full path; agent-evaluated production model
- [Comprehension](../../comprehension/when-step-gates.md) — dual dialect, four OR keep-sites, fail-open walker

## Proposed Approach

### Solution Design

Ship one **reference `when` dialect** as a library next to the structured oracle, wire the e2e walker to it (fail-closed), prove nested shapes with truth tables, then migrate the four OR step gates.

| Layer | Choice |
|-------|--------|
| Module | `src/schema/when-expression.ts` — parse + eval + authoring check |
| Grammar | Comparisons `==`/`!=`, bare truthiness, unary `!`, `&&`, `\|\|`, parentheses; dotted identifiers |
| Precedence | C-style: `()` > `!` > comparisons > `&&` > `\|\|` |
| Authoring | Mixed `&&`/`\|\|` **requires** parentheses (lint rejects bare mixed) |
| Invalid input | Fail-closed → step does not run (walker `continue`) |
| Production | Agents remain gate authority; short grammar rule matches the module |
| Corpus | Four keep-sites → parenthesized `when`; register + guards |
| PR packaging | **Single PR preferred** (module → fixtures → walker → docs/rule → guard → YAML). Sequential evaluator-then-corpus OK if needed |

**Implement order:** module → unit fixtures → walker wire → schema/agent prose → mixed-ops guard → four YAML + register → optional stealth import.

**Keep-site target `when` strings** (parity with structured trees):

| Site | Target `when` |
|------|----------------|
| `14-complete` create-adr / update-adr-status | `is_review_mode != true && (problem_complexity == "moderate" \|\| problem_complexity == "complex")` |
| workflow-design persist-structural-inventory | `operation_type == "update" \|\| operation_type == "review"` |
| prism run-structural | `(current_unit.pipeline_mode == "single" && current_unit.lens_name == "l12") \|\| current_unit.pipeline_mode == "full-prism"` |

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Shared module in `src/schema/when-expression.ts` | Co-located with `evaluateCondition`; walker already imports schema | Slightly more “runtime” surface in schema package | **Selected** |
| Module only under `tests/` | Isolates product code | Guards/docs cannot share; dual truth returns | **Rejected** |
| Extend `split('&&')` for `\|\|` | Tiny diff | Breaks nested keep-sites; no parens | **Rejected** |
| Move gate eval into MCP tools | Single server authority | Out of package (D-2); not required to unlock OR | **Deferred** |
| Multi-agent comprehension harness | Extra confidence | Out of scope (D-1); fixtures + agent rule suffice | **Deferred** |
| Two PRs (evaluator then corpus) | Smaller reviews | Window where docs allow OR but corpus still structured | **Acceptable fallback** |

### Assumptions
Assumptions underlying the approach: [assumptions log](02-assumptions-log.md).

## Implementation Tasks

### Task 1: Reference when-expression module (45-75 min)
**Goal:** Parse/eval library with C-style precedence and fail-closed API (G1, G2).
**Deliverables:**
- `src/schema/when-expression.ts` — tokenizer; recursive-descent or Pratt; `evaluateWhenExpression(expr, bag)`; authoring helper for mixed-ops parens
- Export surface suitable for walker + unit tests (no MCP wiring)

### Task 2: Truth-table unit fixtures (40-60 min)
**Goal:** Lock grammar and keep-site shapes before corpus edit (G3, SC-5/SC-7).
**Deliverables:**
- `tests/when-expression.test.ts` (or adjacent) — flat OR; bare mixed reject; `(a && b) \|\| c` vs `a && (b \|\| c)`; unary `!`; invalid → closed; 14-complete + prism bag matrices; side-by-side vs `evaluateCondition` on four trees (SC-11)

### Task 3: Wire e2e walker (20-35 min)
**Goal:** Mechanical net shares the module; fail-closed (G2, G4).
**Deliverables:**
- `tests/e2e/walker.ts` — `evaluateWhen` delegates to shared module; preserve call sites
- Confirm existing flat-`&&` paths still skip/run correctly (regression via unit + any walker cases)

### Task 4: Schema describe + agent-facing rule (20-35 min)
**Goal:** Documented grammar + short production rule (G7, G8; SC-2, SC-8).
**Deliverables:**
- `src/schema/activity.schema.ts` — `when` describe: operators, precedence, mandatory mixed parens, fail-closed mechanical nets
- Workflow-engine / activity-worker technique prose — honor parentheses; match reference evaluator (positive present)

### Task 5: Mixed-ops authoring guard (30-50 min)
**Goal:** Corpus cannot grow bare mixed `&&`/`\|\|` (G5; SC-4, SC-10).
**Deliverables:**
- `scripts/check-when-expression.ts` (or definition-lint extension) — reject bare mixed; allow parenthesized forms
- Register in `scripts/guards.ts` / check:all table

### Task 6: Four-site corpus migration + register (35-55 min)
**Goal:** OR step gates become parenthesized `when` with unchanged bag semantics (G6; SC-9, SC-11).
**Deliverables:**
- `workflows/work-package/activities/14-complete.yaml` — create-adr, update-adr-status
- `workflows/workflow-design/activities/01-intake-and-context.yaml` — persist-structural-inventory
- `workflows/prism/activities/01-structural-pass.yaml` — run-structural
- Migration register disposition update (planning trail / in-PR note as appropriate)

### Task 7: Optional stealth consumer (15-25 min)
**Goal:** Retire second incomplete parser when cheap (G9).
**Deliverables:**
- `scripts/check-stealth-isolation.ts` — import shared module; drop local `evalWhen` if behavior-compatible

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria); baselines and measurement: [implementation analysis](05-implementation-analysis.md#baseline-metrics).

Task-level only:
- Walker impact remains LOW (GitNexus) — no new MCP gate authority
- Flat-`&&` live sites unchanged in truth table after Task 3

## Testing Strategy

Test cases and acceptance matrix: [test plan](06-test-plan.md).

## Dependencies & Risks

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Fail-closed changes walker on junk strings | MEDIUM | HIGH (intentional) | Explicit fixtures; document behavior change |
| Nested keep-site parity miss | HIGH | LOW | SC-11 side-by-side before YAML migrate |
| Guard/regex drift (review-mode) | LOW | MEDIUM | Keep review-mode regex if equivalent; else parse via module later |
| Split PR leaves corpus stranded | MEDIUM | LOW | Prefer single PR; if split, corpus PR immediate |

**Status:** Ready for implementation
