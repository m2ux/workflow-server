# Canon Context

Author and Audit share the following context; Review follows the design sources selected for its integration.

## Prerequisites

Read the [command conventions](commands.md#conventions) before the first command spec. Read the sections below as the task needs them.

## Terms

- **Unit**  One criterion at the level the [canon inventory](canon-map.md#unit-inventory) specifies.
- **Entry**
  An anti-pattern unit: its Detect finds the defect, its Do not flag excuses a look-alike, and its Fix closes it.
- **Walk**  Applying each unit to every file on the surface and recording its status.
- **Change surface**  Touched files and their contract closure, resolved through [Scope](#scope).

## Criteria

Use the [canon homes](#homes) at the captured revisions. Read the complete [canon map](canon-map.md) before the first unit for its enumeration and prior-judgment guidance. Fetch each required unit through [Fetch Unit](commands.md#fetch-unit).

Follow covering entries where their Detect reaches, and the owning principle for spellings beyond that Detect. Every walk follows the complete [walk rules](walk-rules.md).

## Scope

Resolve the requested definitions to files, touched paths, changed I/O contracts, their reference closure, consumers and relevant siblings using [Definition Scope](definition-scope.md#scope). Record the base and full revision identities through [Resolve Ref](commands.md#resolve-ref). A new definition includes the files that bind it into the project.

Resolve any prior residual from the shared [planning record](planning.md) by current path before continuing it.

## Homes

Read homes on disk at the captured revisions. The links identify paths from the corpus or engine root; they do not substitute the latest web copy for the reviewed tree.

| Home | Authority |
| --- | --- |
| Design principles | [Design principles](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/design-principles.md) |
| Anti-patterns | [Anti-pattern catalog](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/anti-patterns.md) |
| Convention conformance | [Convention conformance](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/convention-conformance.md) |
| Guards | [Guard registry](https://github.com/m2ux/workflow-server/blob/main/guards/guards.ts) |
| Schema fields | [Schemas](https://github.com/m2ux/workflow-server/blob/main/docs/schemas.md) |

Locate unresolved roots through [Find the Server Checkout](commands.md#find-the-server-checkout) and [Check the Corpus Tree](commands.md#check-the-corpus-tree). The engine's instructions own paired checks, worktree selection and binding-fidelity triage. Node, npm and installed engine dependencies supply the guards; a live workflow session may supply individual sections through its resource tool.

## Checks

Read [Canon Check Conventions](commands.md#canon-check-conventions) before a selected canon check. A full audit prefers [Run Guards on the Delta](commands.md#run-guards-on-the-delta); draft and post-write checks use [Run Guard Suite](commands.md#run-guard-suite). A step-list, exit, gate or graph change also requires [Run Option Coverage](commands.md#run-option-coverage), baselined before editing. Select broader consumer coverage from [Workflows Coverage](coverage.md#workflows-coverage) when shared constructs are affected.

### Edit Hook

The registered hook uses Python 3.10+ and the workspace's `.project/main` checkout with installed `tsx`. Its integration refs are the corpus tree's latest fetched `origin/workflows` and `origin/iNN/workflows`; it measures against their nearest merge-base. Read [Run the Edit Guard](commands.md#run-the-edit-guard) when handling its result or invoking it explicitly. The hook's operational contract also applies to a host without automatic registration.

When the hook returns a failure, close the introduced defect or state why the result is unmeasured before the next edit.
