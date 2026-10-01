# Progress mode

Summarises a project board as a standup, in Slack markup for pasting into a channel: a paragraph for management on what the window accomplished, then what completed, what is in progress, and what is next. The board's Status is the source, so the summary is as current as the board.

## Procedure

1. **Bring the board current.**
   When issues have closed or pull requests have merged since the board was last updated, run update mode first: the summary reads each item's Status as it stands.
2. **Find the board.**
   - The board is a theme's board, per SKILL.md's [Themes and boards](../SKILL.md#themes-and-boards): run [Find theme board](commands.md#find-theme-board) for the theme the user names.
   - When the request names none, ask which theme, or all, and summarise each board in turn.
3. **Fetch.**
   - [Find Status field](commands.md#find-status-field) on the chosen board, then [Fetch board items with Status](commands.md#fetch-board-items-with-status).
   - [Fetch all initiative pull requests](commands.md#fetch-all-initiative-pull-requests), appending those of each further repository the board's issues live in.
4. **Summarise.**  Run [Summarise progress](commands.md#summarise-progress).
   - **Window.**
     The window opens a week before today. Give `--since` for another, such as the previous working day for a daily standup.
   - **One initiative.**
     Give `--initiative I08` when the user names one initiative, or `owner/repo:I08` where that number names initiatives in several repositories.
   - **Repositories.**
     Each repository numbers its own initiatives, and an initiative's epics and task issues may live in other repositories. Each item's place follows the Work Breakdown links, or for a task issue the pull request that cites it, and a pull request counts towards the epic of its reference in the epic's repository or its initiative's.

   It prints the `--summary` paragraph, set off by blank lines, and the board's link beneath the heading, then:
   - **Initiatives.**
     - One line for each initiative with work under Completed or In progress, its title's name and subtitle, for context, opening with the mark of its state.
     - One off the board is done when closed, else in progress.
     - An item works for the initiative whose table links its epic and for the one its epic's title names.
   - **Completed.**
     - Items Done whose issue closed in the window, grouped under their epic, and the tasks whose pull requests merged in it.
     - Closing is when an issue became Done, so one the board caught up with later still falls on its closing date.
   - **In progress.**
     Epics and task issues In Progress or In Review, each epic with its open pull requests, or else its next task.
   - **Next.**
     The five Ready items ranked by priority label, each epic with its next task, and a count of the rest.
   - **Key.**
     - The reference letters: I Initiative, E Epic and W Work Item.
     - Each line's opening mark: ✅ done, 🔄 in progress (an initiative or epic open and not In Review), 👀 in review, 📝 draft, ▶️ ready.
5. **Give the initiatives off the board.**
   For each `unresolved` line naming an initiative not on the board (`I08 in owner/repo`), find its issue with [Find initiative issue](commands.md#find-initiative-issue) in that repository, take it with [Fetch issue](commands.md#fetch-issue), and re-run [Summarise progress](commands.md#summarise-progress) with `--initiatives`.
6. **Write the paragraph for management.**
   Write it from the Initiatives and Completed sections, and re-run [Summarise progress](commands.md#summarise-progress) with the same arguments and `--summary`. The paragraph:
   - is one paragraph in plain language: what the window delivered, as outcomes for the initiatives it serves;
   - carries no references, links, task ids or tool names;
   - leaves out work in progress and next;
   - with nothing completed, says so in one sentence.
7. **Report.**
   - Report the summary verbatim in a fenced block, so the user copies it unaltered.
   - Put any `unresolved` line it prints to stderr beneath:
     - a dependency on an issue off the board, which reads as blocked;
     - an epic whose Work Breakdown cannot be read, summarised without its tasks; review mode fixes its body.

