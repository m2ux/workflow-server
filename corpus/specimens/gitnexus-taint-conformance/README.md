# GitNexus Taint Conformance

A specimen of one form: a workflow that holds no operations of its own and reaches a run whose answers come from a graph layer the graph may not hold.

The run reads a diff, iterates its changed symbols, reads the taint findings recorded for each one's file, and closes on a judgement separating the flows the change opened from the ones it inherited. The findings come from the program-dependence layer, which a build records only when asked, so the run lands one thing more than its partition: a flag saying whether the layer was there at all.

What the walk evidences is the reference and the flag, not the findings. A run declared in a library resolves under `gitnexus::<name>`, its steps splice into the referring activity carrying that activity's prefix, and its declared outputs land in this workflow's variable bag under the names the reference site binds — including the flag, so that two empty lists over an absent layer read as unmeasured and not as a clean diff. The closing activity states which of the two this run was.

The graph answers are whatever the host checkout holds. Point it at a tree indexed with its program-dependence layers and the run partitions real findings; point it at one indexed without them and the flag is what lands.

| Activity | Refers to |
|---|---|
| `pass-taint` | `diff-taint-pass` |
| `report-conformance` | nothing — states what the run before it landed, and whether the layer was there |
