---
metadata:
  version: 1.3.0
---

## Capability

Hold each API route's response shape against the keys its consumers read, and report where the two disagree.

## Inputs

### route_path

*(optional)* Restricts the check to one route, such as `/api/grants`. Absent, every route with both a detected response shape and a consumer is checked.

## Outputs

### shape_report

Per route, the top-level keys its response carries, the keys each consumer reads, and whether the two agree; each route carries its `method` — the verb, `*` for a method-agnostic route, or null for a method-less one — and its `runtimeEvidence`, authoritative only where `confirmed` is true.

## Protocol

### 1. Take the Shape Report

- Call `gitnexus_shape_check { route: route_path, repo: repo_name }` and record the `{shape_report}`.
   > A graph built before the `method` property existed fails the read with a binder error naming it rather than answering empty — too old to serve this operation, which a rebuild fixes.

### 2. Read What the Answer Covers

- Read the answer as covering only routes with both an extracted response shape and a consumer: an absent route is unmeasured, not agreeing.

### 3. Read a Disagreement

- Read a disagreement as a consumer reading a key the route does not return, which is a break already present or one a reshape is about to widen.
