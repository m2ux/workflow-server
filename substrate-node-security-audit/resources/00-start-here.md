# Security Audit Workflow — Quick Start

## Overview

This workflow orchestrates a multi-phase AI security audit of a Substrate-based blockchain node codebase. It follows the Substrate Node Security Audit Template v3 with multi-agent execution, exhaustive panic sweep, hard-gate adversarial verification, and optional ensemble passes. Validated at 75% overlap with professional audits across 7 sessions.

## Prerequisites

1. **Target submodule** — the submodule to audit (e.g., `midnight-node`)
2. **Target commit** — the git commit hash to audit
3. **AGENTS.md** — read and follow the repo root AGENTS.md before starting

## How to Start

Say: **"start security audit"** or **"audit midnight-node at commit abc123"**

The workflow will guide you through:

| Phase | Activity | Purpose |
|-------|----------|---------|
| 0 | Scope Setup | Confirm target, checkout, cargo audit, panic inventory, file assignment check |
| 1a | Reconnaissance | Map architecture, build function registry |
| 1b | Primary Audit | Multi-agent dispatch (Groups A-E with cross-layer deferral) |
| 1.5 | Panic Sweep | Exhaustive triage of every unwrap/expect/panic + late-file re-reads |
| 2 | Adversarial Verification | Hard-gate: decompose PASS items with anti-anchoring protocol |
| 3 | Report Generation | Consolidate all phases, severity calibration cross-check, extended coverage gate |
| 4 | Ensemble Pass | Optional second-model run + merge |
| 5 | Gap Analysis | Optional comparison against professional audit report |

## Key Artifacts Produced

| Artifact | Description |
|----------|-------------|
| `START-HERE.md` | Session overview with target, commit, methodology |
| `README.md` | Audit scope, crate inventory, architecture summary |
| `panic-inventory.txt` | Pre-generated unwrap/expect/panic site inventory |
| `01-audit-report.md` | Full report with numbered findings and severity scores |
| `02-gap-analysis.md` | Comparison against reference report (if provided) |

## Options at Setup

- **Enable ensemble pass** — run the template a second time with a different model configuration and merge results
- **Provide reference report** — supply a professional audit report for gap analysis comparison (loaded ONLY after Phase 3 — contamination prevention)
