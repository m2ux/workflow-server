# Validation — I11:E16 W02

Checks run on branch `i11/e16/w02-an-unread-relation-named` at commit `0223e1336aaa051b96fcbd1ea444a302d05f4bc4`, from the unit worktree, under the workspace sandbox (`sbx`).

## T1

**Issue-end capture over an unreadable relation.** `IssueEnd::test_an_unread_relation_writes_nothing`. The stand-in tracker answers one issue, once one with links and once one whose field is empty, with a null node and an error naming it. `links-by-issue.py` prints `unreadable: issue o/r#<n>: <the tracker's error>` as its only output, exits 1 and writes no file. Result: pass.

## T2

**Pull-request-end capture over an unreadable relation.** `PullRequestEnd::test_an_unread_relation_writes_no_snapshot`. One pull request is answered with a null node and an error naming it. `links-by-pull-request.py` names it with the tracker's error, exits 1 and writes no snapshot. Result: pass.

## T3

**Each way a relation fails to arrive whole.** `Reader::test_each_relation_not_read_whole_is_named_and_holds_no_links`, `Reader::test_a_later_page_that_fails_drops_the_pages_read` and `Reader::test_an_error_reaching_every_subject_names_each` run `development.read` over hand-written responses:

- a null node; an error naming the node; an error beneath a node returned beside it;
- a null relation, null nodes, a null linked node, missing page information;
- a page reporting a further page with no cursor; a later page that fails after the first arrived;
- an error with no path, and one naming only the repository, which name every subject in the batch.

Each names the subject with its reason and holds no links for it, while the other subject keeps its links. Result: pass, 10 subtests.

## T4

**An empty relation read whole stays empty.** `Reader::test_an_empty_relation_read_whole_is_an_empty_link_set`, together with the existing capture tests in which issue 8 and pull request 951 hold no links. A whole, empty relation is an empty array and no subject is named. Result: pass.

## T5

**Skill test suite.** `python3 -m pytest skills/work-planner/test -q`: 491 passed, 1027 subtests passed. Result: pass.

## T6

**Skill file check.** `python3 skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings. Result: pass.
