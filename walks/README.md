# Recorded walks of this corpus

A walk drives these definitions through the real server and records what it saw. Those records live here so a later walk compares against this tree rather than against a copy on `main`. The snapshot walks and the fourteen-workflow coverage walk run on pull requests to this branch.

## Contents

- [`snapshot.test.ts.snap`](snapshot.test.ts.snap) — the committed walk snapshots: paths, checkpoint decisions, artifacts written, manifest status.
- [`corpus-sha.json`](corpus-sha.json) — the corpus commit those snapshots were recorded against. A mismatch fails with both SHAs named. Re-record it with `npm run baseline:stamp` in the same commit that re-baselines the walk.
- [`option-coverage.json`](option-coverage.json) — checkpoint options no walk reaches, grouped by the reason they stay unreached. A newly unreached option is not on the list and fails; an option that becomes reachable is on the list with nothing to explain it and also fails, so the list can only shrink.

The walker, the policies and the snapshot tests live on `main` under `tests/e2e/`. They read this folder of the tree they were pointed at.
