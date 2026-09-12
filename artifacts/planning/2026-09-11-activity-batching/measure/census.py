#!/usr/bin/env python3
"""Fleet census: which identities took more than one activity.

Walks every session.json under --root, including children nested at
triggeredWorkflows[].state, and reports:

  * how many session records exist
  * how many identities took 1, 2, 3, 4 distinct activities
  * how many records carry a batch_refused event
  * which identities walked two or more activities, split into the meta
    setup sequence and everything else

A batch here is an identity that appears on activity_dispatched events for
two or more distinct activity ids. That is the run the server bound would
see; it is silent about whether the orchestrator meant to continue.

Re-take (from a server checkout whose .engineering/artifacts holds the
sealed runs):

  python3 measure/census.py --root /path/to/.engineering/artifacts
"""

from __future__ import annotations

import argparse
import collections
import json
import sys
from pathlib import Path

SETUP = {
    "discover-session",
    "initialize-session",
    "resolve-target",
    "dispatch-client-workflow",
    "end-workflow",
}


def walk_sessions(obj: dict, path: str, out: list) -> None:
    if "history" in obj and "workflowId" in obj:
        out.append((path, obj))
    for i, child in enumerate(obj.get("triggeredWorkflows") or []):
        if not isinstance(child, dict):
            continue
        state = child.get("state")
        if isinstance(state, dict):
            wf = state.get("workflowId")
            walk_sessions(state, f"{path}/child[{i}:{wf}]", out)


def load_sessions(root: Path) -> tuple[int, list]:
    sessions = []
    n_files = 0
    for path in sorted(root.rglob("session.json")):
        try:
            data = json.loads(path.read_text())
        except (OSError, json.JSONDecodeError) as exc:
            print(f"FAIL {path}: {exc}", file=sys.stderr)
            continue
        n_files += 1
        rel = str(path.relative_to(root))
        walk_sessions(data, rel, sessions)
    return n_files, sessions


def identities(history: list) -> dict[str, list[str]]:
    by_agent: dict[str, list[str]] = collections.defaultdict(list)
    for event in history:
        if not isinstance(event, dict) or event.get("type") != "activity_dispatched":
            continue
        agent = (event.get("data") or {}).get("agentId")
        activity = event.get("activity")
        if agent and activity and activity not in by_agent[agent]:
            by_agent[agent].append(activity)
    return by_agent


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        required=True,
        help="Directory to walk for session.json files (planning artifacts root).",
    )
    args = parser.parse_args()
    root = args.root.resolve()
    n_files, sessions = load_sessions(root)

    ident_n: collections.Counter[int] = collections.Counter()
    setup_multi, client_multi, other_multi = [], [], []
    n_batch_refused = 0
    n_with_dispatch = 0

    for path, state in sessions:
        history = state.get("history") or []
        if any(e.get("type") == "batch_refused" for e in history if isinstance(e, dict)):
            n_batch_refused += 1
        by_agent = identities(history)
        if by_agent:
            n_with_dispatch += 1
        workflow_id = state.get("workflowId")
        for agent, acts in by_agent.items():
            ident_n[len(acts)] += 1
            if len(acts) < 2:
                continue
            rec = (path, workflow_id, agent, acts)
            if set(acts) <= SETUP:
                setup_multi.append(rec)
            elif workflow_id and workflow_id != "meta":
                client_multi.append(rec)
            else:
                other_multi.append(rec)

    print(f"session_files={n_files}")
    print(f"session_records={len(sessions)}")
    print(f"records_with_dispatch={n_with_dispatch}")
    print(f"batch_refused_records={n_batch_refused}")
    print("identities_by_distinct_activity_count=" + json.dumps(dict(sorted(ident_n.items()))))
    print(
        f"identities_1={ident_n[1]} "
        f"identities_2plus={sum(v for k, v in ident_n.items() if k >= 2)}"
    )
    print(
        f"setup_batches={len(setup_multi)} "
        f"client_batches={len(client_multi)} "
        f"other_batches={len(other_multi)}"
    )

    print("\n# SETUP")
    for path, _wf, agent, acts in setup_multi:
        print(f"{path}\t{agent}\t{','.join(acts)}")

    print("\n# CLIENT")
    for path, workflow_id, agent, acts in client_multi:
        print(f"{path}\t{workflow_id}\t{agent}\t{','.join(acts)}")

    print("\n# OTHER")
    for path, workflow_id, agent, acts in other_multi:
        print(f"{path}\t{workflow_id}\t{agent}\t{','.join(acts)}")

    client_sessions = [s for s in sessions if s[1].get("workflowId") not in (None, "meta")]
    print(f"\nclient_session_records={len(client_sessions)}")
    n_multi_act = 0
    n_none_batched = 0
    print("\n# NO-BATCH CLIENT (2+ activities, no identity took 2)")
    for path, state in client_sessions:
        history = state.get("history") or []
        acts: list[str] = []
        by_agent: dict[str, set[str]] = collections.defaultdict(set)
        for event in history:
            if not isinstance(event, dict) or event.get("type") != "activity_dispatched":
                continue
            activity = event.get("activity")
            agent = (event.get("data") or {}).get("agentId")
            if activity and activity not in acts:
                acts.append(activity)
            if agent and activity:
                by_agent[agent].add(activity)
        if len(acts) < 2:
            continue
        n_multi_act += 1
        max_per = max((len(v) for v in by_agent.values()), default=0)
        if max_per >= 2:
            continue
        n_none_batched += 1
        print(
            f"{path}\twf={state.get('workflowId')}\t"
            f"activities={len(acts)}\tidentities={len(by_agent)}\t{','.join(acts)}"
        )
    print(f"client_sessions_2plus_activities={n_multi_act}")
    print(f"client_sessions_2plus_none_batched={n_none_batched}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
