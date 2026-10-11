"""Print the retained read boundaries and verify their source agreement."""

import hashlib
import json
import sys
from pathlib import Path

for filename in sys.argv[1:]:
    for number, line in enumerate(Path(filename).read_text().splitlines(), 1):
        item = json.loads(line)
        if 'file' not in item:
            print(json.dumps({'record': number, 'metadata': item}))
            continue
        source = Path(item['file']).read_bytes()
        assert hashlib.sha256(source).hexdigest() == item['whole_file_sha256']
        lines = source.decode().splitlines(keepends=True)
        expected = ''.join(lines[item['start_line'] - 1:item['end_line']])
        assert expected.rstrip('\n') == item['excerpt'].rstrip('\n')
        print(json.dumps({'record': number, **{key: item[key] for key in ('file', 'selection', 'start_line', 'end_line', 'reason')}, 'source_agreement': True}))
