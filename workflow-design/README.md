# Workflow Design Workflow

> v1.27.1 — Guides agents through creating, updating, or reviewing workflow definitions. In create/update modes, accepts a free-form user description, derives intent first, reconciles assumptions in a while-loop, and batches stakeholder decisions into Gate 1 (gap-only) and Gate 2 (approve-to-commit); `{headless_mode}` defaults to true so soft mid-flow gates auto-resolve (opt out with “interactive”, “not headless”, or “with checkpoints”). Create/update edits run in a dedicated `{target_path}` worktree. In review mode, audits one or more existing workflows against the design principles and produces a compliance report.

---

## Overview

This workflow manages the complete lifecycle of workflow definition authoring through nine activities, with three modes (create, update, review) that control which activities execute. All modes enforce schema expressiveness, convention conformance, and structural enforcement of critical constraints. Activity `#` columns below match on-disk `NN-` file prefixes (gaps at 02/07 are intentional).

| # | Activity | Mode | Purpose |
|---|----------|------|---------|
| 01 | [**Intake and Context**](./activities/README.md#01-intake-and-context) | All | Derive create/update/review + gap flags + `{headless_mode}` (default true), Gate 1 when needed, internalize schemas and YAML format |
| 03 | [**Requirements Refinement**](./activities/README.md#03-requirements-refinement) | Create, Update | Elicit or synthesize the spec, soft-confirm, then surface and while-loop reconcile design assumptions (open judgements → Gate 2) |
| 04 | [**Pattern Analysis**](./activities/README.md#04-pattern-analysis) | Create only | Audit 2+ reference workflows for reusable patterns |
| 05 | [**Impact Analysis**](./activities/README.md#05-impact-analysis) | Update only | Enumerate affected files, check integrity, flag removals |
| 06 | [**Scope and Draft**](./activities/README.md#06-scope-and-draft) | Create, Update | Ensure dedicated `{target_path}` worktree, define file manifest, draft and validate each file, then verify planning artifacts against the design canonical-home map |
| 08 | [**Quality Review**](./activities/README.md#08-quality-review) | All | Expressiveness, conformance, rule-hygiene, and rule-enforcement audits, then a bounded fix-revalidate loop (max 3) with a critical-blocker gate (full compliance audit in review mode; forEach over `target_workflow_ids`) |
| 09 | [**Validate and Commit**](./activities/README.md#09-validate-and-commit) | All | Schema validation, Gate 2 `approve-to-commit`, then commit from `{target_path}` on `{workflow_branch}` + open a PR against `workflows` (create/update) or save the compliance report (review) |
| 10 | [**Post-Update Review**](./activities/README.md#10-post-update-review) | Update only | Automatic post-commit compliance audit of the updated workflow |
| 11 | [**Retrospective**](./activities/README.md#11-retrospective) | All | Record a completion summary (create/update) and conduct a session retrospective |

**Detailed documentation:**

- **Activities:** See [activities/README.md](./activities/README.md) for the per-activity orientation map (purpose, value, and how each activity connects in the flow), with links to the authoritative activity YAML files. The full step/checkpoint/transition definitions are served by `get_activity`.
- **Techniques:** See [techniques/](techniques/) for the full technique library (workflow-local standalone techniques plus the shared `TECHNIQUE.md` base contract) with protocol flows and rules.
- **Resources:** See [resources/README.md](./resources/README.md) for the resource index (11 resources) with usage context and cross-workflow access.

---

## Modes

| Mode | Activation | Description |
|------|------------|-------------|
| **Create** (default) | "create a workflow", "new workflow" | Build a new workflow from a free-form description |
| **Update** | "update workflow", "modify workflow" | Modify an existing workflow with content preservation checks; automatic post-commit compliance review |
| **Review** | "review workflow", "audit workflow" | Audit an existing workflow against design principles; produce compliance report |

---

## Workflow Flow

```mermaid
graph TD
    startNode(["Start"]) --> INT["01 intake-and-context"]

    INT --> MODE{"mode?"}
    MODE -->|"create"| REQ["03 requirements-refinement"]
    MODE -->|"update"| REQ
    MODE -->|"review"| QR

    REQ --> CREATE{"create?"}
    CREATE -->|"yes"| PAT["04 pattern-analysis"]
    CREATE -->|"no (update)"| IMP["05 impact-analysis"]

    PAT --> SCD["06 scope-and-draft"]
    IMP --> SCD

    SCD --> QR["08 quality-review"]

    QR -->|"critical blocker"| SCD
    QR -.->|"review: fix issues"| INT
    QR --> VAL["09 validate-and-commit"]
    VAL -.->|"return to drafting"| SCD

    VAL -->|"create / review"| RETRO["11 retrospective"]
    VAL -->|"update"| PUR["10 post-update-review"]
    PUR -->|"accept"| RETRO
    PUR -.->|"fix / revert"| INT
    RETRO --> doneNode(["End"])
```

---

## Orchestration Model

Like the other workflows in this library, workflow-design runs under the **orchestrator/worker two-agent pattern** defined in the `meta` layer. An orchestrator loads the definition, initializes state, and dispatches one activity at a time to a worker, which executes the activity's steps, handles its checkpoints, and reports variable changes back; the orchestrator then evaluates transitions and dispatches the next activity. The worker persists across activities, carrying the accumulated design context (schemas internalized, patterns adopted, scope manifest, drafted files) rather than re-deriving it each step.

The roles, the dispatch protocol, and the checkpoint protocol are defined once in the `meta` layer — the [workflow-orchestrator-prompt](../meta/resources/workflow-orchestrator-prompt.md) and [activity-worker-prompt](../meta/resources/activity-worker-prompt.md) resources and the [workflow-engine](../meta/techniques/workflow-engine/TECHNIQUE.md) technique — and workflow-design inherits them unchanged.

---

## Review Mode

Review mode audits one or more existing workflows (`target_workflow_ids`, with each iteration binding `target_workflow_id`) against the design principles, anti-pattern catalog, and schema validation. Pass inventory, severity disposition, and fix transitions live in [`08-quality-review.yaml`](./activities/08-quality-review.yaml) — do not restate that inventory here. The output is a severity-rated compliance report in the session planning folder.

---

## Design Principles

Positive design-time framing principles — see [design-principles](./resources/design-principles.md). Stance only; Detect stays in the anti-pattern catalog. Structural gates live in activity YAML.

| # | Principle |
|---|-----------|
| 1 | Internalize before producing |
| 2 | Define complete scope before execution |
| 3 | Clarify before assuming |
| 4 | Maximize schema expressiveness |
| 5 | One authoritative home |
| 6 | Convention over invention |
| 7 | Confirm before irreversible changes |
| 8 | Encode constraints as structure |
| 9 | Non-destructive updates |
| 10 | Complete documentation structure |
| 11 | Output economy |
| 12 | Separate contract from procedure |
| 13 | Single source of truth |
| 14 | Phase by sequenced outcome |
| 15 | Distinguish designators from parameters |
| 16 | Document in positive present |
| 17 | Prefer shared capability |
| 18 | Name symbols affirmatively |
| 19 | Keep orchestration in structure |
| 20 | Match the harness surface |
| 21 | Modular over inline |
| 22 | Close the loop |
| 23 | Keep session interaction in activities |
| 24 | Bind sibling operations as steps |
| 25 | State contract contribution |

---

## Techniques

The `techniques/` directory is a flat library of workflow-local standalone techniques (no group folders), plus a [`TECHNIQUE.md`](./techniques/TECHNIQUE.md) holding shared Inputs, Outputs, and Rules for every technique here. Each activity step binds exactly one operation via `step.technique`. The cross-cutting meta [`variable-binding`](../meta/techniques/variable-binding.md) strategy technique is declared once at `workflow.techniques.activity` and inherited by every activity (injected into every `get_activity`), and commits go through meta [`version-control::commit-regular-files`](../meta/techniques/version-control/commit-regular-files.md). Planning-folder artifacts are managed cross-workflow through [`work-package::manage-artifacts`](../work-package/techniques/manage-artifacts/TECHNIQUE.md) — `create-readme` (seed the planning README at intake), `write-artifact` (numbered report artifacts), and `verify-readme-conforms` (drift check before commit). The design-assumption lifecycle reuses [`work-package::review-assumptions`](../work-package/techniques/review-assumptions/TECHNIQUE.md) cross-workflow (`collect`, `record`), with a workflow-local `reconcile-design-assumptions` (audit-backed while-loop via `has_resolvable_assumptions`) in place of work-package's code-analysis reconcile; open judgements batch into Gate 2 rather than a mid-flow interview parade. A workflow-local `conduct-retrospective` covers the session retrospective.

| Technique | Capability | Bound by |
|-----------|------------|----------|
| [`intake-classification`](./techniques/intake-classification.md) | Classify create/update/review, land gap flags + `{headless_mode}`, set mode + target | Intake and Context |
| [`context-loading`](./techniques/context-loading.md) | Load schemas, survey references; persist format-conventions + applicable-constructs in create mode | Intake and Context |
| [`derive-design-dimensions`](./techniques/derive-design-dimensions.md) | Derive the ordered design dimensions to elicit, per mode | Requirements Refinement |
| [`prepare-dimension`](./techniques/prepare-dimension.md) | Assemble elicitation questions for one design dimension | Requirements Refinement |
| [`capture-dimension`](./techniques/capture-dimension.md) | Record answers for one design dimension and fold into accumulated design | Requirements Refinement |
| [`synthesize-update-specification`](./techniques/synthesize-update-specification.md) | Assemble the update-mode specification from changed dimensions only (no per-dimension elicitation) | Requirements Refinement |
| [`persist-design-specification`](./techniques/persist-design-specification.md) | Persist the elicited design specification for linked review | Requirements Refinement |
| [`reconcile-design-assumptions`](./techniques/reconcile-design-assumptions.md) | Resolve audit-resolvable assumptions and emit `has_resolvable_assumptions` for while-loop convergence | Requirements Refinement |
| [`pattern-analysis`](./techniques/pattern-analysis.md) | Extract patterns from reference workflows and persist the comparison | Pattern Analysis |
| [`impact-analysis`](./techniques/impact-analysis.md) | Assess change impact on files, transitions, and references | Impact Analysis |
| [`scope-definition`](./techniques/scope-definition.md) | Enumerate the file manifest with lean structural design and drafting order | Scope and Draft |
| [`derive-workflows-target-path`](./techniques/derive-workflows-target-path.md) | Derive `{target_path}` from the planning-folder basename | Scope and Draft |
| [`prepare-workflow-branch`](./techniques/prepare-workflow-branch.md) | Ensure dedicated `{target_path}` worktree on `{workflow_branch}` (compose WP create-worktree) | Scope and Draft |
| [`assemble-file-approach`](./techniques/assemble-file-approach.md) | Assemble and persist the per-file drafting plan | Scope and Draft |
| [`review-drafted-file`](./techniques/review-drafted-file.md) | Assemble and persist a per-file review note (including update-mode removals) | Scope and Draft |
| [`yaml-authoring`](./techniques/yaml-authoring.md) | Author syntactically valid YAML files that pass schema validation | Scope and Draft |
| [`verify-artifact-conforms`](./techniques/verify-artifact-conforms.md) | Verify planning artifacts against the design canonical-home map and fix drift in place | Scope and Draft |
| [`audit-expressiveness`](./techniques/audit-expressiveness.md) | Walk prose against the schema construct inventory | Quality Review (create/update), Post-Update |
| [`audit-conformance`](./techniques/audit-conformance.md) | Apply convention-conformance against reference workflows | Quality Review (create/update), Post-Update |
| [`audit-rule-hygiene`](./techniques/audit-rule-hygiene.md) | Apply Rule Hygiene anti-patterns to `rules[]` | Quality Review (create/update) |
| [`audit-rule-enforcement`](./techniques/audit-rule-enforcement.md) | Apply `structure-backed-constraints` to `rules[]` | Quality Review (create/update) |
| [`verify-high-findings`](./techniques/verify-high-findings.md) | Adversarially verify High findings and recalibrate severity before remediation | Quality Review |
| [`audit-principles`](./techniques/audit-principles.md) | Audit against the design principles (review mode) | Quality Review |
| [`audit-anti-patterns`](./techniques/audit-anti-patterns.md) | Apply the anti-patterns catalog (including tool/technique/doc consistency vs harness surface) | Quality Review |
| [`audit-schema-validation`](./techniques/audit-schema-validation.md) | Validate every YAML file against its schema | Quality Review, Validate and Commit |
| [`compile-report`](./techniques/compile-report.md) | Compile the severity-rated compliance report (review mode) | Quality Review |
| [`reload-workflow`](./techniques/reload-workflow.md) | Reload the committed workflow from the server | Quality Review, Post-Update Review |
| [`scope-verification`](./techniques/scope-verification.md) | Verify every scope-manifest item is addressed | Validate and Commit |
| [`readme-authoring`](./techniques/readme-authoring.md) | Generate or update the workflow README set | Validate and Commit |
| [`commit-verification`](./techniques/commit-verification.md) | Verify the commit landed on `{target_path}` | Validate and Commit |
| [`publish-workflow-pr`](./techniques/publish-workflow-pr.md) | Compose PR title/body; activity binds meta push / create-pr / mark-ready | Validate and Commit |
| [`persist-report`](./techniques/persist-report.md) | Persist the compliance/review report as an artifact | Quality Review (review mode), Validate and Commit, Post-Update Review |
| [`summarize-findings`](./techniques/summarize-findings.md) | Produce a severity-rated findings summary | Post-Update Review |
| [`review-draft-yaml`](./techniques/review-draft-yaml.md) | Block-indexed review of the drafted YAML, capturing a draft attestation before the audit passes | Scope and Draft |
| [`apply-audit-fixes`](./techniques/apply-audit-fixes.md) | Apply selected audit findings via `yaml-authoring`, re-validating each changed file | Quality Review |
| [`scope-audit`](./techniques/scope-audit.md) | Audit the committed change set against the scope manifest for drift | Post-Update Review |
| [`create-completion-doc`](./techniques/create-completion-doc.md) | Record the `COMPLETE.md` completion summary in the planning folder | Retrospective |
| [`conduct-retrospective`](./techniques/conduct-retrospective.md) | Analyse non-checkpoint interactions and record a prioritized session retrospective | Retrospective |

---

## Resources

| Order | Resource | Purpose |
|---|----------|---------|
| 00 | [Design Principles](./resources/design-principles.md) | Positive framing principles (stance only) |
| 01 | [Schema Construct Inventory](./resources/schema-construct-inventory.md) | Prose-to-formal construct mapping tables |
| 02 | [Anti-Patterns](./resources/anti-patterns.md) | Prohibited-pattern catalog (AP-XX + name) by category |
| 03 | [Update Mode Guide](./resources/update-mode-guide.md) | Update change-request category vocabulary |
| 04 | [Compliance Report](./resources/compliance-report.md) | Creation guide: compliance / post-update review |
| 05 | [Design Context README](./resources/design-context-readme.md) | Creation guide: planning-folder README |
| 06 | [Completion Artifact](./resources/completion-artifact.md) | Creation guide: `COMPLETE.md` |
| 07 | [Design Assumptions](./resources/design-assumptions.md) | Creation guide: `assumptions-log.md` |
| 08 | [Design Assumption Reconciliation](./resources/design-assumption-reconciliation.md) | Audit vs open resolvability + while-loop / Gate 2 handoff |
| 09 | [Elicitation Guide](./resources/elicitation-guide.md) | Mode dimension sets + per-dimension question bank |
| 10 | [Convention Conformance](./resources/convention-conformance.md) | Reference conventions vs sibling workflows |
| 11–21 | [Artifact creation guides](./resources/README.md#planning-artifact--guide-map) | Template + Rules for every planning artifact |

---

## Outputs

In create and update modes the workflow seeds and maintains a **planning folder** under `.engineering/artifacts/planning/`: a `README.md` (from the [design-context-readme](./resources/design-context-readme.md) template) whose progress tracker is updated on completing each activity. In all modes, report artifacts are written into the planning folder as numbered files via [`work-package::manage-artifacts::write-artifact`](../work-package/techniques/manage-artifacts/write-artifact.md).

**Create mode:** A complete workflow file set committed on a feature branch in the workflows repo, with a pull request opened against the `workflows` branch, plus a planning folder.

**Update mode:** Modified workflow files committed on a feature branch with a pull request against the `workflows` branch, plus a post-update compliance snapshot in the planning folder.

**Review mode:** A compliance report committed in the planning folder.

Every mode ends with the [Retrospective](./activities/README.md#11-retrospective) activity, which records a session retrospective in the planning folder; create and update modes also produce a `COMPLETE.md` completion summary there.

---

## File Structure

```
workflows/workflow-design/
├── workflow.yaml                          # Workflow definition (variables, rules, inherited techniques)
├── README.md                             # This file
├── activities/
│   ├── README.md                         # Per-activity documentation
│   ├── 01-intake-and-context.yaml        # Classify mode + target, internalize schemas/format
│   ├── 03-requirements-refinement.yaml   # Elicit design details one question at a time
│   ├── 04-pattern-analysis.yaml          # Audit reference workflows (create only)
│   ├── 05-impact-analysis.yaml           # Impact analysis (update mode)
│   ├── 06-scope-and-draft.yaml           # Manifest, draft/validate per file, verify artifact homes
│   ├── 08-quality-review.yaml            # Audit passes (full compliance audit in review mode)
│   ├── 09-validate-and-commit.yaml       # Validate and commit
│   ├── 10-post-update-review.yaml        # Post-commit compliance audit (update mode)
│   └── 11-retrospective.yaml             # Completion summary + session retrospective (terminal)
├── techniques/                           # Flat library of workflow-local standalone techniques
│   ├── TECHNIQUE.md                      # Shared Inputs/Outputs/Rules for every technique
│   ├── intake-classification.md
│   ├── context-loading.md
│   ├── derive-design-dimensions.md
│   ├── prepare-dimension.md
│   ├── capture-dimension.md
│   ├── synthesize-update-specification.md
│   ├── pattern-analysis.md
│   ├── impact-analysis.md
│   ├── scope-definition.md
│   ├── assemble-file-approach.md
│   ├── review-drafted-file.md
│   ├── yaml-authoring.md
│   ├── scope-verification.md
│   ├── readme-authoring.md
│   ├── commit-verification.md
│   ├── reload-workflow.md
│   ├── persist-report.md
│   ├── compile-report.md
│   ├── summarize-findings.md
│   ├── audit-principles.md
│   ├── audit-anti-patterns.md
│   ├── audit-schema-validation.md
│   ├── audit-expressiveness.md
│   ├── audit-conformance.md
│   ├── audit-rule-hygiene.md
│   ├── audit-rule-enforcement.md
│   ├── verify-high-findings.md
│   ├── review-draft-yaml.md
│   ├── verify-artifact-conforms.md
│   ├── apply-audit-fixes.md
│   ├── scope-audit.md
│   ├── create-completion-doc.md
│   ├── conduct-retrospective.md
│   ├── reconcile-design-assumptions.md
│   ├── derive-workflows-target-path.md
│   ├── prepare-workflow-branch.md
│   └── publish-workflow-pr.md
└── resources/
    ├── README.md                         # Resource index + artifact→guide map
    ├── design-principles.md              # Positive framing principles
    ├── schema-construct-inventory.md     # Construct mapping tables
    ├── anti-patterns.md                  # anti-pattern catalog (AP-XX + names)
    ├── update-mode-guide.md              # Update mode guide
    ├── compliance-report.md              # Creation guide: compliance / post-update
    ├── design-context-readme.md          # Creation guide: planning README
    ├── completion-artifact.md            # Creation guide: COMPLETE.md
    ├── design-assumptions.md             # Creation guide: assumptions-log.md
    ├── design-assumption-reconciliation.md  # Audit-based reconciliation guide
    ├── elicitation-guide.md              # Mode sets + per-dimension question bank
    ├── convention-conformance.md         # Reference conventions vs siblings
    ├── structural-inventory.md           # Creation guide
    ├── format-conventions.md             # Creation guide
    ├── applicable-constructs.md          # Creation guide
    ├── design-specification.md           # Creation guide
    ├── impact-analysis.md                # Creation guide
    ├── pattern-analysis.md               # Creation guide
    ├── scope-manifest.md                 # Creation guide
    ├── drafting-plan.md                  # Creation guide
    ├── file-review-note.md               # Creation guide
    ├── draft-attestation.md              # Creation guide
    └── findings-satellite.md             # Shared audit-satellite creation guide
```
