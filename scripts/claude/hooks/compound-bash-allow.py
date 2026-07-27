#!/usr/bin/env python3
"""
PreToolUse hook for Bash: auto-approve

  1. Compound commands when every segment is individually allowed by existing
     permission rules or trivially safe, AND

  2. Single commands when they match an existing rule *after* env-prefix
     (`VAR=val cmd ...`) or git-prefix (`git -C <path> ...`) normalization —
     forms Claude Code's built-in matcher does not see through. Direct-match
     singles are left to Claude Code's normal flow.

Without this, Claude Code prompts for approval on compounds like
    git status && echo done
even when both `git *` and `echo` would be allowed individually, and on
singles like
    git -C /path/to/repo status
    COMPOUND_BASH_HOOK_DEBUG=1 python3 script.py
where the unprefixed forms (`git status`, `python3 ...`) match an allow rule
but the prefixed forms don't.

Reads merged Bash() allow rules from
    ~/.claude/settings.json
    $CLAUDE_PROJECT_DIR/.claude/settings.json
    $CLAUDE_PROJECT_DIR/.claude/settings.local.json
splits the candidate command on top-level &&, ||, ;, |, newline (respecting
quotes, parens, and escapes), and emits {permissionDecision: "allow"} only if
every segment matches an allow rule OR begins with a side-effect-free command.

Heredocs with a quoted delimiter (`<<'EOF'` / `<<"EOF"`) are stripped before
analysis: bash performs no expansion on such bodies, so they are inert stdin
data. Unquoted heredocs (`<<EOF`, whose body IS expanded), herestrings, $(...),
backticks, and process substitution still force a bail.

If any segment is unrecognized, or the command contains one of those bail-out
constructs, the hook stays silent and normal permission flow takes over.

Optional config: ~/.claude/hooks/compound-bash.json
    {
      "extraSafeCommands": ["my-tool", "another"],
      // or to fully replace the default safe list:
      "safeCommands": ["echo", "cat", "grep"]
    }

Debug: set COMPOUND_BASH_HOOK_DEBUG=1 to print analysis to stderr.
Dry-run: python3 compound-bash-allow.py --test 'cmd1 && cmd2'
"""
from __future__ import annotations

import fnmatch
import json
import os
import re
import shlex
import sys
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(os.path.realpath(__file__)), "lib"))
from project_scripts import resolve_project_local_script  # noqa: E402

DEFAULT_SAFE_COMMANDS = frozenset({
    "echo", "printf", "cat", "head", "tail", "wc",
    "sort", "uniq", "tr", "cut", "paste", "column", "rev", "fmt", "nl",
    "ls", "stat", "file", "readlink", "realpath", "tree", "du", "df",
    "pwd", "whoami", "hostname", "id", "groups", "date", "uptime", "uname",
    "ps", "pgrep", "pidof", "free",
    "grep", "rg", "fgrep", "egrep",
    "jq", "yq",
    "which", "type", "command", "basename", "dirname",
    "test", "[", "true", "false", ":", "sleep",
    "cd", "pushd", "popd", "dirs",
})

DENY_BINARIES = frozenset({
    "sudo", "doas", "su",
    "rm", "mv", "dd",
    "chmod", "chown", "chgrp",
    "ln",
    "killall",
    "shutdown", "reboot", "halt", "poweroff",
})

RISKY_TOKENS = ("$(", "`", "<<", "<<<", ">(", "<(")


def has_unquoted_risky_token(cmd: str) -> bool:
    """True iff a RISKY_TOKEN appears outside single/double-quoted strings.

    Heredocs and command substitutions inside quoted arguments (e.g.
    `git commit -m "$(cat <<EOF\n...\nEOF\n)"`) are argument text from the
    splitter's perspective and should not force a bail-out.
    """
    in_s = in_d = False
    i = 0
    n = len(cmd)
    while i < n:
        c = cmd[i]
        if in_s:
            if c == "'":
                in_s = False
            i += 1
            continue
        if in_d:
            if c == "\\" and i + 1 < n:
                i += 2
                continue
            if c == '"':
                in_d = False
            i += 1
            continue
        if c == "\\" and i + 1 < n:
            i += 2
            continue
        if c == "'":
            in_s = True
            i += 1
            continue
        if c == '"':
            in_d = True
            i += 1
            continue
        for tok in RISKY_TOKENS:
            if cmd.startswith(tok, i):
                return True
        i += 1
    return False

_ENV_LEAD = re.compile(r"""^\s*[A-Za-z_]\w*=(?:'[^']*'|"[^"]*"|[^\s'"])*\s+""")
_BASH_RULE = re.compile(r"^Bash\((.*)\)$", re.DOTALL)
_HEREDOC_OP = re.compile(r"<<-?[ \t]*(['\"]?)(\w+)\1")


def strip_quoted_heredocs(cmd: str) -> str | None:
    """Excise a heredoc whose delimiter is quoted (`<<'EOF'` / `<<"EOF"`).

    A quoted delimiter makes bash perform NO expansion on the body, so the body
    is inert stdin data: it cannot execute code and is irrelevant to which
    binary/subcommand runs. Removing it lets the rest of the machinery (rule
    match, git-prefix normalization, safe-list) analyze the real command, e.g.
    `git -C <path> commit -F - <<'EOF' ... EOF`.

    Returns:
      * cmd with the quoted heredoc removed, or
      * cmd unchanged when no `<<` is present, or
      * cmd unchanged when a heredoc uses an UNQUOTED delimiter — its body would
        undergo expansion (command substitution = code execution), so it is left
        intact for has_unquoted_risky_token() to bail on, or
      * None when a heredoc is present but can't be cleanly/safely excised
        (herestring, >1 heredoc, trailing content after the operator on its
        line, or an unterminated body) — caller should bail.
    """
    if "<<" not in cmd:
        return cmd
    if "<<<" in cmd:  # herestring: `<<<'x'` is inert but `<<<"$x"` expands; punt.
        return None
    ops = list(_HEREDOC_OP.finditer(cmd))
    if not ops:
        return None  # `<<` present but no delimiter we recognize
    if any(m.group(1) == "" for m in ops):
        return cmd  # unquoted heredoc -> leave `<<` for the risky-token bail
    if len(ops) != 1:
        return None  # stacked heredocs: body order is ambiguous; bail
    m = ops[0]
    op_start, op_end = m.span()
    delim = m.group(2)
    nl = cmd.find("\n", op_end)
    if nl == -1:
        return None  # operator with no following body
    if cmd[op_end:nl].strip():
        return None  # content after the operator on its line -> body ambiguous
    tail = cmd[nl + 1:].split("\n")
    close_idx = next((i for i, ln in enumerate(tail) if ln.strip() == delim), None)
    if close_idx is None:
        return None  # unterminated heredoc
    remainder = "\n".join(tail[close_idx + 1:])
    head = cmd[:op_start].rstrip()
    return head + "\n" + remainder if remainder.strip() else head


def debug(*args: object) -> None:
    if os.environ.get("COMPOUND_BASH_HOOK_DEBUG"):
        print("[compound-bash-hook]", *args, file=sys.stderr)


def load_allow_rules() -> list[str]:
    cwd = Path(os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd())
    paths = [
        Path.home() / ".claude" / "settings.json",
        cwd / ".claude" / "settings.json",
        cwd / ".claude" / "settings.local.json",
    ]
    rules: list[str] = []
    for p in paths:
        try:
            text = p.read_text()
        except (FileNotFoundError, OSError):
            continue
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            debug(f"skipping malformed settings: {p}")
            continue
        for rule in data.get("permissions", {}).get("allow", []) or []:
            m = _BASH_RULE.match(rule)
            if m:
                rules.append(m.group(1))
    return rules


def load_safe_commands() -> set[str]:
    candidates = [
        Path(__file__).resolve().parent / "compound-bash.json",
        Path.home() / ".claude" / "hooks" / "compound-bash.json",
    ]
    data = None
    for cfg in candidates:
        try:
            data = json.loads(cfg.read_text())
            break
        except (FileNotFoundError, json.JSONDecodeError, OSError):
            continue
    if data is None:
        return set(DEFAULT_SAFE_COMMANDS)
    if isinstance(data.get("safeCommands"), list):
        return {str(s) for s in data["safeCommands"]}
    extra = data.get("extraSafeCommands") or []
    return set(DEFAULT_SAFE_COMMANDS) | {str(s) for s in extra}


def split_compound(cmd: str) -> list[str] | None:
    unheredoc = strip_quoted_heredocs(cmd)
    if unheredoc is None:
        return None
    cmd = unheredoc
    if has_unquoted_risky_token(cmd):
        return None
    out: list[str] = []
    cur: list[str] = []
    in_s = in_d = False
    paren = 0
    i = 0
    n = len(cmd)
    while i < n:
        c = cmd[i]
        if in_s:
            cur.append(c)
            if c == "'":
                in_s = False
            i += 1
            continue
        if in_d:
            if c == "\\" and i + 1 < n:
                cur.append(c)
                cur.append(cmd[i + 1])
                i += 2
                continue
            cur.append(c)
            if c == '"':
                in_d = False
            i += 1
            continue
        if c == "\\" and i + 1 < n:
            cur.append(c)
            cur.append(cmd[i + 1])
            i += 2
            continue
        if c == "'":
            in_s = True
            cur.append(c)
            i += 1
            continue
        if c == '"':
            in_d = True
            cur.append(c)
            i += 1
            continue
        if c == "(":
            paren += 1
            cur.append(c)
            i += 1
            continue
        if c == ")":
            paren -= 1
            cur.append(c)
            i += 1
            continue
        if paren == 0:
            two = cmd[i : i + 2]
            if two == "&&" or two == "||":
                out.append("".join(cur).strip())
                cur = []
                i += 2
                continue
            if c in ";\n|":
                out.append("".join(cur).strip())
                cur = []
                i += 1
                continue
            if c == "&" and (i + 1 >= n or cmd[i + 1] != "&"):
                # Skip if `&` is part of a redirection like `2>&1` or `<&3`.
                prev = next((cmd[j] for j in range(i - 1, -1, -1) if not cmd[j].isspace() and not cmd[j].isdigit()), "")
                if prev in (">", "<"):
                    cur.append(c)
                    i += 1
                    continue
                out.append("".join(cur).strip())
                cur = []
                i += 1
                continue
        cur.append(c)
        i += 1
    if in_s or in_d or paren != 0:
        return None
    if cur:
        out.append("".join(cur).strip())
    return [s for s in out if s]


def strip_env_prefix(seg: str) -> str:
    while True:
        m = _ENV_LEAD.match(seg)
        if not m:
            return seg
        seg = seg[m.end():]


def first_binary(seg: str) -> str | None:
    seg = strip_env_prefix(seg)
    try:
        toks = shlex.split(seg, posix=True)
    except ValueError:
        return None
    if not toks:
        return None
    return os.path.basename(toks[0])


def normalize_git_prefix(seg: str) -> str:
    """Strip git's pre-subcommand options so `git -C <path> status -uno`
    matches an allow rule like `Bash(git status *)`. Handles -C, -c,
    --git-dir, --work-tree, --namespace (space- and =-separated)."""
    try:
        toks = shlex.split(seg, posix=True)
    except ValueError:
        return seg
    if not toks or os.path.basename(toks[0]) != "git":
        return seg
    out = [toks[0]]
    i = 1
    while i < len(toks):
        t = toks[i]
        if t in ("-C", "-c"):
            i += 2
            continue
        if t in ("--git-dir", "--work-tree", "--namespace"):
            i += 2
            continue
        if t.startswith(("--git-dir=", "--work-tree=", "--namespace=")):
            i += 1
            continue
        break
    out.extend(toks[i:])
    return " ".join(out)


# flock options that consume a following argument (everything else starting
# with '-' is treated as a standalone flag). The first non-option token is the
# lockfile/fd; what follows is either `-c <payload>` (shell string) or a direct
# command + args.
_FLOCK_ARG_OPTS = frozenset({"-w", "--timeout", "-E", "--conflict-exit-code"})


def unwrap_flock(seg: str) -> str | None:
    """If seg is `flock [opts] <lock> -c <payload>` or
    `flock [opts] <lock> <cmd> [args...]`, return the inner command string for
    recursive analysis; else None. flock itself neither writes files nor runs
    code beyond the wrapped command, so unwrapping grants nothing the inner
    segments wouldn't already be allowed for on their own."""
    try:
        toks = shlex.split(seg, posix=True)
    except ValueError:
        return None
    if not toks or os.path.basename(toks[0]) != "flock":
        return None
    i = 1
    while i < len(toks):
        t = toks[i]
        if t in _FLOCK_ARG_OPTS:
            i += 2
            continue
        if t.startswith("-") and "=" in t:  # --timeout=5
            i += 1
            continue
        if t.startswith("-") and t != "-":  # standalone flag (-x, -n, -s, ...)
            i += 1
            continue
        break
    if i >= len(toks):
        return None
    i += 1  # skip the lockfile/fd positional
    if i >= len(toks):
        return None
    if toks[i] in ("-c", "--command"):
        if i + 1 >= len(toks):
            return None
        return toks[i + 1]  # the shell payload string (quotes already stripped)
    # Direct form: the remaining tokens are the command to run (no shell).
    return " ".join(shlex.quote(t) for t in toks[i:])


# Argument-transparent runners: `nice CMD`, `timeout DUR CMD`, `xargs CMD` all
# exec an arbitrary command, so a blanket `Bash(nice:*)` etc. would let a denied
# or network command run under the runner's own rule. Instead these carry NO
# allow rule; the runner is unwrapped here and its inner command re-checked
# against the same rules/deny-list (mirrors flock). Each entry is
# (options-that-consume-an-argument, standalone-flags, positionals-before-cmd).
_RUNNER_SPECS = {
    "nice": (frozenset({"-n", "--adjustment"}), frozenset(), 0),
    "timeout": (
        frozenset({"-s", "--signal", "-k", "--kill-after"}),
        frozenset({"--preserve-status", "--foreground", "-v", "--verbose"}),
        1,  # DURATION
    ),
    "xargs": (
        frozenset({"-I", "-i", "-n", "--max-args", "-L", "--max-lines", "-P",
                   "--max-procs", "-s", "--max-chars", "-d", "--delimiter",
                   "-E", "-e", "--eof", "-a", "--arg-file", "-R",
                   "--process-slot-var"}),
        frozenset({"-0", "--null", "-r", "--no-run-if-empty", "-t", "--verbose",
                   "-x", "--exit", "-p", "--interactive", "-o", "--open-tty"}),
        0,
    ),
}


def unwrap_runner(seg: str) -> str | None:
    """If `seg` is `nice/timeout/xargs [known-opts] [positional] CMD [args]`,
    return the inner command string (CMD + its args) for recursive rule-checking;
    else None. Bails (None) on any UNRECOGNIZED option, so an unknown flag can
    never be mistaken for the command — the segment then falls through to the
    normal permission prompt rather than being silently authorized."""
    seg = strip_env_prefix(seg)
    try:
        toks = shlex.split(seg, posix=True)
    except ValueError:
        return None
    if not toks:
        return None
    name = os.path.basename(toks[0])
    spec = _RUNNER_SPECS.get(name)
    if spec is None:
        return None
    arg_opts, flags, positionals = spec
    i, n = 1, len(toks)
    while i < n:
        t = toks[i]
        if t == "--":
            i += 1
            break
        if not t.startswith("-") or t == "-":
            break  # first non-option token = positionals/command
        if t.startswith("--") and "=" in t:
            if t.split("=", 1)[0] in arg_opts or t.split("=", 1)[0] in flags:
                i += 1
                continue
            return None
        if name == "nice" and re.fullmatch(r"-\d+", t):  # deprecated `nice -10 CMD`
            i += 1
            continue
        if len(t) > 2 and t[:2] in arg_opts:  # attached arg, e.g. -I{}, -n2
            i += 1
            continue
        if t in arg_opts:
            i += 2  # option consumes the following token
            continue
        if t in flags:
            i += 1
            continue
        return None  # unrecognized option -> bail
    for _ in range(positionals):
        if i >= n:
            return None
        i += 1
    if i >= n:
        return None  # no inner command
    return " ".join(shlex.quote(x) for x in toks[i:])


def matches_rule(seg: str, rule: str) -> bool:
    if rule == seg:
        return True
    # Both `Bash(name *)` and `Bash(name:*)` forms denote "name with any args".
    for suffix in (" *", ":*"):
        if rule.endswith(suffix):
            prefix = rule[: -len(suffix)]
            if seg == prefix or seg.startswith(prefix + " "):
                return True
    # Interior-wildcard rules (e.g. `git -C /tmp/* rebase *` to permit rebase in
    # any /tmp worktree) are matched as a glob. Only engaged when the rule has a
    # '*' that the trailing-suffix logic above doesn't already cover, so plain
    # `cmd *` / `cmd:*` rules keep their exact prefix semantics.
    if has_interior_glob(rule) and fnmatch.fnmatchcase(seg, rule):
        return True
    return False


def has_interior_glob(rule: str) -> bool:
    """True iff `rule` contains a '*' beyond the trailing ` *` / `:*` suffix."""
    return "*" in rule.rstrip("* ").rstrip(":")


def is_segment_allowed(seg: str, rules: list[str], safe: set[str], base_cwd: str | None = None) -> tuple[bool, str]:
    if not seg:
        return True, "empty"
    for r in rules:
        if matches_rule(seg, r):
            kind = "glob-rule" if has_interior_glob(r) else "rule"
            return True, f"{kind}:{r!r}"
    stripped = strip_env_prefix(seg)
    if stripped != seg:
        for r in rules:
            if matches_rule(stripped, r):
                return True, f"rule(env-stripped):{r!r}"
    git_norm = normalize_git_prefix(stripped)
    if git_norm != stripped:
        for r in rules:
            if matches_rule(git_norm, r):
                return True, f"rule(git-normalized):{r!r}"
    binary = first_binary(seg)
    if binary in DENY_BINARIES:
        return False, f"deny-binary:{binary}"
    if binary and binary in safe:
        return True, f"safe-command:{binary}"
    if binary == "flock":
        payload = unwrap_flock(seg)
        if payload is not None:
            inner = split_compound(payload)
            if inner is None:
                return False, "flock payload has risky tokens"
            if not inner:
                return False, "flock payload empty"
            for s in inner:
                ok, why = is_segment_allowed(s, rules, safe, base_cwd)
                if not ok:
                    return False, f"flock payload segment rejected: {s!r} ({why})"
            return True, f"flock-wrapped ({len(inner)} inner segment(s) allowed)"
    if binary in _RUNNER_SPECS:
        inner = unwrap_runner(seg)
        if inner is not None:
            ok, why = is_segment_allowed(inner, rules, safe, base_cwd)
            if ok:
                return True, f"{binary}-wrapped ({why})"
            return False, f"{binary} payload rejected: {inner!r} ({why})"
    # Location-based grant (shared with allow-project-scripts.py): a segment
    # that runs a script living inside the enclosing project is allowed even
    # without an interpreter allow-rule. DENY_BINARIES already returned above,
    # so this can't resurrect rm/mv/etc.
    if base_cwd is not None:
        resolved = resolve_project_local_script(seg, base_cwd)
        if resolved is not None:
            return True, f"project-local-script:{resolved}"
    return False, f"unmatched (binary={binary!r})"


def leading_cd_base(segments: list[str], payload_cwd: str) -> str:
    """Effective base cwd for resolving relative script paths in later
    segments. A leading `cd <dir>` (the `cd proj && npx tsx scripts/x.ts`
    idiom) moves it; otherwise the tool's own cwd applies. Only the FIRST
    segment is honoured — a `cd` deeper in the chain can't be attributed to a
    later segment without tracking the join operators, and the location check
    downstream still requires the script to live under a real project root."""
    if not segments:
        return payload_cwd
    try:
        toks = shlex.split(segments[0], posix=True)
    except ValueError:
        return payload_cwd
    if len(toks) >= 2 and toks[0] == "cd":
        target = toks[1]
        if os.path.isabs(target):
            return os.path.realpath(target)
        return os.path.realpath(os.path.join(payload_cwd, target))
    return payload_cwd


def analyze(cmd: str, rules: list[str], safe: set[str], cwd: str | None = None) -> tuple[bool, str]:
    segments = split_compound(cmd)
    if segments is None:
        return False, "unparseable (risky tokens or unbalanced quotes/parens)"
    if not segments:
        return False, "empty command"
    base_cwd = leading_cd_base(segments, cwd or os.getcwd())
    if len(segments) == 1:
        # Single segment: only emit `allow` when normalization (env-prefix or
        # git-prefix) was required, the command was flock-wrapped, or it matched
        # an interior-glob rule — Claude Code's matcher already handles the
        # direct-rule and safe-list cases via its allowlist, but may not support
        # interior-glob patterns. Surfacing the hook only for these cases avoids
        # shadowing Claude Code's normal flow and avoids over-permitting
        # safe-list singles that lack an explicit rule.
        seg = segments[0]
        ok, why = is_segment_allowed(seg, rules, safe, base_cwd)
        debug(f"  single {seg!r} -> {ok} ({why})")
        if ok and ("env-stripped" in why or "git-normalized" in why
                   or "-wrapped" in why or "glob-rule" in why
                   or "project-local-script" in why):
            return True, f"single (normalized) — {why}"
        return False, "single command — let normal flow decide"
    for seg in segments:
        ok, why = is_segment_allowed(seg, rules, safe, base_cwd)
        debug(f"  segment {seg!r} -> {ok} ({why})")
        if not ok:
            return False, f"segment rejected: {seg!r} ({why})"
    return True, f"{len(segments)} segments individually allowed"


def emit_allow(reason: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "allow",
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
    cwd = payload.get("cwd") or os.getcwd()
    rules = load_allow_rules()
    safe = load_safe_commands()
    debug(f"command: {cmd!r}")
    ok, why = analyze(cmd, rules, safe, cwd)
    debug(f"decision: {'ALLOW' if ok else 'silent'} — {why}")
    if ok:
        emit_allow(why)
    sys.exit(0)


def run_test(args: list[str]) -> None:
    if args:
        cmd = args[0]
    else:
        cmd = sys.stdin.read()
    rules = load_allow_rules()
    safe = load_safe_commands()
    segs = split_compound(cmd)
    print(f"split: {segs!r}")
    if segs is None:
        print("decision: pass-through — unparseable")
        sys.exit(2)
    base_cwd = leading_cd_base(segs, os.getcwd())
    for seg in segs:
        ok, why = is_segment_allowed(seg, rules, safe, base_cwd)
        marker = "OK " if ok else "NO "
        print(f"  {marker} {seg!r}  [{why}]")
    ok, why = analyze(cmd, rules, safe, os.getcwd())
    print(f"decision: {'ALLOW' if ok else 'pass-through'} — {why}")
    sys.exit(0 if ok else 1)


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
    except Exception as e:
        debug(f"error: {e}")
        sys.exit(0)
