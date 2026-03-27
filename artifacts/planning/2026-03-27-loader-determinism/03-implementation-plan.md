# Implementation Plan — WP-06: Loader Determinism and Deduplication

## Task Sequence

### Phase 1: Shared utility extraction
1. **QC-021** — Create `src/loaders/filename-utils.ts` with `parseActivityFilename`. Update imports in `activity-loader.ts` and `workflow-loader.ts`. Remove the local copies.

### Phase 2: Determinism fixes
2. **QC-007** — In `activity-loader.ts`, sort the `workflowIds` array returned by `findWorkflowsWithActivities` before iteration.
3. **QC-008** — In `skill-loader.ts`, sort the `workflowIds` array returned by `findWorkflowsWithSkills` before iteration.
4. **QC-029** — In `resource-loader.ts`, sort files before matching in `readResource` and `readResourceRaw`. When both TOON and MD exist for the same index, prefer TOON.
5. **QC-030** — Align meta-workflow filtering: `findWorkflowsWithActivities` should also exclude meta workflow (matching `findWorkflowsWithSkills` behavior), since meta activities are already handled separately in the resolution chain.

### Phase 3: Performance and cleanup
6. **QC-084** — In `workflow-loader.ts`, sort activities by their already-assigned `artifactPrefix` instead of re-parsing filenames in the comparator.
7. **QC-085** — In `resource-loader.ts`, standardize regex from `\d{2}` to `\d+` (activity/skill loaders already use `\d{2}` but resource indices genuinely vary in width). Keep `\d+` for resources, change activity/skill to `\d+` for consistency.
8. **QC-086** — In `schema-loader.ts`, remove the outer try-catch that wraps the for-loop (unreachable).
9. **QC-087** — In `activity-loader.ts`, remove unused `DEFAULT_ACTIVITY_WORKFLOW` constant.
10. **QC-088** — In `activity-loader.ts`, refactor `readActivityIndex` to reuse the file list from `listActivities` rather than re-reading directories via `readActivity`.
11. **QC-089** — In `skill-loader.ts`, refactor `readSkillIndex` to reuse file lists rather than re-reading directories.
12. **QC-090** — In `resource-loader.ts`, change `padStart(2, '0')` to `padStart(3, '0')` to handle 3-digit indices, and ensure comparison logic is consistent.

### Phase 4: Verification
13. Run `npm run typecheck` and `npm test`.
14. Commit and push.

## Files Modified

| File | Findings |
|------|----------|
| `src/loaders/filename-utils.ts` (new) | QC-021 |
| `src/loaders/activity-loader.ts` | QC-007, QC-021, QC-030, QC-087, QC-088 |
| `src/loaders/skill-loader.ts` | QC-008, QC-030, QC-089 |
| `src/loaders/workflow-loader.ts` | QC-021, QC-084, QC-085 |
| `src/loaders/resource-loader.ts` | QC-029, QC-085, QC-090 |
| `src/loaders/schema-loader.ts` | QC-086 |
