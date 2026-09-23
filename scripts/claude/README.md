# Claude Code Baseline

Portable Claude Code hooks and the `sbx` sandbox launcher used by the Cursor
workspace deploy path. Claude runs the hooks at `.claude/hooks`, which links
`scripts/`. Config lives in `config/`. The launcher is installed at `scripts/sbx`.
Workspace `.claude/settings.json` records absolute paths under `.claude/hooks`
and allowlists `scripts/sbx`.

## Layout

```text
scripts/sbx                         # bubblewrap profile-C launcher (no net; project, /tmp and $SBX_EXTRA_ROOTS RW)
scripts/claude/
├── README.md
├── .gitignore
├── config/
│   ├── compound-bash.json          # extra read-only safe commands for compound-bash-allow.py
│   ├── curl-allow.json             # host/path allowlist config for curl-read-allow.py
│   └── webfetch-allow.json         # URL-prefix allowlist config for webfetch-allow.py
└── hooks/
    ├── allow-project-scripts.py    # optional PreToolUse: bare project-script location allow
    ├── block-dynamic-shell.py      # PreToolUse: deny $() / backticks / $VAR dynamic shell
    ├── compound-bash-allow.py      # PreToolUse: auto-allow safe compounds + normalized singles
    ├── curl-read-allow.py          # PreToolUse: auto-allow read-only curl to trusted hosts
    ├── gate-gh-api-hazards.py      # PreToolUse: ask on hazardous gh api calls; routine writes fall through
    ├── redirect-fs-mutation.py     # PreToolUse: deny bare rm/mv/chmod on writable-root paths; redirect to sbx
    ├── project_scripts.py          # script-location resolution, shared by the compound and inline-eval hooks
    ├── redirect-inline-eval.py     # PreToolUse: deny bare python -c / node -e and unvetted scripts; redirect to sbx
    └── webfetch-allow.py           # PreToolUse: auto-allow WebFetch under configured prefixes
```

A hook loads `config/<name>.json` from the directory beside the directory that
holds the script, after resolving links.

## Note

Deploy writes `.claude/settings.json` from
`examples/cursor-workspace/.claude/settings.template.json`.
