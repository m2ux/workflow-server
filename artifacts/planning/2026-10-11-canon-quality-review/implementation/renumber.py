"""Renumber the anti-pattern catalog to file order and repoint every citation.

`AP-XX` is file order, so retiring or adding an entry renumbers its successors.
Entry names are stable and unique, so the citation map keys on the name and the
old number is never trusted.
"""

import re
import sys
from pathlib import Path

CORPUS = Path(sys.argv[1])
CATALOG = CORPUS / 'corpus/canon/resources/anti-patterns.md'
CITERS = [
    CORPUS / 'corpus/canon/resources/schema-construct-inventory.md',
    CORPUS / 'corpus/workflow-design/techniques/reconcile-design-assumptions.md',
]

HEADING = re.compile(r'^### AP-(\d+)\. (\S+)$', re.M)

text = CATALOG.read_text()
entries = [(m.group(1), m.group(2)) for m in HEADING.finditer(text)]
assert len(entries) == len({name for _, name in entries}), 'entry names are not unique'

renumbered = {name: f'{index:02d}' for index, (_, name) in enumerate(entries, start=1)}

text = HEADING.sub(lambda m: f'### AP-{renumbered[m.group(2)]}. {m.group(2)}', text)
CATALOG.write_text(text)


def repoint(body: str) -> str:
    body = re.sub(
        r'#ap-\d+-([a-z0-9-]+)',
        lambda m: f'#ap-{renumbered[m.group(1)]}-{m.group(1)}' if m.group(1) in renumbered else m.group(0),
        body,
    )
    return re.sub(
        r'\bAP-\d+\. ([a-z0-9-]+)',
        lambda m: f'AP-{renumbered[m.group(1)]}. {m.group(1)}' if m.group(1) in renumbered else m.group(0),
        body,
    )


CATALOG.write_text(repoint(CATALOG.read_text()))
for path in CITERS:
    path.write_text(repoint(path.read_text()))

unresolved = sorted(
    {m.group(1) for path in [CATALOG] + CITERS for m in re.finditer(r'#ap-\d+-([a-z0-9-]+)', path.read_text())}
    - set(renumbered)
)
print(f'entries={len(entries)} unresolved_anchors={unresolved}')
