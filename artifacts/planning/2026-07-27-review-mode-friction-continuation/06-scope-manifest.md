# Scope Manifest — Pass B Binding Fidelity

**Target:** `work-package` v3.35.3 · **Mode:** update
**Basis:** [design specification](03-design-specification.md) · [impact](05-impact-analysis.md)
**Worktree:** `/home/mike1/projects/work/workflows/2026-07-09-workflow-design-doc-voice` ✅ (branch `workflow/work-package-review-mode-friction-271`, tip `ab5388a5`) · folder layout unchanged

Four files modified, none created or removed — three markdown prose edits plus one YAML description line. Intentional removals: **3** ([impact §3](05-impact-analysis.md#3-removals-inventory)).

`file_count` = **4**

---

## File manifest

| # | Path (under `work-package/`) | Type | Action | One-line change |
|---|------------------------------|------|--------|-----------------|
| 1 | `workflow.yaml` | workflow | modify | `artifact_publish_ref` description (`:341`) stops naming the parent branch as the fallback; `name`, `type`, `defaultValue` untouched. |
| 2 | `techniques/publish-review-artifacts.md` | technique | modify | Orphan `reference_path` input becomes `repo_root`; both git reads re-target the engineering checkout via a `{$eng_git_dir}` local; output description de-proceduralised. |
| 3 | `techniques/review-summary.md` | technique | modify | Four `{ARTIFACT_PUBLISH_REF}` reads bind a snake_case local; orphan `reference_path` input becomes `repo_root`; the two UPPERCASE URL slots drop in favour of a citation; fallback recipe relocates to Protocol § 2. |
| 4 | `resources/review-mode.md` | resource | modify | The `(reference_path)` caller-symbol parenthetical (`:42`) drops; the URL template at `:39` is deliberately untouched. |

**Out of scope this pass:**

- D-1…D-7 in [deferred items](01-deferred-items.md) — in particular **D-6** (the stale activity-13 mermaid diagram), which would add a fifth file, and **D-5** (the `artifact_publish_ref: artifact_publish_ref` bind-economy violation at `activities/13-submit-for-review.yaml:112`).
- All three bind sites in `activities/13-submit-for-review.yaml` — no edit needed, since `repo_root` binds by implicit same-name binding ([A-7](03-assumptions-log.md)).
- `src/` and `schemas/` — no engine or guard change; the resolvability checks are agent-audited ([format conventions](01-format-conventions.md)).

### Scope deltas recorded at drafting

| # | Delta | Disposition |
|---|-------|-------------|
| 1 | The specification's confirmation ask scopes "two technique files and one resource file"; the honest surface is **four** files, because `workflow.yaml:341` restates the very fallback semantics G-2 changes. | Drafted as four. The specification's closing wording needs amending at Gate 2 — the [impact analysis](05-impact-analysis.md#1-impact-classification) already carries the finding. The fourth file is Pass B's own addition and already in this branch's changed set, so including it corrects Pass B rather than widening the branch. |
| 2 | `derive-workflows-target-path` composes `{target_path}` as `<checkout>/.worktrees/<planning-slug>/`, which for this session resolves to a path that does not exist. | The authoritative content is the pre-existing worktree named above, which `prepare-workflow-branch` reuses under its own "reuse when `{target_path}` is already a registered worktree on that branch" clause. Edits land there; no worktree was created. |
| 3 | Technique and resource `metadata.version` values, and the workflow `version`, are bumped. | Pass B bumped every file it touched (`review-summary.md` 1.4.0 → 1.7.0, `review-mode.md` 1.7.0 → 1.12.0, `workflow.yaml` 3.35.0 → 3.35.3), so bumping is this branch's established convention. Contract-changing files take a minor bump, prose-only files a patch. Revertible in place if Gate 2 prefers otherwise. |

---

## Structural design

```
work-package/   # unchanged — no file added, removed, renamed, or moved
├── workflow.yaml                          # modify (one description line)
├── activities/                            # untouched (15 files)
├── techniques/
│   ├── publish-review-artifacts.md        # modify
│   └── review-summary.md                  # modify
└── resources/
    └── review-mode.md                     # modify
```

**Flow:** Topology unchanged — `submit-for-review` keeps the Pass B step order (render → approve → persist → publish → refresh → post), and no activity, step, checkpoint, or transition is added, removed, or reordered ([impact §2](05-impact-analysis.md#2-integrity-checks)).

| Pattern | This change |
|---------|-------------|
| Producer-before-consumer | `publish-review-artifacts.md` emits `artifact_publish_ref`; `review-summary.md` consumes it. The producer is drafted first so its output description is settled before the consumer's fallback wording is written against it. |
| Two-arm engineering-checkout resolution | Reuses the established `{$eng_git_dir}` form verbatim from `techniques/update-pr/render.md:51` and `techniques/manage-git/artifact-commits.md:42` rather than a new idiom. |
| Declare-once protocol local | The resolved ref takes a `{$name}` local at its producing step and is read bare thereafter, following the `{$eng_branch}` precedent at `techniques/update-pr/render.md:54`. |
| One authoritative home | The base URL and its UPPERCASE slots stay resource-resident in `review-mode.md#header-fields`; the technique cites that anchor and names no slot of it. |
| Implicit same-name binding | `repo_root` is a declared workflow variable (`workflow.yaml:75`), so no `step.technique.inputs` deviation is added at either bind site. |

### Binding-collision constraint

The A-3 protocol local is named **`{$eng_publish_ref}`** — deliberately *not* `artifact_publish_ref`, which is simultaneously a declared workflow variable (`workflow.yaml:339`) and `review-summary.md`'s own declared optional input (`:32`); a local over declared I/O is barred by AP-62's carve-out ([impact §2](05-impact-analysis.md#2-integrity-checks), row 4). The chosen id is snake_case and carries the `eng_` prefix the sibling locals already use.

---

## Drafting order

1. **`workflow.yaml`** — the variable's declared semantics are the contract both techniques are written against, so the description settles first.
2. **`techniques/publish-review-artifacts.md`** — the producer of `artifact_publish_ref`; its output description fixes what the consumer may assume.
3. **`techniques/review-summary.md`** — the consumer, carrying six of the eight drifts; drafted once the producer's contract is fixed.
4. **`resources/review-mode.md`** — the resource sweep last, so the surviving prose can be checked against the two finished technique files for any remaining restatement of the retired symbol.

**Rationale:** Contract before consumer, and the tree-wide symbol sweep last so no restatement of the retired name survives the pass ([AP-129](03-design-specification.md#rules)).

---

## Verification

The change surface has a machine-checkable acceptance test, run from the server repo against this worktree as corpus root:

| Guard | Expected after drafting |
|-------|-------------------------|
| `check-binding-fidelity.ts` | The 8 NEW findings (2 `orphan-input`, 6 `read-resolution`) drop to 0. Never run `--update-baseline` — it rewrites the committed baseline from whatever root is passed. |
| `check-technique-template.ts` | Stays passing; the realistic exposures are `section-order`, `entry-id-casing`, `sigil-casing`. |
| `check-resource-anchors.ts` | Stays at exactly the 3 baseline-identical broken anchors ([D-1…D-3](01-deferred-items.md)) — no fourth. |
| `validate-workflow-yaml.ts` | `work-package` stays schema-valid. |
