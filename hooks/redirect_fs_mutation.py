#!/usr/bin/env python3
"""Identify filesystem mutations confined to scripts/sbx writable roots.

A corrective denial names the launcher when every operand is provably within
a writable root. Other shapes delegate to native permissions."""
from __future__ import annotations

from contracts import Decision

import compound_bash_allow as compound
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path

from permissions import SBX

ALREADY_WRAPPED = frozenset({"sbx", "bwrap"})

# Mutating binary -> number of leading operands that are NOT paths (chmod's mode,
# chown's owner spec). `dd` is absent deliberately: its operands are key=value
# pairs, so the positional walk below would not find them.
MUTATORS = {"rm": 0, "mv": 0, "ln": 0, "chmod": 1, "chown": 1, "chgrp": 1}

# Flags whose value is a SEPARATE token. A path can hide there, and skipping the
# token would drop it from the containment check, so these bail instead. An
# unknown short flag needs no such entry: a path never starts with `-`, and an
# unknown flag's value stays in the operand list, where it fails containment.
ARG_TAKING = frozenset({
    "-t", "--target-directory", "-S", "--suffix", "--reference", "--from",
})

GLOB_CHARS = "*?["

# Redirections as the shell leaves them in a segment: a standalone operator
# (`>`, `2>>`, `<&`) whose target is the next token, or one with the target
# attached (`>/dev/null`, `2>&1`).
_REDIR_OP = re.compile(r"^\d*(?:>>|&>|>&|<&|>|<)$")
_REDIR_ATTACHED = re.compile(r"^\d*(?:>>|&>|>&|<&|>|<)\S")




def writable_roots(base_cwd: str) -> list[str]:
    """The roots sbx binds read-write, derived the way scripts/sbx derives them."""
    roots = ["/tmp"]
    base = os.environ.get("SBX_PROJECTS_BASE") or os.path.join(
        str(Path.home()), "projects")
    base = os.path.realpath(base)

    def under_base(path: str) -> bool:
        return path == base or path.startswith(base + os.sep)

    try:
        done = subprocess.run(
            ["git", "-C", base_cwd, "rev-parse", "--show-toplevel"],
            capture_output=True, text=True, timeout=2,
        )
    except (OSError, subprocess.SubprocessError):
        done = None
    if done is not None and done.returncode == 0 and done.stdout.strip():
        root = os.path.realpath(done.stdout.strip())
        if under_base(root):
            roots.append(root)

    for extra in (os.environ.get("SBX_EXTRA_ROOTS") or "").split(os.pathsep):
        if not extra:
            continue
        extra = os.path.realpath(extra)
        if os.path.isdir(extra) and under_base(extra) and extra not in roots:
            roots.append(extra)
    return roots


def _inside(path: str, roots: list[str]) -> bool:
    return any(path == r or path.startswith(r + os.sep) for r in roots)


def operand_provably_writable(tok: str, base_cwd: str, roots: list[str]) -> bool:
    """True only when this operand certainly lands inside a writable root.

    A glob is judged on its literal prefix, since expansion can only produce
    paths under that directory. Both the lexical path and its symlink-resolved
    form must be inside, so a symlink crossing the boundary in either direction
    is undecided rather than assumed.
    """
    for i, c in enumerate(tok):
        if c in GLOB_CHARS:
            tok = tok[:i]
            break
    if not tok:
        return False
    if os.pardir in tok.split(os.sep):
        return False
    p = tok if os.path.isabs(tok) else os.path.join(base_cwd, tok)
    return _inside(os.path.normpath(p), roots) and _inside(os.path.realpath(p), roots)


def segment_paths(seg: str, cba) -> tuple[str, list[str]] | None:
    """(binary, mutated paths) for a filesystem-mutating segment; None when the
    segment mutates nothing, already runs sandboxed, or carries an operand shape
    this hook does not decide."""
    seg = cba.strip_env_prefix(seg)
    try:
        toks = shlex.split(seg, posix=True)
    except ValueError:
        return None
    if not toks:
        return None
    binary = os.path.basename(toks[0])
    if binary in ALREADY_WRAPPED or binary not in MUTATORS:
        return None
    operands: list[str] = []
    end_of_flags = False
    i, n = 1, len(toks)
    while i < n:
        t = toks[i]
        if _REDIR_OP.match(t):
            i += 2  # operator plus its target
            continue
        if _REDIR_ATTACHED.match(t):
            i += 1
            continue
        if not end_of_flags and t == "--":
            end_of_flags = True
            i += 1
            continue
        if not end_of_flags and t.startswith("-") and t != "-":
            if t in ARG_TAKING or (t.startswith("--") and "=" in t):
                return None
            i += 1
            continue
        operands.append(t)
        i += 1
    skip = MUTATORS[binary]
    if len(operands) <= skip:
        return None  # a mode or owner spec with no path to judge
    return binary, operands[skip:]


def _cd_outside_first_segment(segments: list[str]) -> bool:
    """True when a `cd` sits anywhere but the head of the chain. leading_cd_base()
    attributes only a leading `cd`, so a later one leaves the effective cwd of a
    relative operand undetermined."""
    for seg in segments[1:]:
        try:
            toks = shlex.split(seg, posix=True)
        except ValueError:
            return True
        if toks and os.path.basename(toks[0]) == "cd":
            return True
    return False


def find_redirects(cmd: str, cwd: str) -> list[str]:
    """The mutating segments sbx can run unchanged. Empty when the command should
    fall through to the normal permission flow."""
    cba = compound
    segments = cba.split_compound(cmd)
    if not segments:  # None (risky tokens / unbalanced) or empty
        return []
    base_cwd = cba.leading_cd_base(segments, cwd)
    late_cd = _cd_outside_first_segment(segments)
    roots = writable_roots(base_cwd)
    found: list[str] = []
    for seg in segments:
        parsed = segment_paths(seg, cba)
        if parsed is None:
            continue
        _binary, paths = parsed
        if late_cd and any(not os.path.isabs(p) for p in paths):
            return []
        if not all(operand_provably_writable(p, base_cwd, roots) for p in paths):
            return []  # a mutation the sandbox would block: prompt instead
        found.append(seg)
    return found


def deny(segments: list[str]) -> Decision:
    reason = (
        "Blocked before the permission prompt: this mutates the filesystem with "
        "an un-sandboxed " + ", ".join(sorted({s.split()[0] for s in segments}))
        + " (" + "; ".join(segments) + "), and every path it touches lies inside "
        "a root the sandbox binds read-write. Re-issue the command with each such "
        "segment prefixed by the sandbox launcher " + SBX + " — e.g. `" + SBX
        + " rm -rf /tmp/scratch`. The prefixed form is allowlisted and "
        "auto-approves with no prompt, and in a compound chain it restores "
        "auto-approval for the whole chain. Prefix ONLY the mutating segments; "
        "leave the rest of the chain as written."
    )
    return Decision('deny', reason)




def run_test(args: list[str]) -> None:
    cmd = args[0] if args else sys.stdin.read()
    segments = find_redirects(cmd, os.getcwd())
    if segments:
        print("DENY — redirect to sbx: " + "; ".join(segments))
        sys.exit(1)
    print("PASS — nothing provably sandbox-runnable to redirect")
    sys.exit(0)




if __name__ == "__main__":
    run_test(sys.argv[2:] if sys.argv[1:2] == ["--test"] else sys.argv[1:])
