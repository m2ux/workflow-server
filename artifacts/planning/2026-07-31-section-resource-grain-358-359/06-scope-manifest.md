# Scope Manifest — Section resource grain (#358 / #359)

**Target:** `workflow-design` (canon) · corpus-wide edit surface · **Mode:** update
**Basis:** [change brief](01-change-brief.md) · [impact analysis](01-impact-analysis.md)
**Worktree:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-31-section-resource-grain-358-359/` ✅ on `workflow/workflow-design-section-resource-grain-358-359` · folder layout **unchanged**

Corpus-wide technique citation grain (PR1 · #358) and section stratification / framing (PR2 · #359) as **two sequenced PRs**. Intentional removals: **0** ([impact §3](01-impact-analysis.md#3-removals-inventory)).

`file_count` = **68** named definition paths this pass · PR2 framing classify expands ~69 further resource rows after arithmetic (not yet path-pinned).

**Delivery decision (authoritative):** two PRs — see [change brief § Delivery decision](01-change-brief.md#delivery-decision--two-prs-authoritative). No blocking #358 site found that requires #359 stratification before a correct citation (**open judgement 1 → keep two PRs**).

---

## PR partition

| PR | Issue | Rows | Surface | Must not |
|----|-------|------|---------|----------|
| **PR 1** | [#358](https://github.com/m2ux/workflow-server/issues/358) | 1–63 | Technique whole-resource citations in the pre-principle-32 **tail** (after top-20 by delivered size; anti-patterns excluded; `validation-rubric` / `review-mode` exclusions honored) | Wait on framing audit; mix `src/`; touch anti-patterns body for the tail |
| **PR 2** | [#359](https://github.com/m2ux/workflow-server/issues/359) (refs #358) | 64–68 + framing classify set | Canon (principles 30/32 + AP-134 sibling); three cross-section anchor fixes; ~69 framing dispositions | Ship delivery variant **C** before classify; mix C into pure-corpus commits |

**Optional PR1 host slice (not in workflows worktree):** `scripts/` mechanical guard — bare technique citation that also anchors the same resource (AP-134 second tell). Worth adding; open judgement 3. Lives on the host repo (`m2ux/workflow-server`), not under this worktree.

**Top-20 whole-resource pairs** (separate branch — **out of this run**): largest by body chars at measurement, including `design-principles`, `schema-construct-inventory`, `tdd-concepts-rust`, `severity-rubric`, `injection-pattern-catalog`, `probe-catalog`, `subsystem-map`, `strategist`, `remediation-playbook`, `requirements-elicitation`←`ask-question`, etc.

**Drafting waves** (activity `file-drafting-loop` `maxIterations: 50`):

| Wave | Rows | When |
|------|------|------|
| **1a** | 1–45 | First confirm → draft cycle (this activity) |
| **1b** | 46–63 | Re-enter scope-and-draft or continue after 1a with bag = 1b |
| **2** | 64–68 + framing rows | After PR1 lands or on a PR2-scoped re-entry; **classify framing before any C / mass delete** |

---

## File manifest

### PR 1 · #358 citation tail (rows 1–63)

| # | Path (under worktree root) | Type | Action | One-line change |
|---|----------------------------|------|--------|-----------------|
| 1 | `cicd-pipeline-security-audit/techniques/inventory-workflows/initialize-planning-folder.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `cicd-pipeline-security-audit/start-here` (2546ch) |
| 2 | `codebase-wiki/techniques/TECHNIQUE.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `codebase-wiki/citation-conventions` (2878ch) |
| 3 | `codebase-wiki/techniques/compose-overview.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `codebase-wiki/wiki-format` (3751ch) |
| 4 | `codebase-wiki/techniques/cross-link.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `codebase-wiki/citation-conventions` (2878ch) |
| 5 | `codebase-wiki/techniques/ingest.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `codebase-wiki/wiki-format` (3751ch), `codebase-wiki/citation-conventions` (2878ch), `codebase-wiki/page-templates` (2692ch) |
| 6 | `codebase-wiki/techniques/lint.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `codebase-wiki/lint-checklist` (2409ch) |
| 7 | `codebase-wiki/techniques/query.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `codebase-wiki/citation-conventions` (2878ch) |
| 8 | `meta/techniques/workflow-engine/detect-resume-intent.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `meta/resume-intent-lexicon` (1525ch) |
| 9 | `meta/techniques/workflow-engine/start-session.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `meta/bootstrap-protocol` (3576ch) |
| 10 | `midnight-system-review/techniques/finding-adjudication/grade-findings.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `midnight-system-review/grading-rubric` (4279ch) |
| 11 | `midnight-system-review/techniques/finding-adjudication/register-findings.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `midnight-system-review/grading-rubric` (4279ch) |
| 12 | `midnight-system-review/techniques/verdict-and-report/compute-verdict.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `midnight-system-review/verdict-rubric` (2446ch) |
| 13 | `midnight-system-review/techniques/verdict-and-report/render-review.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `midnight-system-review/review-format` (3073ch) |
| 14 | `prism-audit/techniques/README.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism-audit/audit-prompt-template` (2993ch) |
| 15 | `prism-evaluate/techniques/plan-evaluation/derive-dimensions.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism-evaluate/default-dimensions` (2502ch) |
| 16 | `prism/techniques/adaptive-analysis/stage-1-sdl.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/deep-scan` (2297ch) |
| 17 | `prism/techniques/adaptive-analysis/stage-2-l12.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/l12` (2662ch) |
| 18 | `prism/techniques/adaptive-analysis/stage-3-full.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/l12-synthesis` (1555ch), `prism/l12-complement-adversarial` (1512ch) |
| 19 | `prism/techniques/behavioral-pipeline/independent-lenses.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/error-resilience` (1836ch), `prism/optimize` (1570ch), `prism/evolution` (1525ch), `prism/api-surface` (1472ch) |
| 20 | `prism/techniques/behavioral-pipeline/synthesis.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/behavioral-synthesis` (1519ch) |
| 21 | `prism/techniques/dispute-analysis.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/l12` (2662ch), `prism/identity` (2297ch), `prism/dispute-synthesis` (1167ch), `prism/l12-universal` (1152ch), `prism/claim` (1013ch) |
| 22 | `prism/techniques/full-prism/adversarial.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/l12-complement-adversarial` (1512ch) |
| 23 | `prism/techniques/full-prism/synthesis.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/l12-synthesis` (1555ch) |
| 24 | `prism/techniques/plan-analysis.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/l12` (2662ch), `prism/l12-synthesis` (1555ch), `prism/behavioral-synthesis` (1519ch), `prism/l12-complement-adversarial` (1512ch), `prism/scarcity` (883ch) |
| 25 | `prism/techniques/portfolio-analysis.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/writer` (3883ch) |
| 26 | `prism/techniques/reflect-analysis.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/l12` (2662ch), `prism/claim` (1013ch) |
| 27 | `prism/techniques/single-lens-analysis.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/reachability` (1648ch) |
| 28 | `prism/techniques/smart-analysis/dispute-correction.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/dispute-synthesis` (1167ch) |
| 29 | `prism/techniques/smart-analysis/prereq-scan.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/prereq` (2822ch) |
| 30 | `prism/techniques/smart-analysis/run-analysis.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/identity` (2297ch), `prism/claim` (1013ch) |
| 31 | `prism/techniques/structural-analysis.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/l12` (2662ch) |
| 32 | `prism/techniques/subsystem-analysis/calibrate.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/subsystem-calibration` (678ch) |
| 33 | `prism/techniques/subsystem-analysis/decompose.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/l12` (2662ch) |
| 34 | `prism/techniques/subsystem-analysis/synthesize.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/subsystem-synthesis` (1146ch) |
| 35 | `prism/techniques/verified-analysis/corrected-analysis.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/l12` (2662ch) |
| 36 | `prism/techniques/verified-analysis/gap-detection.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/knowledge-boundary` (2244ch), `prism/knowledge-audit` (1822ch) |
| 37 | `prism/techniques/verified-analysis/initial-analysis.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `prism/l12` (2662ch) |
| 38 | `requirements-refinement/techniques/TECHNIQUE.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `requirements-refinement/specification-protocol` (3982ch) |
| 39 | `requirements-refinement/techniques/finalize-specification.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `requirements-refinement/change-summary` (1021ch) |
| 40 | `substrate-node-security-audit/techniques/analyze-architecture.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `substrate-node-security-audit/vulnerability-pattern-vocabulary` (2957ch) |
| 41 | `substrate-node-security-audit/techniques/apply-checklist.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `substrate-node-security-audit/toolkit-checklist` (5189ch) |
| 42 | `substrate-node-security-audit/techniques/setup-audit-target.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `substrate-node-security-audit/start-here` (2421ch) |
| 43 | `substrate-node-security-audit/techniques/verify-sub-agent-output.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `substrate-node-security-audit/sub-agent-output-schema` (4790ch) |
| 44 | `work-package/techniques/create-issue.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `work-package/github-issue-creation` (5199ch), `work-package/jira-issue-creation` (5118ch) |
| 45 | `work-package/techniques/finalize-documentation/create-complete-doc.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `work-package/deferred-items` (1953ch), `work-package/follow-ups` (1467ch) |
| 46 | `work-package/techniques/implementation-analysis/analyze.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `work-package/implementation-analysis` (4866ch) |
| 47 | `work-package/techniques/manage-artifacts/TECHNIQUE.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `work-package/session-trace` (2361ch), `work-package/deferred-items` (1953ch), `work-package/follow-ups` (1467ch) |
| 48 | `work-package/techniques/plan-prepare/plan.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `work-package/wp-plan` (4004ch) |
| 49 | `work-package/techniques/requirements-elicitation/elicit.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `work-package/requirements-elicitation` (5766ch) |
| 50 | `work-package/techniques/research/research.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `work-package/knowledge-base-research` (2904ch) |
| 51 | `work-package/techniques/review-assumptions/record.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `work-package/deferred-items` (1953ch) |
| 52 | `work-package/techniques/strategic-review/document-findings.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `work-package/deferred-items` (1953ch) |
| 53 | `workflow-authoring/techniques/workflow-definition/audit-canon.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `workflow-design/convention-conformance` (1528ch) |
| 54 | `workflow-design/techniques/TECHNIQUE.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `workflow-design/follow-ups` (1407ch) |
| 55 | `workflow-design/techniques/audit-conformance.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `workflow-design/convention-conformance` (1528ch) |
| 56 | `workflow-design/techniques/context-loading.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `workflow-design/format-conventions` (2631ch), `workflow-design/convention-conformance` (1528ch) |
| 57 | `workflow-design/techniques/derive-design-dimensions.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `workflow-design/elicitation-guide` (2994ch) |
| 58 | `workflow-design/techniques/impact-analysis.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `workflow-design/design-specification` (2289ch) |
| 59 | `workflow-design/techniques/intake-classification.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `workflow-design/update-mode-guide` (758ch) |
| 60 | `workflow-design/techniques/prepare-dimension.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `workflow-design/elicitation-guide` (2994ch) |
| 61 | `workflow-design/techniques/reconcile-design-assumptions.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `workflow-design/convention-conformance` (1528ch), `workflow-design/design-assumption-reconciliation` (901ch) |
| 62 | `workflow-design/techniques/synthesize-update-specification.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `workflow-design/elicitation-guide` (2994ch) |
| 63 | `workflow-design/techniques/yaml-authoring.md` | technique | modify | PR1 · AP-134 per-site verdict on whole-resource cite(s): `workflow-design/convention-conformance` (1528ch) |

### PR 2 · #359 fixed + canon (rows 64–68)

| # | Path (under worktree root) | Type | Action | One-line change |
|---|----------------------------|------|--------|-----------------|
| 64 | `workflow-design/resources/design-principles.md` | resource | modify | PR2 · Extend principle 30 and/or 32: section-scoped reader dependencies live in a section |
| 65 | `workflow-design/resources/anti-patterns.md` | resource | modify | PR2 · Add AP-134 sibling `framing-outside-any-section` (mechanical detect) |
| 66 | `meta/resources/planning-readme.md` | resource | modify | PR2 · Fix cross-section dep `#progress-status-call-sites` → anchored `#status` (or equivalent) |
| 67 | `work-package/resources/architecture-summary.md` | resource | modify | PR2 · Fix `#diagram-selection` → artifact-template section anchor |
| 68 | `work-package/resources/pr-description.md` | resource | modify | PR2 · Make glyph key available to `#link-row-forms` section consumers |

### PR 2 · framing classify set (path-pin after classify)

Not path-enumerated until the #359 read-and-decide pass names each of the ~69 resources that carry framing a section-scoped reader never receives (issue measurement: H1 framing / pre-heading prose on resources with anchored citers). Per site: delete duplicate / mint `##` for operative unique / leave orientation. **Removals inventory must refresh before any framing body is deleted** ([impact §3](01-impact-analysis.md#3-removals-inventory)).

**Variant C** (`src/utils/resource-delivery.ts` + tests + corpus-sha): **only** if classify arithmetic is mostly operative-and-unique — separate commit or third PR slice; never mixed into rows 64–68 pure-corpus commits.

**Out of scope this pass:**

- Top-20 citation pairs (separate branch)
- `anti-patterns` eager-bundle exclusion / body size for #358 measurement
- `review-summary` → `review-mode` and `validate-specification` → `validation-rubric` (whole-resource economical; residue with #356)
- All `workflow.yaml` / `activities/*.yaml` topology
- `src/` / `schemas/` under default path (PR1 always; PR2 unless post-classify C)
- Host `scripts/` guard until open judgement 3 decides include vs defer

---

## Structural design

```
.worktrees/2026-07-31-section-resource-grain-358-359/   # workflows worktree — layout unchanged
├── <workflow>/techniques/**/*.md     # PR1 citation retargets / leave-whole verdicts
├── <workflow>/resources/*.md         # PR1 rare principle-30 splits; PR2 framing + 3 fixes
├── workflow-design/resources/
│   ├── design-principles.md          # PR2 canon clause
│   └── anti-patterns.md              # PR2 AP-134 sibling only (not #358 size work)
└── …
```

Host (optional, outside this worktree): `scripts/check-*.ts` bare+anchor guard.

**Flow:** Topology unchanged on every workflow — no activity, transition, variable, or checkpoint edits.

| Pattern | This change |
|---------|-------------|
| Citation grain is a delivery decision (principle 32 / AP-134) | PR1 per-site section / leave-whole / split |
| Section-scoped reads are self-sufficient (stratification) | PR2 framing classify + principle clause + AP sibling |
| Cross-section deps use anchors | Three named resources in rows 66–68 |
| Classify before delivery-layer C | Open judgement 2; C never in pure-corpus commits |
| Two PRs by blast radius | PR1 definitions (+ optional scripts); PR2 structure/canon/(optional src slice) |

---

## Drafting order

1. **PR1 wave 1a (rows 1–45)** — citation verdicts only; no resource body deletes; split resources only when principle 30 applies at a site.
2. **PR1 wave 1b (rows 46–63)** — remaining tail techniques (work-package remainder, workflow-design, workflow-authoring).
3. **Optional `scripts/` guard** — host repo, if judgement 3 includes it in PR1.
4. **PR2 rows 64–68** — canon + three cross-section fixes (can ship without full framing classify, but must not be the sole #359 done signal).
5. **PR2 framing classify → path-pinned edits** — delete / section / leave per resource; refresh removals inventory before deletes.
6. **Variant C only if arithmetic supports** — separate `src/` slice after classify.

**Rationale:** Citations before structure so #358 can merge without framing; classify before C so delivery never cements duplicates; waves respect the 50-iteration drafting loop.

---

## Measurement notes (evidence, not a second home)

- Worktree HEAD at provision: `4196c853` on branch `workflow/workflow-design-section-resource-grain-358-359` tracking `origin/workflows`.
- Whole-resource unique pairs measured: **107** (anti-patterns excluded); top-20 reserved; PR1 tail techniques after exclusions: **63** files / **86** pairs.
- Bare+anchor same-resource sites remaining: **1** (`requirements-refinement/validate-specification` → `validation-rubric`) — already in the #358 deliberate exclusion set; guard still valuable for regression.
- No PR1 site identified that cannot be correctly cited until its resource is stratified under #359.
