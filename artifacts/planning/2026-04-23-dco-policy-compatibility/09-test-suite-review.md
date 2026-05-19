# Test Suite Review — PR #109 (DCO Policy Compatibility)

**Activity:** post-impl-review (resume mode, test-suite-review step)
**Scope:** No new test files; assessment is whether the existing automated surface adequately covers the changes in this PR.
**Reviewer:** post-impl-review worker (single-pass, resume mode).

---

## Test-coverage situation for this PR

This PR is composed of workflow-TOON edits and one new TOON skill file. There is no TypeScript code change in `src/` and no schema change in `schemas/`. The relevant automated test surface for changes of this shape is:

1. **TOON schema validator** — `scripts/validate-workflow-toon.ts`. Runs against every TOON file in the workflow directory. Catches schema drift, missing required fields, type mismatches, broken cross-references between activities and skills, and orphan variable references.

2. **Server vitest suite** — `tests/*.test.ts` (13 files, 322 passing tests, 4 skipped). Covers the MCP server's loader path that ingests these TOON files at runtime: workflow registration, activity loading, skill resolution, checkpoint flow, session lifecycle, transitions.

3. **Typecheck** — `tsc --noEmit`. Catches any code-side reference (e.g. fixture-file paths in tests) that the TOON changes broke.

All three were re-run during this review:

| Surface | Command | Result |
|---------|---------|--------|
| TOON validator | `npx tsx scripts/validate-workflow-toon.ts /home/mike1/projects/work/workflow-server/2026-05-18-dco-policy-update/work-package` | All 14 activities + 26 skills pass; 0 errors |
| Vitest | `npx vitest run` | 13 test files, 322 passed, 4 skipped |
| Typecheck | `npm run typecheck` | Clean |

---

## Coverage adequacy assessment

The question for this activity is not "did the PR add tests" but "is the existing surface adequate to catch a regression introduced by this kind of change". Working through it by failure mode:

| Failure mode the PR could introduce | Caught by | Adequate? |
|--|--|--|
| New step references a variable that does not exist in `workflow.toon` | Validator's binding pass | ✅ Yes — validator failed locally when we deliberately mistyped `squash_merge_avalable` during a sanity check, then passed after the typo was corrected. |
| New step references a skill that is not declared | Validator's skill-reference pass | ✅ Yes. |
| New checkpoint references options on its own that don't exist or sets a variable not in the workflow surface | Validator's checkpoint-effect pass | ✅ Yes. |
| New skill protocol references a resource that does not exist | Validator's resource-reference pass | ✅ Yes. |
| Activity-level counter (`steps[N]`, `checkpoints[N]`, `outcome[N]`, `context_to_preserve[N]`) drifts from actual length | Validator's array-counter check | ✅ Yes. |
| Loader regression because of a TOON-format edge case | Vitest's `tests/mcp-server.test.ts` loader cases | ✅ Yes — the test suite explicitly loads `work-package` workflow and exercises the iterable surface. |
| Schema drift in the new `25-dco-provenance` skill | Validator + vitest's skill-resolution cases | ✅ Yes. |
| Runtime checkpoint-condition evaluation against the new boolean variables (`squash_merge_available`, `has_flagged_blocks`, etc.) | Vitest's checkpoint-evaluator cases (covered transitively via the work-package test suite) | ✅ Yes for type-level; ⚠️ behavioral coverage is shallow — see below. |

### Where coverage is genuinely thin

The one place where the test surface is thin for THIS PR is the **interactive behavior of the three new checkpoints**:

- `context-scope-declaration` (research, advisory + autoAdvance)
- `dco-sign-off` (submit, blocking)
- `merge-strategy-reminder` (submit, advisory + autoAdvance, conditional on `squash_merge_available`)

The existing vitest suite covers the checkpoint-yield/respond cycle generically — it does not assert end-to-end that, e.g., selecting `flag-legal` on `dco-sign-off` writes the expected `## Attestation` section to `provenance-log.md`, because there is no orchestrator-driven test runner that walks the entire activity. That gap is **structural to the workflow-TOON test strategy** and predates this PR — it is the same gap that exists for every existing checkpoint in the workflow. Closing it would require building an orchestrator simulation harness, which is well beyond this PR's scope.

For the PR's own purposes, the cost of leaving this gap is small: the new checkpoints are simple in shape (small option sets, clear effects), and the schema validator already catches the only failure modes that propagate at load time. The behavioral concerns (when does the rationale-amendment fire? — see `09-code-review.md` C1) are the kind of bug that an orchestrator-simulation test would catch, but they are caught equally cheaply by code review.

---

## Findings

| ID | Severity | Description |
|----|----------|-------------|
| T1 | Informational | No behavioral test asserts that `dco-sign-off`'s `flag-legal` branch produces an `## Attestation` section in `provenance-log.md`. Same gap exists for every existing checkpoint that mutates an artifact; not introduced by this PR. Not promoted to a finding requiring fixes. |
| T2 | Informational | No regression test asserts that the new `provenance-log` artifact appears in the planning-folder README's Progress table after `08-implement` runs. Same comment as T1 — gap is structural to the test strategy. |

No Critical / Major / Minor findings.

---

## Variable for `classify-and-route-findings`

- `needs_test_improvements` = **false** (no findings at severity >= Minor; the two Informational items are out-of-scope structural gaps and the Nit/Informational rule says they do not auto-fix).

---

## Recommendation

Accept the current test surface. The validator + vitest + typecheck triumvirate is the right level of coverage for workflow-TOON edits today. Building an orchestrator-simulation runner so behavioral assertions can be made about checkpoint flow is a worthwhile future investment but should be a dedicated work package, not a tax on this PR.
