---
id: remediation-playbook
version: 1.0.0
---

# CI/CD Security Remediation Playbook

Per-pattern remediation guidance with before/after examples. Prioritized by severity and implementation effort.

## Immediate Actions (Critical/High Findings)

### P2 — Pwn Request Remediation

**Problem**: `pull_request_target` workflow checks out fork code and executes it with repository secrets.

**Option A — Split into two workflows** (recommended):

```yaml
# BEFORE (vulnerable):
on: pull_request_target
steps:
  - uses: actions/checkout@v4
    with:
      ref: ${{ github.event.pull_request.head.sha }}
  - run: go run ./scripts/check.go

# AFTER (safe):
# Workflow 1: Build artifacts from fork code (no secrets)
on: pull_request
steps:
  - uses: actions/checkout@v4
  - run: go run ./scripts/check.go
  # Upload results as artifact

# Workflow 2: Use artifacts with secrets (no fork code)
on: workflow_run
  workflows: ["PR Check"]
  types: [completed]
steps:
  # Download artifacts — never checkout fork code
  - uses: actions/download-artifact@v4
```

**Option B — Remove fork checkout** (if you only need base branch code):

```yaml
# AFTER: Only checkout the base branch (default for pull_request_target)
on: pull_request_target
steps:
  - uses: actions/checkout@v4  # No ref: — checks out base branch
  - run: ./scripts/safe-check.sh
```

### P1 — Expression Injection Remediation

**Problem**: Untrusted `${{ }}` expressions interpolated into shell commands.

```yaml
# BEFORE (vulnerable):
- name: Check PR title
  run: |
    title="${{ github.event.pull_request.title }}"
    echo "Checking: $title"

# AFTER (safe — use environment variables):
- name: Check PR title
  env:
    PR_TITLE: ${{ github.event.pull_request.title }}
  run: |
    echo "Checking: $PR_TITLE"
```

**Key principle**: Environment variables are set before the shell script runs and are not subject to shell expansion. The `${{ }}` expression is evaluated by the Actions runtime and placed into the environment, not interpolated into the shell command text.

### P3 — Comment Trigger Remediation

**Problem**: Comment-triggered workflows execute without verifying the commenter's identity.

```yaml
# BEFORE (vulnerable):
on:
  issue_comment:
    types: [created]
jobs:
  deploy:
    if: contains(github.event.comment.body, '/deploy')
    # Any GitHub user can trigger this

# AFTER (safe — add author_association check):
on:
  issue_comment:
    types: [created]
jobs:
  deploy:
    if: >-
      contains(github.event.comment.body, '/deploy') &&
      (
        github.event.comment.author_association == 'MEMBER' ||
        github.event.comment.author_association == 'OWNER' ||
        github.event.comment.author_association == 'COLLABORATOR'
      )
```

---

## Short-Term Actions (Medium Findings)

### P4 — Permission Scoping

**Problem**: Workflows have broader permissions than necessary.

```yaml
# BEFORE (overly broad):
on: pull_request_target
# No permissions block — inherits repository defaults

# AFTER (principle of least privilege):
on: pull_request_target
permissions:
  contents: read
  pull-requests: read
```

**Rule of thumb**: Start with `permissions: {}` (no permissions) and add only what the workflow actually needs. Common minimal sets:

| Workflow Purpose | Permissions Needed |
|-----------------|-------------------|
| CI checks (build, test, lint) | `contents: read` |
| PR status checks | `contents: read`, `statuses: write` |
| PR comments (bot) | `contents: read`, `pull-requests: write` |
| Release publishing | `contents: write`, `packages: write` |
| GitHub Pages deploy | `pages: write`, `id-token: write` |

### P5 — Fork Code Execution Isolation

**Problem**: Fork code is checked out and executed in a context with secret access.

**Remediation options**:

1. **Use `pull_request` instead of `pull_request_target`** — `pull_request` from forks does not have access to secrets
2. **If `pull_request_target` is required**, do not check out fork code — use the base branch
3. **If fork code must be analyzed**, use a read-only step (e.g., diff analysis) without executing it
4. **Use workflow_run** to split the execution: run untrusted code in a restricted context, then pass artifacts to a privileged context

---

## Long-Term Actions (Low Findings / Hardening)

### P6 — AI Config Protection

**Problem**: AI configuration files can be modified via PR without mandatory review.

```
# Add to CODEOWNERS:
CLAUDE.md @org/security-team
.claude/ @org/security-team
AGENTS.md @org/security-team
.cursorrules @org/security-team
.cursor/rules/ @org/security-team
.github/copilot-instructions.md @org/security-team
```

Also ensure branch protection requires CODEOWNERS review approval before merge.

### P7 — Dangerous Pattern Hardening

**Problem**: `curl | bash` and similar patterns in workflows or scripts.

**Remediation options**:

1. **Pin tool installations** to specific versions with checksum verification
2. **Use official GitHub Actions** instead of curl-based installers (e.g., `actions/setup-go` instead of `curl | bash`)
3. **Vendor scripts** instead of downloading at runtime
4. **If curl | bash is necessary**, verify the URL is hardcoded (not from `${{ }}`), uses HTTPS, and points to a trusted domain

### Network Egress Monitoring

While not a specific detection pattern, consider:

- Restrict outbound network access from CI runners (e.g., using StepSecurity Harden-Runner)
- Monitor for unexpected outbound connections during CI runs
- Use self-hosted runners with network policies for sensitive workflows

---

## Remediation Priority Matrix

| Severity | Timeline | Action |
|----------|----------|--------|
| Critical | Immediate (24h) | Fix or disable the affected workflow |
| High | Short-term (1 week) | Implement remediation and verify |
| Medium | Medium-term (1 sprint) | Schedule remediation in backlog |
| Low | Long-term (quarterly) | Include in hardening roadmap |

## Verification After Remediation

After applying fixes, re-run the CI/CD pipeline security audit workflow against the affected submodule to verify:

1. The original finding no longer triggers
2. No new findings were introduced by the fix
3. The workflow still functions correctly (functional testing)
