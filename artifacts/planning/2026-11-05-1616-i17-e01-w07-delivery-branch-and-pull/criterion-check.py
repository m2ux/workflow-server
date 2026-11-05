"""Check the W07 artifact family in a supplied clean checkout at exact revision and tree."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys

NAMES = ('delivery-plan', 'delivery-branches', 'delivery-evidence',
         'dispatch-batch', 'delivery-brief', 'pull-request')


def exact_sha(value):
    if not re.fullmatch('[0-9a-f]{40}', value):
        raise argparse.ArgumentTypeError('use the full literal commit or tree SHA')
    return value


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--checkout', type=Path, default=Path.cwd())
    parser.add_argument('--expected-revision', type=exact_sha, required=True)
    parser.add_argument('--expected-tree', type=exact_sha, required=True)
    parser.add_argument('--source-hashes', type=Path,
                        default=Path(__file__).with_name('criterion-source-sha256.json'))
    args = parser.parse_args()
    root = args.checkout.resolve()

    def git(*arguments):
        return subprocess.check_output(['git', '-C', str(root), *arguments], text=True).strip()

    try:
        top = Path(git('rev-parse', '--show-toplevel')).resolve()
        revision, tree = git('rev-parse', 'HEAD'), git('rev-parse', 'HEAD^{tree}')
        dirty = git('status', '--porcelain=v1', '--untracked-files=all')
        hashes_bytes = args.source_hashes.read_bytes()
        expected = json.loads(hashes_bytes)['files']
    except (OSError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        parser.exit(2, f'Unreadable checkout or source hash manifest: {error}\n')
    identity = {'checkout': str(root), 'revision': revision, 'tree': tree,
                'instrument_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                'source_hash_manifest_sha256': hashlib.sha256(hashes_bytes).hexdigest()}
    print(json.dumps(identity, sort_keys=True), flush=True)
    if top != root:
        parser.exit(2, 'The supplied path must be the commit checkout root.\n')
    if dirty:
        parser.exit(2, 'The supplied commit checkout has uncommitted files.\n')
    if revision != args.expected_revision:
        parser.exit(2, 'The supplied checkout does not hold the expected exact revision.\n')
    if tree != args.expected_tree:
        parser.exit(2, 'The supplied checkout does not hold the expected exact tree.\n')
    actual = {}
    for name, digest in expected.items():
        relative = Path(name)
        if relative.is_absolute() or '..' in relative.parts:
            parser.exit(2, 'Source hashes must name checkout-relative files.\n')
        try:
            actual[name] = hashlib.sha256((root / relative).read_bytes()).hexdigest()
        except OSError as error:
            parser.exit(2, f'Unreadable source file {name}: {error}\n')
        if actual[name] != digest:
            parser.exit(2, f'The supplied source hash differs: {name}\n')

    sys.dont_write_bytecode = True
    checker_path = root / 'skills/scripts/check_skill_files.py'
    sys.path.insert(0, str(checker_path.parent))
    spec = importlib.util.spec_from_file_location('w07_supplied_checker', checker_path)
    checker = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = checker
    spec.loader.exec_module(checker)
    if Path(checker.__file__).resolve() != checker_path.resolve():
        parser.exit(2, 'The checker must come from the supplied checkout.\n')
    skill = root / 'skills/work-planner'
    declaration = skill / 'structure.json'
    model = json.loads(declaration.read_bytes())
    entry = {'sections': ['Prerequisites', 'Operations', 'Fields'], 'required': ['Fields'],
             'procedures': 'Operations', 'steps': 'headings', 'commands': 'inline-html',
             'contracts': 'Fields', 'calls': {'artifacts': 'Apply'}}
    for name in NAMES:
        model[name + '.md'] = entry
    for name, selected in model.items():
        checker.validate_structure_entry(declaration, name, selected)
    cache = {skill: model, skill / 'artifacts': model}
    paths = sorted(path for path in skill.rglob('*.md') if 'fixtures' not in path.relative_to(skill).parts)
    cited, called = checker.citations(paths, cache)
    findings = []
    for name in NAMES:
        path = skill / 'artifacts' / (name + '.md')
        findings += checker.check(path, root, {}, cited, called, cache)
        findings += checker.mode_commands(path, root, cache)
        findings += checker.interfaces(path, root, cache)
    result = {**identity, 'checker': str(checker_path), 'source_sha256': actual,
              'installed_structure_sha256': hashlib.sha256(declaration.read_bytes()).hexdigest(),
              'converted_files': len(NAMES), 'findings': findings,
              'validation_model': 'exact six-file declarations injected into a fresh cache; installed declarations untouched'}
    if git('status', '--porcelain=v1', '--untracked-files=all'):
        parser.exit(2, 'Criterion checking changed the supplied checkout.\n')
    print(json.dumps(result, indent=2))
    return bool(findings)


if __name__ == '__main__':
    raise SystemExit(main())
