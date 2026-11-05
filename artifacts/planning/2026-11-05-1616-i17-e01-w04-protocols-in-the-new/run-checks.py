"""Capture complete checks from the detached current checkout."""
import argparse
import json
import subprocess
import sys
from pathlib import Path

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--prefix',required=True)
parser.add_argument('--output-dir',type=Path,default=Path(__file__).resolve().parent)
args=parser.parse_args()
record=args.output_dir.resolve()
revision=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
tree=subprocess.check_output(['git','rev-parse','HEAD^{tree}'],text=True).strip()
sbx='/home/mike1/projects/dev/md-composer/scripts/sbx'
checks=[('protocol-model',[sbx,sys.executable,str(Path(__file__).with_name('verify-protocols.py')),'--self-test']),
        ('planner-suite',[sbx,sys.executable,'-m','unittest','discover','-s','skills/work-planner/test']),
        ('shared-suite',[sbx,sys.executable,'-m','unittest','discover','-s','skills/test'])]
for name,command in checks:
    result=subprocess.run(command,text=True,capture_output=True)
    evidence={'revision':revision,'tree':tree,'checkout':str(Path.cwd()),'command':command,
              'exit':result.returncode,'stdout':result.stdout,'stderr':result.stderr}
    (record/(args.prefix+'-'+name+'.json')).write_text(json.dumps(evidence,indent=2)+'\n')
    print(name,'revision',revision,'tree',tree,'exit',result.returncode,flush=True)
    if result.returncode:
        print(result.stdout+result.stderr,flush=True)
        raise SystemExit(result.returncode)
print('All literal-revision checks completed.',flush=True)
