"""Verify AC6 against one clean, explicitly identified supplied checkout.

The expected commit, tree and content hash identify the source under test.
The checker is loaded freshly from that checkout. Installed declarations stay
intact; strict declarations exist only in this process's cache. Preservation
compares with the exact baseline commit in the supplied repository.
"""
import argparse
import hashlib
import html
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import types
import uuid

sys.dont_write_bytecode = True
BASELINE = 'fb9a834c940cbed9742709d7e03594900e31d22f'
NAMES = ('architecture-overview planning-record work-item agent-review goal-trace '
         'review-finding placement repository-graph lane dependency-graph board '
         'standup-report board-delivery plan-change board-queue').split()
ARTIFACT_MODEL = {
    'sections': ['Prerequisites', 'Operations', 'Fields'], 'required': ['Fields'],
    'procedures': 'Operations', 'steps': 'headings', 'commands': 'inline-html',
    'contracts': 'Fields', 'calls': {'artifacts': 'Apply'},
}
MODE_MODEL = {
    'sections': ['Prerequisites', 'Procedure', 'Outcomes', 'Guidance', 'Fields'],
    'required': ['Procedure', 'Outcomes'], 'procedures': 'Procedure',
    'steps': 'headings', 'commands': 'inline-html',
    'preamble': ['../rules.md', '../conventions.md', '#outcomes'],
    'calls': {'artifacts': 'Apply', 'modes': 'Follow', 'protocols': 'Follow'},
}


class Refusal(RuntimeError):
    """The supplied source does not match the requested verification identity."""


def git(root, *args):
    environment = dict(os.environ, GIT_OPTIONAL_LOCKS='0')
    result = subprocess.run(['git', *args], cwd=root, env=environment,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode:
        raise Refusal(result.stderr.decode('utf-8', errors='replace').strip())
    return result.stdout


def identity(root):
    """Return clean-source identities without accepting a verification result."""
    root = Path(root).resolve()
    top = Path(git(root, 'rev-parse', '--show-toplevel').decode().strip()).resolve()
    if top != root:
        raise Refusal(f'checkout must be its repository root: {root}')
    status = git(root, 'status', '--porcelain=v1', '--untracked-files=all')
    if status:
        raise Refusal('dirty checkout: ' + status.decode().strip())
    digest = hashlib.sha256()
    paths = sorted(path for path in git(root, 'ls-files', '-z', '--', 'skills', 'scripts/sbx').split(b'\0') if path)
    for path in paths:
        target = root / os.fsdecode(path)
        if not target.is_file():
            raise Refusal(f'tracked source is not a file: {target}')
        digest.update(path + b'\0' + hashlib.sha256(target.read_bytes()).digest())
    return {
        'head': git(root, 'rev-parse', 'HEAD^{commit}').decode().strip(),
        'tree': git(root, 'rev-parse', 'HEAD^{tree}').decode().strip(),
        'content_sha256': digest.hexdigest(), 'tracked_source_files': len(paths),
    }


def fresh_checker(root):
    """Compile actual checkout source, independently of imported or bytecode caches."""
    path = root / 'skills/scripts/check_skill_files.py'
    name = 'w06_checker_' + uuid.uuid4().hex
    module = types.ModuleType(name)
    module.__file__ = str(path)
    sys.modules[name] = module
    exec(compile(path.read_bytes(), str(path), 'exec'), module.__dict__)
    return module


def checks(checker, root, strict):
    skill = root / 'skills/work-planner'
    model = json.loads((skill / 'structure.json').read_text())
    if strict:
        for name in NAMES:
            model[name + '.md'] = dict(ARTIFACT_MODEL)
        model['modes'] = dict(MODE_MODEL)
    for name, entry in model.items():
        checker.validate_structure_entry(skill / 'structure.json', name, entry)
    cache = {skill: model, skill / 'artifacts': model, skill / 'modes': model}
    paths = sorted(skill.rglob('*.md'))
    owned = [skill / 'artifacts' / (name + '.md') for name in NAMES]
    if any(path not in paths for path in owned):
        raise Refusal('one or more required W06 artifact files are absent')
    cited, called = checker.citations(paths, cache)
    findings = []
    for path in paths:
        findings.extend(checker.check(path, root, {}, cited, called, cache))
        findings.extend(checker.mode_commands(path, root, cache))
        findings.extend(checker.interfaces(path, root, cache))
    return {'markdown_files': len(paths), 'converted_files': len(owned),
            'findings': [{'path': str(path), 'line': line, 'kind': kind, 'detail': detail}
                         for path, line, kind, detail in findings]}


def fenced_payloads(checker, text):
    """Use shared lexical spans; preserve the original payload bytes and line endings."""
    raw = text.splitlines(keepends=True)
    blocks = checker.scan_blocks(text.splitlines())
    openings = dict(blocks.openings)
    payloads = []
    for start, language in blocks.openings:
        end = start + 1
        while end + 1 < len(raw) and blocks.fenced[end + 1] and end + 1 not in openings:
            end += 1
        payloads.append((language, ''.join(raw[start + 1:end])))
    return payloads


def section(checker, text, title):
    raw = text.splitlines(keepends=True)
    _, _, headings = checker.parse(text)
    matches = [(start, level) for start, level, name in headings if level == 2 and name == title]
    if not matches:
        return ''
    if len(matches) != 1:
        raise Refusal(f'nonunique {title} section')
    start, level = matches[0]
    end = checker.heading_end(headings, start, level, len(raw))
    return ''.join(raw[start:end])


def preservation(checker, root, baseline):
    records = []
    for name in NAMES:
        relative = 'skills/work-planner/artifacts/' + name + '.md'
        before = git(root, 'show', baseline + ':' + relative).decode('utf-8')
        after = (root / relative).read_bytes().decode('utf-8')
        old_payloads = fenced_payloads(checker, before)
        new_payloads = fenced_payloads(checker, after)
        raw = after.splitlines(keepends=True)
        invocations = checker.scan_blocks(after.splitlines()).invocations
        commands = [html.unescape(checker.ARGUMENT_LINK.sub(lambda match: match[1], ''.join(raw[start + 1:end])))
                    for start, end in invocations]
        original_commands = [payload for language, payload in old_payloads if language in ('bash', 'sh', 'shell')]
        literal_payloads = [(language, payload) for language, payload in old_payloads if language not in ('bash', 'sh', 'shell')]
        command_match = commands == original_commands
        literal_match = all(payload in new_payloads for payload in literal_payloads)
        prerequisites_match = section(checker, before, 'Prerequisites') == section(checker, after, 'Prerequisites')
        records.append({'file': relative, 'command_count': len(original_commands),
                        'literal_specimens': len(literal_payloads), 'command_bytes_and_order': command_match,
                        'literal_bytes': literal_match, 'prerequisites_bytes': prerequisites_match})
    return records


def verify(root, expected, baseline):
    initial = identity(root)
    for field in ('head', 'tree', 'content_sha256'):
        if initial[field] != expected[field]:
            raise Refusal(f'{field} mismatch: expected {expected[field]}, found {initial[field]}')
    resolved = git(root, 'rev-parse', baseline + '^{commit}').decode().strip()
    if resolved != baseline:
        raise Refusal('baseline must be an exact full commit SHA')
    checker = fresh_checker(root)
    strict = checks(checker, root, True)
    # Each declaration pass has fresh actual checker state.
    installed = checks(fresh_checker(root), root, False)
    preserved = preservation(checker, root, baseline)
    final = identity(root)
    if final != initial:
        raise Refusal('checkout identity changes during verification')
    installed_unexplained = [finding for finding in installed['findings'] if not (
        finding['path'] == 'skills/work-planner/modes/revise-mode.md'
        and finding['kind'] == 'section outside the set' and finding['detail'] == 'Fields')]
    passed = not strict['findings'] and not installed_unexplained and all(
        record['command_bytes_and_order'] and record['literal_bytes'] and record['prerequisites_bytes']
        for record in preserved)
    return {'criterion': 'AC6', 'status': 'pass' if passed else 'fail', 'checkout': str(root),
            'identity': initial, 'baseline': baseline, 'strict': strict, 'installed': installed,
            'installed_unexplained': installed_unexplained, 'preservation': preserved,
            'limits': 'Structural and byte preservation checks; semantic review, complete suites and independent disclosure walks are separate evidence.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--checkout', type=Path, default=Path.cwd())
    parser.add_argument('--expected-head', required=True)
    parser.add_argument('--expected-tree', required=True)
    parser.add_argument('--expected-content-sha256', required=True)
    parser.add_argument('--baseline', default=BASELINE)
    args = parser.parse_args()
    for name, value, size in (('head', args.expected_head, 40), ('tree', args.expected_tree, 40),
                              ('content hash', args.expected_content_sha256, 64), ('baseline', args.baseline, 40)):
        if not re.fullmatch('[0-9a-f]{' + str(size) + '}', value):
            parser.error(name + ' requires its exact full lowercase hexadecimal identity')
    root = args.checkout.resolve()
    try:
        result = verify(root, {'head': args.expected_head, 'tree': args.expected_tree,
                               'content_sha256': args.expected_content_sha256}, args.baseline)
    except (Refusal, OSError, ValueError) as error:
        print(json.dumps({'criterion': 'AC6', 'status': 'refused', 'reason': str(error)}, indent=2))
        return 2
    print(json.dumps(result, indent=2))
    return 0 if result['status'] == 'pass' else 1


if __name__ == '__main__':
    raise SystemExit(main())
