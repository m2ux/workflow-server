import json
from pathlib import Path

out=Path('/tmp/deliver17-20261106/e05-overview')
old_head='6d1ff1453bc40256c9c4803df762e8d665d62624'
new_head='581c525137d0779649ad97e89370bafbde927d34'
old_base='9a924cfdda903ca64257449d8b5bf2ff762725ce'
new_base='50da3794d96e816a1938e1643a0f79fc0596bc37'
manifest=json.loads((out/'context-manifest.json').read_text())
receipt=json.loads((out/'index-receipt.json').read_text())
assert receipt['lastCommit']==new_head and receipt['repoPath'].endswith('1662-581c525137d0')
assert len(manifest)==46 and not any(entry['processes'] for entry in manifest)
assert json.loads((out/'nested-fixture-path.json').read_text())['row_count']==1
for filename in ('overview.md','measurements.md'):
    p=out/filename
    s=p.read_text().replace(old_head,new_head).replace(old_base,new_base)
    if filename=='measurements.md':
        s=s.replace('/.worktrees/pr/1662`','/.worktrees/pr/1662-581c525137d0`')
        s=s.replace('`/tmp/deliver17-20261106/gitnexus-e05`','`/tmp/deliver17-20261106/gitnexus-e05-final`')
        s=s.replace('2026-11-06T11:36:49.764Z',receipt['indexedAt'])
        s=s.replace('all 201 covered files','all 203 covered files').replace('overall file count is 203','overall file count is 205')
        s += '''
## Refreshed Integration Evidence

The target now includes the completed E04 integration. The new base-to-head diff is rechecked in full: the same three E05 files comprise 389 added and 13 removed lines. Plan Mode, the publication fixture and the selected owning save/read/body/goal/dependency contracts and parser helpers are byte-identical to the previously reviewed source; the catalogue also preserves the E04 module/coverage rows. The complete repository tree is not claimed equal to the initial task tree.

All 46 symbol contexts and the containment/call-path queries are rerun from the clean new detached checkout against the correct `gitnexus-e05-final` index. The index accidentally built from the main project checkout is excluded; no receipt from `gitnexus-e05-refreshed` is used. Raw relationship identifiers belong to this fresh index rather than the prior index.

The exact current criterion log identifies this head and reports 14 publication tests passed. The combined current planner suite reports 1004 tests run, 1003 passed and one opt-in live Development-link check skipped; the checker reports 59 files and zero findings. These supplement the historical task logs. Previous receipts remain available through the engineering branch's published history.
'''
    p.write_text(s)
