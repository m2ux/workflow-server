# Design decisions

Settled choices from the clarifying interview that shaped the `plain-language` capability, and the alternatives weighed against each.

## Packaging

| Decision | Choice | Why |
|----------|--------|-----|
| Deliverable shape | Full workflow family (`workflow.yaml` + activities + techniques + resources + READMEs) | A capability that authors, rewrites, and audits needs staged outcomes, mode gates, and checkpoints — activities own that; techniques stay atomic |
| Workflow id | `plain-language` | Matches sibling naming (`work-package`, `prism`, `meta`); short enough for `plain-language::<op>` binds |
| Technique packaging | Own group under the workflow (`techniques/plain-language/`) | Cross-workflow bindable without copying; keeps the criteria and ops co-located |
| Main-repo gitlink bump | Out of scope for this PR | Explicit request: definitions land on the `workflows` branch only |

## Modes and flow

| Decision | Choice | Why |
|----------|--------|-----|
| Mode model | One workflow, `{operation_type}` ∈ {`author`, `rewrite`, `audit`} | Same idiom as workflow-authoring's create/update/review; one mode state, no parallel shadow flags |
| Activity topology | 01 intake-and-profile → 02 source-analysis → 03 draft → 04 evaluate → 05 deliver | Maps ISO 5.1 (profile) → 5.2/5.3 (draft) → 5.4 (evaluate); source analysis only for rewrite/audit |
| Audit terminal | Audit closes after source analysis | Audit's product is the findings record; it authors no document |
| Interaction | Headless soft-gates by default (`headless_mode: true`) | Soft mid-flow checkpoints carry `defaultOption` + `autoAdvanceMs`; blocking gates stay interactive (intent confirmation, open-issue delivery gate) |

## Criteria encoding

| Decision | Choice | Why |
|----------|--------|-----|
| ISO treatment | Distill into a shared resource; techniques cite by section | Canon: one authoritative home; cite-don't-restate; section grain for delivery |
| Resource grain | One `plain-language-standard.md`, section-per-principle | Drafting cites Findability/Understandability; evaluation cites Usability — section delivery, not four files |
| STE integration | Opt-in `{controlled_language}` overlay | STE is a controlled natural language for technical docs — stricter and a different register from audience-adaptive plain language; always-on STE would stilt general prose |
| Subject matter | Domain-general | Not tied to this repo's issue/PR mandate; reusable as an embedded check elsewhere |

## Artifacts and evaluation

| Decision | Choice | Why |
|----------|--------|-----|
| Persisted working artifacts | Planning folder via `work-package::manage-artifacts::write-artifact` | Profile, source analysis, draft, evaluation report, checklist — same idiom as sibling workflows |
| Artifacts produced | Document profile, source analysis, plain document, evaluation report, ISO checklist | Context-dependent: audit skips draft/checklist/delivery; author skips source analysis |
| Evaluation model | Evaluate–revise loop + human gate (ISO 5.4) | The standard's only way to *know* a document works; self-check alone is insufficient |

## Alternatives weighed

**Techniques + resources only (no workflow.yaml).** Rejected for this delivery: author/rewrite/audit need mode branching, checkpoints, and an evaluate loop. The technique group still exposes the reusable surface (`plain-language::evaluate-document`, and so on) for embedded use.

**Three sibling workflows sharing one technique group.** Rejected: triples README and variable surface for one shared criteria home; a single `operation_type` already expresses the split.

**Always-on STE folded into the ISO resource.** Rejected: ISO itself distinguishes plain language from simplified/controlled language; STE's approved-word discipline does not fit general-audience documents.

**Automated scoring only, no human gate.** Rejected: Principle 4 centres evaluation with readers where severity warrants it; the gate records acceptance of remaining open issues rather than pretending a score closes them.

**Meta-hosted technique group + thin workflow.** Rejected for v1: co-locating criteria and ops under `plain-language/` keeps the family self-contained and discoverable; a later move into `meta/` is possible if reuse demand justifies it.
