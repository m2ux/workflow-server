# GitNexus Layer Conformance

A specimen of one form: a workflow that binds a library namespace's techniques directly as its own steps, two of them over a graph layer the graph may not hold.

Four techniques are bound, none through a run. The path trace and the import-cycle check answer from the call graph every index holds. The taint findings and the dependence query answer from the program-dependence layer, which a build records only when asked, and where the graph lacks it each answers with a note stating so inside a well-formed result rather than with an error. The same bag variable feeds both layer-reading techniques under their own input names, and each answer lands under the name its step binds.

Every step addresses a named graph. The graph name sits in the bag under the name the library declares for it, so a step binds it without an entry of its own, and an activity that addresses a different graph writes that name before its reads.

The two layer readers are bound twice, once per graph, so both sides of the layer are evidenced. Over `workflow-server`, indexed with its program-dependence layers, each lands what the layer records. Over `midnight-wallet`, built without them, each lands an empty answer carrying the note that names the build recording those layers. Two answers of one shape therefore have two readings, and the graph is what separates them.

The two `explain` readings land the same empty finding list, the graph holding the layer recording none: only the note separates them. The `pdg-query` pair carries the measurement, its control-dependence edges standing against an empty answer.

What the walk evidences is the binding and the layer's absence, not the paths or the findings. A technique declared in a library resolves under `gitnexus::<name>` from a step that names it, its inputs bind from this workflow's bag, and its declared output lands back in that bag — an answer stating the layer is absent landing exactly as findings would. The closing activity states, per technique and per graph, whether the answer is a measurement or the shape an absent layer leaves.

| Activity | Binds |
|---|---|
| `trace-and-check` | `gitnexus::trace`, `gitnexus::check` |
| `read-the-layer` | `gitnexus::explain`, `gitnexus::pdg-query`, over the graph holding the layer |
| `read-the-absent-layer` | `gitnexus::explain`, `gitnexus::pdg-query`, over the graph built without it |
| `report-conformance` | nothing — states what the three before it landed |
