#!/usr/bin/env python3
"""PreToolUse hook for Bash: DENY + REDIRECT in-sandbox file mutation to `sbx`.

`rm`, `mv`, `ln`, `chmod`, `chown` and `chgrp` are rejected by
compound-bash-allow.py's DENY_BINARIES, and carry no allow rule of their own, so
a bare invocation reaches the user as a permission prompt. One such segment
forfeits auto-approval for the WHOLE command, because that hook's verdict is
all-or-nothing per invocation: a twelve-command chain whose only unmatched
segment is `rm -rf /tmp/scratch` prompts in full.

When every path the segment mutates lies inside a root sbx binds read-write, the
sandbox runs the command unchanged, and the prefixed form
(Bash(<...>/bin/sbx *)) auto-approves. This hook detects that case and returns
`deny` with a message telling the agent to re-issue the command prefixed with
sbx. A `deny` decision is reliable, unlike an `updatedInput` rewrite, which
misbehaves when several PreToolUse Bash hooks are configured.

Writable roots are computed exactly as sbx computes them (see bin/sbx): /tmp
always, plus the git top-level of the launch cwd when that root lives under
$CLAUDE_PROJECTS_BASE (default $HOME/projects). Agreement matters — a redirect
whose target the sandbox cannot write trades a prompt for an EROFS failure.

The hook stays SILENT (normal permission flow, i.e. a prompt) whenever the
target cannot be proven writable:

  * any operand outside the writable roots — the sandbox's read-only bind would
    block it, so the bare form is the one that works;
  * `..` in an operand, or a symlink whose resolved path crosses the boundary in
    either direction — the literal argument and the sandbox's view of it differ;
  * a flag whose value is a separate token (-t, --reference, ...), or any
    `--opt=value` form: a path could hide there;
  * `dd`, whose operands are `if=`/`of=` pairs rather than positionals;
  * a relative operand in a chain that `cd`s outside its first segment, where
    the effective cwd is not attributable.

Redirection targets are not inspected. The outer shell performs a redirection
before sbx starts, so the sandbox never governed it; compound-bash-allow.py
takes the same position for its own rules (`Bash(cat:*)` already matches
`cat f > anywhere`).

Fails OPEN (exit 0, no output) on any parse error — a miss falls through to the
prompt, never to silent un-sandboxed mutation.

Dry-run: python3 redirect-fs-mutation.py --test 'rm -rf /tmp/x'
"""
from __future__ import annotations

import importlib.util
import json
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path

_HERE = os.path.dirname(os.path.realpath(__file__))


def _sbx_path() -> str:
    """Workspace-local sbx when present; else ~/.claude/bin/sbx."""
    local = Path(__file__).resolve().parent.parent / "bin" / "sbx"
    if local.is_file():
        return str(local)
    return str(Path.home() / ".claude" / "bin" / "sbx")


SBX = _sbx_path()

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


def _load_compound_hook():
    """Reuse the quote-aware splitter and cwd resolution from
    compound-bash-allow.py so segment detection matches the allow hook exactly."""
    path = os.path.join(_HERE, "compound-bash-allow.py")
    spec = importlib.util.spec_from_file_location("compound_bash_allow", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def writable_roots(base_cwd: str) -> list[str]:
    """The roots sbx binds read-write, derived the way bin/sbx derives them."""
    roots = ["/tmp"]
    base = os.environ.get("CLAUDE_PROJECTS_BASE") or os.path.join(
        str(Path.home()), "projects")
    base = os.path.realpath(base)
    try:
        done = subprocess.run(
            ["git", "-C", base_cwd, "rev-parse", "--show-toplevel"],
            capture_output=True, text=True, timeout=2,
        )
    except (OSError, subprocess.SubprocessError):
        return roots
    root = done.stdout.strip()
    if done.returncode != 0 or not root:
        return roots
    root = os.path.realpath(root)
    if root == base or root.startswith(base + os.sep):
        roots.append(root)
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
    try:
        cba = _load_compound_hook()
    except Exception:
        return []  # fail open
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


def deny(segments: list[str]) -> None:
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
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))
    sys.exit(0)


def run_hook() -> None:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        sys.exit(0)
    if payload.get("tool_name") != "Bash":
        sys.exit(0)
    cmd = payload.get("tool_input", {}).get("command")
    if not isinstance(cmd, str) or not cmd.strip():
        sys.exit(0)
    if not any(m in cmd for m in MUTATORS):
        sys.exit(0)
    segments = find_redirects(cmd, payload.get("cwd") or os.getcwd())
    if segments:
        deny(segments)
    sys.exit(0)


def run_test(args: list[str]) -> None:
    cmd = args[0] if args else sys.stdin.read()
    segments = find_redirects(cmd, os.getcwd())
    if segments:
        print("DENY — redirect to sbx: " + "; ".join(segments))
        sys.exit(1)
    print("PASS — nothing provably sandbox-runnable to redirect")
    sys.exit(0)


def main() -> None:
    if len(sys.argv) >= 2 and sys.argv[1] == "--test":
        run_test(sys.argv[2:])
        return
    run_hook()


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception:
        sys.exit(0)  # fail open: never block on internal error
