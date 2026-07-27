# Claude Code baseline (hooks + sandbox)

Portable Claude Code hooks and the `sbx` sandbox launcher used by the Cursor
workspace deploy path. `deploy-cursor-workspace.sh` copies this tree into the
kickoff workspace as `scripts/claude/` and writes workspace-local
`.claude/settings.json` with absolute hook paths.

## Layout

```text
scripts/claude/
├── README.md
├── bin/
│   └── sbx                         # bubblewrap profile-C launcher
└── hooks/
    ├── allow-project-scripts.py    # shared by compound-bash (location allow)
    ├── block-dynamic-shell.py
    ├── block-gh-api-writes.py
    ├── compound-bash-allow.py
    ├── curl-allow.json
    ├── curl-read-allow.py
    ├── redirect-inline-eval.py
    ├── webfetch-allow.json
    ├── webfetch-allow.py
    ├── gitnexus/
    │   └── gitnexus-hook.cjs
    └── lib/
        └── project_scripts.py
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
