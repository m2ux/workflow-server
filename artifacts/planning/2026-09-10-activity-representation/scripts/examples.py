#!/usr/bin/env python3
"""Show the marker-action steps and one real example of each kind, kind stripped."""
import os, sys, yaml
ROOT = sys.argv[1]
files = []
for dp, _d, fn in os.walk(ROOT):
    if os.path.basename(dp) != 'activities': continue
    files += [os.path.join(dp, f) for f in fn if f.endswith(('.yaml','.yml'))]
files.sort()

def dump(step, indent='  '):
    bare = {k: v for k, v in step.items() if k != 'kind'}
    if bare.get('loopType'):                     # trim loop bodies for display
        bare = {**bare, 'steps': ['…' + str(len(bare.get('steps') or [])) + ' nested steps…']}
    y = yaml.safe_dump(bare, sort_keys=False, allow_unicode=True, width=100).rstrip()
    lines = y.split('\n')
    return indent + '- ' + lines[0] + '\n' + '\n'.join(indent + '  ' + l for l in lines[1:])

markers, seen = [], {}
for p in files:
    doc = yaml.safe_load(open(p, encoding='utf-8'))
    if not isinstance(doc, dict): continue
    def walk(steps):
        for s in steps:
            if not isinstance(s, dict): continue
            if s.get('kind') == 'loop': walk(s.get('steps') or [])
            k = s.get('kind')
            if k == 'action' and not s.get('actions'): markers.append((p, s))
            if k == 'checkpoint' and 'ref' in s and 'checkpoint-ref' not in seen:
                seen['checkpoint-ref'] = (p, s)
            if k == 'technique' and 'actions' in s and 'technique+actions' not in seen:
                seen['technique+actions'] = (p, s)
            if k not in seen and k: seen[k] = (p, s)
    walk(doc.get('steps') or [])

print("=== the 2 pure marker action steps (no distinguishing field at all) ===")
for p, s in markers:
    print(f"\n# {os.path.relpath(p, ROOT)}")
    print(dump(s))

for label in ['technique', 'technique+actions', 'action', 'checkpoint', 'checkpoint-ref', 'loop']:
    if label not in seen: continue
    p, s = seen[label]
    print(f"\n=== {label} ===")
    print(f"# {os.path.relpath(p, ROOT)}")
    print(dump(s))
