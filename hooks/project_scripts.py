#!/usr/bin/env python3
"""Resolve interpreter targets within the enclosing project root.

The compound command classifier uses this location check for both single and
compound commands. Symlink targets must remain within the project root."""

import os
import shlex

# Safety belt: only treat scripts as project-local when the enclosing project
# root is under here. Override with SBX_PROJECTS_BASE; default ~/projects.
PROJECTS_BASE = os.environ.get("SBX_PROJECTS_BASE") or os.path.join(
    os.path.expanduser("~"), "projects"
)

# argv[0] basenames treated as interpreters: the script is a later argument.
INTERPRETERS = {
    "bash", "sh", "zsh", "dash", "ksh",
    "node", "nodejs",
    "python", "python2", "python3",
    "deno", "bun", "ruby", "perl", "php", "Rscript",
}


def find_project_root(start):
    cur = os.path.realpath(start)
    while True:
        if os.path.exists(os.path.join(cur, ".git")):
            return cur
        parent = os.path.dirname(cur)
        if parent == cur:
            return None
        cur = parent


def is_within(path, root):
    try:
        return os.path.commonpath([path, root]) == root
    except ValueError:
        return False


def extract_script_token(tokens):
    """Return the token that names the script/file to run, or None."""
    t0 = tokens[0]
    b0 = os.path.basename(t0)

    # Interpreter form: first non-flag argument is the script.
    if b0 in INTERPRETERS:
        for tok in tokens[1:]:
            if tok.startswith("-"):
                continue
            return tok
        return None

    # `npx tsx <file>` / `npx ts-node <file>`.
    if b0 == "npx" and len(tokens) >= 2 and tokens[1] in ("tsx", "ts-node"):
        for tok in tokens[2:]:
            if tok.startswith("-"):
                continue
            return tok
        return None

    # Direct execution by path: ./x, ../x, /abs/x, or a path with a separator.
    if t0.startswith(("./", "../", "/")) or "/" in t0:
        return t0

    return None


def resolve_project_local_script(segment, base_cwd):
    """If `segment` (a single command string) executes a script that lives
    inside the project rooted at `base_cwd`, return the resolved absolute path;
    otherwise return None. Relative script paths resolve against `base_cwd`, so
    callers must pass the *effective* cwd (a leading `cd <dir>` moves it).

    The segment may carry redirections (`... 2>&1`); shlex tokenizes them as
    ordinary arguments and extract_script_token skips them.
    """
    try:
        tokens = shlex.split(segment)
    except ValueError:
        return None
    if not tokens:
        return None

    project_root = find_project_root(base_cwd)
    if project_root is None:
        return None

    root_real = os.path.realpath(project_root)
    if not is_within(root_real, os.path.realpath(PROJECTS_BASE)):
        return None

    script = extract_script_token(tokens)
    if script is None:
        return None

    if os.path.isabs(script):
        resolved = os.path.realpath(script)
    else:
        resolved = os.path.realpath(os.path.join(base_cwd, script))

    if os.path.isfile(resolved) and is_within(resolved, root_real):
        return resolved
    return None
