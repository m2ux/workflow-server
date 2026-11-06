from collections import Counter
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys
sys.path.insert(0,str(Path('skills/scripts').resolve()))
import check_skill_files as c

root=Path('skills/work-planner')
base='2d2e223451815c2a8986bf2848bdd0dd7e4be58d'
original=json.loads(Path(sys.argv[1]).read_text())
current=json.loads(Path(sys.argv[2]).read_text())
selected={r['operation']:r for r in original if len(r['references'])==1}
assert len(original)==100 and len(current)==65 and len(selected)==35
assert {r['operation'] for r in original}-{r['operation'] for r in current}==set(selected)
assert all(len(r['references'])>=2 for r in current)
commands=0;fields=0;files=[]
for path in sorted(root.rglob('*.md')):
    if 'test' in path.parts:continue
    before=subprocess.check_output(['git','show',f'{base}:{path}'],text=True)
    after=path.read_text()
    def command_sections(text):
        if '\n## Commands\n' not in text:return ''
        return text.split('\n## Commands\n',1)[1].split('\n## ',1)[0]
    assert command_sections(before)==command_sections(after),(str(path),'command specification changed')
    commands+=len(re.findall(r'<big><pre>',command_sections(after)))
    if '\n## Fields\n' in before:
        assert before.split('\n## Fields\n',1)[1]==after.split('\n## Fields\n',1)[1],(str(path),'Fields changed')
        fields+=1
    if before!=after:files.append(str(path))
assert commands==116

def final_file(operation):
    ref=selected[operation]['references'][0]
    if ref['caller'] in selected:return final_file(ref['caller'])
    return root/ref['file']

def normalized(text):
    text=c.LINK.sub(lambda m:m[0][1:m[0].index(']')],text)
    text=re.sub(r'\b(?:Provide|Retain)\b','RESULT',text)
    text=text.replace('’',"'").replace('–','-')
    return ' '.join(text.strip().removeprefix('- ').split())

matches=[];review=[];literals=[]
for name,row in selected.items():
    destination=final_file(name)
    text=destination.read_text()
    for code in c.CODE_SPAN.finditer(row['body']):
        assert code[0] in text,(name,'lost code literal',code[0])
        literals.append({'operation':name,'destination':str(destination),'literal':code[0]})
    lines=row['body'].splitlines()
    literal=c.scan_blocks(lines)
    started=False
    for index,line in enumerate(lines):
        if line.startswith('#### '):started=True;continue
        if not started or not line.strip() or literal.fenced[index] or line.startswith('#'):continue
        calls=[m[1].partition('#')[2] for m in c.LINK.finditer(c.CODE_SPAN.sub('',line))]
        if any(c.anchor_of(target)==child['anchor'] for target in calls for child in selected.values()):continue
        record={'operation':name,'destination':str(destination),'original':line}
        if normalized(line) in normalized(text):matches.append(record)
        else:review.append(record)
report={'base':base,'original_operations':100,'retained_operations':65,'inlined_operations':35,'single_reference_operations_remaining':0,'commands_identical':commands,'fields_identical':fields,'changed_markdown':files,'instruction_lines_matched':len(matches),'instruction_lines_for_manual_review':review,'literal_values_preserved':literals,'matched_instructions':matches}
Path('/tmp/project17-inlined-preservation.json').write_text(json.dumps(report,indent=2)+'\n')
print('100 → 65 operations; 35 inlined; 116 command specifications and',fields,'Fields sections identical.')
print(len(matches),'instruction lines matched;',len(review),'context/result rewrites require manual review.')
for row in review:print(row['operation'],':',row['original'])
