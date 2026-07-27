# Draft Attestation — Pass B Binding Fidelity

**Mode:** update · **Files:** 4 · **Attestation:** ready for batch review

Blocks marked against committed content at tip `ab5388a5`. Unchanged blocks appear only where leaving them alone was itself a decision.

## Reviewed blocks

| Block | File | Status | Rationale |
|-------|------|--------|-----------|
| `version` | `work-package/workflow.yaml` | modified | 3.35.3 → 3.35.4, following Pass B's own bump convention on this branch. |
| `variables[] · artifact_publish_ref · description` | `work-package/workflow.yaml` | modified | Restates the fallback as the engineering checkout's branch, not the parent branch. Stale under all three [A-10](03-assumptions-log.md) arms, so the edit is arm-independent. `name`, `type`, `defaultValue` untouched. |
| `metadata.version` | `techniques/publish-review-artifacts.md` | modified | 1.0.0 → 1.1.0 — minor, because the input contract changed. |
| `## Capability` | `techniques/publish-review-artifacts.md` | modified | Dropped "parent-repo ref" for "engineering-checkout ref". Caught by the draft-review sweep, not by any guard: it is prose no placeholder check reads, and it was the last surviving restatement of the semantics G-2 supersedes (AP-129). Pass B's own wording, in a file already on the surface, so correcting it widens nothing. |
| `## Inputs · ### repo_root` | `techniques/publish-review-artifacts.md` | modified | Replaces the orphan `reference_path` entry with the declared workflow variable, binding by implicit same-name ([A-1](03-assumptions-log.md)). Description reduced to what the value is (AP-119). |
| `## Outputs · ### artifact_publish_ref` | `techniques/publish-review-artifacts.md` | modified | States the two allowed shapes; the "when the SHA cannot be read" recipe stays in Protocol 3 rather than being restated here. |
| `## Protocol · 1` | `techniques/publish-review-artifacts.md` | modified | Declares `{$eng_git_dir}` and `{$eng_branch}` using the two-arm form verbatim from `techniques/update-pr/render.md:51` ([A-2](03-assumptions-log.md)), carrying the never-hardcode-`main` constraint. |
| `## Protocol · 2` | `techniques/publish-review-artifacts.md` | modified | `branch` argument reads the local instead of prose "current parent branch". |
| `## Protocol · 3` | `techniques/publish-review-artifacts.md` | modified | `rev-parse HEAD` runs in the engineering checkout; the fallback emits the local. |
| `## Rules · publish-before-post` | `techniques/publish-review-artifacts.md` | unchanged | Ordering rule is untouched by the re-target; no goal reaches it. |
| `metadata.version` | `techniques/review-summary.md` | modified | 1.7.0 → 1.8.0 — minor, because the input contract changed. |
| `## Inputs · ### artifact_publish_ref` | `techniques/review-summary.md` | modified | Removal 1: fallback recipe out, relocated intact to Protocol § 2. Keeps `*(optional)*` and now states emptiness. G-1. |
| `## Inputs · ### repo_root` | `techniques/review-summary.md` | modified | Removal 2: orphan id retired and both UPPERCASE slot mentions dropped. G-2, G-3. |
| `## Protocol · § 2 Resolve the Publish Ref` | `techniques/review-summary.md` | modified | Declares `{$eng_git_dir}` and `{$eng_publish_ref}` and cites `review-mode.md#header-fields` instead of restating the URL. Closes two of the four `{ARTIFACT_PUBLISH_REF}` reads. G-1, G-3. |
| `## Protocol · § 3 header-fields bullet` | `techniques/review-summary.md` | modified | Third read substitutes the local; bullet is textually after the § 2 declaration, as the sigil convention requires. |
| `## Protocol · § 3 Reports bullet` | `techniques/review-summary.md` | modified | Fourth read substitutes the local; same ordering guarantee. |
| `## Rules · rating-cap-carve-in` | `techniques/review-summary.md` | unchanged | Rating logic is orthogonal to link resolution. |
| `metadata.version` | `resources/review-mode.md` | modified | 1.12.0 → 1.12.1 — patch, prose only. |
| `### Header Fields · ref-resolution sentence` | `resources/review-mode.md` | modified | Removal 3: caller-symbol parenthetical dropped ([A-6](03-assumptions-log.md)); the two "parent" references corrected so the resource stops restating superseded semantics (AP-129). Slot names, resolve-from-remote instruction, and never-hardcode-`main` all retained. G-4. |
| `### Header Fields · base-URL code block` | `resources/review-mode.md` | unchanged | **Deliberate.** The template and its UPPERCASE slots keep their single home here; promoting them to technique inputs would dual-home the template ([A-4](03-assumptions-log.md)). G-3. |
| `steps[] · three review bind sites` | `activities/13-submit-for-review.yaml` | unchanged | **Deliberate.** `repo_root` binds implicitly, so adding a `step.technique.inputs` entry would itself breach `binding-carries-only-deviations` ([A-7](03-assumptions-log.md)). |

## Binding-fidelity pass

No activity YAML was drafted, so the pass has no drafted persist step to check on the change surface. Checked instead on the two things it can bear on:

- **Target workflow** — the three existing bind sites are bound `steps[]` entries, not protocol-only prose, and every input the two redrafted techniques declare now has a producer: `repo_root` and `artifact_publish_ref` are declared workflow variables, and `{$eng_git_dir}` / `{$eng_branch}` / `{$eng_publish_ref}` are declared at their producing step and read only afterwards. Confirmed mechanically — `check-binding-fidelity` reports 0 NEW findings, down from 8 ([file review note](06-file-review-note.md#verification-on-the-drafted-set)).
- **This workflow's own activity 06** — all four persist steps are bound `steps[]` entries whose `artifact_content` resolves to a real producer, so the D-4/D-7 literal-string defect does not recur here. Two technique inputs are unresolved, recorded as [D-8](01-deferred-items.md).

## Gate 2 carry-forward

Nothing here disposes an open judgement. [A-10](03-assumptions-log.md) (no-SHA fallback target, re-opened by G-2) and [A-11](03-assumptions-log.md) (re-affirmation of `B-1`/`B-2`) remain open for `approve-to-commit`. The draft implements A-10 arm 1 — the engineering checkout's current branch — because that is what G-2 delivers; arms 2 and 3 would land in the same four files, so no disposition widens the surface. Also awaiting Gate 2: amending the specification's "two technique files and one resource file" wording to four ([scope manifest § Scope deltas](06-scope-manifest.md#scope-deltas-recorded-at-drafting)).

> **Superseded in part at `08` quality-review.** Two blocks this attestation recorded were changed by the audit fix cycle: the `### Header Fields · base-URL code block` row below (recorded *unchanged / deliberate*) was corrected for its path segment — A-4's grounds cover only not promoting the slots to inputs, not the `.engineering/` prefix — and the `## Protocol · § 2` guard was changed from "when it is bound" to "when it is non-empty". So the closing claim that no block is flagged for revision no longer holds as written; see [verified findings](08-verified-findings.md).

**draft_attestation:** All 21 blocks reviewed — 17 modified intentionally and 4 left unchanged by decision; no block is flagged for revision, and the drafted set is independently confirmed by four guards re-run after the final edit.
