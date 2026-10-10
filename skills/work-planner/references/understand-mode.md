# Understand Mode

Explains a pull request's changes to the engineer who reviews them. The mode measures the change over the repository's graph, writes an [architecture overview](architecture-overview.md) into a planning record of its own, and links that overview from the pull request's References. [Sync Mode](sync-mode.md) runs it for each task and epic it sets In Review, and the user runs it against a pull request they name.

## Procedure

1. **Take the pull request.**
   - The request names the pull request, by number or by URL. Run from [Sync Mode](sync-mode.md), it is the one behind the issue moving to In Review, as this mode's Grain rule states.
   - [Fetch Pull Request](commands.md#fetch-pull-request) for its title, its base branch and its head commit. Every code reference the overview carries is pinned to that head commit.
2. **Bound the change.**
   - [Create Pull Request Worktree](commands.md#create-pull-request-worktree) cuts a worktree at the head commit, which is where the graph reads the change.
   - [Fetch Pull Request Files](commands.md#fetch-pull-request-files) for the files it changes.
3. **Ready the graph.**
   - [Index Status](commands.md#index-status) in that worktree. Where it reports the repository unindexed, or the index behind the head commit, [Index Repository](commands.md#index-repository) brings it current.
   - A measurement read off a stale index describes a structure the reviewer will not find, as this mode's Fresh index rule states.
4. **Measure the structure.**
   - [Change Surface](commands.md#change-surface) reports the symbols the change touches and the flows they sit in.
   - [Symbol Context](commands.md#symbol-context) for each changed symbol reports its callers, its callees and the files they sit in. The areas those files group into are the component diagram's subgraphs, and the edges between them are its arrows.
5. **Measure the behaviour.**
   [Flow Trace](commands.md#flow-trace) for each flow [Change Surface](commands.md#change-surface) names reports that flow's symbols in step order. Each trace is one sequence diagram, and its participants are the areas step 4 grouped.
6. **Open the record.**
   [Add Planning Record](commands.md#add-planning-record), with the pull request's number as the ref and a slug from its title.
7. **Write the overview.**
   Write `architecture-overview.md` into the record from what steps 4 and 5 report, to the [Architecture Overview](architecture-overview.md) guide.
8. **Write the README.**
   Write the record's README.md as the [planning README](planning-readme.md) states: the overview is its one Artifacts row, and the pull request is a row under Links.
9. **Publish.**
   Commit and push the engineering worktree, so the overview resolves from the engineering branch before the pull request links it.
10. **Link it.**
    - Add the References row to the pull request's body, as this mode's Reference row rule states, and write the body with [Patch Pull Request Body](commands.md#patch-pull-request-body).
    - A body carrying no References section takes one, in the place the [pull request template](../templates/pull-request.md) gives it.
11. **Report.**
    The pull request, the record folder, the diagrams the overview carries, and the References row.

## Rules

- **The pull request is named.**
  The request names it, or the mode asks for it and runs no further. A pull request taken from the branch in hand is a guess, and an overview of the wrong change reads as an overview of the right one.
- **Grain.**
  - A task In Review takes the open pull request that names it.
  - An epic In Review takes its [review pull request](work-breakdown.md#review-pull-request), and its overview is drawn over the epic base at the altitude the epic delivered, rather than over its tasks one by one.
  - An initiative takes none. Its epics' review pull requests each carry their own overview.
- **Fresh index.**
  Every measurement is read at the head commit, from an index current with it. A response reporting the index behind sends the run back to [Index Repository](commands.md#index-repository), and its numbers are discarded.
- **Measured structure.**
  The areas, their members and each flow's step order are the graph's, as steps 4 and 5 measure them, which SKILL.md's Measured claims rule requires of a chain. A sequence traced by hand is a defect.
- **One overview per pull request.**
  The record's ref segment is the pull request's number, so a re-run finds the folder and replaces the overview in it. A References row already naming the overview stays as it is.
- **Reference row.**
  The row links the overview by name, under the engineering-artifacts base URL on the engineering branch, so the files the record takes later resolve from the same link:

  ```markdown
  - **R1.** [Architecture Overview](https://github.com/{owner}/{repo}/tree/engineering/artifacts/planning/2026-10-08-950-queue-placement/architecture-overview.md) — the change's structure, its flows, and the order to read the diff.
  ```
