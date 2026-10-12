import pathlib,re,subprocess,json
root=pathlib.Path('/home/mike1/projects/dev/workflow-server')
p=root/'.worktrees/i04/e05/main/tests/guard-registry.test.ts'
s=p.read_text();s=s.replace('<<<<<<< ours\n=======\n','').replace('>>>>>>> theirs\n','')
s=re.sub(r"      'guards/check-inherited-input-never-spent.ts':\n.*?(?=      'guards/check-condition-survey.ts':)",'',s,flags=re.S)
p.write_text(s)
p=root/'.worktrees/i04/e06/main/tests/guard-registry.test.ts';s=p.read_text()
s=re.sub(r'<<<<<<< ours\n.*?=======\n>>>>>>> theirs\n','',s,flags=re.S)
s=re.sub(r"  'guards/check-inherited-input-never-spent.ts':\n.*?(?=\n};)",'',s,flags=re.S)
p.write_text(s)
p=root/'.worktrees/i04/e09/workflows/corpus/work-package/techniques/update-pr/TECHNIQUE.md'
s=p.read_text();s=re.sub(r'<<<<<<< ours\n.*?=======\n(.*?)>>>>>>> theirs\n',r'\1',s,flags=re.S);p.write_text(s)
for epic,base,file in [('e05','main','tests/guard-registry.test.ts'),('e06','main','tests/guard-registry.test.ts'),('e09','workflows','corpus/work-package/techniques/update-pr/TECHNIQUE.md')]:
 subprocess.run(['git','add',file],cwd=root/f'.worktrees/i04/{epic}/{base}',check=True)
for r in json.load(open('/tmp/i04-build-results.json')):
 if 'worktree' not in r:continue
 wt=r['worktree']
 subprocess.run(['git','diff','--cached','--check'],cwd=wt,check=True)
 print(r['branch'],subprocess.check_output(['git','diff','--cached','--stat'],cwd=wt,text=True).splitlines()[-1])
