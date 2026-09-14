#!/usr/bin/env python3
"""Identifier lengths: what the corpus carries, and what the routine prefix composes.

Three reports, each independently re-runnable:

  populations   every identifier population a routine prefix lands in — step ids, checkpoint ids,
                composed checkpoint response keys, activity-declared and workflow-declared variable
                names, artifact filenames — with the longest members and the distribution.
  composed      what materialisation generates at every reference site of the re-derived convergence
                signature, and — separately marked — what the proposal's own assumption-run sketch
                generates at each of its four hosts, which is where the proposal's table comes from.
  delta         the delivered-character cost of the composed prefix at the six convergence sites.

Run from the server checkout root. Reads definitions and writes nothing.

The corpus root is `workflows/` where a submodule holds it and `.worktrees/workflows/corpus/`
where a branch worktree does, which is the same pair the guard scripts resolve over.

    python3 .engineering/artifacts/planning/2026-09-11-routines-remediation/measure/identifier-lengths.py
    python3 ...identifier-lengths.py --root <corpus-root> --report composed
"""
import argparse
import os
import sys
from collections import Counter

import yaml


def resolve_root(explicit):
    if explicit:
        return explicit
    for candidate in ("workflows", os.path.join(".worktrees", "workflows", "corpus")):
        if os.path.isdir(os.path.join(candidate, "work-package", "activities")):
            return candidate
    sys.exit("no corpus root found; pass --root")


# --------------------------------------------------------------------------- populations

def collect(root):
    steps, checkpoints, act_vars, wf_vars, artifacts = [], [], [], [], []

    def walk(wf, aid, step_list, depth):
        for step in step_list or []:
            if not isinstance(step, dict):
                continue
            sid = step.get("id")
            if sid is not None:
                steps.append((wf, aid, str(sid), step.get("kind"), depth))
                if step.get("kind") == "checkpoint":
                    checkpoints.append((wf, aid, str(sid), depth))
            if step.get("kind") == "loop":
                walk(wf, aid, step.get("steps"), depth + 1)

    files = 0
    for wf in sorted(os.listdir(root)):
        adir = os.path.join(root, wf, "activities")
        if os.path.isdir(adir):
            for here, _dirs, names in os.walk(adir):
                for name in sorted(names):
                    if not name.endswith((".yaml", ".yml")):
                        continue
                    doc = yaml.safe_load(open(os.path.join(here, name)))
                    if not isinstance(doc, dict):
                        continue
                    files += 1
                    aid = str(doc.get("id", ""))
                    walk(wf, aid, doc.get("steps"), 0)
                    block = doc.get("variables") or {}
                    for entry in (block.get("reads") or []):
                        act_vars.append((wf, entry if isinstance(entry, str) else str(entry.get("name"))))
                    for entry in (block.get("writes") or []):
                        act_vars.append((wf, entry if isinstance(entry, str) else str(entry.get("name"))))
        manifest = os.path.join(root, wf, "workflow.yaml")
        if os.path.isfile(manifest):
            doc = yaml.safe_load(open(manifest))
            for entry in ((doc or {}).get("variables") or []):
                wf_vars.append((wf, entry if isinstance(entry, str) else str(entry.get("name"))))

    for here, _dirs, names in os.walk(root):
        for name in sorted(names):
            if not name.endswith(".md"):
                continue
            path = os.path.join(here, name)
            lines = open(path, errors="replace").read().split("\n")
            for i, line in enumerate(lines):
                if line.strip() == "#### artifact":
                    for j in range(i + 1, min(i + 6, len(lines))):
                        if lines[j].strip():
                            artifacts.append((os.path.relpath(path, root),
                                              lines[j].strip().strip(chr(96)).strip()))
                            break
    return files, steps, checkpoints, act_vars, wf_vars, artifacts


def rank(title, pairs, top=6):
    print("\n== %s — population %d, distinct %d ==" % (title, len(pairs), len(set(v for _, v in pairs))))
    for label, value in sorted(pairs, key=lambda p: -len(p[1]))[:top]:
        print("   %4d  %-78s %s" % (len(value), value, label))
    lengths = sorted(len(v) for _, v in pairs)
    print("   max=%d  p90=%d  median=%d  mean=%.1f"
          % (lengths[-1], lengths[int(len(lengths) * 0.9)], lengths[len(lengths) // 2],
             sum(lengths) / len(lengths)))


def report_populations(root):
    files, steps, checkpoints, act_vars, wf_vars, artifacts = collect(root)
    print("activity files %d · steps carrying an id %d · steps without one %d"
          % (files, len(steps), 0))
    rank("step ids, all depths", [(w + "/" + a, s) for w, a, s, _k, _d in steps])
    rank("checkpoint step ids", [(w + "/" + a, s) for w, a, s, _d in checkpoints])
    rank("checkpoint response keys, activity id + '-' + checkpoint id",
         [(w + "/" + a, a + "-" + s) for w, a, s, _d in checkpoints])
    rank("variable names declared in activities", act_vars)
    rank("variable names declared in workflow.yaml", wf_vars)
    rank("artifact filenames", artifacts)
    instanced = [c for c in checkpoints if "#" in c[2]]
    print("\ncheckpoint ids carrying the per-iteration discriminator: %d" % len(instanced))
    for _w, a, s, _d in sorted(instanced, key=lambda c: -len(c[2])):
        print("   %4d  %s" % (len(a + "-" + s), a + "-" + s))
    print("\nstep depth histogram:", dict(Counter(s[4] for s in steps)))
    print("checkpoint depth histogram:", dict(Counter(c[3] for c in checkpoints)))


# --------------------------------------------------------------------------- composed

SIX = ["design-philosophy", "research", "implementation-analysis",
       "plan-prepare", "assumptions-review", "implement"]
FOUR = ["research", "implementation-analysis", "assumptions-review", "implement"]


def snake(value):
    return value.replace("-", "_").replace(".", "_")


def report_composed():
    print("\n== the re-derived convergence signature ==")
    print("\n-- six hosts, `kind: routine` step id `assumption-convergence` -> converge-assumptions")
    ref = "assumption-convergence"
    for what, path in [
        ("loop", [ref, "convergence"]),
        ("technique reconcile", [ref, "convergence", "reconcile"]),
        ("inner technique challenge", [ref, "convergence", "challenge", "challenge"]),
        ("inner technique combine", [ref, "convergence", "challenge", "combine"]),
    ]:
        composed = ".".join(path)
        print("   %4d  %-58s %s" % (len(composed), composed, what))

    print("\n-- codebase-comprehension, step id `challenge-open-questions` -> challenge-concerns")
    for tail in ("challenge", "combine"):
        composed = "challenge-open-questions." + tail
        print("   %4d  %-58s inner technique %s" % (len(composed), composed, tail))

    print("\n-- the internal `challenge_findings`, under the two readings of the internals rule")
    for host in SIX:
        inner = snake(host) + "_challenge_challenge_findings"
        outer = snake(host) + "_" + snake(ref + ".convergence.challenge") + "_challenge_findings"
        print("   innermost-ref %3d   full-path %3d   %s" % (len(inner), len(outer), host))
    comp = "codebase_comprehension_challenge_open_questions_challenge_findings"
    print("   innermost-ref %3d   full-path %3d   codebase-comprehension" % (len(comp), len(comp)))

    print("\n== the proposal's assumption-run sketch (README:216-275), not re-derived ==")
    ref = "reconcile-assumptions"
    for host in FOUR:
        item = snake(host) + "_" + snake(ref) + "_current_assumption"
        pres = snake(host) + "_" + snake(ref) + "_assumption_presentation"
        step = ref + ".interview.decision#{" + item + ".id}"
        key = host + "-" + step
        print("   %-24s internal %3d / %3d   step id %3d   response key %3d"
              % (host, len(item), len(pres), len(step), len(key)))
    for tail in ("batch-gate", "record-batch"):
        print("   one level: %d  %s" % (len(ref + "." + tail), ref + "." + tail))


# --------------------------------------------------------------------------- delta

def report_delta(root):
    today = ["assumption-convergence", "reconcile-assumptions",
             "challenge-assumptions", "combine-assumption-challenges"]
    after = ["assumption-convergence.convergence",
             "assumption-convergence.convergence.reconcile",
             "assumption-convergence.convergence.challenge.challenge",
             "assumption-convergence.convergence.challenge.combine"]
    delta = sum(len(a) for a in after) - sum(len(t) for t in today)
    print("\n== delivered-character cost of the composed prefix ==")
    print("   ids today %d chars, materialised %d chars, delta %+d per host, %+d across six"
          % (sum(len(t) for t in today), sum(len(a) for a in after), delta, delta * 6))
    for name in ["02-design-philosophy", "04-research", "05-implementation-analysis",
                 "06-plan-prepare", "07-assumptions-review", "08-implement"]:
        path = os.path.join(root, "work-package", "activities", name + ".yaml")
        size = os.path.getsize(path)
        print("   %-34s %6d bytes   %+d  (%.2f%%)" % (name + ".yaml", size, delta, 100.0 * delta / size))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root")
    ap.add_argument("--report", choices=["populations", "composed", "delta", "all"], default="all")
    args = ap.parse_args()
    root = resolve_root(args.root)
    print("corpus root:", root)
    if args.report in ("populations", "all"):
        report_populations(root)
    if args.report in ("composed", "all"):
        report_composed()
    if args.report in ("delta", "all"):
        report_delta(root)


if __name__ == "__main__":
    main()
