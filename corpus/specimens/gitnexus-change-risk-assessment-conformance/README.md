# GitNexus Change Risk Assessment Conformance

A specimen of one form: one library run held to a positive case, a negative case and a third, so the measurement and each promised fallback are evidenced side by side.

The run is `gitnexus::change-risk-assessment`, which measures what reaches a symbol, reads the graph's flow inventory, measures what the diff moved and weighs the three into the one rating a reviewer acts on. The positive case names `composeLoaded`, a symbol the graph holds, so the impact half lands its dependents and the verdict rests on the blast radius and the diff together. The negative case names a symbol no graph holds, so the impact half resolves nothing and the verdict rests on the diff's rating alone, saying that its caller set is hand-derived — which is the fallback the run promises for a symbol outside the index, and which the report names as such rather than as a symbol measured and found unreached. Both cases take the diff from a comparison against a fixed commit the workflow holds as a standing value, so the diff half measures one change under both bindings, that change is the same on every walk, and what differs between the rows is the impact half. The commit sits far enough behind the indexed tip that `composeLoaded` is among the symbols the comparison moved, so the symbol the impact half measures is one the diff half also names.

The empty-diff case names `composeLoaded` again and takes the diff from the index, where nothing is staged, so the impact half measures a resolving symbol while the diff half lands no changed symbol. The verdict then rests on the symbol's rating alone and states that the diff rating is absent — the fallback the run promises for a diff that moved nothing, which the report names as such rather than as a change measured and found to touch nothing. What differs between this row and the negative one is which half fell away: the negative case lost the impact half to a symbol outside the index, and this case loses the diff half to a change set that is empty.

The positive and empty-diff cases land the same verdict. The reconciliation resolves to the higher of the two inputs, and the symbol rates above the diff in both, so the case evidences the weighing only where a diff rates above the symbol it is weighed against.

What the walk evidences is the reference under three bindings: the same run resolves under `gitnexus::change-risk-assessment` three times, its steps — three measurements chained into a judgement — splice into each activity under that activity's prefix, and its one output lands under the three names the reference sites bind. The closing activity reports all three against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `change-risk-assessment` | a symbol the graph holds |
| `negative-case` | `change-risk-assessment` | a symbol no graph holds |
| `empty-diff-case` | `change-risk-assessment` | a held symbol over an index holding nothing staged |
| `report-cases` | nothing — states what the three bindings landed | |
