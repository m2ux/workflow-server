# File Review Note — Pass B Binding Fidelity

**Mode:** update · **Target:** `work-package`

Compared against committed content at tip `ab5388a5`. The removals inventory is homed in [impact analysis § 3](05-impact-analysis.md#3-removals-inventory); this note records only whether each drafted file's removals match it.

| File | Status | Delta / attestation | Removals (update) |
|------|--------|---------------------|-------------------|
| `work-package/workflow.yaml` | drafted | One description line re-targeted at the engineering checkout; `name`, `type`, `defaultValue` untouched. Workflow version bumped. | none — corrected in place, per impact § 3's "not counted as removals" |
| `work-package/techniques/publish-review-artifacts.md` | drafted | Orphan input retired to `repo_root`; both git reads re-targeted through `{$eng_git_dir}`; output description de-proceduralised. | listed; **flagged** — the retired id and the two Inputs/Outputs procedure clauses are the AP-119 relocation impact § 1 anticipated for this file; every clause survives in Protocol 1–3 |
| `work-package/techniques/review-summary.md` | drafted | Four unbindable reads now bind `{$eng_publish_ref}`; orphan input retired to `repo_root`; both UPPERCASE slots replaced by a `#header-fields` citation. | listed; **flagged** — removals 1 and 2 exactly as inventoried |
| `work-package/resources/review-mode.md` | drafted | Caller-symbol parenthetical dropped; "parent" wording corrected in the same sentence. Base-URL template untouched. | listed; **flagged** — removal 3 exactly as inventoried |

**has_unflagged_removals:** false — every removal maps to an inventoried row, and each has a surviving home.

Each removal's surviving home is stated once, in the [impact analysis § 3](05-impact-analysis.md#3-removals-inventory) Preserved column; the drafted files match it row for row.

## Verification on the drafted set

Run from the server repo with this worktree as corpus root — commands and expectations in [scope manifest § Verification](06-scope-manifest.md#verification).

| Measure | Before | After |
|---------|--------|-------|
| `check-binding-fidelity` NEW findings | 8 (2 `orphan-input`, 6 `read-resolution`) | **0** — total 242 → 234, and the pre-existing "22 fixed" count is unchanged, so no baselined finding was disturbed |
| `reference_path` occurrences tree-wide | 7 across 3 files | **0** |
| `{ARTIFACT_PUBLISH_REF}` / `ENG_REPO_*` reads outside the resource | 4 + 1 | **0** — the only survivors are the two resource-resident slots at `review-mode.md:39` and `:42` |
| Files dirty in the worktree | 0 | exactly 4, matching the manifest |

Unchanged by the draft, as intended: `check-technique-template` passes, `check-resource-anchors` still reports exactly the three baseline-identical broken anchors ([D-1…D-3](01-deferred-items.md)) with no fourth, and `work-package` stays schema-valid including "no unanchored protocol references".
