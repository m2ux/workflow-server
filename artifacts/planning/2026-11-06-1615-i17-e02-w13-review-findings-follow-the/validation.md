# W13 Validation

## Candidate

- Unit: I17:E02:W13, AC20.
- Task base: `d632a4e06` (origin/i17/e02/workspace after W12 #1664).
- Task head: `325f651361c53105f7daf54b7a195a387dad8073`, branch `i17/e02/w13-review-findings-follow-the`.
- Owner: `skills/work-planner/artifacts/agent-review.md` (Review Scope guidance, Resolve Review Findings, Review Record `scope`).
- Consumer: `skills/work-planner/modes/deliver-mode.md` step 11 hoists the arising issues an agent review's exclusion saved and saves only unsaved ones. `scripts/agent_review.py` is unchanged: exclusions live in the existing `scope` string, so the serialized record shape and the validator's strict disposition and link rules stand as they were.

## Review Scope Fixtures

Fourteen focused tests pass ([focused.log](focused.log)). `review-scope-cases.json` holds synthetic before/after sources and probes (offline; no tracker save is performed). Each case declares its `fault` function and `membership`:

| Case | Evidence | Membership |
| --- | --- | --- |
| A | `charge` boundary changes from accept to reject | finding (introduced defect) |
| B | unchanged `parse_limit` fault now reached by changed `handle` | finding (affected-caller risk) |
| C | `legacy_limit` fault identical before and after, unreachable from every changed function, issue saved | excluded |
| D | as C, arising issue unsaved | finding |
| E | plugin call path unavailable, independence unestablished | finding |
| F | changed docstring misstates the return | finding (introduced, nonblocking) |

A membership oracle derives each case from the fixture's evidence alone: per-function source comparison, executed before/after probes and an AST call-graph reachability check from every changed function. It matches each declared membership.

## Validator Observations

Real `agent_review.check` runs:

- Hot-fix: every case's finding fails open and deferred (blocking and nonblocking), and passes only fixed with evidence; the excluded case passes with its issue link in `scope` and an empty findings list.
- Hot-fix fixed findings without an evidence link fail for both severities.
- Integration review: blocking open/deferred fail; nonblocking open fails for its missing disposition; nonblocking deferred without a ticket and fixed without evidence fail on the missing link and pass once linked.
- Relabelling A, B, D, E or F as unrelated (with a saved issue where one is absent) leaves the observation in findings, and the record fails review.
- A scope note never establishes a current review identity (stale head still fails).

## Full Checks

- Planner: 1039 tests, one opt-in live-link skip, [planner.log](planner.log) (includes installed document/model and catalogue checks).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 59 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings, [whitespace.log](whitespace.log).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s test -p test_review_scope.py -v   # skills/work-planner
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```

## Limits

The oracle models the Review Scope rule over literal fixtures; it does not execute an agent's reading of the prose. The validator does not parse `scope`, so membership is enforced by the procedure, and every observation recorded as a finding remains under the validator's strict rules.
