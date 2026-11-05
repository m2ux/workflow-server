"""Verify protocol presentation and preservation from a supplied checkout.

Run at a literal revision through revision-check.py; the detached checkout is
the default input. Every check uses a fresh copy and fresh declaration cache.
"""
import argparse
import hashlib
import importlib.util
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

BASELINE = '238b652aaa52057f66c86c9651c379296a7ba5b2'
PROTOCOL_MODEL = {
    'sections': ['Prerequisites', 'Procedure', 'Guidance'],
    'required': ['Procedure'], 'procedures': 'Procedure',
    'steps': 'headings', 'commands': 'inline-html',
    'preamble': ['../rules.md', '../conventions.md'],
    'calls': {'artifacts': 'Apply', 'modes': 'Follow', 'protocols': 'Follow'},
}
PREAMBLE = 'Follow the [Procedure](#procedure), adhering to [Rules](../rules.md) and [Conventions](../conventions.md).\n\n'


def git(checkout, *args):
    return subprocess.check_output(['git', *args], cwd=checkout, text=True).strip()


def hashes(root):
    return {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(root.rglob('*')) if p.is_file()
            and '__pycache__' not in p.parts and p.suffix != '.pyc'}


def section(text, name):
    return text.split('\n## '+name+'\n', 1)[1].split('\n## ', 1)[0]


def preservation(checkout, walked):
    records = []
    for path in sorted((checkout/'skills/work-planner/protocols').glob('*.md')):
        relative = str(path.relative_to(checkout))
        before = git(checkout, 'show', BASELINE+':'+relative)+'\n'
        after = path.read_text()
        assert section(before, 'Prerequisites') == section(after, 'Prerequisites'), relative
        runs = lambda t: re.findall(r'^\*\*Runs in:\*\*.*$', t, re.M)
        assert runs(before) == runs(after), relative
        old_links = re.findall(r'\]\(([^)]+)\)', before)
        new_links = re.findall(r'\]\(([^)]+)\)', after.replace(PREAMBLE, ''))
        assert set(old_links) == set(new_links), relative
        rest = iter(new_links)
        assert all(any(candidate == target for candidate in rest) for target in old_links), relative
        steps = re.findall(r'^\d+\. \*\*(.+)\*\*', before, re.M)
        new_steps = re.findall(r'^### (\d+)\. (.+)', after, re.M)
        assert [int(n) for n, _ in new_steps] == list(range(1, len(steps)+1)), relative
        spans = lambda t: set(re.findall(r'(?<!`)`([^`]+)`(?!`)', t))
        assert spans(before) <= spans(after), relative
        assert not re.search(r'```|<big><pre>', before+after), relative
        actual = hashlib.sha256(path.read_bytes()).hexdigest()
        assert actual == walked['protocol_sha256'][path.name], (relative, 'walked bytes differ')
        records.append({'file': relative, 'steps': len(steps), 'baseline_links': len(old_links),
                        'retry_links_added': len(new_links)-len(old_links),
                        'unique_targets': 'identical', 'prerequisites': 'byte-identical',
                        'runs_in': 'byte-identical', 'literal_spans': 'preserved',
                        'commands_and_literal_blocks': 0, 'walked_sha256': actual})
    assert len(records) == 7
    assert sum(r['steps'] for r in records) == 32
    assert sum(r['baseline_links'] for r in records) == 139
    return records


def load_checker(copy):
    sys.path.insert(0, str(copy/'skills/scripts'))
    spec = importlib.util.spec_from_file_location('protocol_checker', copy/'skills/scripts/check_skill_files.py')
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def check(checker, copy):
    paths = sorted((copy/'skills/work-planner').rglob('*.md'))
    structures = {}
    cited, called = checker.citations(paths, structures)
    findings = []
    for path in paths:
        findings += checker.check(path, copy, {}, cited, called, structures)
        findings += checker.mode_commands(path, copy, structures)
        findings += checker.interfaces(path, copy, structures)
    return paths, findings


def inherited(findings):
    normalized = [(p, kind, detail) for p, _, kind, detail in findings]
    assert normalized == [('skills/work-planner/modes/revise-mode.md',
                           'section outside the set', 'Fields')], findings


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--checkout', type=Path, default=Path.cwd())
    parser.add_argument('--walk-manifest', type=Path, default=Path(__file__).with_name('walk-manifest.json'))
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    checkout = args.checkout.resolve()
    walked = json.loads(args.walk_manifest.read_text())
    original = hashes(checkout/'skills')
    result = {'checkout': str(checkout), 'revision': git(checkout, 'rev-parse', 'HEAD'),
              'tree': git(checkout, 'rev-parse', 'HEAD^{tree}'),
              'source_clean': not git(checkout, 'status', '--porcelain', '--', 'skills'),
              'baseline': BASELINE, 'walk_source_manifest': walked['linked_source_manifest_sha256'],
              'preservation': preservation(checkout, walked)}
    with tempfile.TemporaryDirectory(prefix='protocol-model-') as directory:
        copy = Path(directory)
        shutil.copytree(checkout/'skills', copy/'skills', ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
        checker = load_checker(copy)
        paths, installed = check(checker, copy)
        inherited(installed)
        result['installed_model'] = {'files': len(paths), 'findings': installed,
                                    'qualification': 'inherited Revise Fields mismatch; W08 adopts installed declarations'}
        declaration = copy/'skills/work-planner/structure.json'
        model = json.loads(declaration.read_text())
        model['protocols'] = PROTOCOL_MODEL
        declaration.write_text(json.dumps(model))
        _, proposed = check(checker, copy)
        target = [f for f in proposed if '/protocols/' in f[0]]
        remaining = [f for f in proposed if '/protocols/' not in f[0]]
        assert not target, target
        inherited(remaining)
        result['target_model'] = {'protocols': 7, 'findings': target, 'declaration': PROTOCOL_MODEL}
        result['remaining_installed_families'] = {'files': len(paths)-7, 'findings': remaining,
                                                 'unexplained_findings': []}
        if args.self_test:
            protocol = copy/'skills/work-planner/protocols/change-overview.md'
            text = protocol.read_text()
            protocol.write_text(text.replace('[Rules](../rules.md)', 'Rules', 1))
            assert any(f[2] == 'procedure preamble missing' for f in check(checker, copy)[1])
            protocol.write_text(text.replace('Apply [Read Pull Request State]', 'Run [Read Pull Request State]', 1))
            assert any(f[2] == 'operation call verb' for f in check(checker, copy)[1])
            protocol.write_text(text.replace('### 1. Prepare the Evidence', '### 2. Prepare the Evidence', 1))
            assert any(f[2] == 'heading step sequence' for f in check(checker, copy)[1])
            protocol.write_text(text)
            inherited(check(checker, copy)[1])
            result['negative_controls'] = ['missing common preamble rejected', 'incorrect call verb rejected',
                                            'incorrect step sequence rejected', 'restored source passes with fresh cache']
    assert original == hashes(checkout/'skills'), 'instrument changed supplied source'
    result['source_bytes'] = 'unchanged'
    result['source_manifest_sha256'] = hashlib.sha256(json.dumps(original, sort_keys=True).encode()).hexdigest()
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
