# W42 Validation

## Candidate

- Unit: I17:E02:W42, AC66.
- Task base: `96241be5b` (origin/i17/e02/workspace after W37 #1692).
- Task head: `7f8867d30`, branch `i17/e02/w42-shared-check-rejects-kind`.
- Component: the ten files [w42.md](w42.md) declares. The shared checker gains the kind check, its test module the observing class, Work Planner's rules.json names the new kinds, Agent Review defers each kind's review rule to the kind, and the five general files the check reported at the base reach kinds through the registration.

## Diagnostics

| Diagnostic | Selection | Result |
| --- | --- | --- |
| `kind named in a general file` | Each `.md` and script under a skill's `artifacts`, `modes`, `protocols` and `scripts`, other than the registry and the kind's own files | Finding: the name of a registered kind or its module, in any case, its words joined by hyphen, underscore, space or nothing, singular or plural, standing as a word; a link target naming a kind file counts. Code spans and fenced blocks are literal examples and are not read. |
| `kind module imported outside the registry` | Each Python script of the same set | Finding: `import`, `from ... import` or `import_module` naming a kind module. |

Registered kinds come from the skill's `scripts/kinds.py` literal `KINDS` dict; each kind's files are its module and the links its entry in SKILL.md's opening registration lists. A skill without a registry registers none; a registry that is no literal dict of names is refused as an unreadable declaration. A kind file is exempt only for its own kind.

## Analysis

The check over the epic base reports 13 lines ([kind-check-base.log](kind-check-base.log)): placement.md (8), plan-change.md (1), pull-request-body.md (2), advance-mode.md (1) and sync-mode.md (1). No general script names a kind or imports `hotfix`; the registry is the only importer. Each line now selects the kind family through the registration. Agent Review restated the hot-fix review rule (`base_ref`, head and base-branch currency, every finding fixed) for every kind-tagged pull request; it now defers to the rule the kind's Review Before Merge states, which hotfix.md holds as its Review Rule field and which [hotfix.py](https://github.com/m2ux/workflow-server/blob/i17/e02/w42-shared-check-rejects-kind/skills/work-planner/scripts/hotfix.py) implements.

## Observing Tests

[test_check_skill_files](https://github.com/m2ux/workflow-server/blob/i17/e02/w42-shared-check-rejects-kind/skills/test/test_check_skill_files.py), 14 new tests ([focused.log](focused.log)):

- **AC66, negative.** KindSeparation: a general artifact, mode and protocol naming the kind (lowercase, plural, upper-case module spelling) each fail at their line; a link down to a kind file fails; a general script naming the kind fails; `import hotfix`, `from hotfix import` and `import_module("hotfix")` each fail as an import; a kind file naming another kind fails; the command exits 1 and prints the finding.
- **AC66, positive.** KindSeparation: the kind's artifact, body artifact and module, the registry and the SKILL.md registration pass; a script reaching kinds through `kinds` passes; code-span `F=Hot-fix` and `[F00]` and a fenced example pass; a word containing the name, a root guide and a test file pass; a skill without a registry registers none.
- **AC66, installed.** InstalledWorkPlannerModel: the installed skill registers hot-fix with hotfix.md, hotfix-body.md and hotfix.py, and its general files report no finding.

## Base Control

KindSeparation and InstalledWorkPlannerModel over a `git archive 96241be5b skills` export with the new test module copied in: 1 failure and 13 errors, every new test ([base-control.log](base-control.log)). The three existing installed-model tests pass.

## Full Checks

- Planner: 1179 tests, one opt-in live-link skip ([planner.log](planner.log)).
- Shared: 319 pass ([shared.log](shared.log)).
- Skill checker: 60 files, zero findings ([skill-check.log](skill-check.log)).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).
- Other skills: workflow-canon, gitnexus and server-in-the-loop report the same 68 findings as at W37, none of the new kinds; none has a registry.

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest -v test_check_skill_files.KindSeparation test_check_skill_files.InstalledWorkPlannerModel   # skills/test
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace                         # checkout root
```

## Change List

- Applied: the W42 work item declares six further files the change reaches (hotfix.md takes the Review Rule; placement.md, plan-change.md, pull-request-body.md, advance-mode.md and sync-mode.md held the 13 base findings). No row, criterion or dependency changed.
- Held: none. Arising issues: none.
