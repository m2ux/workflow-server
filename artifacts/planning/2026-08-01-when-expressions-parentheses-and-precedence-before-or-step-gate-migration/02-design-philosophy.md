# Design Philosophy

> design-philosophy · when expressions: parentheses and precedence before OR step-gate migration · #379 when expressions: ||, parentheses, and precedence before OR step-gate migration · 2026-08-01

## Problem Statement

Today the workflow corpus can express simple step gates and flat AND compounds as inline `when:` expressions, but any gate that needs OR still has to stay in the older structured `condition:` form. That split exists because parentheses, operator precedence, and a full boolean evaluator for mixed `&&` / `||` were not validated when the plain gates moved over — so authors cannot safely write the nested shapes the remaining sites need. Until those rules and the evaluator land, OR-shaped gates stay stranded on the structured path, docs that already describe boolean algebra over-promise what the walker can enforce, and a naive OR migration would risk running or skipping steps differently from the structured trees.

### System Context

| Component | Role |
|-----------|------|
| Workflow definitions (`workflows/`) | Authors step gates as `when:` or structured `condition:` |
| Server condition / `when` evaluation | Authoritative gate truth for activity walks |
| e2e walker (`tests/e2e/walker.ts` `evaluateWhen`) | Test-side gate evaluation; today special-cases `&&` only |
| Schema / design-principle docs | Advertise boolean algebra (`&&`, `||`, `!`, parentheses) |
| Four OR step-gate sites (work-package complete ADR steps, workflow-design intake, prism structural) | Binding nested/OR shapes blocked on evaluator + authoring rules |
| Prior delivery | #338 W7 / #189 C8 via PR #374 (plain + flat `&&` only) |

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | High (semantic hazard if OR migrates without a correct evaluator) |
| Scope | Server evaluator, e2e walker, authoring/lint rules, four production OR step gates; optional agent-comprehension track only if §0 requires it |
| Business Impact | Corpus and docs diverge; OR gates cannot move to the preferred inline dialect; incorrect migration can skip or run steps differently from structured trees |

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Complex

**Rationale:** Nothing is "broken" in the sense of a failing production path — PR #374 deliberately kept OR on structured `condition:`. The work improves the dialect and evaluator so authors can express nested boolean gates safely. Complexity is complex because (1) a shared grammar and precedence must be defined and implemented once across server and walker, (2) fail-closed invalid-expression policy changes current pass-through behavior, (3) authoring rules and optional lint must prevent silent mixed-operator ambiguity, (4) four nested production shapes are load-bearing fixtures, and (5) §0 (whether agent comprehension is in scope) is an open product decision that gates an entire delivery track. Multiple viable packaging shapes (single PR vs server-then-corpus) and trade-offs between fail-closed strictness and migration friction reinforce the complex path.

## Workflow Path Decision

**Selected Path:** Full workflow (elicitation + research)

**Activities Included:**
- [x] Requirements Elicitation
- [x] Research
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** Confirmed at `classification-and-path-confirmed` (`full-workflow`). Complexity is complex; needs_elicitation and needs_research are true; skip_optional_activities is false. Elicitation must settle §0 (agent comprehension in/out), success criteria for grammar/precedence/fail-closed, and packaging boundaries. Research should ground boolean-expression evaluator patterns, C-style precedence conventions, and fail-closed vs pass-through gate semantics before implementation analysis locks the approach.

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | Follow-on to #374; draft PR #383 already open on branch `chore/379-when-expressions-parentheses-precedence` |
| Technical | Do not change gate *variable* semantics — dialect + evaluator fidelity only; checkpoint/loop/exists OR migration out of scope for the first PR unless unblocked |
| Dependencies | Planning trail from `2026-08-01-migrate-legacy-structured-step-conditions-to-when`; companion server track for checkpoint `when` + `condition_not_met` is separate |
| Resources | Worktree at `.worktrees/2026-08-01-when-expressions-parentheses-and-precedence-before-or-step-gate-migration`; host repo `m2ux/workflow-server` |

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria) once elicited.

## Notes

- Agent comprehension of `when` expressions is **out of scope by default** until §0 records an explicit decision (issue acceptance criteria).
- Nested production shapes that make parentheses load-bearing: work-package `14-complete` ADR steps (`is_review_mode != true && (complexity moderate || complex)`); prism `run-structural` (`(single && l12) || full-prism`).
