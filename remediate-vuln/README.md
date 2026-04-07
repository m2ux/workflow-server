# Security Vulnerability Remediation Workflow (remediate-vuln)

## Overview
A highly isolated workflow for remediating security vulnerabilities without public disclosure. Bypasses all public issue tracking and PR creation, operating exclusively on a private security remote.

## Activities
1. **Start** (01-start.toon): Initialize security fix, configure private remotes.
2. **Strategic Review** (02-strategic-review.toon): Ensure minimal and focused changes.
3. **Submit** (03-submit.toon): Push commits strictly to private security remote.

## Referenced Activities (work-package)
This workflow reuses several activities from the `work-package` workflow for design, analysis, and implementation.

## Variables
- `sec_vuln_url`: URL of the private security advisory.
- `is_sec_vuln_mode`: Always true.
