---
metadata:
  version: 1.0.0
---

## Capability

Pre-change report for an API route handler — what consumes the route, which response fields those consumers read, what middleware guards it, and the execution flows it opens.

## Inputs

### route_path

*(optional)* The route the report is addressed at, such as `/api/grants`.

### handler_file

*(optional)* The handler file the report is addressed at, where the route path is not to hand.

## Outputs

### api_impact_report

The route's consumers, the response keys each reads, the middleware wrapping the handler, the execution flows it opens, and a risk level over the whole.

#### mismatches

Consumers reading a key the route's response does not carry, each with the confidence the attribution earns.

## Protocol

### 1. Take the Impact Report

- Call `gitnexus_api_impact { route: route_path, file: handler_file, repo: repo_name }` and record the `{api_impact_report}`.
   > - The call answers for a route or for a file, so one of the two travels with it; naming neither answers about nothing.
   > - Where the path matches several routes the answer is the set rather than one report, and the route to change is chosen from it before the report is read.

### 2. Read a Mismatch

- Read a mismatch as a consumer that will break on the change rather than as one already broken: it reads a key the route does not return today, which a rename or a reshape is about to make true of more of them.
   > A mismatch the report marks low-confidence comes from a consumer file fetching several routes, so which route the key belongs to is attributed rather than known. Confirm it against the consumer before counting it.

### 3. Read the Risk Level

- Read the risk level as the consumer count and the mismatches together — a route nothing outside the module fetches is a different change from one a dozen components read.
