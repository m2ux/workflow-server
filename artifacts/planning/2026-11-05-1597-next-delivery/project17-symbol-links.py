import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

root=Path('/home/mike1/projects/dev/workflow-server/.worktrees/i17/e01/workspace')
base='00ec0b9dd516cf6031d44c1ac2184ca95d1e0a01'
symbols={'input':'○','output':'●','operation':'ƒ'}
title=re.compile(r' "(input|output|operation)"\)')
counts={key:0 for key in symbols}
changed=[]
for path in sorted((root/'skills/work-planner').rglob('*.md')):
    before=path.read_text()
    for key in counts: counts[key]+=len(re.findall(r' "'+key+r'"\)',before))
    after=title.sub(lambda m:' "'+symbols[m[1]]+'")',before)
    if path.name=='rules.md':
        after=after.replace('`input` is a value','`○` is a value').replace('`output` is a result','`●` is a result').replace('`operation` is a callable','`ƒ` is a callable')
    if after!=before:
        path.write_text(after)
        changed.append(str(path.relative_to(root)))
for name in ('skills/test/test_check_skill_files.py','skills/work-planner/test/test_checkouts.py'):
    path=root/name
    text=path.read_text()
    for key,symbol in symbols.items():text=text.replace('"'+key+'"','"'+symbol+'"')
    path.write_text(text)
path=root/'skills/scripts/check_skill_files.py'
text=path.read_text().replace('`link_roles: true` checks input, output and operation link titles.','`link_roles: true` checks the ○, ● and ƒ link titles.')
needle="CODE_SPAN = re.compile(r'`[^`]*`')"
assert text.count(needle)==1
text=text.replace(needle,"ROLE_TITLES = {'○': 'input', '●': 'output', 'ƒ': 'operation'}\n"+needle)
text=text.replace('The optional role title attached to one Markdown link.',"The semantic role identified by one Markdown link's symbol title.")
text=text.replace("return title[1] if title else ''","return ROLE_TITLES.get(title[1], '') if title else ''")
path.write_text(text)
path=root/'skills/test/test_check_skill_files.py'
text=path.read_text()
needle='    def test_each_operation_provides_a_contextual_output(self):\n'
new='''    def test_word_titles_do_not_supply_role_contracts(self):
        self.replace(self.inventory, '#limit "○"', '#limit "input"')
        self.replace(self.inventory, '#page "●"', '#page "output"')
        self.replace(self.mode, '#read-inventory "ƒ"', '#read-inventory "operation"')
        self.assertIn('operation contract links', self.kinds())
        self.assertIn('operation link role', self.kinds())

'''
assert text.count(needle)==1
text=text.replace(needle,new+needle)
path.write_text(text)

spec=importlib.util.spec_from_file_location('symbol_check',root/'skills/scripts/check_skill_files.py')
check=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=check
spec.loader.exec_module(check)
failures=[]
for name in changed:
    path=root/name
    old=subprocess.check_output(['git','show',base+':'+name],cwd=root,text=True)
    current=path.read_text()
    reversed=current
    for key,symbol in symbols.items(): reversed=reversed.replace(' "'+symbol+'")',' "'+key+'")')
    if path.name=='rules.md':
        for key,symbol in symbols.items():reversed=reversed.replace('`'+symbol+'`','`'+key+'`')
    if reversed!=old:failures.append({'file':name,'reason':'Non-title prose drift'})
    old_lines=old.splitlines(keepends=True)
    new_lines=current.splitlines(keepends=True)
    for a,b in check.scan_blocks([line.rstrip('\n') for line in old_lines]).invocations:
        if old_lines[a:b+1]!=new_lines[a:b+1]:failures.append({'file':name,'reason':'Invocation drift'})
    if title.search(current):failures.append({'file':name,'reason':'Word role remains'})
new_counts={key:sum((root/name).read_text().count(' "'+symbol+'")') for name in changed) for key,symbol in symbols.items()}
assert counts==new_counts,(counts,new_counts)
result={'base':base,'symbols':symbols,'counts':counts,'converted_markdown_files':len(changed),'files':changed,'inverse_title_substitution_recovers_every_authored_byte':not failures,'invocation_payloads_preserved':not failures,'destinations_and_reading_paths_preserved':not failures,'failures':failures}
Path('/tmp/project17-symbol-preservation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({key:value for key,value in result.items() if key!='files'},ensure_ascii=False))
assert not failures
