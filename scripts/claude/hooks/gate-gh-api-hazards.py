#!/usr/bin/env python3
"""
PreToolUse hook for Bash: prompt before `gh api` calls that carry real
consequence, and let routine writes through.

A broad `Bash(gh api:*)` allow rule auto-approves every `gh api` invocation.
This hook narrows that grant: it parses each `gh api` segment, classifies the
request, and forces a permission prompt (permissionDecision "ask") for the
subset that is hard to undo, grants standing access, or is visible outside the
repository. Reads and routine writes — opening and editing pull requests and
issues, comments, reviews, labels, assignees, milestones — fall through to the
allow rule and auto-approve.

A request prompts when any of these holds:

  * a segment of the endpoint path is in SENSITIVE_SEGMENTS. That set covers
    secrets and variables, deploy keys and webhooks, collaborators, branch
    protection and rulesets, environments, the whole `actions` and `git`
    subtrees, direct `contents` commits, merges, releases, pages, deployments,
    commit statuses and checks, and the org / team / app / admin namespaces.
  * the method is DELETE and the path is not one of CHEAP_DELETES — a comment,
    reaction, label assignment, assignee, review request, lock, or
    subscription, each of which one further call recreates.
  * the endpoint is a bare `repos/<owner>/<repo>` under a non-read method: that
    endpoint edits repository settings, including visibility and the archived
    flag, or deletes the repository outright.
  * the endpoint or the method cannot be read off the command line.
  * the request is a GraphQL mutation, or a GraphQL call whose document is not
    inline and so cannot be shown to be a query.

Method resolution mirrors gh: an explicit -X / --method wins in any spelling
(-X POST, -XPOST, --method POST, --method=POST); with no method flag, gh sends
POST when a field flag is present (-f / -F / --field / --raw-field / --input)
and GET otherwise.

Endpoint matching treats `{owner}` and `{repo}` as ordinary path segments, so
gh's placeholder form classifies the same as a literal path — a merge via
`repos/{owner}/{repo}/pulls/1/merge` prompts just as the spelled-out path does.

Sensitivity is a property of the operation, not of who owns the target: a write
classifies the same in any repository. Add an owner check here if writes to
repositories outside a trusted set should also prompt.

Errors resolve to a prompt. An unparseable command, an absent endpoint, an
unrecognized method, and an internal fault all ask, because falling through
would hand the write to the blanket allow rule.

Dry-run: python3 gate-gh-api-hazards.py --test 'gh api repos/o/r -f x=1'
"""
from __future__ import annotations

import fnmatch
import json
import shlex
import sys

CONTROL = frozenset({"&&", "||", "|", ";", "&", "\n"})
READ_METHODS = frozenset({"GET", "HEAD"})
KNOWN_METHODS = frozenset({"GET", "HEAD", "POST", "PATCH", "PUT", "DELETE"})
FIELD_FLAGS = frozenset({"-f", "-F", "--field", "--raw-field", "--input"})
FIELD_PREFIXES = ("--field=", "--raw-field=", "--input=")

# gh api flags that consume the following token. Anything else starting with
# '-' is a boolean flag, and `--flag=value` carries its value inline, so the
# first token surviving this filter is the endpoint.
VALUE_FLAGS = frozenset({
    "-X", "--method", "-f", "--field", "-F", "--raw-field",
    "-H", "--header", "-q", "--jq", "-t", "--template",
    "-p", "--preview", "--cache", "--hostname", "--input",
})

# Path segments that mark an area where a write grants standing access, changes
# what CI or the published surface does, or rewrites shared history. Matching
# by segment rather than by (method, path) pair keeps an endpoint nobody
# enumerated here on the prompting side as long as it lives under a name that
# is already known to be sensitive.
SENSITIVE_SEGMENTS = frozenset({
    # CI, automation, and everything reachable under them
    "actions", "workflows", "runners", "permissions", "dispatches",
    "deployments", "environments", "codespaces", "dependabot",
    # git plumbing: refs, force-moves, and direct commits
    "git", "contents", "merge", "merges",
    # published surface
    "releases", "pages", "statuses", "check-runs", "check-suites",
    # access control and credentials
    "secrets", "variables", "keys", "gpg_keys", "ssh_signing_keys",
    "hooks", "collaborators", "protection", "rulesets", "memberships",
    "invitations", "emails", "blocks", "transfer",
    # security reporting and policy
    "security-advisories", "vulnerability-alerts",
    "automated-security-fixes", "private-vulnerability-reporting",
    "interaction-limits",
    # namespaces whose writes reach beyond one repository
    "orgs", "teams", "admin", "enterprises", "scim",
    "app", "apps", "applications", "authorizations",
    "installation", "installations",
})

# DELETE targets that one further API call recreates. Reached only for paths
# that cleared SENSITIVE_SEGMENTS, so these are all issue and pull-request
# metadata.
CHEAP_DELETES = (
    "repos/*/*/issues/comments/*",
    "repos/*/*/issues/comments/*/reactions/*",
    "repos/*/*/issues/*/labels",
    "repos/*/*/issues/*/labels/*",
    "repos/*/*/issues/*/assignees",
    "repos/*/*/issues/*/lock",
    "repos/*/*/issues/*/reactions/*",
    "repos/*/*/pulls/comments/*",
    "repos/*/*/pulls/comments/*/reactions/*",
    "repos/*/*/pulls/*/requested_reviewers",
    "repos/*/*/comments/*",
    "repos/*/*/comments/*/reactions/*",
    "repos/*/*/subscription",
    "user/starred/*/*",
    "user/subscriptions/*/*",
)


def _graphql_is_write(args: list[str]) -> bool:
    """For `gh api graphql`, a request is a READ unless the GraphQL document is
    a mutation. gh sends every graphql call over POST, so the field-flag
    heuristic misfires (a `-f query='...'` read looks like a write). Decide on
    the operation type instead: locate the inline `query=` field value and
    treat it as a write only when it opens with `mutation`.

    A graphql call with no inline query (e.g. `--input file.graphql`) can't be
    proven a read from the command line, so it counts as a write and prompts.
    """
    for t in args:
        idx = t.find("query=")
        if idx != -1:
            doc = t[idx + len("query="):]
            return doc.lstrip().lower().startswith("mutation")
    return True


def resolve_method(args: list[str]) -> str:
    """The HTTP method gh will send, given the tokens after `gh api`."""
    method: str | None = None
    has_field = False
    i = 0
    n = len(args)
    while i < n:
        t = args[i]
        if t in ("-X", "--method"):
            if i + 1 < n:
                method = args[i + 1]
                i += 2
                continue
        elif t.startswith("-X") and len(t) > 2:
            method = t[2:]
        elif t.startswith("--method="):
            method = t.split("=", 1)[1]
        elif t in FIELD_FLAGS or t.startswith(FIELD_PREFIXES):
            has_field = True
        elif (t.startswith("-f") or t.startswith("-F")) and len(t) > 2:
            has_field = True  # combined short form, e.g. -fkey=val
        i += 1
    if method:
        return method.strip().upper()
    return "POST" if has_field else "GET"


def normalize_endpoint(raw: str) -> str:
    """Reduce an endpoint argument to a bare `a/b/c` path.

    gh accepts a path, a full api.github.com URL, or a GitHub Enterprise URL
    carrying an `/api/v3` mount point; a query string may follow any of them.
    """
    ep = raw.split("?", 1)[0].split("#", 1)[0]
    if "://" in ep:
        ep = ep.split("://", 1)[1]
        ep = ep.split("/", 1)[1] if "/" in ep else ""
        for prefix in ("api/v3/", "api/"):
            if ep.startswith(prefix):
                ep = ep[len(prefix):]
                break
    return ep.strip("/")


def endpoint_of(args: list[str]) -> str | None:
    """The first positional argument after `gh api`, normalized."""
    i = 0
    n = len(args)
    while i < n:
        t = args[i]
        if t == "--":
            i += 1
            continue
        if t.startswith("-") and t != "-":
            i += 2 if t in VALUE_FLAGS else 1
            continue
        ep = normalize_endpoint(t)
        return ep or None
    return None


def classify(args: list[str]) -> str | None:
    """Why this request must prompt, or None when it may fall through."""
    if args and args[0] == "graphql":
        if _graphql_is_write(args[1:]):
            return "the GraphQL document is a mutation, or is not inline and so cannot be shown to be a query"
        return None
    method = resolve_method(args)
    if method in READ_METHODS:
        return None
    if method not in KNOWN_METHODS:
        return f"the method {method!r} is unrecognized"
    ep = endpoint_of(args)
    if ep is None:
        return "the endpoint is absent from the command line"
    segs = ep.split("/")
    hit = next((s for s in segs if s.lower() in SENSITIVE_SEGMENTS), None)
    if hit is not None:
        return f"the path segment {hit!r} names a sensitive area"
    if len(segs) == 3 and segs[0] == "repos":
        return "this endpoint edits repository settings or deletes the repository"
    if method == "DELETE" and not any(
        fnmatch.fnmatchcase(ep, g) for g in CHEAP_DELETES
    ):
        return "DELETE removes something that a single call does not recreate"
    return None


def gh_api_prompt_segments(cmd: str) -> list[tuple[str, str]] | None:
    """The `gh api ...` windows that must prompt, each with its reason.

    None signals that the command did not parse, which itself prompts.
    """
    try:
        toks = shlex.split(cmd, posix=True)
    except ValueError:
        return None
    flagged: list[tuple[str, str]] = []
    i = 0
    n = len(toks)
    while i < n:
        if toks[i] == "gh" and i + 1 < n and toks[i + 1] == "api":
            j = i + 2
            args: list[str] = []
            while j < n and toks[j] not in CONTROL:
                args.append(toks[j])
                j += 1
            reason = classify(args)
            if reason is not None:
                flagged.append(("gh api " + " ".join(args), reason))
            i = j
            continue
        i += 1
    return flagged


def ask(detail: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "ask",
            "permissionDecisionReason": (
                "A broad `Bash(gh api:*)` allow auto-approves reads and routine "
                "writes; this call is held back for confirmation because "
                + detail
                + "."
            ),
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
    if "gh" not in cmd or "api" not in cmd:
        sys.exit(0)
    flagged = gh_api_prompt_segments(cmd)
    if flagged is None:
        ask("the command does not parse, so the request cannot be classified")
    if flagged:
        ask("; ".join(f"{seg} — {why}" for seg, why in flagged))
    sys.exit(0)


def run_test(args: list[str]) -> None:
    cmd = args[0] if args else sys.stdin.read()
    flagged = gh_api_prompt_segments(cmd)
    if flagged is None:
        print("ASK — unparseable command")
        sys.exit(1)
    if flagged:
        for seg, why in flagged:
            print(f"ASK — {seg}\n      reason: {why}")
        sys.exit(1)
    print("PASS — read, routine write, or no gh api call")
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
    except Exception as exc:  # fail toward the prompt, never toward the write
        ask(f"the hook raised {type(exc).__name__} while classifying the call")
