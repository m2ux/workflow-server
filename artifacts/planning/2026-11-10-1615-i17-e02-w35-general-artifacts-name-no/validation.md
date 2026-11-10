# W35 Validation

## Candidate

- Unit: I17:E02:W35, AC65.
- Task base: `f0139228e` (origin/i17/e02/workspace after W32 #1684).
- Task head: `f2159fa38`, branch `i17/e02/w35-general-artifacts-name-no`.
- Component: the eight artifacts [w35.md](w35.md) declares. No test file is added; the observing check is [kind-routes.py](kind-routes.py) in this folder.

## Analysis and Plan

Every kind mention in the declared files at the task base (38, [kind-routes-base.log](kind-routes-base.log)) and what replaces it:

| File | Mention | Replacement |
| --- | --- | --- |
| delivery-plan.md | Hot-fix Units; `unit`, `undeclared`, `hold`, `merge`, `unrecorded`, unresolved lines; export id | `### Kind Units`: an open issue of a registered kind whose artifact states a Delivery Unit, with that artifact's Branch and delivering pull requests. Each report line names a kind unit. |
| delivery-branches.md | Hot-fix branch case | Kind units work on the branch their kind's artifact names. |
| delivery-brief.md | Epic or hot-fix issue URL | The issue the unit delivers: its rows' epic or a kind unit's issue. |
| dispatch-batch.md | Hot-fix start association; hot-fix scope selector | A kind unit's Delivery Unit hold; kind unit tags. |
| board-queue.md | Hot-fix status, refusal exception, placement, proposed change, records | Items whose registered kind supplies Settle Board Status, through board.md Membership. |
| pull-request.md | Hot-fix draft rule; `[I`/`[F` fetch filter; branch example; Merge Permission | Draft for a kind supplying Review Before Merge; the fetch keeps every bracketed title tag; `task-branch:` example; kind unit. |
| agent-review.md | Hot-fix delivering pull request; every-finding rule; `base_ref`; standalone Placement | Kind-tagged pull requests, defined in Review Record as titled with a registered kind's tag (agent_review.py's rule); arising issue placed as its registered kind's artifact states. |
| standup-report.md | Hot-fix section, ordering, key and marks | Unaffiliated kinds: board items of a registered kind outside every initiative. |

Kept as literal examples (inline code): `[F00]`, `o/r#F02`, `unit F00 #874: …`, `F=Hot-fix`, `[F00] Reject Bad Keys`.

Field boundaries, from the audit's [fields ledger](../2026-11-06-1615-i17-e02-w02-audit-ownership-fields-and/fields-ledger.md):

| Field | Action clause | Owner |
| --- | --- | --- |
| Branches | The evaluated revision is fetched before it is read | Read Delivery Branches, new step Fetch Evaluated Revision; Prepare Delivery Bases already fetches |
| Branches | Disagreeing declarations are each reported with their source | Sync Epic (epic-issue-body.md), which already reports them `unevaluable` |
| Epic Bases | An epic sync reports off-route pull requests as `target` | Delivery Findings `Target` (epic.md), already stated there |
| Execution Instructions | A missing instruction or prerequisite is a finding provided to the caller | Missing Context holds it; Unit Dispatch retains and resolves it, Run Delivery Session provides it |

## Kind Search, Field Boundaries and Routes

[kind-routes.py](kind-routes.py) searches the eight files outside inline code for kind names, title tags and links to a kind's own artifact; checks the Delivery Branches and Delivery Brief Fields for fetch, report, refusal or caller-finding clauses; confirms each moved clause's owner and caller; resolves every link in the files; and walks each kind in the SKILL.md registration to the route the general files select:

- Head ([kind-routes.log](kind-routes.log)): zero hits, zero action clauses, 594 links resolve. Hot-fix routes as a kind unit (Delivery Unit, Branch, Delivering Pull Request), as a draft readied by Review Before Merge, and to its board status through Settle Board Status; the other five kinds take the general routes. The script registry's hot-fix module selects a captured `[F04]` title, which the delivery fetch keeps; an initiative title selects no kind. No failures.
- Control at the base ([kind-routes-base.log](kind-routes-base.log)): 38 hits, four action clauses, four route failures, exit 1.

Hot-fix fixtures keep their outcomes: `test_kinds`, `test_hotfix`, `test_hotfix_readiness`, `test_deliver`, `test_dispatch`, `test_agent_review`, `test_board_queue`, `test_progress`, `test_documents` and `test_modes`, 355 tests pass ([focused.log](focused.log)).

## Full Checks

- Planner: 1110 tests, one opt-in live-link skip ([planner.log](planner.log)), including the installed document and model checks.
- Shared: 280 pass ([shared.log](shared.log)).
- Skill checker: 59 files, zero findings ([skill-check.log](skill-check.log)).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest test_kinds test_hotfix test_hotfix_readiness test_deliver test_dispatch test_agent_review test_board_queue test_progress test_documents test_modes -v   # skills/work-planner/test
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
python3 kind-routes.py skills/work-planner                        # checkout root, or a base export
git diff --check origin/i17/e02/workspace                         # checkout root
```

## Limits

board-queue.py and progress.py still name the hot-fix module; W33 moves them to the script registry. With one kind unit registered, the general wording selects the same items those scripts do.
