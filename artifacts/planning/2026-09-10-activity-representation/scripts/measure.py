#!/usr/bin/env python3
"""Measure structural redundancy in activity YAML across the workflow corpus."""
import os, re, sys, json
from collections import Counter

try:
    import yaml
except ImportError:
    print("no pyyaml"); sys.exit(1)

ROOT = sys.argv[1]

files = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    if os.path.basename(dirpath) != 'activities':
        continue
    for f in filenames:
        if f.endswith('.yaml') or f.endswith('.yml'):
            files.append(os.path.join(dirpath, f))
files.sort()

total_bytes = 0
total_lines = 0
stats = Counter()
kind_counter = Counter()
id_status = Counter()
explicit_but_default = []
explicit_and_different = []
per_kind_lines = Counter()

def walk_steps(steps, sink):
    for s in steps:
        if not isinstance(s, dict): continue
        sink.append(s)
        if s.get('kind') == 'loop':
            walk_steps(s.get('steps') or [], sink)

def default_step_id(name):
    return name.split('::')[-1]

for path in files:
    raw = open(path, encoding='utf-8').read()
    total_bytes += len(raw)
    total_lines += raw.count('\n') + 1
    try:
        doc = yaml.safe_load(raw)
    except Exception as e:
        print("PARSE FAIL", path, e); continue
    if not isinstance(doc, dict): continue
    stats['activities'] += 1
    steps = []
    walk_steps(doc.get('steps') or [], steps)
    stats['steps'] += len(steps)
    for s in steps:
        k = s.get('kind', '<none>')
        kind_counter[k] += 1
        if k == 'technique':
            tech = s.get('technique')
            name = tech if isinstance(tech, str) else (tech or {}).get('name', '')
            sid = s.get('id')
            if sid is None:
                id_status['omitted'] += 1
            elif sid == default_step_id(name):
                id_status['explicit-equals-default'] += 1
                explicit_but_default.append((path, sid, name))
            else:
                id_status['explicit-differs'] += 1
                explicit_and_different.append((path, sid, name))
            # structured vs string binding
            if isinstance(tech, dict):
                stats['structured-binding'] += 1
            else:
                stats['string-binding'] += 1

# Line-level counts by regex (what the wire form actually costs)
kind_lines = Counter()
id_lines = 0
for path in files:
    for line in open(path, encoding='utf-8'):
        m = re.match(r'^\s*-?\s*kind:\s*(\S+)', line)
        if m: kind_lines[m.group(1)] += 1
        if re.match(r'^\s*-?\s*id:\s*\S+', line): id_lines += 1

print(json.dumps({
    'files': len(files),
    'total_bytes': total_bytes,
    'total_lines': total_lines,
    'stats': dict(stats),
    'kinds': dict(kind_counter),
    'technique_id_status': dict(id_status),
    'kind_lines_in_text': dict(kind_lines),
    'id_lines_in_text': id_lines,
}, indent=2))

print("\n--- explicit id DIFFERS from derivable default (sample 40) ---")
for p, sid, name in explicit_and_different[:40]:
    print(f"  {sid:34s} <- {name}   ({os.path.relpath(p, ROOT)})")
print(f"  ... {len(explicit_and_different)} total")
