# unit I17:E02:W21: unlaned, coverage AC28

> Delivery · Created 2026-11-09

One separation fix row from the E02 component refinement. The declared one-file component and observing tests are in the work item.

| File | Purpose |
| --- | --- |
| [w21.md](w21.md) | Component, scope, implementation and observing validation for W21. |
| [validation.md](validation.md) | Change, caller contract and full checks at the task head. |
| [contract-reader.py](contract-reader.py) | Checks the operation against the registration, its contract and its callers. |
| [contract.log](contract.log), [contract-base.log](contract-base.log) | Reader output at the task head and at the epic base. |
| [focused.log](focused.log) | Kind operations, document, checkout, modes, command-contract, format, hot-fix, template and readme tests. |
| [planner.log](planner.log) | Full Work Planner suite. |
| [shared.log](shared.log) | Shared skills suite. |
| [skill-check.log](skill-check.log) | Skill checker. |
| [whitespace.log](whitespace.log) | Whitespace check; empty when clean. |
| [planner-current.log](planner-current.log) | Full Work Planner suite after merging the current epic base. |

## Links

- [Epic](https://github.com/m2ux/workflow-server/issues/1615)
- [Component refinement](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows)
- [Ownership audit](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-06-1615-i17-e02-w02-audit-ownership-fields-and)

## Changes

- Folded work, W21: Hoist Mode applies Populate Hot-fix Body with its inputs, and the SKILL.md registration links the operation.
- Arising issue [#1681](https://github.com/m2ux/workflow-server/issues/1681), standalone: the template test module runs alone.
