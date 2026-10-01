# Commands

Every command the skill runs, one spec per operation. The mode files name a spec by linking to it.

- **Where they run.**
  - `git` and `npm` commands run in the server checkout.
  - Searches of `corpus/` run in the corpus tree.
  - Edit guard commands run in the workspace root.
- **Branch point.**  Take the verdict at the branch point, and hold that checkout still for the run.
- **Exit codes.**
  - Read the check's own exit code. A pipe reports the filter's.
  - Write the output to a file, or read the code before filtering.
- **What a clean run leaves.**
  A clean structural run leaves what the canon requires of a change, and option coverage, still to show.
- **Example values.**
  Substitute the real ones: `origin/main` a base ref, `work-package` a target workflow id, `anti-patterns.md` a home's file.

## Checkouts

### Find the server checkout

Prints the root of the server checkout.

- From a cursor workspace (`.mcp.json`, `*.code-workspace`, no `package.json`), the checkout is the `project` folder that workspace names.

```bash
git rev-parse --show-toplevel
```

### Resolve ref

Prints a ref's full commit id, for citing it at full length.

```bash
git rev-parse origin/main
```

### Check the corpus tree

Lists the canon's prose homes, confirming the corpus tree holds them.

- The corpus tree is at `.worktrees/workflows` unless `WORKFLOWS_DIR` or `--root` names another.
- When the listing fails, say so, or run [Provision the corpus](#provision-the-corpus).

```bash
ls .worktrees/workflows/corpus/canon/resources/
```

### Provision the corpus

Adds the corpus worktree to a fresh clone, with `corpus/canon/resources/`.

```bash
npm run worktree:provision
```

## Corpus

### List units

Lists a home's `##` units, then its `###` entries, with their line numbers.

- The [unit inventory](canon-map.md#unit-inventory) names the level each home's unit sits at.

```bash
grep -n "^## " corpus/canon/resources/anti-patterns.md
grep -n "^### " corpus/canon/resources/anti-patterns.md
```

### List units for a construct

Prints every canon unit that fires on one construct id, with its file and line.

- The id is a construct a draft writes: a bare kind, a field path, `resource`, `readme`, or `*`.
- A unit is listed when it declares that id, a prefix of it, its bare kind, or `*`.
- Runs in the server checkout. `--root` names the corpus tree. The listing is printed and not stored.

```bash
npx tsx guards/list-fires-on.ts 'activity.steps[].when' --root <corpus>
```

### Fetch unit

Reads one section or entry of a home.

- **On disk.**
  [List units](#list-units) for the range, then Read it. For one entry, list the `###` lines and read that block.
- **In a workflow session.**  `get_resource` with `canon/<home>#<heading>`.

### Find consumers

Lists the references other workflows hold into the target.

- Resolve each hit's binds and Apply links from there.

```bash
grep -rn "work-package/" corpus/ --include=*.md --include=*.yaml
```

## Checks

### Run guard suite

Runs the guard registry, or a named subset.

- **Failures.**
  - Every failure is `Critical`. Exit 2 is `blocked`.
  - A schema-reading guard failing on the corpus branch may be reading a field the code branch has not merged. That clears on the code merge. Establish which before recording a corpus defect.
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

```bash
npm run check:all
npm run check:all -- --only <id>,<id>
```

### Run guards on the delta

Runs the guard suite at the merge-base and on this tree, and attributes each failure by the difference.

- Failures and exits read as in [Run guard suite](#run-guard-suite).

```bash
npm run check:delta -- --base origin/main
```

### Run option coverage

Checks whether a walk still reaches every option and exit.

- **When.**
  - `npm run test:ci` skips the coverage walk. Run it when the change touches a step list, exit, gate, or graph.
  - Baseline it once per branch, before editing.
- **Exemptions.**
  `walks/option-coverage.json` groups unreachable options under a stated reason. Match the reason, or record a finding.

```bash
npm run test:coverage-walk
```

## Edit guard

### Run the edit guard

Runs the corpus guards over an edited definition's corpus tree, and reports the failures its branch introduced, as the hook does after each edit.

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
- **Flags.**  `--server`, `--guards` and `--cache` replace the server checkout, guard runner and cache folder.

```bash
echo '{"tool_input": {"file_path": ".project/workflows/corpus/work-package/workflow.yaml"}}' | python3 skills/workflow-canon/scripts/edit_guard.py
```

### Run the edit guard tests

Drives the edit guard over seeded edits in temporary git repositories, with a stub guard runner in place of the server.

```bash
cd skills/workflow-canon && python3 -m unittest discover -s test
```
