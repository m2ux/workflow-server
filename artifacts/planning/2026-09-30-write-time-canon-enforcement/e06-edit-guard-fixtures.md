# Edit-guard fixtures

Skill `i09/workspace` at `e50ec767`.

`python3 -m unittest discover -s test`, run from `skills/workflow-canon`, reports 36 tests, OK.

The suite is [test_edit_guard.py](https://github.com/m2ux/workflow-server/blob/e50ec76770ec62f520cca198ccb094750cd5151f/skills/workflow-canon/test/test_edit_guard.py). It drives the hook with a stub guard runner and asserts:

- an introduced failure exits 2 and names the guard
- a failure present at the branch point exits 0
- a failure present on an integration branch exits 0 for a branch cut from it
- an unmeasured run exits 2 and does not pass
- a non-definition path runs no guard
