---
metadata:
  version: 1.0.0
---

## Capability

Ambient inputs and isolation invariants for every security-remediation technique.

## Inputs

### target_path

Path to the target checkout. All git operations (remote configuration, branch, push) run inside this directory.

### planning_folder_path

Absolute path to this run's private planning folder; each technique reads prior artifacts from, and writes its own artifact into, this folder.

### branch_name

Name of the local security feature branch the fix is developed on.

### sec_vuln_url

URL of the private security advisory being remediated, behind restricted access.

### private_fork_url

URL of the private fork that backs the `security` git remote.

## Rules

### private-remote-only

Every git push targets the `security` remote that points at the private fork, never `origin`. The `security` remote is the only sanctioned destination for any commit produced in this workflow.

### no-public-disclosure

No public GitHub PR or Issue tool is invoked at any point — `gh pr create`, `gh pr ready`, `gh pr review`, and `gh issue create` are prohibited. Planning artifacts omit any public PR or Issue link.
