from pathlib import Path
import json
import sys
sys.path.insert(0,str(Path('skills/scripts').resolve()))
import check_skill_files as c

root=Path('skills/work-planner').resolve()
paths=sorted(p for p in root.rglob('*.md') if 'test' not in p.relative_to(root).parts)
documents={p:c.scan(p) for p in paths}
operations={}
for path,(lines,fenced,heads) in documents.items():
    if path.parent.name!='artifacts':continue
    section=next((i for i,d,t in heads if d==2 and t=='Operations'),None)
    if section is None:continue
    stop=c.heading_end(heads,section,2,len(lines))
    for start,depth,title in heads:
        if section<start<stop and depth==3:
            end=c.heading_end(heads,start,3,len(lines))
            operations[(path,c.anchor_of(title))]={'file':str(path.relative_to(root)),'operation':title,'anchor':c.anchor_of(title),'start':start,'end':end,'body':'\n'.join(lines[start:end]),'references':[]}

for path,(lines,fenced,heads) in documents.items():
    entry=c.contract(path,{})
    for index,target,kind in c.citation_kinds(path,entry):
        name,_,anchor=target.partition('#')
        destination=(path.parent/name).resolve() if name else path
        key=(destination,c.anchor_of(anchor))
        if key not in operations:continue
        enclosing=[(i,d,t) for i,d,t in heads if i<index<c.heading_end(heads,i,d,len(lines))]
        owner=next(((i,t) for i,d,t in reversed(enclosing) if d==3 and not c.HEADING_STEP.match(t)),None)
        parent=owner or next(((i,t) for i,d,t in reversed(enclosing) if d==2 and t=='Procedure'),(-1,''))
        operations[key]['references'].append({'file':str(path.relative_to(root)),'line':index+1,'kind':kind,'caller':parent[1],'caller_start':parent[0],'text':lines[index]})
result=list(operations.values())
Path(sys.argv[1]).write_text(json.dumps(result,indent=2)+'\n')
for row in result:
    refs=row['references']; calls=[r for r in refs if r['kind']==c.STEP]
    if len(refs)<=1:
        print(row['file'],row['operation'],'references',len(refs),'calls',len(calls))
        for ref in refs:print(' ',ref['file'],ref['caller'],ref['line'],ref['kind'],ref['text'])
print('Total operations',len(result),'single reference',sum(len(r['references'])==1 for r in result),'zero',sum(not r['references'] for r in result))
