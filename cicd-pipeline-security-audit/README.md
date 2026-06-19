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

- **Fully automated** — no user checkpoints; each activity gates the next phase on completion
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
├── workflow.yaml                          # Workflow definition
├── README.md                              # This file
├── activities/
│   ├── 01-scope-setup.yaml                # Target + workflow file discovery
│   ├── 02-reconnaissance.yaml             # Classify, map, assign agents
│   ├── 03-primary-scan.yaml               # Dispatch scanners, verify, merge
│   ├── 04-report-generation.yaml          # Severity score + report
│   ├── 05-sub-workflow-scan.yaml          # Per-submodule scan (sub-agent)
│   ├── 06-sub-verification.yaml           # Coverage verification (sub-agent)
│   └── 07-sub-merge.yaml                  # Finding merge (sub-agent)
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

The sequential phases of the audit — each activity is a distinct stage that must complete before the next begins. Each links to its authoritative YAML definition.

| # | Activity | Role in the flow |
|---|----------|------------------|
| [01](activities/01-scope-setup.yaml) | Scope Setup | Discovers the target submodules and their workflow files, and stands up the planning folder the rest of the audit writes into |
| [02](activities/02-reconnaissance.yaml) | Reconnaissance | Classifies triggers, maps permissions, and assigns one scanner agent per submodule so the scan can fan out |
| [03](activities/03-primary-scan.yaml) | Primary Scan | Runs the scanner agents, independently verifies their coverage, and merges their findings into one reconciled set |
| [04](activities/04-report-generation.yaml) | Report Generation | Scores merged findings by severity and writes the final audit report |

### Sub-Agent Activities

Delegated work units that run inside Phase 3 — each is executed by a dedicated sub-agent spawned by the orchestrator.

| # | Activity | Agent | Role in the flow |
|---|----------|-------|------------------|
| [05](activities/05-sub-workflow-scan.yaml) | Per-Submodule Workflow Scan | S1-Sn | Applies all seven detection patterns to every workflow file in its assigned submodule |
| [06](activities/06-sub-verification.yaml) | Scan Verification | V | Independently confirms that no file or pattern was skipped across all scanners |
| [07](activities/07-sub-merge.yaml) | Finding Merge | M | Deduplicates, correlates, and reconciles scanner findings into a single trustworthy set |

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
