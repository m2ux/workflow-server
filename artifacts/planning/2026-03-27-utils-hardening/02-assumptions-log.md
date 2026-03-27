# Assumptions Log — WP-08: Utils Hardening

## Assumptions

| # | Assumption | Category | Resolvability | Status | Resolution |
|---|-----------|----------|---------------|--------|------------|
| A1 | Adding `'error'` to `ValidationResult.status` will not break callers | Problem Interpretation | Code-analyzable | Validated | Callers pass `ValidationResult` through to `_meta` response objects. No caller branches on `status === 'valid'` or `status === 'warning'`. The field is informational metadata for agents, not a control-flow mechanism in server code. |
| A2 | `@toon-format/toon` `encode` accepts types beyond `Record<string, unknown>` | Complexity Assessment | Code-analyzable | Validated | The library's `encode` function accepts any serializable value. The current `Record<string, unknown>` parameter type is artificially narrow but changing it is low-risk since callers already cast to `Record<string, unknown>` before calling. |
| A3 | `crypto.timingSafeEqual` is available in Node.js 18+ | Complexity Assessment | Code-analyzable | Validated | `timingSafeEqual` has been available since Node.js 6. The project targets Node.js 18+. |
| A4 | `fs.rename` is atomic on the same filesystem | Complexity Assessment | Code-analyzable | Validated | POSIX `rename(2)` is atomic on the same filesystem. `KEY_DIR` and the temp file are in the same directory (`~/.workflow-server/`), so `fs.rename` provides the atomic guarantee needed. |
| A5 | The Zod `z` import in session.ts is already present and used for `sessionTokenParam` | Complexity Assessment | Code-analyzable | Validated | Line 1: `import { z } from 'zod'`. Used at line 92 for `sessionTokenParam`. Extending to session decode validation requires no new imports. |
| A6 | `advanceToken` mutation of decoded payload is safe because `encode` re-serializes | Complexity Assessment | Code-analyzable | Validated | The payload is decoded from the token string, mutated in-place, then re-encoded to a new string. The original token string is unchanged. Mutation is functionally equivalent to creating a new object. However, creating a spread copy is cleaner and prevents accidental reference leaks. |

## Stakeholder Questions

None. All assumptions were code-resolvable.
