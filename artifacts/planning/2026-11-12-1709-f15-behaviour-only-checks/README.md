# Behaviour-Only Checks — November 2026

> Delivery record · Created 2026-11-12

## Executive Summary

This record holds the delivery of hot-fix F15 into `workspace`: remediation items 1–8 of the [I17 E02 review guide](../2026-11-12-1615-i17-e02-review-guide/README.md#remediation), plus `test_hotfix_readiness.py` and `test_deliver.py`'s shared-rule source scan. The work-planner skill's checks and tests exercise behaviour alone: script runs on captures and fixtures, and link-structure checks.

The shared check keeps "executable step in Fields" and loses its before-use, Fields-candidate and kind-import passes. The guidelines lose Policy Review and Boundary review. `deps.py` reads a Component line as a comma-separated list of whitespace-free `branch:path` entries, progress.py writes its hot-fix key itself, and tests that quote skill prose, walk Advance step 6 or Review Hot-fix Before Merge, or scan script source for kind names or pattern copies are gone.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Test results](test-results.md) | The checks run for F15, the revision tested and each result |
| [Agent review](agent-review.json) | The review record of pull request #1710 at its reviewed head |
| [Review notes](review-notes.md) | The review's findings and their fixes |

## Links

| Resource | Link |
| --- | --- |
| Hot-fix | [F15](https://github.com/m2ux/workflow-server/issues/1709) |
| Pull request | [#1710](https://github.com/m2ux/workflow-server/pull/1710) |
