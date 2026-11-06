from pathlib import Path
import html
import json
import re
import shlex
import sys
sys.path.insert(0,str(Path('skills/scripts').resolve()))
import check_skill_files as c

def commands(root, before):
    found={}
    for p in root.rglob('*.md'):
        lines,_,heads=c.scan(p)
        for start,depth,title in heads:
            if depth!=3:continue
            end=c.heading_end(heads,start,depth,len(lines))
            section='\n'.join(lines[start:end])
            if before:
                match=re.search(r'```(?:bash|sh)\n(.*?)\n```',section,re.S)
            else:
                match=re.search(r'<big><pre>\n(.*?)\n</pre></big>',section,re.S)
            if not match:continue
            payload=match[1]
            payload=c.ARGUMENT_LINK.sub(lambda m:m[1],payload)
            payload=html.unescape(payload)
            payload=re.sub(r'\\\n[ \t]*',' ',payload)
            # Role links and shell wrapping are presentation; keep every value token.
            try:tokens=shlex.split(payload)
            except ValueError:tokens=payload.split()
            found[(str(p.relative_to(root)),title.replace('*',''))]=tokens
    return found

old=commands(Path('/tmp/project17-fidelity-start/skills/work-planner'),True)
new=commands(Path('skills/work-planner'),False)
changes=[]
for key,before in sorted(old.items()):
    after=new.get(key)
    if after!=before:changes.append({'file':key[0],'command':key[1],'before':before,'after':after})
Path('/tmp/project17-preservation-command-payloads.json').write_text(json.dumps({'original_count':len(old),'current_count':len(new),'differing':changes},indent=2)+'\n')
print('Original shell specifications:',len(old),'Current:',len(new),'Differing:',len(changes))
for row in changes:
    print(row['file'],row['command'])
    print(' before:',row['before'])
    print(' after: ',row['after'])
