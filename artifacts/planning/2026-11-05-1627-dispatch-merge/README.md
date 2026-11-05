# Lane and Automatic Dispatch Integration

## Scope

Resolve PR #1627 against workspace f1007d1db, which contains #1636 automatic dispatch. Merge the target into the existing epic worktree without rewriting shared history. Keep Lane admission, invalid-unit handling, report labels, Ready Units ownership and DRY fixes; retain continuous authorization, dispatch exports, capacity/refill, preparations and duplicate-session protection from the target.

## Resolution

Combine lane-filtered survey reports with dispatch export entries. Use the continuing coordinator as the Deliver lifecycle, carrying a fresh request lane through its fixed authorization and every survey/retry. Link the new dispatch batch consumer to Lane’s existing index contract. Add real survey-to-batch regressions for opaque lane matching and independent valid work beside malformed/mixed-lane units. Preserve target additions unrelated to these interfaces byte-for-byte.

## Checklist

- [x] Refresh branches and identify the three conflicted files.
- [x] Resolve textual and semantic conflicts, preserving both sides.
- [x] Run combined behavior, document and structural validation; review preservation.
- [x] Commit and plain-push, then read back mergeability and renew review evidence.

## Evidence

- [review.md](review.md)
- [planner-tests.log](planner-tests.log)
- [shared-tests.log](shared-tests.log)
- [preservation.json](preservation.json)

## Current Review Evidence

- [agent-review.json](agent-review.json)
- [criterion-audit.md](criterion-audit.md)
- [architecture-overview.md](architecture-overview.md)
- [graph-analysis.log](graph-analysis.log)
- [graph-measure.mjs](graph-measure.mjs)
- [graph-measure.log](graph-measure.log)
- [graph-context.yaml](graph-context.yaml)
- [graph-changes.json](graph-changes.json)
- [graph-contexts.json](graph-contexts.json)
- [graph-traces.json](graph-traces.json)
- [pull-request.json](pull-request.json)
- [human-reviews.json](human-reviews.json)
- [target-rules.json](target-rules.json)
- [head-checks.json](head-checks.json)

## Handoff

Merge commit `1ebd241841fc5963743cb0440dfaeb97d9e9ab34` includes target `f1007d1db7d2a4301c22e367cd12e726775833ca`. GitHub reads mergeable true, ready and unmerged; current review evidence passes. Project 17 item 291913055 reads In Review. No target merge or issue closure is performed.

- [Final PR Readback](pull-request-final.json)
- [Final Board Readback](board-final.json)
