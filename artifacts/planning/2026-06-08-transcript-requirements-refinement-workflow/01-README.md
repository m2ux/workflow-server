# Requirements Refinement Workflow — Design — June 2026

**Created:** 2026-06-08
**Status:** ✅ Complete — **merged**. PR [#131](https://github.com/m2ux/workflow-server/pull/131) merged → `workflows` (merge `0a952db9`, v1.1.0); parent submodule pointer bumped on `main` (`e0f88224`). Workflow is live.
**Type:** New workflow creation
**Workflow id:** `requirements-refinement`

> Effort estimates refer to agentic (AI-assisted) authoring time plus separate human review time.

---

## 🎯 Executive Summary

Create a new workflow-server workflow, `requirements-refinement`, that ports the logic of an existing
n8n automation (`req_update_agent.json`, in `~/projects/dev/mcs_docs/automation/`) into the
Goal → Activity → Skill → Tools model. The n8n flow is a four-agent pipeline that parses a meeting
transcript and creates/augments a canonical System Requirements Specification (SRS), with a
validation-driven correction loop. The port operates on a **local transcript file**, preserves the
**iterative refinement** behaviour and the **SRS specification protocol/layout verbatim**, and adopts
the **work-package artifact-management style** — a planning folder holds every intermediate and final
artifact, with no git automation.

---

## Source Pipeline (n8n `req_update_agent.json`)

Reverse-engineered from `automation/req_update_agent.json` and `prompts/*`:

1. **Trigger + read** — file-watch on a transcript drop; read new transcript + current SRS001.
2. **Requirements Analysis Agent** (Sr. Requirements Engineer) → structured *Requirements Analysis
   Report* (Meeting Source `SRC-MTG###`; New/Updated/Deprecated requirements mapped to
   `REQ-F###`/`REQ-NF###`; Document Updates Required; Quality Issues; Implementation Notes).
   Committed to `lifecycle/changes/{transcript}_analysed_requirements.md`.
3. **Document Update Agent** (Sr. Requirements Engineer) → applies the analysis to produce the
   complete updated SRS. Two modes: **initial** and **correction**. Enforces the canonical
   requirement-entry format; new requirements start `pending` (never `new`). Saved as a versioned
   working file `…_{source}_{NNN}.md`.
4. **Validation Agent** (Sr. Quality Engineer) → JSON verdict; issues categorised
   **critical/irreconcilable** vs **correctable** (severity: critical/high/medium/low; type:
   irreconcilable/structure/content/syntax).
5. **Loop / route** — `Parse Validation JSON`: passed → git; correctable & iteration < **3** →
   correction mode → re-validate (new working version each pass); critical or max-retries →
   **failure report** (HTML/PDF), no commit.
6. **Git Preparation Agent** (on pass) → branch `SRS-updates-YYYYMMDD`, conventional commit
   `feat(SRS001):…`, PR title + description → write final SRS → branch/commit/PR.

### Specification protocol (to preserve verbatim)
- Section structure §1–7 (Executive Summary, Requirements Sources, Use Case Definition, Functional
  Requirements, Non-Functional Requirements, Performance Requirements, Project/Process Requirements).
- Requirement-entry format:
  `**REQ-ID: The system SHALL/SHOULD/MAY …**` / *Status* / *Rationale* / *Source* (blank line between).
- ID conventions: `SRC-MTG###`, `REQ-F###`, `REQ-NF###`; source-reference format (§2.4).
- Status rule: newly added requirements = `pending`; never `new`; status changes require explicit
  confirmation during review.

---

## Locked Design Decisions (confirmed with user)

| # | Decision | Choice |
|---|----------|--------|
| D1 | Finalization | **Pure work-package style** — finalized SRS + change summary staged as artifacts in the planning folder; a human reviews and promotes/commits. **No git automation.** |
| D2 | Reusability | **Reusable / parameterized** — transcript path + target canonical-doc path are session inputs; supports augmenting an existing doc and creating one from scratch. |
| D3 | Spec format | **Encode SRS001 format rules verbatim** (entry format, ID schemes, `status: pending` rule, §1–7 structure) as workflow rules/techniques **and** preserve the target doc's existing structure at runtime. |
| D4 | Correction loop | Preserve bounded iterative refinement (**max 3 iterations**) and critical-vs-correctable severity routing. |
| D5 | Failure path | On critical/irreconcilable or max-retries: produce a **markdown failure report** artifact in the planning folder (replacing the n8n HTML/PDF); no document promotion. |

---

## Intake Classification

- **Operation:** create (no existing workflow referenced).
- **Mode variables:** `is_update_mode = false`, `workflow_id = requirements-refinement`.
- **Activity model:** sequential pipeline with an internal bounded correction loop.

---

## 📊 Progress

| # | Activity / Artifact | Description | Status |
|---|---------------------|-------------|--------|
| 01 | [Intake / this README](01-README.md) | Operation classified (create); design intent + locked decisions captured | ✅ Complete |
| 02 | [Context and Literacy](02-context-and-literacy.md) | Schemas + technique-protocol spec + reference workflows reviewed; TOON literacy + constructs confirmed | ✅ Complete |
| 03 | [Requirements Refinement](03-requirements-specification.md) | Full spec elicited; all 8 dimensions confirmed (6 activities, conditional-transition routing, report-failure separate) | ✅ Complete |
| 04 | [Pattern Analysis](04-pattern-analysis.md) | work-package + prism patterns extracted; adopt-all (2 confirmed divergences: transition-loop, no-git) | ✅ Complete |
| 06 | [Scope and Structure](06-scope-and-structure.md) | 21-file manifest enumerated + draft order confirmed; worktree verified | ✅ Complete |
| 07 | [Content Drafting](07-content-drafting.md) | 21 files drafted; TOON schema-valid; full workflow loads with all technique refs resolved | ✅ Complete |
| 08 | [Quality Review](08-quality-review.md) | 14 principles compliant; 4 anti-pattern findings fixed; schema-valid; all review checkpoints accepted | ✅ Complete |
| 09 | [Validate and Commit](09-validate-and-commit.md) | 7/7 TOON schema-valid; loader OK; +source-document discrimination; +v1.1 coverage gate; PR [#131](https://github.com/m2ux/workflow-server/pull/131) **merged** → `workflows`; pointer bumped on `main` | ✅ Complete |
| 10 | Post-Update Review | Update-mode only — not applicable to create mode (validate-and-commit is the create-mode terminal) | — N/A |

---

## 🔗 Source References

| Resource | Location |
|----------|----------|
| n8n automation | `~/projects/dev/mcs_docs/automation/req_update_agent.json` |
| Agent prompts | `~/projects/dev/mcs_docs/prompts/{Requirements_Analysis,Document_Update,Validation,Git_Preperation}_Agent/` |
| Example SRS | `~/projects/dev/mcs_docs/lifecycle/SRS001-system-requirements.md` |
