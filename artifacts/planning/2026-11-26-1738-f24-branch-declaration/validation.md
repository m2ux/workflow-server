# F24 Validation

Tested revisions: `89ed4c4cb9e3b9802de7f2d6cd47a6a5d7739dbc`, and the reviewed head `667631fc15302f9f990e4707def5bc5ad1e4ca84`, which adds one Sync Epic line and reruns T4 with the same result, on `f24-branch-declaration`, cut from `workspace` at `9a5f10ee96a38ee70cf52239067b2b17cf58ae64`. Every check runs on local Git repositories built in temporary directories, under the workspace sandbox with no network.

## T1

Epic sync over epic bases that carry no `config/branches`, or a statement disagreeing with the tooling branch. [Focused results](focused.txt).

- `ToolingDeclaration`: `main` and the epic base `i01/e00/workflows` carry no statement; `origin/workspace` states docker, main and workflows. The sync reports `draft: i01/e00/workflows` and one `source:` line at the tooling commit, with no `unevaluable:` or `not checked:` line. A complete epic reads `closable: no (unmerged i01/e00/workflows)`. A base stating `docs` chooses nothing. A sync naming no base still reads the names and reports the draft base unread.
- `SeveralEpicBases`: two bases stating different names, or one dropping the statement, leave one source line at the tooling commit and every check made.

Result: ✓.

## T2

`sync.py --names`, base preparation's documented listing and the delivery survey over a repository declaring branches on the tooling branch alone. [Focused results](focused.txt).

- `LongLivedNames`: names and source read at `origin/workspace`; every worktree, dirty or divergent, reads alike; a local `workspace` branch chooses nothing; no tooling branch, an absent, empty, directory or non-text statement is unevaluable; `--names` refuses `--revision` and needs `--project`.
- `UnavailableDeclaration`: a tooling branch without the statement, or none at all, names its source and every check not made; a readable one over a base without the file leaves no check unmade; `--revision` needs `--project`.
- `test_command_contracts` runs List Long-Lived Branches, as Prepare Delivery Bases invokes it, over a repository whose `main` carries no file: it prints `main`, `workspace` with the tooling commit as source.
- `test_deliver` checks hot-fix targets against the tooling branch alone: `main` is a unit, `feature/x` undeclared.
- Live read: `sync.py --names --project` over the workflow-server checkout prints docker, main, workflows and workspace, sourced at `9a5f10ee9`, the `origin/workspace` head.

Result: ✓.

## T3

`test_documents.BranchDeclarationHome` searches every Markdown file of `skills/work-planner` outside `test/` for `config/branches`: each mention names the tooling branch or is the Branches example, none names `--revision` or an epic base, the only remote revision named is `origin/workspace`, and List Long-Lived Branches takes no `--revision`. [Focused results](focused.txt).

Result: ✓.

## T4

Full suite, `python3 -m unittest discover -s test` from `skills/work-planner`: 1210 tests, OK, 1 skipped (the optional live Development-link test). [Suite results](suite.txt). `skills/scripts/check_skill_files.py work-planner`: 65 files checked, 0 findings. `skills/test`: 319 tests, OK. The workspace branch has no CI workflow; these are the checks it carries for skills.

Result: ✓.

## Limits

No live epic sync against prosiform was run; its checkout is not on this host.
