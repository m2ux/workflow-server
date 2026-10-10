# Commands

Each operation has one spec. Commands below use example values that the caller replaces with the reviewed repository, revisions and paths.

## Conventions

- **Locations.**
  `<skill-checkout>` holds this skill; `<tool-checkout>` holds the selected project tooling; `<record>` is the shared planning record; `<scratch>` is disposable storage. Use absolute paths for cross-tree inputs.
- **Execution.**
  Follow the current host's shell, sandbox and permission instructions. Run a check from the checkout owning its tools and explicitly identify any separately versioned inputs.
- **Remote access.**
  Use the authentication and execution permissions required by the host. The GitHub specs use its REST API through the GitHub CLI; another forge supplies its corresponding metadata and check APIs.
- **Evidence.**
  Save outputs under the planning record with their command, working directory, input revisions and exit status. Preserve failed and skipped observations.
- **Substitution.**
  Replace angle-bracket placeholders and `{owner}/{repo}` before execution. `950` is an example PR or issue. Derive remote, target and revision-branch names from the repository under work, and check installed command interfaces at the captured revision.
- **Authored text.**
  Commit messages and PR bodies go through files. A review report remains local under Review's [authority](review-mode.md#rules); publication commands serve Revise only.

## Configuration

### Inspect Project Identity

Read repository identifiers and discover available [project variants](variants.md).

- Compare the repository with each variant's identity and applicable project instructions. Resolve the skill path before listing its variants.

```bash
git remote -v
rg --files <skill-path>/variants
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
git ls-remote <remote> refs/heads/<head> refs/heads/<target> refs/heads/<paired-branch>
gh api repos/{owner}/{repo}/pulls/950
```

## Project Checks

### Run Project Check

Run the check selected from the reviewed project's manifest, test configuration or CI job.

- Replace the command placeholder with that project's actual invocation, including its runtime, check arguments and explicit dependency paths.
- Capture the working directory, input revisions, measured cases, skips, exit status and output. Use the [coverage guide](coverage.md) to assess what the result establishes.

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

- Run from the worktree containing the edits. Discover relevant test folders and use [Run Project Check](#run-project-check) for their actual commands; a prose-only skill need not invent a test suite.
- Inspect every local Markdown link and heading anchor, frontmatter and unfinished scaffold text. If an installed skill validator is available, run it too.
- A behavioral walkthrough follows [Revise](revise-mode.md#procedure); mechanical checks alone do not establish instruction quality.

```bash
git diff --check
```

### Commit Skill Changes

Commit the intended skill files with a message describing the resulting behavior.

```bash
git add <skill-path>
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
