# Test Suite Review — refresh workflow-server docs

**Branch:** `chore/refresh-workflow-server-docs` (PR [#119](https://github.com/m2ux/workflow-server/pull/119))
**Scope:** docs-only change set — no source code, no schema, no test files modified.
**Reviewer:** workflow-orchestrator (post-impl-review activity, O2ZUQL)
**Date:** 2026-05-14

---

## Scope

The diff (`git diff main..HEAD --name-only`) returns 12 files, all under `docs/`, `schemas/`, or repo-root (`README.md`, `SETUP.md`, `AGENTS.md`, `CLAUDE.md`). One file (`docs/orchestra-specification.md`) shallow-matched a `spec` substring but is a specification document, not a test file.

**No test files were added, modified, or removed.** The existing Vitest suite is unchanged.

---

## Verification baseline

Per the implementation summary in `README.md` and the work-package plan (`05-work-package-plan.md`), the test suite was run as a sanity check:

- `npm run typecheck` — passed before and after the doc edits.
- `npm test -- --run` — 256 passed, 2 skipped, 0 failed, before and after the doc edits.

Documentation-only changes cannot affect compilation or runtime behaviour, so the baseline being preserved is the expected outcome rather than a confirming signal.

---

## Findings

### Critical / Major / Minor
None.

### Nit

**N1 — No automated check guards the link integrity introduced by this PR.**
- **Observation:** The refresh adds several relative links (`docs/ide-setup.md` references `../README.md`, `../SETUP.md`, `workflow-fidelity.md`, etc.; `schemas/README.md` adds links to `../docs/resource_resolution_model.md` and `../docs/ide-setup.md`). The code-review report verified each target exists *today*, but no test in the suite will catch a future broken link if one of those targets is renamed or removed.
- **Recommendation:** Out of scope for this PR. A `markdown-link-check` step in CI would close the loop. Filing as a candidate enhancement for a future docs-infra work package.

**N2 — `docs/api-reference.md` deprecation note on `get_skills` is asserted twice (in the doc and in the tool's description string) but no test enforces parity.**
- **Observation:** Both `docs/api-reference.md` and `src/tools/resource-tools.ts:268` carry the literal phrase "DEPRECATED" / "**Deprecated**". A future PR that un-deprecates the tool in the source description would silently leave the docs claiming otherwise. The MCP server's description string is the wire-level source of truth — the doc is a redundant copy.
- **Recommendation:** Out of scope. A test that snapshots the `discover` / `health_check` / tool list output and compares against the doc's tool table would catch this class of drift.

### Informational

**I1 — The schemas-as-MCP-resource claim added to `schemas/README.md` is testable via the existing resource tests but not asserted by name.**
- **Observation:** `schemas/README.md` now states "the server also exposes these schemas as MCP resources under `workflow-server://schemas` (combined) and `workflow-server://schemas/{id}` (per schema)". The MCP resource registration in `src/resources/` is exercised by existing tests, but no test asserts the *URI form* of the resource. Documentation accuracy is therefore guaranteed only by code review.
- **Recommendation:** None for this PR.

---

## Coverage gaps relative to the doc claims

For completeness, the following claims in the doc set are not currently asserted by any test:

| Doc claim | Where asserted in tests | Gap |
|-----------|-------------------------|-----|
| "The server registers 17 MCP tools" (`README.md`) | None — no test counts tool registrations | Closed by manual `grep -c "server\.tool"`, but not by CI. |
| "`SCHEMAS_DIR` defaults to `./schemas`" (`SETUP.md`) | `src/config.ts` tested transitively via server boot | No direct test of the env-var fallback chain. |
| "`get_workflow` returns initialActivity" (`README.md` step 2) | `tests/mcp-server.test.ts` exercises `get_workflow` end-to-end | Field name assertion present; semantic-prose match is not. |
| "Skills are containers for named operations, rules, and errors" (`schemas/schema-header.md`) | Skill schema test asserts field presence | Conceptual framing is unverified. |

These gaps are not blocking — they describe the conservation-law boundary identified in the structural analysis: doc surfaces with low (b) (verifiable-correctness) lean on review rather than automation. Closing them is a separate work-package decision.

---

## Test-quality assessment

Not applicable — no test code was added or modified.

For reference, the existing test suite covers:
- MCP tool round-trip behaviour (`tests/mcp-server.test.ts`)
- Token lifecycle (HMAC sign/verify, parent/child)
- Workflow / activity / skill loaders
- Resource resolution
- Schema validation

The pre- and post-edit pass count (256/2/0) is identical, confirming no regression introduced by the doc edits.

---

## Summary

**Severity totals:** Critical 0 · Major 0 · Minor 0 · Nit 2 · Informational 1.

**Conclusion:** No test-suite findings at severity >= Minor. Setting `needs_test_improvements=false`. The Nit/Informational items are candidates for a future docs-infrastructure work package, not blockers for this PR.
