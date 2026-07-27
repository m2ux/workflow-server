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

Instead:

- **Multi-step** — chain with `&&` or `;` on one line.
- **Variables** — hard-code the literal value.
- **A value from another command** — two tool calls: the first prints it, the second uses the literal.
- **`find -exec` / `find -delete`** — two tool calls: `find -print`, then act on the listed paths (in parallel when independent).
- **Heredocs** — allowed. Use for multi-line input such as commit messages.

# Sandboxed execution (`sbx`)

`__WORKSPACE__/scripts/claude/bin/sbx <command> [args...]` runs under bubblewrap: the active project (git top-level, when under the projects root) and `/tmp` read-write, rest of the filesystem read-only, no network. **Always invoke by that absolute path** — it is allowlisted and auto-approves; bare `sbx` is not on PATH and fails.

- **Inline eval** (`python3 -c`, `node -e`, `perl -e`, `ruby -e`, `php -r`, `bun -e`, `Rscript -e`, `deno eval`) — must be `sbx`-prefixed. A PreToolUse hook denies the bare form, so reach for `sbx` first.
- **`rm` / `mv` / `ln` / `dd` / `chmod` inside the project or `/tmp`** — prefix with `sbx` to auto-approve. Bare forms are the escape hatch for paths OUTSIDE the project, which the sandbox blocks; they prompt.
- **Not an `sbx` candidate** — anything needing network (dep fetches, `git fetch`/`push`, `gh`, `npx`) or writes outside the project and `/tmp`.
