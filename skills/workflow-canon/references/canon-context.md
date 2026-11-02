# Canon Context

Author and Audit share the following context; Review follows the design sources selected for its integration.

## Prerequisites

Read the [command conventions](command-conventions.md#common) before the first command spec. Read the sections below as the task needs them.

## Terms

- **Unit**  One criterion at the level the [canon inventory](canon-map.md#unit-inventory) specifies.
- **Entry**
  An anti-pattern unit: its Detect finds the defect, its Do not flag excuses a look-alike, and its Fix closes it.
- **Walk**
  Applying each unit to the surface files of the kinds its [fires-on line](canon-map.md#file-kinds) names, and recording its status.
- **Change surface**  Touched files and their contract closure, resolved through [Scope](#scope).

## Criteria

Use the [canon homes](#homes) at the captured revisions. Read the complete [canon map](canon-map.md) before the first unit for its enumeration and prior-judgment guidance. Fetch each required unit through [Fetch Unit](audit-mode.md#fetch-unit).

Follow covering entries where their Detect reaches, and the owning principle for spellings beyond that Detect. Every walk follows the complete [walk rules](walk-rules.md).

## Scope

Resolve the requested definitions to files, touched paths, changed I/O contracts, their reference closure, consumers and relevant siblings using [Definition Scope](definition-scope.md#scope). Record the base and full revision identities through [Resolve Ref](#resolve-ref). A new definition includes the files that bind it into the project.

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

Locate unresolved roots through [Find the Server Checkout](#find-the-server-checkout) and [Check the Corpus Tree](#check-the-corpus-tree). The engine's instructions own paired checks, worktree selection and binding-fidelity triage. Node, npm and installed engine dependencies supply the guards; a live workflow session may supply individual sections through its resource tool.

## Checks

Select checks from the task's declared check contract and the project's requirements. [Canon Check Conventions](#canon-check-conventions) govern every canon check in this file.

- **A checker the task supplies for a bounded scope.**
  Read its interface and use [Run Project Check](command-conventions.md#run-project-check); report the scope its observations establish.
- **The project's guard suite.**
  Use [Run Guards on the Delta](#run-guards-on-the-delta) with an identified base and candidate under equivalent conditions, or [Run Guard Suite](#run-guard-suite) for a single candidate or draft.
- **An established step-list, exit, gate or graph change.**
  Also requires [Run Option Coverage](#run-option-coverage), baselined before editing.
- **An established shared-construct change.**
  Select broader consumer coverage through [Workflows Coverage](coverage.md#workflows-coverage).

## Edit Hook

The registered hook uses Python 3.10+ and the workspace's `.project/main` checkout with installed `tsx`. Its integration refs are the corpus tree's latest fetched `origin/workflows` and `origin/iNN/workflows`; it measures against their nearest merge-base. Read [Run the Edit Guard](#run-the-edit-guard) when handling its result or invoking it explicitly. The hook's operational contract also applies to a host without automatic registration.

When the hook returns a failure, close the introduced defect or state why the result is unmeasured before the next edit.

## Canon Check Conventions

- **Branch point.**
  Hold the baseline checkout and paired engine revision fixed for each comparison. Refresh the selected integration refs before deriving the baseline.
- **Exit status.**
  Capture the check's own exit status before filtering output; a pipe reports the filter's status.
- **Guard outcomes.**
  Capture measured findings separately from an unmeasured result, which exits 2. A schema-reading failure may reflect an engine/corpus pairing mismatch; establish the pairing before attributing a definition defect.
- **Option coverage.**
  The full CI test suite skips the coverage walk. Inspect the recorded exceptions against the reason for each unreachable option.

### Guard Obligations

- **Binding fidelity.**
  - It exits `OK` while carrying triaged debt, stamped with the corpus commit.
  - On drift, a clean result means the verdicts are old: record `blocked`, and re-affirm entries whose cited file changed since the stamp.
- **Suppressions.**
  - A suppression matches a normalised key. Its reason and its line sit outside the comparison, and the key drops the line number, so one line can earn two entries.
  - Count the findings at the site before calling an entry redundant.
- **New guards.**
  - Prove a new guard against the corpus at the commit before the fix it was written for.
  - A carve-out that follows from the entry belongs in the guard's condition.
  - Take a file's kind from its declaration, and name in the check the kinds it admits.
- **Definition changes.**
  - A definition change owes the code branch its pointer, walk baseline, stamp, and every triage entry it settled, in the order `AGENTS.md` states.
  - The suppression of a binding finding it closed is the entry that goes stale on that commit.

## Commands

### Resolve Ref

Read the full commit identity for a captured ref.

```bash
git rev-parse <ref>
```

### Run Corpus Checks

Validate the corpus roster, protocol and recorded paths with the paired engine.

```bash
bash <corpus>/walks/check-roster.sh
python3 <corpus>/walks/check-walk-protocol.py
python3 <corpus>/walks/check-walk-protocol.py --self-test
WORKFLOWS_DIR=<corpus> npx vitest run tests/e2e/snapshot.test.ts
WORKFLOWS_DIR=<corpus> npx vitest run tests/e2e/all-workflows-walk.test.ts
```

### Run Option Coverage

Walk the current corpus roster and compare checkpoint reachability with its exceptions.

- Read the roster first and supply its walked IDs as a literal comma-separated value.
- An omitted scope walks the full roster. [Workflows Coverage](coverage.md#workflows-coverage) determines when a literal `WF_COVERAGE_SCOPE` narrows the walk.

```bash
jq -r '.walked | join(",")' <corpus>/walks/roster.json
WORKFLOWS_DIR=<corpus> WF_WALKED=<walked-ids> npm run test:coverage-walk
```

### Find the Server Checkout

Prints the root of the server checkout.

- Read the workspace's component configuration when the current tree has no engine package manifest. Resolve the engine path it names and confirm that checkout's root.

```bash
git -C <engine> rev-parse --show-toplevel
```

### Check the Corpus Tree

Lists the canon's prose homes, confirming the corpus tree holds them.

- Resolve the actual corpus root from the workspace or engine configuration, including any explicit `WORKFLOWS_DIR` or `--root` selection.
- When the listing fails, say so, or run [Provision the corpus](#provision-the-corpus).

```bash
ls <corpus>/corpus/canon/resources/
```

### Provision the Corpus

Adds the corpus worktree to a fresh clone, with `corpus/canon/resources/`.

```bash
npm run worktree:provision
```

### List Units

Lists a home's `##` units, then its `###` entries, with their line numbers.

- The [unit inventory](canon-map.md#unit-inventory) names the level each home's unit sits at.
- Run from the corpus root.

```bash
rg -n "^## " corpus/canon/resources/anti-patterns.md
rg -n "^### " corpus/canon/resources/anti-patterns.md
```

### Find Consumers

Lists the references other workflows hold into the target.

- Run from the corpus root.
- Resolve each hit's binds and Apply links from there.

```bash
rg -n "work-package/" corpus/ -g "*.md" -g "*.yaml"
```

### Run Guard Suite

Runs the guard registry, or a named subset.

```bash
WORKFLOWS_DIR=<corpus> npm run check:all
WORKFLOWS_DIR=<corpus> npm run check:all -- --only <id>,<id>
```

### Run Guards on the Delta

Runs the guard suite at the merge-base and on this tree, and attributes each failure by the difference.

```bash
WORKFLOWS_DIR=<corpus> npm run check:delta -- --base <base-ref>
```

### Run the Edit Guard

Runs the corpus guards over an edited definition's corpus tree, and reports the failures its branch introduced, as the hook does after each edit.

- Run from the workspace root.

- **Input.**
  - The hook's JSON on stdin. `tool_input.file_path` names the edited file, and a relative path resolves against `cwd`.
  - Only a corpus definition file runs a guard: a `workflow.yaml`, a README, or a file under `activities/`, `routines/`, `techniques/` or `resources/`, beneath `corpus/` of a corpus tree.
- **Measure.**
  - The guards run in `.project/main`, with `--root` naming the file's corpus tree.
  - A failing run is compared with a run at the branch point: the nearest merge-base with `origin/workflows` and each `origin/iNN/workflows`.
  - The branch point's run is cached in `.project/main/.guard-cache`, by branch point and server HEAD. A server checkout with uncommitted changes caches nothing.
- **Exits.**
  - 0 when no guard runs, every guard is clean, or every failure is present at the branch point.
  - 2 with the introduced failures on stderr, or with the reason the run cannot measure.
- **Flags.**
  `--server`, `--guards` and `--cache` replace the server checkout, guard runner and cache folder.

```bash
echo '{"tool_input": {"file_path": ".project/workflows/corpus/work-package/workflow.yaml"}}' | python3 skills/workflow-canon/scripts/edit_guard.py
```
