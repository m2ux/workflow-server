# Audit mode

Reviews existing definitions: enumerates the units, walks them over the surface, attributes each finding, verifies the Highs, and reports. Each confirmed finding goes to [Author](author-mode.md) to be fixed.

## Procedure

1. **Scope the surface.**
   - Write each list in [Scope](#scope) before the first unit. The walk consumes the lists.
   - A count is a summary of one. An existence claim holds over the list it was resolved against.
2. **Run the checks first.**
   - Prefer [Run guards on the delta](commands.md#run-guards-on-the-delta): it attributes this step by diffing a merge-base run against this tree.
   - Run the other [checks](commands.md#checks) the change calls for.
3. **Enumerate units.**
   - From each home's headings at the commit audited, per the [unit inventory](canon-map.md#unit-inventory).
   - Apply each entry as written.
4. **Walk.**  Walk the units per [Walk](#walk) and the [walk rules](walk-rules.md).
5. **Attribute.**  Give each finding its origin per [Attribution](#attribution).
6. **Verify Highs.**
   - Re-derive each High from the cited file and the entry alone. Withdraw what that re-derivation does not reproduce. Downgrade what supports only a lesser issue.
   - Spot-confirm Mediums: the construct exists and the class is right.
   - Only confirmed findings drive fixes.
7. **Report.**  Report in the layout [Which report](reporting.md#which-report) names.
8. **File a mechanised Detect.**
   - A Detect applied by pattern is a guard candidate. Name what it keys on and file it against the registry.
   - The threshold is the second occurrence: twice in one walk, or once in each of two consecutive walks. A `fix` finding counts.

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
  - `unread` paths in the latest findings register under `.engineering/artifacts/planning/`.
  - Re-derive the enumeration at this commit and inherit dispositions by path. A path absent from the tree leaves the worklist.
  - Reading starts at the residual, and the pass hands on a smaller one or records why not.
- **Second entry.**
  - Where a graph gives one activity two entry points, both are on the surface.
  - Read each outcome against the state that entry arrives in. Take entries from every graph that includes the activity.

Hunk lines are not the surface. A unit read from a hunk is not `walked`. A referencer stays on the surface when its bind site was not edited.

## Walk

- **Reach.**
  The whole of every change-surface file, and the other surface files so a pre-existing defect stays attributable.
- **Ledger.**
  - Each unit is `walked`, `not-applicable` (the unit's own wording), or `blocked` (what prevented the walk). Only `blocked` is missing coverage.
  - `walked` where the unit meets the change surface needs field-level evidence on each whole file in that intersection.
  - Evidence at the hit and an assertion over the rest is `blocked` for the remainder, with the path count.
- **Paths.**
  - Each worklist path is `read` (whole file) or `unread`.
  - A search names files; it does not dispose a directory.
  - Reconcile per [File coverage](reporting.md#file-coverage).

## Attribution

- **`diff`**
  A touched file, or a break that exists because an I/O contract on the change surface changed, including a stale bind or Apply in an untouched referencer or consumer.
- **`pre-existing`**
  The same construct and evidence at the base ref, independent of an I/O contract change on this surface.
- **`known`**  A prior pass accepted this key. Keep the row. Leave it out of the decision surface.
- **`fix`**
  Text written in this pass to close a finding. Closed within the pass by [Author](author-mode.md), never reported open.
