---
metadata:
  version: 2.2.0
---

## Capability

Scope-disciplined strategic review of the implementation — findings, changes-folder hygiene, and cleanup of investigation artifacts.

## Inputs

### branch_name

The feature branch the change under review sits on.

### changed_files

The set of files the change touches — the authored surface every finding is scoped to.

### requirements

The work-package requirements the change is judged as minimal against.

### planning_folder_path

The work package's planning folder.

### target_path

The target repository root the change was made in.

### pr_number

The pull request number, where one is open.

## Outputs

### strategic_review_doc

Strategic review [findings](../../resources/strategic-review.md#strategic-review-artifact-template) and recommendations

## Rules

### minimal-focused-changes

The goal is minimal, focused changes — every change must be justified by a requirement.

### heightened-review-conditions

The review matters most when the implementation involved significant investigation or debugging, multiple approaches were tried, infrastructure or tooling changes were made during development, or the final solution is simpler than initially anticipated.

### finding-categories

Classify every review finding into one of three categories:

- **Investigation Artifacts** — changes made while understanding the problem: extra logging or print statements, verbose error messages for debugging, temporary workarounds that were superseded, exploratory test configurations.
- **Over-Engineering** — solutions that grew beyond what was needed: generic abstractions for specific problems, fallback mechanisms for cases that can't occur, unused configuration options, infrastructure for features not implemented.
- **Orphaned Infrastructure** — supporting changes that outlived their purpose: commented-out code, unused utilities, duplicate functionality, CI job dependencies added for failed approaches, environment variables for abandoned features, build steps for removed functionality, unnecessary wait/synchronization logic.
