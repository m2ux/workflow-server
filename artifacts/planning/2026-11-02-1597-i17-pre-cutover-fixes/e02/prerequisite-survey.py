"""Measure declared within-skill prerequisite edges from the current checkout."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys

root=Path.cwd()
skill=root/'skills/work-planner'
sys.path.insert(0,str(root/'skills/scripts'))
import check_skill_files as c
paths=sorted(skill.rglob('*.md'))
graph={}
for path in paths:
    lines,fenced,heads=c.scan(path)
    bounds={i:t for i,d,t in heads if d==2}
    section=None; sections={}
    for i in range(len(lines)):
        section=bounds.get(i,section); sections[i]=section
    edges=[]
    for i,target in c.targets(path,lines,fenced):
        name,_,fragment=target.partition('#')
        if sections[i]!='Prerequisites' or not name.endswith('.md') or '://' in name:continue
        destination=(path.parent/name).resolve()
        if destination.is_relative_to(skill):
            edges.append({'target':str(destination.relative_to(skill)),'fragment':fragment,'line':i+1})
    graph[str(path.relative_to(skill))]=edges
index=0;indices={};low={};stack=[];active=set();components=[]
def visit(v):
    global index
    indices[v]=low[v]=index;index+=1;stack.append(v);active.add(v)
    for edge in graph[v]:
        w=edge['target']
        if w not in indices:visit(w);low[v]=min(low[v],low[w])
        elif w in active:low[v]=min(low[v],indices[w])
    if low[v]==indices[v]:
        component=[]
        while True:
            w=stack.pop();active.remove(w);component.append(w)
            if w==v:break
        components.append(sorted(component))
for v in graph:
    if v not in indices:visit(v)
cyclic=[nodes for nodes in components if len(nodes)>1 or any(e['target']==nodes[0] for e in graph[nodes[0]])]
closures={}
for mode in ('modes/standup-mode.md','modes/revise-mode.md','modes/understand-mode.md'):
    reached=set()
    def walk(v):
        if v in reached:return
        reached.add(v)
        for e in graph.get(v,[]):
            # A prerequisite mode is read as a document; its imports load only when invoked.
            if e['target'].startswith('modes/') and e['target']!=mode:reached.add(e['target'])
            else:walk(e['target'])
    walk(mode)
    closures[mode]={'files':sorted(reached),'file_count':len(reached),'line_count':sum(len((skill/name).read_text().splitlines()) for name in reached)}
result={'revision':subprocess.run(['git','rev-parse','HEAD'],capture_output=True,text=True,check=True).stdout.strip(),'files':len(graph),'prerequisite_edges':sum(map(len,graph.values())),'graph':graph,'cyclic_components':cyclic,'route_closures':closures,'sha256':{str(p.relative_to(skill)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}}
Path('/tmp/project17-prerequisite-survey.json').write_text(json.dumps(result,indent=2)+'\n')
print('Files:',result['files'],'prerequisite edges:',result['prerequisite_edges'])
print('Cyclic components:',json.dumps(cyclic))
for name,data in closures.items():print(name,data['file_count'],'files',data['line_count'],'lines')
