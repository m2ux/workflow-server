---
metadata:
  version: 1.0.0
---

## Capability

Open the run: fix the instant every branch's interval is read against, and settle how wide the instance fan will open.

## Outputs

### run_started_at

The instant this run began, as an ISO 8601 UTC timestamp.

### probe_budget

How many directories the instance fan probes.

## Protocol

### 1. Fix The Baseline

- Read the current instant and set `{run_started_at}` to it in ISO 8601 UTC. Every branch's own start is later than this one, so a branch reporting an earlier start is a clock the report must flag rather than average away.

### 2. Settle The Width

- Set `{probe_budget}` to the number of directories this run probes. Three is the default and is enough to show a batch; raise it only to test a wider one, and keep it at or under the server's fan ceiling, which refuses a wider destination at the moment the fan opens.
- Choose it here, before anything is surveyed. A width derived from the survey would make the run's cost depend on the component it happened to be pointed at.
