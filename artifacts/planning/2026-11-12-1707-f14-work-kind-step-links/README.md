# Work Kind Step Links — November 2026

> Delivery record · Created 2026-11-12

## Executive Summary

This record holds the delivery of hot-fix F14 into `workspace`. Each hot-fix operation and definition in the work-planner skill is linked from the step that uses it, and a hot-fix step with one caller is written in that caller, so a bundle compiled from a step carries the hot-fix content the step needs.

Work Kind keeps its Registration and the Populate Body and Validate Body operations, each step linking every supplying kind's operation by name. The shared check's "kind named in a general file" rule is retired; "kind module imported outside the registry" stays with `scripts/kinds.py`.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Test results](test-results.md) | The checks run for F14, the revision tested and each result |
| [Agent review](agent-review.json) | The review record of pull request #1708 at its reviewed head |
| [Review notes](review-notes.md) | The review's findings and their fixes |

## Links

| Resource | Link |
| --- | --- |
| Hot-fix | [F14](https://github.com/m2ux/workflow-server/issues/1707) |
| Pull request | [#1708](https://github.com/m2ux/workflow-server/pull/1708) |
