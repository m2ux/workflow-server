# Recorded walks of this corpus

A walk drives these definitions through the real server and records what it saw. Those records live here so a later walk compares against this tree. The snapshot walks and the coverage walk run on pull requests to this branch.

This folder holds four kinds of record:

- **A roster** — which workflows a coverage walk drives, and which it leaves with a reason. A workflow on neither list is measured by nothing. `walks/check-roster.sh` checks the file against every `workflow.yaml` under `corpus/`, including those in grouping folders.
- **Snapshots** — paths, checkpoint decisions, artifacts written, manifest status.
- **A stamp** — the corpus commit those snapshots were recorded against. A mismatch fails with both SHAs named. Re-record it with `npm run baseline:stamp` in the same commit that re-baselines the walk.
- **A ratchet** — checkpoint options no walk reaches, grouped by the reason they stay unreached. A newly unreached option is not on the list and fails; an option that becomes reachable is on the list with nothing to explain it and also fails, so the list can only shrink.

Open the directory for the files as they stand. A walk pointed at this tree reads this folder.
