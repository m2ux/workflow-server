---
name: audit-prompt-template
description: audit-prompt.md
metadata:
  version: 1.0.0
  order: 1
  legacy_id: 1
---

# Audit Prompt

**Purpose:** Template for the self-contained security audit prompt produced by the compose-audit-prompt technique. The prompt is tailored to the target codebase's architecture, language, and trust boundaries, and becomes the `analysis_focus` for the triggered prism workflow.

**What good looks like:** A reviewer (human or agent) can read the prompt and begin auditing with no context beyond the codebase path. Every domain names concrete modules, patterns, and questions; trust-boundary data appears only when GitNexus indexed the target.

---

## Audit Prompt Template

```markdown
# Security Audit Prompt — {project name}

## 1. Codebase Overview

**Language:** {primary language}
**Build system:** {Cargo / npm / go.mod / pyproject / ...}
**Total LOC:** {total_loc} (excluding tests, docs, generated)
**GitNexus indexed:** {yes / no}

{One- to two-paragraph architecture summary: what the system does, how the
modules relate, and where the security-relevant weight sits.}

### Module Layout

| Module | Path | Lines | Purpose |
|--------|------|-------|---------|
| {name} | {path} | {line_count} | {purpose} |

## 2. Audit Domains

{One subsection per domain. Include ONLY domains with corresponding code in
the target. Common patterns: Cryptographic Correctness, Value/Token
Conservation, Transaction Safety, Execution Safety, Storage Integrity,
Serialisation Safety, Network/API Security, Error Handling, Feature Flag
Discipline.}

### {Domain Name}

- **Risk Level:** {CRITICAL | HIGH | MEDIUM | LOW}
- **Scope:** {modules / files this domain covers}
- **Focus Areas:** {specific patterns and code paths to examine}
- **Key Questions:** {what the audit must answer for this domain}

## 3. Trust Boundary Map

{Include this section ONLY when GitNexus data is available; omit it entirely
otherwise.}

### Cross-Community Call Edges

| From Community | To Community | Crossing Symbols |
|----------------|--------------|------------------|
| {from_community} | {to_community} | {crossing_symbols} |

### Security-Critical Symbol Blast Radii

| Symbol | Direct Callers | Affected Processes | Affected Modules | Risk |
|--------|----------------|--------------------|------------------|------|
| {symbol} | {direct_callers} | {affected_processes} | {affected_modules} | {risk} |

## 4. Cross-Cutting Concerns

- **Error Handling:** {panic vs Result, unwrap usage, silent error swallowing across modules}
- **Feature Flags:** {features gating security-critical behaviour; risk of test/mock code in production}
- **Trust Boundaries:** {where trust transitions occur and whether enforcement is consistent}
- **Dependencies:** {third-party dependencies with known vulnerabilities or unmaintained status}

## 5. Output Requirements

Produce findings with: ID, severity (using the Impact x Feasibility rubric),
description, location (file:line), impact, recommendation. Organise by domain
and severity.
```
