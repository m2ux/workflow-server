"""Compose workspace classifiers with deny, ask, allow, abstain precedence."""

from urllib.parse import urlsplit

import block_dynamic_shell as dynamic
import compound_bash_allow as compound
import curl_read_allow as curl
import gate_gh_api_hazards as github
import redirect_fs_mutation as filesystem
import redirect_inline_eval as inline
import webfetch_allow as web
from contracts import ABSTAIN, Decision, Request
from permissions import load_policy


def evaluate(request: Request, permissions: dict | None = None) -> Decision:
    permissions = permissions if permissions is not None else load_policy()
    if request.kind == "fetch":
        host = urlsplit(request.value).hostname
        if host in permissions["webDomains"] or web.matches(request.value, web.load_prefixes()):
            return Decision("allow", "URL matches workspace web policy")
        return ABSTAIN
    if request.kind == "mcp":
        if any(request.value.startswith(f"mcp__{server}__") for server in permissions["mcpServers"]):
            return Decision("allow", "MCP server is allowed by workspace policy")
        return ABSTAIN
    if request.kind != "shell":
        return ABSTAIN

    command, cwd = request.value, request.cwd
    violations = dynamic.find_violations(command)
    if violations:
        return dynamic.deny(violations)
    kind = inline.find_needs_sandbox(command, cwd)
    if kind:
        return inline.deny(kind)
    redirects = filesystem.find_redirects(command, cwd)
    if redirects:
        return filesystem.deny(redirects)
    if "gh" in command and "api" in command:
        flagged = github.gh_api_prompt_segments(command)
        if flagged is None:
            return github.ask("the command cannot be classified")
        if flagged:
            return github.ask("; ".join(f"{segment}: {reason}" for segment, reason in flagged))

    rules = permissions["shell"]
    safe = compound.load_safe_commands()
    allowed, reason = compound.analyze(command, rules, safe, cwd)
    if allowed:
        return Decision("allow", reason)
    if "curl" in command and curl.analyze(command, *curl.load_config()):
        return Decision("allow", "Read-only curl matches workspace URL policy")
    return ABSTAIN
