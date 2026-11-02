# Guideline Iteration

The live disclosure evaluation informs shared authoring and verification rules. The change belongs to the existing `skill/work-designer` branch and PR 1295.

## Scope

- Shared guidelines own conditional retrieval, section boundaries, batching, complete output, necessary context, independent live verification and measured performance claims.
- Work Designer links to those rules and keeps its representative Review, Revise and variant-selection scenarios locally.
- The entry point names the host capabilities required for live validation.

## Tasks

- [x] Inspect applicable instructions, existing guidance and the live findings.
- [x] Revise the guidelines and their consumers.
- [x] Validate links, existing tests and representative live Revise requests; preserve the disclosure failures below.
- [x] Commit, push and update the existing PR's description and evidence.

## Validation Plan

Check local Markdown links and anchors, skill frontmatter, whitespace and the existing mode-summary tests. Test the affected Revise path in two fresh sub-agents using isolated worktrees, realistic requests and constrained side effects. Audit returned tool content and completed artifacts; retain the earlier Review findings because this change does not alter Review's retrieval procedure.

## Mechanical Results

- The installed skill validator and three existing mode-summary tests pass on the production revision.
- All 98 local links and anchors across the 11 skill Markdown files and shared guidelines resolve. The 33 external source links are unchanged by this revision.
- Whitespace validation passes. Each evaluation worktree contains exactly the requested template-heading edit in addition to the four baseline changes; recorded SHA-256 hashes confirm those baseline files are preserved.

## Live Results

Both agents received the same template-revision request in fresh contexts, apart from their isolated worktree paths. Their prompts specified permitted actions without expected reading choices. [The snapshot](guideline-snapshot.json) identifies the four evaluated files on base `0a6ac0b180370c03d6c10095aae577a003254834`.

| Observation | Run A | Run B |
| --- | --- | --- |
| Requested template edit | Correct; no other tracked edits beyond the baseline | Correct; no other tracked edits beyond the baseline |
| Required authoring guidelines | Read whole | Read whole |
| Command catalog | Selected sections | Entire catalog, including unrelated operations |
| Project settings | Selection, Identity and Revise configuration | Variant configuration not inspected |
| Configured summary tests | Three pass | Not run; the parent ran them on the production revision |
| Output truncation | None observed | None observed |

Strict disclosure compliance is not established. Run B explicitly reports its unnecessary whole-catalog read. Its omission of project settings also leaves the configured check unexecuted. These failures remain part of the evidence; successful file edits and structural checks do not discharge them.

Neither run reread an entire required authoring guide. Run B used overlapping searches and range reads for Review's consumer guidance. Both agents retried validation after sandbox namespace failures. No comparable token baseline was collected, so no performance improvement or regression is claimed.

This delivery augments authoring and verification guidance. The earlier Review findings remain in [the initial report](report.md); consistent selective reading remains an observed limitation, and the skill as a whole has not satisfied its strict disclosure completion criterion.

## Evidence

- Run A: [tool trace](guidelines-revise-a-trace.json), [section audit](guidelines-revise-a-audit.json), [agent result](guidelines-revise-a-result.md); session `01a12562-1783-7641-aa65-e1458545dab7`.
- Run B: [tool trace](guidelines-revise-b-trace.json), [section audit](guidelines-revise-b-audit.json), [agent result](guidelines-revise-b-result.md); session `01a12562-2cb8-7e03-8e43-e2fdb73c7194`.
- [Extraction script](audit_guideline_iteration.py) retains tool inputs and returned output, excluding private reasoning.

## Delivery

Commit `453cc4d437686d18370c7cdc66422a442fb5a099` is pushed to `skill/work-designer` in [PR 1295](https://github.com/m2ux/workflow-server/pull/1295). The worktree is clean, the upstream and GitHub head match, and the PR body records the shared guidelines, passing mechanical checks and partial live disclosure results.
