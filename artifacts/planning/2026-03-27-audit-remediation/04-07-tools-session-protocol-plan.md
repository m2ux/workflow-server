# WP-07: Tools Session Protocol

## Scope

**In scope:**
- QC-032: `get_skills` swallows skill-load failures
- QC-033: `JSON.parse` without try/catch in `save_state`
- QC-034: Hard-coded encryption key name
- QC-035: Key rotation has no migration path
- QC-036: State tools skip workflow consistency validation
- QC-037: `start_session` token return location inconsistency
- QC-038: `get_trace` indistinguishable states
- QC-039: Silent duplicate resource dropping
- QC-092–QC-100: 9 Low-severity tool-layer fixes

**Out of scope:**
- State tools security (WP-01)
- Utils-level session/crypto changes (WP-08)

**Files:** `src/tools/workflow-tools.ts`, `src/tools/resource-tools.ts`, `src/tools/state-tools.ts`

## Dependencies

None.

## Effort

17 findings across 3 files. Medium-large scope — protocol declaration is the anchor task.

## Success Criteria

- Skill-load failures in `get_skills` are reported in response (not silently dropped)
- `JSON.parse` has try/catch with structured error response
- State tools validate workflow consistency
- `start_session` token location matches documented contract
- `npm run typecheck` and `npm test` pass
