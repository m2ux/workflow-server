---
metadata:
  version: 1.0.0
---

## Capability

Hold each API route's response shape against the keys its consumers read, and report where the two disagree.

## Inputs

### route_path

*(optional)* Restricts the check to one route, such as `/api/grants`. Absent, every route with both a detected response shape and a consumer is checked.

## Outputs

### shape_report

Per route, the top-level keys its response carries, the keys each consumer reads, and whether the two agree.

## Protocol

1. Call `gitnexus_shape_check { route: route_path, repo: repo_name }` and record the `{shape_report}`.
2. Read the answer as covering the routes whose response keys the index extracted and which have a consumer: a route the walk read no response shape from is absent from the report entirely, so an absent route is an unmeasured one rather than an agreeing one.
3. Read a disagreement as a consumer reading a key the route does not return, which is a break already present or one a reshape is about to widen.
