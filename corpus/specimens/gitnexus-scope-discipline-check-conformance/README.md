# GitNexus Scope Discipline Check Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::scope-discipline-check`, which takes the execution flows a diff reaches and holds them against the flows the work was meant to touch, collecting the ones outside it. The positive case takes the flows from the whole diff and holds them against an empty intended scope, so every flow the change reaches is a finding, each with the changed symbol that reaches it. The negative case takes them from the index, where nothing is staged, so the change set is empty, no flow is reached and the findings are empty — which is the fallback the run promises for a diff touching nothing, and which the report names as such. The two outcomes are distinct by construction: the positive case's findings are flows outside an empty scope, the negative case's emptiness is a change set reaching no flow.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::scope-discipline-check` twice, its steps splice into each activity under that activity's prefix, and its one output lands under the two names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `scope-discipline-check` | the whole diff against an empty intended scope |
| `negative-case` | `scope-discipline-check` | the index, where nothing is staged |
| `report-cases` | nothing — states what the two bindings landed | |
