# Security Audit Workflow — Quick Start

## Overview

This workflow orchestrates a multi-phase AI security audit of a Substrate-based blockchain node codebase. It follows the Substrate Node Security Audit Template v2 with multi-agent execution, adversarial verification, and optional ensemble passes.

## Prerequisites

1. **Target submodule** — the submodule to audit (e.g., `midnight-node`)
2. **Target commit** — the git commit hash to audit
3. **AGENTS.md** — read and follow the repo root AGENTS.md before starting

## How to Start

Say: **"start security audit"** or **"audit midnight-node at commit abc123"**

The workflow will guide you through:

| Phase | Activity | Purpose |
|-------|----------|---------|
| 0 | Scope Setup | Confirm target, checkout, cargo audit, planning folder |
| 1a | Reconnaissance | Map architecture, build function registry |
| 1b | Primary Audit | Multi-agent dispatch (crate review + static + traces + toolkit) |
| 2 | Adversarial Verification | Decompose and verify PASS items from scratchpads |
| 3 | Report Generation | Consolidate, severity score, coverage gate, final report |
| 4 | Ensemble Pass | Optional second-model run + merge |
| 5 | Gap Analysis | Optional comparison against professional audit report |

## Key Artifacts Produced

| Artifact | Description |
|----------|-------------|
| `START-HERE.md` | Session overview with target, commit, methodology |
| `README.md` | Audit scope, crate inventory, architecture summary |
| `01-audit-report.md` | Full report with numbered findings and severity scores |
| `02-gap-analysis.md` | Comparison against reference report (if provided) |

## Options at Setup

- **Enable ensemble pass** — run the template a second time with a different model configuration and merge results
- **Provide reference report** — supply a professional audit report for gap analysis comparison
