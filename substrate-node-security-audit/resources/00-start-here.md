# Security Audit Workflow — Quick Start

## Overview

This workflow orchestrates a multi-phase AI security audit of a Substrate-based blockchain node codebase. It follows the Substrate Node Security Audit Template with wave-based multi-agent execution (Groups A, B, D), hard-gate adversarial verification, composable skill architecture, and optional ensemble passes. Iteratively improved via gap analysis against professional audit benchmarks.

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
| 1b | Primary Audit | Wave-based multi-agent dispatch (Groups A, B, D) with verification gates |
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
