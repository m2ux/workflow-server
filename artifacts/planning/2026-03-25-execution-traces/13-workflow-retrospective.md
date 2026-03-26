# Workflow Retrospective

**Work Package:** Execution Traces for Workflows (#63)  
**Date:** 2026-03-25

---

## What Went Well

- **User-driven design evolution**: The plan went through 4 revisions (v1→v4) based on user feedback, each iteration producing a better design. The user's decision to loop back from plan-prepare to research was the right call — it led to discovering mcp-trace-js and the OTel-compatible format approach.
- **Mechanical/semantic split**: The user's insight to separate server-captured mechanical traces from agent-written semantic traces was the key design decision. It eliminated token bloat, respected the separation of concerns, and made each layer independently useful.
- **Trace token design**: The progression from coordinate-only tokens → full-data tokens → mechanical-only full-data tokens was a productive design exploration. Each step was driven by concrete size estimates.
- **Clean implementation**: 13 tasks completed with no regressions. 187 tests pass. No medium/high/critical code review findings.
- **Assumption reconciliation**: All 16 assumptions resolved before implementation (10 through code analysis, 6 through stakeholder interview). Zero surprises during implementation.

## What Could Improve

- **Planning iteration count**: 4 plan revisions consumed significant time. The initial plan (v1) was too narrow — it didn't consider privacy, self-exclusion, or OTel compatibility. Starting with a broader analysis (research first) would have reduced iterations.
- **TOON file rename scope**: The tool rename (T1) touched 15 TOON files across multiple workflows. This was correctly identified by assumption A-06-01 but was still the highest-friction task. Future renames should consider the TOON file blast radius earlier.

## Lessons Learned

1. **Research before planning** produces better first-draft plans. The user was right to request research before committing to the approach.
2. **Size estimates with real data** (not rough guesses) enable better design decisions. The trace token size analysis with actual JSON bytes was decisive.
3. **Two-layer trace architecture** (mechanical + semantic) is a reusable pattern for any system where a server mediates between agents and workflows.
4. **Opaque tokens** (HMAC-signed, compressed fields) are an effective way to pass structured data through agents without polluting their context window.
