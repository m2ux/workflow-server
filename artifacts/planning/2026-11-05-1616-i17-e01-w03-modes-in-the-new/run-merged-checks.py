from pathlib import Path
import json
import subprocess
import sys

record=Path('/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-11-05-1616-i17-e01-w03-modes-in-the-new')
checkout=Path.cwd()
revision=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
assert revision=='fb9a834c940cbed9742709d7e03594900e31d22f'
checks=[
    ('merged-mode-model',[sys.executable,str(record/'verify-modes.py'),'--self-test']),
    ('merged-planner-suite',[sys.executable,'-m','unittest','discover','-s','skills/work-planner/test']),
    ('merged-shared-suite',[sys.executable,'-m','unittest','discover','-s','skills/test']),
]
for name,command in checks:
    ran=subprocess.run(command,text=True,capture_output=True)
    evidence={'revision':revision,'checkout':str(checkout),'command':command,'exit':ran.returncode,'stdout':ran.stdout,'stderr':ran.stderr}
    (record/(name+'.json')).write_text(json.dumps(evidence,indent=2)+'\n')
    print(name,'revision',revision,'exit',ran.returncode,flush=True)
    if ran.returncode:
        print(ran.stdout+ran.stderr,flush=True)
        sys.exit(ran.returncode)
print('All literal merged-revision checks completed.',flush=True)
