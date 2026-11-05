from pathlib import Path
import hashlib,json
root=Path('/tmp/i17-e01-w06/final-package')
manifest=json.loads((root/'manifest.json').read_text())
failures=[]
count=0
for group,folder in [('files','source'),('helpers','.'),('inputs','inputs'),('prompts','prompts')]:
    for name,expected in manifest[group].items():
        path=root/folder/name
        actual=hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None
        count+=1
        if actual!=expected: failures.append({'group':group,'name':name,'expected':expected,'actual':actual})
result={'entries':count,'failures':failures,'manifest_sha256':hashlib.sha256((root/'manifest.json').read_bytes()).hexdigest()}
Path('/tmp/project17-w06-parent-manifest-audit.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
raise SystemExit(bool(failures))
