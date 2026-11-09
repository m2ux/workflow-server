# W21 Validation

## Candidate

- Unit: I17:E02:W21, AC28.
- Task base: `01f84933a` (origin/i17/e02/workspace after W14 #1668).
- Task head: `13dde41b605b4b33bdfdcad2f4470d9de5d4b55d`, branch `i17/e02/w21-hot-fix-body-owns`.
- Component: `skills/work-planner/artifacts/hotfix-body.md`, a new Operations section.

## Change

- **Populate Hot-fix Body.** The hot-fix body population steps live in `artifacts/hotfix-body.md` under the name the registration's naming rule derives for Hot-fix Body's Populate Body. The operation reads Hot-fix Identity, Defect Evidence and Target, and provides Output Body for publication, as Populate Standalone Body does for the Issue Body contract, Body.
- **Hoist Mode's caller.** Its Hot-Fix Body branch applies the operation and restates none of its rules. Hoist Mode's other kind branches stay for W33.
- **Registration as a use.** `test_documents` requires each artifact operation to have two linked uses. Hoist Mode is the only general caller, and W33 replaces direct kind links with registration selection, so the check counts the SKILL.md registration as a use of each kind operation it names. A new test confirms the naming rule derives headings the kind artifacts hold.

## Caller Contract

[contract-reader.py](contract-reader.py) reads the registration, derives the operation name, and checks the operation's inputs, output, template and links, and every linked caller ([contract.log](contract.log)). At the epic base it fails: hotfix-body.md has no Operations section ([contract-base.log](contract-base.log)).

## Checks

- Focused: `test_documents` (14), `test_checkouts` (10), `test_modes` (4), `test_command_contracts` (14), `test_format` (110, the hot-fix fixtures among them), `test_hotfix` (20), `test_templates` (6), `test_readme` (13): 191 pass ([focused.log](focused.log)).
- Planner: 1060 tests, one opt-in live-link skip ([planner.log](planner.log)), including the installed document and model checks.
- Shared: 280 pass ([shared.log](shared.log)).
- Skill checker: 59 files, zero findings ([skill-check.log](skill-check.log)).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest -v test_documents test_checkouts test_modes test_command_contracts test_format test_hotfix test_templates test_readme   # skills/work-planner/test
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
python3 contract-reader.py skills/work-planner                    # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```

## Finding

`test_templates` fails when discovered alone: it imports `format` without putting the scripts folder on its path. Outside this change, raised as [#1681](https://github.com/m2ux/workflow-server/issues/1681).
