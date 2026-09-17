# Delivery cost: readings from a specimen walk

Raw readings behind the delivery-cost issue. One walk of the `routine-conformance` specimen against the `workflow-server-exp` sidecar over the MCP transport, on 17 September 2026, engine and corpus both from the branches for issue 795.

The specimen's activities hold between one and four steps, which is the smallest case in the corpus and therefore the one where a fixed per-delivery cost shows largest. Every ratio below should be read against that.

## What was walked

Two sessions. The first walked the client directly: `plan-probes`, `count-pass`, `size-pass`, `report-conformance`, four activities to terminal. The second opened a fresh client and drove it from the meta workflow's dispatch activity, so each of the same four activities was one pass of that activity's own loop.

## Delivery sizes

| Call | Context | Mode | Response size |
|---|---|---|---|
| `get_workflow` on the client | orchestrator | — | 83,275 chars, over the tool-result limit |
| `get_activity` plan-probes | fresh worker | full | 40,284 chars |
| `get_activity` count-pass | fresh worker | full | 42,943 chars |
| `get_activity` size-pass | same worker | reference | +6,585 chars |
| `get_activity` report-conformance | same worker | reference | +10,154 chars |

Sizes for the reference rows are the increase in the context's cumulative `delivered_chars`, which is how the batch block reports it.

`plan-probes` is a one-step activity whose definition runs to about twenty-five lines. Its definition is under three per cent of the response that carried it. The remainder is the operations bundle — seven techniques — and a rules list of roughly thirty-five entries.

## What arrived more than once

Within one response, the three specimen rules appeared under the top-level rules list and again nested under the measuring step's own rules. Under reference delivery the nested copy collapsed to a content hash; under full delivery both were sent whole.

Also within one response, the same three inherited input descriptions — the host repository path, the component path and the planning folder path — appeared under four separate techniques.

Across responses to one context, the delivery notes did not collapse. In the reference-mode responses every technique and the entire rules block arrived as content hashes while the step-techniques note, roughly fourteen hundred characters, arrived verbatim, as did the bundle note and the resources note.

## What arrived that the activity could not use

Every delivery carried the checkpoint-yield and checkpoint-resume protocols in full. The specimen declares no checkpoint in any activity. Every delivery also carried the rule governing how a fanned branch lands its outputs, to activities whose exits fan onto nothing.

## Contract observations

The advance call takes its completed-step list as `step_manifest`. An attempt using `completed_steps`, the spelling one of the engine's own tests uses, was answered with a warning that no manifest had been provided.

A loop body run three times was reported with one manifest entry per step rather than three, and accepted without comment. Nothing delivered to the walk states which is expected.

The batch block reported two activities taken for a worker context that had been advanced onto its third. Two of that context's activity fetches had been skipped, so the figure tracks deliveries rather than activities.

## What the walk did not reach

The batch boundary, because the worker never reached its bound — a consequence of the skipped fetches above. The post-activity persist step, which was declined throughout rather than run against the repository. The fan, checkpoint-yield and checkpoint-resume branches, none of which the specimen's graph or steps can reach.
