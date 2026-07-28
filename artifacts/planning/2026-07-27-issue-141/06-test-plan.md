# Test Plan: Hierarchical Path-Scoped Resource Section References

> **ADR:** `adr-shared-heading-anchor-table` (owed at close-out) · **Ticket:** [#141](https://github.com/m2ux/workflow-server/issues/141) · **PR:** _skipped for this package_

## Overview

This test plan validates that one shared slug specification is honoured identically by the CI guard and the runtime resolver, that a `-N` anchor is addressable, that an anchor which cannot identify a single heading turns CI red, and that no reference resolves to different content than intended.

Key changes to validate:

1. `slug` / `buildAnchorTable` (new, `src/utils/heading-anchors.ts`) - the single slug specification and the per-file anchor table carrying `{slug, baseSlug, level, lineIndex}`.
2. `fenceMask` (new, same module) - the CommonMark 0.31.2 §4.5 fence tracker replacing three naive toggles.
3. [`extractMarkdownSection`](../../../../src/utils/resource-ref.ts) - resolution becomes table lookup plus window; both of its fence scans go.
4. [`collectBrokenAnchors`](../../../../scripts/check-resource-anchors.ts) - gains the `ambiguous-anchor` reason and a sibling differential collector.
5. [`loadResourceDelivery`](../../../../src/utils/resource-delivery.ts) - unchanged code, but the surface the SC-5 byte differential is measured through.

Test IDs carry the issue number rather than a PR number, because this package opens no PR.

## Test Cases

Initial phase — objectives and types only. Steps, expected results and source links are added after implementation.

| Test ID | Objective | Type |
|---------|-----------|------|
| PR141-TC-01 | Verify `slug` maps each U+0020 to one hyphen without collapsing runs (`Plan & Prepare` → `plan--prepare`) | Unit |
| PR141-TC-02 | Verify `slug` does not trim: `' a'` → `-a`, `'a '` → `a-`, `' a '` → `-a-` | Unit |
| PR141-TC-03 | Verify `slug` reproduces `github-slugger`'s published fixture pairs, including `i ♥ unicode` → `i--unicode` | Unit |
| PR141-TC-04 | Verify the strip class preserves non-ASCII alphabetic, mark and decimal-digit code points GitHub keeps | Unit |
| PR141-TC-05 | Verify whitespace other than U+0020 (tab, LF, VT, FF, NBSP, other separators) is deleted rather than hyphenated | Unit |
| PR141-TC-06 | Verify connector punctuation survives (`heading with an _ underscore`) | Unit |
| PR141-TC-07 | Verify the `-N` counter reproduces the five-row `echo` sequence — `echo, echo-1, echo-1-1, echo-1-2, echo-2` — proving the skip loop | Unit |
| PR141-TC-08 | Verify the counter is per-document and operates on lowercased slugs (`## Foo` then `## foo` → `foo`, `foo-1`) | Unit |
| PR141-TC-09 | Verify a `__proto__` heading is counted safely rather than colliding with the prototype chain | Unit |
| PR141-TC-10 | Verify exactly one slug-producing definition exists in the repository and both surfaces import it | Manual |
| PR141-TC-11 | Verify every heading in the corpus produces an identical slug under the shared module and under the anchor table built from the same file | Integration |
| PR141-TC-12 | Verify ATX headings are recognised at 0–3 spaces of indentation and rejected at 4 or more | Unit |
| PR141-TC-13 | Verify the optional closing `#` sequence is dropped (`## Foo ##` → `foo`, not `foo-`) | Unit |
| PR141-TC-14 | Verify `#Foo` is not a heading and an empty ATX heading yields an empty slug at its level | Unit |
| PR141-TC-15 | Verify inline links and images reduce to their text before slugging (`## 1. [Scope Setup](./x.yaml)` → `1-scope-setup`) | Unit |
| PR141-TC-16 | Verify emphasis and code spans are slug-neutral, so raw and rendered heading text agree | Unit |
| PR141-TC-17 | Verify the anchor table built from a raw file with frontmatter equals the table built from the loader's stripped body, ordering and `-N` included | Unit |
| PR141-TC-18 | Verify a backtick fence is not closed by a tilde fence, nor a tilde fence by a backtick fence | Unit |
| PR141-TC-19 | Verify a shorter fence run does not close a longer opener | Unit |
| PR141-TC-20 | Verify a candidate closer carrying an info string is content, not a closer — the desync that produces every divergent corpus file | Unit |
| PR141-TC-21 | Verify a closer followed only by spaces or tabs closes, and that an opening backtick fence whose info string contains a backtick is not a fence | Unit |
| PR141-TC-22 | Verify fence indentation is bounded at three spaces and an unclosed fence swallows the remainder of the document | Unit |
| PR141-TC-23 | Verify the accepted deviation: a fence indented four or more columns inside a list item is not recognised, with the CommonMark rule named in the fixture | Unit |
| PR141-TC-24 | Verify the accepted deviation: a leading tab reads as zero indentation rather than a four-column tab stop | Unit |
| PR141-TC-25 | Verify the corpus's `~~~~markdown`-wrapping-backtick idiom yields the same heading set before and after the change | Integration |
| PR141-TC-26 | Verify single-segment back-compatibility: a fenced skeleton whose lines look like headings is retained, and a non-matching anchor still returns null | Unit |
| PR141-TC-27 | Verify a bare anchor over a duplicated base slug binds the first heading and does not throw, keeping GitHub semantics exact | Unit |
| PR141-TC-28 | Verify a `-N` anchor resolves to the intended later heading rather than returning null | Unit |
| PR141-TC-29 | Verify the section window ends at the next heading of equal or higher level, computed once and fence-aware | Unit |
| PR141-TC-30 | Verify a mixed-case incoming anchor resolves, so every guard-approved anchor is runtime-resolvable by construction | Unit |
| PR141-TC-31 | Verify `workflow-design/README#planning-artifact--guide-map` resolves end-to-end through `get_resource` | Integration |
| PR141-TC-32 | Verify `work-package/activities/README.md#06-plan--prepare` resolves by direct resolver assertion, noting that no resource ref addresses that file | Unit |
| PR141-TC-33 | Verify the anchor guard reports no broken links against the corpus at the bumped pointer | Integration |
| PR141-TC-34 | Verify every guard-approved link targeting a resource file resolves through the real loader and resolver | Integration |
| PR141-TC-35 | Verify `ambiguous-anchor` is reported for a bare anchor whose base slug is carried by two or more headings | Unit |
| PR141-TC-36 | Verify the base-slug predicate does not fire on `Echo` plus `Echo 1`, nor on a literal heading slugging to `resources-58` | Unit |
| PR141-TC-37 | Verify `resources: [id#section]` array entries are scanned and validated by the guard | Unit |
| PR141-TC-38 | Verify the guard's link scanner honours the shared fence tracker, so a link inside a correctly-tracked fence window is not scanned | Unit |
| PR141-TC-39 | Verify the three cross-workflow `get_resource` cases pass against a resource that exists | Integration |
| PR141-TC-40 | Verify the resolved-byte manifest reports 1,226 identical, 6 changed at exactly +2 bytes each, 0 regressions and 99 newly resolvable | Manual |

## Acceptance Criteria Matrix

| Requirement | Acceptance Criterion | Verifying Test Cases |
|-------------|----------------------|----------------------|
| SC-1 | One slug implementation, imported by guard and runtime, pinning GitHub semantics | PR141-TC-01, PR141-TC-07, PR141-TC-10, PR141-TC-11 |
| SC-2 | The two guard-approved / runtime-null links resolve, each by the strongest method it admits | PR141-TC-31, PR141-TC-32 |
| SC-3 | Every guard-approved link targeting a resource file resolves at runtime | PR141-TC-34 |
| SC-4 | A bare anchor over duplicates is merge-blocking, and the 7 over-deliveries are gone | PR141-TC-28, PR141-TC-33, PR141-TC-35, PR141-TC-36 |
| SC-5 | No ref resolves to different content than intended, with the two enumerated exception classes | PR141-TC-25, PR141-TC-26, PR141-TC-29, PR141-TC-40 |
| SC-6 | `check:anchors` green at merge, no regression against the 18-failure baseline | PR141-TC-33, PR141-TC-34, PR141-TC-39 |
| SC-7 | Duplicate leaf slugs, `-N` addressing, back-compat and fenced-code headings are covered | PR141-TC-20, PR141-TC-26, PR141-TC-27, PR141-TC-28 |
| SC-8 | The two residual divergences are documented rather than silently owned | PR141-TC-05, PR141-TC-23, PR141-TC-24 |
| SC-9 | Fence hardening lands with its measured exposure and the corpus remedy | PR141-TC-25, PR141-TC-33, PR141-TC-40 |
| SC-10 | Code and corpus land as separate commits | Commit-log review (no automated case) |
| SC-11 | Behavioural equivalence with `github-slugger` on corpus inputs and its own vectors | PR141-TC-02, PR141-TC-03, PR141-TC-04, PR141-TC-06, PR141-TC-09, PR141-TC-11, PR141-TC-12, PR141-TC-13, PR141-TC-14, PR141-TC-15, PR141-TC-16, PR141-TC-17 |

> [!NOTE]
> SC-10 has no automated case by construction: commit topology is not observable from inside the suite. It is verified at review against the branch log and the corpus repository's log.

## Running Tests

```bash
# Whole suite (compare against the recorded 18-failure baseline, not against green)
npx vitest run --reporter=basic

# The package's own files
npx vitest run tests/heading-anchors.test.ts tests/extract-section.test.ts tests/resource-anchors.test.ts

# The merge gate, and the regression net on the tool being changed
npm run check:anchors
npx vitest run tests/mcp-server.test.ts

# SC-5 byte differential (before, then after; diff the two manifests)
npx tsx scripts/resource-ref-manifest.ts

# Types
npm run typecheck
```
