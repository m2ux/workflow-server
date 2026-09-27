#!/usr/bin/env python3
"""Classify read-only curl commands against config/curl-allow.json.

Every command segment must be an allowed curl invocation or an inert helper.
The URL host and configured path prefixes must both match."""
from __future__ import annotations

import json
import os
import re
import shlex
import sys
from pathlib import Path
from urllib.parse import urlsplit

def _config_path() -> Path:
    """config/curl-allow.json beside the directory that holds this script."""
    return Path(__file__).resolve().parent.parent / "config" / "curl-allow.json"


CONFIG_PATH = _config_path()
DEFAULT_HOSTS = ("github.com", "raw.githubusercontent.com")

INERT = frozenset({"echo", "printf", "true", "false", ":"})

# Read-only stream filters permitted alongside a curl, so bounding a response
# with `| head -c 400` does not forfeit the grant. Each writes only to stdout
# and reaches no network. `sort` and `uniq` are absent: both accept an output
# file (`sort -o`, and uniq's second positional), so neither is read-only.
SHAPERS = frozenset({"head", "tail", "cut", "wc"})
RISKY = ("$(", "`", "<(", ">(")  # `<<` handled separately as a hard bail

# --- curl flag tables -------------------------------------------------------
# Long flags with NO argument (safe reads only).
LONG_BOOL = frozenset({
    "--silent", "--show-error", "--fail", "--fail-with-body", "--fail-early",
    "--location", "--head", "--verbose", "--progress-bar", "--no-progress-meter",
    "--compressed", "--get", "--globoff", "--ipv4", "--ipv6", "--remote-time",
    "--path-as-is", "--http1.0", "--http1.1", "--http2", "--http2-prior-knowledge",
    "--tlsv1.2", "--tlsv1.3", "--junk-session-cookies", "--styled-output",
    "--no-styled-output", "--no-buffer", "--include", "--sslv3-disable",
})
# Long flags that CONSUME the next token as a value (value is never a URL and
# needs no special validation).
LONG_VALUE = frozenset({
    "--write-out", "--header", "--user-agent", "--referer", "--cookie",
    "--range", "--max-time", "--connect-timeout", "--retry", "--retry-delay",
    "--retry-max-time", "--user", "--max-redirs", "--max-filesize",
    "--limit-rate", "--stderr",
})
# Short (single-char) flags with NO argument.
SHORT_BOOL = frozenset("sSfLIv#g46Rj0")
# Short flags that consume a value (value is not a URL).
SHORT_VALUE = frozenset("wHAebrmu")
# Special flags needing value inspection are handled inline: -o/--output,
# -D/--dump-header (must target /dev/null or stdout), -X/--request (method).

_REDIR = re.compile(r"^(?:&>|>&|\d*>>?|\d*<)")


def debug(*args: object) -> None:
    if os.environ.get("CURL_ALLOW_HOOK_DEBUG"):
        print("[curl-allow-hook]", *args, file=sys.stderr)


def _is_redirect(tok: str) -> bool:
    return bool(_REDIR.match(tok))


def _redirect_has_target(tok: str) -> bool:
    """True if the redirection token already carries its target, e.g. `2>&1`,
    `2>/dev/null`, `>file` — versus a bare operator (`>`, `2>`, `>&`) whose
    target is the following token."""
    m = _REDIR.match(tok)
    return m is not None and len(tok) > m.end()


def load_config() -> tuple[list[str], object]:
    """Return (allowedHosts, allowPrefixes). allowPrefixes is a per-host dict, a
    legacy flat list, or [] (no narrowing). Missing/malformed config falls back
    to DEFAULT_HOSTS with no prefix narrowing (all paths on those hosts)."""
    try:
        data = json.loads(CONFIG_PATH.read_text())
    except (FileNotFoundError, json.JSONDecodeError, OSError) as e:
        debug(f"config unavailable ({e}); using defaults")
        return list(DEFAULT_HOSTS), []
    raw_hosts = data.get("allowedHosts")
    if isinstance(raw_hosts, list):
        hosts = [str(h).strip() for h in raw_hosts if isinstance(h, str) and h.strip()]
    else:
        hosts = []
    hosts = hosts or list(DEFAULT_HOSTS)
    raw_pref = data.get("allowPrefixes")
    if isinstance(raw_pref, dict):
        prefixes: object = raw_pref  # per-host map, kept as-is
    elif isinstance(raw_pref, list):
        prefixes = [str(p).strip() for p in raw_pref if isinstance(p, str) and p.strip()]
    else:
        prefixes = []  # absent/malformed -> no narrowing
    return hosts, prefixes


def _url_host(u: str) -> str | None:
    try:
        s = urlsplit(u)
    except ValueError:
        return None
    if s.scheme.lower() not in ("http", "https"):
        return None  # require an explicit http(s) scheme; bail otherwise
    return s.hostname.lower() if s.hostname else None


def _host_allowed(host: str | None, allowed: list[str]) -> bool:
    if not host:
        return False
    host = host.lower()
    for a in allowed:
        a = a.lower()
        if a.startswith("."):
            if host == a[1:] or host.endswith(a):
                return True
        elif host == a:
            return True
    return False


def _lookup_host_rules(host: str, mapping: dict) -> object:
    """Return the rules list configured for `host` in a per-host allowPrefixes
    map, honoring the same "."-subdomain wildcard as allowedHosts. Returns the
    sentinel None when the host has no entry (→ caller treats as unrestricted)."""
    if not host:
        return None
    host = host.lower()
    for k, v in mapping.items():
        kl = str(k).lower()
        if kl.startswith("."):
            if host == kl[1:] or host.endswith(kl):
                return v
        elif host == kl:
            return v
    return None


def _rules_match(url: str, rules: object) -> bool:
    """True if `url` satisfies a host's rule list. A malformed/empty list or one
    containing "*" allows all; otherwise the URL PATH must start with a listed
    rule, or the full URL must start with an http(s):// rule."""
    if not isinstance(rules, list):
        return True  # malformed host entry -> don't narrow (host still gated)
    rules = [str(r) for r in rules if isinstance(r, str) and r]
    if not rules or "*" in rules:
        return True
    path = urlsplit(url).path or "/"
    for p in rules:
        if p.startswith(("http://", "https://")):
            if url.startswith(p):
                return True
        elif path.startswith(p):
            return True
    return False


def _prefix_allows(url: str, host: str | None, prefixes: object) -> bool:
    """Path-narrowing filter (see module docstring). Supports a per-host dict, a
    legacy flat list, and the no-narrowing empty case."""
    if not prefixes:
        return True  # no narrowing configured
    if isinstance(prefixes, dict):
        rules = _lookup_host_rules(host or "", prefixes)
        if rules is None:
            return True  # host not in map -> unrestricted (allowedHosts gates it)
        return _rules_match(url, rules)
    if isinstance(prefixes, list):  # legacy flat form: full-URL prefixes, any host
        if "*" in prefixes:
            return True
        return any(url.startswith(p) for p in prefixes)
    return True


def _strip_redirects(toks: list[str]) -> list[str]:
    out: list[str] = []
    i = 0
    while i < len(toks):
        t = toks[i]
        if _is_redirect(t):
            i += 1 if _redirect_has_target(t) else 2  # skip bare op + its target
            continue
        out.append(t)
        i += 1
    return out


def curl_segment_ok(seg: str, allowed: list[str], prefixes: object) -> bool:
    try:
        toks = _strip_redirects(shlex.split(seg, posix=True))
    except ValueError:
        return False
    if not toks or os.path.basename(toks[0]) != "curl":
        return False
    urls: list[str] = []
    method: str | None = None
    end_opts = False
    i, n = 1, len(toks)
    while i < n:
        t = toks[i]
        if end_opts:
            urls.append(t)
            i += 1
            continue
        if t == "--":
            end_opts = True
            i += 1
            continue
        if t.startswith("--"):
            name, _, inline = t.partition("=")
            has_eq = "=" in t

            def value() -> str | None:
                if has_eq:
                    return inline
                return toks[i + 1] if i + 1 < n else None

            step = 1 if has_eq else 2
            if name in LONG_BOOL:
                i += 1
                continue
            if name == "--url":
                v = value()
                if v is None:
                    return False
                urls.append(v)
                i += step
                continue
            if name == "--request":
                v = value()
                if v is None:
                    return False
                method = v
                i += step
                continue
            if name in ("--output",):
                if value() not in ("/dev/null", "-"):
                    return False
                i += step
                continue
            if name in ("--dump-header",):
                if value() != "/dev/null":
                    return False
                i += step
                continue
            if name in LONG_VALUE:
                if value() is None:
                    return False
                i += step
                continue
            return False  # unrecognized long flag -> bail
        if t.startswith("-") and t != "-":
            j = 1
            consumed_next = False
            while j < len(t):
                c = t[j]
                if c in SHORT_BOOL:
                    j += 1
                    continue
                rest = t[j + 1:]
                if c == "o":
                    v = rest if rest else (toks[i + 1] if i + 1 < n else None)
                    if v not in ("/dev/null", "-"):
                        return False
                elif c == "D":
                    v = rest if rest else (toks[i + 1] if i + 1 < n else None)
                    if v != "/dev/null":
                        return False
                elif c == "X":
                    v = rest if rest else (toks[i + 1] if i + 1 < n else None)
                    if v is None:
                        return False
                    method = v
                elif c in SHORT_VALUE:
                    if not rest and i + 1 >= n:
                        return False
                else:
                    return False  # unrecognized short flag -> bail
                if not rest:
                    consumed_next = True
                break  # value flag consumes the remainder of the bundle
            i += 2 if consumed_next else 1
            continue
        if t == "-":
            return False  # stdin sentinel; not a fetch we vet
        urls.append(t)
        i += 1
    if method is not None and method.upper() not in ("GET", "HEAD"):
        return False
    if not urls:
        return False
    for u in urls:
        h = _url_host(u)
        if not _host_allowed(h, allowed):
            return False
        if not _prefix_allows(u, h, prefixes):
            return False
    return True


def _has_risky(cmd: str) -> bool:
    in_s = in_d = False
    i, n = 0, len(cmd)
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
        for tok in RISKY:
            if cmd.startswith(tok, i):
                return True
        i += 1
    return False


def split_segments(cmd: str) -> list[str] | None:
    if "<<" in cmd or _has_risky(cmd):
        return None
    out: list[str] = []
    cur: list[str] = []
    in_s = in_d = False
    i, n = 0, len(cmd)
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
        if cmd[i:i + 2] in ("&&", "||"):
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
            # Don't split the `&` inside a redirection like `2>&1` / `>&2`.
            prev = next((cmd[j] for j in range(i - 1, -1, -1)
                         if not cmd[j].isspace() and not cmd[j].isdigit()), "")
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
    if in_s or in_d:
        return None
    if cur:
        out.append("".join(cur).strip())
    return [s for s in out if s]


def seg_binary(seg: str) -> str | None:
    try:
        toks = _strip_redirects(shlex.split(seg, posix=True))
    except ValueError:
        return None
    return os.path.basename(toks[0]) if toks else None


def analyze(cmd: str, allowed: list[str], prefixes: object) -> bool:
    segs = split_segments(cmd)
    if not segs:
        return False
    saw_curl = False
    for seg in segs:
        b = seg_binary(seg)
        if b == "curl":
            if not curl_segment_ok(seg, allowed, prefixes):
                debug(f"curl segment rejected: {seg!r}")
                return False
            saw_curl = True
        elif b in INERT or b in SHAPERS:
            continue
        else:
            debug(f"non-inert non-curl segment: {seg!r} (binary={b!r})")
            return False
    return saw_curl  # only act when there's at least one curl to vet






def run_test(args: list[str]) -> None:
    cmd = args[0] if args else sys.stdin.read()
    allowed, prefixes = load_config()
    print(f"allowedHosts: {allowed!r}")
    print(f"allowPrefixes: {prefixes!r}")
    segs = split_segments(cmd)
    print(f"split: {segs!r}")
    ok = analyze(cmd, allowed, prefixes)
    print(f"decision: {'ALLOW' if ok else 'pass-through (prompt)'}")
    sys.exit(0 if ok else 1)




if __name__ == "__main__":
    run_test(sys.argv[2:] if sys.argv[1:2] == ["--test"] else sys.argv[1:])
