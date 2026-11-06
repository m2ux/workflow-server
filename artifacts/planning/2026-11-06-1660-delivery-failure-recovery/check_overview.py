import json
import re
from pathlib import Path

root = Path('/home/mike1/projects/dev/workflow-server/.worktrees/pr/1660')
out = Path('/tmp/deliver17-20261106/e04-overview')
head = 'ff94f4a28ee0134a10f46ba571a9795f5e6841f1'
text = (out / 'overview.md').read_text()

def rows(path):
    markdown = json.loads(path.read_text())['markdown']
    return [[cell.strip() for cell in line.strip('|').split('|')]
            for line in markdown.splitlines()[2:]]

call_edges = {(row[0], row[2]) for row in rows(out / 'call-edges.json')}
path = [
    'Method:skills/work-planner/test/test_hotfix_readiness.py:HotFixReadiness.test_changed_head_after_ready_restores_before_repair#0',
    'Function:skills/work-planner/test/test_hotfix_readiness.py:walk',
    'Function:skills/work-planner/test/test_plan_mode.py:section',
    'Function:skills/scripts/check_skill_files.py:parse',
    'Function:skills/scripts/check_skill_files.py:scan_blocks',
]
assert all(pair in call_edges for pair in zip(path, path[1:]))
contains = {(row[0], row[2]) for row in rows(out / 'section-edges.json')}
prefix = 'Section:skills/work-planner/protocols/epic-integration.md:'
procedure, merge = prefix+'L7:Procedure', prefix+'L48:3. Merge or Hand Off'
expected = [(procedure, merge), (procedure, prefix+'L74:4. Confirm the Result')]
expected += [(merge, prefix+suffix) for suffix in (
    'L54:Human Handoff', 'L58:Harness Denial', 'L62:GitHub Refusal', 'L70:Confirmed Merge')]
assert all(edge in contains for edge in expected)
links = re.findall(r'https://github.com/m2ux/workflow-server/blob/([^/]+)/([^\s)#]+)#L(\d+)(?:-L(\d+))?', text)
for revision, filename, start, end in links:
    assert revision == head, revision
    lines = (root / filename).read_text().splitlines()
    assert 1 <= int(start) <= int(end or start) <= len(lines), (filename, start, end, len(lines))
blocks = re.findall(r'```mermaid\n(.*?)\n```', text, re.S)
assert len(blocks) == 3
assert blocks[0].count('-->|contains|') == 6
assert blocks[1].count('participant ') == 5
assert blocks[1].count('->>') == 4
assert len(re.findall(r'^    state "', blocks[2], re.M)) == 5
assert (out/'measurements.md').is_file()
meta = json.loads(Path('/tmp/deliver17-20261106/gitnexus-e04/meta.json').read_text())
assert meta['lastCommit'] == head
summary = json.loads((out/'context-summary.json').read_text())
assert summary['intersecting_nodes'] == 102 and not summary['unavailable'] and not summary['processes']
result = dict(head=head, inspected_contexts=102, unavailable_contexts=0, reported_affected_processes=0,
              measured_containment_edges=len(expected), measured_nested_call_edges=len(path)-1,
              checked_source_permalinks=len(links), diagram_nodes=[7,5,5],
              mermaid_renderer='not installed; topology, fences and source links checked')
(out/'overview-check.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result))
