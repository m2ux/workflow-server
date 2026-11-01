# The canon suite states its prerequisite — November 2026

> Delivery record · Created 2026-11-01

## Executive Summary

This record holds the delivery of I11:E10 W12: W12 (The canon suite states its prerequisite). It covers AC18. The Workflow Canon audit tests skip while `CANON_TEST_ENGINE` is unset, and the skill's Dependencies name the engine checkout that variable points at.

E10 brings every house rule the skill states to a check that decides it, so conformance is measured rather than remembered. A suite that fails on an absent prerequisite reads as a regression, so a contributor cannot tell an environment gap from a break they caused.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W12 work item](w12.md) | Component, scope, design and test rows for W12 |
| [Test evidence](tests.md) | Each check run for the unit, with its output |
| [Change list](changes.md) | Each plan change the session applied or held |

## Links

| Resource | Link |
| --- | --- |
| Epic | [I11:E10](https://github.com/m2ux/workflow-server/issues/1181) |
| Pull request | [#1553](https://github.com/m2ux/workflow-server/pull/1553) |
