---
metadata:
  version: 3.7.0
---

## Capability

GitHub PR and issue tasks. Callers Apply leaf ops; REST paths, `gh api` recipes, and owner/repo resolution live only in this namespace.

## Inputs

### repo_path

*(optional when `{target_repo}` is set)* Working tree whose `origin` remote names the repository a call addresses.

### target_repo

*(optional when `{repo_path}` is set on the leaf)* GitHub repository as `owner/repo`.

## Rules

### rest-only

Every GitHub read and write in this technique is a `gh api` call against a REST path. High-level `gh pr` and `gh issue` subcommands are outside this technique.

### paginate-a-counted-list

A list endpoint answers with one page — 30 items — unless the call asks for more, and a truncated page reads exactly like a complete one. So any list call whose **count** is load-bearing paginates: pass `--paginate`, and state the page size where the endpoint takes one. A figure taken from an unpaginated list is wrong for its own subject rather than merely out of date, and it carries that wrongness into whatever artifact records it.

### authored-prose-by-file

A title or a body is text somebody wrote, so it can carry a double quote, a backtick or a newline. Interpolated into a command it ends the quoted string early and the rest of the sentence reaches the shell as arguments. Every such value is written to a temp file and passed as `-F <field>=@<file>`; no technique here splices one into a command. A value the caller cannot author freely — a number, a branch name, a label, an enum — is placed inline.

### github-access-only-here

Outside this namespace, GitHub access is an Apply of a leaf op. Domain techniques do not embed `gh api` recipes or split `{target_repo}` into owner/repo.

### ask-before-replying

Ask the user before replying to PR comments or review feedback.

### host-shell-for-gh

Every `gh` invocation runs on the host shell — host credentials, host network, and host SSH agent. Isolated execution environments that block those are outside this technique. `GH_TOKEN` and `GITHUB_TOKEN` stay unset unless a known-good PAT is intentionally supplied. An isolation denial is not a credential failure.
