# Issue #141: Path-scoped section references: address a nested resource section through its parent, and make the anchor guard match the runtime

Captured verbatim on 2026-08-02 when the issue was consolidated into the section-grain-delivery epic.

---

## Summary

A resource is a markdown file, and a reference like `some-resource#section-name` fetches one section of it — the part after the `#` is an anchor, a slugified heading title. Two problems with how those anchors work today:

1. **The link checker and the runtime resolver compute slugs differently**, so links the guard approves can fail to resolve at runtime. This is a live correctness bug with reproducing cases in the corpus.
2. **An anchor is a single flat slug** — there is no way to say "the `Grep Patterns` section *under pattern P3*". In files where the same heading repeats, only the first occurrence is reachable at all.

This issue proposes fixing the slug mismatch, and extending the anchor syntax so a section can be addressed through its parent: `some-resource#parent-section/child-section`.

## How it works today

The reference parser splits a resource ref on the first `#`; everything after it is one opaque section string. The section extractor then returns the first heading at *any* level whose GitHub-style slug equals that string, plus its body up to the next heading of the same or higher level. It is aware of code fences (headings inside fenced blocks are ignored), but it has no way to disambiguate duplicate headings.

Two consumers must stay in lockstep: the `get_resource` tool, and the eager bundling of technique-linked resources on `get_activity` — the latter matters because the delivered full text is hashed into `resource:<resource_id>` ledger keys, so its output must not change for existing references.

The consequence of flat slugs: a leaf section cannot be addressed through its parent, and the only namespace is the filename — two resources can each carry a `## Rule` heading only because they live in different files.

A guard, `npm run check:anchors`, validates every relative `](file.md#anchor)` link in the corpus against real headings.

## Defect 1 — the guard and the runtime disagree on slugs

The guard implements GitHub's actual slug algorithm; the runtime resolver does not. The two differences:

- **Consecutive spaces.** GitHub turns each space into a hyphen without collapsing runs, so a heading like `## Planning artifact → guide map` — where the stripped arrow character leaves two spaces — slugs to `planning-artifact--guide-map` with a double hyphen. The runtime collapses whitespace runs into a single hyphen, so it only answers to `planning-artifact-guide-map`.
- **Duplicate headings.** GitHub disambiguates repeats with `-1`, `-2`, … suffixes. The runtime never generates suffixes — the first match wins, and any suffixed anchor is unresolvable.

Calling the section extractor directly against the corpus shows the split:

```
workflows/workflow-design/resources/README.md  #planning-artifact--guide-map  => NULL
workflows/workflow-design/resources/README.md  #planning-artifact-guide-map   => OK  (## Planning artifact → guide map)
workflows/work-package/activities/README.md    #06-plan--prepare              => NULL
workflows/work-package/activities/README.md    #06-plan-prepare               => OK  (### 06. Plan & Prepare)
```

Both `NULL` forms pass `check:anchors`, and both are how the corpus writes them today: the workflow-design README links `./resources/README.md#planning-artifact--guide-map`, and the work-package README links `./activities/README.md#06-plan--prepare`. Any `-1`/`-2` dedupe anchor is in the same class: GitHub-valid, guard-valid, runtime-null.

### Further guard gaps

- The guard only checks markdown links — it never looks at `resources: [id#section]` array entries in activity files.
- Its fence tracking toggles on every fence line, so a fenced markdown template that itself contains inner mermaid blocks flips the checker in and out of "fenced" state, and real links inside the template are skipped. One such skipped link points at `work-package-plan.md#dependencies--risks` — a file that does not exist (it is `wp-plan.md`) — and the guard never sees it.
- The guard is currently red on `main` with three `missing-anchor` links, unrelated to section paths:
  - `meta/techniques/workflow-engine/workflow-orchestrator.md -> ./dispatch-activity.md#accumulate-trace-tokens`
  - `work-package/techniques/review-assumptions/interview.md -> ../../resources/assumptions-review.md#open-assumptions`
  - `work-package/techniques/review-test-suite.md -> ../resources/test-suite-review.md#test-suite-review-report-template`

## Defect 2 — no hierarchical addressing

The proposal: a section reference may carry a path of headings, resolved hierarchically with no flattening.

```
get_resource { resource_id: "some-resource#parent-section/child-section" }
  -> narrow to parent-section, then resolve child-section ONLY within it
```

Merged multi-concept resource files already exist in the corpus and are unaddressable below their top section:

- The injection-pattern catalog in the cicd-pipeline-security-audit workflow is 326 lines carrying **7× `### Grep Patterns`** and **7× `### Description`** headings under its patterns P1–P7, plus `vulnerable-pattern-example` ×3, `campaign-example(s)` ×2+×2, and `detection-logic` ×2. Only P1's leaf is reachable; `#grep-patterns` silently resolves to it. The consuming technique (the load-patterns step of scan-injection-patterns) therefore uses no anchor at all and loads the whole file.
- The substrate-node-security-audit prompt template points **eight different sweeps** at the same `static-analysis-patterns.md#grep-patterns` — the entire roughly 100-line section — where each sweep wants exactly one subsection (`### Panic Paths`, `### Unsafe Code`, and so on).
- Other resource files with duplicate heading slugs: the cicd audit's intermediate-artifact schemas (`field-descriptions` ×5) and the three prism-evaluate templates (title slug ×2 each).

No `a/b` path-style section ref exists anywhere in the corpus today, so adoption is greenfield.

## Proposed change (backward-compatible)

- The reference parser treats the section part as a delimiter-separated path: `parent/child` becomes `["parent", "child"]`.
- The section extractor walks the path: match the first segment to its window (heading plus body up to the next same-or-higher heading), search the second segment ONLY within that window, repeat, and return the final window. It stays fence-aware throughout.
- A single-segment path is exactly today's behavior, so every existing anchor reference keeps working unchanged.
- The change is contained to the shared resource-ref utility; both consumers inherit it, and the eagerly-bundled full text — and therefore its ledger hash — must be unchanged for single-segment refs.

### Delimiter

Extend only the section part: `id#parent/child`. `#` already means section, `/` is unused inside it, and it stays visually distinct from the technique `::` delimiter. `::` was floated but overloads the technique-ref delimiter and blurs resource-versus-technique refs. Decide on adoption.

## Acceptance criteria

- [ ] One slugger, shared by the guard and the runtime — or the guard resolves through the runtime resolver. GitHub semantics (no space collapsing, `-N` dedupe suffixes) supported at runtime.
- [ ] The two guard-approved / runtime-null corpus links resolve, and a regression test pins slug parity.
- [ ] `get_resource` resolves multi-segment section paths (`a/b/c`) hierarchically, each segment scoped to the prior segment's window; fence-aware.
- [ ] Single-segment refs behave exactly as today (backward compatible); resource-delivery hashes for existing refs are unchanged.
- [ ] An unmatched or ambiguous path segment errors clearly (which segment failed, in which scope).
- [ ] `check:anchors` covers path-scoped refs and `resources: [id#section]` array entries, and handles nested fences without skipping live links.
- [ ] Tests cover nested resolution, duplicate leaf slugs under different parents, single-segment back-compat, and fenced-code headings being ignored. (The section-extraction test suite currently has two cases: a fenced skeleton, and no-match.)

## Out of scope

Refactoring any specific workflow's resource files — for example, merging multiple resource files into one, or splitting the injection-pattern-catalog referencers onto per-pattern anchors. Those are optional follow-ups this change enables, tracked separately if pursued.

## Status

Defect 1 is a live correctness bug with a reproducing case and is separable — fix it first, independently of path-scoping. Defect 2 is an enhancement; not blocking any current PR.

## References

- Reference parser and section extractor (the whole runtime change lands here): `src/utils/resource-ref.ts`
- The two consumers: `src/tools/resource-tools.ts` (`get_resource`) and `src/utils/resource-delivery.ts` (eager bundling; its full text feeds the `resource:<resource_id>` ledger hash)
- The guard: `scripts/check-resource-anchors.ts`, asserted by `tests/resource-anchors.test.ts`; extraction tests: `tests/extract-section.test.ts`
- Corpus evidence: `workflows/workflow-design/README.md` and `workflows/work-package/README.md` (the two runtime-null links); `workflows/work-package/resources/architecture-summary.md` (the fence-skipped dead link); `workflows/cicd-pipeline-security-audit/resources/injection-pattern-catalog.md` and `.../intermediate-artifact-schemas.md`, `workflows/cicd-pipeline-security-audit/techniques/scan-injection-patterns/load-patterns.md`, `workflows/substrate-node-security-audit/resources/audit-prompt-template.md` (duplicate-slug and whole-file-load cases)

