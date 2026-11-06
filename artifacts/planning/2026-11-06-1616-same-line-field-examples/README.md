# Inline Field Examples — November 2026

> Style correction · Created 2026-11-06

## Executive Summary

Field examples share the same source line as the description they illustrate. The user requests inline placement of each `eg` example throughout Work Planner.

Join standalone example paragraphs in Fields to the preceding description, preserving inline code, literal values, links, headings and other content. Multiple example paragraphs for one description become comma-separated inline examples under one `eg`. Apply the same placement to examples within field detail bullets. State this preference once in the existing Concrete Examples guideline.

## Validation Plan

Check that every example code span and all invocation payloads are identical, that no standalone `eg` field paragraphs remain, and that headings and link targets are unchanged. Run the installed model and whitespace checks. This formatting correction changes no reading route or executable/template behavior; it requires no new tests or independent reading trial. Commit and push on the existing style PR branch.

## Links

| Resource | Link |
| --- | --- |
| Style PR | https://github.com/m2ux/workflow-server/pull/1641 |

## Validation

Source: `87b9bda45e453995352b5b420586832d5e1de45f`, compared with `5006038c6a076a9025458f06ccd1bdba99efdddd`.

Joined 133 standalone example paragraphs across 22 documents, with the placement rule updated in the existing guideline. Every inline code span, heading and raw invocation block in those documents is identical to the baseline. No standalone `eg` paragraph remains. The nine existing command-contract tests pass, the installed model checks 58 files with zero findings, and whitespace validation passes. No reading routes or executable behavior change; no live workflow is exercised.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Placement inventory](changes.json) | Every modified document, example count and preservation result |
