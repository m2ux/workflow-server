# Anti-Pattern Findings — `workflow-design`

**Mode:** review · **Date:** 2026-07-17  
**Pass:** anti-patterns  
**Target:** `workflow-design` v1.24.3 (PR #254 worktree)

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| H-1 | High | `technique-outputs-declared` — Protocol assembles `{pattern_analysis}` with no Outputs entry; binding-fidelity `read-resolution` NEW | `techniques/pattern-analysis.md:33` | Declare `### pattern_analysis`; cite `{id}` in Assemble; persist still captures `{pattern_analysis_path}` |
| L-1 | Low | Persist lines cite guide file without `#template` while assemble lines use `#template` | `pattern-analysis`, `intake-classification`, `assemble-file-approach`, `review-drafted-file`, `review-draft-yaml`, `persist-design-specification`, `compile-report` | Align persist cites to `…md#template` (or `#assumptions-log-template` where that is the home) |

**Finding count:** 2

## Clean (spot-checked)

| Entry | Result |
|-------|--------|
| `statement-not-question` | Pass — checkpoint messages statement-form |
| `link-named-artifacts` | Pass — gates link path vars; review-disposition primary report only |
| `no-next-step-narration` | Pass — no auto-advance narration in messages |
| `session-interaction-in-technique` | Pass — no Present/ask phases on persist/audit ops |
| `no-tool-usage-prescription` | Pass — no harness tool recipes in local persist protocols |
| `bound-step-no-description` | Pass — technique steps bare; descriptions only on options/loops |
| `no-inline-content` / modular packaging | Pass — guides are sibling resources |

## Notes

- Catalog pin is 1.24.1 and lacks creation guides; audit used PR worktree only.
- Corpus-wide `dead-output` / `orphan-input` NEW rows also appear on catalog tip (baseline stale) — not PR-unique; omitted from finding table.
