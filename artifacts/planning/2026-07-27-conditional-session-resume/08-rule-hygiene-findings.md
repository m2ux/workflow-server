# Rule Hygiene Findings — `meta`

**Mode:** update · **Date:** 2026-07-27
**Pass:** rule-hygiene
**Target:** `meta` v5.9.0

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| R-1 | Medium | `no-rule-protocol-restatement` (AP-19) — the replacement activity rule restates declared structure clause for clause and adds no invariant the steps do not already convey | `activities/00-discover-session.yaml` — `rules[0]` (L7) | Delete the rule (and the now-empty `rules:` key); the gates, checkpoint condition, and default transition are the source |

**Finding count:** 1 · **Disposition:** fixed — see [verified findings § Resolution](08-verified-findings.md#resolution). Re-audit returned 0.

## Notes

- **R-1 clause-by-clause.** Offending content: *"Search saved sessions when the request states resume intent — surface a match via the resume-session checkpoint; a request stating a fresh start reaches session initialization directly."*

  | Clause | Structure that already conveys it |
  |---|---|
  | Search saved sessions when the request states resume intent | `when: resume_intent_requested == true` on `extract-context`, `scan-planning-folders`, `match-session` |
  | surface a match via the resume-session checkpoint | `resume-session` checkpoint `condition: has_saved_state == true` |
  | a request stating a fresh start reaches session initialization directly | the three gates plus `transitions[0] to: initialize-session` (`isDefault`) |

- **Why the replacement, not the original, is the violation.** The rule it superseded ("Match identifying context against saved sessions even when the user said 'start'") carried an invariant no construct encoded — the unconditional-search obligation. This change moves that decision into declared state and step gates, which is exactly what removes the rule's reason to exist. Restating the new structure in prose reintroduces a copy that can drift out of sync with the gates.
- **Precedent for deletion.** `rules` is optional on `activity.schema.json` (required: `id`, `version`, `name`), and three of meta's five activities — `01-initialize-session`, `03-dispatch-client-workflow`, `04-end-workflow` — declare none.
- **Clean on the remaining in-scope entries.** No contradiction (`no-contradictory-rules`), no cross-level duplicate of this rule in meta's two `rules.workflow` entries (`single-rule-authority`), correct audience placement had it been kept (`worker-rule-reach`), no rule family to group (`grouped-rule-keys`, `rule-group-disambiguation`), and neither new nor modified technique declares a `## Rules` section, so `no-one-step-rules` has nothing to bind to.
