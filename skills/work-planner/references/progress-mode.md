# Progress mode

Summarises a project board as a standup, in Slack markup for pasting into a channel: a paragraph for management on what the window accomplished, then what completed, what is in progress, and what is next. The board's Status is the source, so the summary is as current as the board.

## Procedure

1. **Bring the board current.** When issues have closed or pull requests have merged since the board was last updated, run update mode first: the summary reads each item's Status as it stands.
2. **Find the board** by listing the owner's open boards. With several, ask the user which one.
3. **Fetch** the chosen board's Status field id, then its items with that field, which carry each issue whole. Fetch the pull requests that name an initiative, appending those of each further repository the board's issues live in with `>>`. The Commands below use board 2 and its Status field id; substitute the chosen board's.
4. **Summarise** with `scripts/progress.py --items items.json --prs prs.json`. The window opens a week before today. Give `--since` for another, such as the previous working day for a daily standup, and `--initiative I08` when the user names one initiative, or `owner/repo:I08` where that number names initiatives in several repositories. Each repository numbers its own initiatives, and an initiative's epics and task issues may live in other repositories, so each item's place follows the Work Breakdown links, and a pull request counts towards the epic of its reference in the epic's repository or its initiative's. It prints the `--summary` paragraph, set off by blank lines, and the board's link beneath the heading, then:
   - **Initiatives:** one line for each initiative with work under Completed or In progress, its title's name and subtitle, for context, opening with the mark of its state; one off the board is done when closed, else in progress. An item works for the initiative whose table links its epic and for the one its epic's title names;
   - **Completed:** items Done whose issue closed in the window, grouped under their epic, and the tasks whose pull requests merged in it. Closing is when an issue became Done, so one the board caught up with later still falls on its closing date;
   - **In progress:** epics and task issues In Progress or In Review, each epic with its open pull requests, or else its next task;
   - **Next:** the five Ready items ranked by priority label, each epic with its next task, and a count of the rest;
   - **Key:** what the reference letters stand for, I Initiative, E Epic and W Work Item, and what each line's opening mark says of its state: ✅ done, 🔄 in progress (an initiative or epic open and not In Review), 👀 in review, 📝 draft, ▶️ ready.
5. **Give the initiatives off the board.** For each `unresolved` line naming an initiative not on the board (`I08 in owner/repo`), find its issue by its title's prefix in that repository, fetch it, and re-run with `--initiatives issue-946.json …`.
6. **Write the paragraph for management** from the Initiatives and Completed sections, and re-run with the same arguments and `--summary summary.txt`. One paragraph in plain language: what the window delivered, as outcomes for the initiatives it serves, with no references, links, task ids or tool names. Leave out work in progress and next. With nothing completed, say so in one sentence.
7. **Report** the summary verbatim in a fenced block, so the user copies it unaltered, with any `unresolved` line it prints to stderr beneath: a dependency on an issue off the board, which reads as blocked, or an epic whose Work Breakdown cannot be read, summarised without its tasks; review mode fixes its body.

## Commands

```bash
gh api --paginate "users/{owner}/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | [.number, .title] | @tsv'
gh api --paginate "users/{owner}/projectsV2/2/fields?per_page=100" --jq '.[] | select(.name == "Status") | .id'
gh api --paginate "users/{owner}/projectsV2/2/items?per_page=100&fields=411749936" > items.json
gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I"))' > prs.json
gh api --paginate "repos/{owner}/{other}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I"))' >> prs.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/progress.py --items items.json --prs prs.json
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" --jq '.[] | select(.pull_request == null) | select(.title | startswith("[I08]")) | .number'
gh api repos/{owner}/{repo}/issues/946 > issue-946.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/progress.py --items items.json --prs prs.json --initiatives issue-946.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/progress.py --items items.json --prs prs.json --since 2026-09-21 --initiative I08
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/progress.py --items items.json --prs prs.json --since 2026-09-21 --initiative I08 --summary summary.txt
```
