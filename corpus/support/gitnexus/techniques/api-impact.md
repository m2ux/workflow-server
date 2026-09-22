---
metadata:
  version: 1.2.0
---

## Capability

Pre-change report for an API route handler — what consumes the route, which response fields those consumers read, what middleware guards it, and the execution flows it opens.

## Inputs

### route_path

*(optional)* The route the report is addressed at, such as `/api/grants`.

### handler_file

*(optional)* The handler file the report is addressed at, where the route path is not to hand.

### http_method

*(optional)* The HTTP verb — `GET`, `POST`, `PUT`, `PATCH`, `DELETE` — narrowing a URL or file that serves several verbs to one route.

## Outputs

### api_impact_report

The route's consumers, the response keys each reads, the middleware wrapping the handler, the execution flows it opens, and a risk level over the whole. One route is one report; several matching routes arrive as `routes` with their `total`, each carrying its `method` — the verb, `*` for a method-agnostic route, or null for a method-less one — and its `runtimeEvidence`, authoritative only where `confirmed` is true.

#### mismatches

Consumers reading a key the route's response does not carry, each with the confidence the attribution earns. The key rides an answer that holds one and is absent otherwise, never an empty list, so its presence alone is the question "does this change break a reader" already answered.

#### impactSummary

`directConsumers` and `affectedFlows` counts, and the `riskLevel` they add up to: `LOW` for a route with up to three consumers, `MEDIUM` for four to nine or for any mismatch, `HIGH` for ten or more consumers or a mismatch read by four or more. The rating sits here rather than at the report's root, so a read addressed at the answer's top level finds nothing.

## Protocol

### 1. Take the Impact Report

- Call `gitnexus_api_impact { route: route_path, file: handler_file, method: http_method, repo: repo_name }` and record the `{api_impact_report}`.
   > - The call answers for a route or for a file, so one of the two travels with it; naming neither answers about nothing.
   > - Where the path matches several routes the answer is the set rather than one report — one URL serving two verbs is two routes — and the route to change is chosen from it, or named by `{http_method}`, before the report is read. A URL that exists with no route for the verb named answers with an error.

### 2. Read a Mismatch

- Read a mismatch as a consumer that will break on the change rather than as one already broken: it reads a key the route does not return today, which a rename or a reshape is about to make true of more of them.
   > A mismatch the report marks low-confidence comes from a consumer file fetching several routes, so which route the key belongs to is attributed rather than known. Confirm it against the consumer before counting it.

### 3. Read the Risk Level

- Read `{api_impact_report}.impactSummary.riskLevel` as the consumer count and the mismatches together — a route nothing outside the module fetches is a different change from one a dozen components read.
