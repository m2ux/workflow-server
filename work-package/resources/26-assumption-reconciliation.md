---
id: assumption-reconciliation
version: 1.0.0
---

# Assumption Reconciliation

## Methodology

Activities throughout the work-package workflow produce assumptions — implicit decisions that may or may not hold. Traditionally, these are presented to the user for manual triage: confirm, correct, or skip. This places the burden of identifying which assumptions are verifiable on the user, who must then request targeted analysis, check for newly surfaced assumptions, and iterate.

Assumption reconciliation replaces this manual loop with an autonomous classify-analyze-converge cycle. After an activity collects assumptions, the agent:

1. **Classifies** each open assumption as code-resolvable or not
2. **Analyzes** all code-resolvable assumptions through targeted codebase investigation
3. **Updates** the assumptions log with evidence-based resolutions
4. **Captures** any new assumptions surfaced during analysis
5. **Repeats** from step 1 until no code-resolvable assumptions remain

The user then reviews only the irreducible set — assumptions that genuinely require human judgment.

## Classification Criteria

### Code-resolvable

An assumption is code-resolvable if targeted reading, searching, or diffing of the codebase could validate or invalidate it. Examples:

- "Function X produces deterministic output" — trace the implementation
- "The test suite covers scenario Y" — search for relevant test cases
- "Data flows through path Z" — trace from source to sink
- "Library version A changed behavior B" — diff between tags
- "Type T uses collection C internally" — read the type definition
- "Error handling follows pattern P" — grep for error propagation
- "Module M depends on module N" — check imports and Cargo.toml
- "The override mechanism handles edge case E" — read guard conditions

### Not code-resolvable

An assumption is not code-resolvable if it depends on information outside the codebase. Examples:

- "Stakeholders will approve approach A" — requires human decision
- "Override data is complete for network N" — requires operational verification
- "Timeline estimate is realistic" — judgment call
- "The deployment succeeded on environment E" — requires runtime evidence
- "Business priority favors option X over Y" — strategic decision
- "External service S behaves according to spec" — requires integration testing

### Edge cases

Some assumptions are partially resolvable: code analysis can narrow the uncertainty but not eliminate it. Mark these as Partially Validated with the evidence gathered and a note on what remains unresolved. If further code analysis would not help, reclassify as not-code-resolvable.

## Convergence

Convergence is reached when **no open assumptions in the log are classified as code-resolvable**. This includes assumptions that were surfaced during analysis — they must also be classified and resolved if code-resolvable before convergence is declared.

Convergence does NOT mean all assumptions are resolved. It means the remaining open assumptions are irreducible through code analysis — they require stakeholder input, operational verification, or other external information.

### Convergence indicators

- All code-resolvable assumptions have a resolution status (Validated, Invalidated, Partially Validated)
- Every resolution cites file paths and code evidence
- No newly surfaced assumption is classified as code-resolvable
- The final open set has explicit reasons for non-resolvability

## Handoff to Judgement Augmentation

After reconciliation converges, the remaining open assumptions are presented to the user through the `review-assumptions` skill's judgement augmentation protocol. Reconciliation directly feeds this process:

### What reconciliation provides

| Element | Source |
|---------|--------|
| **The irreducible open set** | Assumptions classified as not-code-resolvable after convergence |
| **Non-resolvability rationale** | The classification rationale recorded for each open assumption |
| **Technical context** | Findings from reconciliation cycles — validated assumptions, code patterns discovered, partial evidence gathered |
| **Alternatives context** | Constraints and patterns identified during analysis that inform the trade-off space |

### What reconciliation does NOT provide

The `review-assumptions` skill is responsible for:
- Assembling per-assumption trade-off analysis from the raw evidence, covering relevant dimensions (implementation complexity, maintenance burden, consistency, side-effect risk, reversibility, requirements alignment, time/effort cost)
- Ordering assumptions by decision impact for presentation
- Presenting alternatives before the agent's position to reduce anchoring bias
- Flagging decision reversibility (easily-reversible vs. path-committing)
- Grouping related assumptions when presenting 5+ open items
- Formatting the interview-style presentation
- Framing the interaction as judgement augmentation (not triage)

### All-resolved case

If reconciliation resolves every assumption (the open set is empty after convergence), the `review-assumptions` skill skips the judgement augmentation format and presents a summary confirming that all assumptions were verified through code analysis. No user input is needed.

## Integration with Comprehension Artifacts

When a comprehension artifact exists for the codebase area, reconciliation findings are appended as numbered deep-dive sections. This serves two purposes:

1. **Traceability** — The evidence trail is preserved alongside the broader codebase understanding
2. **Reusability** — Findings from assumption reconciliation enrich the comprehension artifact for future work packages

The Open Questions table in the comprehension artifact is updated: questions answered during reconciliation are marked Resolved; new questions surfaced are added as Open.

## Integration with Assumptions Log

### Resolution statuses

| Status | Meaning |
|--------|---------|
| Validated | Code evidence confirms the assumption holds |
| Invalidated | Code evidence refutes the assumption |
| Partially Validated | Evidence supports with caveats or limitations |
| Open | Not yet resolved — includes reason (requires stakeholder input, requires operational verification, etc.) |

### Log structure after reconciliation

Each resolved assumption includes:
- **Finding** — what the analysis discovered
- **Evidence** — file paths, line numbers, commit hashes
- **Resolution** — Validated / Invalidated / Partially Validated
- **Iteration** — which reconciliation cycle resolved it

Each open assumption includes:
- **Classification rationale** — why it cannot be resolved through code analysis
- **What would resolve it** — what external input or verification is needed

### Markdown formatting rule

**CRITICAL:** In standard markdown, consecutive lines that start with bold labels (e.g. `**Status:** value`) merge into a single paragraph unless each line ends with two trailing spaces. Every bold-label line MUST end with two spaces (`  `) EXCEPT the last line in its group. The trailing spaces produce a `<br>` in rendered markdown, preserving line breaks without changing the visual style.

#### Correct format (trailing spaces — shown as ⎵⎵)

```markdown
### A-XX-01: Short title
**Status:** Validated⎵⎵
**Resolvability:** Code-analyzable⎵⎵
**Assumption:** The system uses pattern X for feature Y.⎵⎵
**Evidence:** Found in `src/module.rs:42-58` — the `handle()` function
dispatches through a match statement covering all variants.⎵⎵
**Risk if wrong:** Implementation would target the wrong abstraction.
```

#### Incorrect format (no trailing spaces)

```markdown
### A-XX-01: Short title
**Status:** Validated
**Resolvability:** Code-analyzable
**Assumption:** The system uses pattern X for feature Y.
**Evidence:** Found in `src/module.rs:42-58`.
```

The incorrect format renders as a single paragraph:
> **Status:** Validated **Resolvability:** Code-analyzable **Assumption:** The system uses pattern X for feature Y. **Evidence:** Found in `src/module.rs:42-58`.

This rule applies to ALL planning artifacts that use bold-label fields — assumptions logs, design philosophy documents, research documents, implementation analyses, and comprehension artifacts. Do NOT use bullet prefixes (`- `) for this purpose.

## Scorecard

After reconciliation, present a summary scorecard:

```
Total: N | Validated: N | Invalidated: N | Partially Validated: N | Open: N
Convergence iterations: N | Newly surfaced: N
```

This gives the user an at-a-glance view of how the assumption set evolved through reconciliation. If open assumptions remain, they proceed to judgement augmentation review. If the open count is zero, no user review is needed.
