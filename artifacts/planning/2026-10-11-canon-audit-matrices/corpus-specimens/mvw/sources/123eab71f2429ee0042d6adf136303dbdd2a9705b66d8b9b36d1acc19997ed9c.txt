---
metadata:
  version: 1.2.0
---

## Capability

State what the api-surface-review run landed under its positive and negative bindings.

## Inputs

### positive_repo_name

The graph the positive case's reads addressed.

### negative_repo_name

The graph the negative case's reads addressed.

### positive_route_inventory

Each route with the file handling it, the middleware chain wrapping that handler, and the components and hooks that fetch it.

### positive_shape_report

Per route, the top-level keys its response carries, the keys each consumer reads, and whether the two agree — empty, the check covering only routes with a consumer and no route in the positive case's tree having one.

### negative_route_inventory

Each route with the file handling it, the middleware chain wrapping that handler, and the components and hooks that fetch it.

### negative_shape_report

Per route, the top-level keys its response carries, the keys each consumer reads, and whether the two agree.

## Outputs

### api_surface_review_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-api-surface-review-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive against `{positive_route_inventory}` and `{positive_shape_report}`, named `{positive_repo_name}`, and the negative against `{negative_route_inventory}` and `{negative_shape_report}`, named `{negative_repo_name}` — per [Template](/conformance/resources/case-report.md#template).
   > The two cases address different graphs, so each row names its own rather than the header naming one for both.
   > An empty `{negative_route_inventory}` is a graph that resolved and holds no route; the row names that fallback rather than reading the tree's surface as mapped and consistent.
   > `{positive_shape_report}` and `{negative_shape_report}` are both empty, the check covering only routes with a consumer; each row names its inventory as what separates the two cases, rather than reading a route as agreeing with its consumers.

### 2. Write the Report

- Write `{api_surface_review_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
