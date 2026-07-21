---
metadata:
  version: 1.3.1
---

## Capability

Audit `rules[]` across the workflow, activities, and techniques against the Rule Hygiene section of the anti-pattern catalog, and persist findings when any exist.

## Outputs

### rule_hygiene_findings

Rule-hygiene findings — each a flagged rule with its file, rule key, the hygiene class (restatement, contradiction, cross-level duplication, prefix pattern, ambiguity, single-step), and the recommended action.

#### artifact

`rule-hygiene-findings.md`

### rule_hygiene_finding_count

Count of entries in `{rule_hygiene_findings}`.

### rule_hygiene_findings_path

Absolute path to the persisted findings artifact when `{rule_hygiene_finding_count}` is greater than zero; empty otherwise.

## Protocol

### 1. Load Catalog Section

- Load [anti-patterns](../resources/anti-patterns.md) — sole source of Rule Hygiene detect, exclusion, and fix criteria
- Scope this pass to subsections under `## Rule Hygiene Anti-Patterns` only (`no-rule-protocol-restatement` through `no-one-step-rules`, including `worker-rule-reach`)
- Do not restate, summarize, or number those entries here; follow each as written

### 2. Apply Rule Hygiene Entries

- Walk every in-scope `### AP-XX. name` against `rules[]` / technique `## Rules` on the target workflow, activities, and techniques
- For each entry: apply its **Detect** (or equivalent prose), honor **Do not flag** / caveats, and record **Fix** when a violation is found
- For each finding record into `{rule_hygiene_findings}`: entry **name** (primary), **AP-XX** designator, file path, rule key, offending content, recommended fix

### 3. Persist Findings

- Set `{rule_hygiene_finding_count}` to the number of findings
- When `{rule_hygiene_finding_count}` is greater than zero: persist `{rule_hygiene_findings}` via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and bare filename `rule-hygiene-findings.md`, following the [Findings Satellite Guide](../resources/findings-satellite.md#template); capture `{rule_hygiene_findings_path}`
- When `{rule_hygiene_finding_count}` is zero: leave `{rule_hygiene_findings_path}` empty
