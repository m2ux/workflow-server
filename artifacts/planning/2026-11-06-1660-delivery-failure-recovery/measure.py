import json
import os
import re
import subprocess
from pathlib import Path

root = Path('/home/mike1/projects/dev/workflow-server/.worktrees/pr/1660')
out = Path('/tmp/deliver17-20261106/e04-overview')
env = dict(os.environ, GITNEXUS_STORAGE_PATH='/tmp/deliver17-20261106/gitnexus-e04')
base = '9a924cfdda903ca64257449d8b5bf2ff762725ce'

def gx(filename, *args):
    result = subprocess.run(['gitnexus', *args], cwd=root, env=env, text=True, capture_output=True, timeout=60)
    (out / filename).write_text(result.stdout)
    (out / (filename + '.stderr')).write_text(result.stderr)
    if result.returncode:
        raise RuntimeError((args, result.returncode, result.stderr))
    return result.stdout

gx('status-before.txt', 'status')
diff = subprocess.check_output(['git', 'diff', '--unified=0', base, 'HEAD'], cwd=root, text=True)
(out / 'diff.txt').write_text(diff)
files = {}
for line in diff.splitlines():
    if line.startswith('+++ b/'):
        current = line[6:]
        files[current] = []
    elif line.startswith('@@'):
        start, count = re.search(r'\+(\d+)(?:,(\d+))?', line).groups()
        start, count = int(start), int(count or 1)
        files[current].append((start, start + max(count, 1) - 1))
query_files = '[' + ','.join(repr(path) for path in files) + ']'
result = json.loads(gx('nodes.json', 'cypher', f'MATCH (n) WHERE n.filePath IN {query_files} RETURN n.id, n.name, n.filePath, n.startLine, n.endLine', '--limit', '2000'))
lines = result['markdown'].splitlines()[2:]
nodes = []
for line in lines:
    uid, name, path, start, end = [item.strip() for item in line.strip('|').split('|')]
    if not start or not end:
        continue
    lo, hi = int(start) + 1, int(end) + 1
    if any(lo <= b and hi >= a for a, b in files[path]):
        nodes.append(dict(uid=uid, name=name, path=path, start=lo, end=hi))
(out/'changed-symbols.json').write_text(json.dumps(nodes, indent=2))
contexts = out / 'contexts'
contexts.mkdir(exist_ok=True)
processes, missing = {}, []
for index, node in enumerate(nodes):
    context = json.loads(gx(f'contexts/{index:03d}.json', 'context', '--uid', node['uid'], '--limit', '200'))
    if context.get('status') != 'found':
        missing.append(node['uid'])
    for process in context.get('processes', []):
        processes[json.dumps(process, sort_keys=True)] = process
gx('shared-section-context.json', 'context', '--uid', 'Function:skills/work-planner/test/test_plan_mode.py:section')
gx('call-edges.json', 'cypher', "MATCH (s)-[r:CodeRelation]->(t) WHERE r.type = 'CALLS' AND s.filePath IN ['skills/work-planner/test/test_hotfix_readiness.py','skills/work-planner/test/test_merge_outcomes.py','skills/work-planner/test/test_plan_mode.py','skills/scripts/check_skill_files.py'] RETURN s.id, s.name, t.id, t.name, t.filePath", '--limit', '2000')
gx('section-edges.json', 'cypher', "MATCH (s)-[r:CodeRelation]->(t) WHERE r.type = 'CONTAINS' AND s.filePath IN ['skills/work-planner/artifacts/pull-request.md','skills/work-planner/protocols/epic-integration.md','skills/work-planner/modes/deliver-mode.md'] RETURN s.id, s.name, t.id, t.name, t.filePath", '--limit', '2000')
gx('status-after.txt', 'status')
(out/'context-summary.json').write_text(json.dumps(dict(changed_files=list(files), intersecting_nodes=len(nodes), unavailable=missing, processes=list(processes.values())), indent=2))
print(json.dumps(dict(changed_files=len(files), intersecting_nodes=len(nodes), unavailable=len(missing), processes=len(processes))))
