"""Classify every corpus technique binding by how each of the two resolvers reads it.

parseFragmentRef (src/loaders/fragment-resolver.ts:38-45): split on '::'; one segment is a bare
name; two segments make the head a WORKFLOW; three or more throw.

readTechniqueWithSource (src/loaders/technique-loader.ts:127-170): with '::' present, the head is a
workflow prefix only when <corpus>/<head>/techniques exists; otherwise the head is a GROUP resolved
against [declaring workflow, meta], at unbounded depth.
"""
import os
import sys
import yaml

CORPUS = sys.argv[1]


def walk_steps(steps):
    for step in steps or []:
        if not isinstance(step, dict):
            continue
        yield step
        for key in ('steps', 'body'):
            if isinstance(step.get(key), list):
                yield from walk_steps(step[key])


def technique_ref(step):
    t = step.get('technique')
    if isinstance(t, str):
        return t
    if isinstance(t, dict) and isinstance(t.get('name'), str):
        return t['name']
    return None


workflows = sorted(
    d for d in os.listdir(CORPUS)
    if os.path.isfile(os.path.join(CORPUS, d, 'workflow.yaml'))
)
has_techniques_dir = {w for w in workflows if os.path.isdir(os.path.join(CORPUS, w, 'techniques'))}
# The probe is existsSync on <corpus>/<head>/techniques -- it does not require a workflow.yaml.
probe_ok = {
    d for d in os.listdir(CORPUS)
    if os.path.isdir(os.path.join(CORPUS, d, 'techniques'))
}

buckets = {'bare': [], 'one-sep-workflow': [], 'one-sep-group': [], 'deep': []}
activity_files = 0
steps_total = 0
kinds = {}

for wf in workflows:
    adir = os.path.join(CORPUS, wf, 'activities')
    if not os.path.isdir(adir):
        continue
    recursive = len(sys.argv) > 2 and sys.argv[2] == 'recursive'
    if recursive:
        found = []
        for base, _dirs, files in os.walk(adir):
            for f in files:
                if f.endswith(('.yaml', '.yml')):
                    found.append(os.path.relpath(os.path.join(base, f), adir))
        found.sort()
    else:
        found = sorted(n for n in os.listdir(adir) if n.endswith(('.yaml', '.yml')))
    for name in found:
        path = os.path.join(adir, name)
        activity_files += 1
        doc = yaml.safe_load(open(path, encoding='utf-8')) or {}
        for step in walk_steps(doc.get('steps')):
            steps_total += 1
            k = step.get('kind')
            kinds[k] = kinds.get(k, 0) + 1
            ref = technique_ref(step)
            if ref is None:
                continue
            site = wf + '/' + name
            segs = ref.split('::')
            if len(segs) == 1:
                buckets['bare'].append((ref, site))
            elif len(segs) == 2:
                if segs[0] in probe_ok:
                    buckets['one-sep-workflow'].append((ref, site))
                else:
                    buckets['one-sep-group'].append((ref, site))
            else:
                buckets['deep'].append((ref, site))

total = sum(len(v) for v in buckets.values())
print('corpus root:', CORPUS)
print('workflows with a workflow.yaml:', len(workflows))
print('directories carrying a techniques/ dir (what the probe sees):', sorted(probe_ok))
print('activity files parsed:', activity_files)
print('steps (all depths):', steps_total, kinds)
print()
print('technique bindings total:', total)
for key, label in (
    ('bare', 'bare name -- both rules agree'),
    ('one-sep-workflow', 'one separator, head IS a techniques dir -- both agree'),
    ('one-sep-group', 'one separator, head is NOT a techniques dir -- DISAGREE'),
    ('deep', 'two or more separators -- parseFragmentRef THROWS'),
):
    print('  %-4d  %s' % (len(buckets[key]), label))
agree = len(buckets['bare']) + len(buckets['one-sep-workflow'])
disagree = len(buckets['one-sep-group']) + len(buckets['deep'])
print()
print('agree: %d   disagree: %d   (of %d)' % (agree, disagree, total))
print()
print('distinct refs in the disagreeing one-separator bucket:',
      len({r for r, _ in buckets['one-sep-group']}))
print('distinct refs in the throwing bucket:', len({r for r, _ in buckets['deep']}))
print('the throwing refs:')
for r in sorted({r for r, _ in buckets['deep']}):
    n = sum(1 for x, _ in buckets['deep'] if x == r)
    print('   %-60s x%d' % (r, n))
print()
print('distinct heads read as a workflow by parseFragmentRef and as a group by the technique loader:')
heads = {}
for r, _ in buckets['one-sep-group']:
    h = r.split('::')[0]
    heads[h] = heads.get(h, 0) + 1
for h in sorted(heads, key=lambda x: -heads[x]):
    print('   %-40s %d' % (h, heads[h]))

print()
print('the one-separator refs whose head IS a techniques directory (both rules agree):')
for r, s in sorted(buckets['one-sep-workflow']):
    print('   %-50s %s' % (r, s))
