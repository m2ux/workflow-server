#!/usr/bin/env python3
"""Strip `kind` from every step and check a shape rule recovers it exactly."""
import os, sys
from collections import Counter, defaultdict
import yaml

ROOT = sys.argv[1]
files = []
for dp, _d, fn in os.walk(ROOT):
    if os.path.basename(dp) != 'activities': continue
    files += [os.path.join(dp, f) for f in fn if f.endswith(('.yaml','.yml'))]
files.sort()

def infer(step):
    """Resolve a step's kind from its fields alone."""
    if 'technique' in step:                              return 'technique'
    if 'loopType' in step:                               return 'loop'
    if step.keys() & {'ref', 'message', 'options'}:      return 'checkpoint'
    return 'action'

wrong, ok = [], 0
fields_by_kind = defaultdict(Counter)
marker_actions = 0
tech_with_actions = 0
for p in files:
    doc = yaml.safe_load(open(p, encoding='utf-8'))
    if not isinstance(doc, dict): continue
    def walk(steps):
        global ok, marker_actions, tech_with_actions
        for s in steps:
            if not isinstance(s, dict): continue
            if s.get('kind') == 'loop': walk(s.get('steps') or [])
            declared = s.get('kind')
            bare = {k: v for k, v in s.items() if k != 'kind'}
            for k in bare: fields_by_kind[declared][k] += 1
            if declared == 'action' and not bare.get('actions'): marker_actions += 1
            if declared == 'technique' and 'actions' in bare: tech_with_actions += 1
            got = infer(bare)
            if got == declared: ok += 1
            else: wrong.append((p, declared, got, sorted(bare)))
    walk(doc.get('steps') or [])

print(f"steps checked        : {ok + len(wrong)}")
print(f"kind recovered exactly: {ok}")
print(f"MISMATCHES           : {len(wrong)}")
for p, d, g, keys in wrong[:15]:
    print(f"   {os.path.basename(p)}: declared={d} inferred={g} fields={keys}")

print(f"\naction steps with no actions[] (pure markers): {marker_actions}")
print(f"technique steps that also carry actions[]    : {tech_with_actions}")

print("\n--- field vocabulary per kind (does any discriminator overlap?) ---")
disc = ['technique', 'loopType', 'ref', 'message', 'options', 'actions', 'steps', 'name']
print(f"  {'field':12s} " + " ".join(f"{k:>11s}" for k in ['technique','action','checkpoint','loop']))
for f in disc:
    row = " ".join(f"{fields_by_kind[k][f]:>11d}" for k in ['technique','action','checkpoint','loop'])
    print(f"  {f:12s} {row}")
