# Command Tag Escaping — November 2026

> Revision record · Created 2026-11-06

## Executive Summary

Command placeholder labels render as visible linked text. Literal angle brackets in HTML invocation payloads use entities so placeholders and shell syntax cannot become HTML tags.

The revision fixes the reported Delivery Plan command and every matching invocation, with shared validation and rendered/decoded preservation evidence. The approved I17 readiness/refusal planning follows this correction as separate work.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Plan](plan.md) | Defect, scope and validation |
| [Original Invocations](before.json) | All 116 command payloads and actual rendered placeholder tags |

## Links

| Resource | Link |
| --- | --- |
| Integration PR | https://github.com/m2ux/workflow-server/pull/1641 |

## Validation

[Validation](validation.md), [rendered/decoded inventory](after.json), [verification script](verify.py), [shared suite](shared.log) and [planner suite](planner.log).
