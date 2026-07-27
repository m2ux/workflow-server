# Drafting Plan — Pass B Binding Fidelity

**Mode:** update · **Target:** `work-package` · Last file: `resources/review-mode.md`

Framed against existing committed content — every entry is a delta on a file this branch already changed, not a from-scratch draft. Order and rationale: [scope manifest § Drafting order](06-scope-manifest.md#drafting-order).

| # | File | Delta |
|---|------|-------|
| 1 | `work-package/workflow.yaml` | `artifact_publish_ref` description (`:341`) restates the fallback as the engineering checkout's branch instead of the parent branch, and states emptiness before publish. The variable's `name`, `type`, and `defaultValue` stay exactly as Pass B left them; workflow `version` 3.35.3 → 3.35.4. |
| 2 | `work-package/techniques/publish-review-artifacts.md` | Inputs: `reference_path` → `repo_root`, description reduced to what the value is. Outputs: `artifact_publish_ref` de-proceduralised and re-targeted. Protocol 1 gains the two-arm `{$eng_git_dir}` plus `{$eng_branch}` resolution; Protocol 2–3 read those locals in place of the retired id. Capability sheds the stale "parent-repo ref" wording — the last surviving restatement of the superseded semantics, found during the draft review sweep. Rules and the `publish-before-post` rule body stay untouched; `metadata.version` 1.0.0 → 1.1.0. |
| 3 | `work-package/techniques/review-summary.md` | Inputs: `artifact_publish_ref` loses the fallback recipe (relocated, not dropped); `reference_path` → `repo_root`, losing both UPPERCASE slot mentions. Protocol § 2 rewritten to declare `{$eng_git_dir}` and `{$eng_publish_ref}` and to cite `review-mode.md#header-fields`; the two later reads at § 3 substitute the local. The other five Protocol sections, the Outputs entry, and the `rating-cap-carve-in` rule stay untouched; `metadata.version` 1.7.0 → 1.8.0. |
| 4 | `work-package/resources/review-mode.md` | The `(reference_path)` caller-symbol parenthetical at `:42` drops, and the two "parent" references in the same sentence become the artifacts checkout so the resource stops restating superseded semantics. The base-URL template at `:39` is deliberately **not** touched — the slots stay resource-resident. `metadata.version` 1.12.0 → 1.12.1. |

**Out of scope every iteration:** the three `activities/13-submit-for-review.yaml` bind sites ([A-7](03-assumptions-log.md)), and all of [D-1…D-8](01-deferred-items.md).
