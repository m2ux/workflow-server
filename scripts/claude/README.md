# Claude Code baseline (hooks + sandbox)

Portable Claude Code hooks and the `sbx` sandbox launcher used by the Cursor
workspace deploy path. `deploy-cursor-workspace.sh` copies this tree into the
kickoff workspace as `scripts/claude/` and writes workspace-local
`.claude/settings.json` with absolute hook paths.

## Layout

```text
scripts/claude/
├── README.md                       # this file (deployed with the tree)
├── .gitignore                      # ignore __pycache__ / *.pyc under this tree
├── bin/
│   └── sbx                         # bubblewrap profile-C launcher (no net; project+/tmp RW)
└── hooks/
    ├── allow-project-scripts.py    # optional PreToolUse: bare project-script location allow
    ├── block-dynamic-shell.py      # PreToolUse: deny $() / backticks / $VAR dynamic shell
    ├── block-gh-api-writes.py      # PreToolUse: ask on mutating gh api (keep GET/HEAD free)
    ├── compound-bash-allow.py      # PreToolUse: auto-allow safe compounds + normalized singles
    ├── curl-allow.json             # host/path allowlist config for curl-read-allow.py
    ├── curl-read-allow.py          # PreToolUse: auto-allow read-only curl to trusted hosts
    ├── redirect-inline-eval.py     # PreToolUse: deny bare python -c / node -e; redirect to sbx
    ├── webfetch-allow.json         # URL-prefix allowlist config for webfetch-allow.py
    ├── webfetch-allow.py           # PreToolUse: auto-allow WebFetch under configured prefixes
    └── lib/
        └── project_scripts.py      # shared by compound-bash (location allow)
```

## Path resolution

Hooks prefer config files next to themselves (`curl-allow.json`,
`webfetch-allow.json`, optional `compound-bash.json`). `sbx` and
`project_scripts.py` use `$HOME/projects` (override with `CLAUDE_PROJECTS_BASE`).

## Not committed as live settings

Project-level Claude settings for Cursor kickoffs are generated at deploy time
from `examples/cursor-workspace/.claude/settings.template.json` into the
workspace dir only (`~/.local/share/cursor/workspaces/<name>/.claude/settings.json`).
Do not commit machine-local hook paths.
