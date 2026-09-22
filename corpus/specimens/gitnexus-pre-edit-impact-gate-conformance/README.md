# GitNexus Pre-Edit Impact Gate Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::pre-edit-impact-gate`, which measures what a symbol's change would break before any edit lands and stops for a decision where the measurement rates it high or critical, or resolved no caller to rate it by. The gate is declared in the library's run, materialised into each activity with the reference site's prefix on its id, and presented, answered and recorded like a checkpoint written in the activity file. The positive case names a symbol with many callers, so the rating brings the run to the gate, the gate is answered with proceed, and the run lands the report with the edit approved. The negative case names a symbol the graph does not resolve, so the rating is withheld with a note saying why, the gate is presented all the same, and the negative case answers it with hold — so the run lands the edit refused, which is the fallback it promises for a symbol it cannot rate, and which the report names as a refusal rather than as a measured blast radius someone declined.

Both cases seed the approval true before the run, since a rating too low to reach the gate leaves the seed in place. The report tells the seed from an answered gate by the rating beside it.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::pre-edit-impact-gate` twice, its steps splice into each activity under that activity's prefix, its spliced gate is answered once each way, and its two outputs land under the names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `pre-edit-impact-gate` | a symbol with many callers, gate answered proceed |
| `negative-case` | `pre-edit-impact-gate` | a name the graph does not resolve, gate answered hold |
| `report-cases` | nothing — states what the two bindings landed | |
