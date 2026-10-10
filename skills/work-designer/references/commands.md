# Commands

Each operation has one spec. Commands below use example values that the caller replaces with the reviewed repository, revisions and paths.

## Conventions

- **Locations.**
  `<workspace>` holds this skill; `<engine>` holds engine code; `<corpus>` is the corpus branch root; `<record>` holds review evidence; `<scratch>` is disposable storage. Use absolute paths for cross-tree inputs.
- **Execution.**
  Follow the workspace's shell and sandbox instructions. In the workflow-server workspace, change to the tool's checkout before prefixing script and project-tool commands with `/home/mike1/projects/dev/workflow-server/scripts/sbx`. Name a second writable project root through `SBX_EXTRA_ROOTS` only when a check needs it.
- **Remote access.**
  GitHub and remote Git operations use full host permissions. Unset `GH_TOKEN` and `GITHUB_TOKEN` in each GitHub CLI shell for keyring auth. GitHub operations use REST.
- **Evidence.**
  Save outputs under the review record with their command, working directory, revision pairing and exit status. Preserve failed and skipped observations.
- **Substitution.**
  Replace angle-bracket placeholders and `{owner}/{repo}` before execution. `950` is an example PR or issue; `skill/work-designer` and `workspace` are examples of a skill branch and target. Check installed command interfaces at the captured revision.
- **Authored text.**
  Commit messages and PR bodies go through files. A review report remains local under Review's [authority](review-mode.md#rules); publication commands serve Revise only.

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
git fetch origin <branch>
git rev-parse origin/<branch>
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
- Use a separate worktree per proposed result. Do not combine the engine and corpus histories.

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

Read a document, manifest or CI definition from a captured branch revision.

```bash
git show <sha>:<repo-relative-path>
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
git ls-remote origin refs/heads/<head> refs/heads/<target> refs/heads/<paired-branch>
gh api repos/{owner}/{repo}/pulls/950
```

## Workflow-Server Checks

These examples run from the engine checkout unless their spec says otherwise. The [project profile](workflow-server.md) determines which checks apply.

### Install Engine Dependencies

Install the captured lockfile with the runtime required by that revision's CI.

- Installation needs the appropriate network permissions; it is not a network-free sandbox operation.

```bash
npm ci
```

### Run Engine Checks

Check source/tooling types, production output, generated schemas and behavior against the intended corpus.

```bash
npm run typecheck
npm run build
npm run check:schemas
npx tsx guards/check-tool-call-shape.ts --root <corpus>
WORKFLOWS_DIR=<corpus> npm run test:ci
```

### Run Delivery Gate

Measure fixture delivery against the recorded benchmark and threshold used by CI.

```bash
npm run --silent bench:token -- --workflow=delivery-fixture --fixture-corpus --label=review --context-mode=fresh --gate --reference=benchmark/fixtures/token-benchmark-baseline.json
```

### Check Engine Documentation

Check site references and affected generated content against their source definitions.

- Inspect generated diffs in the disposable tree; a link check alone does not prove generated content is current.

```bash
npm run check:site
npm run check:svg
npm run build:site
git diff -- site
```

### Run Corpus Checks

Validate the corpus roster, protocol, guards and recorded paths with the paired engine.

```bash
bash <corpus>/walks/check-roster.sh
python3 <corpus>/walks/check-walk-protocol.py
python3 <corpus>/walks/check-walk-protocol.py --self-test
WORKFLOWS_DIR=<corpus> npm run check:all
WORKFLOWS_DIR=<corpus> npx vitest run tests/e2e/snapshot.test.ts
WORKFLOWS_DIR=<corpus> npx vitest run tests/e2e/all-workflows-walk.test.ts
```

### Run Option Coverage

Walk the current corpus roster and compare checkpoint reachability with its exceptions.

- Read the roster first and supply its walked IDs as a literal comma-separated value.
- An omitted scope walks the full roster. Set a literal `WF_COVERAGE_SCOPE` only when the [profile](workflow-server.md#workflows-coverage) permits scoped coverage.

```bash
jq -r '.walked | join(",")' <corpus>/walks/roster.json
WORKFLOWS_DIR=<corpus> WF_WALKED=<walked-ids> npm run test:coverage-walk
```

### Count Running Sessions

List running sessions in the configured state root for an affected workflow.

- Use the relevant state configuration; retain its identity in the evidence.

```bash
npm run sessions:census -- --workflow <workflow-id> --status running --list
```

### Check Shell Syntax

Parse a changed Bash script without executing its operations.

```bash
bash -n <script-path>
```

### Validate Compose

Resolve the reviewed Compose file with a disposable environment file.

- The environment file supplies the required host paths and ports. Keep sensitive values out of saved output.

```bash
docker compose --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml config
```

### Build Review Image

Build a local image using captured Docker files and engine content.

- Use a disposable engine checkout as the context. Copy both the Dockerfile and ignore file so the actual build boundary is measured.
- Container runtime checks use disposable mounts and an unused port according to the reviewed configuration.

```bash
cp <docker-tree>/Dockerfile <engine>/Dockerfile
cp <docker-tree>/.dockerignore <engine>/.dockerignore
docker build --file <engine>/Dockerfile --tag workflow-server:integration-review <engine>
```

### Exercise Review Container

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

### Restart Review Container

Restart the review service while retaining its disposable state mount.

```bash
docker compose -p integration-review --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml -f <scratch>/review.override.yml restart
```

### Stop Review Container

Remove the disposable review service after its evidence is recorded.

```bash
docker compose -p integration-review --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml -f <scratch>/review.override.yml down
```

## Skill Revision

### Create Skill Worktree

Create the skill's branch in its own worktree from the current workspace target.

```bash
git fetch origin workspace
git worktree add .worktrees/skill/work-designer -b skill/work-designer origin/workspace
```

### Run Skill Checks

Run the existing shared mode-summary checks and any tests belonging to the changed skill.

- Run from the workspace worktree containing the edits. Discover the relevant test folders before selecting them; a prose-only skill need not invent a test suite.
- Inspect every local Markdown link and heading anchor, frontmatter and unfinished scaffold text. If an installed skill validator is available, run it too.
- A behavioral walkthrough follows [Revise](revise-mode.md#procedure); mechanical checks alone do not establish instruction quality.

```bash
python3 -m unittest discover -s skills/work-planner/test -p test_modes.py
git diff --check
```

### Commit Skill Changes

Commit the intended skill files with a message describing the resulting behavior.

```bash
git add skills/work-designer
git commit -F <message-file>
```

### Push Skill Branch

Publish the skill branch with a plain push to its matching remote branch.

- Check the current branch before setting its tracking configuration. A non-fast-forward rejection needs the workspace's branch-rewrite decision.

```bash
git branch --show-current
git config branch.skill/work-designer.remote origin
git config branch.skill/work-designer.merge refs/heads/skill/work-designer
git push
```

### Open Skill Pull Request

Open the requested PR against the workspace target with a reviewed body file.

```bash
gh api --method POST repos/{owner}/{repo}/pulls -f title='Work Designer: Work Design with Integration Review' -f head='skill/work-designer' -f base='workspace' -F body=@<body-file>
```
