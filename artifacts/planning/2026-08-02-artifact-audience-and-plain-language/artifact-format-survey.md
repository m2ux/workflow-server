# Survey: how planning artifacts get their format, sections, and style

Corpus survey run 2026-08-02 over `workflows/` at the current head of the `workflows` branch, supporting the artifact-audience epic. All paths are relative to the workflows repository root unless prefixed `docs/`, `src/`, `scripts/`, or `constraints/` (server repository, `main`).

## Headline counts

| Metric | Count | How derived |
|---|---|---|
| Technique files declaring `#### artifact` (artifact-producing techniques) | 118 | `grep -rl '^#### artifact$' workflows/ --include=*.md` |
| Total `#### artifact` declarations (a technique may produce several) | 139 | same grep, non-`-l` |
| Distinct artifact filename strings (incl. `{token}` templates) | 104 | unique of the declaration bodies |
| Resource `.md` files under `workflows/*/resources/` | 191 | directory listing |
| Resources carrying any Template / Skeleton / Structure heading | 68 | heading grep |
| Resources using the canonical `## Template` heading | 30 | `grep -rl '^## Template'` |
| Resources declaring a hard line budget | 20 | `grep -rn '[Ll]ine budget'` — 14 workflow-design, 5 workflow-authoring, 1 work-package |
| Techniques declaring `#### audience` | **0** | `grep -rn 'audience' workflows/` |
| Artifact-declaring techniques with no `resources/` citation at all | 16 | `grep -rL "resources/"` over the 118 |

Per-workflow artifact-producing technique counts:

```
work-package 22 · prism 20 · workflow-design 18 · substrate-node-security-audit 9
workflow-authoring 7 · work-packages 7 · midnight-system-review 7
requirements-refinement 6 · cicd-pipeline-security-audit 6 · prism-audit 5
ponytail 4 · prism-evaluate 3 · codebase-wiki 2 · remediate-vuln 1 · meta 1
```

## Coverage grades

Grading the 118 artifact-declaring techniques by where their output structure is prescribed:

| Grade | Count | Meaning |
|---|---|---|
| A — cites a resource `## Template` / named template anchor | ~52 | work-package 18/22, workflow-design 16/18, workflow-authoring 6/7, prism-evaluate 3/3, work-packages 6/7, cicd 5/6, substrate 5/9, requirements-refinement 3/6, codebase-wiki 1/2, prism 2/20, midnight-system-review 1/7 |
| B — structure prescribed inline in Protocol/Outputs (fenced skeleton, field list, line-grammar), no resource | ~50 | all 16 prism lens-driven passes (shape lives in the lens prompt), `prism/techniques/emit-run-manifest.md`, 4 ponytail line-grammars, 3 prism-audit finalize operations, 4–5 midnight-system-review working artifacts, plus scattered singles |
| C — no structure prescribed anywhere | ~10–16 | shortlist below |

### Grade-C shortlist (no prescribed structure)

1. `workflows/prism/techniques/plan-analysis.md` → `analysis-plan.md` — "write the human-readable plan", nothing more
2. `workflows/work-package/techniques/review-existing-feedback.md` → `prior-feedback-triage.md`
3. `workflows/requirements-refinement/techniques/report-failure.md` → `failure-report.md`
4. `workflows/requirements-refinement/techniques/intake-sources.md` → `intake.md`
5. `workflows/requirements-refinement/techniques/validate-specification.md` → `validation-report-{n}.md`
6. `workflows/codebase-wiki/techniques/maintain-index-log.md` → `index.md`, `log.md`
7. `workflows/midnight-system-review/techniques/publish-review/record-publication.md` → `publication-record.md`
8. `workflows/midnight-system-review/techniques/finding-adjudication/register-findings.md` → `findings-register.md`
9. `workflows/work-packages/techniques/prioritize-packages.md` → `priority-ranking.md`
10. `workflows/substrate-node-security-audit/techniques/execute-ensemble-pass.md` → `second-pass-findings.md`
11. `workflows/remediate-vuln/techniques/security-setup/initialize-planning-folder.md` → `README.md` (cites "the standard planning README template" with no link; the workflow has no resources directory beyond its README)
12. `workflows/workflow-design/techniques/context-loading.md` → `format-conventions.md`, `applicable-constructs.md` — the creation guides exist (`resources/format-conventions.md`, `resources/applicable-constructs.md`) but the technique does not cite them: a pure wiring gap

### The 16 technique files with zero `resources/` references

```
midnight-system-review/techniques/evidence-probes/consolidate-evidence.md
midnight-system-review/techniques/publish-review/record-publication.md
midnight-system-review/techniques/scope-intake/resolve-change-surface.md
prism-audit/techniques/audit-finalize/TECHNIQUE.md
prism-audit/techniques/audit-finalize/split-report.md
prism-audit/techniques/audit-finalize/create-detailed-findings.md
prism-audit/techniques/audit-finalize/create-trade-off-analysis.md
prism/techniques/emit-run-manifest.md
codebase-wiki/techniques/maintain-index-log.md
remediate-vuln/techniques/security-setup/initialize-planning-folder.md
requirements-refinement/techniques/report-failure.md
substrate-node-security-audit/techniques/map-codebase.md
substrate-node-security-audit/techniques/build-function-registry.md
work-package/techniques/dco-provenance/append-task-row.md
work-package/techniques/finalize-documentation/render-token-usage.md
work-package/techniques/review-existing-feedback.md
```

## The audience machinery: built, specified, guarded — and unused

- `src/schema/technique.schema.ts:71` and `src/loaders/markdown-technique-loader.ts:392-406` implement `#### audience: human | agent` on artifact declarations.
- `src/tools/workflow-tools.ts:141-146` carries the attribute onto the activity `artifacts[]` contract, so a worker knows the format at write time.
- `docs/technique-protocol-specification.md:115-145` specifies it normatively, including "agent ⇒ JSON on disk".
- `scripts/check-audience.ts` guards that agent-audience artifacts end `.json` — it passes vacuously because **zero of the 139 declarations carry the attribute**.
- Canon already demands it: design principle 12 (Output Economy) names "declared human vs agent audience"; anti-pattern AP-96 (`artifact-audience-declared`) exists at `workflows/workflow-design/resources/anti-patterns.md:1254`, and its Fix text concedes the gap ("Record audience in the output declaration's description *until* the technique protocol carries a first-class audience attribute" — the attribute now exists).

This machinery was delivered by #227 (work item V4 of epic #224); the corpus-side conversion (V5) was deferred pending it and never picked up.

## Agent-consumed artifacts currently written as prose markdown

| Artifact | Producer | Consuming step |
|---|---|---|
| `RUN-MANIFEST.md` | `prism/techniques/emit-run-manifest.md` | `prism-audit/techniques/execute-analysis/read-run-manifest.md`; `prism-audit/workflow.yaml:63` — the contract a triggering workflow reads to locate results |
| `DEFINITIVE-FINDINGS.md` | `prism/techniques/generate-report.md` | `prism-audit/techniques/audit-finalize/create-detailed-findings.md`, `create-trade-off-analysis.md`; prism-evaluate |
| `index.md`, `log.md` | `codebase-wiki/techniques/maintain-index-log.md` | `codebase-wiki/techniques/query.md:42` — hierarchical navigation is the contract |
| `START-HERE.md` status table | `work-packages/techniques/setup-planning-folder.md`, `document-roadmap.md` | `work-packages/techniques/orchestrate-package-execution/execute-package.md:54`; `resources/workflow-triggering-protocol.md:24` reads `current_package` out of the rendered status table |
| `assumptions-log.md` | `work-package/techniques/review-assumptions/record.md` | re-read and updated in place by later `record`/`reconcile` calls; `assess-ticket-completeness.md:18` |
| `follow-ups.md`, `deferred-items.md` | many | `work-package/techniques/finalize-documentation/create-complete-doc.md:53` reads both registers for the Open Work counts |
| planning `README.md` progress table | `meta/techniques/workflow-engine/create-readme.md` | `sync-progress-status.md` selects rows by field per `meta/resources/planning-readme.md#matching` — a machine read of a rendered markdown table |
| `findings-register.md` | `workflow-authoring/techniques/workflow-definition/compile-report.md` | its own guide says it plainly (`workflows/workflow-authoring/resources/findings-register.md:11`): "Read by later steps of the same run as much as by a person" |
| `change-block-index.md`, `provenance-log.md`, `debt-ledger.md`, `evidence-log.md`, `structural-inventory.md`, `drafting-plan.md`, `file-review-note.md`, `prior-feedback-triage.md` | various | ID-bearing row registers re-read by later steps of the same run |

The one place agent-to-agent state is already correctly structured: cicd-pipeline-security-audit and substrate-node-security-audit scanner sub-agents emit `s{n}-{sub}.json` per `resources/sub-agent-output-schema.md`, merged by `cicd-pipeline-security-audit/techniques/merge-scan-findings/TECHNIQUE.md`.

Dual-audience cases needing an explicit call rather than a mechanical conversion: `START-HERE.md` (also the human entry point), planning `README.md` (docs designate it the human operator's entry point — epic #224 kept it), `work-package-plan.md` and `test-plan.md` (hybrid), `format-conventions.md` (its guide says "keep short for human skim at literacy gates").

## Where writing-style guidance lives today

**Tier 1 — cross-workflow rules** (apply where manage-artifacts is bound — work-package, borrowed by codebase-wiki, workflow-design, workflow-authoring):

- `workflows/work-package/techniques/manage-artifacts/TECHNIQUE.md` — 13 named rules: `plain-technical-language` (one sentence: no vague descriptions, no unquantified claims where a number is known), `lean-header`, `exception-only-reporting`, `state-once-per-artifact`, `omit-null-sections`, `no-process-attribution`, `hyperlink-conventions`, `markdown-line-breaks`, `artifact-prefix`, and the canonical-home map.
- `workflows/meta/techniques/agent-conduct.md` — `communication-measured-language`, `communication-no-hyperbole`, `operational-discipline-artifact-location`.

**Tier 2 — the richest prose-register spec, scoped to exactly one artifact:**

- `workflows/work-package/resources/review-mode.md#prose-register` (lines 99–107): plain language ("the word a maintainer would use, not the more formal synonym"), short sentences ("a sentence needing a semicolon is two sentences"), no stacked qualification (one hedge per claim), no dense symbol chains (at most one code symbol and one location per sentence), claim first; plus `#reference-dont-restate` with a per-slot line-budget table and `#caveat-form`. Enforced only by `work-package/techniques/review-summary.md:79,91`. Nothing generalises it.

**Tier 3 — per-guide budget/table rules, two workflows only:**

- 20 resources carry `- **Line budget:** ~N lines`, all in workflow-design/workflow-authoring plus `work-package/resources/wp-plan.md`; the `line-budget` violation class in `verify-artifact-conforms` is inert for the other 14 workflows.
- `workflow-design/resources/format-conventions.md:59` — "Tables over prose. No tutorial narrative."
- `prism-evaluate/techniques/compose-evaluation-report/compose-report.md:19` — "prefer sub-sections, short paragraphs, and bullet lists or compact tables over dense paragraphs" (only prism-evaluate says this).
- `ponytail/techniques/TECHNIQUE.md:44` — "If the explanation runs longer than the code, delete the explanation."

**Notably absent:** no repo-wide writing-style resource; nothing in `meta/resources/` about prose density; nothing in `constraints/` (its README lists a planned `resource.als` for template structure, but the directory holds only `activity.als`); `workflows/prism/resources/writer.md` is a README-rewriting lens prompt, never applied to planning artifacts.

## Enforcement coverage

- `verify-artifact-conforms` exists in three near-identical copies (`work-package/techniques/manage-artifacts/`, `workflow-design/techniques/`, `workflow-authoring/techniques/workflow-definition/`) and is bound in only those 3 of 16 workflows. Thirteen workflows write planning artifacts with no conformance pass at all.
- No guard checks that a persisted artifact filename maps to a creation guide — AP-116 (`no-template-creation-guide`, `anti-patterns.md:1502`) is audit-time prose only. A guard over the 104 unique filenames is mechanically derivable from the same grep used for this survey.
- `scripts/check-audience.ts` is a hard-zero guard passing vacuously (see above).
- Relevant existing guards: `scripts/check-technique-template.ts`, `scripts/check-resource-anchors.ts`, `scripts/check-description-hygiene.ts`, `scripts/check-binding-fidelity.ts`.

## Prior art

- Epic #224 (closed) — work-package planning-artifact verbosity reduction. Delivered the canonical-home restructure, the finalize conformance gate, link-only input slots, review-cluster consolidation, and the anti-pattern codification (AP-85–AP-97 family) via #226, and the server-side audience machinery via #227. Its V5 (convert work-package agent-state artifacts to structured data using the audience attribute) was deferred pending #227 and remains undone — this epic's conversion item picks it up and generalises it corpus-wide.
- Design principles 12 (Output Economy) and 28 (Creation Guide for Generated Documents) in `workflows/workflow-design/resources/design-principles.md`; anti-patterns AP-96, AP-116, MR-2 (`no-dense-prose-after-config-examples`) in `workflows/workflow-design/resources/anti-patterns.md`.
