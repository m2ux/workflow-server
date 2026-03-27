# WP-09: Test Infrastructure

**PR:** #76
**Branch:** fix/wp09-test-infrastructure
**Findings:** 18 (3 High, 9 Medium, 6 Low)

## Changes

| ID | Severity | Fix |
|----|----------|-----|
| QC-016 | High | Scope `sessionToken` per test via `beforeEach` |
| QC-017 | High | Add malformed TOON fixture tests for skill-loader and activity-loader |
| QC-018 | High | Remove sequential dependencies in trace lifecycle tests |
| QC-070 | Medium | Replace `toBe('3.4.0')` with semver structural assertion |
| QC-071 | Medium | Replace `toBe(14)` with `toBeGreaterThanOrEqual` |
| QC-072 | Medium | Replace `toBe(5)` with `toBeGreaterThanOrEqual` |
| QC-073 | Medium | Extract `parseToolResponse` helper (~30 call sites) |
| QC-074 | Medium | Remove `encodeToon` double cast |
| QC-075 | Medium | Verify `get_skills` response token in `_meta` |
| QC-076 | Medium | Normalize path resolution to `import.meta.dirname` |
| QC-077 | Medium | Add schema-to-loader integration tests |
| QC-078 | Medium | Add concurrent session isolation test |
| QC-128 | Low | Strengthen tampered token test with proper payload modification |
| QC-129 | Low | Cache `readRules` calls via `beforeAll` |
| QC-130 | Low | Replace dynamic import with static import |
| QC-131 | Low | Verify error content for removed tool tests |
| QC-132 | Low | Remove duplicate hardcoded version (same fix as QC-070) |
| QC-133 | Low | Derive tampered token from decoded payload instead of hardcoding fields |
