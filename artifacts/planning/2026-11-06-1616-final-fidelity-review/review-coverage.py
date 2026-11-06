from pathlib import Path
import difflib
import html
import json
import re
import subprocess
import sys

sys.path.insert(0, str(Path('skills/scripts').resolve()))
import check_skill_files as c

old=Path('/tmp/project17-fidelity-start/skills/work-planner')
new=Path('skills/work-planner')
def normalize(s):
    s=re.sub(r'\[([^\]]+)\]\([^\n]+?\)',r'\1',s)
    s=html.unescape(s).replace('**','').replace('*','')
    return ' '.join(s.split())

fields=[]
for p in sorted(old.rglob('*.md')):
    rel=p.relative_to(old); q=new/rel
    lines,_,heads=c.scan(p)
    field=next((i for i,d,t in heads if d==2 and t=='Fields'),None)
    if field is None:continue
    end=c.heading_end(heads,field,2,len(lines))
    for i,d,t in heads:
        if not (field<i<end and d==3):continue
        stop=c.heading_end(heads,i,3,len(lines))
        body=normalize('\n'.join(lines[i+1:stop]))
        target=normalize(q.read_text())
        if body and body not in target:
            fields.append({'file':str(rel),'field':t,'original':body})
flags=set(re.findall(r'(?<![\w-])--[a-z][\w-]*','\n'.join(p.read_text() for p in old.rglob('*.md'))))
current=set(re.findall(r'(?<![\w-])--[a-z][\w-]*','\n'.join(p.read_text() for p in new.rglob('*.md'))))
scripts=subprocess.run(['git','diff','03d353300ca4804194fd50d316d73e3bf1270d1d','--','skills/work-planner/scripts'],capture_output=True,text=True,check=True).stdout
report={'original_files':len(list(old.rglob('*.md'))),'current_files':len(list(new.rglob('*.md'))),'original_fields_requiring_semantic_review':fields,'missing_global_command_flags':sorted(flags-current),'planner_script_diff':scripts}
Path('/tmp/project17-preservation-coverage.json').write_text(json.dumps(report,indent=2)+'\n')
print('Fields requiring semantic review:',len(fields))
for row in fields:print(row['file'],row['field'],row['original'])
print('Missing global flags:',sorted(flags-current))
print('Planner script diff:',scripts)
