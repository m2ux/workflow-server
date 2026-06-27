---
name: design-assumption-reconciliation
description: How workflow-design reconciles audit-resolvable design assumptions via schema and convention checks before the open ones reach the user.
metadata:
  order: 8
---

# Design Assumption Reconciliation

**Purpose:** Reconcile the design assumptions that the schema and conventions can settle autonomously — the workflow-design counterpart of work-package's code-analysis [reconciliation](../../work-package/resources/assumption-reconciliation.md), with audit passes in place of codebase tracing.

Where work-package resolves code-analyzable assumptions through GitNexus-backed code tracing, workflow-design resolves *audit-resolvable* assumptions through its own audit techniques:

| If the assumption is about… | Resolve it with |
|------------------------------|-----------------|
| Whether a construct is schema-valid / well-formed | `audit-schema-validation` |
| Whether it follows library conventions / naming | `audit-conformance` |
| Whether a tool / technique / doc reference is consistent | `audit-consistency` |
| Whether it honours the design principles | `audit-principles` |

An assumption that no audit can settle — a genuine design judgement (which activity model, whether a concern deserves its own activity, which option is the default) — is **open** and goes to the user for interview. Reconciliation runs autonomously, without user interaction; the user sees only the converged result, with the classification rationale for each remaining open assumption.

For the markdown formatting rule (trailing two spaces on bold-label lines) and the assumptions-log integration shape, follow the work-package [assumption-reconciliation](../../work-package/resources/assumption-reconciliation.md) guide.

---

## Related Guides

- [Assumption Reconciliation (work-package)](../../work-package/resources/assumption-reconciliation.md)
- [Design Assumptions](design-assumptions.md)
