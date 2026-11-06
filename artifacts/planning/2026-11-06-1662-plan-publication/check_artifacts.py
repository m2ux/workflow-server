import json
import re
from pathlib import Path

out = Path('/tmp/deliver17-20261106/e05-overview')
checkout = Path('/home/mike1/projects/dev/workflow-server/.worktrees/pr/1662-581c525137d0')
head = '581c525137d0779649ad97e89370bafbde927d34'
overview = (out/'overview.md').read_text()
measurements = (out/'measurements.md').read_text()
for text in (overview, measurements):
    for target in re.findall(r'\]\(([^)]+)\)', text):
        if not target.startswith('https://'):
            assert (out/target).is_file(), target
    for commit, path, first, last in re.findall(
            r'https://github.com/m2ux/workflow-server/blob/([0-9a-f]{40})/([^#)]+)#L(\d+)(?:-L(\d+))?', text):
        assert commit == head, commit
        count = len((checkout/path).read_text().splitlines())
        assert 1 <= int(first) <= int(last or first) <= count, (path,first,last,count)
manifest = json.loads((out/'context-manifest.json').read_text())
assert len(manifest) == 46
for entry in manifest:
    data = json.loads((out/entry['output']).read_text())
    assert data['status'] == 'found' and not data['processes']
assert json.loads((out/'containment.json').read_text())['row_count'] == 15
assert json.loads((out/'nested-fixture-path.json').read_text())['row_count'] == 1
assert json.loads((out/'index-receipt.json').read_text())['lastCommit'] == head
print('Relative links, pinned source ranges, 46 contexts and diagram evidence verified.')
print('Overview lines:',len(overview.splitlines()))
