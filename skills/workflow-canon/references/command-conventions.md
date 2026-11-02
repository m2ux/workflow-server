# Command Conventions

Shared conventions for every operation in this skill. Read before the first command of a session.

## Common

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

## Run Project Check

Run the check selected by the task or by the reviewed project's manifest, test configuration or CI job.

- A selected canon check also reads [Canon Check Conventions](canon-context.md#canon-check-conventions) before this operation; a checker the task supplies for a bounded scope does not.
- Replace the command placeholder with that project's actual invocation, including its runtime, check arguments and explicit dependency paths.
- Capture the working directory, input revisions, measured cases, skips, exit status and output. Assess the result against the active mode's requirements.

```bash
cd <tool-checkout>
<project-check-command>
```
