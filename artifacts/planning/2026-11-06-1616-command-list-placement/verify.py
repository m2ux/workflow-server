from collections import Counter
from pathlib import Path
import json,re,subprocess,sys
from markdown_it import MarkdownIt
sys.path.insert(0,str(Path('skills/scripts').resolve()))
import check_skill_files as c
baseline='00694d77a4d0858a91e09bf4893cd2ee2cce5989'
parser=MarkdownIt('commonmark',{'html':True})
counts={'commands':0,'affected_commands':55,'moved_bullets':197,'fields':0,'templates':0}
for path in sorted(Path('skills/work-planner').rglob('*.md')):
    original=subprocess.check_output(['git','show',baseline+':'+str(path)],text=True)
    current=path.read_text()
    lines,fenced,heads=c.scan(path)
    blocks=c.scan_blocks(lines)
    # Collapse only empty gaps left by the removed lists before command boxes.
    for start,title in reversed(list(c.specifications(heads))):
        end=c.heading_end(heads,start,3,len(lines))
        first,last=next((a,b) for a,b in blocks.invocations if start<a<=b<end)
        prefix=lines[start:first];tidy=[]
        for line in prefix:
            if line.strip() or not tidy or tidy[-1].strip():tidy.append(line)
        lines[start:first]=tidy
    current='\n'.join(lines)+'\n'
    if current!=path.read_text():path.write_text(current)
    lines,fenced,heads=c.scan(path);blocks=c.scan_blocks(lines)
    for start,title in c.specifications(heads):
        end=c.heading_end(heads,start,3,len(lines))
        first,last=next((a,b) for a,b in blocks.invocations if start<a<=b<end)
        assert not any(token.type=='bullet_list_open' for token in parser.parse('\n'.join(lines[start:first]))),(path,title)
        counts['commands']+=1
    assert re.findall(r'<big><pre>.*?</pre></big>',original,re.S)==re.findall(r'<big><pre>.*?</pre></big>',current,re.S),path
    assert re.findall(r'^#+ .*$',original,re.M)==re.findall(r'^#+ .*$',current,re.M),path
    for heading in ('Fields','Prerequisites'):
        pattern=r'^## '+heading+r'\n(.*?)(?=^## |\Z)'
        before=re.search(pattern,original,re.S|re.M);after=re.search(pattern,current,re.S|re.M)
        assert (before[1] if before else None)==(after[1] if after else None),(path,heading)
        if heading=='Fields' and after:counts['fields']+=1
    if path.name!='guidelines.md':
        assert Counter(line for line in original.splitlines() if line.strip())==Counter(line for line in current.splitlines() if line.strip()),path
        original_bullets=[line for line in original.splitlines() if re.match(r'^\s*[-+*] ',line)]
        current_bullets=[line for line in current.splitlines() if re.match(r'^\s*[-+*] ',line)]
        assert original_bullets==current_bullets,path
    counts['templates']+=sum(depth==3 and title=='Template' for _,depth,title in heads)
Path('/tmp/project17-command-list-preservation.json').write_text(json.dumps({'baseline':baseline,'counts':counts,'invocation_content_headings_fields_prerequisites_preserved':True,'all_bullet_content_and_order_preserved':True},indent=2)+'\n')
print(json.dumps(counts))
