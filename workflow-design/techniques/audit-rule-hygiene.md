---
metadata:
  version: 1.2.1
---

## Capability

Audit `rules[]` across the workflow, activities, and techniques against the Rule Hygiene section of the anti-pattern catalog, and present findings with file, rule key, and recommended fix.

## Outputs

### rule_hygiene_findings

Rule-hygiene findings — each a flagged rule with its file, rule key, the hygiene class (restatement, contradiction, cross-level duplication, prefix pattern, ambiguity, single-step), and the recommended action.

### rule_hygiene_finding_count

Count of entries in `{rule_hygiene_findings}`.

## Protocol

### 1. Load Catalog Section

- Load [anti-patterns](../resources/anti-patterns.md) — sole source of Rule Hygiene detect, exclusion, and fix criteria
- Scope this pass to subsections under `## Rule Hygiene Anti-Patterns` only (`no-rule-protocol-restatement` through `no-one-step-rules`, including `worker-rule-reach`)
- Do not restate, summarize, or number those entries here; follow each as written

### 2. Apply Rule Hygiene Entries

- Walk every in-scope `### AP-XX. name` against `rules[]` / technique `## Rules` on the target workflow, activities, and techniques
- For each entry: apply its **Detect** (or equivalent prose), honor **Do not flag** / caveats, and record **Fix** when a violation is found
- For each finding record into `{rule_hygiene_findings}`: entry **name** (primary), **AP-XX** designator, file path, rule key, offending content, recommended fix

### 3. Present Findings

- Present `{rule_hygiene_findings}` grouped by catalog entry **name** / **designator**: file, rule key, content, recommended fix
- Set `{rule_hygiene_finding_count}` to the number of findings

