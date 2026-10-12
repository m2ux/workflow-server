"""Score the one prerequisite citation that crosses a document boundary.

An intra-file citation can be satisfied by a reader who bulk-reads the file and
never acts on the citation at all. A cross-file citation has no such accident
available: the target arrives only if the reader goes and gets it. So this is
where citation efficacy is observable.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from read_trace import trace
from score_order import sections, CATALOG

DISPATCH = CATALOG.parent / 'audit-dispatch.md'


def first(entries, name, span):
    start, end = span
    for index, (kind, target, read_start, read_end, _) in enumerate(entries):
        if kind != 'read' or not target or Path(target).name != name:
            continue
        if read_start <= end and (read_end is None or read_end >= start):
            return index + 1
    return None


catalog_spans, _ = sections(CATALOG)
dispatch_spans, _ = sections(DISPATCH)
spec = catalog_spans['plan-audit-assignments']
sizing = dispatch_spans['sizing']
print(f'citer: commands.md#plan-audit-assignments lines {spec[0]}-{spec[1]}')
print(f'cited: audit-dispatch.md#sizing lines {sizing[0]}-{sizing[1]}\n')

for path in sys.argv[1:]:
    entries = trace(path)
    at_spec = first(entries, CATALOG.name, spec)
    at_sizing = first(entries, DISPATCH.name, sizing)
    if at_spec is None:
        verdict, detail = 'not reached', 'the citing specification was never delivered'
    elif at_sizing is None:
        verdict, detail = 'FAIL', f'spec at call {at_spec}; cited section never delivered'
    elif at_sizing < at_spec:
        verdict, detail = 'pass', f'cited at call {at_sizing}, before spec at call {at_spec}'
    else:
        verdict, detail = 'FAIL', f'cited at call {at_sizing}, after spec at call {at_spec}'
    print(f'{Path(path).stem[:17]}  {verdict:<11} {detail}')
