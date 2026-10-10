# Canon Context

Author and Audit share the following context; Review follows the design sources selected for its integration.

## Prerequisites

Read the [command conventions](commands.md#conventions) before the first command spec, resolve the active mode's [project configuration](variants.md#selection), then read the sections below as the task needs them.

## Terms

- **Unit**  One criterion at the level the selected project's inventory specifies.
- **Entry**
  An anti-pattern unit: its Detect finds the defect, its Do not flag excuses a look-alike, and its Fix closes it.
- **Walk**  Applying each unit to every file on the surface and recording its status.
- **Change surface**  Touched files and their contract closure, resolved through [Scope](#scope).

## Criteria

Use the selected configuration's canon homes and inventory at the captured revisions. Read its enumeration and prior-judgment guidance before fetching the first unit, including any required whole guide. For an unconfigured project, locate these authorities in its own documentation; absent criteria are a gap to resolve, not a reason to borrow another project's canon.

Follow covering entries where their Detect reaches, and the owning principle for spellings beyond that Detect. Every walk follows the complete [walk rules](walk-rules.md).

## Scope

Resolve the requested definitions to files, touched paths, changed I/O contracts, their reference closure, consumers and relevant siblings using the selected project's scope guide. Record the base and full revision identities through [Resolve Ref](commands.md#resolve-ref). A new definition includes the files that bind it into the project.

The change surface is the union of touched files and contract closure. Read each member whole when walking it; diff hunks establish membership. Resolve any prior residual from the shared [planning record](planning.md) by current path before continuing it.

## Checks

Select the active configuration's checks for the changed constructs before reading their command specs. Record the actual tool checkout, input revisions and exit status. A clean structural result leaves the canon walk and any required execution coverage to establish.

When a registered edit hook returns a failure, close the introduced defect or state why the result is unmeasured before the next edit. The selected configuration owns the hook's runtime and branch-point settings.
