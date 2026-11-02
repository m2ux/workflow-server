# Revise Mode

Changes the skill itself: its entry point, mode files, shared guides, commands and templates.

## Prerequisites

Before the first command spec, read the [command conventions](command-conventions.md#common).

## Procedure

1. **Read the guidelines.**
   Read the [skill guidelines](../../guidelines.md) and this skill's [guidelines](guidelines.md) whole before the first edit.
2. **Understand the request.**
   Resolve missing decisions with the user until the change and its scope are clear. Find the rule's home, its consumers, and any script, template or test that states it. The workspace branch owns the skill and shared guidelines. Locate a shared [planning record](planning.md) when the revision needs planning artifacts.
3. **Work in a worktree.**
   [Create Skill Worktree](#create-skill-worktree) for the change.
4. **Revise.**
   Make the change in its authoritative home and update every consumer. Apply the guidelines' layout, prose, link and command rules while writing.
5. **Check the guidelines.**
   Read each changed file against both guidelines: discovery description, mode summaries, bold leads, one line per item, single rule homes, command links, resolved file links and anchors, and [progressive disclosure](../../guidelines.md#progressive-disclosure).
6. **Verify.**
   - Confirm frontmatter opens and closes with `---`, contains the required fields and names the skill's folder.
   - [Run Skill Checks](#run-skill-checks), [Check Skill Summaries](#check-skill-summaries) and [Run the Edit Guard Tests](#run-the-edit-guard-tests). A change to the shared check itself also runs [its tests](#run-the-skill-file-check-tests). Changes to shared rules or templates also run their affected consumer suites.
   - Walk a representative request through each changed decision.
   - For every affected mode, apply [disclosure verification](../../guidelines.md#disclosure-verification) using the skill's [representative scenarios](guidelines.md#progressive-disclosure).
7. **Deliver.**
   [Commit Skill Changes](#commit-skill-changes) for each distinct change, then [Push Skill Branch](#push-skill-branch). When requested, [Open Skill Pull Request](#open-skill-pull-request). Report the files, validation and delivery link.
8. **Revise the guidelines.**
   When the user states an authoring rule, put it in the [skill guidelines](../../guidelines.md) if it binds every skill, or this skill's [guidelines](guidelines.md) if it binds only this one.

## Rules

- **Complete.**
  A revision is complete only when it conforms to both guidelines, its links resolve, applicable checks pass and [disclosure verification](../../guidelines.md#disclosure-verification) succeeds for every affected mode.
- **Scope.**
  This mode changes the skill; an example integration is reviewed only as far as needed to validate the requested revision.

## Commands

### Create Skill Worktree

Create the skill's branch in its own worktree from its repository's current target.

```bash
git fetch <remote> <target-branch>
git worktree add <skill-worktree> -b <revision-branch> <remote>/<target-branch>
```

### Run Skill Checks

Validate the skill's structure and run the checks its repository and changed resources require.

- Run from the worktree containing the edits. Discover relevant test folders and use [Run Project Check](command-conventions.md#run-project-check) for their actual commands; choose additional suites from the affected consumers.
- Run [Check Skill Files](#check-skill-files) over every skill the revision touches, and inspect frontmatter and unfinished scaffold text. If an installed skill validator is available, run it too.
- A behavioral walkthrough follows [Revise](revise-mode.md#procedure); mechanical checks alone do not establish instruction quality.

```bash
git diff --check
```

### Check Skill Files

Resolves every local link and heading anchor in a skill, and reports the link and layout rules the shared guidelines state.

- Run from the workspace checkout holding the skills. Name each skill folder; several in one run share their anchor resolution.
- A repeated heading is reported only where a link cites it, since an uncited repeat resolves nothing ambiguously.
- A `Read [Name](target) first.` sentence is a prerequisite citation, and its target must sit in another file. A link naming the next operation is a selection link and points anywhere.
- Fenced blocks, code spans and `{{...}}` placeholders hold specimen text and are excluded.
- Exit 0 means no finding; exit 1 lists each one as `file:line: kind`.

```bash
python3 skills/scripts/check_skill_files.py skills/workflow-canon
python3 skills/scripts/check_skill_files.py skills/workflow-canon skills/work-planner
```

### Run the Skill File Check Tests

Drives the skill-file check over seeded specimen skills in a temporary tree.

- Run from the workspace checkout containing the skill under revision.

```bash
python3 -m unittest discover -s skills/test -p test_check_skill_files.py
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

### Check Skill Summaries

Run the shared mode-summary tests from the checkout containing its skills.

- Run from the workspace checkout containing the skill under revision.

```bash
python3 -m unittest discover -s skills/work-planner/test -p test_modes.py
```

### Run the Edit Guard Tests

Drives the edit guard over seeded edits in temporary git repositories, with a stub guard runner in place of the server.

- Run from the workspace checkout containing the skill under revision.

```bash
python3 -m unittest discover -s skills/workflow-canon/test -p test_edit_guard.py
```
