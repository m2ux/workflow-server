---
description: Bash command composition and sandboxed execution
---

# Bash composition rules

Applies to every Bash invocation, in every project. These constructs trigger a non-bypassable confirmation prompt even when the command prefix is allowlisted, so **never use them**:

- Backslash-escaped line continuations — `\<newline>`
- Parameter expansion — `$VAR`, `${VAR}`, `${VAR:-default}`
- Command substitution — `$(...)`, backticks
- Process substitution — `<(...)`, `>(...)`
- Arithmetic expansion — `$((...))`
- `find -exec` and `find -delete` — not covered by a `Bash(find *)` rule

**The match is textual, not semantic — quoting does not exempt you.** A PreToolUse hook scans the raw command string, so these are denied wherever the characters appear: inside single quotes, in an `echo`/`--message` label, in a `grep`/`sed` pattern, in a trailing `#` comment. Consequences worth internalising, because they are the ones that keep biting:

- **Never type a literal backtick in a Bash command at all.** Not for markdown emphasis, not in a progress label. Use plain words.
- `awk '{print $NF}'` is denied — `$NF` reads as `$NAME`, and `$(NF)` would trip the `$(` rule instead. Reach for `rev | cut -d' ' -f1`, or put the field work in a script file run under `sbx`.
- Only positional and special params survive: `$1`, `$0`, `$?`, `$#`.

Instead:

- **Multi-step** — chain with `&&` or `;` on one line.
- **Variables** — hard-code the literal value.
- **A value from another command** — two tool calls: the first prints it, the second uses the literal.
- **`find -exec` / `find -delete`** — two tool calls: `find -print`, then act on the listed paths (in parallel when independent).
- **Heredocs** — allowed (`<<`, `<<<`). Use for multi-line input.
- **Commit messages** — `git commit -F - <<'EOF' … EOF`, or write the message to a file and `git commit -F <file>`. Never `git commit -m "$(cat …)"`.

Unsure whether a command will trip? Write it to a file and dry-run the hook: `python3 __WORKSPACE__/scripts/claude/hooks/block-dynamic-shell.py --test < /tmp/cmd.txt` (passing it as an argument would trip the hook on your own test call).

# Sandboxed execution (`sbx`)

`__WORKSPACE__/scripts/claude/bin/sbx <command> [args...]` runs under bubblewrap: the active project (git top-level, when under the projects root) and `/tmp` read-write, rest of the filesystem read-only, no network. **Always invoke by that absolute path** — it is allowlisted and auto-approves; bare `sbx` is not on PATH and fails.

**`cd` before `sbx`, never inside it.** The writable project root is resolved by running `git rev-parse --show-toplevel` in the OUTER shell, before the sandbox starts. So `cd <dir> && __WORKSPACE__/scripts/claude/bin/sbx <cmd>` gets a writable `<dir>`; `sbx bash -lc 'cd <dir> && <cmd>'` gets a read-only one. This also fixes `npx` binary resolution, which depends on cwd.

- **Inline eval** (`python3 -c`, `node -e`, `perl -e`, `ruby -e`, `php -r`, `bun -e`, `Rscript -e`, `deno eval`) — must be `sbx`-prefixed. A PreToolUse hook denies the bare form, so reach for `sbx` first.
- **An interpreter reading its program from stdin** is inline eval by another spelling, and is denied the same way: `python3 - <<'EOF'`, `python3 <<'EOF'`, `cat x.py | node`, `deno run -`. Heredocs are still fine as *data* (`git commit -F - <<'EOF'`) — it is the interpreter, not the heredoc, that triggers the deny. Prefix with `sbx`, or write the program to a file and run the file.
- **`rm` / `mv` / `ln` / `dd` / `chmod` inside the project or `/tmp`** — prefix with `sbx` to auto-approve. Bare forms are the escape hatch for paths OUTSIDE the project, which the sandbox blocks; they prompt.
- **Project-local tools** (`npx tsx`, `npx vitest`, and anything already in `node_modules/.bin`) — an `sbx` candidate, and the preferred way to run them: no allowlist rule needed. `npx` walks up the tree to find the binary, so a git worktree with no `node_modules` of its own still resolves from the parent repo. If the package is genuinely absent, `npx` falls through to the registry and dies with `EAI_AGAIN` — read that as "not installed locally", not as a sandbox fault. (`--no-install` and `--no` do NOT suppress the registry lookup on npm 9, and `--no` swallows a following `--version`.) To bypass `npx` entirely, call the binary by path: `node_modules/.bin/tsx`, or `../../node_modules/.bin/tsx` from a worktree.
- **Not an `sbx` candidate** — anything needing network: `git fetch`/`push`, `gh`, dep installs, and `npx` that must *install* the package (not merely run an installed one). Also writes outside the project and `/tmp`.
- **Git writes inside a linked worktree** — not an `sbx` candidate. The worktree's `.git` file points into the main repo's `.git/worktrees/<name>`, which stays read-only, so `git add`/`commit` fail there. Running scripts against worktree files is fine.
