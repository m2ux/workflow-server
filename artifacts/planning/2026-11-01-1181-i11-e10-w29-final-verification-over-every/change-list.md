# Change List — W29

> Plan changes this session applied and held · Recorded 2026-11-01

## Applied

- **Folded work: stash entries.**
  Delivery Branches gains Stash Entries, as the user decided through the coordinator: a session stashing names its entry by a unique message, restores it with `git stash apply` on its commit, and drops it once restored. It is a field of an artifact, not a labelled guide rule, so it takes no `rules.json` entry.
- **Folded work: skill check advisory.**
  AC24 now reads that the check runs on every pull request into the skills branch and reports there, as the user decided. The review pull request's Changes describe it as a check run on every pull request; no skill text or `verify-skills.yml` comment named it a gate.
- **Folded work: gitnexus repository name.**
  The live disclosure walk found no step naming where a `gitnexus://repo/{name}` resource's name comes from; debugging and CLI operations now name it.

## Held

- None.
