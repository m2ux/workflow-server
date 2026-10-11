# Commands

## Conventions

Each operation has one spec. Commands use example values that the caller replaces with the repository, revisions and paths under work.

- **Locations.**
  `<workspace>` holds the skills and engineering history; `<engine>` is the engine checkout; `<corpus>` is the definition-branch root; `<docker-tree>` is the packaging checkout; `<tool-checkout>` owns a selected check; `<record>` is the shared planning record; `<scratch>` is disposable storage. Use absolute paths for cross-tree inputs.
- **Execution.**
  Follow the current host's shell, sandbox and permission instructions. Run Git operations in the tree under work, engine checks in the engine checkout, and skill checks in the workspace. Corpus searches run in the corpus root. Each operation identifies exceptions and separately versioned inputs.
- **Remote access.**
  Use the authentication and execution permissions required by the host. GitHub operations use its REST API through the GitHub CLI.
- **Evidence.**
  Save outputs under the planning record with their command, working directory, input revisions and exit status. Preserve failed and skipped observations.
- **Substitution.**
  Replace angle-bracket placeholders and `{owner}/{repo}` before execution. `950` is an example PR or issue. Derive remote, target and revision-branch names from the repository under work, and check installed command interfaces at the captured revision.
- **Authored text.**
  Commit messages and PR bodies go through files.

## Revisions

### Resolve Ref

Read the full commit identity for a captured ref.

```bash
git rev-parse <ref>
```

## Review Inputs

### Fetch Pull Request

Save a PR, its changed files and its commits through REST.

```bash
gh api repos/{owner}/{repo}/pulls/950 > <record>/pr-950.json
gh api --paginate repos/{owner}/{repo}/pulls/950/files > <record>/pr-950-files.json
gh api --paginate repos/{owner}/{repo}/pulls/950/commits > <record>/pr-950-commits.json
```

### Fetch Requirements

Save an issue whose requirements the integration claims to deliver.

```bash
gh api repos/{owner}/{repo}/issues/950 > <record>/issue-950.json
```

### Fetch Branches

Refresh each named remote branch for revision capture.

```bash
git fetch <remote> <branch>
git rev-parse <remote>/<branch>
```

### Compare Revisions

Inspect the incoming change and the relationship to its current target.

- Use full captured SHAs after resolving branch names.
- A three-dot diff describes the incoming change; the proposed integration result supplies the combined behavior.

```bash
git merge-base <target-sha> <head-sha>
git diff --stat <target-sha>...<head-sha>
git diff <target-sha>...<head-sha>
git log --oneline <target-sha>..<head-sha>
```

### Create Review Worktree

Create a detached tree at a captured revision without moving an existing checkout.

```bash
git worktree add --detach <review-worktree> <sha>
```

### Prepare Integration Result

Combine a head with its current target inside a disposable review worktree.

- Start the worktree at the target SHA, using [Create Review Worktree](#create-review-worktree).
- A clean merge's tree SHA identifies the candidate alongside both parent SHAs. A conflict is evidence; preserve its details and abort without resolving it.
- Use a separate worktree per proposed result. Independently versioned products retain their own histories.

```bash
git -C <review-worktree> merge --no-commit --no-ff <head-sha>
git -C <review-worktree> write-tree
```

### Abort Review Merge

Return a disposable candidate to its captured target after recording a merge conflict.

```bash
git -C <review-worktree> merge --abort
```

### Read Captured File

Read a complete document, manifest or CI definition from a captured branch revision.

```bash
git show <sha>:<repo-relative-path>
```

### Read Captured Section

Read an anchored section from a captured branch revision.

- Locate the heading in the outline, then substitute the start and end lines required by the [linked-section rule](../SKILL.md#rules). Markdown code fences do not create document headings.

```bash
git show <sha>:<repo-relative-path> | rg -n '^#{1,6} '
git show <sha>:<repo-relative-path> | sed -n '<start-line>,<end-line>p'
```

### Fetch Check Evidence

Read checks and commit statuses, then the relevant Actions run and jobs.

- Run and job metadata identify the reported SHA; logs and artifacts establish separately checked-out dependency SHAs.
- Use the latest relevant attempts and retain their URLs. A success on another pairing leaves the candidate unmeasured.

```bash
gh api --paginate repos/{owner}/{repo}/commits/<sha>/check-runs
gh api repos/{owner}/{repo}/commits/<sha>/status
gh api repos/{owner}/{repo}/actions/runs/<run-id>
gh api --paginate repos/{owner}/{repo}/actions/runs/<run-id>/jobs
```

### Refresh Revisions

Compare current remote heads and PR metadata with the captured review subject.

```bash
git ls-remote <remote> refs/heads/<head> refs/heads/<target> refs/heads/<paired-branch>
gh api repos/{owner}/{repo}/pulls/950
```

## Project Checks

### Run Project Check

Run the check selected from the reviewed project's manifest, test configuration or CI job.

- Replace the command placeholder with that project's actual invocation, including its runtime, check arguments and explicit dependency paths.
- Capture the working directory, input revisions, measured cases, skips, exit status and output. Assess the result against the active mode's requirements.

```bash
cd <tool-checkout>
<project-check-command>
```

## Skill Revision

### Create Skill Worktree

Create the skill's branch in its own worktree from its repository's current target.

```bash
git fetch <remote> <target-branch>
git worktree add <skill-worktree> -b <revision-branch> <remote>/<target-branch>
```

### Run Skill Checks

Validate the skill's structure and run the checks its repository and changed resources require.

- Run from the worktree containing the edits. Discover relevant test folders and use [Run Project Check](#run-project-check) for their actual commands; choose additional suites from the affected consumers.
- Inspect every local Markdown link and heading anchor, frontmatter and unfinished scaffold text. If an installed skill validator is available, run it too.
- A behavioral walkthrough follows [Revise](revise-mode.md#procedure); mechanical checks alone do not establish instruction quality.

```bash
git diff --check
```

### Commit Skill Changes

Commit the intended change set with a message describing the resulting behavior.

- Stage every changed rule home and consumer, including shared guidelines, moved or removed paths, templates and tests. Inspect the staged diff against the request before committing; leave unrelated work unstaged.

```bash
git add -- <changed-path> <other-changed-path>
git diff --cached --stat
git commit -F <message-file>
```

### Push Skill Branch

Publish the skill branch with a plain push to its matching remote branch.

- Check the current branch before setting its tracking configuration. A non-fast-forward rejection needs the repository's branch-rewrite decision.

```bash
git branch --show-current
git config branch.<revision-branch>.remote <remote>
git config branch.<revision-branch>.merge refs/heads/<revision-branch>
git push
```

### Open Skill Pull Request

Open the requested PR against the repository's chosen target with a reviewed body file.

```bash
gh api --method POST repos/{owner}/{repo}/pulls -f title='<title>' -f head='<revision-branch>' -f base='<target-branch>' -F body=@<body-file>
```

## Install Engine Dependencies

Install the captured lockfile with the runtime required by that revision's CI.

- Installation needs the appropriate network permissions; it is not a network-free sandbox operation.

```bash
npm ci
```

## Run Engine Checks

Check source/tooling types, production output, generated schemas and behavior against the intended corpus.

```bash
npm run typecheck
npm run build
npm run check:schemas
npx tsx guards/check-tool-call-shape.ts --root <corpus>
WORKFLOWS_DIR=<corpus> npm run test:ci
```

## Run Delivery Gate

Measure fixture delivery against the recorded benchmark and threshold used by CI.

```bash
npm run --silent bench:token -- --workflow=delivery-fixture --fixture-corpus --label=review --context-mode=fresh --gate --reference=benchmark/fixtures/token-benchmark-baseline.json
```

## Check Engine Documentation

Check site references and affected generated content against their source definitions.

- Inspect generated diffs in the disposable tree; a link check alone does not prove generated content is current.

```bash
npm run check:site
npm run check:svg
npm run build:site
git diff -- site
```

## Run Corpus Checks

Validate the corpus roster, protocol and recorded paths with the paired engine.

```bash
bash <corpus>/walks/check-roster.sh
python3 <corpus>/walks/check-walk-protocol.py
python3 <corpus>/walks/check-walk-protocol.py --self-test
WORKFLOWS_DIR=<corpus> npx vitest run tests/e2e/snapshot.test.ts
WORKFLOWS_DIR=<corpus> npx vitest run tests/e2e/all-workflows-walk.test.ts
```

## Run Option Coverage

Walk the current corpus roster and compare checkpoint reachability with its exceptions.

- Read the roster first and supply its walked IDs as a literal comma-separated value.
- An omitted scope walks the full roster. [Workflows Coverage](coverage.md#workflows-coverage) determines when a literal `WF_COVERAGE_SCOPE` narrows the walk.

```bash
jq -r '.walked | join(",")' <corpus>/walks/roster.json
WORKFLOWS_DIR=<corpus> WF_WALKED=<walked-ids> npm run test:coverage-walk
```

## Count Running Sessions

List running sessions in the configured planning tree for an affected workflow.

- Resolve the planning root holding the relevant session records; retain its identity in the evidence.

```bash
npm run sessions:census -- --root <session-planning-root> --workflow <workflow-id> --status running --list
```

## Check Shell Syntax

Parse a changed Bash script without executing its operations.

```bash
bash -n <script-path>
```

## Validate Compose

Resolve the reviewed Compose file with a disposable environment file.

- The environment file supplies the required host paths and ports. Keep sensitive values out of saved output.

```bash
docker compose --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml config
```

## Build Review Image

Build a local image using captured Docker files and engine content.

- Use a disposable engine checkout as the context. Copy both the Dockerfile and ignore file so the actual build boundary is measured.
- Container runtime checks use disposable mounts and an unused port according to the reviewed configuration.

```bash
cp <docker-tree>/Dockerfile <engine>/Dockerfile
cp <docker-tree>/.dockerignore <engine>/.dockerignore
docker build --file <engine>/Dockerfile --tag workflow-server:integration-review <engine>
```

## Exercise Review Container

Start the reviewed image with disposable mounts and inspect its running behavior.

- The override file selects the local review image and a unique container name. The environment file supplies unused ports and disposable corpus, project and state paths; inspect the resolved configuration before starting.
- Probe the MCP endpoint with the client and protocol version documented by the reviewed engine. Record the interaction and response; health checks alone do not cover MCP.
- Stop and restart with the same disposable state mount to observe durability when affected. Remove only this review's containers after recording evidence.

```bash
docker compose -p integration-review --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml -f <scratch>/review.override.yml up -d --no-build --pull never
curl --fail http://127.0.0.1:<review-port>/health
curl --fail http://127.0.0.1:<review-port>/ready
docker compose -p integration-review --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml -f <scratch>/review.override.yml logs
```

## Restart Review Container

Restart the review service while retaining its disposable state mount.

```bash
docker compose -p integration-review --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml -f <scratch>/review.override.yml restart
```

## Stop Review Container

Remove the disposable review service after its evidence is recorded.

```bash
docker compose -p integration-review --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml -f <scratch>/review.override.yml down
```

## Check Skill Summaries

Run the shared mode-summary tests from the checkout containing its skills.

- Run from the workspace checkout containing the skill under revision.

```bash
python3 -m unittest discover -s skills/work-planner/test -p test_modes.py
```

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


## Checkouts

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

## Corpus

### List Units

Lists a home's `##` units, then its `###` entries, with their line numbers.

- The [unit inventory](canon-map.md#unit-inventory) names the level each home's unit sits at.
- Run from the corpus root.

```bash
rg -n "^## " corpus/canon/resources/anti-patterns.md
rg -n "^### " corpus/canon/resources/anti-patterns.md
```

### List Units for a Construct

Prints every canon unit that fires on one construct id, with its file and line.

- The id is a construct a draft writes: a bare kind, a field path, `resource`, `readme`, or `*`.
- A unit is listed when it declares that id, a prefix of it, its bare kind, or `*`.
- Runs in the server checkout. `--root` names the corpus tree. The listing is printed and not stored.

```bash
npx tsx guards/list-fires-on.ts 'activity.steps[].when' --root <corpus>
```

### Fetch Unit

Reads one section or entry of a home.

- **On disk.**
  [List units](#list-units) for the range, then Read it. For one entry, list the `###` lines and read that block.
- **In a workflow session.**  `get_resource` with `canon/<home>#<heading>`.

### Find Consumers

Lists the references other workflows hold into the target.

- Run from the corpus root.
- Resolve each hit's binds and Apply links from there.

```bash
rg -n "work-package/" corpus/ -g "*.md" -g "*.yaml"
```

## Checks

### Run Guard Suite

Runs the guard registry, or a named subset.

- The caller supplies the canon check conventions, including guard obligations.

```bash
WORKFLOWS_DIR=<corpus> npm run check:all
WORKFLOWS_DIR=<corpus> npm run check:all -- --only <id>,<id>
```

### Run Guards on the Delta

Runs the guard suite at the merge-base and on this tree, and attributes each failure by the difference.

- The caller supplies the canon check conventions, including guard obligations.

```bash
WORKFLOWS_DIR=<corpus> npm run check:delta -- --base <base-ref>
```

## Edit Guard

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

### Run the Edit Guard Tests

Drives the edit guard over seeded edits in temporary git repositories, with a stub guard runner in place of the server.

- Run from the workspace checkout containing the skill under revision.

```bash
python3 -m unittest discover -s skills/workflow-canon/test
```
