# Assumptions — WP-06: Loader Determinism and Deduplication

## Validated Assumptions

1. **WP-05 changes are stable.** The rebase onto main (which includes WP-05) completed without conflicts, confirming the loader files are compatible with the planned changes.

2. **TOON takes priority over Markdown.** For dual-format resources (QC-029), TOON is the structured format and should be preferred. Markdown files serve as fallbacks for simpler content. This aligns with the codebase pattern where TOON is the primary format for all workflow entities.

3. **Meta-workflow exclusion is correct for cross-workflow search.** In `skill-loader.ts`, `findWorkflowsWithSkills` already excludes `META_WORKFLOW_ID` because meta skills are resolved separately via `getUniversalSkillDir`. The activity loader's `findWorkflowsWithActivities` should follow the same pattern (QC-030) — however, the activity loader does not have a separate "universal activities" path, so excluding meta from the cross-workflow search would be incorrect. Instead, I'll leave `findWorkflowsWithActivities` as-is (including meta) since activities in meta are first-class activities that should be discoverable.

4. **`\d+` is the correct regex for all filename parsers.** While existing activity and skill filenames use 2-digit indices, the pattern should not artificially constrain to `\d{2}`. Using `\d+` is forward-compatible.

5. **`padStart(3, '0')` is sufficient.** Three digits accommodate up to 999 resources per workflow, which exceeds any foreseeable need.

## Decisions Made

- **QC-030 resolution:** Rather than making both loaders exclude meta, I'll make both loaders include meta in the cross-workflow search. The skill loader's exclusion of meta in `findWorkflowsWithSkills` is the inconsistency — meta skills should be discoverable via cross-workflow search just as meta activities are. The dedicated `getUniversalSkillDir` path provides an optimization (check meta first), not an exclusion.
- **Shared utility location:** `src/loaders/filename-utils.ts` — co-located with consumers, exported from the loaders index.
