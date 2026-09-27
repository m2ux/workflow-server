#!/usr/bin/env python3
"""Identify interpreter invocations that require scripts/sbx.

Inline programs and scratch scripts inside writable sandbox roots receive a
corrective denial. Project-local script execution uses project_scripts.py."""
from __future__ import annotations

from contracts import Decision

import compound_bash_allow as compound
import os
import shlex
import sys

from project_scripts import (
    INTERPRETERS,
    extract_script_token,
    resolve_project_local_script,
)
from permissions import SBX

# interpreter basename -> inline-eval flags that mean "arbitrary code follows".
# Exact-token match, plus the space-less combined form (e.g. `-cCODE`).
EVAL_FLAGS = {
    "python": ("-c",), "python2": ("-c",), "python3": ("-c",),
    "node": ("-e", "-p", "--eval", "--print"),
    "nodejs": ("-e", "-p", "--eval", "--print"),
    "perl": ("-e", "-E"),
    "ruby": ("-e",),
    "php": ("-r",),
    "bun": ("-e",),
    "Rscript": ("-e",),
}

# Subcommand-style eval: basename -> first-arg subcommand that means eval.
EVAL_SUBCOMMANDS = {"deno": ("eval",)}

# Interpreters that take the program itself from stdin, given a bare `-` in the
# program position or no program argument at all.
STDIN_PROGRAM = frozenset({
    "python", "python2", "python3",
    "node", "nodejs",
    "perl", "ruby", "php", "bun",
})

# Flag-only invocations that print and exit without reading a program. Excluded
# so version/help probes fall through to the normal flow instead of a redirect.
INFO_FLAGS = frozenset({
    "-V", "--version", "-h", "--help", "-v",
    "--v8-options", "--print-config",
})

ALREADY_WRAPPED = frozenset({"sbx", "bwrap"})






def _writable_roots(base_cwd: str) -> list[str]:
    from redirect_fs_mutation import writable_roots
    return writable_roots(base_cwd)


def _inside(path: str, roots: list[str]) -> bool:
    return any(path == r or path.startswith(r + os.sep) for r in roots)


def _unwrap_runners(seg: str, cba) -> str:
    """Peel `nice` / `timeout` / `xargs` wrappers so the inner command is what
    gets judged, the way compound_bash_allow.py checks its own rules. Without
    this, `timeout 240 bash /tmp/x.sh` reads as a `timeout` invocation and slips
    past both detectors."""
    for _ in range(4):
        inner = cba.unwrap_runner(seg)
        if not inner:
            return seg
        seg = inner
    return seg


def _has_eval_flag(tokens: list[str], flags: tuple[str, ...]) -> bool:
    for t in tokens[1:]:
        if t in flags:
            return True
        # space-less combined short form, e.g. `-cCODE`, `-eCODE`
        for f in flags:
            if len(f) == 2 and f.startswith("-") and t.startswith(f) and len(t) > 2:
                return True
    return False


def _reads_program_from_stdin(tokens: list[str], binary: str) -> bool:
    """True when this interpreter will read its program text from stdin.

    Two spellings, both equivalent to -c/-e inline eval:
      * bare `-` in the program position — `python3 - <<'EOF'`, `php -f -`
      * no program argument at all       — `python3 <<'EOF'`, `cat x.py | node`

    The allow hook excises a quoted heredoc body and splits on `|` before rule
    matching, so the redirection itself is already gone by the time a segment
    reaches this hook — the shape of interpreter+args is all there is to judge.

    Position handling is deliberately coarse, erring toward the sandbox on the
    dash form and toward the prompt on the no-program form:
      * a bare `-` ANYWHERE counts, so a `-` that is really a script's own
        argument (`python3 tool.py -`) gets redirected to sbx, where it runs
        unchanged;
      * an option consuming a SEPARATE value (`python3 -W ignore`) reads as
        "has a program" and falls open to the normal prompt.
    """
    if binary not in STDIN_PROGRAM:
        return False
    args = tokens[1:]
    if any(t == "-" for t in args):
        return True
    if any(t in INFO_FLAGS for t in args):
        return False
    return all(t.startswith("-") for t in args)


def segment_needs_sandbox(seg: str, cba) -> bool:
    seg = cba.strip_env_prefix(_unwrap_runners(seg, cba))
    try:
        tokens = shlex.split(seg, posix=True)
    except ValueError:
        return False
    if not tokens:
        return False
    binary = os.path.basename(tokens[0])
    if binary in ALREADY_WRAPPED:
        return False
    if binary in EVAL_FLAGS and _has_eval_flag(tokens, EVAL_FLAGS[binary]):
        return True
    if _reads_program_from_stdin(tokens, binary):
        return True
    subs = EVAL_SUBCOMMANDS.get(binary)
    if subs and len(tokens) > 1 and tokens[1] in subs:
        return True
    # `deno run -` is stdin eval; `deno run <file>` is a file the location hook vets.
    if binary == "deno" and len(tokens) > 1 and tokens[1] == "run" and "-" in tokens[2:]:
        return True
    return False


def segment_runs_unvetted_script(seg: str, cba, base_cwd: str, roots: list[str]) -> bool:
    """True when the segment runs a script file the sandbox can execute but the
    location check will not auto-allow — in practice a scratch script under /tmp.

    A project-local target returns False: compound_bash_allow.py already approves
    that bare, so redirecting it would cost a round trip and buy nothing.
    """
    seg = cba.strip_env_prefix(_unwrap_runners(seg, cba))
    try:
        tokens = shlex.split(seg, posix=True)
    except ValueError:
        return False
    if not tokens:
        return False
    b0 = os.path.basename(tokens[0])
    if b0 in ALREADY_WRAPPED:
        return False
    npx_runner = b0 == "npx" and len(tokens) > 1 and tokens[1] in ("tsx", "ts-node")
    if b0 not in INTERPRETERS and not npx_runner:
        return False
    script = extract_script_token(tokens)
    if script is None:
        return False
    p = script if os.path.isabs(script) else os.path.join(base_cwd, script)
    resolved = os.path.realpath(p)
    if not os.path.isfile(resolved) or not _inside(resolved, roots):
        return False
    return resolve_project_local_script(seg, base_cwd) is None


def find_needs_sandbox(cmd: str, cwd: str) -> str | None:
    """"eval", "script", or None when nothing needs redirecting."""
    cba = compound
    segments = cba.split_compound(cmd)
    if not segments:  # None (risky tokens / unbalanced) or empty
        return None
    if any(segment_needs_sandbox(s, cba) for s in segments):
        return "eval"
    base_cwd = cba.leading_cd_base(segments, cwd)
    roots = _writable_roots(base_cwd)
    if any(segment_runs_unvetted_script(s, cba, base_cwd, roots) for s in segments):
        return "script"
    return None


def deny(kind: str = "eval") -> Decision:
    if kind == "script":
        reason = (
            "Blocked before the permission prompt: this runs a script that carries "
            "no allow rule. The location check auto-approves an interpreter only "
            "when its target file sits inside the project root, and this target does "
            "not — but it does lie inside a root the sandbox binds read-write, so it "
            "runs there unchanged. Re-issue the command with that segment prefixed "
            "by the sandbox launcher " + SBX + " — e.g. `" + SBX + " bash "
            "/tmp/scratch/x.sh`. The prefixed form is allowlisted and auto-approves "
            "with no prompt, and in a compound chain it restores auto-approval for "
            "the whole chain. Prefix ONLY that segment; leave the rest of the chain "
            "as written. If the script needs the NETWORK, or must write outside the "
            "project and /tmp, the sandbox blocks it — say so and use the bare form."
        )
        return Decision('deny', reason)
    reason = (
        "Blocked before the permission prompt: this runs an un-sandboxed inline "
        "interpreter — either an eval flag (python -c / node -e / perl -e ...) "
        "or a program read from stdin (`python3 - <<'EOF'`, `python3 <<'EOF'`, "
        "`cat x.py | node`) — which is not "
        "allowlisted and has no safe un-sandboxed use. Re-issue the command "
        "prefixed with the sandbox launcher " + SBX + " — e.g. `" + SBX + " "
        "node -e '...'`, `" + SBX + " python3 -c '...'`, or `" + SBX + " "
        "python3 - <<'EOF'`. It runs under "
        "bubblewrap with the active project and /tmp "
        "read-write, the rest of the filesystem read-only, and no network, and "
        "it auto-approves with no prompt. If the code needs the NETWORK, the "
        "sandbox blocks it — that logic belongs in a committed project script, "
        "not an inline one-liner."
    )
    return Decision('deny', reason)




def run_test(args: list[str]) -> None:
    cmd = args[0] if args else sys.stdin.read()
    kind = find_needs_sandbox(cmd, os.getcwd())
    if kind == "eval":
        print("DENY — inline eval; redirect to sbx")
        sys.exit(1)
    if kind == "script":
        print("DENY — script outside the project, inside a writable root; redirect to sbx")
        sys.exit(1)
    print("PASS — nothing to redirect")
    sys.exit(0)




if __name__ == "__main__":
    run_test(sys.argv[2:] if sys.argv[1:2] == ["--test"] else sys.argv[1:])
