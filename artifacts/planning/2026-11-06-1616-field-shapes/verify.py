from pathlib import Path
import collections,json,re,subprocess,sys
sys.path.insert(0,str(Path('skills/scripts').resolve()))
import check_skill_files as c
root=Path('skills/work-planner')
base='d22b9a1919f1ba8bfe60017e420b7d9527519dd0'
before=json.load(Path(__file__).with_name('fields-before.json').open())
dispositions=json.load(Path(__file__).with_name('dispositions.json').open())

def sections(text):
    path=Path('/tmp/project17-audit-section.md');path.write_text(text)
    lines,_,heads=c.scan(path)
    fields={};templates={}
    section=None
    for i,d,title in heads:
        if d==2:section=title
        if d==3 and section=='Fields':
            end=c.heading_end(heads,i,d,len(lines))
            fields[c.anchor_of(title)]={'title':title,'body':'\n'.join(lines[i+1:end]).strip()}
            if title=='Template':templates[title]=fields[c.anchor_of(title)]['body']
    return fields,templates

after={};unchanged_invocations=unchanged_templates=0
for path in sorted(root.rglob('*.md')):
    relative=str(path.relative_to(root))
    prior=subprocess.run(['git','show',base+':'+str(path)],check=True,capture_output=True,text=True).stdout
    current=path.read_text()
    oldblocks=re.findall(r'<big><pre>.*?</pre></big>',prior,re.S)
    newblocks=re.findall(r'<big><pre>.*?</pre></big>',current,re.S)
    assert oldblocks==newblocks,relative+' invocation changed'
    unchanged_invocations+=len(oldblocks)
    oldfields,oldtemplates=sections(prior)
    fields,templates=sections(current)
    assert oldtemplates==templates,relative+' literal template changed'
    unchanged_templates+=len(templates)
    after.update({relative+'#'+anchor:{'file':relative,**value} for anchor,value in fields.items()})

ledger=[]
for field in before:
    key=field['file']+'#'+field['anchor']
    disposition=dispositions.get(key)
    if disposition is None:
        assert key in after,key+' removed without a disposition'
        # Unchanged data contracts were semantically reviewed through the full
        # inventory and the targeted long/mixed/action-language passes.
        if field['body']!=after[key]['body']:
            print('Unrecorded changed contract:',key)
            disposition={'disposition':'changed contract needs review','destination':key,
                         'reason':'Review the concrete shape or reference update before publication.'}
        else:
            disposition={'disposition':'retained data','destination':key,
                         'reason':'Concrete value, reference, collection, document member or composite state; constraints describe its valid contents.'}
    ledger.append({'source':key,'title':field['title'],**disposition,
                   'contract':field['body'],'incoming_links':field['references']})

assert not any(r['disposition']=='changed contract needs review' for r in ledger)

added=[{'field':key,**value} for key,value in after.items()
       if key not in {r['file']+'#'+r['anchor'] for r in before}]
summary={'base':base,'markdown_files':len(list(root.rglob('*.md'))),
         'original_named_fields':len(before),'current_named_fields':len(after),
         'reviewed_original_fields':len(ledger),
         'dispositions':dict(collections.Counter(x['disposition'] for x in ledger)),
         'unchanged_invocations':unchanged_invocations,'unchanged_literal_templates':unchanged_templates,
         'runtime_scripts_changed':subprocess.run(['git','diff','--name-only',base,'--',str(root/'scripts')],check=True,capture_output=True,text=True).stdout.splitlines(),
         'new_fields':[a['field'] for a in added]}
assert not summary['runtime_scripts_changed']
Path('/tmp/project17-field-ledger.json').write_text(json.dumps(ledger,indent=2)+'\n')
Path('/tmp/project17-field-added.json').write_text(json.dumps(added,indent=2)+'\n')
Path('/tmp/project17-field-preservation.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary,indent=2))
