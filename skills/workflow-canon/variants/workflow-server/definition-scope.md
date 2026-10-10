# Definition Scope

The definition files, contracts and references that authoring and canon audits resolve on this project.

## Scope

- **Base ref.**  The ref the change is measured against.
- **Surface files.**
  `workflow.yaml`, `activities/`, `techniques/`, `resources/`, READMEs of the target.
- **Touched.**
  Definition paths whose bytes differ from the base ref, each the whole file. Hunks discover membership.
- **I/O contract.**
  - Technique `## Inputs` / `## Outputs`, including nested component and artifact declarations.
  - Activity inputs, outputs, and step binds that name those ids.
  - Renames, additions, removals, optionality flips, and type or shape changes.
- **Reference.**
  - `techniques[]`, step `technique` / `technique.name`, Protocol `Apply` / `::` / a markdown link to an op, or a resource or README cite that resolves to the op file.
  - Sweep the workflows tree. Resolve each to a file path.
- **Closure.**
  Every activity or technique that references a touched file whose I/O contract changed, in this workflow and others.
- **Change surface.**  Touched ∪ closure. The header reports the two subsets separately.
- **Consumers.**
  - References other workflows hold into the target. Always computed.
  - A consumer joins the change surface when the file it names is on it.
  - Start from [Find consumers](commands.md#find-consumers), then resolve binds and Apply links.
- **Reference workflows.**  Siblings of similar type, as convention conformance requires.
- **Prior residual.**
  - `unread` paths in the latest findings register in the shared [planning record](../../references/planning.md).
  - Re-derive the enumeration at this commit and inherit dispositions by path. A path absent from the tree leaves the worklist.
  - Reading starts at the residual. The walk follows [audit rules](../../references/audit-mode.md#rules). Paths a stop leaves unread are the next residual.
- **Second entry.**
  - Where a graph gives one activity two entry points, both are on the surface.
  - Read each outcome against the state that entry arrives in. Take entries from every graph that includes the activity.

Hunk lines are not the surface. A unit read from a hunk is not `walked`. A referencer stays on the surface when its bind site was not edited.
