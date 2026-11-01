# W14 Change List

> Change list · Created 2026-11-01

- **Applied.** None.
- **Held.** None.

The session met no plan change: no task, epic, migration, re-prioritisation or folded work arose. Validation found three trivial debt items, each fixed in [#1560](https://github.com/m2ux/workflow-server/pull/1560):

- **Two rules for one decision.** `closure-sweep.py` carried its own copy of the gate's rule; it imports `blockers` from `closure.py`.
- **A malformed link passed or crashed.** A link entry lacking its repository, number or state passed when its state read merged and raised a traceback otherwise; both scripts report it as unreadable evidence.
- **Prerequisite links pointed at closure.** Three `pull-request.md` operations documented the auto-close prerequisite by linking to Close Tracker Issue; they link to Auto-Close Setting.
