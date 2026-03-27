# Design Philosophy — Loader Error Handling and Validation

**Work Package:** WP-05  
**Date:** 2026-03-27

---

## Problem Classification

**Category:** Bug-Fix / Reliability  
**Specific problem, known cause, moderate complexity.**

The 12 findings fall into four distinct categories:

1. **Silent error swallowing** (QC-005, QC-023, QC-024): Errors caught and discarded without logging, making failures invisible in production
2. **Incorrect error semantics** (QC-006, QC-009, QC-011, QC-031): Wrong error types thrown, invalid objects propagated, or contradictory error policies within the same file
3. **Performance anti-pattern** (QC-010): Full workflow loading where only manifest fields are needed
4. **Minor correctness issues** (QC-022, QC-025, QC-026, QC-028): Wrong log levels, missing type guards, inconsistent filtering

---

## Design Rationale

### Principle: Fail Visible, Fail Correct

Every error should be either **logged at the appropriate severity** or **propagated to the caller with the correct error type**. Silent failures are never acceptable in a content loading layer because they convert content problems into mysterious downstream behavior.

### Principle: Validate or Reject

When Zod validation fails, the loader should **not** fall through to using the raw decoded object. Either return a validation-aware result (with warnings) or reject the content entirely. The current pattern of silently using unvalidated data defeats the purpose of having schemas.

### Principle: Error Type Accuracy

Catch blocks should preserve or correctly reclassify error types. Converting all errors to `ActivityNotFoundError` (QC-009) misleads callers — a parse error is not a "not found" error. Where specific error types exist, use them; where they don't, let the original error propagate.

### Principle: Minimal Reads for Listings

List operations should read only the metadata needed for the listing (e.g., frontmatter from `workflow.toon`), not full-load every item and its children (QC-010). This is both a performance and a correctness concern — listing should not trigger validation of all content.

---

## Complexity Assessment

**Moderate.** The 12 findings span 6 files, but each fix is localized. The primary risk is in QC-006 and QC-009 where changes to error handling semantics may affect callers. However, since the current behavior (silently returning invalid data, or mistyping errors) is itself incorrect, callers that depend on it have latent bugs.

### Stakeholder Assumption

**Whether callers that depend on silent failures (null returns) should be updated in this WP or deferred.**

Classification: **Code-resolvable.** During codebase comprehension, trace all callers of the affected functions to determine if any depend on the current (incorrect) silent-failure behavior. If callers handle null/error cases already, no additional changes are needed. If callers assume non-null returns, update them minimally in this WP.

---

## Workflow Path

Standard implementation path: comprehension → plan → implement → review. No architectural decisions required — all changes are local behavioral corrections within existing interfaces.
