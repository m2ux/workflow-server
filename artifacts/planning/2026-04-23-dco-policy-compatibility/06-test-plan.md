# Test Plan — DCO Policy Compatibility

**Activity:** plan-prepare
**Date:** 2026-04-23 (backfilled 2026-05-19 from authored PR content)
**Branch:** `feat/dco-policy-compatibility`
**PR:** [#109](https://github.com/m2ux/workflow-server/pull/109)
**Mode:** Resume — verification surface reverse-engineered from the actual implementation.

---

## Scope and Approach

The change set is **workflow content only** — TOON edits under `work-package/`, one new skill file, and one PR-description resource. No `src/`, no `schemas/`, no runtime server code is touched. Correctness is therefore verified by:

1. **Schema validation** — does the edited workflow content parse and bind against the workflow-server schemas?
2. **Type integrity** — does the server still compile cleanly after the workflow-data changes?
3. **Regression** — does the existing 322-test vitest suite still pass?

No new tests were authored as part of this work package, and none are required: the verification surface (the workflow schema validators and the existing test suite) already covers every property the change set affects.

---

## Verification Commands

All three commands are run from the repository root.

### V1 — Workflow TOON validation

```bash
npx tsx scripts/validate-workflow-toon.ts work-package
```

**Expected output:** `all-valid` for the `work-package` workflow. The validator checks:

- Every variable referenced by an activity step or checkpoint exists in `work-package/workflow.toon`'s variable surface — this catches stale references to the three removed variables (T1) and orphan references to the two added ones.
- Every skill ID referenced by an activity's supporting-skills list resolves to a file in `work-package/skills/` — this catches the new `dco-provenance` reference (T3, T4, T8) and any stale reference to a deleted skill.
- Every checkpoint option ID is unique within its checkpoint — catches duplicate options on the new `dco-sign-off` (T8) and `declare-context-scope` (T3) checkpoints.
- Every artifact ID maps to a path under the planning folder — catches the new `provenance-log` artifact declaration (T4).
- Every transition target resolves to an activity that exists — catches no-op renames.

**Relevance to tasks:** Covers T1–T13 in full. Every TOON edit in the change set surfaces here.

---

### V2 — Server typecheck

```bash
npm run typecheck
```

**Expected output:** clean exit (no TypeScript errors).

**Relevance to tasks:** Indirect — the server source is unchanged, so the typecheck is a regression check against any unintended source modification. Catches any accidental edit to `src/` or `schemas/` that slipped in alongside the workflow-content changes.

---

### V3 — Vitest suite

```bash
npm test
```

**Expected output:** all 322 tests pass.

**Relevance to tasks:**

- Workflow-loader tests confirm `work-package/workflow.toon` parses and the activity index resolves — catches catastrophic TOON syntax errors that V1's structural validator might miss.
- Skill-binding tests confirm every supporting-skill reference resolves at load time — second line of defence for the `dco-provenance` references added by T3, T4, T8.
- Schema snapshot tests confirm the activity definitions match expected shapes — catches accidental reordering or field removal in the eight touched activities (T2, T3, T4, T5, T6, T7, T8, T9).
- Operation-resolver tests confirm operations referenced by step bundles still resolve — catches removed-step fallout from T6, T7, T8, T9, T10.

---

## Per-Task Verification Mapping

| Task | V1 (TOON) | V2 (typecheck) | V3 (vitest) |
|------|:--------:|:--------------:|:-----------:|
| T1 — Variable-surface cleanup | ✅ | — | ✅ |
| T2 — `detect-merge-strategy` step | ✅ | — | ✅ |
| T3 — `declare-context-scope` checkpoint | ✅ | — | ✅ |
| T4 — `provenance-log` artifact + step | ✅ | — | ✅ |
| T5 — Rationale confirmation strengthening | ✅ | — | ✅ |
| T6 — Drop GPG preflight scan | ✅ | — | ✅ |
| T7 — Drop unsigned-commits prompt + resign | ✅ | — | ✅ |
| T8 — DCO sign-off + merge-strategy reminder | ✅ | — | ✅ |
| T9 — Drop resign-artifact-commits | ✅ | — | ✅ |
| T10 — `15-manage-git` protocol changes | ✅ | — | ✅ |
| T11 — New `25-dco-provenance` skill | ✅ | — | ✅ |
| T12 — PR-description AI Assistance section | — | — | — |
| T13 — Skill-inventory renumbering | — | — | — |
| (no source change) | — | ✅ | ✅ |

**T12 and T13 caveats:**

- T12 (`12-pr-description.md`) is a resource template; the validator does not parse Markdown bodies. Verification is by manual inspection that the section renders correctly when the PR-description template is rendered by `12-submit-for-review`.
- T13 (README count consistency) has no automated validator. The two README files are checked manually.

---

## Test Results at Rebase Point

The same three commands were run after rebasing PR #109 onto `workflows` HEAD `a2645ca` (the 2026-05-18 sweep including cargo-operations and the worktree refactor):

| Command | Result | Notes |
|---------|--------|-------|
| `npx tsx scripts/validate-workflow-toon.ts work-package` | ✅ all-valid | No warnings on the `work-package` namespace. |
| `npm run typecheck` | ✅ clean | No errors. |
| `npm test` | ✅ 322/322 pass | No regressions. |

Recorded in `README.md` Progress table under the **Validation** row (`✅ Complete`).

---

## Out-of-Scope Verification

The following are deliberately **not** verified by this test plan:

1. **End-to-end run on a real target repo.** The new `detect-merge-strategy` step calls the GitHub REST API; the new `dco-sign-off` checkpoint requires a human-in-the-loop response; the new `merge-strategy-reminder` checkpoint surfaces conditionally on `squash_merge_available`. None of these are exercised by the static validator or the unit-test suite. A real run would be needed to confirm the full UX path. **Mitigation:** assumptions D1, F2, F3 in `01-assumptions-log.md` flag the gap; an external-validation run is planned as a follow-on.
2. **PR-description Markdown rendering.** GitHub's Markdown renderer is not invoked by the test suite. The `## AI Assistance` section (T12) is verified visually by opening the rendered PR description in the GitHub UI.
3. **`Co-authored-by:` trailer behaviour across harnesses.** The new `code-commits` protocol (T10) documents that Claude Code injects the trailer automatically and other assistants must add it explicitly. Validating the actual harness behaviour requires running each harness; that is out of scope here and falls to operational documentation.
4. **GPG-resign infrastructure absence.** Removing the resign protocol and steps is verified by V1 (no orphan references), but there is no separate test that asserts "the workflow never resigns a commit." If a future task accidentally reintroduces the protocol, it would have to be referenced by an activity to fail validation — silent reintroduction without a referencing step would pass V1.

---

## Resume-Mode Note

This test plan was reverse-engineered after the implementation was already complete and verified. The verification commands listed here are the same three commands that were actually run at rebase time; the test plan formalises the verification surface that the work package implicitly relied on.
