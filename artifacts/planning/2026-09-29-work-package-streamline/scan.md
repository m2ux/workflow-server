# Work-package streamline — scan

Surface: `corpus/work-package` on `workflows` at ba2ee7b6.

## Engine constraints

- Concurrency exists only as a graph fan: a destination that is a list of activities, or `{activity, over, variable}`. Branches converge on the one activity their exits name.
- A fanned branch may declare no checkpoint (`fan.a-branch-reaches-no-gate`); the load refuses it.
- Branches share the working tree and the planning folder; one persist at convergence. A file two branches both write (the assumptions log) races.
- Inside an activity, `dispatch-round` and the pattern activities run units one at a time.
- Checkpoint-free activities today: implementation-analysis (05), validate (11).

## Parallelism candidates

| Id | Fan | Join | Precondition |
|---|---|---|---|
| P1 | code-review, structural analysis (prism), test-suite review with coverage map | post-impl-review keeps manual diff review gates, classification, fix cycle | Split three checkpoint-free review activities out of 10; prism child walk must run inside a branch (sidecar check) |
| P2 | research, implementation-analysis | plan-prepare | Research's two soft gates move to the join; branches report assumptions as values, one writer converges them |
| P3 | validate, strategic analysis (scope check, orphan scan, diagram sources, architecture summary, artifact conformance) | strategic-review keeps its gates | validate's fix loop edits the tree the analysis reads |
| P4 | ADR, test-plan finalisation, API docs | complete | Small gain |

## Repeated sequences

- `converge-assumptions` runs in 02, 04, 05, 06, 07, 08 — each up to 10 rounds of reconcile plus a three-perspective challenge.
- 03 inlines a weaker reconcile loop (no challenge, no bound) instead of the routine; workflow-design 03 does the same.
- 04 and 05 share a five-step run: collect, document, record, converge, present.
- 07 and 08 share converge, present, residual interview, record; the trailing record repeats one the routine already makes.
- 10 runs the review battery (diff, code, coverage map, test suite, classify) twice, once in its fix cycle; 11 repeats coverage map plus test suite.
- `resolve-artifact-publish` then `artifact-commits` in 13 and 14.
- PR body rendered in 06, 12 and 13.
- `scatter-gather` listed on seven activities that have no scatter step.
- `ensure-graph-index` belongs beside `gitnexus::index-refresh`; three other workflows call index-refresh without setting the flag.

## Templates

- Every artifact declares audience `human`; only the PR body, issue body, review summary, plan, change-block index, provenance log, ADR, test plan and COMPLETE.md have a reader.
- Method records (code review, test suite, strategic review) have none.
- Largest: comprehension corpus (~30 headings), implementation analysis (7 tables), kb and web research, requirements elicitation (~17 headings), design philosophy (no budget), architecture summary (10 sections, 5 diagrams).
- Symbol examples contradict `manage-artifacts.code-reference-is-an-inline-link`: assumptions-review, test-plan, manual-diff-review, pr-review-response, implementation-analysis, wp-plan, review-mode.
- No rule bans URL columns or trailing source lists (kb research, web research, pr-review-response, adr, architecture summary).

## Prism

- post-impl-review runs inline `prism/structural-analysis` below complex, and dispatches and walks the full prism workflow at complex.
- No gate skips either.

## Contract-first tests in parallel with implementation

Sources: Gałęzowski, *Test-Driven Development: Extensive Tutorial* (tests as executable specification; test-first means seeing a failure; test-after tends to test-never). Grenning, *Test Driven Development for Embedded C*, as condensed in `resources/tdd-concepts-rust.md` (watch the test fail first; test list; FIRST — Timely). Humble and Farley, *Continuous Delivery* (automated acceptance tests from acceptance criteria catch what unit suites miss). *Software Quality Assurance* (functional black-box tests derive from the specification).

- Two loops: an outer acceptance loop against the contract, and an inner red-green unit loop that drives design. Only the outer loop splits across agents; the inner stays with the implementer.
- The gain is independence: a test written by the agent that wrote the code tends to restate it (reflective tests). A tester who sees only the contract cannot.
- Precondition: a contract per task before either agent starts — public signatures, behaviours, error cases, acceptance criteria. Plan-prepare's test plan is the nearest existing artifact.
- Contract tests must fail against the base tree before the implementation lands, proving they detect absence.
- Engine fit: fan [contract-tests, implement]; both commit, so each takes its own worktree. Contract tests live in files of their own (integration tests) so the join merges without conflict. Implement's checkpoints (symbol provenance, residual assumptions) move to the join.
- The join runs the contract tests against the implementation; a failure returns to the implementer, a disputed test is a contract ambiguity for the user.

## Decisions

1. Four PRs in order: templates and URL rule; prism gate; routines and assumption handling; parallelism.
2. Delete the three method records (one Method line in each report). An `agent` audience is JSON on disk (`artifact-audience-declared`, `check-audience`), so only the logs become `agent`: the deferred-items and follow-ups registers and the comprehension log. Prose documents stay `human`, trimmed, with line budgets.
3. Skipping prism drops only the full pipeline; complex changes fall back to the inline pass.
4. A checkpoint before the full pipeline, carrying an assessed recommendation of whether the run is worth its cost.
5. Converge assumptions in design-philosophy, assumptions-review and implement only.
6. Parallelism: P1 and P2.
7. Contract-first tests as a fifth PR after parallelism: a contract section in the plan, contract tests fanned beside implement, a join that runs them against the implementation.
