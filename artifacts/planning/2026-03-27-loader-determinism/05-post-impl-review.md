# Post-Implementation Review — WP-06: Loader Determinism and Deduplication

## Summary

All 12 findings addressed across 6 files (5 modified + 1 new). Net change: +117 / −106 lines.

## Changes by Finding

| ID | Finding | Resolution | File(s) |
|----|---------|------------|---------|
| QC-007 | Cross-workflow activity search nondeterministic | Added `.sort()` to `findWorkflowsWithActivities` return | activity-loader.ts |
| QC-008 | Cross-workflow skill search nondeterministic | Added `.sort()` to `findWorkflowsWithSkills` return | skill-loader.ts |
| QC-021 | `parseActivityFilename` duplicated | Extracted to `filename-utils.ts`, imported by both consumers | filename-utils.ts, activity-loader.ts, workflow-loader.ts |
| QC-029 | Dual-format resource priority nondeterministic | Sort files, two-pass (TOON preferred, MD fallback) in `readResource` and `readResourceRaw` | resource-loader.ts |
| QC-030 | Contradictory meta-workflow filtering | Documented rationale: skill loader correctly excludes meta from cross-search (universal resolved separately); activity loader correctly includes meta (no separate universal path) | skill-loader.ts |
| QC-084 | Sort re-parses filenames inside comparator | Sort by `artifactPrefix` directly | workflow-loader.ts |
| QC-085 | Regex inconsistency `\d+` vs `\d{2}` | Standardized to `\d+` in shared utility | filename-utils.ts |
| QC-086 | Unreachable defensive code | Removed outer try-catch | schema-loader.ts |
| QC-087 | `DEFAULT_ACTIVITY_WORKFLOW` unused | Removed constant | activity-loader.ts |
| QC-088 | `readActivityIndex` double readdir | Reads activity files directly from enumerated paths | activity-loader.ts |
| QC-089 | `readSkillIndex` double readdir | Uses `tryLoadSkill` with known directory instead of full `readSkill` resolution | skill-loader.ts |
| QC-090 | `padStart(2, '0')` breaks for 3+ digit indices | Extracted `normalizeResourceIndex` using `padStart(3, '0')` | resource-loader.ts |

## Verification

- `npm run typecheck`: Pass
- `npm test`: 197/197 tests pass (10 test files)
- Rebase onto latest main (39 commits ahead): Clean, no conflicts

## Risk Assessment

**Low risk.** All changes are isolated to loader modules. Sort additions are additive. The shared utility extraction is a mechanical refactor with identical behavior. Dead code removal has no runtime effect.
