from pathlib import Path
from collections import Counter
import json,re,subprocess,sys
sys.path.insert(0,str(Path('skills/scripts').resolve()))
import check_skill_files as c
root=Path('skills/work-planner')
rows=json.loads(Path(sys.argv[1]).read_text())
base=sys.argv[2]
changed={row['file'] for row in rows}|{'guidelines.md'}
blocks=templates=0
for path in sorted(root.rglob('*.md')):
    prior=subprocess.run(['git','show',base+':'+str(path)],capture_output=True,text=True,check=True).stdout
    now=path.read_text();relative=str(path.relative_to(root))
    old=re.findall(r'<big><pre>.*?</pre></big>',prior,re.S)
    assert old==re.findall(r'<big><pre>.*?</pre></big>',now,re.S),relative
    blocks+=len(old)
    assert Counter(m[0] for m in c.LINK.finditer(prior))==Counter(m[0] for m in c.LINK.finditer(now)),relative+' links'
    snapshots=[]
    for value in (prior,now):
        temp=Path('/tmp/project17-condition-section.md');temp.write_text(value)
        lines,_,heads=c.scan(temp)
        snapshots.append(([(d,t) for _,d,t in heads],['\n'.join(lines[i+1:c.heading_end(heads,i,d,len(lines))]).strip() for i,d,t in heads if d==3 and t=='Template']))
    assert snapshots[0]==snapshots[1],relative+' headings/templates'
    templates+=len(snapshots[0][1])
    if relative not in changed:assert prior==now,relative+' unexpected change'
for row in rows:
    lines,_,heads=c.scan(root/row['file'])
    first=next(i for i,d,t in heads if d==3 and t==row['command'])
    end=c.heading_end(heads,first,3,len(lines))
    current='\n'.join(lines[first+1:end]).strip()
    before,payload=current.split('<big><pre>',1)
    assert row['after'].removeprefix('- ') in before,row['command']+' missing condition'
    assert not payload.split('</pre></big>',1)[1].strip(),row['command']+' remaining detail'
print(json.dumps({'single_items_moved':len(rows),'markdown_files_checked':len(list(root.rglob('*.md'))),'identical_invocation_blocks':blocks,'identical_templates':templates,'headings_and_links':'identical','reading_boundaries':'identical'},indent=2))
