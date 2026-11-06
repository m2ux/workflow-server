import importlib.util
import json
import sys
from pathlib import Path
root=Path('/home/mike1/projects/dev/workflow-server/.worktrees/i17/e01/workspace')
spec=importlib.util.spec_from_file_location('symbol_calls',root/'skills/scripts/check_skill_files.py')
check=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=check
spec.loader.exec_module(check)
counts={'artifact_operations':0,'protocols':0,'mode_procedures':0}
failures=[]
for path in sorted((root/'skills/work-planner').rglob('*.md')):
    if 'test' in path.relative_to(root/'skills/work-planner').parts:continue
    lines,fenced,_=check.scan(path)
    html=check.scan_blocks(lines).html_lines
    for i,line in enumerate(lines):
        if fenced[i] or i in html:continue
        for match in check.LINK.finditer(check.CODE_SPAN.sub('',line)):
            if not check.operation_target(path,match[1]):continue
            name=match[1].partition('#')[0]
            destination=(path.parent/name).resolve() if name else path
            kind={'artifacts':'artifact_operations','protocols':'protocols','modes':'mode_procedures'}[destination.parent.name]
            counts[kind]+=1
            if check.link_role(match)!='operation' or '"ƒ"' not in match[0]:
                failures.append({'file':str(path.relative_to(root)),'line':i+1,'target':match[1]})
result={'counts':counts,'total':sum(counts.values()),'failures':failures,'scope':'Every callable link in authored Work Planner prose, including whole protocol/mode procedures and named child procedures.'}
Path('/tmp/project17-symbol-callable-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))
assert not failures
