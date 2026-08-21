#!/usr/bin/env python3
"""Read-only projection of a workflow-server session.json.

Reference implementation and behavioral spec for the `inspect_session`
MCP tool (see ../README.md). It exists to remove the ad-hoc `python3 -c` session
introspection that close-out activities otherwise fall back to; the preferred
delivery is the server tool, with this script as the fallback and output contract.

Usage:
    inspect_session.py <session.json> [view] [--child N] [--variable KEY] [--agent ID]

    view: summary (default) | identity | variables | checkpoints | activities
          | history | children | usage

Targets the root session by default; --child N targets triggeredWorkflows[N].state.
Under --child N, `children` follows the ADDRESSED (descended) session — it lists
that child's own triggeredWorkflows, not the root's.
Optional --agent ID narrows history and usage to data.agentId matches.
"""

import argparse
import json
import sys
from collections import Counter
from datetime import datetime


USAGE_TOKEN_KEYS = ("input_tokens", "output_tokens", "total_tokens", "subagent_tokens")


def parse_stamp(value):
    """An ISO-8601 timestamp as epoch milliseconds, or None where it does not parse."""
    if not isinstance(value, str):
        return None
    try:
        return int(datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp() * 1000)
    except ValueError:
        return None


def load(path):
    with open(path) as fh:
        return json.load(fh)


def resolve(doc, child_index):
    """Return the session object to inspect: the root doc, or an embedded child."""
    if child_index is None:
        return doc
    children = doc.get("triggeredWorkflows") or []
    if not 0 <= child_index < len(children):
        sys.exit(f"no triggeredWorkflows[{child_index}] (have {len(children)})")
    return children[child_index].get("state") or {}


def identity(s):
    return {
        k: s.get(k)
        for k in (
            "workflowId", "workflowVersion", "sessionIndex", "agentId",
            "status", "currentActivity", "currentTechnique", "startedAt", "seq",
        )
    }


def checkpoints(s):
    out = {}
    for cid, resp in (s.get("checkpointResponses") or {}).items():
        out[cid] = {
            "optionId": resp.get("optionId"),
            "respondedAt": resp.get("respondedAt"),
            "variablesSet": (resp.get("effects") or {}).get("variablesSet") or {},
        }
    return out


def activities(s):
    """Completed / skipped / current, the outcome each completed activity reported, and
    the activities entered without a published in-progress Progress mark.

    `outcomes` is what close-out measures a run against where the client workflow seeded
    no outcome list of its own. The two progress lists stay apart because they call for
    different responses: a dispatch that reported false skipped the write, and one that
    reported nothing did not answer.
    """
    history = s.get("history") or []
    outcomes = []
    for e in history:
        if e.get("type") != "activity_outcome" or e.get("activity") is None:
            continue
        data = e.get("data") or {}
        row = {"activity": e.get("activity"), "outcome": data.get("outcome")}
        if data.get("transitionCondition") is not None:
            row["transitionCondition"] = data["transitionCondition"]
        outcomes.append(row)

    entered = []
    for e in history:
        if e.get("type") == "activity_entered" and e.get("activity") is not None:
            if e["activity"] not in entered:
                entered.append(e["activity"])
    reported = {}
    for e in history:
        if e.get("type") == "progress_published" and e.get("activity") is not None:
            reported[e["activity"]] = (e.get("data") or {}).get("published") is True

    return {
        "completed": s.get("completedActivities") or [],
        "skipped": s.get("skippedActivities") or [],
        "current": s.get("currentActivity"),
        "outcomes": outcomes,
        "progress_mark_unpublished": [a for a in entered if reported.get(a) is False],
        "progress_mark_unreported": [a for a in entered if a not in reported],
    }


def history(s, agent_id=None):
    events = s.get("history") or []
    if agent_id is not None:
        events = [e for e in events if (e.get("data") or {}).get("agentId") == agent_id]
    tally = Counter(e.get("type") for e in events)
    milestones = [
        {k: e.get(k) for k in ("type", "activity", "checkpoint") if e.get(k)}
        for e in events
        if e.get("type") in (
            "activity_entered", "activity_exited",
            "checkpoint_reached", "checkpoint_response",
            "workflow_triggered", "workflow_completed",
        )
    ]
    return {"count": len(events), "byType": dict(tally), "milestones": milestones}


def session_cost(st):
    """What one session's own delta usage rows come to.

    `cost_known` false says the figure is unavailable rather than nil: a child that ran
    and stopped before reporting still spent.
    """
    events = [e for e in ((st or {}).get("history") or []) if e.get("type") == "activity_usage"]
    totals = {}
    for e in events:
        data = e.get("data") or {}
        if data.get("basis") != "delta":
            continue
        u = data.get("usage")
        if not isinstance(u, dict):
            continue
        for k in USAGE_TOKEN_KEYS:
            v = u.get(k)
            if isinstance(v, (int, float)) and not isinstance(v, bool):
                totals[k] = totals.get(k, 0) + v
    return {"cost_known": len(events) > 0, "rows": len(events), "totals": totals}


def children(s):
    """One-line digest per triggeredWorkflows entry of the ADDRESSED session, with what
    that child's own usage rows come to."""
    out = []
    for i, c in enumerate(s.get("triggeredWorkflows") or []):
        st = c.get("state") or {}
        out.append({
            "index": i,
            "sessionIndex": c.get("sessionIndex"),
            "workflowId": c.get("workflowId"),
            "status": st.get("status"),
            "currentActivity": st.get("currentActivity"),
            "completed": st.get("completedActivities") or [],
            **session_cost(st),
        })
    return out


def activity_wall_clock_ms(s):
    """Each activity's span, from its first entry to its last exit.

    The spans nest and they hold the time a user spent at a checkpoint, so they are not
    additive — the run's elapsed time is its outer span, never the sum of the parts.
    """
    first, last = {}, {}
    for e in s.get("history") or []:
        activity = e.get("activity")
        if activity is None:
            continue
        t = parse_stamp(e.get("timestamp"))
        if t is None:
            continue
        if e.get("type") == "activity_entered":
            if activity not in first or t < first[activity]:
                first[activity] = t
        elif e.get("type") == "activity_exited":
            if activity not in last or t > last[activity]:
                last[activity] = t
    return {
        a: last[a] - start
        for a, start in first.items()
        if a in last and last[a] >= start
    }


def usage(s, agent_id=None):
    """Per-activity rows with their basis and measured wall clock, the delta totals, each
    agent's latest cumulative figure, the completed activities holding no row, and each
    child's cost outside those totals.

    Delta rows sum. Cumulative rows are a running total per agent context, so summing them
    counts every earlier activity again — they are carried as the latest figure per agent.
    A row whose basis is unstated sums nowhere, because a figure of unknown basis is not a
    figure.
    """
    events = [e for e in (s.get("history") or []) if e.get("type") == "activity_usage"]
    if agent_id is not None:
        events = [e for e in events if (e.get("data") or {}).get("agentId") == agent_id]
    spans = activity_wall_clock_ms(s)
    rows = []
    totals = {}
    cumulative_latest_by_agent = {}
    unstated_basis = 0
    for e in events:
        data = e.get("data") or {}
        u = data.get("usage")
        basis = data.get("basis") if isinstance(data.get("basis"), str) else "unstated"
        row = {
            "activity": e.get("activity"),
            "timestamp": e.get("timestamp"),
            "usage": u,
            "basis": basis,
        }
        if isinstance(data.get("agentId"), str):
            row["agentId"] = data["agentId"]
        span = spans.get(e.get("activity"))
        if span is not None:
            row["wall_clock_ms"] = span
        rows.append(row)

        keys = {}
        if isinstance(u, dict):
            for k in USAGE_TOKEN_KEYS:
                v = u.get(k)
                if isinstance(v, (int, float)) and not isinstance(v, bool):
                    keys[k] = v
        if basis == "delta":
            for k, v in keys.items():
                totals[k] = totals.get(k, 0) + v
        elif basis == "cumulative":
            scope = row.get("agentId") or "unattributed"
            merged = dict(cumulative_latest_by_agent.get(scope) or {})
            merged.update(keys)
            cumulative_latest_by_agent[scope] = merged
        else:
            unstated_basis += 1

    stamps = [t for t in (parse_stamp(e.get("timestamp")) for e in (s.get("history") or [])) if t is not None]
    measured = {e.get("activity") for e in events if e.get("activity") is not None}

    out = {
        "rows": rows,
        "totals": totals,
        "cumulative_latest_by_agent": cumulative_latest_by_agent,
        "unstated_basis": unstated_basis,
    }
    if len(stamps) > 1:
        out["elapsed_ms"] = max(stamps) - min(stamps)
    out["wall_clock_ms_not_additive"] = True
    out["activities_without_usage"] = [
        a for a in (s.get("completedActivities") or []) if a not in measured
    ]
    out["children_outside_totals"] = [
        {
            "index": i,
            "sessionIndex": c.get("sessionIndex"),
            "workflowId": c.get("workflowId"),
            "status": (c.get("state") or {}).get("status"),
            **session_cost(c.get("state")),
        }
        for i, c in enumerate(s.get("triggeredWorkflows") or [])
    ]
    return out


def summary(s):
    return {
        "identity": identity(s),
        "activities": activities(s),
        "variables": s.get("variables") or {},
        "checkpoints": checkpoints(s),
        "history": history(s),
        "children": children(s),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("session_json")
    ap.add_argument("view", nargs="?", default="summary")
    ap.add_argument("--child", type=int, default=None)
    ap.add_argument("--variable", default=None)
    ap.add_argument("--agent", default=None, help="Filter history/usage by data.agentId")
    args = ap.parse_args()

    doc = load(args.session_json)
    s = resolve(doc, args.child)

    if args.view == "variables":
        bag = s.get("variables") or {}
        result = bag.get(args.variable) if args.variable else bag
    elif args.view == "identity":
        result = identity(s)
    elif args.view == "checkpoints":
        result = checkpoints(s)
    elif args.view == "activities":
        result = activities(s)
    elif args.view == "history":
        result = history(s, args.agent)
    elif args.view == "children":
        result = children(s)
    elif args.view == "usage":
        result = usage(s, args.agent)
    elif args.view == "summary":
        result = summary(s)
    else:
        sys.exit(f"unknown view: {args.view}")

    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
