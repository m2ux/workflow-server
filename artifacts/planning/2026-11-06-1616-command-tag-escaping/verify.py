from pathlib import Path
from html.parser import HTMLParser
import html,json,sys
from markdown_it import MarkdownIt
sys.path.insert(0,str(Path('skills/scripts').resolve()))
import check_skill_files as c

class Rendered(HTMLParser):
    def __init__(self):
        super().__init__();self.tags=[];self.anchors=[];self.current=None
    def handle_starttag(self,tag,attrs):
        self.tags.append(tag)
        if tag=='a':self.current={'attrs':dict(attrs),'label':''}
    def handle_data(self,data):
        if self.current is not None:self.current['label']+=data
    def handle_endtag(self,tag):
        if tag=='a':self.anchors.append(self.current);self.current=None

renderer=MarkdownIt('commonmark',{'html':True})
before=json.loads(Path('/tmp/project17-command-tags-before.json').read_text())
after=[]
for row in before:
    text=Path(row['file']).read_text()
    lines,_,heads=c.scan(Path(row['file']))
    start=next(start for start,title in c.specifications(heads) if title==row['command'])
    end=c.heading_end(heads,start,3,len(lines))
    payload='\n'.join(lines[start:end]).split('<big><pre>',1)[1].split('</pre></big>',1)[0]
    assert html.unescape(payload)==html.unescape(row['payload']),row['command']
    assert not any(char in payload for char in '<>'),row['command']
    parsed=Rendered();parsed.feed(renderer.render('<big><pre>'+payload+'</pre></big>'))
    assert set(parsed.tags)<=set(('p','big','pre','a','strong','em','code','br')),row['command']
    expected=[(html.unescape(match[1]),html.unescape(match[2])) for match in c.ARGUMENT_LINK.finditer(payload)]
    actual=[(link['label'],link['attrs']['href']) for link in parsed.anchors]
    assert actual==expected,(row['command'],actual,expected)
    assert all(link['attrs'].get('title') in ('○','●','ƒ') for link in parsed.anchors)
    after.append({'file':row['file'],'command':row['command'],'decoded_identical':True,'visible_links':len(actual),'payload':payload})
Path('/tmp/project17-command-tags-after.json').write_text(json.dumps(after,indent=2)+'\n')
print(len(after),'commands preserve decoded syntax;',sum(row['visible_links'] for row in after),'visible links preserve destinations and role titles; no raw HTML or unknown rendered tags.')
