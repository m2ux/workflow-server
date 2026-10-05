---
name: start-here
description: Quick start for the multi-phase Substrate node security audit, and the creation guide for bare filenames `START-HERE.md` and `file-inventory.txt`.
metadata:
  order: 0
  legacy_id: 0
---

# Security Audit Workflow — Quick Start

## Overview

This workflow orchestrates a multi-phase AI security audit of a Substrate-based blockchain node codebase. It follows the Substrate Node Security Audit Template with concurrent multi-agent execution (Groups A, B, D, V), dedicated output verification, adversarial verification informed by gap reports, composable technique architecture, and optional ensemble passes. Iteratively improved via gap analysis against professional audit benchmarks.

## Prerequisites

1. **Target submodule** — the submodule to audit (e.g., `midnight-node`)
2. **Target commit** — the git commit hash to audit
3. **AGENTS.md** — read and follow the repo root AGENTS.md before starting

## How to Start

Say: **"start security audit"** or **"audit midnight-node at commit abc123"**

The workflow will guide you through:

| Phase | Activity | Purpose |
|-------|----------|---------|
| 0 | Scope Setup | Confirm target, checkout, cargo audit, file inventory |
| 1a | Reconnaissance | Map architecture, build function registry, assign agent groups |
| 1b | Primary Audit | Concurrent multi-agent dispatch (Groups A, B, D) + verification agent (V) |
| 2 | Adversarial Verification | Decompose PASS items, independently verify each property |
| 3 | Report Generation | Consolidate all phases, severity calibration cross-check, coverage gate |
| 4 | Ensemble Pass | Optional second-model run + union-merge |
| 5 | Gap Analysis | Optional comparison against professional audit report |

## Key Artifacts Produced

| Artifact | Description |
|----------|-------------|
| `START-HERE.md` | Session overview with target, commit, methodology |
| `README.md` | Audit scope, crate inventory, architecture summary |
| `file-inventory.txt` | Source files sorted by line count |
| `01-audit-report.md` | Full report with numbered findings and severity scores |
| `02-gap-analysis.md` | Comparison against reference report (if provided) |

## Options at Setup

- **Enable ensemble pass** — run the template a second time with a different model configuration and merge results
- **Provide reference report** — supply a professional audit report for gap analysis comparison (loaded ONLY after Phase 3 — contamination prevention)

## Template

The `START-HERE.md` an audit writes into its planning folder.

```markdown
# Security Audit — {target submodule} @ {short commit}

| Field | Value |
|-------|-------|
| Target | {target submodule} |
| Commit | {full commit} |
| Started | {YYYY-MM-DD} |

## Methodology

{The workflow overview, as it applies to this target.}

## Artifacts

{The key artifacts table.}

## Options

{Each option at setup, marked as chosen or not for this run.}
```

## File Inventory Template

The `file-inventory.txt` an audit writes into its planning folder: one line per in-scope source file, largest first.

```text
{line count}  {path relative to the target submodule}
```

## Rules

- **The commit is the pinned one.** `START-HERE.md` records the full commit the target is checked out at, so every later artifact is read against one tree.
- **The inventory covers the audit scope only.** Each in-scope source file is one line, sorted by line count, largest first.

