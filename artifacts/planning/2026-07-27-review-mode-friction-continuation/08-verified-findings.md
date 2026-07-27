# Verified Findings — `work-package`

**Mode:** update · **Date:** 2026-07-27
**Pass:** verified
**Target:** `work-package` v3.35.4

Adversarial re-derivation of both High-tier findings, each reproduced from the construct it cites alone. Both were re-derived *before* any fix was applied, so `verify-before-remediation` holds in substance: no edit was made on the strength of an unverified finding.

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| F-1 | High — **confirmed** | Publish-ref guard cannot discriminate the seeded default from a produced ref. Re-derived from the two constructs alone: `workflow.yaml` declares `artifact_publish_ref` with `defaultValue: ""`, therefore the symbol is bound on every path; the Protocol guard read "when it is bound", therefore it selects the empty value and the branch fallback is unreachable. Independently reproduced — the contradiction is internal to the drafted file, whose own Inputs entry declares the value empty at that point. | `techniques/review-summary.md` § Protocol 2 | Guard on non-emptiness. **Applied and re-audited clean.** |
| F-2 | High — **confirmed** | Base URL retains the `.engineering/` path segment after the ref was re-aimed at the engineering checkout. Re-derived empirically rather than from the originating reasoning: `git rev-parse --show-toplevel` in `.engineering` returns that directory (its own checkout, branch `engineering`, remote `m2ux/workflow-server`), and `git ls-tree HEAD` shows `artifacts/` at its root — so `/blob/<eng-ref>/.engineering/artifacts/…` names a path absent from that tree. Independently reproduced against the live layout. | `resources/review-mode.md` § Header Fields | State the checkout-relative path plus the two arms, per `render.md:54`. **Applied and re-audited clean.** |
| F-3 | Medium — spot-confirmed | Two-sentence variable description restating `defaultValue` and carrying a sequencing tail. Cited construct exists and the finding class (AP-126) is right. | `workflow.yaml` `variables[]` · `artifact_publish_ref.description` | One-line description. **Applied.** |

**Finding count:** 3 (2 High confirmed, 1 Medium spot-confirmed; 0 withdrawn, 0 downgraded, 0 raised)

## Notes

- **No finding rated Critical.** Considered and rejected for both Highs on the activity's own test — a Critical is "a schema-invalid or structurally broken construct that must not be committed". `validate-workflow-yaml` reports all 15 activities and `workflow.yaml` valid at 3.35.4, and `check-technique-template` passes; both defects were prose semantics inside structurally valid constructs. The `blocker-gate` decision therefore takes its `no-blocker` default rather than routing back to `scope-and-draft`.
- Both Highs were invisible to every guard on the change surface. `check-binding-fidelity` reported `0 NEW` before and after, because each defect resolves a *declared* symbol — F-1's guard reads a declared variable, F-2's slots are resource-resident and guard-invisible by design ([A-4](03-assumptions-log.md)). This is the agent-audited residue [format conventions](01-format-conventions.md) scopes, and it is the reason the pass mattered.
- The two Low findings (ordering narration in an Inputs entry; `repo_root` description drift) are recorded in their originating satellites and were fixed in the same cycle; they are not re-derived here, per this pass's High/Medium scope.
