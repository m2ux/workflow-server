from pathlib import Path
from collections import Counter
import hashlib
import json
import re
import subprocess
import sys
from markdown_it import MarkdownIt
sys.path.insert(0,str(Path('skills/scripts').resolve()))
import check_skill_files as c

base='beb5c86f9682ebb70918ff4de20b2c140d71464f'
changes=json.loads(Path(sys.argv[1]).read_text())
originals=json.loads(Path(sys.argv[2]).read_text())
renderer=MarkdownIt('commonmark',{'html':True})
report={'base':base,'converted':len(changes),'files':{},'json_contents_preserved':True,'scalar_values_preserved':True}
def inline_values(text):
    return Counter(child.content for token in renderer.parse(text) for child in token.children or [] if child.type=='code_inline')
for name in sorted({r['file'] for r in changes}):
    path=Path(name)
    old=subprocess.check_output(['git','show',f'{base}:{name}'],text=True)
    current=path.read_text()
    assert old.split('\n## Fields\n',1)[0]==current.split('\n## Fields\n',1)[0]
    old_invocations=re.findall(r'<big><pre>.*?</pre></big>',old,re.S)
    new_invocations=re.findall(r'<big><pre>.*?</pre></big>',current,re.S)
    assert old_invocations==new_invocations
    for row in (r for r in changes if r['file']==name):
        assert row['after'] in current,(name,row['field'])
        values=[child.content for token in renderer.parseInline(row['after']) for child in token.children or [] if child.type=='code_inline']
        assert values==row['values']
        if row['language']=='json':assert json.loads(values[0])==json.loads(row['before'])
        else:assert values==row['before'].splitlines()
    for row in (r for r in originals if r['file']==name and (r['field'] in ('Template','Layout') or r['language']=='markdown')):
        assert row['content'] in current,(name,row['field'],'structural content')
    added=Counter(value for row in changes if row['file']==name for value in row['values'])
    assert inline_values(old.split('\n## Fields\n',1)[1])+added==inline_values(current.split('\n## Fields\n',1)[1]),(name,'changed existing inline values')
    report['files'][name]={'invocations_identical':True,'content_before_fields_identical':True,'existing_inline_values_identical':True,'examples':sum(r['file']==name for r in changes)}
remaining=[]
for path in sorted(Path('skills/work-planner').rglob('*.md')):
    if 'test' in path.parts:continue
    lines,_,heads=c.scan(path)
    field=next((i for i,d,t in heads if d==2 and t=='Fields'),None)
    if field is None:continue
    end=c.heading_end(heads,field,2,len(lines))
    for i,language in c.fence_openings(lines):
        if field<i<end:
            title=next(t for h,d,t in reversed(heads) if field<h<i and d==3)
            assert title in ('Template','Layout') or (path.name=='issue-body.md' and title=='Titles' and language=='markdown'),(str(path),title)
            remaining.append({'file':str(path),'field':title,'language':language})
assert len(remaining)==12,remaining
report['remaining_structural_blocks']=remaining
report['inline_values']=sum(len(r['values']) for r in changes)
Path('/tmp/project17-inline-examples-preservation.json').write_text(json.dumps(report,indent=2)+'\n')
print(report['converted'],'examples /',report['inline_values'],'inline values; 12 structural/formatting blocks retained; command invocations and preambles identical.')
