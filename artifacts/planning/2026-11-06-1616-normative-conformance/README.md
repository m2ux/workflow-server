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

## Result

Source: `d22b9a1919f1ba8bfe60017e420b7d9527519dd0`. Forty-five conformance references have explicit requirement wording. The three Lane result statements use the user's exact “Results should meet” form. Output-format guidance uses should; mandatory schema, eligibility and body constraints use must. Existing must clauses and validation calls remain. The guideline states lowercase requirement strength and distinguishes conformance expectations from explicit validation actions, with a matching rule-registry entry.

Reviewed exclusions include only-once/only-for eligibility predicates, factual completion and configured-default descriptions, positional follows, and meets meaning encounters. These retain their meaning rather than acquiring new validation or optionality. No formal uppercase RFC conversion, validator implementation or runtime change is introduced.

Preservation checks cover all 58 Markdown files: all 116 invocation blocks, all nine literal templates, all headings and every link target/role are identical. Fourteen document tests and twelve documented-command tests pass; installed model checks 58 files with zero findings; whitespace validation passes. No live tracker/graph behavior is claimed.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Conformance changes](changes.json) | Reviewed old/new wording with unchanged requirement-strength intent |
| [preservation.json](preservation.json) | Reproducible preservation or existing test evidence |
| [verify.py](verify.py) | Reproducible preservation or existing test evidence |
| [model.log](model.log) | Reproducible preservation or existing test evidence |
| [document-tests.log](document-tests.log) | Reproducible preservation or existing test evidence |
| [command-tests.log](command-tests.log) | Reproducible preservation or existing test evidence |
