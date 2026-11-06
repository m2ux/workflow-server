from pathlib import Path
from collections import Counter
import json,subprocess,sys
sys.path.insert(0,str(Path('skills/scripts').resolve()))
import check_skill_files as c
root=Path('skills/work-planner');base=sys.argv[1]
summary={'baseline':base,'markdown_files':0,'removed_sections':0,'removed_inventory_links':0,'identical_invocations':0,'identical_templates':0,'identical_fields_sections':0}
for path in sorted(root.rglob('*.md')):
    prior=subprocess.run(['git','show',base+':'+str(path)],check=True,capture_output=True,text=True).stdout
    original=Path('/tmp/project17-context-before.md');original.write_text(prior)
    old,_,heads=c.scan(original)
    spans=[(i,c.heading_end(heads,i,d,len(old))) for i,d,t in heads if t=='Prerequisites']
    expected=old[:]
    for first,last in reversed(spans):
        summary['removed_inventory_links']+=sum(1 for line in old[first:last] for _ in c.LINK.finditer(line))
        del expected[first:last]
    now,fenced,newheads=c.scan(path)
    assert not any(t=='Prerequisites' for _,_,t in newheads),str(path)
    assert [(d,t) for _,d,t in heads if t!='Prerequisites']==[(d,t) for _,d,t in newheads],str(path)+' heading identity'
    if path.name not in ('guidelines.md','rules.md'):
        assert '\n'.join(expected).rstrip()=='\n'.join(now).rstrip(),str(path)+' noninventory text changed'
    oldblocks=c.scan_blocks(old);newblocks=c.scan_blocks(now)
    assert ['\n'.join(old[a:b+1]) for a,b in oldblocks.invocations]==['\n'.join(now[a:b+1]) for a,b in newblocks.invocations],str(path)+' invocation'
    summary['identical_invocations']+=len(oldblocks.invocations)
    for title,depth,key in [('Template',3,'identical_templates'),('Fields',2,'identical_fields_sections')]:
        a=['\n'.join(old[i:c.heading_end(heads,i,d,len(old))]).strip() for i,d,t in heads if d==depth and t==title]
        b=['\n'.join(now[i:c.heading_end(newheads,i,d,len(now))]).strip() for i,d,t in newheads if d==depth and t==title]
        assert a==b,str(path)+' '+title
        summary[key]+=len(a)
    summary['removed_sections']+=len(spans);summary['markdown_files']+=1
summary['runtime_script_changes']=subprocess.run(['git','diff','--name-only',base,'--',str(root/'scripts')],check=True,capture_output=True,text=True).stdout.splitlines()
assert not summary['runtime_script_changes']
print(json.dumps(summary,indent=2))
