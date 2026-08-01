# Framing classification — #359

**Status:** complete
**Method:** Enumerate resources with ≥1 anchored technique citation (`](...resources/....md#...)`). Measure framing outside any `##` span (prose under leading H1 before first `##`, or prose before any heading). Sample citing techniques for obligation overlap. Classify **duplicate** / **operative-unique** / **orientation** / **pre-heading**.
**Worktree tip at classify:** post-edit path-pins on known samples; orientation left in place.
**anti-patterns.md:** included when cited; excluded from eager-size work (no body rewrite beyond AP-139 already shipped).

## Arithmetic (final)

| Class | Count | Share of framed | Notes |
|-------|------:|----------------:|-------|
| duplicate | 1 | 1.1% | Delete framing that restates technique / in-body Rules |
| operative-unique | 3 | 3.4% | Mint named `##` for section-scoped readers |
| orientation | 81 | 93.1% | Leave; purpose/role only |
| pre-heading | 2 | 2.3% | Mint H1/`##` so prose is inside a section |
| **total with framing** | **87** | 100% | Resources with ≥1 anchored citer and non-empty framing |
| cited resources (anchored) | 94 | — | 7 cited with empty framing (no row) |
| cross-section (not framing) | 3 | — | Fixed earlier: planning-readme status deixis, architecture-summary diagram, pr-description glyphs |

### C gate decision

**Recommendation: no delivery variant C.**

- Orientation dominates (81/87 = 93%).
- Operative-unique is a thin tail (3) — path-pin mint `##` is enough; section-scoped readers gain the obligations without auto-including whole-file framing.
- Duplicate is sparse (1) — deletion only, not a delivery-layer fix.
- Do **not** implement `src/utils/resource-delivery.ts` on this run. Revisit C only if a future pass finds operative-unique dominating after orientation re-audit.

## Path-pin treatments (this pass)

| Resource | Class | Treatment |
|----------|-------|-----------|
| `work-package/resources/complete-wp-guide.md` | duplicate | deleted framing; ## Template / ## Rules + create-complete-doc Protocol hold obligations |
| `workflow-design/resources/schema-construct-inventory.md` | operative-unique | minted ## Universal obligation |
| `meta/resources/planning-readme.md` | operative-unique | minted ## Index role |
| `work-package/resources/workflow-retrospective.md` | operative-unique | minted ## Host nesting |
| `prism/resources/definitive-findings-template.md` | pre-heading | minted H1 + ## Artifact contract |
| `prism/resources/final-output-template.md` | pre-heading | minted H1 + ## Artifact contract |

## Full classification table

| # | Resource | Chars | Class | Citers | Sample anchors | Technique check / note | Treatment |
|--:|----------|------:|-------|-------:|----------------|------------------------|-----------|
| 1 | `work-package/resources/complete-wp-guide.md` | 389 | duplicate | 2 | `#template` | create-complete-doc Protocol steps 1–3 restates canonical-home + review header; ## Rules below | deleted framing; ## Template / ## Rules + create-complete-doc Protocol hold obligations |
| 2 | `meta/resources/planning-readme.md` | 1048 | operative-unique | 10 | `#icon-key`, `#item-cell`, `#matching`, `#progress-status-call-sites`, … | create-readme / sync-progress-status cite ## sections; index role was outside sections | minted ## Index role |
| 3 | `workflow-design/resources/schema-construct-inventory.md` | 968 | operative-unique | 1 | `#activity-level-constructs-activityschemajson`, `#condition-constructs-conditionschemajson`, `#technique-level-constructs-techniqueschemajson`, `#workflow-level-constructs-workflowschemajson` | yaml-authoring / audit-expressiveness cite whole file or ## constructs; obligation was outside any section | minted ## Universal obligation |
| 4 | `work-package/resources/workflow-retrospective.md` | 314 | operative-unique | 4 | `#item-budget`, `#mechanical-classes-from-the-resolved-trace`, `#output-section-template` | conduct-retrospective states nesting; resource framing still unique structural claim for section readers | minted ## Host nesting |
| 5 | `prism/resources/definitive-findings-template.md` | 402 | pre-heading | 1 | `#definitive-findingsmd-template` | no leading H1; prose before first ## | minted H1 + ## Artifact contract |
| 6 | `prism/resources/final-output-template.md` | 263 | pre-heading | 1 | `#reportmd-template` | no leading H1; prose before first ## | minted H1 + ## Artifact contract |
| 7 | `work-package/resources/github-issue-creation.md` | 1172 | orientation | 1 | `#anti-patterns`, `#issue-template`, `#section-rules` | manual bulk disposition | leave |
| 8 | `work-package/resources/review-mode.md` | 970 | orientation | 4 | `#branch-hygiene`, `#code-review`, `#documentation-review`, `#header-fields`, … | manual bulk disposition | leave |
| 9 | `work-package/resources/codebase-comprehension.md` | 778 | orientation | 4 | `#artifact-template`, `#comprehension-techniques` | manual bulk disposition | leave |
| 10 | `work-package/resources/requirements-elicitation.md` | 730 | orientation | 3 | `#document-template`, `#question-domain-reference` | manual bulk disposition | leave |
| 11 | `work-package/resources/knowledge-base-research.md` | 642 | orientation | 2 | `#planning-artifact` | manual bulk disposition | leave |
| 12 | `cicd-pipeline-security-audit/resources/cicd-audit-report-template.md` | 596 | orientation | 1 | `#cicd-audit-report-template` | purpose/role framing | leave |
| 13 | `codebase-wiki/resources/wiki-format.md` | 593 | orientation | 2 | `#page-frontmatter-schema`, `#page-type-taxonomy`, `#wiki-tree-layout` | purpose/role framing | leave |
| 14 | `workflow-authoring/resources/findings-register.md` | 552 | orientation | 1 | `#template` | manual bulk disposition | leave |
| 15 | `workflow-design/resources/design-principles.md` | 501 | orientation | 4 | `#11-complete-documentation-structure`, `#17-document-in-positive-present`, `#9-encode-constraints-as-structure` | manual bulk disposition | leave |
| 16 | `prism-audit/resources/audit-prompt-template.md` | 498 | orientation | 2 | `#audit-prompt-template` | purpose/role framing | leave |
| 17 | `work-package/resources/implementation-analysis.md` | 487 | orientation | 1 | `#document-template` | purpose/role framing | leave |
| 18 | `work-package/resources/deferred-items.md` | 477 | orientation | 3 | `#template` | manual bulk disposition | leave |
| 19 | `workflow-design/resources/anti-patterns.md` | 452 | orientation | 3 | `#ap-114-pass-orchestration-in-technique`, `#authoring-guidance-mr`, `#canon-hygiene-anti-patterns`, `#coupling-anti-patterns`, … | manual bulk disposition | leave |
| 20 | `substrate-node-security-audit/resources/audit-prompt-template.md` | 438 | orientation | 2 | `#3-systematic-manual-review-strategies`, `#finding-entry` | default orientation | leave |
| 21 | `ponytail/resources/the-ladder.md` | 405 | orientation | 5 | `#rungs`, `#safety-floor`, `#understand-first` | manual bulk disposition | leave |
| 22 | `workflow-design/resources/findings-satellite.md` | 404 | orientation | 7 | `#template` | manual bulk disposition | leave |
| 23 | `substrate-node-security-audit/resources/target-profile.md` | 394 | orientation | 9 | `#agent-dispatch-assignments`, `#consensus-critical-configuration-structs`, `#cross-chain-pallets`, `#file-coverage-obligations`, … | purpose/role framing | leave |
| 24 | `workflow-design/resources/design-assumptions.md` | 393 | orientation | 1 | `#assumptions-log-template` | manual bulk disposition | leave |
| 25 | `prism-evaluate/resources/mitigation-plan-template.md` | 379 | orientation | 2 | `#mitigation-plan-template` | purpose/role framing | leave |
| 26 | `cicd-pipeline-security-audit/resources/intermediate-artifact-schemas.md` | 360 | orientation | 7 | `#merged-findings`, `#reconciliation`, `#scanner-assignments`, `#verification-report`, … | purpose/role framing | leave |
| 27 | `work-package/resources/architecture-summary.md` | 347 | orientation | 2 | `#architecture-summary-artifact-template`, `#diagram-selection` | purpose/role framing | leave |
| 28 | `midnight-system-review/resources/verdict-rubric.md` | 344 | orientation | 1 | `#calibration-anchors`, `#the-scale`, `#verdict-to-review-type` | purpose/role framing | leave |
| 29 | `prism-evaluate/resources/evaluation-report-template.md` | 330 | orientation | 3 | `#evaluation-report-template` | purpose/role framing | leave |
| 30 | `work-package/resources/test-plan.md` | 329 | orientation | 4 | `#templates`, `#test-plan-structure` | purpose/role framing | leave |
| 31 | `workflow-design/resources/compliance-report.md` | 322 | orientation | 2 | `#template` | manual bulk disposition | leave |
| 32 | `workflow-design/resources/scope-manifest.md` | 317 | orientation | 1 | `#template` | manual bulk disposition | leave |
| 33 | `work-package/resources/strategic-review.md` | 304 | orientation | 2 | `#strategic-review-artifact-template` | purpose/role framing | leave |
| 34 | `workflow-authoring/resources/change-brief.md` | 295 | orientation | 2 | `#template` | manual bulk disposition | leave |
| 35 | `substrate-node-security-audit/resources/audit-template-reference.md` | 294 | orientation | 4 | `#2-static-analysis-phase`, `#3-systematic-manual-review-strategies`, `#5-execution-strategy` | purpose/role framing | leave |
| 36 | `workflow-authoring/resources/scope-manifest.md` | 294 | orientation | 1 | `#template` | manual bulk disposition | leave |
| 37 | `work-package/resources/pr-description.md` | 293 | orientation | 4 | `#lifecycle-tense`, `#link-row-forms`, `#mandated-sections-present`, `#rules`, … | purpose/role framing | leave |
| 38 | `workflow-design/resources/impact-analysis.md` | 288 | orientation | 1 | `#template` | manual bulk disposition | leave |
| 39 | `work-package/resources/follow-ups.md` | 285 | orientation | 1 | `#template` | manual bulk disposition | leave |
| 40 | `midnight-system-review/resources/grading-rubric.md` | 279 | orientation | 2 | `#accepted-issue-threshold`, `#calibration-anchors`, `#the-grade-tuple` | purpose/role framing | leave |
| 41 | `work-package/resources/jira-issue-creation.md` | 279 | orientation | 1 | `#anti-patterns`, `#issue-structure`, `#issue-types` | manual bulk disposition | leave |
| 42 | `work-package/resources/wp-plan.md` | 279 | orientation | 1 | `#template` | purpose/role framing | leave |
| 43 | `workflow-authoring/resources/impact-analysis.md` | 274 | orientation | 1 | `#template` | manual bulk disposition | leave |
| 44 | `ponytail/resources/ponytail-marker-convention.md` | 273 | orientation | 4 | `#convention`, `#no-trigger` | manual bulk disposition | leave |
| 45 | `work-package/resources/architecture-review.md` | 272 | orientation | 4 | `#adr-template`, `#architectural-significance`, `#decision-making-discipline` | purpose/role framing | leave |
| 46 | `workflow-design/resources/completion-artifact.md` | 257 | orientation | 1 | `#rules`, `#template` | manual bulk disposition | leave |
| 47 | `workflow-design/resources/README.md` | 254 | orientation | 1 | `#planning-artifact--guide-map` | manual bulk disposition | leave |
| 48 | `ponytail/resources/review-taxonomy.md` | 253 | orientation | 2 | `#comment-proportionality`, `#tags` | manual bulk disposition | leave |
| 49 | `ponytail/resources/honesty-boundary.md` | 234 | orientation | 1 | `#medians` | manual bulk disposition | leave |
| 50 | `requirements-refinement/resources/validation-rubric.md` | 233 | orientation | 2 | `#issue-categorization`, `#source-coverage` | purpose/role framing | leave |
| 51 | `requirements-refinement/resources/requirements-analysis-report.md` | 232 | orientation | 1 | `#conventions`, `#source-coverage-matrix`, `#template` | purpose/role framing | leave |
| 52 | `workflow-design/resources/design-specification.md` | 231 | orientation | 1 | `#rules`, `#template` | manual bulk disposition | leave |
| 53 | `workflow-design/resources/elicitation-guide.md` | 222 | orientation | 4 | `#dimensions`, `#mode-dimension-sets` | manual bulk disposition | leave |
| 54 | `work-package/resources/assumption-reconciliation.md` | 216 | orientation | 1 | `#integration-with-assumptions-log`, `#scorecard` | purpose/role framing | leave |
| 55 | `requirements-refinement/resources/specification-protocol.md` | 210 | orientation | 4 | `#identifier-schemes`, `#requirement-entry-format`, `#section-structure`, `#source-reference-format`, … | purpose/role framing | leave |
| 56 | `prism-evaluate/resources/evaluation-plan-template.md` | 208 | orientation | 1 | `#evaluation-plan-template` | purpose/role framing | leave |
| 57 | `workflow-authoring/resources/README.md` | 206 | orientation | 1 | `#criteria-homes` | manual bulk disposition | leave |
| 58 | `workflow-design/resources/convention-conformance.md` | 201 | orientation | 2 | `#reference-conventions` | manual bulk disposition | leave |
| 59 | `midnight-system-review/resources/review-format.md` | 193 | orientation | 1 | `#accounting-rules`, `#structure`, `#verdict-phrases` | purpose/role framing | leave |
| 60 | `meta/resources/session-summary-template.md` | 191 | orientation | 1 | `#session-summary-template` | purpose/role framing | leave |
| 61 | `work-package/resources/assumptions-review.md` | 187 | orientation | 6 | `#assumptions-log-template`, `#classification-vocabulary`, `#probe-vocabulary` | manual bulk disposition | leave |
| 62 | `work-package/resources/research-reconciliation.md` | 176 | orientation | 2 | `#inventory-shape`, `#scorecard` | purpose/role framing | leave |
| 63 | `requirements-refinement/resources/change-summary.md` | 170 | orientation | 1 | `#conventions`, `#template` | purpose/role framing | leave |
| 64 | `workflow-design/resources/structural-inventory.md` | 166 | orientation | 1 | `#template` | manual bulk disposition | leave |
| 65 | `workflow-design/resources/drafting-plan.md` | 164 | orientation | 1 | `#template` | manual bulk disposition | leave |
| 66 | `work-package/resources/test-suite-review.md` | 159 | orientation | 1 | `#anti-patterns`, `#report-template`, `#review-criteria` | purpose/role framing | leave |
| 67 | `codebase-wiki/resources/citation-conventions.md` | 151 | orientation | 4 | `#confidence-vocabulary`, `#raw-baseline-citations`, `#wikilink-conventions` | manual bulk disposition | leave |
| 68 | `workflow-design/resources/file-review-note.md` | 136 | orientation | 1 | `#template` | manual bulk disposition | leave |
| 69 | `workflow-design/resources/pattern-analysis.md` | 127 | orientation | 1 | `#template` | manual bulk disposition | leave |
| 70 | `work-packages/resources/workflow-triggering-protocol.md` | 126 | orientation | 1 | `#triggering-a-work-package` | purpose/role framing | leave |
| 71 | `cicd-pipeline-security-audit/resources/cicd-severity-rubric.md` | 125 | orientation | 3 | `#calibration-anchors`, `#severity-matrix` | purpose/role framing | leave |
| 72 | `work-package/resources/design-framework.md` | 122 | orientation | 8 | `#design-framework-trizics-approach`, `#design-philosophy-artifact-template` | manual bulk disposition | leave |
| 73 | `workflow-authoring/resources/completion-artifact.md` | 118 | orientation | 1 | `#template` | manual bulk disposition | leave |
| 74 | `workflow-design/resources/draft-attestation.md` | 112 | orientation | 1 | `#template` | manual bulk disposition | leave |
| 75 | `work-packages/resources/prioritization-framework.md` | 111 | orientation | 1 | `#scoring-guidance`, `#step-1-dependency-graph` | purpose/role framing | leave |
| 76 | `cicd-pipeline-security-audit/resources/sub-agent-output-schema.md` | 105 | orientation | 8 | `#file-naming-convention`, `#schema` | purpose/role framing | leave |
| 77 | `workflow-authoring/resources/elicitation-guide.md` | 103 | orientation | 2 | `#dimensions`, `#mode-dimension-sets` | manual bulk disposition | leave |
| 78 | `prism-evaluate/resources/default-dimensions.md` | 98 | orientation | 1 | `#codebase`, `#custom-targets`, `#dimension-object-structure`, `#mixed-targets`, … | purpose/role framing | leave |
| 79 | `work-package/resources/rust-substrate-code-review.md` | 97 | orientation | 2 | `#report-template`, `#review-criteria` | purpose/role framing | leave |
| 80 | `work-packages/resources/completion-analysis-guide.md` | 84 | orientation | 1 | `#4-document-findings`, `#analysis-steps` | purpose/role framing | leave |
| 81 | `work-packages/resources/roadmap-template.md` | 78 | orientation | 1 | `#duration-formula`, `#readmemd-final-format`, `#start-heremd-final-format` | purpose/role framing | leave |
| 82 | `prism-evaluate/resources/dimension-lens-mapping.md` | 75 | orientation | 1 | `#custom-dimension-mappings`, `#output-subdirectory-convention`, `#standard-mappings` | purpose/role framing | leave |
| 83 | `work-packages/resources/context-analysis-guide.md` | 75 | orientation | 1 | `#5-document-findings`, `#analysis-steps` | purpose/role framing | leave |
| 84 | `workflow-authoring/resources/update-mode-guide.md` | 74 | orientation | 2 | `#change-categories` | manual bulk disposition | leave |
| 85 | `work-packages/resources/package-plan-template.md` | 70 | orientation | 3 | `#template` | purpose/role framing | leave |
| 86 | `work-packages/resources/planning-folder-template.md` | 70 | orientation | 3 | `#folder-location`, `#readmemd-skeleton`, `#start-heremd-skeleton` | purpose/role framing | leave |
| 87 | `work-package/resources/web-research.md` | 42 | orientation | 2 | `#planning-artifact` | manual bulk disposition | leave |

## Empty-framing cited resources (no classify row)

Seven anchored-cited resources have no prose outside `##` spans (already section-stratified or H1-only). Not counted in the 87.

## Method notes

1. **duplicate** — framing restates obligations already in citing technique Protocol and/or the resource’s own `##` Rules/Template.
2. **operative-unique** — framing carries an obligation or structural constraint a section-scoped reader needs and that is not fully owned by the first cited `##` alone.
3. **orientation** — purpose/role/“what this document is” prose; operative detail lives under `##` sections citers already anchor.
4. **pre-heading** — body prose before any heading (no leading H1); treat by minting H1 + named `##`.
5. Orientation bulk disposition used purpose-opener patterns plus spot checks that `##` sections hold fill rules, rubrics, and templates.

