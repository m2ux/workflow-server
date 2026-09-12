#!/usr/bin/env python3
"""Which corpus checkpoints are dismissible, and which reference steps carry a site condition.

A checkpoint is dismissible when it carries a `condition` field: the server checks for the field's
presence and never evaluates it. This walks every `kind: checkpoint` node at any loop depth across
every activity file, partitions them on `condition` and `when` as written, lists the fragment
reference steps with whether each carries a site condition, and lists the checkpoints that sit
inside a loop and carry a condition of their own.

Run from the server checkout root. Reads definitions and writes nothing.
"""
import glob
import os
import sys

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML is required")

ROOT = os.path.join(os.getcwd(), "workflows")
files = sorted(glob.glob(os.path.join(ROOT, "*", "activities", "**", "*.yaml"), recursive=True))

counts = {"condition": 0, "when": 0, "both": 0, "neither": 0}
total = 0
refs = []
in_loop_with_condition = []


def walk(steps, relpath, loops):
    global total
    for step in steps or []:
        if not isinstance(step, dict):
            continue
        kind = step.get("kind")
        if kind == "checkpoint":
            total += 1
            has_condition = "condition" in step
            has_when = "when" in step
            if has_condition and has_when:
                counts["both"] += 1
            elif has_condition:
                counts["condition"] += 1
            elif has_when:
                counts["when"] += 1
            else:
                counts["neither"] += 1
            if "ref" in step:
                refs.append((relpath, step.get("id"), step.get("ref"), has_condition, list(loops)))
            if has_condition and loops:
                in_loop_with_condition.append((relpath, step.get("id"), list(loops)))
        elif kind == "loop":
            loops.append((step.get("id"), step.get("loopType"), step.get("over")))
            walk(step.get("steps"), relpath, loops)
            loops.pop()


for path in files:
    try:
        parsed = yaml.safe_load(open(path))
    except yaml.YAMLError as error:
        print("parse failure: %s — %s" % (path, error))
        continue
    if isinstance(parsed, dict):
        walk(parsed.get("steps"), os.path.relpath(path, ROOT), [])

print("activity files parsed: %d" % len(files))
print("checkpoint steps: %d" % total)
print("  structured condition as written: %d" % counts["condition"])
print("  when alone:                      %d" % counts["when"])
print("  both:                            %d" % counts["both"])
print("  neither:                         %d" % counts["neither"])
print()
print("fragment reference steps: %d" % len(refs))
for relpath, step_id, ref, has_condition, loops in refs:
    print("  %-52s %-50s ref=%-20s site condition=%s  inside=%s"
          % (relpath, step_id, ref, has_condition, loops or "top level"))
print()
print("checkpoints inside a loop carrying a condition as written: %d" % len(in_loop_with_condition))
for relpath, step_id, loops in in_loop_with_condition:
    print("  %-52s %-42s %s" % (relpath, step_id, loops))
