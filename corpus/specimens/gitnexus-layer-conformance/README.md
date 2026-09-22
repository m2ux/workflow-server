# GitNexus Layer Conformance

A specimen of one form: a workflow that binds a library namespace's operations directly as its own steps, two of them over a graph layer the graph may not hold.

Four operations are bound, none through a run. The path trace and the import-cycle check answer from the call graph every index holds. The taint findings and the dependence query answer from the program-dependence layer, which a build records only when asked, and where the graph lacks it each answers with a note stating so inside a well-formed result rather than with an error. The same bag variable feeds both layer-reading operations under their own input names, and each answer lands under the name its step binds.

What the walk evidences is the binding and the layer's absence, not the paths or the findings. An operation declared in a library resolves under `gitnexus::<name>` from a step that names it, its inputs bind from this workflow's bag, and its declared output lands back in that bag — an answer stating the layer is absent landing exactly as findings would. The closing activity states, per operation, whether the answer is a measurement or the shape an absent layer leaves.

The graph answers are whatever the host checkout holds. Point it at a tree indexed with its program-dependence layers and every operation measures; point it at one indexed without them and the two layer readers land their notes.

| Activity | Binds |
|---|---|
| `trace-and-check` | `gitnexus::trace`, `gitnexus::check` |
| `read-the-layer` | `gitnexus::explain`, `gitnexus::pdg-query` |
| `report-conformance` | nothing — states what the two before it landed |
