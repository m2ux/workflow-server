# Saved Plan Publication Validation

## Revision and Scope

I17 E05 W01 implements Plan Mode's publication sequence in `skills/work-planner/modes/plan-mode.md`, covering AC1–AC3. The task branch is `i17/e05/w01-confirm-epic-and-parent`, targeting `i17/e05/workspace` at `9a924cfdda903ca64257449d8b5bf2ff762725ce`. Its committed and plain-pushed candidate is `7d38aca5aa42a71c1425c9abdbc2eaaf884d834d`; the worktree is clean and tracks the matching remote branch. The coordinator verifies the final merged revision separately.

## Ordered Publication Fixtures

The bounded offline route adapter reads the installed publication subsections, selects their operation links and branch clauses, and records concrete issue saves, returned identities, fresh reads and validation inputs. The captured tracker can refuse creation/update, return disagreeing fields or withhold saved context. No fixture performs a tracker write.

| Coverage | Observed scenarios |
| --- | --- |
| AC1 | An existing initiative receives a new epic before its parent rows are saved and read for validation. Two dependent new epics save in dependency order and substitute the actual producer identity. A new initiative is created once and then updated with confirmed epic identities. |
| AC2 | The parent table carries confirmed child identities; an existing epic keeps its issue identity. Unaffected sibling epics remain in the saved parent and are read without an extra save. The actual installed formatter and dependency reader validate the fresh issue bodies through the existing test helpers. A genuine dependency finding selects correction before delivery preparation. |
| AC3 | Failed new-parent creation, failed epic creation/update, failed parent save, disagreeing saved fields and unreadable saved context stop before downstream validation or preparation, retaining the exact failure. |

Mutation controls remove the epic save, parent save or fresh-context read from the source: the fixtures then lack confirmed identity/context or detect the stale saved parent, establishing that the adapter does not obtain its successful sequence from an expected trace alone. The adapter recognizes this route's bounded instruction grammar; it does not establish arbitrary prose execution or live-agent behavior.

Focused command: `python3 -m unittest discover -s skills/work-planner/test -p test_plan_publication.py -v`, under the required workspace sandbox. Result: **14 tests passed**. Exact output is [e05-w01-focused.log](e05-w01-focused.log).

## Regression Results

| Check | Result | Output |
| --- | --- | --- |
| Full Work Planner suite, including model/command/checkout/catalogue checks | 973 run, 972 passed, one opt-in live check skipped; 44.519 seconds | [Planner](e05-w01-planner.log) |
| Shared checker suite | 280 passed; 0.598 seconds | [Shared](e05-w01-shared.log) |
| Installed skill files | 59 files, zero findings | [Skill Check](e05-w01-skill-check.log) |
| Focused publication route fixtures | 14 passed; 0.038 seconds | [Focused](e05-w01-focused.log) |
| Whitespace | `git diff --cached --check` passed before commit | Captured local command result |

All Python checks ran from the isolated task checkout under the absolute workspace sandbox launcher in the namespace-capable execution context. These local suites establish no external workflow or live-tracker execution.

## Source Review

Parent creation is conditional. Epic saves and parent-row publication serve both new and existing parents through the owning Issue capability. Each save's confirmed identity supplies dependent drafts; a failed or disagreeing save terminates the route. Fresh parent and every named epic supply the body, goal and dependency checks. Findings return to publication/readback with saved identities retained. Delivery preparation requires passing saved-context checks.

The mode selects capabilities and their continuation without copying the tracker writer's implementation or contract. The source search finds no publication branch that limits epic saves to a new parent. Existing issue identities and unrelated metadata remain under the owning Issue save contract.

## Reading Evidence

Static trace: the entry point selects Plan Mode after common Rules and Conventions. The publication stage selects the owning save/readback capability, then saved body/goal/dependency validators. Common same-revision context is reused. Required shared and skill guidelines were recovered completely after an initially truncated batched read.

Readers A and B independently trace the six captured cases at committed candidate `7d38aca5aa42a71c1425c9abdbc2eaaf884d834d`. Their [first](publication-reader-a.md) and [second](publication-reader-b.md) receipts confirm publication order, saved identities, full sibling context and failure stop points. Broad reads and recovered output/command limitations are recorded; no complete disclosure-conformance, citation-efficacy, performance or live-tracker claim is made. The source-route adapter remains offline execution evidence.

## Plan Changes

Applied: none. Held: none. The sibling-context and actual-dependency cases verify the existing publication scope and introduce no new policy.
