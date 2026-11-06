from pathlib import Path
import html,json,re,sys
from html.parser import HTMLParser
from markdown_it import MarkdownIt
sys.path.insert(0,str(Path('skills/scripts').resolve()))
import check_skill_files as c
old=Path('/tmp/project17-fidelity-start/skills/work-planner');new=Path('skills/work-planner')
templates=[]
for path in sorted(old.rglob('*.md')):
    lines,_,heads=c.scan(path)
    for start,depth,title in heads:
        if depth!=3 or title!='Template':continue
        end=c.heading_end(heads,start,depth,len(lines))
        original='\n'.join(lines[start+1:end]).strip()
        current,_,current_heads=c.scan(new/path.relative_to(old))
        first=next(index for index,level,title in current_heads if level==3 and title=='Template')
        stop=c.heading_end(current_heads,first,3,len(current))
        updated='\n'.join(current[first+1:stop]).strip()
        assert original==updated,str(path)
        templates.append({'file':str(path.relative_to(old)),'identical':True})
class Parser(HTMLParser):
    def __init__(self):super().__init__();self.tags=[];self.anchors=[];self.active=None
    def handle_starttag(self,tag,attrs):
        self.tags.append(tag)
        if tag=='a':self.active={'attributes':dict(attrs),'label':''}
    def handle_data(self,text):
        if self.active is not None:self.active['label']+=text
    def handle_endtag(self,tag):
        if tag=='a':self.anchors.append(self.active);self.active=None
renderer=MarkdownIt('commonmark',{'html':True});commands=[]
for path in sorted(new.rglob('*.md')):
    lines,_,heads=c.scan(path)
    for start,title in c.specifications(heads):
        stop=c.heading_end(heads,start,3,len(lines))
        section='\n'.join(lines[start:stop])
        match=re.search(r'<big><pre>(.*?)</pre></big>',section,re.S)
        assert match,(path,title)
        parser=Parser();parser.feed(renderer.render(match[0]))
        assert set(parser.tags)<=set(('p','big','pre','a','strong','em','code','br')),(path,title)
        expected=[(html.unescape(m[1]),html.unescape(m[2])) for m in c.ARGUMENT_LINK.finditer(match[1])]
        assert [(a['label'],a['attributes']['href']) for a in parser.anchors]==expected,(path,title)
        assert all(a['attributes'].get('title') in ('○','●','ƒ') for a in parser.anchors)
        commands.append({'file':str(path.relative_to(new)),'command':title,'visible_links':len(expected)})
result={'templates':templates,'commands':commands,'original_markdown':len(list(old.rglob('*.md'))),'current_markdown':len(list(new.rglob('*.md')))}
Path('/tmp/project17-fidelity-structure.json').write_text(json.dumps(result,indent=2)+'\n')
print(len(templates),'original Template sections identical;',len(commands),'commands render',sum(row['visible_links'] for row in commands),'visible contract links without custom HTML or blockquotes.')
