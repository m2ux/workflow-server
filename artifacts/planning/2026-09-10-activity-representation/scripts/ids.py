#!/usr/bin/env python3
"""How many step ids are load-bearing vs droppable under derive-from-tail."""
import os, re, sys
from collections import Counter
import yaml

ROOT = sys.argv[1]
files = []
for dp, _d, fn in os.walk(ROOT):
    if os.path.basename(dp) != 'activities': continue
    files += [os.path.join(dp, f) for f in fn if f.endswith(('.yaml','.yml'))]
files.sort()

droppable, keep = [], []
for p in files:
    doc = yaml.safe_load(open(p, encoding='utf-8'))
    if not isinstance(doc, dict): continue
    def walk(steps):
        techs = [s for s in steps if isinstance(s, dict) and s.get('kind') == 'technique']
        tails = Counter()
        for s in techs:
            t = s.get('technique'); n = t if isinstance(t, str) else (t or {}).get('name','')
            tails[n.split('::')[-1]] += 1
        for s in steps:
            if not isinstance(s, dict): continue
            if s.get('kind') == 'loop': walk(s.get('steps') or [])
            if s.get('kind') != 'technique': continue
            t = s.get('technique'); n = t if isinstance(t, str) else (t or {}).get('name','')
            tail = n.split('::')[-1]
            sid = s.get('id')
            # Load-bearing only where the derived tail collides in scope.
            (keep if tails[tail] > 1 else droppable).append((p, sid, tail))
    walk(doc.get('steps') or [])

# byte cost of the droppable id lines as authored
drop_bytes = 0
dropset = Counter()
for p, sid, tail in droppable: dropset[(p, sid)] += 1
for p in files:
    for line in open(p, encoding='utf-8'):
        m = re.match(r'^\s*-?\s*id:\s*(\S+)\s*$', line)
        if m and (p, m.group(1)) in dropset:
            drop_bytes += len(line) + 1

print(f"technique steps                          : {len(droppable) + len(keep)}")
print(f"  id droppable (tail unique in scope)    : {len(droppable)}  -> {drop_bytes} bytes")
print(f"  id load-bearing (tail collides)        : {len(keep)}")
print()
print("Of the droppable set, how far the tail sits from the authored id:")
import difflib
b = Counter()
for _p, sid, tail in droppable:
    if sid == tail: b['identical — pure noise today'] += 1
    elif difflib.SequenceMatcher(None, sid or '', tail).ratio() >= 0.6: b['near-synonym — tail reads fine'] += 1
    else: b['authored name differs — judgement call'] += 1
for k, v in b.most_common(): print(f"  {k:42s} {v:4d}")
