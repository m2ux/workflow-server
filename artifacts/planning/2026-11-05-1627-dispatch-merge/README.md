# Lane and Automatic Dispatch Integration

## Scope

Resolve PR #1627 against workspace f1007d1db, which contains #1636 automatic dispatch. Merge the target into the existing epic worktree without rewriting shared history. Keep Lane admission, invalid-unit handling, report labels, Ready Units ownership and DRY fixes; retain continuous authorization, dispatch exports, capacity/refill, preparations and duplicate-session protection from the target.

## Resolution

Combine lane-filtered survey reports with dispatch export entries. Use the continuing coordinator as the Deliver lifecycle, carrying a fresh request lane through its fixed authorization and every survey/retry. Link the new dispatch batch consumer to Lane’s existing index contract. Add real survey-to-batch regressions for opaque lane matching and independent valid work beside malformed/mixed-lane units. Preserve target additions unrelated to these interfaces byte-for-byte.

## Checklist

- [x] Refresh branches and identify the three conflicted files.
- [ ] Resolve textual and semantic conflicts, preserving both sides. **In progress.**
- [ ] Run combined behavior, document and structural validation; review preservation.
- [ ] Commit and plain-push, then read back mergeability and renew review evidence.
