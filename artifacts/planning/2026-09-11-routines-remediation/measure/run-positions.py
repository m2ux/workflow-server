#!/usr/bin/env python3
"""The shared assumption run, position by position, across its four host activities.

Matches the run's eight positions by their place in each host's step sequence rather than by
identifier, then reports per position: how many distinct identifiers the four hosts spell it with,
how many step instances there are, whether the parsed step object is identical in every field at all
four hosts, and which fields differ when it is not.

Run from the server checkout root. Reads definitions and writes nothing.
"""
import json
import os
import sys

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML is required")

ROOT = os.path.join(os.getcwd(), "workflows", "work-package", "activities")
HOSTS = [
    "04-research.yaml",
    "05-implementation-analysis.yaml",
    "07-assumptions-review.yaml",
    "08-implement.yaml",
]

# The interview loop, whose body holds positions F, G and H.
LOOP = {
    "04-research.yaml": "assumption-interview",
    "05-implementation-analysis.yaml": "assumption-interview",
    "07-assumptions-review.yaml": "assumption-interview-loop",
    "08-implement.yaml": "assumption-interview",
}

# Position label, the identifier each host spells it with, and whether it sits at the top level or
# inside the interview loop's body.
POSITIONS = [
    ("A record pass", {
        "04-research.yaml": "update-assumptions-log",
        "05-implementation-analysis.yaml": "update-assumptions-log",
        "07-assumptions-review.yaml": "update-assumptions-log",
        "08-implement.yaml": "update-assumptions-log",
    }, "top"),
    ("B announcement", {
        "04-research.yaml": "present-resolved-assumptions",
        "05-implementation-analysis.yaml": "present-resolved-assumptions",
        "07-assumptions-review.yaml": "present-residual-assumptions",
        "08-implement.yaml": "present-resolved-assumptions",
    }, "top"),
    ("C batch gate", {
        "04-research.yaml": "research-assumption-interview",
        "05-implementation-analysis.yaml": "analysis-assumption-interview",
        "07-assumptions-review.yaml": "residual-assumption-batch",
        "08-implement.yaml": "implementation-assumption-interview",
    }, "top"),
    ("D batch record", {
        "04-research.yaml": "record-batch-response",
        "05-implementation-analysis.yaml": "record-batch-response",
        "07-assumptions-review.yaml": "record-batch-decision",
        "08-implement.yaml": "record-batch-response",
    }, "top"),
    ("E interview loop", dict(LOOP), "top"),
    ("F per-item present", {
        "04-research.yaml": "present-assumption",
        "05-implementation-analysis.yaml": "present-assumption",
        "07-assumptions-review.yaml": "present-assumption",
        "08-implement.yaml": "present-assumption",
    }, "body"),
    ("G per-item gate", {
        "04-research.yaml": "research-assumption-decision#{current_assumption.id}",
        "05-implementation-analysis.yaml": "analysis-assumption-decision#{current_assumption.id}",
        "07-assumptions-review.yaml": "assumption-decision#{current_assumption.id}",
        "08-implement.yaml": "implementation-assumption-decision#{current_assumption.id}",
    }, "body"),
    ("H per-item record", {
        "04-research.yaml": "record-response",
        "05-implementation-analysis.yaml": "record-response",
        "07-assumptions-review.yaml": "record-decision",
        "08-implement.yaml": "record-response",
    }, "body"),
]

_cache = {}


def top_steps(host):
    if host not in _cache:
        with open(os.path.join(ROOT, host)) as handle:
            _cache[host] = yaml.safe_load(handle).get("steps", [])
    return _cache[host]


def loop_body(host):
    for step in top_steps(host):
        if step.get("id") == LOOP[host]:
            return step.get("steps", [])
    return []


def find(pool, step_id):
    for index, step in enumerate(pool, start=1):
        if step.get("id") == step_id:
            return index, step
    return None, None


print("Top-level step sequences")
for host in HOSTS:
    steps = top_steps(host)
    print("  %s — %d steps" % (host, len(steps)))
    for index, step in enumerate(steps, start=1):
        print("    %2d %-11s %s" % (index, step.get("kind"), step.get("id")))
print()

print("%-19s %-9s %-9s %-9s %s" % ("position", "spellings", "instances", "identical", "fields that vary"))
total_spellings = 0
identical = []
for label, mapping, where in POSITIONS:
    bodies = {}
    for host in HOSTS:
        pool = top_steps(host) if where == "top" else loop_body(host)
        _, step = find(pool, mapping[host])
        if step is None:
            sys.exit("position %s not found at %s as %s" % (label, host, mapping[host]))
        bodies[host] = step
    spellings = len(set(mapping[host] for host in HOSTS))
    total_spellings += spellings
    serialised = set(json.dumps(body, sort_keys=True) for body in bodies.values())
    is_identical = len(serialised) == 1
    if is_identical:
        identical.append(label)
    keys = set()
    for body in bodies.values():
        keys |= set(body.keys())
    varying = [
        key for key in sorted(keys)
        if len(set(json.dumps(body.get(key), sort_keys=True) for body in bodies.values())) > 1
    ]
    print("%-19s %-9d %-9d %-9s %s" % (label, spellings, len(HOSTS), is_identical, ", ".join(varying)))

print()
print("eight positions: %d distinct spellings over %d step instances" % (total_spellings, 8 * len(HOSTS)))
six = sum(len(set(m[h] for h in HOSTS)) for label, m, _ in POSITIONS if label[0] in "CDEFGH")
seven = six + len(set(POSITIONS[1][1][h] for h in HOSTS))
print("positions C-H:   %d spellings over %d instances" % (six, 6 * len(HOSTS)))
print("positions B-H:   %d spellings over %d instances" % (seven, 7 * len(HOSTS)))
print("identical in every field at all four hosts: %s" % ", ".join(identical))
