# Strategic Review — Fix Work Package Transition Folder Defect

**Activity:** strategic-review (07)
**Date:** 2026-05-20
**Reviewed commit:** `e5c323d` on `fix/work-package-transition-folder-defect`
**Base:** `origin/main` (merge-base `5c92e45`)

---

## Summary verdict

The implementation is minimal, focused, and scope-conformant. The diff matches the plan exactly: one branch in `dispatch_child` (`src/tools/resource-tools.ts`) rewritten end-to-end, the tool description string updated to describe the new behaviour, and two existing tests in `tests/mcp-server.test.ts` flipped from asserting the buggy shape to asserting the documented contract. No investigation artifacts, no over-engineering, no orphaned infrastructure. Post-implementation review found zero Critical / Major / Minor / Nit findings; validation passed (322 tests, typecheck clean).

**Recommended option (first pass):** `acceptable`.
**Resolution:** User selected `fix-findings`. S2 (slug-prefix coupling) was addressed via Alternative A — see "S2 fix" section near the end of this document.

---

## Scope check

| Dimension | Expected from plan | Observed |
|---|---|---|
| Files touched | `src/tools/resource-tools.ts`, `tests/mcp-server.test.ts` | Same — exactly two files |
| Diff size | Small, contained | `+105 / -40` total |
| New helpers / abstractions | None | None — re-uses `ensurePlanningFolder`, `computeEmbeddedSessionIndex`, `createInitialSessionFile`, `advanceSession`, `writeSessionFile`, `discardTransient` already imported by the persistent-parent branch |
| Schema changes | None | None |
| Migration of pre-existing on-disk records | None | None — fix governs forward behaviour only |
| Tests added / changed | Two existing tests flipped; four persistent-branch tests untouched as regression coverage | Confirmed — diff matches |

No scope expansion. No incidental refactors. No unrelated drift.

---

## Plan-vs-implementation deviation (already documented)

The plan called for the promoted slug to be derived as `lookupTransientSlugByFolder(parentFolder) ?? \`${YYYY-MM-DD}-${workflow_id}\``. The implementation uses a guarded form: `(registrySlug && !registrySlug.startsWith('transition-')) ? registrySlug : <dated fallback>`.

This is a behaviour-preserving refinement, not a scope expansion. `start_session` always registers *some* slug (synthetic `transition-<uuid>` when `planning_slug` is omitted), so the bare `??` would never fall through and the workspace folder would inherit the synthetic UUID — the exact symptom the work package was meant to eliminate. The guard ensures synthetic slugs are treated as "no user slug supplied" so the promoted folder gets a stable dated name.

The deviation is documented in:
- `README.md` § Implementation Notes
- `06-post-impl-review.md` § "Slug-derivation logic (the deviation)" and finding F1

Surfacing it again here for the strategic-review trail: the implementation correctly delivers the user-visible contract specified by the plan (stable, human-readable workspace folder name). The internal shape of how that name is derived diverges from the plan in a benign, well-commented way.

---

## Identified artifacts — investigation cruft / over-engineering / orphans

None.

- **Investigation artifacts.** No throwaway scripts, scratch files, or exploratory `console.log` calls in the diff. Comments in the new branch explain *why* (the two deltas from the persistent branch, the synthetic-slug rationale) — they do not narrate *what* the code does.
- **Over-engineering.** No speculative helpers, no premature abstractions, no defensive code paths that aren't exercised. The new branch mirrors the persistent-parent branch's structure step-for-step, which is the right shape for a contract-conformance fix.
- **Orphaned infrastructure.** No new imports, no unused parameters, no dead code added. The `parentSession` field on the child `createInitialSessionFile()` call was correctly *removed* (the prior buggy code set it; the fixed code embeds the child under `triggeredWorkflows[0].state` instead).
- **Planning-folder hygiene.** All artifacts in the planning folder are produced by completed activities and listed in the README Progress table. The new comprehension artifact (`comprehension/dispatch-child-transient-parent.md`) is a legitimate persistent codebase-knowledge document, referenced from the Progress table.

No cleanup actions performed; none needed.

---

## README conformance

Verified `README.md` against resource 01 (work-package readme template, v3.0.0):

| Check | Result |
|---|---|
| Single H1 title | Pass |
| Header block fields (Created, Status, Type) | Present |
| H2 sections required by template (Executive Summary, Problem Overview, Solution Overview, Progress, Links) | All present |
| Progress table hyperlinks artifacts | Yes |
| Links table includes PR reference | Yes (issue intentionally skipped — `issue_skipped = true` via issue-verification checkpoint) |

`readme_conformance.conforms = true`. The README adds one extra H2 (`Implementation Notes`) outside the template's required set; this is informational content documenting the slug-derivation deviation and is not flagged by the conformance contract (which checks for missing required H2s and renamed header fields, not extras that follow the template's spirit).

---

## Change-fragment check

`workflow-server` does not have a `changes/` directory at its repository root (verified via `ls` at the target_path root). The `ensure-changes-folder-entry` and `verify-change-fragment` steps are no-ops for this project.

`fragment_references_issue = null` (no changes directory exists).

---

## Unsigned-commits checkpoint outcome

The validation activity flagged commit `e5c323d` as unsigned (`%G? = N`). The `unsigned-commits-prompt` checkpoint was presented; the user selected `decline-resign` (option id: `decline-resign`) on 2026-05-20T11:52:06Z.

Effect: `resign_unsigned_commits_requested = false`. History is preserved as-is — the commit remains in the PR range without a GPG signature. This is consistent with the repo's DCO-sign-off convention; no further action required on this branch.

Documented for the audit trail. No re-sign was performed.

---

## Strategic findings

| ID | Severity | Type | Description | Status |
|---|---|---|---|---|
| S1 | Informational | Audit trail | Commit `e5c323d` is not GPG-signed; user declined re-sign at the unsigned-commits-prompt checkpoint. | Documented; no action |
| S2 | Informational | Architecture (carry-over from F1 in `06-post-impl-review.md`) | `registrySlug.startsWith('transition-')` couples the dispatch_child call site to the synthetic-slug minting convention owned by `start_session`. Two viable refactor shapes (registry-level distinction, or co-located `isSyntheticTransientSlug` predicate) were proposed in the post-impl review. | **Addressed** — see "S2 fix" section below |

No findings at Minor severity or above. No scope drift. No follow-up tasks created.

---

## S2 fix — slug-prefix coupling removed (Alternative A)

After the `review-findings` checkpoint resolved to `fix-findings`, S2 was addressed using the registry-level distinction (Alternative A in the post-impl review). The change is a behaviour-preserving refactor that pushes the "is this slug user-supplied?" signal into the data model, eliminating the string-prefix sniffing at the dispatch site.

### Edits

`src/tools/resource-tools.ts`, two locations:

1. **`start_session` (line 113 area).** Added `const slugIsSynthetic = planning_slug === undefined;` immediately before the `??`-minting line that produces a `transition-<uuid>` slug when no `planning_slug` was supplied. The boolean records, at the source, whether the slug came from the caller or was minted by the server.

2. **`start_session` registry write (line ~202).** The `registerTransient(sessionIndex, folder, slug)` call now passes `slugIsSynthetic ? undefined : slug`. With `slug` undefined, `registerTransient` skips `transientFolderBySlug.set(...)` (see `store.ts:779-782`) — synthetic slugs are still tracked in `transientFolderByIndex` for `resolveSessionIndex` but are deliberately absent from the by-slug map.

3. **`dispatch_child` transient branch (line ~298).** Reverted to the plan's original `??` form:

   ```ts
   const promotedSlug =
     lookupTransientSlugByFolder(parentFolder)
     ?? `${new Date().toISOString().slice(0, 10)}-${workflow_id}`;
   ```

   With synthetic slugs un-registered, `lookupTransientSlugByFolder` returns `undefined` for the synthetic case and the dated-fallback branch fires naturally. The `startsWith('transition-')` guard is gone.

Code comments updated at both sites to explain the new contract.

### Why Alternative A over B

The post-impl review listed Alternative B (extract an `isSyntheticTransientSlug(slug)` predicate co-located with the minting site) as an acceptable but slightly weaker alternative. Alternative A was chosen because:

- It removes the coupling entirely rather than relocating it — there is no slug-shape predicate anywhere in the codebase after the change.
- It pushes the user-supplied vs. server-minted distinction into the data model, which is the structurally cleanest fix.
- It is no larger than B in line count and required no new exported function.
- `lookupTransientBySlug` has exactly one caller (`start_session` line 123), and that caller looks up a slug the caller themselves supplied — synthetic slugs are minted from a fresh UUID per call and would never match a future lookup, so removing them from `transientFolderBySlug` has no observable behaviour change beyond the intended one.

### Coupling analysis after the fix

- `src/tools/resource-tools.ts:113` — synthetic-slug minting site. The string `transition-` appears here and only here.
- `src/tools/resource-tools.ts:298` — dispatch_child transient branch. No longer references the literal `transition-`; depends only on the registry's documented absence-vs-presence semantics for `lookupTransientSlugByFolder`.
- `src/utils/session/store.ts:779-782` — `registerTransient`. Unchanged. Already had the optional `slug` parameter and the documented "only set in by-slug map when slug is present" semantics.

The slug-minting convention can now change (`transition-<uuid>` → `bootstrap-<uuid>` → anything else) and only the minting site needs to be touched — no other call site has to be kept in sync.

### Validation

- `npm run typecheck` from the worktree: clean, no errors.
- `npm test` from the worktree: 322/322 passing (regression suite includes both the persistent-parent branch coverage and the two transient-branch contract tests flipped in commit `e5c323d`).

### Commit

Committed as a separate refactor commit on `fix/work-package-transition-folder-defect`:

```
refactor: drop slug-prefix coupling in dispatch_child transient branch
```

No squash with `e5c323d`; the refactor stands on its own so the bisect/blame trail keeps the original fix and the architectural cleanup separately visible.

---

## Variables set

| Variable | Value |
|---|---|
| `review_findings` | `[S1: Informational — unsigned commit declined; S2: Informational — slug-prefix coupling addressed via Alternative A]` |
| `items_removed` | `[]` (no cleanup performed) |
| `fragment_references_issue` | `null` (no `changes/` directory at target_path root) |
| `recommended_strategic_option` | `acceptable` (after fix) |
| `needs_strategic_fixes` | `true` (set by checkpoint resolution); fix applied — re-evaluating to `review_passed = true` |
| `strategic_findings_summary` | (see below) |

### `strategic_findings_summary`

```
S1: Unsigned commit (e5c323d) — user declined re-sign at checkpoint; documented.
S2: Slug-prefix coupling (transition-) — addressed via Alternative A (registry-level
    distinction). Synthetic slugs are no longer registered in transientFolderBySlug;
    dispatch_child reverts to the plan's bare `??` fallback. Typecheck clean, all
    322 tests pass.
```

---

## Recommended next step

`acceptable` — S2 has been addressed in code (separate refactor commit on the branch). S1 remains Informational (user-declined; nothing to do). No further changes required before submit-for-review.
