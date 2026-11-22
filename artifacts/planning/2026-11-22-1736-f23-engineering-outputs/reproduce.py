"""Synthetic local Git reproduction; no private repository inputs or remote calls."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile

sys.path.insert(0,sys.argv[1])
from board import Output,Outputs,Resolution

with tempfile.TemporaryDirectory(prefix='wp-output-branch-') as temporary:
    root=Path(temporary)
    def git(*args):
        return subprocess.check_output(['git',*args],cwd=root,stderr=subprocess.DEVNULL,text=True).strip()
    git('init','-b','main')
    git('config','user.name','Fixture')
    git('config','user.email','fixture@example.invalid')
    (root/'source.txt').write_text('initial\n')
    git('add','source.txt')
    git('-c','commit.gpgsign=false','commit','-m','define initial source')
    initial=git('rev-parse','HEAD')
    git('checkout','-b','engineering')
    (root/'evidence.md').write_text('accepted report\n')
    git('add','evidence.md')
    git('-c','commit.gpgsign=false','commit','-m','record accepted evidence')
    evidence=git('rev-parse','HEAD')
    git('update-ref','refs/remotes/origin/engineering',evidence)
    git('update-ref','refs/remotes/origin/i02/e21/main',initial)
    outputs=Outputs(str(root))
    unknown=outputs.read(Output('pushed planning commit','fixture/repository',evidence,''),'i02/e21','consumer W05')
    known=outputs.read(Output('same known planning commit','fixture/repository',evidence,'engineering'),'i02/e21','consumer W05')
    assert unknown is Resolution.UNMET and known is Resolution.MET
    print(json.dumps({'synthetic':True,'network_calls':0,'product_base_contains_evidence':False,'engineering_contains_evidence':True,'branchless_result':str(unknown),'known_engineering_result':str(known),'readings':outputs.lines},indent=2))
