# Workflow Creation/Modification Misalignment Analysis

**Date:** 2026-03-19
**Scope:** History files from 2026-03-13 session cluster
**Purpose:** Identify patterns where informal (non-workflow-guided) workflow creation or modification produced results that diverged from user expectations.

---

## Executive Summary

Nine history files were analyzed. Of these, **three files showed significant misalignment** (files 1, 4/5 combined audit, and 9), **one file showed moderate misalignment** (file 1's second phase), and **five files showed no misalignment** (files 2, 3, 6, 7, 8). The zero-misalignment files share a critical characteristic: the user provided **exact, prescriptive instructions** with literal search/replace patterns, leaving no room for agent interpretation.

The pattern is clear: when agents were given latitude to design, author, or architect workflow content, misalignment occurred. When they were given precise mechanical edits, it did not.

---

## File-by-File Analysis

### 1. `2026-03-13_09-02Z-missing-numeric-prefixes-in-output-artifacts.md`

**What was attempted:** Investigate why output artifacts in the work-package workflow were missing numeric prefixes, then fix the root cause.

**Misalignment instances:**

| # | Description | Category |
|---|-------------|----------|
| 1 | Agent proposed adding `artifactPrefix` to the TypeScript schema to surface the already-existing TOON field. User corrected: the prefix should be **automatically inferred** from the activity filename by the server. The agent's approach would have duplicated the filename's index as a separate variable — a DRY violation. | **Assumption without verification / wrong architectural approach** |
| 2 | Agent completed the initial fix, then the user noticed a resource file (`16-rust-substrate-code-review.md`) containing prose-based workflow execution instructions ("Step 1: Implementation Offer... Step 2: Iterative Implementation..."). The agent had not flagged this during its own analysis. | **Failure to identify scope / convention violation** |
| 3 | After removing the prose from one resource, user had to tell the agent: "check all other resources for prose-based workflow content and repeat the check you did above." The agent should have generalized the pattern proactively. | **Failure to generalize from correction** |
| 4 | The agent analyzed and reported prose workflow content in many resources but did not proactively propose formalizing what was missing from TOONs. The user had to explicitly ask: "Propose toon updates to capture the workflow prose... that is NOT fully formalized." | **Passivity / waiting for direction on obvious next step** |

**Key quote (user correction):**
> "Artifact names generated within activities should *automatically* have the numeric prefix of the activity file appended to the name without any special use of placeholders *or* artifactprefix variable. Since output are produced by skills, the activity calling the skill is responsible for appending the prefix. The server will need to be updated to automatically infer the prefix from the activity filename. duplicating this with artifactPrefix variable is a DRY violation."

---

### 2. `2026-03-13_09-25Z-removal-of-required-lines-in-toon-files.md`

**What was attempted:** Remove all `    required: true` lines from 24 skill .toon files in work-package, preserving `required: false` lines and rule names containing "required".

**Misalignment instances:** **None detected.** The user provided exact file lists, line numbers, and replacement instructions. The agent executed the 24-file edit correctly and verified with grep.

**Category:** N/A — this was a **mechanical execution task** with zero ambiguity.

---

### 3. `2026-03-13_09-25Z-removing-required-true-lines-from-toon-files.md`

**What was attempted:** Same removal across 4 additional workflow directories (cicd-pipeline-security-audit, meta, prism, substrate-node-security-audit).

**Misalignment instances:** **None detected.** Same prescriptive pattern as file 2. The agent executed ~50 edits across 33 files correctly.

**Category:** N/A — **mechanical execution task**.

---

### 4. `2026-03-13_09-41Z-prose-based-workflow-execution-instructions-review.md`

**What was attempted:** Audit 9 resource files for prose-based workflow execution instructions that should live in TOON files.

**Misalignment instances:** **None detected in the audit itself.** The agent produced a thorough, well-structured report with correct findings and actionable recommendations. However, this task was **prompted by misalignment discovered in file 1** — the user had to request this audit because the original workflow content mixed reference material with execution instructions.

**Category:** The audit was accurate. The underlying issue — that workflow content was created with prose execution instructions in resource files — is the misalignment.

---

### 5. `2026-03-13_09-41Z-prose-based-workflow-execution-instructions-review-1.md`

**What was attempted:** Continuation of the audit for 10 additional resource files (19-27).

**Misalignment instances:** **None in the audit itself.** The agent correctly identified 7 of 10 files containing prose workflow instructions, with accurate TOON cross-references.

**Category:** N/A — the audit was well-executed.

---

### 6. `2026-03-13_10-03Z-workflow-and-resource-file-edits.md`

**What was attempted:** 6 precise edits to TOON and resource files, implementing the formalization recommendations from the audit (files 4/5).

**Misalignment instances:** **None detected.** The user provided exact search/replace blocks for each of the 6 edits. The agent read files first and applied all changes correctly.

**Category:** N/A — **prescriptive execution task**. The user did all the design work and provided the agent with exact edits.

---

### 7. `2026-03-13_10-04Z-workflow-server-file-edits.md`

**What was attempted:** 6 more precise edits (numbered 7-12) to TOON files and resources, continuing the formalization.

**Misalignment instances:** **None detected.** Same prescriptive pattern.

**Category:** N/A — **prescriptive execution task**.

---

### 8. `2026-03-13_10-05Z-workflow-file-edits-and-updates.md`

**What was attempted:** 7 edits (labeled A-G) to skills, resources, and activities.

**Misalignment instances:** **None detected.** Single user turn with precise instructions, single agent turn with correct execution.

**Category:** N/A — **prescriptive execution task**.

---

### 9. `2026-03-13_10-18Z-agi-in-md-prism-workflow-update.md`

**What was attempted:** Start a work-package workflow to update the prism workflow with new prism resources from the agi-in-md project. This was the only file where a full workflow was executed (not just mechanical edits).

**Misalignment instances:**

| # | Description | Category |
|---|-------------|----------|
| 1 | Agent produced a README.md that "reads like an agent-focused document" and was "not in keeping with the style of the other workflows." Agent instructions were placed in the README instead of being subsumed into appropriate workflow artifacts (skills, activities, rules). | **Convention non-adherence / wrong content location** |
| 2 | User had to request: "augment the readme overview to give concrete examples of input prompts... that will reliably trigger *each* of the possible prisms." The agent should have included these in the first version — user-facing documentation needs actionable examples. | **Insufficient user-facing content** |
| 3 | User had to request: "collapse the prompt guide section into a single table." The agent had used verbose subsections instead of a compact table format. | **Format/structure choice** |
| 4 | User had to request: "Add a 'Scope' Column." The agent omitted a key dimension (file vs module vs text scope) that users need for mode selection. | **Missing critical dimension** |
| 5 | User corrected: "This is too abstract and arcane: 'The Prism Workflow dispatches analytical lenses as isolated sub-agent passes against a target'. The user needs to know in plain language what value this workflow provides." The agent used implementation-focused jargon instead of user-facing value proposition language. | **Abstract/jargon-heavy language** |
| 6 | User had to ask: "verify that each of those statements *Actually* triggers the Prism mode which the readme indicates that it does." The agent had written example prompts without verifying they would route correctly through the plan-analysis skill's goal-mapping matrix. | **Unverified claims** |
| 7 | Agent tried to push changes to an already-merged PR (#54). User corrected: "that PR is already merged and closed. migrate the changes to a new branch/PR." | **Stale state awareness** |
| 8 | When asked to create a new workflow from the steps performed, the agent encoded steps as prose in TOON files instead of using the schema's dedicated structured forms. User corrected: "ensure the new files pass validation and use the schema efficiently (eg dont encode steps as prose when the schema provides dedicated form for representing these)." | **Schema misuse / format error** |

**Key quotes (user corrections):**
> "The README.md reads like an agent-focused document and is *not* in keeping with the style of the other workflows. Agent instructions should be subsumed into the appropriate workflow artifacts and *not* located in this readme."

> "This is too abstract and arcane: 'The Prism Workflow dispatches analytical lenses as isolated sub-agent passes against a target'. The user needs to know in plain language what value this workflow provides over and above simply giving the prompt to the underlying model."

> "ensure the new files pass validation and use the schema efficiently (eg dont encode steps as prose when the schema provides dedicated form for representing these)"

---

## Cross-File Pattern Analysis

### Pattern 1: Prescriptive Instructions = Zero Misalignment
Files 2, 3, 6, 7, 8 had **zero misalignment**. In every case, the user provided:
- Exact file paths and line numbers
- Literal search/replace text blocks
- Explicit scope constraints ("do NOT remove lines containing `required: false`")

This suggests the user had already learned that giving agents latitude with workflow content produces unpredictable results.

### Pattern 2: Agent-Generated Prose Ends Up in Wrong Location
Across files 1, 4, 5, and 9, the recurring theme is **workflow execution instructions appearing in resource files** or **agent-focused content appearing in user-facing documents**. The agent consistently blurs the boundary between:
- **Resources** (reference material: templates, criteria, checklists) and **TOON files** (execution instructions: steps, protocols, rules)
- **User-facing documentation** (README: value proposition, examples, scope) and **agent-facing artifacts** (worker discipline, orchestrator responsibilities)

### Pattern 3: Agent Designs for Implementation, Not for Users
In file 9, the agent wrote documentation using implementation terminology ("dispatches analytical lenses as isolated sub-agent passes") instead of user-facing value language. It omitted concrete examples, practical scope indicators, and verification of its own claims. The agent optimized for technically complete descriptions rather than practically useful documentation.

### Pattern 4: Failure to Generalize from Corrections
In file 1, after the user identified prose workflow instructions in one resource, the agent removed them but did not proactively check other resources. The user had to explicitly request the broader audit. An agent following a structured workflow would have a step for "verify consistency across all files of the same type."

### Pattern 5: Architecture Decisions Without User Consultation
In file 1, the agent proposed an `artifactPrefix` variable approach without considering the DRY implications or presenting alternatives. The user had to redirect toward server-side inference from filenames — a simpler, more maintainable architecture. The agent didn't surface the trade-off before implementing.

### Pattern 6: Schema Fidelity Errors in New Workflow Creation
In file 9, when asked to create a new workflow, the agent used prose descriptions where the TOON schema provides dedicated structured constructs for representing steps, protocols, and rules. This is a fundamental schema literacy issue — the agent treated TOON files as free-form text rather than structured documents with specific semantics.

---

## Summary: Misalignment Categories by Frequency

| Category | Files Affected | Occurrences |
|----------|---------------|-------------|
| Convention non-adherence (wrong location, wrong style) | 1, 9 | 4 |
| Assumption without verification | 1, 9 | 3 |
| Schema misuse / format error | 9 | 2 |
| Abstract/jargon-heavy language | 9 | 1 |
| Unverified claims | 9 | 1 |
| Stale state awareness | 9 | 1 |
| Failure to generalize from correction | 1 | 1 |
| Passivity (obvious next step not taken) | 1 | 1 |

---

## Implications for Workflow-Guided Process

The data strongly suggests that a structured workflow for creating/modifying workflows would need to enforce:

1. **Content-location validation** — A step that verifies execution instructions are in TOON files and reference material is in resources, with no mixing.
2. **Convention conformance check** — Compare produced artifacts against existing examples of the same type (e.g., compare a new README against other workflow READMEs).
3. **Schema compliance verification** — Validate that TOON files use structured constructs (steps, protocols, rules, checkpoints) rather than prose descriptions where the schema provides dedicated forms.
4. **User-perspective review** — A checkpoint where documentation is evaluated from a user's perspective: Does it explain value? Does it include examples? Is it accessible language?
5. **Cross-file consistency audit** — After modifying one file of a type, check all files of the same type for similar issues.
6. **Claim verification** — Any claims about behavior (e.g., "this prompt triggers this mode") must be verified against actual routing logic.
7. **Architecture decision presentation** — Surface trade-offs before implementing, especially when multiple approaches exist.
