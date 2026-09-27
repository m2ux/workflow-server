---
description: Bash command composition and sandboxed execution
alwaysApply: true
---

# Bash composition rules

Applies to every shell invocation in this workspace. The shared command policy rejects these constructs before evaluating allowlist grants:

- Backslash-escaped line continuations — `\<newline>`
- Parameter expansion — `$VAR`, `${VAR}`, `${VAR:-default}`
- Command substitution — `$(...)`, backticks
- Process substitution — `<(...)`, `>(...)`
- Arithmetic expansion — `$((...))`
- `find -exec`, `find -execdir`, and `find -delete`

**The match is textual; quoting does not exempt you.** Each harness adapter passes the raw command to the shared evaluator. The patterns also match inside quotes, labels, search patterns, and comments:

- **Never type a literal backtick in a Bash command at all.** Not for markdown emphasis, not in a progress label. Use plain words. When the pattern itself needs one, put the pattern in a Python or Node file, run it under `sbx`, and compose the character as `chr(96)`. A commit message quoting a backticked name goes to a file and `git commit -F <file>`.
- `awk '{print $NF}'` is denied — `$NF` reads as `$NAME`, and `$(NF)` would trip the `$(` rule instead. Reach for `rev | cut -d' ' -f1`, or put the field work in a script file run under `sbx`.
- Only positional and special params survive: `$1`, `$0`, `$?`, `$#`.

Instead:

- **Multi-step** — chain with `&&` or `;` on one line.
- **Variables** — hard-code the literal value.
- **A value from another command** — two tool calls: the first prints it, the second uses the literal.
- **`find -exec` / `find -delete`** — two tool calls: `find -print`, then act on the listed paths (in parallel when independent).
- **Heredocs** — allowed (`<<`, `<<<`). Use for multi-line input.
- **Commit messages** — `git commit -F - <<'EOF' … EOF`, or write the message to a file and `git commit -F <file>`. Never `git commit -m "$(cat …)"`.

To check a command, write it to a file and run `python3 __WORKSPACE__/hooks/block_dynamic_shell.py --test < /tmp/cmd.txt`.

# Sandboxed execution (`sbx`)

`__WORKSPACE__/scripts/sbx <command> [args...]` runs under bubblewrap: the active project (git top-level, when under the projects root), `/tmp`, and any directory named in `SBX_EXTRA_ROOTS` read-write, rest of the filesystem read-only, no network. **Always invoke by that absolute path** — it is allowlisted and auto-approves; bare `sbx` is not on PATH and fails.

**`cd` before `sbx`, never inside it.** The writable project root is resolved by running `git rev-parse --show-toplevel` in the OUTER shell, before the sandbox starts. So `cd <dir> && __WORKSPACE__/scripts/sbx <cmd>` gets a writable `<dir>`; `sbx bash -lc 'cd <dir> && <cmd>'` gets a read-only one. This also fixes `npx` binary resolution, which depends on cwd.

**When the tool and the files it writes are in different checkouts, name the second root.** Git reports a linked worktree as its own top-level, so two worktrees of one repository are two roots and `cd` buys only one of them. Start in the checkout the tool resolves from, and name the other in `SBX_EXTRA_ROOTS` — a colon-separated list, each entry bound read-write only where it resolves under the projects root, anything else left read-only with a note on stderr:

```bash
cd <server-worktree> && SBX_EXTRA_ROOTS=<definitions-worktree> __WORKSPACE__/scripts/sbx npx vitest run <test>
```

A run that exits non-zero ends with a line naming the roots it could write, so `Read-only file system` on a path outside them reads as the sandbox boundary rather than as a permissions fault.

- **Inline eval** (`python3 -c`, `node -e`, `perl -e`, `ruby -e`, `php -r`, `bun -e`, `Rscript -e`, `deno eval`) — must be `sbx`-prefixed. A PreToolUse hook denies the bare form, so reach for `sbx` first.
- **An interpreter reading its program from stdin** is inline eval by another spelling, and is denied the same way: `python3 - <<'EOF'`, `python3 <<'EOF'`, `cat x.py | node`, `deno run -`. Heredocs are still fine as *data* (`git commit -F - <<'EOF'`) — it is the interpreter, not the heredoc, that triggers the deny. Prefix with `sbx`, or write the program to a file and run the file.
- **A script file outside the project root** — a scratch script under `/tmp`, the session scratchpad included — fails the location check and prompts. Prefix it with `sbx`. A project-local target auto-approves without the prefix. A script outside the writable roots still prompts: the sandbox can read it, and the bare form is the one that runs.
- **`rm` / `mv` / `ln` / `chmod` / `chown` / `chgrp` inside a writable root** — prefix that segment with `sbx`. One bare mutator forfeits auto-approval for the whole invocation. Outside those roots the bare form is the one that runs, and it prompts.
- **`dd`** — its `if=` / `of=` operands go unparsed, so the redirect hook leaves it alone. Prefix with `sbx` for a write inside a writable root.
- **Project-local tools** (`npx tsx`, `npx vitest`, and anything already in `node_modules/.bin`) — an `sbx` candidate, and the preferred way to run them: no allowlist rule needed. `npx` walks up the tree to find the binary, so a git worktree with no `node_modules` of its own still resolves from the parent repo. If the package is genuinely absent, `npx` falls through to the registry and dies with `EAI_AGAIN` — read that as "not installed locally", not as a sandbox fault. (`--no-install` and `--no` do NOT suppress the registry lookup on npm 9, and `--no` swallows a following `--version`.) To bypass `npx` entirely, call the binary by path: `node_modules/.bin/tsx`, or `../../node_modules/.bin/tsx` from a worktree.
- **Not an `sbx` candidate** — anything needing network: `git fetch`/`push`, `gh`, dep installs, and `npx` that must *install* the package (not merely run an installed one). Also writes outside the writable roots, which for a path beyond the projects root no extra root can reach.
- **Git writes inside a linked worktree** — not an `sbx` candidate. The worktree's `.git` file points into the main repo's `.git/worktrees/<name>`, which stays read-only, so `git add`/`commit` fail there. Running scripts against worktree files is fine.

# GitHub CLI

**REST only — no GraphQL.** `gh pr create`, `gh pr view`, `gh pr list`, and any call that reaches `api.github.com/graphql` are forbidden: GraphQL is deprecated and unreliable here, and these fail. Create and manage PRs through REST instead:

```bash
git push -u origin HEAD
gh api --method POST repos/{owner}/{repo}/pulls -f title='...' -f head='branch' -f base='main' -f body='...'
```

Other operations take the same shape: `gh api repos/...`, `gh api --method PATCH|POST|GET ...`.

## Auth and the agent shell

Host auth is **keyring + SSH** — `gh` runs as the active user and `origin` is `git@github.com:...`. Most agent GitHub failures are a sandboxed shell, not a broken login.

1. **Full host permissions on the first attempt, every time.** Every `gh` call (including `gh api`) and every remote git or SSH call (`fetch` / `pull` / `push` / `ls-remote` / network `clone` / `ssh` to the git host) runs with full host permissions — `required_permissions: ["all"]`, or the harness equivalent. Local-only git (`status`, `add`, `commit`, `rev-parse`) may use the default shell. Do not start a remote call sandboxed and escalate after it fails.
2. **Leave token env unset unless a known-good PAT is intentional.** Unset `GH_TOKEN` and `GITHUB_TOKEN` for keyring auth. `gh` prefers those env vars over the keyring, so a wrong or garbage value yields `Bad credentials` / HTTP 401 even when the keyring login is fine. Never scrape `~/.config/gh/hosts.yml` into them — tokens live in the keyring, not that file.
3. **Sandbox denial is not auth failure.** These signatures mean the shell is still sandboxed. Re-run the *same* command once with full host permissions; do not conclude the credentials or SSH keys are invalid, and do not thrash sandboxed retries. If the harness refuses full host permissions, stop and surface that blockage:

   ```text
   Bad owner or permissions on /etc/ssh/ssh_config.d/20-systemd-ssh-proxy.conf
   read tcp 127.0.0.1:…->127.0.0.1:… connection reset by peer
   Get "https://api.github.com/...": unexpected EOF
   fatal: Could not read from remote repository.
   ```

4. **Health check** — unsandboxed only, same permissions as step 1:

   ```bash
   unset GH_TOKEN GITHUB_TOKEN
   gh auth status
   gh api user --jq .login
   ssh -T git@github.com
   git ls-remote origin HEAD
   ```
