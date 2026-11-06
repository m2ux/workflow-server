import json
from pathlib import Path
root=Path('/home/mike1/projects/dev/workflow-server/.worktrees/i17/e01/workspace')
path=root/'skills/work-planner/rules.md'
before=path.read_text()
old='`ƒ` is a callable procedure.'
new='`ƒ` is a called operation, protocol or procedure.'
assert before.count(old)==1
path.write_text(before.replace(old,new))
path=Path('/tmp/project17-symbol-preservation.json')
audit=json.loads(path.read_text())
audit['rule_clarification']='The ƒ definition explicitly includes called operations, protocols and procedures.'
audit['inverse_title_substitution_recovers_every_authored_byte_except_explicit_rule_clarification']=audit.pop('inverse_title_substitution_recovers_every_authored_byte')
path.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
