#!/usr/bin/env python3
"""Precise, parse-based split of technique references by form."""
import os, sys
from collections import Counter
import yaml
ROOT = sys.argv[1]
files = []
for dp, _d, fn in os.walk(ROOT):
    if os.path.basename(dp) != 'activities': continue
    files += [os.path.join(dp, f) for f in fn if f.endswith(('.yaml','.yml'))]
c = Counter()
for p in sorted(files):
    doc = yaml.safe_load(open(p, encoding='utf-8'))
    if not isinstance(doc, dict): continue
    def walk(steps):
        for s in steps:
            if not isinstance(s, dict): continue
            if s.get('kind') == 'loop': walk(s.get('steps') or [])
            if s.get('kind') != 'technique': continue
            t = s.get('technique')
            struct = isinstance(t, dict)
            name = t.get('name','') if struct else t
            c[('structured' if struct else 'string', 'qualified' if '::' in name else 'bare')] += 1
    walk(doc.get('steps') or [])
tot = sum(c.values())
for k, v in sorted(c.items()):
    print(f"  {k[0]:11s} {k[1]:10s} {v:4d}")
bare = c[('string','bare')] + c[('structured','bare')]
print(f"\n  total technique steps : {tot}")
print(f"  no '::' anywhere      : {bare}  ({100*bare/tot:.0f}%)")
