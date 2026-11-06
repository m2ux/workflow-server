from pathlib import Path
import hashlib,json,re,subprocess,sys
root=Path.cwd();baseline='04dc3cee068b37bd5ebe37b09266e8559c7c15dc'
sys.path.insert(0,str(root/'skills/scripts'))
import check_skill_files as c
counts={'commands':0,'fields_sections':0,'templates':0,'removed_metadata':0}
files=[]
for path in sorted(Path('skills/work-planner').rglob('*.md')):
    original=subprocess.check_output(['git','show',baseline+':'+str(path)],text=True)
    current=path.read_text()
    invocations=lambda text:re.findall(r'<big><pre>.*?</pre></big>',text,re.S)
    assert invocations(original)==invocations(current),str(path)
    counts['commands']+=len(list(c.specifications(c.scan(path)[2])))
    assert re.findall(r'^#+ .*$',original,re.M)==re.findall(r'^#+ .*$',current,re.M),str(path)
    assert not re.search(r'^\*\*(?:Runs in|Acts on):\*\*',current,re.M),str(path)
    counts['removed_metadata']+=len(re.findall(r'^\*\*(?:Runs in|Acts on):\*\*',original,re.M))
    # Preserve complete literal contracts and import/read boundaries.
    for heading in ('Fields','Prerequisites'):
        expression=r'^## '+heading+r'\n(.*?)(?=^## |\Z)'
        before=re.search(expression,original,re.S|re.M)
        after=re.search(expression,current,re.S|re.M)
        assert (before[1] if before else None)==(after[1] if after else None),(path,heading)
        if heading=='Fields' and after:counts['fields_sections']+=1
    old_path=Path('/tmp/project17-checkout-before')/path
    old_path.parent.mkdir(parents=True,exist_ok=True);old_path.write_text(original)
    old_lines,_,old_heads=c.scan(old_path);lines,_,heads=c.scan(path)
    for start,depth,title in old_heads:
        if depth==3 and title=='Template':
            end=c.heading_end(old_heads,start,depth,len(old_lines))
            new_start=next(i for i,d,t in heads if d==depth and t==title)
            new_end=c.heading_end(heads,new_start,depth,len(lines))
            assert old_lines[start:end]==lines[new_start:new_end]
            counts['templates']+=1
    files.append({'file':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'changed':original!=current})
sys.path.insert(0,str(root/'skills/work-planner/test'))
import test_checkouts as checkouts
corpus=checkouts.Corpus()
counts['working_directory_commands']=len(corpus.commands)
counts['checkout_sensitive_capabilities']=len(corpus.acting)
counts['selected_call_lines']=len({(document.path,index) for document,index,destination,anchor in corpus.calls()
                                  if checkouts.named(document.lines[index],corpus.names)
                                  and c.operation_target(document.path,str(destination)+('#'+anchor if anchor else ''))})
result={'baseline':baseline,'counts':counts,'files':files,'unchanged_invocations_headings_fields_prerequisites_templates':True,'reading_paths':'Same named documents, prerequisite sections and called capabilities; five graph command specifications explicitly link their existing local Review Checkout field.'}
Path('/tmp/project17-checkout-scope-preservation.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(counts))
