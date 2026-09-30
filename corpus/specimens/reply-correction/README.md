# Reply Correction Workflow

A draft put to the reader at a gate with two options. `accept` ends the walk. `revise` records the text the reader types into `draft_correction` and exits `revise`, which the graph binds back to `draft`.

The re-run's technique reads `draft_correction` as an optional input, so the correction reaches the next draft through the bag. `respond_checkpoint` refuses `revise` without a `reply`, and refuses a `reply` with `accept`.

Walk it as `workflow_id: reply-correction`.

## Copying from it

Take this when a gate's option carries text the next pass applies. It holds one activity, one technique step and one blocking checkpoint. A soft gate, a fan or a second activity belongs on a different specimen.
