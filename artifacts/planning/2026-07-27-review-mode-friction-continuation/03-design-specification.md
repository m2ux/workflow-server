# Design Specification — Pass B Binding Fidelity

**Workflow:** `work-package` v3.35.3
**Mode:** Update
**Date:** 2026-07-27
**Change categories:** Technique, Resource
**Change request:** Close the eight #270 Pass B binding-fidelity drifts on PR #274 and settle the Pass B open judgements at Gate 2.
**Baseline:** [structural inventory](01-structural-inventory.md)

---

## Purpose

`work-package` renders the consolidated review comment from `techniques/review-summary.md`, whose `Plan` and `Reports` header links are built from the engineering-artifacts base URL owned by `resources/review-mode.md`. Pass B (#270) moved that URL's UPPERCASE template slots — and the duty of resolving its git ref — out of the resource and into the technique, where a braced token denotes a session symbol rather than a template slot. Eight reads there now name no producer, so the render reaches those steps with nothing to substitute and can emit the broken planning-folder links #270 set out to fix.

This session makes every braced read in the two affected techniques resolve to a declared symbol, leaves the URL template in its resource home, and disposes the Pass B judgements PR #274 records as still open.

| Goal | Meaning |
|------|---------|
| **G-1** Publish ref resolves | The four `{ARTIFACT_PUBLISH_REF}` reads in `review-summary.md` (lines 55 ×2, 62, 63) name a symbol the resolver can bind — the declared `artifact_publish_ref` input, or a snake_case protocol local holding the two-arm resolved ref. |
| **G-2** Engineering checkout is the git target | `review-summary.md` and `publish-review-artifacts.md` take the declared workflow variable `repo_root` in place of the undeclared `reference_path`, and run their git reads in the engineering checkout rather than the parent checkout. |
| **G-3** URL slots stay in the resource | `{ENG_REPO_OWNER}` and `{ENG_REPO_NAME}` are slots of the base-URL template, not session symbols; the technique cites the owning section and names no slot of it. |
| **G-4** One statement of the source | `review-mode.md`'s ref-resolution parenthetical stops naming a caller symbol, so G-2 leaves no surviving restatement of the superseded name. |
| **G-5** Judgements land | Gate 2 disposes the Pass B open rows that actually exist, and PR #274's body cites assumption ids that resolve. |

### Why G-2 is a re-target, not a rename

`.engineering/` is a nested checkout of the same GitHub repo on branch `engineering`, while the enclosing product checkout sits on `main`. Binding the orphan input to a parent-repo path would therefore make `branch --show-current` yield `main` — the one value `review-summary.md` explicitly forbids hardcoding — and `rev-parse HEAD` yield a SHA off the branch the artifacts were never committed to. Resolving the canonical id alone does not close the defect: the git reads must also address the engineering checkout, via the two-arm `{$eng_git_dir}` form the tree already uses in `techniques/update-pr/render.md` and `techniques/manage-git/artifact-commits.md`.

**Out of scope:**

- The three broken resource anchors and the `activities/04-research.yaml` `duplicate-checkpoint` violation that are identical on the `origin/workflows` baseline — see [deferred items](01-deferred-items.md).
- Everything the branch already delivered; the inventory's Update scope names the frozen set, and this session does not redo it.
- `src/` and `schemas/` — no engine or guard change. Placeholder resolvability is agent-audited, not machine-enforced ([format conventions](01-format-conventions.md)).

**Also see:** [assumptions log](03-assumptions-log.md) · [impact](05-impact-analysis.md)

---

## Activity list

No activities added, removed, or reordered. `submit-for-review` keeps the Pass B step order (render → approve → persist → publish → refresh → post), and both affected techniques stay bound where Pass B placed them. Because `repo_root` is already a declared workflow variable, G-2 resolves by implicit same-name binding and needs no `step.technique.inputs` deviation at either bind site.

---

## Checkpoints

No gate message, option set, or effect changes. `review-summary-approval` keeps its Pass B review-type options.

---

## Artifacts

| Artifact / surface | Target shape |
|--------------------|--------------|
| Posted review comment (`review_summary`) | `Plan` and `Reports` links resolve against the ref the artifacts were actually published on — the engineering checkout's publish SHA, or that checkout's own branch when no SHA is readable. Never the parent checkout's branch. |
| `review-summary.md` planning artifact | Contract unchanged. It stays the verbatim source of the posted comment, so it carries the same resolved links. |

The workflow's artifact set is otherwise unchanged; no artifact is added, renamed, or removed.

---

## Rules

`work-package`'s own `rules[]` is unchanged — the nine `workflow`-partition entries and the technique-local `publish-before-post` rule all stand. The change is bound by these authoring constraints:

| Rule / principle | Application |
|------------------|---------------|
| `bind-protocol-locals` (AP-62) | A read whose value is already declared I/O is fixed by naming that declared id — never by inventing a local for it. Only a genuinely derived value (the resolved two-arm ref) takes a `{$name}` local, declared once at its producer and read bare thereafter. |
| `resource-fills-not-does` (AP-92) | Resource-resident braced tokens sit outside guard coverage; content relocated into a technique must resolve there. The base-URL template stays fill content in `review-mode.md`. |
| `procedure-in-io-contract` (AP-119) | The fallback resolution recipe currently carried in two Inputs descriptions belongs in Protocol. Each entry states only what its value is. |
| `stale-restatement-after-change` (AP-129) | The symbol change is swept tree-wide in one edit — both technique files and the resource parenthetical — and the occurrence count recorded for audit. |
| `snake-case-symbols` (AP-58) / `sigil-casing` | Every symbol id in a technique is snake_case. An UPPERCASE token can never bind, whatever its spelling elsewhere. |
| Convention Over Invention (7) | Reuse the canonical `repo_root` id and the established `{$eng_git_dir}` two-arm form rather than introducing a synonym or a new resolution idiom. |
| One Authoritative Home (6) | The base URL and its slots have exactly one home, `review-mode.md#header-fields`; the technique cites that section and does not restate it. |

---

## Confirmation ask

Approving this specification accepts the five goals above as the whole of this session's change surface — two technique files and one resource file — and accepts that closing G-2 re-targets the affected git reads at the engineering checkout rather than merely renaming a symbol.
