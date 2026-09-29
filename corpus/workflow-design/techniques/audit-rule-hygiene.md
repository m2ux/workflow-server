---
metadata:
  version: 1.5.0
---

## Capability

Rule-hygiene audit of `rules[]` across workflow, activities, and techniques against the anti-pattern catalog.

## Outputs

### rule_hygiene_findings

Rule-hygiene findings — each a flagged rule with its file, rule key, the hygiene class (restatement, contradiction, cross-level duplication, prefix pattern, ambiguity, single-step), and the recommended action.

#### artifact

`rule-hygiene-findings.md`

#### audience

`human`

### rule_hygiene_finding_count

Count of entries in `{rule_hygiene_findings}`.

## Protocol

### 1. Load Catalog Section

- Load [Rule Hygiene](/canon/resources/anti-patterns.md#rule-hygiene) — sole source of Rule Hygiene detect, exclusion, and fix criteria
- That section is this pass's whole scope: `no-rule-protocol-restatement` through `no-one-step-rules`, including `worker-rule-reach`
- Do not restate, summarize, or number those entries here; follow each as written

### 2. Apply Rule Hygiene Entries

- Walk every in-scope `### AP-XX. name` against `rules[]` / technique `## Rules` on the target workflow, activities, and techniques
- For each entry: apply its **Detect** (or equivalent prose), honor **Do not flag** / caveats, and record **Fix** when a violation is found
- For each finding record into `{rule_hygiene_findings}`: entry **name** (primary), **AP-XX** designator, file path, rule key, offending content, recommended fix

### 3. Assemble Findings

- Set `{rule_hygiene_finding_count}` to the number of findings
- Assemble `{rule_hygiene_findings}` at the shape [Template](../resources/findings-satellite.md#template) declares
