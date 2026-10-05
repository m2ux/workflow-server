#!/usr/bin/env python3
"""Count checkpoint steps with step-level condition: on origin/workflows."""
import subprocess
import yaml

REF = "origin/workflows"
CWD = "/home/mike1/projects/dev/workflow-server"

def git_cat(path: str) -> str:
    r = subprocess.run(
        ["git", "show", f"{REF}:{path}"],
        capture_output=True,
        text=True,
        cwd=CWD,
    )
    return r.stdout if r.returncode == 0 else ""

def list_yaml() -> list[str]:
    r = subprocess.run(
        ["git", "ls-tree", "-r", "--name-only", REF, "--", "corpus"],
        capture_output=True,
        text=True,
        cwd=CWD,
    )
    return [p for p in r.stdout.splitlines() if p.endswith((".yaml", ".yml"))]

def walk(steps, counts):
    if not steps:
        return
    for step in steps:
        if not isinstance(step, dict):
            continue
        kind = step.get("kind")
        if kind == "checkpoint":
            counts["checkpoint"] += 1
            if "condition" in step:
                counts["checkpoint_with_condition"] += 1
        if kind == "loop" and step.get("steps"):
            walk(step["steps"], counts)

def main():
    counts = {"checkpoint": 0, "checkpoint_with_condition": 0}
    for path in list_yaml():
        if "/activities/" not in path and "/routines/" not in path:
            continue
        try:
            doc = yaml.safe_load(git_cat(path))
        except Exception:
            continue
        if isinstance(doc, dict) and doc.get("steps"):
            walk(doc["steps"], counts)
    print("checkpoint_steps", counts["checkpoint"])
    print("checkpoint_with_condition", counts["checkpoint_with_condition"])

if __name__ == "__main__":
    main()
