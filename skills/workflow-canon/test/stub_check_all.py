"""A stand-in for check-all.ts whose findings follow the corpus tree's content.

It is called as  stub_check_all.py [options] --corpus-only --json --verbose --root <tree>  and prints
check-all's verbose report over <tree>/corpus for three guards:

  - marker-protocol speaks the finding protocol: one finding per line holding PROTO-DEFECT, its site
    <tree>/corpus/<file>:<line> and its detail the line's text.
  - marker-text prints text: it fails when any line holds TEXT-DEFECT.
  - measure cannot measure when any line holds UNMEASURABLE, and passes otherwise.

Options:
  --log FILE     Append the --root of each call to FILE, one per line.
  --exit N       Exit N whatever the report says.
  --silent       Print nothing.
  --broken-base  Print nothing and exit 2 when the root is a branch point's checkout.
"""
import argparse
import json
import sys
from pathlib import Path

BASE_PREFIX = 'workflow-canon-base-'


def lines(root: Path):
    corpus = root / 'corpus'
    for path in sorted(p for p in corpus.rglob('*') if p.is_file() and '.git' not in p.parts):
        for number, text in enumerate(path.read_text(errors='replace').splitlines(), 1):
            yield path, number, text


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--log')
    parser.add_argument('--exit', type=int)
    parser.add_argument('--silent', action='store_true')
    parser.add_argument('--broken-base', action='store_true')
    parser.add_argument('--root', required=True)
    args, _ = parser.parse_known_args()
    root = Path(args.root)
    if args.log:
        with open(args.log, 'a') as log:
            log.write(f'{root}\n')
    if args.silent or (args.broken_base and BASE_PREFIX in str(root)):
        return 2 if args.exit is None else args.exit

    protocol = [{'check': 'marker', 'site': f'{path}:{number}', 'detail': text.strip()}
                for path, number, text in lines(root) if 'PROTO-DEFECT' in text]
    textual = [f'{path.relative_to(root)}:{number}: {text.strip()}'
               for path, number, text in lines(root) if 'TEXT-DEFECT' in text]
    blind = any('UNMEASURABLE' in text for _, _, text in lines(root))

    runs = [
        ('marker-protocol', 1 if protocol else 0,
         json.dumps({'guard': 'marker-protocol', 'root': str(root), 'findings': protocol}, indent=2),
         f'marker-protocol: {len(protocol)} finding(s)'),
        ('marker-text', 1 if textual else 0,
         '\n'.join([*textual, f'marker-text: {len(textual)} finding(s)']),
         f'marker-text: {len(textual)} finding(s)'),
        ('measure', 2 if blind else 0,
         'measure: cannot read the corpus' if blind else 'measure: clean',
         'measure: cannot read the corpus' if blind else 'measure: clean'),
    ]
    marks = {0: 'PASS', 1: 'FAIL', 2: 'UNMEASURED'}
    width = max(len(gid) for gid, *_ in runs)
    out = ['']
    out += [f'  [{marks[code]}] {gid.ljust(width)}  0.0s  {verdict}' for gid, code, _, verdict in runs]
    failed = sum(1 for _, code, *_ in runs if code == 1)
    blinded = sum(1 for _, code, *_ in runs if code == 2)
    out.append(f'\n{len(runs)} guard(s) in 0.0s — {len(runs) - failed - blinded} pass, {failed} fail, '
               f'{blinded} unmeasured')
    for gid, _, body, _ in runs:
        out.append(f'\n──── {gid} (guards/{gid}.ts) ────')
        out.append(body)
    sys.stdout.write('\n'.join(out) + '\n')
    if args.exit is not None:
        return args.exit
    return 2 if blinded else 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
