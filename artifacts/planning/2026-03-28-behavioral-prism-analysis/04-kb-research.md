# Knowledge Base & Web Research

**Work Package:** Behavioral Prism Analysis (Review of PR #83)  
**Created:** 2026-03-29  
**Activity:** research

---

## Research Focus

Evaluate PR #83's fix strategies against current best practices for:
1. Error handling patterns in TypeScript/Node.js
2. Zod schema validation at trust boundaries
3. MCP server error handling conventions
4. Result type patterns for expected failures

---

## Knowledge Base Findings

The concept-rag knowledge base has limited TypeScript-specific content. Relevant conceptual findings:

**Error handling as systematic discipline** — The KB (via Code Reading: The Open Source Perspective, Object-Oriented Reengineering Patterns, and The Rust Programming Language) frames error handling as a cross-cutting architectural concern, not a per-function decision. The Rust Programming Language's treatment of error handling philosophy (Chapter 9) specifically distinguishes between recoverable errors (Result) and unrecoverable errors (panic) — a distinction directly relevant to the PR's catch-block approach.

**No direct KB content on information fidelity at abstraction boundaries.** The behavioral prism analysis itself serves as the primary research artifact for this concept.

---

## Web Research Findings

### 1. Zod Validation Best Practices

**Source:** [Zod Error Handling docs](https://zod.dev/ERROR_HANDLING), [OneUpTime blog](https://oneuptime.com/blog/post/2026-01-25-zod-validation-typescript/view), [Akrom.dev tutorial](https://akrom.dev/blog/practical-zod-guide/)

Key practices relevant to PR #83:

| Practice | PR #83 Alignment | Finding |
|----------|-----------------|---------|
| Use `safeParse()` for graceful error handling | ✅ Aligned | BF-01/BF-06 use `safeParse()` / `Schema.safeParse()` correctly |
| Validate at trust boundaries | ⚠️ Partial | TOON decode boundary is the trust boundary. Skills and rules now validated; **resources still unvalidated (BF-16 gap)** |
| Infer types from schemas via `z.infer<>` | ✅ Aligned | SkillSchema, RulesSchema use this pattern |
| Use `.passthrough()` to preserve unknown fields | ✅ Aligned | SkillSchema uses `.passthrough()` for domain-specific fields |
| Compose schemas from simpler parts | ✅ Aligned | RulesSchema composes RulesSectionSchema |

**Key insight:** The Zod documentation specifically recommends `safeParse()` at boundaries where data enters the system from external sources. The TOON decode boundary fits this pattern exactly — data crosses from untyped file content to typed runtime objects. The PR's approach of adding `safeParse()` after `decodeToon()` is correct but stops short of the REPORT's recommended fix (requiring a schema parameter in `decodeToon()` itself), which would enforce validation structurally rather than relying on callers to remember.

### 2. MCP Server Error Handling

**Source:** [MCPcat error handling guide](https://mcpcat.io/guides/error-handling-custom-mcp-servers/), [Grizzly Peak error patterns](https://www.grizzlypeaksoftware.com/library/error-handling-patterns-for-mcp-hschbaxy), [DEV.to production-ready guide](https://dev.to/quantbit/building-production-ready-mcp-servers-with-typescript-a-complete-guide-13e9)

MCP servers use a three-tier error model:

| Tier | Scope | PR #83 Coverage |
|------|-------|----------------|
| Transport | Network, pipes, auth | Not in scope |
| Protocol | JSON-RPC violations (malformed JSON, invalid method) | Not in scope |
| Application | Tool failures, business logic errors | BF-02, BF-06, BF-08, BF-14 address this tier |

**Critical MCP pattern:** Tool-level errors should return structured content with `isError: true`, not throw exceptions. Throwing causes protocol-level errors harder for LLMs to interpret.

**PR alignment:** The workflow-server's existing pattern (loaders return `Result<T>`, tools `unwrap()` and throw) partially contradicts this guidance. The `unwrap()` call converts application-level errors (not found, validation failure) into thrown exceptions, which become protocol-level errors. However, since the MCP SDK handles thrown errors and converts them to JSON-RPC error responses, this is functional if not ideal.

**PR improvement via BF-02:** Adding `logWarn()` to catch blocks makes application-level failures visible in stderr without changing the tool-level API. This is a pragmatic compromise — it adds observability without requiring callers to change.

### 3. TypeScript Result Type Patterns

**Source:** [LeanMind Result pattern](https://leanmind.es/en/blog/result-pattern-in-typescript-when-your-errors-stop-being-a-surprise), [Brian Schiller best Result type](https://brianschiller.com/blog/2025/02/07/the-best-ts-result/), [better-result best practices](https://better-result.dev/advanced/best-practices)

| Principle | PR #83 Status |
|-----------|--------------|
| Use Result for expected failures | ✅ The codebase uses `Result<T, E>` for loader operations |
| Use exceptions for truly unrecoverable bugs | ✅ Tools throw for MCP-level error responses |
| Make errors visible in type signatures | ⚠️ Catch-and-suppress obscures errors — `logWarn` adds visibility but errors don't flow through the type system |
| Discriminated error unions for exhaustive handling | ⚠️ Error types exist (6 domain errors) but catch blocks flatten all errors to the same empty-return path |

**Key insight:** The Result pattern's primary benefit is making errors explicit in function signatures so callers must handle them. The PR's BF-02 approach (catch + logWarn + return fallback) preserves the "invisible error" anti-pattern at the type level — callers still cannot distinguish "zero results" from "error occurred." The diagnostic logging adds observability for operators but not programmatic visibility for callers.

---

## Synthesis: Patterns Applied to PR #83 Findings

### Patterns That Validate PR Approach

| Finding | Pattern | Validation |
|---------|---------|-----------|
| BF-01/BF-06 | Zod `safeParse()` at trust boundaries | Correct approach — validates at the TOON decode boundary |
| BF-05 | Defensive initialization (auto-init on first use) | Standard resilience pattern for stateful components |
| BF-10 | Input validation on all code paths (including fallback) | Security best practice — validate after every data acquisition |
| BF-13 | Type coercion at boundary (string-to-number) | Standard approach for weakly-typed input data |
| BF-15 | Compact serialization for M2M protocols | Correct — no human reads MCP tool responses |

### Patterns That Identify Gaps

| Finding | Pattern | Gap |
|---------|---------|-----|
| BF-16 | Zod `safeParse()` at trust boundaries | Resources still bypass validation — inconsistent with the pattern applied to skills and rules |
| BF-02 | Result type for expected failures | `logWarn` adds observability but doesn't make errors programmatically visible — callers still can't distinguish "zero results" from "error occurred" |
| BF-09 | Enforcement vs. advisory | MCP guidance says tool errors should be structured content. The `initialActivity` check produces a warning, not a rejection — which may be intentional (advisory model) but could surprise agents expecting enforcement |
| BF-08 | Error type discriminability | `ActivityNotFoundError` for a validation failure (file exists but fails schema) is semantically misleading — the activity was found but invalid |

### Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| BF-16 resource validation gap creates inconsistent trust boundary | Medium | Addressed during post-impl review; recommend adding ResourceSchema |
| BF-02 logWarn-only approach may give false confidence that errors are "handled" | Low | Logging is a first step; callers should eventually receive error information |
| BF-08 error type mismatch (`NotFound` vs. `ValidationError`) | Low | Functional but reduces diagnostic value; separate error type would be clearer |
| BF-09 advisory-only enforcement may not meet agent expectations | Low | Consistent with existing validation-as-metadata pattern; document clearly |

---

## Applicable Patterns Summary

| Pattern | Source | Application |
|---------|--------|-------------|
| Validate at trust boundaries (Zod safeParse) | Zod docs, web research | Apply uniformly to ALL content types (workflow, activity, skill, resource, rules) |
| Three-tier MCP error model | MCPcat, Grizzly Peak | Categorize errors by tier; application errors should be structured, not thrown |
| Result type for expected failures | LeanMind, better-result | Continue using Result; consider propagating errors through the type system instead of catch-and-suppress |
| Defensive initialization | General resilience | TraceStore auto-init is correct; apply to other stateful components as needed |
| Compact serialization for M2M | MCP convention | No pretty-printing for machine-consumed payloads |
| Input validation on all paths | Security best practice | Validate on fallback/race paths (BF-10 crypto key) |

---

## Research Gaps

- No KB content on the specific information-destruction-at-boundaries pattern — the behavioral prism analysis itself is the primary reference
- No MCP-specific guidance on the best-effort aggregation pattern (return partial results vs. fail with error) — this is a design decision the codebase must own
- Limited guidance on when `safeParse()` at call sites vs. requiring a schema parameter in shared functions is more appropriate — both are valid; the structural approach (schema parameter) is more robust but more invasive
