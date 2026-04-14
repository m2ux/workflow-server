# CI/CD Pipeline Security Audit Workflow

> Version 1.0.0 | Fully automated | No user checkpoints

Detects source-to-sink injection vulnerabilities in GitHub Actions CI/CD pipelines across monorepo submodules. Based on the [hackerbot-claw campaign](https://www.stepsecurity.io/blog/hackerbot-claw-github-actions-exploitation) (Feb 21-28, 2026) where an autonomous AI agent exploited misconfigured CI/CD pipelines in 7 major open-source projects using 5 distinct injection techniques.

## Threat Context

All attacks follow the same pattern: untrusted data flows from an attacker-controlled **source** (branch name, PR title, filename, fork code, AI config file) to a privileged **sink** (`run:` block, `go run`, `eval`, AI agent context) without validation. This workflow systematically detects these patterns.

## Detection Patterns

| ID | Pattern | Campaign Example | Severity Range |
|----|---------|-----------------|----------------|
| P1 | Expression injection (`${{ }}` in `run:` blocks) | Microsoft, DataDog, RustPython | Medium–Critical |
| P2 | Pwn Request (`pull_request_target` + fork checkout + execute) | Trivy, awesome-go | High–Critical |
| P3 | Comment trigger abuse (no `author_association` check) | akri, DataDog | High–Critical |
| P4 | Excessive permissions (`contents: write` unnecessary) | Cross-cutting | Low–High |
| P5 | Fork code execution (checkout + run in privileged context) | awesome-go, akri | High–Critical |
| P6 | AI config poisoning (unprotected CLAUDE.md, AGENTS.md) | ambient-code | Medium–High |
| P7 | Dangerous execution (`curl \| bash`, `eval`, base64 decode) | Cross-cutting | Low–Critical |

## Architecture

```
Phases:
  1. Scope Setup ──> 2. Reconnaissance ──> 3. Primary Scan ──> 4. Report Generation

Sub-Agent Model (Phase 3):
  Orchestrator dispatches:
    S1-Sn  : Per-submodule scanner agents (concurrent)
    V      : Verification agent (coverage check)
    M      : Merge agent (dedup + reconciliation)
```

### Orchestration Model

- **Fully automated** — no user checkpoints; phase gates via `exitActions`
- **Per-submodule dispatch** — each scanner applies all 7 patterns to one submodule
- **Coverage gate** — every `.github/workflows/*.yml` file must be scanned
- **Reconciliation gate** — every scanner finding must map to a merged finding

## Usage

```
Start a CI/CD pipeline security audit for midnight-node
```

Or scan all submodules:

```
Run CI/CD pipeline security audit for all submodules
```

## File Structure

```
cicd-pipeline-security-audit/
├── workflow.toon                          # Workflow definition
├── README.md                              # This file
├── activities/
│   ├── 01-scope-setup.toon                # Target + workflow file discovery
│   ├── 02-reconnaissance.toon             # Classify, map, assign agents
│   ├── 03-primary-scan.toon               # Dispatch scanners, verify, merge
│   ├── 04-report-generation.toon          # Severity score + report
│   ├── 05-sub-workflow-scan.toon          # Per-submodule scan (sub-agent)
│   ├── 06-sub-verification.toon           # Coverage verification (sub-agent)
│   └── 07-sub-merge.toon                  # Finding merge (sub-agent)
├── skills/
│   ├── 00-execute-cicd-audit.toon         # Orchestrator coordination
│   ├── 01-score-cicd-severity.toon        # Impact x Exploitability scoring
│   ├── 02-inventory-workflows.toon        # File discovery + classification
│   ├── 03-scan-injection-patterns.toon    # 7-pattern detection engine
│   ├── 04-dispatch-scanners.toon          # Agent dispatch + collection
│   ├── 05-verify-scan-output.toon         # Coverage verification
│   ├── 06-merge-scan-findings.toon        # Dedup + reconciliation
│   ├── 07-write-cicd-report.toon          # Report generation
│   └── 08-execute-sub-agent.toon          # Sub-agent bootstrap + structured output
└── resources/
    ├── 00-start-here.md                   # Quick reference
    ├── 01-injection-pattern-catalog.md    # Pattern signatures + examples
    ├── 02-cicd-severity-rubric.md         # Severity scoring matrix
    ├── 03-remediation-playbook.md         # Per-pattern remediation
    └── 04-sub-agent-output-schema.md      # Scanner output JSON schema
```

## Activities

The sequential phases of the audit — each activity represents a distinct stage that must complete before the next begins.

| # | Activity | Purpose | Skills |
|---|----------|---------|--------|
| [01](activities/01-scope-setup.toon) | Scope Setup | Discover targets, inventory workflows, create planning folder | execute-cicd-audit, inventory-workflows |
| [02](activities/02-reconnaissance.toon) | Reconnaissance | Classify triggers, map permissions, assign scanner agents | execute-cicd-audit, inventory-workflows |
| [03](activities/03-primary-scan.toon) | Primary Scan | Dispatch S1-Sn scanners, V verification, M merge | execute-cicd-audit, dispatch-scanners, scan-injection-patterns |
| [04](activities/04-report-generation.toon) | Report Generation | Severity scoring + final report | execute-cicd-audit, score-cicd-severity, write-cicd-report |

### Sub-Agent Activities

Delegated work units that run inside Phase 3 — each is executed by a dedicated sub-agent spawned by the orchestrator.

| # | Activity | Agent | Purpose |
|---|----------|-------|---------|
| [05](activities/05-sub-workflow-scan.toon) | Per-Submodule Scan | S1-Sn | Apply P1-P7 to all workflow files in assigned submodule |
| [06](activities/06-sub-verification.toon) | Verification | V | Verify file + pattern coverage across all scanners |
| [07](activities/07-sub-merge.toon) | Finding Merge | M | Deduplicate, correlate, reconcile findings |

## Skills

Reusable capabilities that activities invoke — each skill encapsulates a specific analytical or orchestration technique.

| # | Skill | Capability | Used By |
|---|-------|------------|---------|
| [00](skills/00-execute-cicd-audit.toon) | execute-cicd-audit | Orchestrate audit phases | All main activities (01-04) |
| [01](skills/01-score-cicd-severity.toon) | score-cicd-severity | Impact x Exploitability severity scoring | Report Generation |
| [02](skills/02-inventory-workflows.toon) | inventory-workflows | Workflow file discovery + classification | Scope Setup, Reconnaissance |
| [03](skills/03-scan-injection-patterns.toon) | scan-injection-patterns | 7-pattern detection (P1-P7) | Sub-agents S1-Sn (step-level) |
| [04](skills/04-dispatch-scanners.toon) | dispatch-scanners | Sub-agent dispatch + collection | Primary Scan |
| [05](skills/05-verify-scan-output.toon) | verify-scan-output | Coverage verification | Sub-agent V (step-level), Report Generation |
| [06](skills/06-merge-scan-findings.toon) | merge-scan-findings | Dedup + reconciliation | Sub-agent M (step-level) |
| [07](skills/07-write-cicd-report.toon) | write-cicd-report | Report generation | Report Generation |
| [08](skills/08-execute-sub-agent.toon) | execute-sub-agent | Sub-agent bootstrap + structured output | Sub-agents S1-Sn, V, M (primary) |

## Resources

Reference material loaded by the agent at runtime — pattern catalogs, scoring rubrics, and schemas that inform scan and reporting logic.

| # | Resource | Purpose |
|---|----------|---------|
| [00](resources/00-start-here.md) | Start Here | Quick reference + methodology overview |
| [01](resources/01-injection-pattern-catalog.md) | Injection Pattern Catalog | Grep patterns, untrusted contexts, campaign examples |
| [02](resources/02-cicd-severity-rubric.md) | CI/CD Severity Rubric | Impact x Exploitability matrix + calibration anchors |
| [03](resources/03-remediation-playbook.md) | Remediation Playbook | Per-pattern fix guidance with before/after examples |
| [04](resources/04-sub-agent-output-schema.md) | Sub-Agent Output Schema | Scanner output JSON schema + validation rules |

## Variables

| Variable | Type | Description |
|----------|------|-------------|
| `target_submodules` | string | Comma-separated submodule paths or "all" |
| `planning_folder_path` | string | Path to planning artifact folder |
| `workflow_file_count` | number | Total workflow files discovered |
| `submodule_count` | number | Submodules in scope |
| `scanners_assigned` | number | Scanner agents assigned |
| `scanners_dispatched` | number | Scanner agents dispatched |
| `reconnaissance_complete` | boolean | Phase 2 gate |
| `primary_scan_complete` | boolean | Phase 3 gate |
| `verification_complete` | boolean | V agent gate |
| `merge_complete` | boolean | M agent gate |
| `report_complete` | boolean | Phase 4 gate |
| `total_findings` | number | Confirmed findings after merge |
| `critical_findings` | number | Critical-severity count |
| `high_findings` | number | High-severity count |

## Artifacts

| Artifact | Produced By | Description |
|----------|------------|-------------|
| START-HERE.md | Scope Setup | Audit scope, methodology, artifact index |
| reconnaissance-summary.json | Reconnaissance | Workflow classification data |
| scanner-assignments.json | Reconnaissance | Agent-to-submodule mapping |
| s{n}-{submodule}.json | Scanner S{n} | Per-submodule scan findings |
| verification-report.json | V agent | Coverage verification |
| merged-findings.json | M agent | Unified finding set |
| reconciliation-table.json | M agent | Scanner-to-merged finding map |
| 01-cicd-audit-report.md | Report Generation | Final audit report |

## References

- [hackerbot-claw: AI-Powered Bot Exploiting GitHub Actions](https://www.stepsecurity.io/blog/hackerbot-claw-github-actions-exploitation) — StepSecurity, March 2026
- [trust your inputs, lose your repo](https://x.com/theonejvo/status/2028499852188107256) — Jamieson O'Reilly, March 2026
- [Script injections](https://docs.github.com/en/actions/concepts/security/script-injections) — GitHub Docs
- [How to catch GitHub Actions workflow injections](https://github.blog/security/vulnerability-research/how-to-catch-github-actions-workflow-injections-before-attackers-do) — GitHub Security Blog
