"""Read a document or a heading section and retain the exact returned text."""
import argparse
import json
from pathlib import Path
import re
import tempfile

a=argparse.ArgumentParser()
a.add_argument('--log', required=True)
a.add_argument('path')
a.add_argument('--heading')
v=a.parse_args()
p=Path(v.path).resolve()
lines=p.read_text().splitlines(keepends=True)
start,end=0,len(lines)
if v.heading:
 found=[]
 for i,line in enumerate(lines):
  m=re.match(r'^(#{1,6}) (.+?)\s*$',line)
  if m and m[2]==v.heading:
   found.append((i,len(m[1])))
 if len(found)!=1:
  raise SystemExit(f'expected one heading {v.heading!r}: {found}')
 start,depth=found[0]
 for i in range(start+1,len(lines)):
  m=re.match(r'^(#{1,6}) ',lines[i])
  if m and len(m[1])<=depth:
   end=i
   break
content=''.join(lines[start:end])
log=Path(v.log)
log.mkdir(parents=True,exist_ok=True)
with tempfile.NamedTemporaryFile(mode='w',prefix='read-',suffix='.txt',dir=log,delete=False) as output:
 output.write(content)
 target=Path(output.name)
with (log/'reads.jsonl').open('a') as f:
 f.write(json.dumps({'source':str(p),'heading':v.heading,'start_line':start+1,'end_line':end,'returned_file':str(target),'characters':len(content),'lines':end-start})+'\n')
print(content,end='')
