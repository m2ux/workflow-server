# Progress mode

Summarises a project board as a standup, in Slack markup for pasting into a channel: what completed,
what is in progress, and what is next. The board's Status is the source, so the summary is as
current as the board.

## Procedure

1. **Bring the board current.** When issues have closed or pull requests have merged since the
   board was last updated, run update mode first: the summary reads each item's Status as it stands.
2. **Find the board** by listing the owner's open boards. With several, ask the user which one. An
   organization's boards sit under `orgs/{owner}` in place of `users/{owner}`, as
   `gh api repos/{owner}/{repo} --jq .owner.type` shows.
3. **Fetch** the chosen board's Status field id, then its items with that field, which carry each
   issue whole. Fetch the pull requests that name an initiative, appending those of each further
   repository the board's issues live in with `>>`. The Commands below use board 2 and its Status
   field id; substitute the chosen board's.
4. **Summarise** with `scripts/progress.py --items items.json --prs prs.json`. The window opens at
   the start of the previous working day. Give `--since` for another, such as the last standup's
   date for a weekly update, and `--initiative I08` when the user names one initiative. It prints:
   - **Completed:** items Done whose issue closed in the window, grouped under their epic, and
     the tasks whose pull requests merged in it. Closing is when an issue became Done, so one the
     board caught up with later still falls on its closing date;
   - **In progress:** epics and task issues In Progress or In Review, each epic with its open pull
     requests, or else its next task;
   - **Next:** the five Ready items ranked by priority label, each epic with its next task, and a
     count of the rest.
5. **Report** the summary verbatim in a fenced block, so the user copies it unaltered, with any
   `unresolved` line it prints to stderr beneath: a dependency on an issue off the board, which
   reads as blocked, or an epic whose Work Breakdown cannot be read, summarised without its tasks;
   review mode fixes its body.

## Commands

```bash
gh api --paginate "users/{owner}/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | [.number, .title] | @tsv'
gh api --paginate "users/{owner}/projectsV2/2/fields?per_page=100" --jq '.[] | select(.name == "Status") | .id'
gh api --paginate "users/{owner}/projectsV2/2/items?per_page=100&fields=411749936" > items.json
gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I"))' > prs.json
gh api --paginate "repos/{owner}/{other}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I"))' >> prs.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/progress.py --items items.json --prs prs.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/progress.py --items items.json --prs prs.json --since 2026-09-21 --initiative I08
```
