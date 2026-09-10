#!/usr/bin/env python3
"""Cross-file duplication in activity YAML: repeated variable declarations,
and how close step ids sit to the technique names they bind."""
import os, re, sys, json, difflib
from collections import Counter, defaultdict
import yaml

ROOT = sys.argv[1]
files = []
for dirpath, _d, filenames in os.walk(ROOT):
    if os.path.basename(dirpath) != 'activities':
        continue
    for f in filenames:
        if f.endswith(('.yaml', '.yml')):
            files.append(os.path.join(dirpath, f))
files.sort()

def wf_of(path):
    return os.path.relpath(path, ROOT).split(os.sep)[0]

# ---------- 1. variable declaration duplication ----------
decls = defaultdict(list)          # (workflow, name) -> [ (path, serialized) ]
decl_bytes_total = 0
for path in files:
    doc = yaml.safe_load(open(path, encoding='utf-8'))
    if not isinstance(doc, dict): continue
    for w in ((doc.get('variables') or {}).get('writes') or []):
        if not isinstance(w, dict): continue
        ser = yaml.safe_dump(w, sort_keys=True).strip()
        decl_bytes_total += len(ser)
        decls[(wf_of(path), w['name'])].append((path, ser))

dup_groups = {k: v for k, v in decls.items() if len(v) > 1}
identical_dups = 0
divergent_dups = 0
wasted = 0
divergent_examples = []
for (wf, name), entries in sorted(dup_groups.items(), key=lambda kv: -len(kv[1])):
    sers = {e[1] for e in entries}
    extra = sum(len(e[1]) for e in entries[1:])
    wasted += extra
    if len(sers) == 1:
        identical_dups += 1
    else:
        divergent_dups += 1
        if len(divergent_examples) < 12:
            divergent_examples.append((wf, name, len(entries), len(sers),
                                       [os.path.basename(e[0]) for e in entries]))

print("=== variables.writes declaration duplication ===")
print(f"  distinct (workflow, name) declarations : {len(decls)}")
print(f"  declared in >1 activity of same workflow: {len(dup_groups)}")
print(f"     of those, byte-identical everywhere : {identical_dups}")
print(f"     of those, DIVERGENT between copies  : {divergent_dups}")
print(f"  total serialized declaration bytes     : {decl_bytes_total}")
print(f"  bytes in 2nd..Nth copies (removable)   : {wasted}  ({100*wasted/decl_bytes_total:.1f}% of declarations)")
print("\n  divergent copies (same name, different text in same workflow):")
for wf, name, n, variants, where in divergent_examples:
    print(f"    {wf}/{name}: {n} copies, {variants} variants -> {', '.join(where[:4])}")

# reads duplication
read_counts = Counter()
reads_bytes = 0
for path in files:
    doc = yaml.safe_load(open(path, encoding='utf-8'))
    if not isinstance(doc, dict): continue
    for r in ((doc.get('variables') or {}).get('reads') or []):
        read_counts[(wf_of(path), r)] += 1
        reads_bytes += len(str(r)) + 7
print(f"\n  reads[] entries: {sum(read_counts.values())} across {len(read_counts)} distinct (wf,name); ~{reads_bytes} bytes")

# ---------- 2. step id vs technique name proximity ----------
print("\n=== step id vs bound technique name ===")
buckets = Counter()
forced = 0
samples = defaultdict(list)
for path in files:
    doc = yaml.safe_load(open(path, encoding='utf-8'))
    if not isinstance(doc, dict): continue
    def walk(steps, scope):
        techs = [s for s in steps if isinstance(s, dict) and s.get('kind') == 'technique']
        tail_counts = Counter()
        for s in techs:
            t = s.get('technique'); n = t if isinstance(t, str) else (t or {}).get('name','')
            tail_counts[n.split('::')[-1]] += 1
        for s in steps:
            if not isinstance(s, dict): continue
            if s.get('kind') == 'loop':
                walk(s.get('steps') or [], scope + '/' + str(s.get('id')))
            if s.get('kind') != 'technique': continue
            t = s.get('technique'); n = t if isinstance(t, str) else (t or {}).get('name','')
            tail = n.split('::')[-1]
            sid = s.get('id')
            if sid == tail:
                buckets['exact match (id omittable today)'] += 1
            elif tail_counts[tail] > 1:
                buckets['collision: same technique twice in scope'] += 1
            else:
                r = difflib.SequenceMatcher(None, sid, tail).ratio()
                b = ('near-synonym  (>=0.6 similar)' if r >= 0.6
                     else 'shares a word (partial)' if set(sid.split('-')) & set(tail.split('-'))
                     else 'genuinely distinct name')
                buckets[b] += 1
                if len(samples[b]) < 10: samples[b].append((sid, tail))
    walk(doc.get('steps') or [], '')

tot = sum(buckets.values())
for k, v in buckets.most_common():
    print(f"  {k:42s} {v:4d}  {100*v/tot:5.1f}%")
for k in ['near-synonym  (>=0.6 similar)', 'shares a word (partial)', 'genuinely distinct name']:
    if samples[k]:
        print(f"\n  -- {k} --")
        for sid, tail in samples[k]:
            print(f"     id: {sid:34s} technique tail: {tail}")
