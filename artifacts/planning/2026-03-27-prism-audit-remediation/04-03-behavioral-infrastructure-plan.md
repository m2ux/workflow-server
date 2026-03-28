# WP-03: Behavioral & Infrastructure Fixes

**Package:** Behavioral & Infrastructure Fixes
**Priority Group:** P2–P4
**Estimated Effort:** 2–3 hours agentic + 30 min review

---

## Scope

### In Scope

| Finding | Description | Severity |
|---------|-------------|----------|
| F-04 | Fix loose equality (`==` → `===`) in condition evaluation at `condition.schema.ts:64-65` | MEDIUM |
| F-12 | Define `MetaResponseSchema` for `_meta` response objects and validate in tool handlers | LOW |
| F-14 | Fix cross-process key race in `crypto.ts:24-42` using file locking or atomic creation | LOW |
| F-15 | Add `schemasDir` to test config in `mcp-server.test.ts:20-24` | LOW |

### Out of Scope

- Schema alignment (WP-01)
- Validation enforcement (WP-02)

## Dependencies

- **None** — all four findings are in isolated modules. This package can run in parallel with WP-01 or WP-02 if separate branches are used.

## Tasks

1. **F-04**: In `condition.schema.ts`, change `value == condition.value` to `value === condition.value` and `value != condition.value` to `value !== condition.value` in the `evaluateSimpleCondition` function
2. **F-12**: Define `MetaResponseSchema` in `src/utils/validation.ts` (or a new file) with `{ session_token: z.string(), validation: ValidationResultSchema }`. Add a helper function used by tool handlers to construct validated `_meta` objects
3. **F-14**: In `crypto.ts`, add atomic key file creation using `O_EXCL` flag (or `flock`-based advisory locking) to prevent the TOCTOU race in `loadOrCreateKey()`
4. **F-15**: Add `schemasDir: resolve(import.meta.dirname, '../schemas')` to the test config object in `mcp-server.test.ts`
5. Run `npm run typecheck` and `npm test`

## Success Criteria

- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] Condition evaluation uses strict equality (`===` / `!==`)
- [ ] `_meta` responses have a defined schema
- [ ] Key creation is atomic (no TOCTOU race window)
- [ ] Test config includes `schemasDir`

## Risk

- **F-04 behavioral change**: Changing `==` to `===` is a semantic change. Any existing workflow conditions that rely on type coercion (e.g., comparing string `"1"` to number `1`) will stop matching. This is the correct behavior per the JSON Schema documentation but could surface latent issues in workflow TOON files.
- **F-12 scope creep**: Adding `MetaResponseSchema` validation to all tool handlers touches many files. Keep the change minimal: define the schema, add a `buildMeta()` helper, update handlers to use it. Do not refactor the handler response structure beyond what's needed.
