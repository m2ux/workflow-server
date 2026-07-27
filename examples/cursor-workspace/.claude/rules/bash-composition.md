---
description: Bash command composition and sandboxed execution
---

# Bash composition

These constructs trigger a non-bypassable confirmation prompt even when the
command prefix is allowlisted, so **never use them**:

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
- **`find -exec` / `find -delete`** — two tool calls: `find -print`, then act on the listed paths.
- **Heredocs** — allowed. Use for multi-line input such as commit messages.

# Sandboxed execution (`sbx`)

When `__WORKSPACE__/scripts/claude/bin/sbx` is present it runs a command under
bubblewrap: the active project and `/tmp` read-write, the rest of the
filesystem read-only, no network. **Invoke it by that absolute path** — that
form is allowlisted and auto-approves; a bare `sbx` token is not on PATH and
fails.

- **Inline eval** (`python3 -c`, `node -e`, `perl -e`, `ruby -e`, `php -r`, `bun -e`, `Rscript -e`, `deno eval`) — must be `sbx`-prefixed. The `redirect-inline-eval` hook denies the bare form.
- **`rm` / `mv` / `ln` / `dd` / `chmod` inside the project or `/tmp`** — prefix with `sbx` to auto-approve. Bare forms are the escape hatch for paths outside the project, which the sandbox blocks; they prompt.
- **Not an `sbx` candidate** — anything needing network (dep fetches, `git fetch`/`push`, `gh`, `npx`) or writes outside the project and `/tmp`.
