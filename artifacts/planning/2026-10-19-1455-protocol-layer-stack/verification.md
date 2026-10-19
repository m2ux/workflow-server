# Protocol Layer Stack — Verification

Every check below ran against `skill/protocol-layer-stack` at [`15eaa92e`](https://github.com/m2ux/workflow-server/commit/15eaa92e43a9a3c4cb58bbb9d30b915c23493a24), which carries `workspace` merged into the branch, under `scripts/sbx` in the branch's own linked worktree. Each section is one Test Plan row of [#1455](https://github.com/m2ux/workflow-server/pull/1455).

## Baselines

Two populations fail before this branch and are unchanged by it, so each check below reads against them rather than against zero.

- **gitnexus reports six findings on `workspace`.**
  Five command specifications in `gitnexus/gitnexus-cli/SKILL.md` and one over-wide bold lead. The same six, and only those six, appear after the branch.
- **The Workflow Canon suite fails 38 of 76 on `workspace`.**
  Every failure asserts `CANON_TEST_ENGINE must name an engine with its installed yaml package`, an unset environment variable on this host. The same 38 fail after the branch. That suite covers audit contracts and reaches none of the files this branch changes; the shared check in T3 is what covers them.

## T1 Shared Skill-File Checks

`python3 -m unittest test_check_skill_files` from `skills/test`.

```text
Ran 76 tests in 0.025s

OK
```

Seventy-three of the tests predate the branch. Three are new and cover the contract mechanism itself: the same structure applied over the tree, the skill and one directory; an entry stating no sections; and a structure file that does not parse.

## T2 Work Planner Suite

`python3 -m unittest discover` from `skills/work-planner/test`, covering its documents, scripts and templates.

```text
Ran 332 tests in 6.771s

OK
```

The document tests include the layer walk this branch adds, which refuses a link from any of `modes/`, `protocols/` and `artifacts/` to a layer above its own.

## T3 Shared Check Over Both Skills

`python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon`.

```text
77 files checked, 0 findings
```

This is the check that covers the moved prose: Work Planner's directory sections and Workflow Canon's mode-file shape, each now declared by its own skill.

## T4 One Contract, Three Invocation Forms

The contract is read from the nearest `structure.json` at or above each file, so the form the caller uses does not change the verdict.

| Form | Command argument | Result |
| --- | --- | --- |
| The tree | `skills` | 85 files checked, 6 findings |
| Two skills | `skills/work-planner skills/workflow-canon` | 77 files checked, 0 findings |
| One directory | `skills/work-planner/modes` | 10 files checked, 0 findings |

The six findings over the tree are the gitnexus baseline above. Before this check was corrected, the tree form reported 101 findings and the single-directory form 11, both because the contract was read only at the exact root named.

## T5 Contract Parity With the Previous Check

The check as it stood on `workspace` at `27ea9873`, run against the branch's tree:

```text
77 files checked, 0 findings
```

That version carries the directory contracts hard-coded. It agrees with the new one over the whole corpus, so the `structure.json` entries reproduce what the shared check previously knew by directory name.
