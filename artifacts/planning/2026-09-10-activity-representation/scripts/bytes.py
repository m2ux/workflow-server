#!/usr/bin/env python3
"""Byte-cost breakdown of activity YAML: which top-level sections and which
step-level fields consume the text, and how much is mechanically derivable."""
import os, re, sys, json
from collections import Counter
import yaml

ROOT = sys.argv[1]
files = []
for dirpath, _dirs, filenames in os.walk(ROOT):
    if os.path.basename(dirpath) != 'activities':
        continue
    for f in filenames:
        if f.endswith(('.yaml', '.yml')):
            files.append(os.path.join(dirpath, f))
files.sort()

TOP_KEYS = ['id','version','name','description','variables','techniques','bundleTechniques',
            'steps','exits','triggers','outcome','required','rules']

section_bytes = Counter()
total = 0

# Attribute each raw line to the top-level key whose block it falls in.
for path in files:
    cur = None
    for line in open(path, encoding='utf-8'):
        total += len(line)
        m = re.match(r'^([A-Za-z][A-Za-z0-9]*):', line)
        if m and m.group(1) in TOP_KEYS:
            cur = m.group(1)
        section_bytes[cur or '<preamble>'] += len(line)

# Within steps[], attribute per field line.
field_bytes = Counter()
field_lines = Counter()
in_steps = False
for path in files:
    for line in open(path, encoding='utf-8'):
        if re.match(r'^steps:', line):
            in_steps = True; continue
        if re.match(r'^[A-Za-z]', line):
            in_steps = False
        if not in_steps: continue
        m = re.match(r'^\s*-?\s*([A-Za-z][A-Za-z0-9]*):', line)
        key = m.group(1) if m else '<continuation>'
        field_bytes[key] += len(line)
        field_lines[key] += 1

print(f"TOTAL activity bytes: {total}\n")
print("--- bytes by top-level section ---")
for k, v in section_bytes.most_common():
    print(f"  {k:20s} {v:8d}  {100*v/total:5.1f}%")

print("\n--- bytes by field inside steps[] ---")
st = sum(field_bytes.values())
for k, v in field_bytes.most_common(24):
    print(f"  {k:20s} {v:8d}  {100*v/st:5.1f}% of steps   ({field_lines[k]} lines)")

# Exact cost of the two candidates the user named.
kind_bytes = field_bytes['kind']
print(f"\nkind: lines            -> {kind_bytes} bytes ({100*kind_bytes/total:.1f}% of corpus)")

# id: lines whose value equals the derivable default
redundant_id_bytes = 0
redundant_id_count = 0
for path in files:
    lines = open(path, encoding='utf-8').read().split('\n')
    for i, line in enumerate(lines):
        m = re.match(r'^(\s*)-?\s*id:\s*(\S+)\s*$', line)
        if not m: continue
        # look at the following 3 lines for a technique: ref at the same block
        for j in range(i+1, min(i+4, len(lines))):
            t = re.match(r'^\s*technique:\s*(\S+)\s*$', lines[j])
            if t and t.group(1).split('::')[-1] == m.group(2):
                redundant_id_bytes += len(line) + 1
                redundant_id_count += 1
            if re.match(r'^\s*-\s', lines[j]):
                break
print(f"id: lines equal to derived default -> {redundant_id_count} lines, {redundant_id_bytes} bytes ({100*redundant_id_bytes/total:.1f}%)")
print(f"COMBINED mechanical redundancy: {kind_bytes + redundant_id_bytes} bytes ({100*(kind_bytes+redundant_id_bytes)/total:.1f}%)")
