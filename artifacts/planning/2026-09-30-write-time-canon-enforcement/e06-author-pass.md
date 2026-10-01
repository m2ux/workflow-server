# Author pass

Corpus branch point `7fae6cb3`. Engine `i09/main` at `7dc26dba`. One file: `corpus/support/conformance/techniques/prepare-unbuilt-fixture.md`. The `## Outputs` contract is unchanged, so the re-walk adds no I/O closure.

The defect under fix is one sentence added to `## Capability`: `It does not use inline content.`

The constructs that sentence writes are `technique.capability`. [List units for a construct](e06-list-capability.txt) prints 85 units. The pass loads those and no others. `AP-41. avoidance-voice-in-definitions` is in the list. `AP-05. atomic-checkpoints`, which declares only `activity.steps`, is not. Principle 17 is not. AP-41's Fix names that principle; the pass follows the Fix's rewrite and does not load the principle.

Round 1. AP-41 fires. Its Detect matches avoidance voice in `technique.capability`, and its Do not flag does not excuse this sentence. One `fix` finding. It is closed before any report: the sentence is deleted, and the capability paragraph is again the branch-point sentence, which states what the technique does now.

The re-walk is that paragraph, line 8, and not the Outputs section. AP-41 does not fire on it.

Round 2 has no `fix` finding. The count fell from 1 to 0, so the pass does not stop.
