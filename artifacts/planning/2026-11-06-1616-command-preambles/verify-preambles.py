from collections import Counter
from pathlib import Path
import hashlib
import html
import json
import re
import subprocess
import sys
from markdown_it import MarkdownIt
sys.path.insert(0, str(Path('skills/scripts').resolve()))
import check_skill_files as c

before=json.loads(Path(sys.argv[1]).read_text())
renderer=MarkdownIt('commonmark',{'html':True})
approved={'Run','Check','Compute','Render','Print','Copy','Link','Add','Set','Remove','Save','Read','Fetch','Create','Merge','Push','Resolve','Report','Renumber','Select','Tick','Hold','Free','Record','Replace','List','Close','Post','Write','Commit','Point','Append','Start','Mark','Index','Compare','Convert','Find'}
report=[]
files={}
for row in before:
    path=Path(row['file'])
    lines,_,heads=c.scan(path)
    start=next(i for i,title in c.specifications(heads) if title==row['command'])
    end=c.heading_end(heads,start,3,len(lines))
    section='\n'.join(lines[start+1:end]).strip()
    prefix,rest=section.split('<big><pre>',1)
    invocation,after=rest.split('</pre></big>',1)
    preamble,*details=prefix.strip().split('\n\n',1)
    details=details[0] if details else ''
    assert not after.strip(),(row['command'],'trailing result prose')
    assert preamble.split(' ',1)[0] in approved
    assert ' and provide ' in preamble
    assert 'to the requester' in preamble
    assert invocation==row['invocation'],(row['command'],'changed invocation')
    prior=row['opening']+'\n\n'+row['details']+'\n<big><pre>'+row['invocation']+'</pre></big>\n'+row['after']
    assert Counter(m[0] for m in c.LINK.finditer(prior))==Counter(m[0] for m in c.LINK.finditer(section)),(row['command'],'changed links')
    expected_outputs=[m[0] for m in c.LINK.finditer(row['after']) if '"●"' in m[0]]
    assert expected_outputs and all(link in preamble for link in expected_outputs)
    if row['command']=='Compute Dispatch Status':
        assert row['details'] in preamble and not details
    else:
        assert row['details']==details,(row['command'],'changed conditions or usage')
    rendered=renderer.render('<big><pre>'+invocation+'</pre></big>')
    assert '<blockquote>' not in rendered
    report.append({'file':str(path),'command':row['command'],'preamble':preamble,'invocation_identical':True,'link_multiset_identical':True,'outputs_in_preamble':len(expected_outputs),'conditions_preserved':True,'rendered_without_blockquote':True,'invocation_sha256':hashlib.sha256(invocation.encode()).hexdigest()})
    if str(path) not in files:
        original=subprocess.check_output(['git','show',f'e76308e672cc04d94b47891946bfbdc5331184b3:{path}'],text=True)
        current=path.read_text()
        assert original.split('\n## Fields\n',1)[-1]==current.split('\n## Fields\n',1)[-1],(str(path),'changed Fields')
        old_commands=original.split('\n## Commands\n',1)[0]
        current_commands=current.split('\n## Commands\n',1)[0]
        assert old_commands==current_commands,(str(path),'changed caller/procedure content')
        files[str(path)]={'fields_identical':True,'preceding_operations_or_procedure_identical':True}
result={'base':'e76308e672cc04d94b47891946bfbdc5331184b3','commands':len(report),'files':files,'specifications':report,'grammar_review':'Every preamble reviewed; compound actions and conditional/no-result clauses polished individually. Base verbs are checked only against this migration inventory, not enforced as a generic language heuristic.'}
Path('/tmp/project17-command-preambles-preservation.json').write_text(json.dumps(result,indent=2)+'\n')
Path('/tmp/project17-command-preambles-after.log').write_text('\n'.join(f'{i:03} {row["file"]} ### {row["command"]}\n{row["preamble"]}\n' for i,row in enumerate(report)))
print(f'{len(report)} command preambles verified; invocations, links, Fields and caller content preserved across {len(files)} files.')
