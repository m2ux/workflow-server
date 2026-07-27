# Convention Conformance Findings — `meta`

**Mode:** update · **Date:** 2026-07-27
**Pass:** conformance
**Target:** `meta` v5.9.0

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| C-1 | Medium | Canonical definition prose lags its derived orientation — `description` and `outcome[]` still assert an unconditional saved-session search after the search was gated | `activities/00-discover-session.yaml` — `description` (L4), `outcome[1]` (L95) | State the precondition in both, matching the already-updated `README.md` and `activities/README.md` |
| C-2 | Medium | Reference resource backlinks its consuming technique and narrates gate/routing topology | `resources/resume-intent-lexicon.md` (L8) | Open with what the file *is* (the continuation-phrase vocabulary); drop the `detect-resume-intent` link and the "reaches session initialization directly" routing sentence |
| C-3 | Low | Technique `## Capability` names its consumer and the gate it feeds; sibling `workflow-engine` capabilities are call-site agnostic | `techniques/workflow-engine/detect-resume-intent.md` (L8) | Reduce to the value produced, e.g. "Whether a user request states intent to carry on prior work." |
| C-4 | Low | New variable `description` carries a consumer/gate tail rather than one line naming the value | `workflow.yaml` — `resume_intent_requested` (L53) | Cut the "— gates the saved-session search in discover-session" tail |
| C-5 | Low | Protocol step 2 restates a negative case the cited lexicon already owns, after step 1 delegated to it | `techniques/workflow-engine/detect-resume-intent.md` (L25) | Drop the "a request that only names a work item…" tail; step 1's citation covers it |
| C-6 | Low | Folder-tree comment still describes the scan as unconditional while the same file's header and activity-table row were updated | `README.md` — tree entry for `00-discover-session.yaml` (L126) | Qualify the comment, e.g. "Match user request, scan saved sessions on resume intent" |

**Finding count:** 6 · **Disposition:** all six brought into conformance — see [verified findings § Resolution](08-verified-findings.md#resolution). Re-audit returned 0.

## Notes

- **Conformant, no finding.** File naming (kebab `.md` leaves), section order in `detect-resume-intent.md` (Capability / Inputs / Outputs / Protocol — identical to `extract-identifying-context.md`, `match-saved-session.md`, `scan-saved-sessions.md`, none of which carry `## Rules`), resource frontmatter (`name` + `description`, matching all four sibling resources), semantic version bumps on all four versioned files, and `transitions[]` / checkpoint shapes (untouched).
- **Considered, not flagged — `## Matching` in the lexicon.** Its matching semantics are vocabulary semantics, not session cadence or gate routing, and reference lexicons are an explicit carve-out from `resource-fills-not-does`. Left with the vocabulary it governs.
- **Considered, not flagged — sibling backlink precedent for C-2.** `resources/planning-readme.md` links its callers, but it is an engine-prompt resource whose domain is instructing the reader to run engine ops; a pure reference lexicon has no such standing.
- **Out of scope.** The pre-existing `resume-session` checkpoint `message` is phrased as a question ("Resume from where you left off, or start fresh?"), which the statement-not-question convention forbids. The line is untouched by this change and outside the [scope manifest](07-scope-manifest.md); it belongs in [deferred items](05-deferred-items.md) rather than this pass. The identical gate tail on the pre-existing `workflow_match_ambiguous` description (C-4's sibling) is out of scope for the same reason.
