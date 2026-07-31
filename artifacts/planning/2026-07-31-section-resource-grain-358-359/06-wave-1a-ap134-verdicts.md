# Wave 1a AP-134 verdicts (rows 1–45)

**Session:** `TNUCFN` · **PR1 / #358** · **Worktree:** `.worktrees/2026-07-31-section-resource-grain-358-359/`  
**Basis:** [scope manifest](06-scope-manifest.md) · AP-134 `whole-resource-for-one-section`

Per site: **section** = citation retargeted to `#anchor`(s); **leave-whole** = bare cite kept because the technique reads most/all of the body (or the resource is single-section / lens prompt); **split** = none this wave.

---

## Section retargets (edited this run)

| # | Technique path | Resource | Anchors / notes |
|---|----------------|----------|-----------------|
| 1 | `cicd-pipeline-security-audit/techniques/inventory-workflows/initialize-planning-folder.md` | `start-here` | `#purpose` `#phases` `#key-artifacts` |
| 2 | `codebase-wiki/techniques/TECHNIQUE.md` | `citation-conventions` | `#raw-baseline-citations` `#confidence-vocabulary` |
| 3 | `codebase-wiki/techniques/compose-overview.md` | `wiki-format` | `#wiki-tree-layout` |
| 4 | `codebase-wiki/techniques/cross-link.md` | `citation-conventions` | `#wikilink-conventions` |
| 5 | `codebase-wiki/techniques/ingest.md` | `wiki-format`, `citation-conventions` | taxonomy + layout + frontmatter; raw-baseline + confidence. **`page-templates` leave-whole** (all four type templates) |
| 7 | `codebase-wiki/techniques/query.md` | `citation-conventions` | `#wikilink-conventions` |
| 10 | `midnight-system-review/.../grade-findings.md` | `grading-rubric` | `#the-grade-tuple` `#calibration-anchors` |
| 11 | `midnight-system-review/.../register-findings.md` | `grading-rubric` | `#accepted-issue-threshold` |
| 12 | `midnight-system-review/.../compute-verdict.md` | `verdict-rubric` | `#the-scale` `#calibration-anchors` `#verdict-to-review-type` |
| 13 | `midnight-system-review/.../render-review.md` | `review-format` | `#structure` `#accounting-rules` `#verdict-phrases` |
| 14 | `prism-audit/techniques/README.md` | `audit-prompt-template` | `#audit-prompt-template` |
| 15 | `prism-evaluate/.../derive-dimensions.md` | `default-dimensions` | per-type sections + `#dimension-object-structure`; bare whole dropped (coexist tell) |
| 38 | `requirements-refinement/techniques/TECHNIQUE.md` | `specification-protocol` | four named sections |
| 39 | `requirements-refinement/techniques/finalize-specification.md` | `change-summary` | `#template` `#conventions` |
| 41 | `substrate-node-security-audit/.../apply-checklist.md` | `toolkit-checklist` | `#checklist` (all sites) |
| 42 | `substrate-node-security-audit/.../setup-audit-target.md` | `start-here` | `#overview` `#key-artifacts-produced` `#options-at-setup` |
| 43 | `substrate-node-security-audit/.../verify-sub-agent-output.md` | `sub-agent-output-schema` | `#schema` `#field-requirements-by-agent-group` |
| 44 | `work-package/techniques/create-issue.md` | github/jira issue creation | template + structure/types + anti-patterns |
| 45 | `work-package/.../create-complete-doc.md` | `follow-ups`, `deferred-items` | each `#template` |

---

## Leave-whole (recorded; no citation edit)

| # | Technique path | Resource(s) | Rationale |
|---|----------------|-------------|-----------|
| 5 | `codebase-wiki/.../ingest.md` | `page-templates` | Filler walks every type template in one pass |
| 6 | `codebase-wiki/techniques/lint.md` | `lint-checklist` | Audit walks every check; body is one table + notes |
| 8 | `meta/.../detect-resume-intent.md` | `resume-intent-lexicon` | Matching uses affirmative + negative + matching rule |
| 9 | `meta/.../start-session.md` | `bootstrap-protocol` | Single operative body (no multi-section split); whole protocol is the call contract |
| 16–37 | `prism/techniques/**` (wave 1a prism set) | lens prompts (`l12`, `deep-scan`, `identity`, `claim`, `writer`, `prereq`, synthesis/adversarial companions, etc.) | Worker **loads the full lens prompt** as the pass body; section steps are execution structure inside the prompt, not independent consumer slices. Single-section / no-H2 bodies included. |
| 25 | `prism/.../portfolio-analysis.md` | `writer` (and `strategist` if present) | Writer is applied as a whole formatting/voice contract |
| 40 | `substrate-node-security-audit/.../analyze-architecture.md` | `vulnerability-pattern-vocabulary` | Recognition aid across the full pattern set |

**Split (principle 30):** none in wave 1a — no site needed a resource body split to cite correctly.

**Out of wave / deliberate exclusions:** `validation-rubric` / `review-mode` residue; top-20 pairs; rows 46–63 (wave 1b).

---

## Progress

| Batch | Rows | Status |
|-------|------|--------|
| 1a section retargets | listed above | done this run |
| 1a leave-whole prism + small resources | 16–37, 5/6/8/9/40 | recorded |
| 1b | 46–63 | done — see [06-wave-1b-ap134-verdicts.md](06-wave-1b-ap134-verdicts.md) |
| PR2 | 64–68 + framing | remaining |

Commits land on `workflow/workflow-design-section-resource-grain-358-359` under the worktree only.
