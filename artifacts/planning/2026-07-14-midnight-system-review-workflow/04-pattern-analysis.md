# Pattern Analysis

> midnight-system-review · workflow-design (create) · 2026-07-14
> Structural and content patterns extracted from comparable existing workflows, compared against the confirmed spec (README.md § Design Decisions, 03-assumptions-log.md).

## 1. Reference Selection

| Reference | Version | Why selected |
|-----------|---------|--------------|
| `substrate-node-security-audit` | 4.19.0 | Primary same-type, same-domain prior art: evidence-driven audit of a midnight-node target with toolchain-availability gates, rubric resources, structural report gates. |
| `cicd-pipeline-security-audit` | 1.1.0 | Second same-type audit; the existing consumer of the qualified cross-workflow fragment ref (RR-15); transition-condition phase gating. |
| `work-package` | — | Checkpoint-rich content conventions (non-blocking auto-advance, doWhile amendment loop, forEach); owner of the `update-pr::post-review-comment` reuse target (RR-7). |
| `prism-audit`, `workflow-design` (supporting) | — | Activity-level `scatter-gather` declaration, activity-named group with bare-op shorthand, condition-gated checkpoints, rework `transitionTo`. |

## 2. Structural Conventions Extracted

| # | Convention | Evidence | Proposed structure | Disposition |
|---|-----------|----------|-------------------|-------------|
| S1 | Activity files `NN-name.yaml`, two-digit prefix orders the spine; activity `id` is the bare kebab name (no prefix) | `substrate .../activities/01-scope-setup.yaml` (`id: scope-setup`); same in cicd, prism-audit | `01-scope-intake` … `05-verdict-and-report`, `06-publish-review` | Adopt |
| S2 | Sub-agent flows get a separate `10+` activity-number range | substrate `10-…16-sub-*.yaml`; cicd `05-07-sub-*` | Not needed — no dispatched sub-activities (see D2) | Diverge (justified) |
| S3 | `workflow.yaml` anatomy: `$schema`, id, semver, title, description, `author: m2ux`, kebab tags, `rules:` sectioned `workflow:`/`activity:`/`universal:`, `fragments:`, `techniques.activity:`, `variables[]`, `initialActivity` | `substrate workflow.yaml:1-110`; `cicd workflow.yaml:1-89` | Same anatomy; 9 rules split workflow vs activity; `initialActivity: scope-intake` | Adopt |
| S4 | Declared variables are run config (string/number) + boolean gates only; rich data flows via artifacts and step outputs | `substrate workflow.yaml:43-109`; `cicd workflow.yaml:34-88`; RR-11 | 12 variables: config (`review_target`, `target_repo_path`, `base_ref`, `planning_folder_path`, `insight_repo_path`, `probe_budget_per_area=4`) + gates (`has_pr_surface`, `gitnexus_available`, `cargo_available`, `node_binary_available`, `plan_approved`, `publish_requested`) | Adopt |
| S5 | Toolchain gate idiom: probe step runs the tool; a `set` action after it flips the gate true (reaching the action implies success; `defaultValue: false` covers failure); rules route capability vs fallback on the gate | `substrate 01-scope-setup.yaml:16-25` (`gitnexus-operations::analyze` → `set gitnexus_available`); `substrate workflow.yaml:19` (graph-vs-grep routing rule) | `detect-toolchain` op sets `gitnexus_available` / `cargo_available` / `node_binary_available` the same way; graceful-degradation rule routes probes | Adopt |
| S6 | Activity step framing: `announce-start` log action first; `finalize-activity` last (log + `set` gate flips) | `substrate 03-primary-audit.yaml:7-11,42-58`; `cicd 03-primary-scan.yaml:9-13,38-44` | Adopt for all six activities; e.g. probes finalize sets nothing user-facing but logs per-area accounting | Adopt |
| S7 | `techniques[]` (workflow/activity level) carries only strategy techniques; every op binds at its step | `substrate workflow.yaml:40-42` (`variable-binding`); `prism-audit 02-execute-analysis.yaml:5-6` (`scatter-gather` at activity level) | `variable-binding` workflow-level; `scatter-gather` on `evidence-probes` only | Adopt |
| S8 | Ops grouped in an activity-named folder with a minimal `TECHNIQUE.md` base contract (shared inputs, e.g. `planning_folder_path`); bare-op shorthand inside the owning activity; ALL foreign refs qualified | `substrate techniques/TECHNIQUE.md` (base contract = `planning_folder_path`); `prism-audit techniques/scope-definition/`; activity-group-shorthand rule | Six activity-named groups (`scope-intake/`, `area-derivation/`, `evidence-probes/`, `finding-adjudication/`, `verdict-and-report/`, `publish-review/`) holding the spec's 11 ops; root `TECHNIQUE.md` declares shared `planning_folder_path` + `target_repo_path` | Adopt |
| S9 | Resources: flat `resources/` folder, kebab-case topical files in recurring classes — rubric, catalog, template/format, target profile | substrate `severity-rubric.md`, `target-profile.md`, `audit-prompt-template.md`; cicd `injection-pattern-catalog.md`, `cicd-severity-rubric.md`, `cicd-audit-report-template.md` | 1:1 class mapping: `grading-rubric` (≈severity-rubric), `verdict-rubric` (new instance, same rubric class), `probe-catalog` (≈injection-pattern-catalog), `review-format` (≈report-template), `subsystem-map` (≈target-profile) | Adopt |
| S10 | Audit-family ships a `start-here.md` orientation resource | substrate + cicd `resources/start-here.md` | Omit — compensates for zero-checkpoint unattended autonomy; midnight's interactive checkpoints + README cover orientation | Diverge (justified) |
| S11 | README.md at workflow root and in `activities/`, `techniques/`, `resources/`, prism style (Overview, Workflow Flow, Activities, Techniques, Resources, File Structure) | `prism/README.md` headings; `substrate` has all four; cicd lacks subfolder READMEs (predates the rule) | All four READMEs, prism style | Adopt |
| S12 | Every activity declares an `outcome:` block of value statements | All audit + prism-audit activities | Adopt for all six activities | Adopt |
| S13 | Checkpoint density: audit family is zero-checkpoint (fully automated, structural gates only); interactive workflows put checkpoints at phase boundaries, never mid-probe | substrate `workflow.yaml:17`; work-package/workflow-design boundary checkpoints | 4 checkpoints at boundaries (scope, plan, verdict, publish); probing + adjudication checkpoint-free (RR-3/RR-4) | Hybrid — Diverge from audit family (justified), aligned to interactive-family convention |

## 3. Content Conventions Extracted

| # | Convention | Evidence | Proposed structure | Disposition |
|---|-----------|----------|-------------------|-------------|
| C1 | Cross-activity invariants live in `rules.workflow`; domain/rubric rules in `rules.activity`; fragment refs in `rules.universal` via `ref:` | `substrate workflow.yaml:14-36`; `cicd workflow.yaml:15-30` | 9 rules: blocking/bounded-probes/degradation/three-dot-surface/rubric-not-intuition → workflow; grade-tuple/accounting/gate rules → activity; planning-artifacts fragment → universal | Adopt |
| C2 | Hard gates are `validate` actions with structured `condition` + blocking `message`, colocated in a dedicated gate step | `substrate 05-report-generation.yaml:12-42` (`enforce-report-gates`) | `validate` gates for grade-tuple completeness (adjudication) and accounting reconciliation (verdict-and-report) | Adopt |
| C3 | Phase-gate routing via transition `condition` (AND of booleans) | `cicd 03-primary-scan.yaml:45-58` | `verdict-and-report → publish-review` transition conditioned on `has_pr_surface == true AND publish_requested == true`; default transition to terminal | Adopt |
| C4 | Multi-way conditional tails via `decisions.branches[].transitionTo` with boolean conditions + default | `substrate 05-report-generation.yaml:81-104` (`ensemble-pass`/`gap-analysis`/complete) | Not needed — single conditional tail; transition condition (C3) is the simpler precedented form | Adopt (C3 variant) |
| C5 | Non-blocking checkpoint idiom: `blocking: false` + `defaultOption` + `autoAdvanceMs: 30000` (30s standard; 10-15s only for low-stakes prompts) | `work-package 04-research.yaml:38-41`; corpus survey: 30000 dominant across workflow-design/work-package | `scope-confirmed`: `blocking: false`, `defaultOption: proceed`, `autoAdvanceMs: 30000` | Adopt |
| C6 | Amendment loop idiom: `kind: loop` `loopType: doWhile` on a boolean, `maxIterations`, containing a `when`-gated rework op + checkpoint whose reopen option sets the loop variable via `effect.setVariable` | `work-package 04-research.yaml:16-51` (research-reconciliation) | `investigation-plan-approved` (blocking): doWhile on `plan_approved == false`, amend-plan op gated `when`, approve option sets `plan_approved: true`, amend option keeps looping | Adopt |
| C7 | Rework routing via checkpoint option `effect.transitionTo` (+ `setVariable`) to an earlier activity | `workflow-design 08-quality-review.yaml:72-90` (review-disposition → intake-and-context); prism-audit `00-scope-definition.yaml:39` | `verdict-review` option `revise-investigation`: `effect.transitionTo: area-derivation` | Adopt |
| C8 | Condition-gated checkpoint: checkpoint carries a structured `condition` so it only fires in the applicable mode | `workflow-design 08-quality-review.yaml:63-69` (`review-disposition` gated on `is_review_mode`) | `publish-decision` gated `condition: has_pr_surface == true`; approve option sets `publish_requested: true` | Adopt |
| C9 | Per-unit fan-out: `loopType: forEach` with `variable:` + `over:` (collection or dotted path) + `maxIterations`; sequential scatter-gather = forEach accumulation + delegated combine (`accumulate-never-overwrite`, `parallelism-is-optimisation`) | `work-package 08-implement.yaml:15-21` (`over: implementation_plan.tasks`); `prism-audit 02-execute-analysis.yaml:35-41`; `meta/techniques/scatter-gather.md` rules | `evidence-probes`: forEach `variable: current_area` `over: investigation_areas` (a `derive-areas` step output landing whole in the bag — not a declared variable, consistent with S4/RR-11); combine = `consolidate-evidence`; `probe_budget_per_area` bounds probes inside the per-area op + a validate | Adopt |
| C10 | Artifact references: techniques reference `{planning_folder_path}` (inherited via base contract); logical artifact names are bare kebab-case; the server's `artifactPrefix` numbers them at write time, one instance per logical artifact | Engine artifact-location rule; substrate `write-report.md:24` hardcodes `01-audit-report.md` (legacy pre-prefix style) | Bare names `change-surface.md`, `investigation-plan.md`, `evidence-log.md`, `findings-register.md`, `review-report.md`, `publication-record.md` under `{planning_folder_path}` | Adopt engine rule (diverge from substrate's hardcoded prefixes) |
| C11 | Cross-workflow op reuse via fully qualified `<wf>::<group>::<op>` refs at the step binding | `codebase-wiki 04-publish.yaml:27` (`work-package::manage-artifacts::write-artifact`); `remediate-vuln 01-start.yaml:42,47`; `workflow-design 03-requirements-refinement.yaml:50-92` | `work-package::update-pr::post-review-comment` in `publish-review`; `gitnexus-operations::*` (meta) for graph probes | Adopt |
| C12 | Rubric-not-intuition scoring is a `rules.activity` entry naming the rubric resource | `substrate workflow.yaml:29` (Impact × Feasibility + calibration anchors) | Grading rule names `grading-rubric`; verdict rule names `verdict-rubric` (verdict computed from accepted findings only) | Adopt |
| C13 | Cross-workflow rule fragments consumed as qualified `ref:` under `rules.universal` | `cicd workflow.yaml:29-30` (`ref: substrate-node-security-audit::planning-artifacts-gitignored`) | Same ref, verbatim | Adopt (see RR-15) |

## 4. Carry-Through Verifications

### RR-7 — `work-package::update-pr::post-review-comment` signature fit

Signature (from `work-package/techniques/update-pr/post-review-comment.md`):

| Direction | Id | Notes for midnight binding |
|-----------|----|---------------------------|
| input | `review_summary` | Text posted **verbatim** via `gh pr review --body-file`. Bind by aligning `render-review`'s output to the canonical id `review_summary` (canonical rename at the producer, not a per-call bridge). Description prose references work-package's Consolidated Review Format / `review-summary-approval` checkpoint — provenance prose only; the protocol is generic (write file → `gh pr review`). Midnight's equivalent confirmation is the `verdict-review` + `publish-decision` checkpoints. |
| input | `pr_number` | Must be in the bag: `scope-intake` emits `pr_number` as a step output when the target is a PR ref (`has_pr_surface` true). Implicit same-name bind. |
| input | `review_type` (optional) | Its **default derivation reads work-package's Overall Rating vocabulary, which midnight does not produce — never rely on the default.** Supply explicitly at the call-site from the verdict: the `verdict-rubric` resource defines the verdict→`approve`/`request-changes`/`comment` mapping and `compute-verdict` emits `review_type`; implicit same-name bind (or a single input deviation). |
| output | `review_posted` | Lands under its own id; `publication-record.md` cites it. |

**Verdict: fits — reuse confirmed; no workflow-local posting op needed.** RR-7 moves Partially Validated → Validated. Conditions for drafting: (1) `render-review` outputs `review_summary` canonically; (2) `scope-intake` outputs `pr_number`; (3) `review_type` is always explicitly bound, never defaulted.

### RR-15 — qualified fragment ref

`cicd-pipeline-security-audit/workflow.yaml:29-30` consumes exactly `universal: [ref: substrate-node-security-audit::planning-artifacts-gitignored]` against the fragment defined at `substrate-node-security-audit/workflow.yaml:37-39`. midnight-system-review uses the identical qualified form. **Verdict: validated.** RR-15 moves Partially Validated → Validated.

## 5. Divergences and Justifications

| # | Divergence from prior art | Justification |
|---|--------------------------|---------------|
| D1 | 4 checkpoints vs the audit family's zero-checkpoint full automation | The review is decision-bearing (plan approval, verdict sign-off, publish authority) — the Jina methodology has human plan/verdict touchpoints. Checkpoint *shape* follows the interactive-family conventions (C5-C8), so no convention is invented. |
| D2 | Sequential `scatter-gather` forEach instead of concurrent sub-agent dispatch + `10+` sub-activity range + output-file verification op family + sub-agent-output-schema resource | RR-6, sanctioned by meta `scatter-gather` rules `parallelism-is-optimisation` / `one-gather-contract-two-scatter-modes`: sequential is the correctness default; parallel dispatch is a later optimisation, not a redesign. Removes an entire structural stratum the audits need only because they parallelise. |
| D3 | Backward rework transition (`verdict-review` → `area-derivation`) — audit family is forward-only | RR-5; precedented outside the audit family (`workflow-design` review-disposition, prism family self-loops), so the construct is conventional even though the audits do not use it. |
| D4 | Bare logical artifact names (engine `artifactPrefix` numbering) vs substrate's hardcoded `01-audit-report.md` | Substrate predates the artifact-location rule; the engine rule is authoritative. This diverges from substrate toward the current corpus convention. |
| D5 | No `start-here.md` resource | Audit-family orientation resource compensates for unattended zero-checkpoint runs; midnight is interactive at every phase boundary and the README + `scope-intake` carry orientation. |

## 6. Recommendation

Adopt all extracted conventions (S1, S3-S9, S11-S13, C1-C13) wholesale; carry the five justified divergences D1-D5, of which D1-D3 are spec-confirmed decisions (RR-3/4/5/6) and D4-D5 are corpus-hygiene calls. Both carry-through verifications pass: RR-7 and RR-15 resolve to Validated with the three drafting conditions recorded under § 4.
