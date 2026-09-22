# GitNexus API Surface Review Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::api-surface-review`, which names the graph covering a tree, maps the API routes that graph serves and holds each route's response shape against the keys its consumers read. The shape check covers only routes with both an extracted response shape and a consumer. The positive case names the workflow-server tree, whose graph serves routes that nothing in the tree fetches, so the run lands a route inventory over them and an empty shape report. The negative case prepares a throwaway checkout of source serving no route, so the run builds its graph and both reads land empty — which is the fallback the run promises for a tree that serves no API, and which the report names as such rather than as a surface mapped and found consistent. An empty inventory, under a graph that resolved, is what says so.

The run's third output is the graph it addressed, and both reference sites bind it under the one name `repo_name`, so after the run the bag holds the graph the later case resolved and the report's header names it.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::api-surface-review` twice, its steps — a nested reference to the graph-naming run followed by two reads — splice into each activity under that activity's prefix, and its outputs land under the names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

The walk lands no shape comparison. No route either case binds has a consumer, so agreement and disagreement between a response shape and the keys a consumer reads each go unexercised, and a pass over these two cases is not coverage of them.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `api-surface-review` | a tree whose graph serves routes, none of them fetched |
| `negative-case` | `api-surface-review` | a prepared checkout serving no route |
| `report-cases` | nothing — states what the two bindings landed | |
