# GitNexus Package Diagram Source Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::package-diagram-source`, which bounds a package diagram to what a change reaches — the functional areas its flows and files run through — and reads the members of each. The positive case takes the change from the whole diff, so the change set names files and flows, the selection picks the areas they run through, and the run lands each area with its members. The negative case takes the change from the index, where nothing is staged, so the change set is empty, the selection picks no area, and the run lands an empty structure — which is the fallback the run promises for a change that reaches nothing, and which the report names as such rather than as areas the run reached and found bare.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::package-diagram-source` twice, its steps splice into each activity under that activity's prefix, its member walk iterates once per selected area, and its one output lands under the two names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `package-diagram-source` | the whole diff |
| `negative-case` | `package-diagram-source` | the index, with nothing staged |
| `report-cases` | nothing — states what the two bindings landed | |
