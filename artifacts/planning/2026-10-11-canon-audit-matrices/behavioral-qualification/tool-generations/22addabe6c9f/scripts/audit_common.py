"""Content identities and atomic records for a canon audit."""

import hashlib
import json
import os
import subprocess
import tempfile
from pathlib import Path


class AuditError(ValueError):
    """An audit obligation or submitted record cannot be established."""


def require(condition, message):
    if not condition:
        raise AuditError(message)


def digest(value):
    raw = value if isinstance(value, bytes) else json.dumps(
        value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()
    return hashlib.sha256(raw).hexdigest()


def revision(root):
    result = subprocess.run(['git', '-C', str(root), 'rev-parse', 'HEAD'],
                            capture_output=True, text=True)
    return result.stdout.strip() if result.returncode == 0 else None


def read_json(path):
    return json.loads(Path(path).read_text())


def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=path.name + '.', dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as stream:
            json.dump(value, stream, indent=2, ensure_ascii=False, sort_keys=True)
            stream.write('\n')
        os.replace(temporary, path)
    finally:
        if Path(temporary).exists():
            Path(temporary).unlink()


def tool_identity():
    here = Path(__file__).resolve().parent
    return {path.name: digest(path.read_bytes()) for path in sorted(here.glob('audit_*'))
            if path.is_file()}


def engine_identity(root):
    root = Path(root)
    files = [root / 'package.json', root / 'package-lock.json']
    files.extend(sorted((root / 'node_modules' / 'yaml').rglob('*.js')))
    return {str(path.relative_to(root)): digest(path.read_bytes()) for path in files if path.is_file()}


def view_fingerprint(state):
    return digest([state['snapshot'], *(state[key] for key in (
        'mappings', 'verifications', 'evaluations', 'obligation_results', 'assignments'))])


def cell_id(row, criterion):
    return digest([row, criterion])[:24]


def cells(state):
    for criterion in state['criteria']:
        for row in state['rows']:
            yield cell_id(row, criterion), row, criterion


def cell_index(state):
    return {key: (row, criterion) for key, row, criterion in cells(state)}


def cell_fingerprint(state, row, criterion):
    item = state['rows'][row]
    return digest([item, state['criteria'][criterion],
                   {key: state['sources'][key]['hash'] for key in item['sources']}])


def mapping_fingerprint(mapping):
    return digest(mapping)


def evidence_valid(state, evidence, needed=()):
    require(isinstance(evidence, list) and (evidence or not needed), 'Source evidence is required')
    seen = set()
    for cite in evidence:
        require(isinstance(cite, dict), 'Evidence must be source-span objects')
        source = cite.get('source')
        require(source in state['sources'], f'Unknown evidence source: {source}')
        count = len(state['sources'][source]['text'].splitlines()) or 1
        start, end = cite.get('start'), cite.get('end')
        require(type(start) is int and type(end) is int and 1 <= start <= end <= count,
                f'Invalid evidence span: {source}')
        seen.add(source)
    require(set(needed) <= seen, 'Evidence omits a required source or criterion')


def record_source(path, key=None):
    raw = Path(path).read_bytes()
    text = raw.decode('utf-8')
    return {'path': str(Path(path).resolve()), 'hash': digest(raw), 'text': text,
            'key': key or str(path)}
