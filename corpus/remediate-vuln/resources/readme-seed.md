---
name: readme-seed
description: Private vulnerability-remediation planning-folder README seed. The Links table is omitted so the advisory records no public pull request or issue.
metadata:
  version: 1.0.0
---

# Remediate Vulnerability README Seed

Fill data for [create-readme](/meta/techniques/workflow-engine/create-readme.md) with `{include_links}` false. Layout and policy live in [Planning Folder README Guide](/meta/resources/planning-readme.md) ([Template](/meta/resources/planning-readme.md#template)).

## Classifier

Header-line kind label: `Security`.

Lifecycle **Status** values: `Planning`, `In Progress`, `Complete`.

## Links defaults

The binding sets `{include_links}` false, so this table is not written.

| Resource | Link shape |
|----------|------------|
| — | — |

## Progress inventory

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Start | Private remote, security branch, planning folder | 15-30m | ⬚ |

Initial Status icons are from [Status vocabulary](/meta/resources/planning-readme.md#status-vocabulary). Later rows are the borrowed work-package activities, written by those activities as they run.

## Row ownership

Which activity owns which rows, per [row-ownership map](/meta/resources/planning-readme.md#row-ownership-map). Values are Item labels.

| @ | Rows |
|---|------|
| 01 | Start |

## Mode exclusion

No mode drops a row. This workflow does not review an existing pull request.
