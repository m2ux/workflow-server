# Claude Code Baseline

Portable Claude Code hooks and the `sbx` sandbox launcher used by the Cursor
workspace deploy path. `deploy-cursor-workspace.sh` copies this tree into the
kickoff workspace as `scripts/claude/` and writes workspace-local
`.claude/settings.json` with absolute hook paths.

## Layout

```text
scripts/claude/
├── README.md
├── .gitignore
├── bin/
│   └── sbx                         # bubblewrap profile-C launcher (no net; project+/tmp RW)
└── hooks/
    ├── allow-project-scripts.py    # optional PreToolUse: bare project-script location allow
    ├── block-dynamic-shell.py      # PreToolUse: deny $() / backticks / $VAR dynamic shell
    ├── block-gh-api-writes.py      # PreToolUse: ask on mutating gh api (keep GET/HEAD free)
    ├── compound-bash-allow.py      # PreToolUse: auto-allow safe compounds + normalized singles
    ├── compound-bash.json          # extra read-only safe commands for compound-bash-allow.py
    ├── curl-allow.json             # host/path allowlist config for curl-read-allow.py
    ├── curl-read-allow.py          # PreToolUse: auto-allow read-only curl to trusted hosts
    ├── redirect-fs-mutation.py     # PreToolUse: deny bare rm/mv/chmod on writable-root paths; redirect to sbx
    ├── redirect-inline-eval.py     # PreToolUse: deny bare python -c / node -e; redirect to sbx
    ├── webfetch-allow.json         # URL-prefix allowlist config for webfetch-allow.py
    ├── webfetch-allow.py           # PreToolUse: auto-allow WebFetch under configured prefixes
    └── lib/
        └── project_scripts.py      # shared by compound-bash (location allow)
```

## Note

Deploy writes `.claude/settings.json` from
`examples/cursor-workspace/.claude/settings.template.json`.
