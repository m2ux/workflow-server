# Prism Audit Activities

> Part of the [Prism Audit Workflow](../README.md)

Five activities that carry a security audit from a raw target-and-description through a tailored audit prompt, triggered prism analysis, and a finalized, cross-validated report set. The spine is linear — scope, prompt, analyse, finalize, deliver — with two branches: the scope checkpoint can loop back to re-scope, and a target with no security-relevant patterns can abort straight to delivery.

This file is an orientation map. The authoritative definition of each activity — its steps, checkpoints, conditions, loops, and transitions — lives in the per-activity YAML linked from each section below and is served by `get_activity`.

---

### 00. Define Audit Scope

Collect the audit target, description, and output path; validate that the target is an analysable codebase; index it with GitNexus (recording whether indexing succeeded, so downstream trust-boundary mapping and finding enrichment can branch on it); summarise the assembled scope; and create the output directory. A blocking `confirm-scope` checkpoint settles the target and configuration before any analysis — choosing *adjust* loops the activity back to re-scope. **Value:** analysis begins against a user-confirmed, validated target with a place to land its outputs, and downstream activities know whether call-graph enrichment is available.

Definition: [`00-scope-definition.yaml`](00-scope-definition.yaml). Leads to [Generate Audit Prompt](#01-generate-audit-prompt).

---

### 01. Generate Audit Prompt

Survey the codebase structure, scan for security-relevant characteristics, map trust boundaries (only when GitNexus indexed the target), derive the audit domains and cross-cutting concerns, then compose the self-contained audit prompt and partition the work into the discrete scopes prism will run. Every domain is grounded in observed code and risk-calibrated to its exposure; the user's stated concerns are folded in as elevated focus areas. A conditional blocking `no-security-characteristics` checkpoint fires when the scan finds nothing security-relevant, letting the user proceed with a generic structural analysis or abort the audit. **Value:** prism runs against domains grounded in this codebase's real architecture and risk exposure rather than a generic security checklist.

Definition: [`01-prompt-generation.yaml`](01-prompt-generation.yaml). Leads to [Execute Prism Analysis](#02-execute-prism-analysis), or to [Deliver Audit Results](#04-deliver-audit-results) when the user aborts at the no-security-characteristics checkpoint.

---

### 02. Execute Prism Analysis

Trigger the generic [prism](../../prism/README.md) workflow once per entry in `audit_scopes`. After verifying the scopes exist, a `forEach` loop composes each scope's trigger context, dispatches prism as a child workflow via `workflow-engine::handle-sub-workflow`, and records the run from its `RUN-MANIFEST.md` — prism has already verified its own completion, so no re-scan or re-verification happens here. Scopes run sequentially so each prism run has full resources and no cross-analysis interference. **Value:** every audit scope has a completed prism analysis whose contract artifacts finalization can consolidate.

Definition: [`02-execute-analysis.yaml`](02-execute-analysis.yaml). Leads to [Audit Report Finalization](#03-audit-report-finalization).

---

### 03. Audit Report Finalization

Assemble the three audit deliverables from prism's contract artifacts (`REPORT.md` + `DEFINITIVE-FINDINGS.md`): split the report into `AUDIT-REPORT.md`, build `DETAILED-FINDINGS.md` (carrying prism's blast-radius enrichment through as Graph Evidence — the audit does not recompute it) and `DESIGN-TRADE-OFFS.md`, apply the Impact × Feasibility severity rubric and formatting rules, then cross-validate that all three deliverables exist and agree. Multi-scope audits are consolidated: duplicate findings are deduplicated and cross-scope patterns surface as systemic findings. **Value:** the consumer gets a cross-validated, severity-calibrated audit they can act on — a navigable summary, expanded per-finding write-ups, and the design trade-offs behind the findings.

Definition: [`03-audit-finalize.yaml`](03-audit-finalize.yaml). Leads to [Deliver Audit Results](#04-deliver-audit-results).

---

### 04. Deliver Audit Results

Extract the summary report's executive summary, compile the delivery metrics (finding counts by severity, domains analysed, prism runs triggered, artifacts produced), and present the audit summary, core finding, top-priority remediations, and a complete index of every produced artifact with its path. **Value:** the user can gauge the audit's outcome at a glance and go straight to whichever deliverable they want to act on.

Definition: [`04-deliver-audit.yaml`](04-deliver-audit.yaml). Terminal activity.
