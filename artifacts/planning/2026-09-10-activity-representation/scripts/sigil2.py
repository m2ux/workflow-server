#!/usr/bin/env python3
"""Would a kind sigil in the id resolve any real collision, and what would it cost?"""
import os, sys
from collections import Counter, defaultdict
import yaml

ROOT = sys.argv[1]
files = []
for dp, _d, fn in os.walk(ROOT):
    if os.path.basename(dp) != 'activities': continue
    files += [os.path.join(dp, f) for f in fn if f.endswith(('.yaml','.yml'))]
files.sort()

same_kind, cross_kind = 0, 0
examples = []
tech_scalar_candidates = 0

for p in files:
    doc = yaml.safe_load(open(p, encoding='utf-8'))
    if not isinstance(doc, dict): continue
    def walk(steps, scope):
        global same_kind, cross_kind, tech_scalar_candidates
        # what the DERIVED default id would be, per step, with its kind
        derived = []
        for s in steps:
            if not isinstance(s, dict): continue
            k = s.get('kind')
            if k == 'technique':
                t = s.get('technique'); n = t if isinstance(t, str) else (t or {}).get('name','')
                derived.append((n.split('::')[-1], k))
            else:
                derived.append((s.get('id'), k))
        counts = Counter(d for d, _ in derived)
        for name, n in counts.items():
            if n < 2: continue
            kinds = {k for d, k in derived if d == name}
            if len(kinds) == 1: same_kind += 1
            else:
                cross_kind += 1
                examples.append((os.path.relpath(p, ROOT), name, sorted(kinds)))
        # technique steps that could collapse to a single scalar under a sigil
        for s in steps:
            if not isinstance(s, dict) or s.get('kind') != 'technique': continue
            t = s.get('technique')
            if not isinstance(t, str): continue          # structured binding needs a map anyway
            tail = t.split('::')[-1]
            if s.get('id') in (None, tail) and counts[tail] < 2 and not (s.keys() - {'kind','id','technique'}):
                tech_scalar_candidates += 1
        for s in steps:
            if isinstance(s, dict) and s.get('kind') == 'loop':
                walk(s.get('steps') or [], scope + '/loop')
    walk(doc.get('steps') or [], '')

print("Collisions a kind sigil would have to resolve:")
print(f"  derived-name collisions BETWEEN steps of the SAME kind  : {same_kind}")
print(f"  derived-name collisions ACROSS different kinds          : {cross_kind}")
for e in examples[:10]: print(f"     {e[0]}: '{e[1]}' as {e[2]}")

print(f"\nTechnique steps reducible to a bare scalar under a sigil : {tech_scalar_candidates}")
saving = tech_scalar_candidates * (len('technique: ') - len("'*'"))
print(f"  best-case saving at 8 chars each                       : {saving} bytes "
      f"({100*saving/451365:.1f}% of corpus)")
