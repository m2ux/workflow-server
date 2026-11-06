from pathlib import Path
import difflib,html,json,re,subprocess

BASE='03d353300ca4804194fd50d316d73e3bf1270d1d'
HEAD='87b9bda45e453995352b5b420586832d5e1de45f'
root=Path.cwd();folder=Path('/tmp/project17-fidelity-start')
files=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'--','skills/work-planner'],text=True).splitlines()
old={}
for name in files:
    if not name.endswith('.md'):continue
    content=subprocess.check_output(['git','show',BASE+':'+name],text=True)
    path=folder/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(content)
    old[name]=content
new={str(path):path.read_text() for path in Path('skills/work-planner').rglob('*.md')}
def normalize(text):
    text=re.sub(r'\[([^\]]+)\]\([^\n]*?\)',r'\1',text)
    text=html.unescape(text).lower().replace('**','')
    text=re.sub(r'^\s*(?:[-*]|\d+\.)\s+','',text)
    return ' '.join(re.findall(r'[\w<>/-]+',text))
current=' '.join(normalize(text) for text in new.values())
inventory=[];candidates=[]
for name,text in old.items():
    if name not in new:
        inventory.append({'file':name,'state':'removed'});continue
    ratio=difflib.SequenceMatcher(None,text,new[name],autojunk=False).ratio()
    inventory.append({'file':name,'state':'identical' if text==new[name] else 'changed','ratio':round(ratio,3),'original_lines':len(text.splitlines()),'current_lines':len(new[name].splitlines())})
    fence=None
    for number,line in enumerate(text.splitlines(),1):
        marker=re.match(r'^\s*(`{3,}|~{3,})',line)
        if marker:
            if fence is None:fence=marker[1][0]
            elif marker[1][0]==fence:fence=None
            continue
        if fence or not line.strip() or line.lstrip().startswith(('#','|')):continue
        value=normalize(line)
        if len(value.split())>=7 and value not in current:
            candidates.append({'file':name,'line':number,'original':line,'guard':bool(re.search(r'\b(must|never|only|before|stop|unless|without|refus|fail|keep|repeat|return)\w*\b',line,re.I))})
for name in new.keys()-old.keys():inventory.append({'file':name,'state':'added','current_lines':len(new[name].splitlines())})
Path('/tmp/project17-fidelity-inventory.json').write_text(json.dumps({'baseline':BASE,'head':HEAD,'files':inventory,'candidates':candidates},indent=2)+'\n')
print('Original',len(old),'current',len(new),'removed',len(old.keys()-new.keys()),'added',len(new.keys()-old.keys()),'candidate lines',len(candidates))
for row in inventory:print(row['state'],row['file'].removeprefix('skills/work-planner/'))
