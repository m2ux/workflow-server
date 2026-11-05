"""Verify Work Planner mode structure and preservation from the supplied checkout.

Run through revision-check.py with a literal revision. The current directory is
the detached checkout unless --checkout names one explicitly. Each invocation
uses fresh copied source and declaration state; installed files stay intact.
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
MODE_MODEL = {
    'sections': ['Prerequisites', 'Procedure', 'Outcomes', 'Guidance', 'Fields'],
    'required': ['Procedure', 'Outcomes'],
    'procedures': 'Procedure', 'steps': 'headings', 'commands': 'inline-html',
    'preamble': ['../rules.md', '../conventions.md', '#outcomes'],
    'calls': {'artifacts': 'Apply', 'modes': 'Follow', 'protocols': 'Follow'},
}


def run(checkout, *args):
    result = subprocess.run(args, cwd=checkout, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr or result.stdout)
    return result.stdout.strip()


def hashes(root):
    return {str(path.relative_to(root)): hashlib.sha256(path.read_bytes()).hexdigest()
            for path in sorted(root.rglob('*')) if path.is_file()
            and '__pycache__' not in path.parts and path.suffix != '.pyc'}


def load_checker(copy):
    sys.path.insert(0, str(copy/'skills/scripts'))
    spec = importlib.util.spec_from_file_location('w03_checker', copy/'skills/scripts/check_skill_files.py')
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def check(checker, copy, modes_only=False):
    paths = sorted((copy/'skills/work-planner').rglob('*.md'))
    structures = {}
    cited, called = checker.citations(paths, structures)
    findings = []
    for path in paths:
        if modes_only and path.parent.name != 'modes':
            continue
        findings += checker.check(path, copy, {}, cited, called, structures)
        findings += checker.mode_commands(path, copy, structures)
        findings += checker.interfaces(path, copy, structures)
    return paths, findings


def section(text, title):
    return text.split('\n## '+title+'\n', 1)[1].split('\n## ', 1)[0]


def preservation(checkout):
    records = []
    for path in sorted((checkout/'skills/work-planner/modes').glob('*.md')):
        relative = str(path.relative_to(checkout))
        before = run(checkout, 'git', 'show', BASELINE+':'+relative)+'\n'
        after = path.read_text()
        assert section(before, 'Prerequisites') == section(after, 'Prerequisites'), relative
        before_commands = re.findall(r'```bash\n(.*?)\n```', before, re.S)
        after_commands = re.findall(r'<big><pre>\n(.*?)\n</pre></big>', after, re.S)
        after_commands = [re.sub(r'\[\*\*([^*]+)\*\*\]\([^)]+\)', r'\1', command)
                          for command in after_commands]
        assert before_commands == after_commands, relative
        spans = lambda text: set(re.findall(r'(?<!`)`([^`]+)`(?!`)', text))
        assert spans(before) <= spans(after), relative
        before_runs = re.findall(r'^\*\*Runs in:\*\*.*$', before, re.M)
        after_runs = re.findall(r'^\*\*Runs in:\*\*.*$', after, re.M)
        assert before_runs == after_runs, relative
        records.append({'file': relative, 'prerequisites': 'byte-identical',
                        'command_bodies': len(before_commands),
                        'literal_code_spans': 'preserved', 'runs_in': 'preserved'})
    assert len(records) == 10
    assert sum(record['command_bodies'] for record in records) == 4
    return records


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--checkout', type=Path, default=Path.cwd())
    parser.add_argument('--self-test', action='store_true', help='exercise negative controls on disposable copies')
    args = parser.parse_args()
    checkout = args.checkout.resolve()
    before = hashes(checkout/'skills')
    result = {'checkout': str(checkout), 'revision': run(checkout, 'git', 'rev-parse', 'HEAD'),
              'tree': run(checkout, 'git', 'rev-parse', 'HEAD^{tree}'),
              'baseline': BASELINE, 'preservation': preservation(checkout)}
    with tempfile.TemporaryDirectory(prefix='w03-mode-model-') as directory:
        copy = Path(directory)
        shutil.copytree(checkout/'skills', copy/'skills',
                        ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
        checker = load_checker(copy)
        paths, installed = check(checker, copy)
        result['installed_model'] = {'files': len(paths), 'findings': installed}
        expected = [('skills/work-planner/modes/revise-mode.md', 128,
                     'section outside the set', 'Fields')]
        # The line is presentation; the file, finding kind and Fields are the contract.
        assert [(f[0], f[2], f[3]) for f in installed] == [(f[0], f[2], f[3]) for f in expected], installed
        declaration = copy/'skills/work-planner/structure.json'
        model = json.loads(declaration.read_text())
        model['modes'] = MODE_MODEL
        declaration.write_text(json.dumps(model))
        _, target = check(checker, copy, modes_only=True)
        assert not target, target
        result['target_model'] = {'modes': 10, 'findings': target, 'declaration': MODE_MODEL}
        assert all('/modes/' in f[0] for f in installed)
        result['remaining_installed_files'] = {'findings': [], 'files': len(paths)-10}
        if args.self_test:
            mode = copy/'skills/work-planner/modes/standup-mode.md'
            original = mode.read_text()
            mode.write_text(original.replace('[Rules](../rules.md)', 'Rules', 1))
            _, broken_preamble = check(checker, copy, modes_only=True)
            assert any(f[2] == 'procedure preamble missing' for f in broken_preamble)
            mode.write_text(original.replace('Apply [Select Project Board]', 'Run [Select Project Board]', 1))
            _, broken_call = check(checker, copy, modes_only=True)
            assert any(f[2] == 'operation call verb' for f in broken_call)
            mode.write_text(original)
            assert not check(checker, copy, modes_only=True)[1]
            result['negative_controls'] = ['missing common-context preamble rejected',
                                           'incorrect operation verb rejected',
                                           'restored copied source passes with fresh caches']
    assert before == hashes(checkout/'skills'), 'instrument changed supplied source'
    result['source_bytes'] = 'unchanged'
    result['source_manifest_sha256'] = hashlib.sha256(json.dumps(before, sort_keys=True).encode()).hexdigest()
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
