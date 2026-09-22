# GitNexus Scope Discipline Check Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::scope-discipline-check`, which takes the execution flows a diff reaches and holds them against the flows the work was meant to touch, collecting the ones outside it. The positive case takes the flows from a comparison against a fixed commit the workflow holds as a standing value and holds them against an empty intended scope, so the same flows arrive on every walk and every one of them is a finding, each with the changed symbol that reaches it. That commit sits far enough behind the indexed tip for the change set to hold indexed functions and not documentation headings alone, which is what gives the check a flow to find. The negative case takes them from the index, where nothing is staged, so the change set is empty, no flow is reached and the findings are empty — which is the fallback the run promises for a diff touching nothing, and which the report names as such. The two outcomes are distinct by construction: the positive case's findings are flows outside an empty scope, the negative case's emptiness is a change set reaching no flow.

The comparison reaches one flow, so the pair evidences the holding against scope and not the collecting of several.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::scope-discipline-check` twice, its steps splice into each activity under that activity's prefix, and its one output lands under the two names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `scope-discipline-check` | a comparison against a fixed commit, held against an empty intended scope |
| `negative-case` | `scope-discipline-check` | the index, where nothing is staged |
| `report-cases` | nothing — states what the two bindings landed | |
