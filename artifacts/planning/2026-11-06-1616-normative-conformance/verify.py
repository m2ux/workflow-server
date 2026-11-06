from pathlib import Path
import hashlib,json,re,subprocess,sys
base='4a23a4f50064c37b8ac45b842b8aa0f40c0a3937'
sys.path.insert(0,str(Path('skills/scripts').resolve()))
import check_skill_files as c
counts={'commands':0,'templates':0,'markdown_files':0};rows=[]
for path in sorted(Path('skills/work-planner').rglob('*.md')):
    before=subprocess.check_output(['git','show',base+':'+str(path)],text=True);after=path.read_text()
    assert re.findall(r'<big><pre>.*?</pre></big>',before,re.S)==re.findall(r'<big><pre>.*?</pre></big>',after,re.S),path
    assert re.findall(r'^#+ .*$',before,re.M)==re.findall(r'^#+ .*$',after,re.M),path
    assert c.LINK.findall(before)==c.LINK.findall(after),path
    original_path=Path('/tmp/project17-normative-before')/path
    original_path.parent.mkdir(parents=True,exist_ok=True);original_path.write_text(before)
    old_lines,_,old_heads=c.scan(original_path);lines,_,heads=c.scan(path)
    counts['commands']+=len(list(c.specifications(heads)))
    counts['markdown_files']+=1
    for start,level,title in old_heads:
        if level==3 and title=='Template':
            stop=c.heading_end(old_heads,start,level,len(old_lines))
            first=next(i for i,d,t in heads if d==level and t==title)
            last=c.heading_end(heads,first,level,len(lines))
            assert old_lines[start:stop]==lines[first:last],path
            counts['templates']+=1
    if before!=after:rows.append({'file':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
scripts=subprocess.check_output(['git','diff','--name-only','--','skills/work-planner/scripts'],text=True)
assert not scripts
Path('/tmp/project17-normative-preservation.json').write_text(json.dumps({'baseline':base,'counts':counts,'changed_markdown':rows,'invocations_templates_headings_link_targets_and_roles_identical':True,'runtime_scripts_unchanged':True},indent=2)+'\n')
print(json.dumps(counts),'preserved commands/templates/links; no runtime script changes.')
