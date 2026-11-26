# F25 Validation

Tested revision: `a5da90f173bed0d85c734beee56dce31c7b4a4a3` on `f25-change-spread`, cut from `workspace` at `5583d7900c4e4854930ca087a9b32e1119fb70d0`. Every check runs on local Git repositories built in temporary directories, under the workspace sandbox with no network.

## T1

`test_readme` checks the catalogue and coverage tables as mappings: each module has one catalogue row in the table its script imports place it in, each row's description is its docstring, each script and document has a coverage row naming exactly the modules that reach it, and every link resolves. The count checks are gone; the README's coverage cells carry module links alone and its prose states that a suite run reports counts. [Focused results](focused.txt).

Result: ✓.

## T2

Search of `skills/work-planner` outside `test/` for "at the revision" and "at the evaluated revision": two lines, neither a caller restating what an applied operation reads.

- `artifacts/initiative-issue-body.md:114`, Fetch Source's own summary of the pinned revision its caller supplies.
- `artifacts/acceptance-criteria.md:16`, the readiness rule for evidence at the caller-chosen revision the instruments run at.

The wider search the [work item](f25.md#ac2-search) lists found the restatements it removes. `test_documents.DeclarationHome` holds the result: every mention of `config/branches` or `config/required-criteria.json` names the tooling branch, or is the Branches example, and names no remote revision, `--revision` or epic base; only Tooling Branch names `origin/workspace`; List Long-Lived Branches and Check Body Format take no `--revision`. [Focused results](focused.txt).

Result: ✓.

## T3

`format.py` over an epic base without the declaration, in test repositories. [Focused results](focused.txt).

- `CheckFormat.test_an_epic_base_without_the_declaration_is_held_to_the_tooling_branch`: the checkout sits on an orphan `i01/e00/workflows` with no `config/required-criteria.json`; `origin/workspace` declares the canon audit. The run names the tooling commit as source and reports the lacking criterion, with no unevaluable line.
- `DeclarationAtToolingBranch`: the checked-out branch, working files, a linked worktree and a local `workspace` branch choose nothing; no tooling branch, a malformed or field-lacking declaration is unevaluable; a missing, empty or empty-array declaration requires nothing.
- `test_command_contracts` runs Check Body Format as documented, with `--project` alone, from an epic base whose parent commit lacks the declaration the tooling branch holds.
- Live read: `format.py --project` over the workflow-server checkout, for an epic whose pull request changes `corpus/` on `workflows`, names `config/required-criteria.json at 5583d7900` (`origin/workspace`) and reports the missing canon audit criterion. `origin/workflows` carries no declaration, so the per-base read this replaces found none.

Result: ✓.

## T4

Full suite, `python3 -m unittest discover -s test` from `skills/work-planner`: 1215 tests, OK, 1 skipped (the optional live Development-link test). [Suite results](suite.txt). `skills/scripts/check_skill_files.py work-planner`: 65 files checked, 0 findings. `skills/test`: 319 tests, OK. The workspace branch has no CI workflow; these are the checks it carries for skills.

Result: ✓.

## Spread

F24 touched 16 files. Under this design the same change leaves seven of them alone: `test/README.md` (no counts), `epic.md`, `delivery-plan.md` and `sync-mode.md` (they link Branches or react to the reader's result), and `align-mode.md`, `deliver-mode.md` and `issue-closure.md` (no caller names the revision). Moving the tooling branch now edits Tooling Branch, `TOOLING_BRANCH` in `format.py`, and their tests.

## Limits

No live epic sync or body check against prosiform or midnight-agent-eng was run; neither checkout carries an `origin/workspace` on this host.
