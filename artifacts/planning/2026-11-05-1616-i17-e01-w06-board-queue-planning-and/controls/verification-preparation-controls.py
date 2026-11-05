"""Exercise private verifier and reader controls without changing product source."""
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

sys.dont_write_bytecode=True
PREP=Path('/tmp/i17-e01-w06')
ACTUAL=Path('/home/mike1/projects/dev/workflow-server/.worktrees/i17/e01/w06-board-queue-planning-and')
VERIFIER=PREP/'verify-w06.py'
READER=PREP/'verification-preparation/neutral-read.py'
spec=importlib.util.spec_from_file_location('prepared_w06_verifier',VERIFIER)
v=importlib.util.module_from_spec(spec);sys.modules[spec.name]=v;spec.loader.exec_module(v)


def run(args,cwd,expected=0):
 result=subprocess.run(args,cwd=cwd,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 assert result.returncode==expected,(args,result.returncode,result.stdout.decode(errors='replace'),result.stderr.decode(errors='replace'))
 return result


def git(root,*args):
 return run(['git',*args],root).stdout.decode().strip()


def command(identity,baseline,checkout=None):
 result=[sys.executable,str(VERIFIER),'--expected-head',identity['head'],'--expected-tree',identity['tree'],
         '--expected-content-sha256',identity['content_sha256'],'--baseline',baseline]
 if checkout:result.extend(['--checkout',str(checkout)])
 return result


results=[]
owned=[ACTUAL/'skills/work-planner/artifacts'/(name+'.md') for name in v.NAMES]
owned.append(ACTUAL/'skills/work-planner/test/test_plan_mode.py')
original={str(path):hashlib.sha256(path.read_bytes()).hexdigest() for path in owned}
actual_status=git(ACTUAL,'status','--porcelain=v1','--untracked-files=all')

with tempfile.TemporaryDirectory(prefix='w06-private-verification-controls-') as temporary:
 work=Path(temporary);fixture=work/'criterion';fixture.mkdir()
 git(fixture,'init','--quiet','--initial-branch=control')
 git(fixture,'config','user.name','Synthetic Control')
 git(fixture,'config','user.email','control@example.invalid')
 git(fixture,'config','commit.gpgsign','false')
 scripts=fixture/'skills/scripts';scripts.mkdir(parents=True)
 shutil.copyfile(ACTUAL/'skills/scripts/check_skill_files.py',scripts/'check_skill_files.py')
 artifacts=fixture/'skills/work-planner/artifacts';artifacts.mkdir(parents=True)
 (artifacts.parent/'structure.json').write_text(json.dumps({'artifacts':{'sections':['Operations','Fields'],'required':['Fields'],'procedures':'Operations'}})+'\n')
 synthetic='''# Synthetic Artifact

## Operations

### Populate Synthetic Artifact

One synthetic record for a local verifier control.

**Inputs:** [Record](#record).

**Outputs:** [Record](#record).

#### 1. Populate Synthetic Record

Write the supplied record.

## Fields

### Record

The supplied synthetic text.
'''
 for name in v.NAMES:(artifacts/(name+'.md')).write_text(synthetic)
 literal_command="printf '%s\\n' '<value>'"
 before=synthetic.replace('Write the supplied record.', 'Run the supplied value.\n\n```bash\n'+literal_command+'\n```')
 target=artifacts/'board.md';target.write_text(before)
 git(fixture,'add','skills')
 git(fixture,'commit','--quiet','-m','Synthetic verifier control')
 baseline=git(fixture,'rev-parse','HEAD')
 target_text=before.replace('```bash\n'+literal_command+'\n```', '<big><pre>\n'+literal_command.replace('<value>','[**&lt;value&gt;**](#record)')+'\n</pre></big>')
 target.write_text(target_text)
 git(fixture,'add','skills/work-planner/artifacts/board.md')
 git(fixture,'commit','--quiet','-m','Synthetic inline invocation control')
 expected=v.identity(fixture)
 positive=json.loads(run(command(expected,baseline),fixture).stdout)
 assert positive['status']=='pass',positive
 assert positive['strict']['converted_files']==15
 assert sum(row['command_count'] for row in positive['preservation'])==1
 results.append({'control':'clean synthetic default-cwd revision','result':'pass'})

 # An explicit checkout wins over an unrelated process working directory.
 explicit=json.loads(run(command(expected,baseline,fixture),work).stdout)
 assert explicit['status']=='pass'
 results.append({'control':'explicit supplied checkout from unrelated cwd','result':'pass'})
 for field in ('head','tree','content_sha256'):
  mismatch=dict(expected);mismatch[field]='0'*len(mismatch[field])
  refused=json.loads(run(command(mismatch,baseline),fixture,2).stdout)
  assert refused['status']=='refused' and field+' mismatch' in refused['reason'],refused
  results.append({'control':field+' mismatch refusal','result':'pass'})

 target.write_text(target_text+'\nDirty control.\n')
 refused=json.loads(run(command(expected,baseline),fixture,2).stdout)
 assert refused['status']=='refused' and 'dirty checkout' in refused['reason']
 target.write_text(target_text)
 (fixture/'untracked-control').write_text('untracked')
 refused=json.loads(run(command(expected,baseline),fixture,2).stdout)
 assert refused['status']=='refused' and 'dirty checkout' in refused['reason']
 (fixture/'untracked-control').unlink()
 results.append({'control':'tracked and untracked dirt refusal','result':'pass'})

 target.write_text(target_text.replace("printf '%s\\n'", "printf '%s \\n'"))
 git(fixture,'add','skills/work-planner/artifacts/board.md')
 git(fixture,'commit','--quiet','-m','Synthetic command mutation control')
 mutation=json.loads(run(command(v.identity(fixture),baseline),fixture,1).stdout)
 assert not mutation['strict']['findings'],mutation
 assert any(not row['command_bytes_and_order'] for row in mutation['preservation'])
 results.append({'control':'committed command-byte mutation fails preservation','result':'pass'})
 target.write_text(target_text)
 git(fixture,'add','skills/work-planner/artifacts/board.md')
 git(fixture,'commit','--quiet','-m','Synthetic literal command fixture')

 # A committed source-checker finding proves that the supplied checker executes.
 checker_path=scripts/'check_skill_files.py'
 checker_bytes=checker_path.read_bytes()
 checker_path.write_bytes(checker_bytes+b"\noriginal_check = check\ndef check(*args, **kwargs):\n    yield from original_check(*args, **kwargs)\n    yield ('synthetic-checker-control', 1, 'supplied checker control', 'actual supplied checker executes')\n")
 git(fixture,'add','skills/scripts/check_skill_files.py')
 git(fixture,'commit','--quiet','-m','Synthetic supplied checker control')
 changed=v.identity(fixture)
 negative=json.loads(run(command(changed,baseline),fixture,1).stdout)
 assert negative['status']=='fail'
 assert any(row['kind']=='supplied checker control' for row in negative['strict']['findings'])
 results.append({'control':'fresh supplied checker source governs results','result':'pass'})

 # The real held checkout must refuse while its sixteen authorized files are dirty.
 placeholder={'head':git(ACTUAL,'rev-parse','HEAD'),'tree':git(ACTUAL,'rev-parse','HEAD^{tree}'),'content_sha256':'0'*64}
 refused=json.loads(run(command(placeholder,v.BASELINE,ACTUAL),work,2).stdout)
 assert refused['status']=='refused' and 'dirty checkout' in refused['reason']
 results.append({'control':'actual held checkout dirty refusal','result':'pass'})
 actual_preservation=v.preservation(v.fresh_checker(ACTUAL),ACTUAL,v.BASELINE)
 assert len(actual_preservation)==15
 assert sum(row['command_count']+row['literal_specimens'] for row in actual_preservation)==58
 assert all(row['command_bytes_and_order'] and row['literal_bytes'] and row['prerequisites_bytes'] for row in actual_preservation)
 results.append({'control':'shared lexical spans preserve all actual baseline payloads and prerequisites','result':'pass','payloads':58})

 # The corrected reader uses one captured shared lexer, with no heading regex.
 package=work/'reader';(package/'source/skills/scripts').mkdir(parents=True)
 shutil.copyfile(READER,package/'neutral-read.py')
 shutil.copyfile(ACTUAL/'skills/scripts/check_skill_files.py',package/'source/skills/scripts/check_skill_files.py')

 def read(path,heading,expected_bytes,label):
  log=work/('read-log-'+str(len(results)))
  args=[sys.executable,str(package/'neutral-read.py'),'--log',str(log),str(path)]
  if heading:args.extend(['--heading',heading])
  output=run(args,work).stdout
  assert output==expected_bytes,(label,output,expected_bytes)
  row=json.loads((log/'reads.jsonl').read_text())
  assert Path(row['returned_file']).read_bytes()==expected_bytes
  assert row['bytes']==len(expected_bytes)
  results.append({'control':label,'result':'pass','returned_bytes':len(output)})

 selected=(b'## Selected Section\r\n\r\n'+ 'λ and 🙂\r\n'.encode()+
           b'````markdown\r\n## Selected Section\r\n# Literal Heading\r\n```text\r\n## Nested Literal\r\n```\r\n````\r\n\r\n'+
           b'<big><pre>\r\n# Opaque HTML Heading\r\n## Selected Section\r\n```payload\r\n</pre></big>\r\n\r\n')
 raw=b'# Document\r\n\r\n'+selected+b'## Next Section\r\n\r\nOther.\r\n'
 synthetic_path=work/'reader-synthetic.md';synthetic_path.write_bytes(raw)
 read(synthetic_path,'Selected Section',selected,'CRLF Unicode nested fences and HTML payload headings')
 read(synthetic_path,None,raw,'whole-file original bytes')
 for name,next_heading in [('architecture-overview','Diagrams'),('planning-record','Shared Worktree'),('work-item','Identity')]:
  path=ACTUAL/'skills/work-planner/artifacts'/(name+'.md');raw=path.read_bytes()
  start=raw.index(b'### Template\n');end=raw.index(('### '+next_heading+'\n').encode(),start)
  read(path,'Template',raw[start:end],'actual '+name+' complete literal Template')

 old_path=PREP/'disclosure-v2/read.py'
 architecture=ACTUAL/'skills/work-planner/artifacts/architecture-overview.md'
 historical=run([sys.executable,str(old_path),'--log',str(work/'historical-read'),str(architecture),'--heading','Template'],work).stdout
 raw=architecture.read_bytes();start=raw.index(b'### Template\n');end=raw.index(b'### Diagrams\n',start)
 assert historical!=raw[start:end] and len(historical)<end-start
 results.append({'control':'historical raw-regex reader truncation confirmed','result':'pass','historical_bytes':len(historical),'complete_bytes':end-start})

 for text,heading,label in [(b'# Document\n\n## Same\n\nFirst.\n\n## Same\n\nSecond.\n','Same','ambiguous real heading refusal'),
                            (b'# Document\n\n```markdown\n## Missing\n```\n','Missing','literal-only heading refusal')]:
  path=work/(label.replace(' ','-')+'.md');path.write_bytes(text)
  failure=run([sys.executable,str(package/'neutral-read.py'),'--log',str(work/'refused-reads'),str(path),'--heading',heading],work,1)
  assert b'expected one heading' in failure.stderr
  results.append({'control':label,'result':'pass'})

assert git(ACTUAL,'status','--porcelain=v1','--untracked-files=all')==actual_status
assert original=={str(path):hashlib.sha256(path.read_bytes()).hexdigest() for path in owned}
results.append({'control':'sixteen owned product paths and dirty status preserved','result':'pass'})
report={'status':'pass','controls':results,'limits':'Disposable synthetic revisions and actual read-only helper controls; no final product revision or disclosure workflow is verified.'}
(PREP/'verification-preparation-controls.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
