#!/usr/bin/env python3
"""Sample origin/workflows corpus for technique steps with redundant explicit ids."""
import subprocess
import re
import yaml
import sys

REF = "origin/workflows"
ROOT = "corpus"

def git_cat(path: str) -> str:
    r = subprocess.run(
        ["git", "show", f"{REF}:{path}"],
        capture_output=True,
        text=True,
        cwd="/home/mike1/projects/dev/workflow-server",
    )
    if r.returncode != 0:
        return ""
    return r.stdout

def list_yaml(prefix: str) -> list[str]:
    r = subprocess.run(
        ["git", "ls-tree", "-r", "--name-only", REF, "--", prefix],
        capture_output=True,
        text=True,
        cwd="/home/mike1/projects/dev/workflow-server",
    )
    return [p for p in r.stdout.splitlines() if p.endswith((".yaml", ".yml"))]

def last_seg(ref: str) -> str:
    return ref.split("::")[-1]

def walk_steps(steps, examples, counts):
    if not steps:
        return
    for step in steps:
        if not isinstance(step, dict):
            continue
        kind = step.get("kind")
        if kind == "technique":
            counts["technique"] += 1
            tid = step.get("id")
            tech = step.get("technique")
            name = tech if isinstance(tech, str) else (tech or {}).get("name")
            if name:
                derived = last_seg(name)
                if tid:
                    counts["explicit_id"] += 1
                    if tid == derived:
                        counts["redundant_explicit"] += 1
                        if len(examples) < 5:
                            examples.append((tid, name))
                else:
                    counts["omitted_id"] += 1
        if kind == "loop" and step.get("steps"):
            walk_steps(step["steps"], examples, counts)

def main():
    paths = list_yaml(ROOT)
    counts = {
        "technique": 0,
        "explicit_id": 0,
        "omitted_id": 0,
        "redundant_explicit": 0,
        "files": 0,
    }
    examples = []
    for path in paths:
        if "/activities/" not in path and "/routines/" not in path:
            continue
        text = git_cat(path)
        if not text.strip():
            continue
        try:
            doc = yaml.safe_load(text)
        except Exception:
            continue
        if not isinstance(doc, dict) or "steps" not in doc:
            continue
        counts["files"] += 1
        walk_steps(doc.get("steps"), examples, counts)
    print("files_with_steps", counts["files"])
    print("technique_steps", counts["technique"])
    print("explicit_id", counts["explicit_id"])
    print("omitted_id", counts["omitted_id"])
    print("redundant_explicit_id_eq_last_segment", counts["redundant_explicit"])
    for tid, name in examples:
        print("example", tid, name)

if __name__ == "__main__":
    main()
