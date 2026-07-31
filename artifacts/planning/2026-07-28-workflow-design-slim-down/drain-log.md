# `workflow-design` drain log

Append-only. One row per drain check. `workflow-design` is deleted when the count reaches the gate below — see [the build](../2026-07-28-workflow-authoring-build/) for what replaces it.

Run the census against the planning root, never a flat glob:

```
npx tsx scripts/count-workflow-sessions.ts --workflow workflow-design --status running --list
```

**A flat glob over `planning/*/session.json` undercounts badly.** Child sessions are embedded in the parent's `session.json` under `triggeredWorkflows[i].state`, at any depth. On the first check only **5 of 32** running sessions were top-level states; a flat glob would have reported 5 and licensed deleting a tree with 27 live sessions inside it.

---

## The gate

**Delete when the census reports 2 running sessions, and both are the pair named below.**

Not zero. Two sessions cannot advance and cannot be closed, so a literal zero is unreachable and the gate would never open. The count is still the trigger — the exemption is fixed, named and verifiable, so a later reader checks two things rather than exercising judgement:

1. the census reports exactly 2; and
2. both remaining folders are the two named below.

**Any other count, or any other folder in the remaining set, is not the gate.** A count of 2 whose members are two ordinary live sessions means the drain is incomplete, not finished.

### The two exempt sessions

Both are structurally unresumable: nothing can move them forward, and nothing can close them.

| Planning folder | Version | Stuck at | Why it cannot advance |
|---|---|---|---|
| `2026-06-09-migrate-prose-procedures-to-techniques` | 1.2.1 | `content-drafting` | No activity of that id exists. `readActivityRaw` matches the filename-derived id with no fallback, so `get_activity` throws for it. Renamed away before this session resumed. |
| `2026-07-01-prism-audit-readme` | 1.5.0 | *(none recorded)* | `currentActivity` is empty, so there is no activity to dispatch. |

They are **left `running` deliberately** rather than marked abandoned. `session.json` is HMAC-sealed against a sibling `.session-token`, no server tool sets an abandoned status, and no re-seal script exists — a hand edit would make both read to the server as *modified outside the server*, which is a worse record than leaving them open. Deleting the files would erase two runs. So the exemption is carried here, on paper, instead of being forced into the data.

### Why the ≥90-day policy does not resolve them

The policy — any session whose planning folder has had no commit for ≥90 days is set `status: abandoned` with a recorded reason — is what makes the *other* 30 reachable. It does not help these two, because setting that status is the thing that cannot be done to them. Their last commits:

| Folder | Last commit | ≥90 days from |
|---|---|---|
| `2026-06-09-migrate-prose-procedures-to-techniques` | 2026-06-11 (`99c1e82`) | 2026-09-09 |
| `2026-07-01-prism-audit-readme` | 2026-07-11 (`47f4a6b`) | 2026-10-09 |

Past those dates they are abandoned **in policy** while still reading `running` in the data. That divergence is exactly what this log exists to record, and it is why the gate names them rather than counting to zero.

### Before deleting

Run the outside-reference check mechanically: no file outside `workflow-design/` may link into it. `check-resource-anchors` catches anchored links; the non-anchored and `techniques[]` cases need `check-all-refs` plus a grep sweep. Doing this by hand once hid 72 links across 25 files behind a 6-file manifest.

The deletion commit is atomic: `git mv` of the four canon homes into `workflow-authoring/resources/`, the re-depthing of every citation, and `--update-baseline`, together. Splitting them breaks the hard-zero anchor guard for the interval.

---

## Checks

| Date | Running | Of which exempt | Remaining to drain | Notes |
|---|---:|---:|---:|---|
| 2026-07-28 | 32 | 2 | 30 | First check, taken at S5 when the census landed. 5 top-level, 27 nested. 19 of the 32 sit at `retrospective`. Gate not met. |
