---
id: start-here
version: 1.0.0
---

# CI/CD Pipeline Security Audit — Quick Reference

## Purpose

Detect source-to-sink injection vulnerabilities in GitHub Actions workflows across monorepo submodules. Based on the [hackerbot-claw campaign](https://www.stepsecurity.io/blog/hackerbot-claw-github-actions-exploitation) (Feb 2026) that exploited 7 major open-source projects using 5 distinct CI/CD injection techniques.

## Prerequisites

- Target submodule(s) specified (or "all")
- Submodules initialized and up to date

## Phases

| Phase | Activity | Output |
|-------|----------|--------|
| 1. Scope Setup | Discover targets, inventory workflow files | START-HERE.md |
| 2. Reconnaissance | Classify triggers, map permissions, assign agents | reconnaissance-summary.json |
| 3. Primary Scan | Dispatch scanners (S1-Sn), verify (V), merge (M) | merged-findings.json |
| 4. Report | Score severity, write report | 01-cicd-audit-report.md |

## Detection Patterns

| ID | Pattern | Source | Sink |
|----|---------|--------|------|
| P1 | Expression injection | PR title, body, branch name, label, etc. | `run:` block via `${{ }}` |
| P2 | Pwn Request | Fork PR code | `pull_request_target` + checkout + execute |
| P3 | Comment trigger abuse | Issue/PR comment body | Workflow execution without auth check |
| P4 | Excessive permissions | N/A (configuration) | Write tokens where read suffices |
| P5 | Fork code execution | Fork/PR checkout | Build, test, run commands |
| P6 | AI config poisoning | CLAUDE.md, AGENTS.md, .cursorrules | AI agent context loading |
| P7 | Dangerous execution | curl output, base64 decoded strings | `bash`, `eval`, pipe to shell |

## Key Artifacts

| Artifact | Description |
|----------|-------------|
| `START-HERE.md` | This file — scope and methodology |
| `reconnaissance-summary.json` | Workflow classification data |
| `scanner-assignments.json` | Agent-to-submodule mapping |
| `s{n}-{submodule}.json` | Per-submodule scanner output |
| `verification-report.json` | Coverage verification |
| `merged-findings.json` | Unified finding set |
| `reconciliation-table.json` | Scanner-to-merged finding mapping |
| `01-cicd-audit-report.md` | Final audit report |

## Options

- **Target selection**: Specify individual submodules or `all`
- **Scope exclusions**: Submodules without `.github/workflows/` are automatically excluded
