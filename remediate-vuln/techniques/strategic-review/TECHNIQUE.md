---
metadata:
  version: 1.0.0
---

## Capability

Review the security fix to ensure changes are minimal, focused, and free of investigation artifacts; maintain the changelog fragment; re-sign unsigned commits when requested; and summarize the architecture for stakeholders — all while keeping history and pushes on the private `security` remote. This group decomposes the review into ordered operations: [review-scope](./review-scope.md), [resign-commits](./resign-commits.md), [verify-fragment](./verify-fragment.md), [document-findings](./document-findings.md), [recommend-cleanup](./recommend-cleanup.md), [apply-cleanup](./apply-cleanup.md), and [summarize-architecture](./summarize-architecture.md).

## Inputs

### review_findings

Findings produced by the scope and artifact review of the security fix — scope creep, over-engineering, investigation artifacts, and orphaned infrastructure.

## Outputs

### strategic_review_doc

Strategic review findings and recommendations for the security fix.

#### artifact

`strategic-review-{n}.md`

## Rules

### minimal-focused-changes

The goal is minimal, focused changes — every change must be justified by the vulnerability remediation requirements.
