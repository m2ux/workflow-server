# W21 Validation

## Candidate

- Unit: I17:E02:W21, AC28.
- Task base: `01f84933a` (origin/i17/e02/workspace after W14 #1668), brought current with `49bbafbd7` (W18 #1669, W26 #1674, W28 #1678, W20 #1680).
- Task head: `e307cf47ad1b2207e54d47bfa5ceab00d72498b6`, branch `i17/e02/w21-hot-fix-body-owns`.
- Component: `skills/work-planner/artifacts/hotfix-body.md`, a new Operations section.

## Change

- **Populate Hot-fix Body.** The hot-fix body population steps live in `artifacts/hotfix-body.md` under the name the registration's naming rule derives for Hot-fix Body's Populate Body. The operation reads Hot-fix Identity, Defect Evidence and Target, and provides Output Body for publication, filling the Issue Body contract, Body, as Populate Standalone Body does.
- **Registration link.** SKILL.md links Hot-fix Body's Populate Body to the operation, the form W20 gave the Hot-fix operations.
- **Hoist Mode's call.** Its Hot-Fix Body branch applies the operation with its number, theme label, target and defect evidence, and restates none of its rules. Hoist Mode's other kind branches stay for W33.
- **Kind operations test.** `test_kind_operations` gains a Hot-fix Body class: the registered link, the operation's fields and result, the caller's inputs, and no body step inline in Hoist Mode.

## Caller Contract

- [contract-reader.py](contract-reader.py) reads the registration, derives the operation name, and checks the operation's inputs, output, template and links, and its one general caller ([contract.log](contract.log)). At the epic base it fails: hotfix-body.md has no Operations section ([contract-base.log](contract-base.log)).
- `test_kind_operations` `HotfixBodyInterface`, four tests, pass in [focused.log](focused.log).

## Checks

- Focused: `test_kind_operations` (15), `test_documents` (13), `test_checkouts` (10), `test_modes` (4), `test_command_contracts` (14), `test_format` (110, the hot-fix fixtures among them), `test_hotfix` (20), `test_templates` (6), `test_readme` (14): 212 pass, one opt-in skip ([focused.log](focused.log)).
- Planner: 1091 tests, one opt-in live-link skip ([planner.log](planner.log)), including the installed document and model checks.
- Shared: 280 pass ([shared.log](shared.log)).
- Skill checker: 59 files, zero findings ([skill-check.log](skill-check.log)).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest -v test_kind_operations test_documents test_checkouts test_modes test_command_contracts test_format test_hotfix test_templates test_readme   # skills/work-planner/test
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
python3 contract-reader.py skills/work-planner                    # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```

## Finding

`test_templates` fails when discovered alone: it imports `format` without putting the scripts folder on its path. Outside this change, raised as [#1681](https://github.com/m2ux/workflow-server/issues/1681).

## Current Base

The epic base moved to `83f89b7fd` (W31 #1675, W22 #1679, W24 #1683, W23 #1677), merged into the branch at `b575f56b4476ba3a5eab3b60d7a83057135eccef`, the merged head. There the planner suite runs 1099 tests with one opt-in skip ([planner-current.log](planner-current.log)); the shared suite (280), skill checker (zero findings), contract reader (no failures) and whitespace check (zero findings) pass.
