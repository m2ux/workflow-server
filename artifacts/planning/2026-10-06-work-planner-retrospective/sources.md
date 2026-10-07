# Sources

How the session files in this record were derived, and what they leave out. A reader checking a criterion against a source needs to know which direction the omissions run.

## Extraction

Each file is one Claude Code session, taken from that session's transcript. Only the user's own turns are carried, plus two things the user settled rather than typed:

- **Decisions.**
  A `> **Decision.**` line is an interview question and the option the user chose, word for word as the session recorded it.
- **Carried summaries.**
  A `> **Carried summary.**` block is the summary a session inherited when it ran out of context. It restates the directives given earlier, so it covers conversation whose own transcript is gone.

Every turn sits under a heading of its time of day and the branch it was spoken on, so a citation resolves by relative path and fragment: `sessions/2026-09-27-b8c47927.md#045151`.

## Selection

This record is published, and a session run against another repository carries that repository's work. So a session is a source only where it ran against workflow-server itself, and then only where it sat on one of the forty branches that delivered planner work, or its prose names the skill, one of its modes or a board. Within a session:

- A turn on a planner branch is kept when it speaks the scheme's vocabulary.
- A turn off a planner branch is kept only when it names the skill, a mode or a board, because such a session is usually the skill in use rather than under design.
- A carried summary is kept only in a session that sat on a planner branch, since a summary recounts whatever its session was doing.
- A turn naming another repository, its issues, its boards or its subject matter is dropped whole rather than scrubbed, wherever it appears.

## Redaction

- **`[unrelated content redacted]`**  marks a run of turns that selection dropped.
- **`[expletive redacted]`**  replaces an expletive. Four were found, all in the founding session.
- Pasted blocks over six thousand characters are dropped; their content is issue bodies and review output that lives on GitHub.
- Harness injections — skill bodies, command output, IDE and task tags, system reminders — are dropped wherever they appear.
- Absolute filesystem paths are written `~`.

No personal content and no credentials were found.

## Coverage

Fifteen of the forty planner branches have a session here. The rest have no session this record can carry: either no transcript survives, or the only one ran against another repository. The requirements behind them are visible through their pull requests, and a criterion that cannot be traced to a passage in these files is traced to its pull request instead.

Four rules were settled in sessions run against other repositories, and are traced that way: epics tracked in any repository and In Review made optional, by [#957](https://github.com/m2ux/workflow-server/pull/957); one mark per progress state and the summary's spacing, by [#965](https://github.com/m2ux/workflow-server/pull/965) and [#962](https://github.com/m2ux/workflow-server/pull/962); each bold lead's body on the next line and replies answered point by point, by [#968](https://github.com/m2ux/workflow-server/pull/968) and [#969](https://github.com/m2ux/workflow-server/pull/969); and a lead's introduction kept on its own line, by [#975](https://github.com/m2ux/workflow-server/pull/975).
