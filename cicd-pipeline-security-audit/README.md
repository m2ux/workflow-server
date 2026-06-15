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
├── techniques/
│   ├── TECHNIQUE.md                        # Inherited base contract
│   ├── execute-cicd-audit.md              # Orchestrator coordination (standalone)
│   ├── execute-sub-agent.md               # Sub-agent bootstrap + structured output (standalone)
│   ├── inventory-workflows/               # File discovery + classification (group: 10 ops)
│   ├── scan-injection-patterns/           # 7-pattern detection engine (group: load + P1-P7 + assemble)
│   ├── dispatch-scanners/                 # Agent dispatch + collection (group: 8 ops)
│   ├── score-cicd-severity/               # Impact x Exploitability scoring (group: apply + calibrate)
│   ├── verify-scan-output/                # Coverage verification (group: 4 ops)
│   ├── merge-scan-findings/               # Dedup + reconciliation (group: 5 ops)
│   └── write-cicd-report/                 # Report generation (group: attach-remediation + write)
└── resources/
    ├── start-here.md                      # Quick reference
    ├── injection-pattern-catalog.md       # Pattern signatures + examples
    ├── cicd-severity-rubric.md            # Severity scoring matrix
    ├── remediation-playbook.md            # Per-pattern remediation
    ├── sub-agent-output-schema.md         # Scanner output JSON schema
    ├── intermediate-artifact-schemas.md   # JSON shapes for intermediate artifacts
    └── cicd-audit-report-template.md      # Final report document skeleton
```

## Activities

The sequential phases of the audit — each activity represents a distinct stage that must complete before the next begins.

Each activity binds techniques at the step level (`step.technique`). The Supporting column lists the activity's strategy techniques (`techniques.supporting`); the Step-Bound column lists the techniques its steps bind.

| # | Activity | Purpose | Steps | Supporting | Step-Bound Techniques |
|---|----------|---------|-------|------------|-----------------------|
| [01](activities/01-scope-setup.toon) | Scope Setup | Discover targets, inventory workflows, create planning folder | 5 | variable-binding, execute-cicd-audit | inventory-workflows |
| [02](activities/02-reconnaissance.toon) | Reconnaissance | Classify triggers, map permissions, assign scanner agents | 5 | variable-binding, execute-cicd-audit | inventory-workflows |
| [03](activities/03-primary-scan.toon) | Primary Scan | Dispatch S1-Sn scanners, V verification, M merge | 8 | variable-binding, execute-cicd-audit | dispatch-scanners |
| [04](activities/04-report-generation.toon) | Report Generation | Severity scoring + final report | 5 | variable-binding, execute-cicd-audit | score-cicd-severity, verify-scan-output, write-cicd-report |

### Sub-Agent Activities

Delegated work units that run inside Phase 3 — each is executed by a dedicated sub-agent spawned by the orchestrator.

Sub-agent activities carry `variable-binding` and `execute-sub-agent` as supporting techniques; each binds a detection or analysis technique at the step level.

| # | Activity | Agent | Steps | Purpose | Step-Bound Techniques |
|---|----------|-------|-------|---------|-----------------------|
| [05](activities/05-sub-workflow-scan.toon) | Per-Submodule Workflow Scan | S1-Sn | 9 | Apply P1-P7 to all workflow files in assigned submodule | scan-injection-patterns |
| [06](activities/06-sub-verification.toon) | Scan Verification | V | 4 | Verify file + pattern coverage across all scanners | verify-scan-output |
| [07](activities/07-sub-merge.toon) | Finding Merge | M | 5 | Deduplicate, correlate, reconcile findings | merge-scan-findings |

## Techniques

Reusable capabilities that activities invoke — each technique encapsulates a specific analytical or orchestration capability.

Most capabilities are operation-groups: a `<group>/` directory holding a `TECHNIQUE.md` shared contract plus one `<op>.md` per operation, bound from steps as `<group>::<op>`. Two are standalone files. The shared base contract for the set lives in [`techniques/TECHNIQUE.md`](./techniques/TECHNIQUE.md).

| Order | Technique | Kind | Capability | Used By |
|---|-------|------|------------|---------|
| 00 | [execute-cicd-audit](./techniques/execute-cicd-audit.md) | standalone | Orchestrate audit phases + gates | Supporting, all main activities (01-04) |
| 01 | [score-cicd-severity](./techniques/score-cicd-severity/) | group | Impact x Exploitability severity scoring | Report Generation (step-level) |
| 02 | [inventory-workflows](./techniques/inventory-workflows/) | group | Workflow file discovery + classification | Scope Setup, Reconnaissance (step-level) |
| 03 | [scan-injection-patterns](./techniques/scan-injection-patterns/) | group | 7-pattern detection (P1-P7) | Sub-agents S1-Sn (step-level) |
| 04 | [dispatch-scanners](./techniques/dispatch-scanners/) | group | Sub-agent dispatch + collection | Primary Scan (step-level) |
| 05 | [verify-scan-output](./techniques/verify-scan-output/) | group | Coverage verification | Sub-agent V (step-level), Report Generation (step-level) |
| 06 | [merge-scan-findings](./techniques/merge-scan-findings/) | group | Dedup + reconciliation | Sub-agent M (step-level) |
| 07 | [write-cicd-report](./techniques/write-cicd-report/) | group | Report generation | Report Generation (step-level) |
| 08 | [execute-sub-agent](./techniques/execute-sub-agent.md) | standalone | Sub-agent bootstrap + structured output | Supporting, sub-agents S1-Sn, V, M |

## Resources

Reference material loaded by the agent at runtime — pattern catalogs, scoring rubrics, and schemas that inform scan and reporting logic.

| Order | Resource | Purpose |
|---|----------|---------|
| 00 | [Start Here](./resources/start-here.md) | Quick reference + methodology overview |
| 01 | [Injection Pattern Catalog](./resources/injection-pattern-catalog.md) | Grep patterns, untrusted contexts, campaign examples |
| 02 | [CI/CD Severity Rubric](./resources/cicd-severity-rubric.md) | Impact x Exploitability matrix + calibration anchors |
| 03 | [Remediation Playbook](./resources/remediation-playbook.md) | Per-pattern fix guidance with before/after examples |
| 04 | [Sub-Agent Output Schema](./resources/sub-agent-output-schema.md) | Scanner output JSON schema + validation rules |
| 05 | [Intermediate Artifact Schemas](./resources/intermediate-artifact-schemas.md) | JSON shapes for artifacts between reconnaissance, dispatch, verification, and merge |
| 06 | [CI/CD Audit Report Template](./resources/cicd-audit-report-template.md) | Document skeleton for the final audit report |

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
| s{scanner_number}-{submodule_path}.json | Scanner S{scanner_number} | Per-submodule scan findings |
| verification-report.json | V agent | Coverage verification |
| merged-findings.json | M agent | Unified finding set |
| reconciliation-table.json | M agent | Scanner-to-merged finding map |
| 01-cicd-audit-report.md | Report Generation | Final audit report |

## References

- [hackerbot-claw: AI-Powered Bot Exploiting GitHub Actions](https://www.stepsecurity.io/blog/hackerbot-claw-github-actions-exploitation) — StepSecurity, March 2026
- [trust your inputs, lose your repo](https://x.com/theonejvo/status/2028499852188107256) — Jamieson O'Reilly, March 2026
- [Script injections](https://docs.github.com/en/actions/concepts/security/script-injections) — GitHub Docs
- [How to catch GitHub Actions workflow injections](https://github.blog/security/vulnerability-research/how-to-catch-github-actions-workflow-injections-before-attackers-do) — GitHub Security Blog
