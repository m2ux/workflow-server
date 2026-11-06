# Normative Conformance Wording — November 2026

> Authoring correction · Created 2026-11-06

## Executive Summary

The user requests explicit normative wording for conformance statements, exemplified by “Results should meet Assignments,” so the text does not resemble a validation operation. Apply the lowercase prose form the user supplies. Keep must for mandatory constraints and existing gates, should for recommendations, and may for permission; use explicit Check/Validate or a called validator for execution.

Review comparable meet/follow statements across Work Planner before changing them. Preserve factual descriptions, type definitions, actual conditional eligibility tests and existing mandatory modals. Record the distinction in the owning guideline and its rule registry. No validator call, invocation, output schema, optionality or runtime behavior changes.

## Sources and Interpretation

[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html) distinguishes absolute requirements, recommendations and permission. [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174.html) reserves formal BCP 14 meanings for uppercase forms. This edit follows the user's explicit lowercase, RFC-style prose example; it introduces no formal RFC boilerplate or case conversion of the corpus.

## Validation Plan

Check all changed conformance statements for preserved strength and untouched gates, and retain a disposition inventory. Run installed-model and existing document/command checks. Verify exact invocation and literal-template contents, no new execution routes, and commit/push the current E01 branch.

## Links

| Resource | Link |
| --- | --- |
| Style PR | https://github.com/m2ux/workflow-server/pull/1641 |
