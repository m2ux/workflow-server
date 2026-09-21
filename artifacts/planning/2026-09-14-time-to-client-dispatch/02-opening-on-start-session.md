# Opening lives on start_session

The catalog ranker, resume lexicon, and host bind already run inside `start_session`. A second MCP tool that returns the same ranked ids, and three meta activities that re-derive the same facts, are a parallel opening path. This cut removes those paths.

## Engine

`rankWorkflows` stays. `start_session` uses it for unique embed and for `workflow-selection`. `list_workflows` remains the catalog dump. There is no `discover_workflow` tool.

## Meta graph

```
initialActivity: dispatch-client-workflow
dispatch-client-workflow → end-workflow
```

`start_session` seeds `client_session_index`, `client_initial_activity`, host facts, and `target_workflow_id`. Unique fresh requests walk the **child**. An agent that stays on meta drives the already-open client through `dispatch-client-workflow`. A meta session with no client index fails that activity's validate.

Deleted with the opening activities: `match-target-workflow`, `scan-saved-sessions`, `detect-resume-intent`, `match-saved-session`, `extract-identifying-context`, `derive-initiative-name`. Kept: `create-session` (documents `dispatch_child`), `resume-intent-lexicon` (server vocabulary).

## Merge

Engine tests that load live meta assert `dispatch-client-workflow` and `end-workflow`, which both graphs contain, so #720 can land against today's dest. Corpus #721 then retires the three opening activities.
