# Wave 1b AP-134 verdicts (rows 46–63)

**Session:** `TNUCFN` · **PR1 / #358** · **Worktree:** `.worktrees/2026-07-31-section-resource-grain-358-359/`  
**Basis:** [scope manifest](06-scope-manifest.md) · AP-134 `whole-resource-for-one-section` · [wave 1a](06-wave-1a-ap134-verdicts.md)

Per site: **section** = citation retargeted to `#anchor`(s); **leave-whole** = bare cite kept because the technique reads most/all of the body (or the resource is single-section / two-section register guide that *is* the whole file); **split** = none this wave.

---

## Section retargets (edited this run)

| # | Technique path | Resource | Anchors / notes |
|---|----------------|----------|-----------------|
| 49 | `work-package/techniques/requirements-elicitation/elicit.md` | `requirements-elicitation` | `#question-domain-reference` (both Input + Protocol sites). Document Template / anti-patterns / MVE unused by this technique |
| 51 | `work-package/techniques/review-assumptions/record.md` | `deferred-items` | `#template` — register row shape only |
| 52 | `work-package/techniques/strategic-review/document-findings.md` | `deferred-items` | `#template` — register row shape only |
| 57 | `workflow-design/techniques/derive-design-dimensions.md` | `elicitation-guide` | `#mode-dimension-sets` (Output prose + Protocol) |
| 60 | `workflow-design/techniques/prepare-dimension.md` | `elicitation-guide` | `#dimensions` (Input + Protocol) |
| 62 | `workflow-design/techniques/synthesize-update-specification.md` | `elicitation-guide` | `#mode-dimension-sets` |

---

## Leave-whole (recorded; no citation edit)

| # | Technique path | Resource(s) | Rationale |
|---|----------------|-------------|-----------|
| 46 | `work-package/.../implementation-analysis/analyze.md` | `implementation-analysis` | Protocol says **full guidance**; steps walk Section Vocabulary + Document Template + Rules as one fill pass |
| 47 | `work-package/.../manage-artifacts/TECHNIQUE.md` | `session-trace`, `deferred-items`, `follow-ups` | Canonical-home map points at each register guide; each guide is Template + Rules only (two sections = whole file). Same leave-whole pattern as small creation guides |
| 48 | `work-package/.../plan-prepare/plan.md` | `wp-plan` | Load for **plan template and guidance** — Template + Rules both operative for write |
| 50 | `work-package/.../research/research.md` | `knowledge-base-research` | Guidance for kb findings fill — Planning Artifact template + Rules |
| 53 | `workflow-authoring/.../audit-canon.md` | `convention-conformance` | Enumerates one unit per `##`; resource has a single operative `## Reference Conventions` — whole body is that unit |
| 54 | `workflow-design/techniques/TECHNIQUE.md` | `follow-ups` | Canonical-home map cite; Template + Rules = whole register guide |
| 55 | `workflow-design/techniques/audit-conformance.md` | `convention-conformance` | Sole source of reference-convention criteria; audit walks every concern in the single checklist section |
| 56 | `workflow-design/techniques/context-loading.md` | `format-conventions`, `convention-conformance` | Literacy load: format-conventions Template body + Rules are the operative surface; convention-conformance is the full sibling baseline checklist |
| 58 | `workflow-design/techniques/impact-analysis.md` | `design-specification` | Cross-home link (“link rather than restate”), not a section-scoped fill; Template + Rules define the home identity |
| 59 | `workflow-design/techniques/intake-classification.md` | `update-mode-guide` | Single operative `## Change Categories` is the entire body |
| 61 | `workflow-design/techniques/reconcile-design-assumptions.md` | `convention-conformance`, `design-assumption-reconciliation` | Reconciliation vocabulary has no multi-section split (whole body = table); convention-conformance is a full criteria home for `audit` rows |
| 63 | `workflow-design/techniques/yaml-authoring.md` | `convention-conformance` | Cross-workflow norms pointer; full small checklist is the cite surface |

**Split (principle 30):** none in wave 1b.

---

## Progress

| Batch | Rows | Status |
|-------|------|--------|
| 1a | 1–45 | done (`cc5f4a29`) |
| 1b section retargets | 49, 51–52, 57, 60, 62 | done this run |
| 1b leave-whole | 46–48, 50, 53–56, 58–59, 61, 63 | recorded |
| PR2 | 64–68 + framing | remaining |

Commits land on `workflow/workflow-design-section-resource-grain-358-359` under the worktree only.
