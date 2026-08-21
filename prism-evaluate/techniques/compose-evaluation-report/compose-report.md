---
metadata:
  version: 2.0.0
---

## Capability

Renders the consolidated evaluation as the standalone document its reader decides from.

## Outputs

### evaluation_report_path

The written `EVALUATION-REPORT.md` path.

## Protocol

### 1. Compose the Report

- Compose `{evaluation_report}` per the [Evaluation Report Template](../../resources/evaluation-report-template.md#evaluation-report-template), framing the executive summary from `{evaluation_description}` and populating `{evaluation_report.recommendations}` from the findings, grouped immediate, short-term and structural.

### 2. Write It Out

- Write `{evaluation_report}` into `{evaluation_output_path}` and record `{evaluation_report_path}`.
