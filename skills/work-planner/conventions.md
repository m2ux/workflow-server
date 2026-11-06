# Conventions

- **Session.**
  Once per session, before the first `gh` call, unset `GH_TOKEN` and `GITHUB_TOKEN` so `gh` uses its keyring login. Where shell state does not persist between commands, confirm instead that neither is set in the shell profile.
- **Repository.**
  `gh` resolves `{owner}/{repo}` from the git remote of the directory it runs in, so run `gh` commands inside a checkout of the repository that holds the issues. `{other}` is a further repository the board's issues live in.
- **Checkouts.**
  Checkout names identify the working trees selected by operation steps and command input contracts.
  - `project`  The repository's main working tree.
  - `epic base`  An epic base's worktree.
  - `unit`  A unit's task worktree.
  - `engineering`  The [engineering branch](configuration.md#planning-records)'s worktree.
  - `review`  A pull request's detached review worktree.
- **Bodies.**
  - Bodies and long comments always go through a file (`-F body=@file`), never inline, which avoids quoting.
  - **Example.**  workflow-server's dynamic-shell restrictions deny a body inlined in the command.
  - A plan's draft bodies are files of its [planning record](artifacts/planning-record.md#layout). Keep every other body file in a working directory outside the repository.
- **Scripts.**
  Scripts run under `sbx`, invoked by its absolute path from `<workspace>`, the checkout holding this skill. A script that reaches the tracker calls `gh` itself, and one that adds a worktree writes the repository's git directory, which `sbx` leaves read-only; each runs from `<workspace>` outside `sbx`.
- **Boards.**
  A project board sits under `users/{owner}`, or `orgs/{owner}` when `gh api repos/{owner}/{repo} --jq .owner.type` is `Organization`.
- **Example values.**  Substitute the real ones:
  - `936` an initiative issue, `943` and `937` its epics, `637` a task issue, `874` an orphan, `946` an initiative off the board, `960` a proposal;
  - `950` a pull request, `I07` and `I08` initiative numbers;
  - board `9`, workflow-server's Canon theme, and `419167630` its Status field id;
  - `1` the Initiative Template board, `13` a board copied from it;
  - `14` the Proposals Template, `15` the Proposals board;
  - `m2ux` the user.
  - `<checkout>` any checkout of the project, a linked worktree included.
