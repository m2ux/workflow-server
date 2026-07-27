# Design Assumptions Log

**Workflow:** `work-package`
**Mode:** Update
**Created:** 2026-07-27
**Last Updated:** 2026-07-27

> Assumption ids in this log are this session's (`A-1`…`A-11`). Rows carried from the earlier passes that shared the `2026-07-22-work-package-run-retrospective-friction-points` folder are always written with their pass named — `#272-pass A-9`, `Pass B B-3` — because that folder's log was overwritten in place across three passes and bare ids no longer resolve there.

---

## Summary

| Category | Surfaced | Audit-resolved | Confirmed | Corrected | Deferred |
|----------|----------|----------------|-----------|-----------|----------|
| Activity Boundaries | 1 | 1 | — | — | — |
| Checkpoint Necessity | 2 | 1 | 1 | — | — |
| Technique Selection | 2 | 2 | — | — | — |
| Rule Scope | 2 | 1 | 1 | — | — |
| Variable State | 3 | 3 | — | — | — |
| Schema Construct Choice | 1 | 1 | — | — | — |
| **Total** | **11** | **9** | **2** | **—** | **—** |

---

## Log

One row per assumption, updated in place across its lifecycle — surfaced, reconciled, and resolved.

| ID | Category | Risk | Resolvability | Assumption | Rationale | Outcome | Changes |
|----|----------|------|---------------|------------|-----------|---------|---------|
| A-1 | Variable State | H | audit | The canonical replacement for the orphan `reference_path` input on both techniques is the declared workflow variable `repo_root`. | `repo_root` is declared in `work-package/workflow.yaml` and described as the product repo root; `{repo_root}/.engineering` is the established idiom for reaching the artifacts checkout. Alternatives: declare `reference_path` as a new workflow variable; keep the id and add a `step.technique.inputs` rename at both bind sites; derive the path from `planning_folder_path`. | ✅ Validated — `{repo_root}/.engineering` appears 7× across `techniques/update-pr/render.md`, `techniques/manage-git/artifact-commits.md`, and `techniques/manage-git/TECHNIQUE.md`; `repo_root`'s declared description names exactly the role `reference_path` describes. A declared same-name variable also keeps implicit binding intact (`generic-not-overfit`), where a new synonym would trip `no-invented-naming` (AP-04). | Spec G-2 |
| A-2 | Variable State | H | audit | Closing A-1 is not sufficient: the git reads in both techniques must address the **engineering checkout**, resolved by the two-arm `{$eng_git_dir}` form, rather than running against `{repo_root}` directly. | `.engineering/` is a nested checkout of the same GitHub repo on branch `engineering`; the enclosing product checkout is on `main`. Alternatives: read `git -C {repo_root}` directly; declare a dedicated engineering-checkout input; hoist the resolution into a shared technique. | ✅ Validated — verified directly: `.engineering` reports branch `engineering` and remote `m2ux/workflow-server`, while the parent checkout reports `main`. `git -C {repo_root} branch --show-current` would therefore yield `main` — the one value `review-summary.md` forbids hardcoding — and `rev-parse HEAD` would yield a SHA off the branch the artifacts were never committed to. The two-arm form already exists at `render.md:51` and `artifact-commits.md:42`, so reuse beats invention (Convention Over Invention). | Spec G-2, § Why G-2 is a re-target |
| A-3 | Schema Construct Choice | M | audit | The resolved publish ref is carried by a snake_case protocol local declared once at its producing step, rather than by re-reading the optional input at each of the four sites. | The value read at lines 62–63 is the *resolved* ref — the bound input or the fallback — which is not identical to the optional input itself. Alternatives: read `{artifact_publish_ref}` directly at all four sites; declare a second non-optional input. | ✅ Validated — AP-62 `bind-protocol-locals` requires declare-once `{$name}` at the producer for a derived value, and its carve-out ("a `{name}` that is a declared I/O … strip `$`, do not add a bind") does not apply because the resolved ref is a distinct value from the optional input. Both precedent sites (`render.md:51`, `artifact-commits.md:42`) introduce a local for exactly this two-arm shape. | Spec G-1 |
| A-4 | Technique Selection | M | audit | `{ENG_REPO_OWNER}` and `{ENG_REPO_NAME}` are removed from the technique's I/O prose rather than promoted to declared inputs, with the technique citing `review-mode.md#header-fields` instead. | They are slots of a URL template whose one home is the resource. Alternatives: declare both as technique inputs; declare both as workflow variables; leave them and accept the unresolved reads. | ✅ Validated — the base URL and its slots live in `resources/review-mode.md` § Header Fields; promoting them to technique inputs would dual-home the template (AP-102) and put a resource-owned fill surface into a bind contract. AP-92's Fix half is explicit that tokens relocated into a technique must resolve under guard coverage — the converse being that template slots belong in the resource, which is guard-invisible by design. | Spec G-3 |
| A-5 | Rule Scope | M | audit | The fallback resolution recipe migrates out of the two Inputs descriptions into Protocol as part of this change, not as a later hygiene pass. | The recipe is the very prose that names the orphan symbol, so G-2 cannot be closed while leaving it in place. Alternatives: rewrite the symbol in situ and defer the relocation; drop the fallback entirely. | ✅ Validated — AP-119 `procedure-in-io-contract` names this shape directly (`review-summary.md:34` carries "When not supplied, resolve from … Never hardcode `main`"; `:38` carries "used to resolve …"). Dropping the fallback outright is not available: the `generate-review-summary` bind runs before `publish-review-artifacts`, so the input is genuinely unbound at first render. | Spec G-1, Rules |
| A-6 | Technique Selection | L | audit | `resources/review-mode.md` states the ref source generically and names no caller symbol at all, rather than being updated to name the canonical one. | A resource that names a caller's symbol cannot be verified by any guard and drifts on the next rename. Alternatives: update the parenthetical to `repo_root`; delete the sentence. | ✅ Validated — AP-46 `no-resource-caller-backlink` flags bare host ids in a resource and its Fix drops caller inventories; the resource remains a usable template with the symbol name removed, which is AP-46's own deletion test. This also removes the AP-129 stale-restatement exposure that renaming in place would leave. | Spec G-4 |
| A-7 | Activity Boundaries | L | audit | No activity YAML edit is required to close the eight drifts. | `repo_root` is a declared workflow variable, so it binds by implicit same-name binding at both sites. Alternatives: add a `step.technique.inputs` entry at each bind site. | ✅ Validated — inspected both bind sites in `activities/13-submit-for-review.yaml`: `publish-review-artifacts` uses the bare-string form and `refresh-review-summary-links` deviates only on `artifact_publish_ref`. `binding-carries-only-deviations` requires omitting an input already in the bag under its own id, so adding one would itself be a violation. | Spec Activity list |
| A-8 | Checkpoint Necessity | L | audit | No new checkpoint is added for this change; Gate 2 (`approve-to-commit`) is the only gate it needs. | The change is content-only across three files, with no removal and no irreversible step. Alternatives: add a confirmation gate on the symbol re-target. | ✅ Validated — Confirm Before Irreversible Changes scopes explicit confirmation to semi-reversible and irreversible changes; AP-88 `one-decision-one-checkpoint` bars a second gate over the same decision Gate 2 already carries. | Spec Checkpoints |
| A-9 | Variable State | M | audit | PR #274's "A-9 / A-10 (Pass B) pending final Gate 2" cites ids from the **#272 pass's** revision of the shared planning log, not Pass B's open rows — which are `B-1`, `B-2`, `B-3`. | The three passes (#272, Pass A #271, Pass B #270) reused one planning folder, and `03-assumptions-log.md` was overwritten in place at each pass, so the cited ids no longer resolve in the surviving file. | ✅ Validated — recovered the folder's log history: revision `9f3b125` carries `A-9` (PR tense/checklist refresh bind site, open) and `A-10` (build-artifact hand-offs, audit ✅ Validated); revision `c6814de` carries `A-1`…`A-8` only; the surviving revision `597494e` is titled "Pass B (#270)" and carries `S-1`…`S-3` settled plus `B-1`…`B-3` open. That pass's `COMPLETE.md` records Gate 2 accepting `A-9` at the committed tip, so neither cited row is in fact pending. | Spec G-5 |
| A-10 | Rule Scope | M | open | Pass B judgement `B-3` — the no-SHA fallback target — is re-opened by G-2 and must be re-disposed at Gate 2, not merely re-affirmed. | `B-3` was accepted as "falls back to the workflows branch name when no SHA is resolvable". G-2 changes what that branch read resolves against (engineering checkout, not parent checkout), so the accepted wording no longer describes the behaviour the fix delivers. Decision space: (1) fallback = the engineering checkout's current branch (follows G-2, assumed); (2) fallback = a fixed publish branch name; (3) no fallback — treat an unreadable SHA as a render error. | ✅ **Re-disposed at Gate 2** — arm 1 confirmed: the fallback ref is the engineering checkout's current branch, exactly as drafted. This is `B-3`'s **new** disposition, not a re-affirmation of it: G-2 re-opened the judgement, and its accepted "workflows branch name" wording is superseded rather than carried forward. The stakeholder call — a mutable branch link is acceptable in a posted review comment as the no-SHA fallback — was made explicitly, which is the call no audit could settle. | None — the draft already implements arm 1; arms 2 and 3 would have landed in the same four files |
| A-11 | Checkpoint Necessity | L | open | Pass B judgements `B-1` (carve-out expressed as a scoping cross-reference on `commit-and-persist` rather than a conditional in the operation body) and `B-2` (`review-summary-approval` batching the rating-cap carve-in and review type in one checkpoint) stand unchanged and need only re-affirmation at Gate 2. | Neither is touched by any of the five change goals; both describe already-committed Pass B content that this session does not revisit. Decision space: re-affirm both as drafted; or reopen either for redesign, which would widen this session's change surface beyond the three files. | ✅ **Re-affirmed at Gate 2** — `B-1` and `B-2` both stand unchanged as drafted; neither is reopened, so the change surface stays at four files. | None |

---

## Gate 2 Dispositions

Both rows below were carried open to `approve-to-commit` and dispositioned there on 2026-07-27 (option `approved`). Nothing remains open in this log; both judgements being dispositioned is what closes **G-5**.

### A-10: No-SHA fallback target after the engineering-checkout re-target

**Assumption:** The fallback ref, when no publish SHA can be read, is the engineering checkout's current branch — following G-2 rather than Pass B's accepted "workflows branch name" wording.  
**Decision space:** (1) engineering checkout's current branch (assumed); (2) a fixed publish branch name; (3) no fallback, treating an unreadable SHA as a render error.  
**Why no audit settles it:** Both surviving arms are internally consistent and guard-clean. Which one is correct depends on whether a mutable branch link is acceptable in a posted review at all — a stakeholder call about link durability, not a convention question.  
**Disposition — re-disposed, arm 1:** The fallback stays the engineering checkout's current branch, exactly as drafted. Recorded as a **re-disposition** rather than a re-affirmation: G-2 re-opened Pass B `B-3`, whose accepted "workflows branch name" wording no longer describes the delivered behaviour, so this is that judgement's new disposition and supersedes it. The stakeholder accepted a mutable branch link in the posted comment for the no-SHA case. No redraft; the four files are unchanged by this decision.  

### A-11: Re-affirmation scope for the untouched Pass B judgements

**Assumption:** `B-1` and `B-2` are re-affirmed as drafted; this session does not reopen them.  
**Decision space:** re-affirm both as drafted; or reopen either, widening the change surface beyond the three files this specification scopes.  
**Why no audit settles it:** Both were accepted as design positions rather than derived from a convention, so no schema, catalogue entry, or principle check can re-derive them. Only the stakeholder who accepted them can carry them forward.  
**Disposition — re-affirmed, both:** `B-1` (the `commit-after-activity` carve-out expressed as a scoping cross-reference rather than a conditional in the operation body) and `B-2` (`review-summary-approval` batching the rating-cap carve-in with review type in one checkpoint) both stand unchanged as drafted. Neither is reopened, so the change surface stays at four files.  

---

## Notes

- Open judgements batched into Gate 2 (`approve-to-commit`) and were dispositioned there — no mid-flow per-assumption interview under the headless default. See [Gate 2 Dispositions](#gate-2-dispositions).
- This log is the single canonical home for this session's assumptions ([canonical-home map](../../../../workflows/workflow-design/techniques/TECHNIQUE.md#canonical-home-map)). Change goals live in [03-design-specification.md](03-design-specification.md); out-of-scope deferrals in [01-deferred-items.md](01-deferred-items.md).
