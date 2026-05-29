# cypher

Run a custom Cypher query over the GitNexus graph.

## Inputs

### repo_name

Repository name

### query

Cypher query string. Graph schema for query authoring — **Nodes:** `File`, `Function`, `Class`, `Interface`, `Method`, `Community`, `Process`. **Edges** (via `CodeRelation.type`): `CALLS`, `IMPORTS`, `EXTENDS`, `IMPLEMENTS`, `DEFINES`, `MEMBER_OF`, `STEP_IN_PROCESS`.

## Procedure

1. Call `gitnexus cypher({ repo_name, query })`.
