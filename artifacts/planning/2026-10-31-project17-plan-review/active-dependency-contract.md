# Active producer dependencies

User selected A: narrow active whole-epic dependencies to actual producers; preserve historical records.

## Live inventory and correction

- Inspected all task rows in six open I11 epics: E09, E10, E13, E14, E16 and E17.
- One active task edge named a whole epic: E09 W03 → E08.
- E09 W03 now depends on E08:W02, which produces the reservation/hold signal consumed by reservation-aware board status. E08 W01 supplies board advancement transitively through W02; a second direct edge would be redundant.
- E08 W02 was delivered by PR #1164, merged into workspace on 2026-10-06 at 5808135bd68505c3e39769eab294a6440bb9592a. Its delivered capture/dispatch code and reservation fixtures establish the producer.
- This correction makes the consumption explicit. The producer is already delivered, so it creates no new pending gate and does not dispatch work or move board status.
- Task IDs, criteria, coverage, Joins and completion states remain intact. No initiative-level dependency is introduced: only this consumer needs that producer, not every E09 task.

## Historical boundary and validation

- Nine whole-epic task edges remain in completed historical epics. Those bodies are retained as requested and reported separately; the entire historical graph is not claimed clean.
- [Current open-epic snapshots and dependency result](active-dependencies/) contain no active task graph problem or dependency cycle. F08 is resolved for active work; historical normalization is outside this decision.
- E09 format retains only the cancelled-AC1 numbering gap. Surviving criterion IDs remain stable.

Published E09 body matches exact live readback.
