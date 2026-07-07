---
metadata:
  version: 1.0.0
---

## Capability

Severity-classify a set of review or validation findings on a single scale (Critical / Major / Minor / Nit / Informational) and set the routing flags that gate downstream fix cycles. Generic over the source of the findings — code-review findings, test-suite-review findings, and validation diagnostics (test/build/lint failures) are all classified the same way, with failures mapped onto the same severity scale.

## Inputs

### findings_to_classify

The findings or diagnostics to classify. Each entry carries enough context to judge severity — a description, the affected file/symbol, and (for validation diagnostics) the failing check id and its output.

### code_review_findings

*(optional)* The code-review findings subset, when present, that drives `needs_code_fixes`.

### test_review_findings

*(optional)* The test-suite-review findings subset, when present, that drives `needs_test_improvements`.

## Outputs

### needs_code_fixes

True when any code-review finding has severity >= Minor (Critical, Major, or Minor); false when all code-review findings are Nit/Informational or there are no findings.

### needs_test_improvements

True when any test-suite finding has severity >= Minor (Critical, Major, or Minor); false when all test-suite findings are Nit/Informational or there are no findings.

### classified_findings

The input findings, each carrying its assigned severity and — where one applies — its `impact_axis` (the dimension on which a behaviourally correct change is nonetheless harmful: unbounded-state-growth, economic-spam, liveness-halt, or migration-upgrade). Downstream rendering reads the severity to place each finding on the render scale and reads the impact axis to justify a correct-but-harmful classification.

## Protocol

### 1. Classify Findings

- Assign every finding in `{findings_to_classify}` a severity on the single scale: Critical, Major, Minor, Nit, or Informational.
- Judge severity by impact, not surface: Critical for security or data-loss risks and failing tests; Major for correctness defects and build failures; Minor for maintainability and lint issues; Nit for style; Informational for observations carrying no required action.
- When the findings are validation diagnostics (test/build/lint failures), map them onto the same scale — test failures are Critical, build failures are Major — and do NOT attempt to fix them here; classification only.

#### Impact-based severity axes

Code-correctness is one axis of severity; system impact is another, orthogonal to it. A change can be locally correct — the new lines do exactly what they read as doing — and still be harmful through its effect on the system as a whole. Judge each finding against these impact axes in addition to correctness, and record the axis that applies on the classified finding (`impact_axis`):

- **unbounded-state-growth** — a code path creates persistent state (a storage record, a queue entry, an allocation) on a recurring or attacker-driven action without a matching reclaim on every path that ends that state's lifecycle, so the footprint grows without bound.
- **economic-spam** — a path lets an actor impose cost (storage, compute, fees borne by others, griefing) disproportionate to the cost or authority required to trigger it.
- **liveness-halt** — a path can stall, deadlock, or halt progress for the system or a class of participants (a panic on a reachable input, an unbounded loop, a lock never released).
- **migration-upgrade** — a change to persisted shape, encoding, or governance binding leaves existing on-chain or on-disk state unreadable, mis-governed, or un-upgradeable without an accompanying migration.

A finding that is correct on the code-correctness axis but lands on any impact axis is **correct-but-harmful**. Classify a correct-but-harmful finding at **Major** at minimum, and at **Critical** when the impact is unrecoverable without intervention (state already corrupted, funds already lost, chain already halted). Because correct-but-harmful classifies Major or above, it is ≥ Minor and therefore sets `{needs_code_fixes}` through the existing routing rule — the impact axes add severity without changing the routing threshold.

### 2. Route Code Findings

- Inspect the code-review subset (`{code_review_findings}`).
- Set `{needs_code_fixes}`=true when any code-review finding is Minor or above; otherwise false.

### 3. Route Test Findings

- Inspect the test-suite subset (`{test_review_findings}`).
- Set `{needs_test_improvements}`=true when any test-suite finding is Minor or above; otherwise false.

### 4. Record Triage Notes

- Leave Nit and Informational findings unflagged — they are documented in their review reports for the user to triage at their discretion, never auto-fixed.
- A run with only Nit/Informational findings, and a clean run with no findings, both leave the routing flags false so the work proceeds without a fix cycle.

## Rules

### single-severity-scale

Every finding, whatever its source, is classified on the one Critical / Major / Minor / Nit / Informational scale. Validation failures map onto it rather than carrying a parallel scheme.

### minor-and-above-routes

Only findings at Minor severity or above set a routing flag. Nit and Informational findings are documented for user triage and never trigger an automatic fix cycle.

### classify-do-not-fix

This technique classifies and routes only. Applying fixes is the responsibility of the downstream fix technique.
