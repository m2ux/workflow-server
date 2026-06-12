# 03 — Requirements Specification (`requirements-refinement`)

**Activity:** requirements-refinement · **Status:** ✅ Complete · all 8 dimensions confirmed by user.

## 1. Purpose & domain
Given a **local meeting-transcript file** and a **target canonical requirements specification**, refine the
spec: analyze the transcript for requirement changes → apply them → validate against the spec protocol →
iteratively correct → stage the finalized spec for human promotion. Domain: requirements engineering /
document automation. Reusable across requirements documents (paths are inputs; supports augmenting an
existing doc and creating one from scratch). Pure work-package artifact style; **no git automation**.

## 2. Activity model
Sequential pipeline: `initialActivity` + conditional `transitions`, with a bounded correction loop-back.
`executionModel` roles: **orchestrator** + **worker** (matches work-package).

## 3. Activities (6) — confirmed: separate update/validate with transition loop-back
| # | Activity | Mirrors (n8n) | Purpose |
|---|----------|---------------|---------|
| 01 | `intake-sources` | trigger + reads | Capture & validate `transcript_path` + `target_doc_path`; set `target_doc_exists` (augment vs create); load both; confirm scope |
| 02 | `analyze-transcript` | Requirements Analysis Agent | Parse transcript + current spec → structured Requirements Analysis Report; confirm before applying |
| 03 | `update-specification` | Document Update Agent (initial + correction) | Apply analysis or correction feedback → complete updated spec, protocol preserved verbatim, new reqs `pending`; write working version |
| 04 | `validate-specification` | Validation Agent + Parse Validation JSON | Validate structure / ID-uniqueness / consistency / protocol; categorize critical vs correctable; set outcome vars; route |
| 05 | `finalize-specification` | Git Prep Agent (de-git'd) | Assemble final spec + change summary as planning-folder artifacts; human-promotion checkpoint |
| 06 | `report-failure` | Generate Failure Report | Markdown failure report (critical issues, iteration history, manual-resolution guidance); no promotion |

**Correction loop (confirmed: conditional transitions):** `validate-specification` ordered transitions —
1. `validation_passed == true` → `finalize-specification`
2. `has_correctable_issues == true AND correction_iteration < max_correction_iterations` → `update-specification` (correction mode; increments `correction_iteration`)
3. `has_critical_issues == true OR correction_iteration >= max_correction_iterations` → `report-failure` (isDefault)

## 4. Checkpoints
| Checkpoint | Activity | Purpose |
|-----------|----------|---------|
| `sources-confirmed` | intake-sources | Confirm transcript + target doc + augment/create mode |
| `analysis-confirmed` | analyze-transcript | Human gate to review the analysis report before changes are applied |
| `finalization-confirmed` | finalize-specification | Review final spec + change summary; record acceptance (promotion is manual) |
| `failure-acknowledged` | report-failure | Acknowledge manual intervention required |

Validation routing is automated (no user checkpoint).

## 5. Artifacts (all under `artifactLocations.planning`)
| Artifact name | Activity | Notes |
|---------------|----------|-------|
| `intake.md` (`01-`) | intake-sources | Sources captured, mode detected |
| `requirements-analysis.md` (`02-`) | analyze-transcript | Per `requirements-analysis-report.md` template |
| `working-spec-{n}.md` (`03-`) | update-specification | Versioned series (`{n}` = correction_iteration) |
| `validation-report-{n}.md` (`04-`) | validate-specification | Versioned series; verdict + categorized issues |
| `final-spec.md` (`05-`) + `change-summary.md` (`05-`) | finalize-specification | Final spec staged for promotion + change summary |
| `failure-report.md` (`06-`) | report-failure | Critical-issue failure report |

## 6. Variables (snake_case; affirmative-predicate booleans per AP-60)
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `transcript_path` | string | — | Local meeting-transcript file path (input) |
| `target_doc_path` | string | — | Canonical requirements-spec file path (input) |
| `target_doc_exists` | boolean | false | True when augmenting an existing doc; false → create from scratch |
| `spec_basename` | string | "" | Basename of the target doc, for artifact naming |
| `sources_confirmed` | boolean | false | Intake sources confirmed |
| `analysis_confirmed` | boolean | false | Analysis report approved before applying |
| `validation_passed` | boolean | false | Updated spec passed validation |
| `has_correctable_issues` | boolean | false | Correctable validation issues remain |
| `has_critical_issues` | boolean | false | Critical/irreconcilable issues present |
| `correction_iteration` | number | 0 | Current correction pass count |
| `max_correction_iterations` | number | 3 | Correction cap (n8n parity) |
| `finalization_confirmed` | boolean | false | Final spec accepted for promotion |

## 7. Techniques + resources
**Root** `techniques/TECHNIQUE.md` — shared inputs (`planning_folder_path`, `transcript_path`, `target_doc_path`) + spec-protocol fidelity rule.
**Techniques:** `analyze-transcript`, `update-specification`, `validate-specification`, `finalize-specification`, `report-failure` (kept separate — confirmed).
**Resources:**
- `specification-protocol.md` — the SRS layout **verbatim**: §1–7 section structure, requirement-entry format (`**REQ-ID: The system SHALL/SHOULD/MAY …**` / *Status* / *Rationale* / *Source*), ID schemes (`SRC-MTG###`, `REQ-F###`, `REQ-NF###`), `status: pending` rule, source-reference format.
- `requirements-analysis-report.md` — analysis report template (Meeting Source / New / Updated / Deprecated / Document Updates Required / Quality Issues / Implementation Notes).
- `validation-rubric.md` — validation checks + severity (critical/high/medium/low) and type (irreconcilable/structure/content/syntax) categorization; critical-vs-correctable routing.
- `change-summary.md` — change-summary template (new/updated/deprecated reqs, sources added, validation status).

## 8. Rules (workflow-level) + enforcement classification
| Rule | Enforcement |
|------|-------------|
| Preserve the specification protocol verbatim (structure, entry format, ID schemes, status conventions) | Structural — `validate-specification` + `specification-protocol.md` |
| New requirements are created with status `pending`; status changes require explicit confirmation | Structural — validate check |
| Bound the correction cycle to `max_correction_iterations`; on critical issues or exhaustion route to `report-failure` | Structural — transition conditions + counter |
| All artifacts written to the planning folder; no git operations; do not edit the canonical document in place | Guidance + artifactLocations |
| Confirm the requirements analysis with the user before applying changes | Structural — `analysis-confirmed` checkpoint |
| Preserve the target document's existing structure when augmenting; instantiate the full protocol when creating from scratch | Guidance + `target_doc_exists` gating |

`requirements_confirmed = true`.
