#!/usr/bin/env python3
"""Verify immutable audit coverage and evidence integrity without source mutation."""
import argparse,collections,hashlib,json,re,subprocess
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--project',required=True,type=Path,help='Git checkout containing the recorded source commit')
args=parser.parse_args()
here=Path(__file__).resolve().parent
load=lambda name:json.loads((here/name).read_text())
manifest=load('source-manifest.json'); revision=manifest['revision']
def git(*parts):return subprocess.check_output(['git','-C',str(args.project),*parts])
files=manifest['files']; paths={r['file'] for r in files}
assert len(paths)==len(files)==84
tracked=git('ls-tree','-r','--name-only',revision,'skills/work-planner').decode().splitlines()
governed={p.removeprefix('skills/work-planner/') for p in tracked if Path(p).suffix in ('.md','.py','.json') and not any(x in Path(p).parts for x in ('test','__pycache__'))}
assert governed==paths,(sorted(governed-paths),sorted(paths-governed))
source={}
for row in files:
    raw=git('show',revision+':skills/work-planner/'+row['file'])
    assert hashlib.sha256(raw).hexdigest()==row['sha256'],row['file']
    assert len(raw.decode().splitlines())==row['lines'],row['file']
    source[row['file']]=raw.decode()
print('PASS: all 84 governed paths, SHA-256 hashes and line counts match immutable source '+revision)

found={}
for file,text in source.items():
    if not file.endswith('.md'):continue
    lines=text.splitlines(); headings=[]; fence=None
    for i,line in enumerate(lines):
        f=re.match(r'^(`{3,}|~{3,})',line)
        if f:
            if fence is None:fence=f[1][0]
            elif fence==f[1][0]:fence=None
            continue
        h=re.match(r'^(#{1,6}) (.+)$',line) if not fence else None
        if h:headings.append((i,len(h[1]),h[2]))
    in_fields=False
    for n,(i,level,title) in enumerate(headings):
        if level==2:in_fields=title=='Fields'
        if not in_fields or level!=3:continue
        end=next((j for j,l,t in headings[n+1:] if l<=3),len(lines))
        key=(file,i+1)
        assert key not in found
        found[key]=(title,end,'\n'.join(lines[i+1:end]).strip())
ledger=load('fields-ledger.json')
assert len(ledger)==len(found)==518
assert {(r['file'],r['line']) for r in ledger}==set(found)
for row in ledger:
    assert (row['heading'],row['end'],row['body'])==found[(row['file'],row['line'])]
    assert row['revision']==revision
    assert row['owner'] and row['reason'] and row['disposition'] and row['review_basis']
    assert row['classification'] in ('shape','invariant','mixed')
counts=dict(collections.Counter(r['classification'] for r in ledger))
assert counts=={'shape':490,'invariant':27,'mixed':1},counts
assert next(r['source'] for r in ledger if r['classification']=='mixed')=='artifacts/dependency-graph.md#edges'
assert {r['file'] for r in load('file-ledger.json')}==paths
print('PASS: every 518 Fields heading has exact source/body/line coverage, owner, classification and disposition '+str(counts))

decisions=load('policy-decisions.json')
assert {r['id'] for r in decisions}=={'P1','P2','P3','P4'}
assert all(r['confirmed'] for r in decisions)
p2=next(r for r in decisions if r['id']=='P2')
assert p2['completed_boundary']=='Completed children remain Done (Recommended)'
assert p2['supersedes'] and 'Dedicated' in p2['delivery']
for file in ('policy-observations.json','pause-observations.json','context-ledger.json'):
    value=load(file)
    # Captures retain an explicit source revision either at the root or per case.
    assert revision in json.dumps(value),file
print('PASS: P1–P4 confirmed; P2 supersession/Done boundary and current-pin observation provenance retained')

metadata=load('e06-metadata.json'); rows=metadata['component_rows']
assert len(rows)==19
assert len({r['component'] for r in rows})==19
assert {r['task'] for r in rows}=={f'W{i:02}' for i in range(1,20)}
assert {r['criterion'] for r in rows}=={f'AC{i}' for i in range(1,20)}
units=collections.Counter(r['unit'] for r in rows)
assert sorted(units.values())==[3,4,6,6],units
draft=(here/'e06-epic-draft.md').read_text()
for row in rows:
    assert (here/'e06-work-items'/f'{row["task"].lower()}.md').is_file()
    assert f'**{row["criterion"]}.**' in draft
    assert f'**Component:** {row["component"]}' in (here/'e06-work-items'/f'{row["task"].lower()}.md').read_text()
    line=next(x for x in draft.splitlines() if x.startswith(f'| [{row["task"]}]'))
    cells=[x.strip() for x in line.split('|')[1:-1]]
    expected_dependencies={'A':'','B':'W06','C':'W12','D':'W06'}
    assert cells[3]==expected_dependencies[row['unit']],(row['task'],cells[3])
    peers={r['task'] for r in rows if r['unit']==row['unit']} - {row['task']}
    assert {x.strip() for x in cells[4].split(',')}==peers
    assert not (set(cells[3].split(', ')) & (peers|{row['task']}))
assert 'As its source-selected route' not in draft
assert 'Active work keeps running' not in draft
assert 'E02 W02\'s engineering audit commit is evidence' in draft
refresh=load('source-refresh.json')
for ancestor in (refresh['initial_revision'],refresh['integrated_workspace_revision']):
    subprocess.run(['git','-C',str(args.project),'merge-base','--is-ancestor',ancestor,revision],check=True)
assert len(refresh['full_tree_delta'])==7
assert set(refresh['governed_files_changed'])=={'artifacts/pull-request.md','modes/deliver-mode.md','protocols/epic-integration.md'}
print('PASS: E06 draft has 19 unique one-file components and criteria in joined groups of 6/6/4/3; both source ancestors verified')
print('PASS: reciprocal joined groups have no internal prerequisite edges; producer prerequisites are condensed and no blanket external row gate repeats whole-epic gates')
print('LIMIT: coverage checks do not prove semantic classifications, runtime correctness, a saved tracker state or implemented pause behavior')
