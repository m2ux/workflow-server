#!/usr/bin/env python3
"""Read-only projection of a workflow-server session.json.

Reference implementation and behavioral spec for the proposed `inspect_session`
MCP tool (see ../README.md). It exists to remove the ad-hoc `python3 -c` session
introspection that close-out activities otherwise fall back to; the preferred
delivery is the server tool, with this script as the fallback and output contract.

Usage:
    inspect_session.py <session.json> [view] [--child N] [--variable KEY]

    view: summary (default) | identity | variables | checkpoints | activities
          | history | children

Targets the root session by default; --child N targets triggeredWorkflows[N].state.
Under --child N, `children` follows the ADDRESSED (descended) session — it lists
that child's own triggeredWorkflows, not the root's.
"""

import argparse
import json
import sys
from collections import Counter


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
    return {
        "completed": s.get("completedActivities") or [],
        "skipped": s.get("skippedActivities") or [],
        "current": s.get("currentActivity"),
    }


def history(s):
    events = s.get("history") or []
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


def children(s):
    """One-line digest per triggeredWorkflows entry of the ADDRESSED session.

    Operates on the resolved session `s`, so under --child N it lists that
    child's own triggeredWorkflows — matching the tool's addressed-session
    semantics — rather than the root document's.
    """
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
        })
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
        result = history(s)
    elif args.view == "children":
        result = children(s)
    elif args.view == "summary":
        result = summary(s)
    else:
        sys.exit(f"unknown view: {args.view}")

    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
