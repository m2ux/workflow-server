# GitNexus Sequence Diagram Source Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::sequence-diagram-source`, which bounds a sequence diagram to what a change reaches — the execution flows it runs through — and reads the ordered step trace of each in a loop over the affected flows. The positive case bounds it to the whole diff, so the run reaches the flows the change runs through and lands a trace per flow. The negative case bounds it to the index, where nothing is staged, so the change set is empty, the loop runs no iteration and the diagram source stays empty — which is the fallback the run promises for a diff touching nothing, and which the report names as such rather than as a change whose flows carry no steps.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::sequence-diagram-source` twice, its steps and its loop splice into each activity under that activity's prefix, and its one output lands under the two names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `sequence-diagram-source` | the whole diff |
| `negative-case` | `sequence-diagram-source` | the index, where nothing is staged |
| `report-cases` | nothing — states what the two bindings landed | |
