"""Development links added and removed by development-link.py, and read back from both ends.

Each run goes against a stand-in `gh` that holds the relation as issue to pull requests, answers
REST node-id lookups, resolves repository names in any case to their lower-case canonical form, applies the add and remove mutations from the query file, and answers the
batched relation read from either end. A failure the stand-in is told to raise replaces the answer
to the one call it names.

Live runs against GitHub itself when WORK_PLANNER_LIVE_LINK names an issue and a draft pull request
on a branch other than the default, already linked, as `owner/repo#issue owner/repo#pull`. It runs
outside the sandbox, where gh reaches the tracker.
"""
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import SCRIPTS

TRACKER = r'''import json, re, sys
state_file = sys.argv[0] + '.json'
state = json.load(open(state_file))
args = sys.argv[1:]
if args[1] == 'graphql':
    text = open(args[args.index('-F') + 1].split('@', 1)[1]).read()
    call = re.search(r'(\w+)\(input', text)
    call = call[1] if call else 'read'
else:
    call = 'node:' + args[1]
for failure in state['fail']:
    if failure['call'] == call:
        sys.stdout.write(failure.get('stdout', ''))
        sys.stderr.write(failure.get('stderr', ''))
        sys.exit(failure['code'])
links = state['links']
if call.startswith('node:'):
    repo, kind, number = re.fullmatch(r'repos/([^/]+/[^/]+)/(issues|pulls)/(\d+)', args[1]).groups()
    print(('I:' if kind == 'issues' else 'P:') + repo.lower() + '#' + number)
elif call != 'read':
    issue, pull = re.search(r'issueId: "I:([^"]+)", pullRequestIds: \["P:([^"]+)"\]', text).groups()
    held = links.setdefault(issue, [])
    if call == 'addCloseIssueReferences':
        if pull not in held or state['duplicates']:
            held.append(pull)
    else:
        links[issue] = [p for p in held if p != pull]
    json.dump(state, open(state_file, 'w'))
    print(json.dumps({'data': {call: {'issue': {'number': int(issue.split('#')[1])}}}}))
else:
    data = {}
    for alias, owner, name, body in re.findall(r'(r\d+): repository\(owner: "([^"]+)", name: "([^"]+)"\) \{\n(.*?)\n  \}', text, re.S):
        block = {}
        for line in body.splitlines():
            sub, field, number, connection = re.search(r'(\w+): (\w+)\(number: (\d+)\) \{ number (\w+)\(', line).groups()
            key = (owner + '/' + name).lower() + '#' + number
            if field == 'issue':
                nodes = [{'number': int(p.split('#')[1]), 'state': 'OPEN', 'repository': {'nameWithOwner': p.split('#')[0]}}
                         for p in links.get(key, [])]
            else:
                nodes = [{'number': int(i.split('#')[1]), 'repository': {'nameWithOwner': i.split('#')[0]}}
                         for i, held in links.items() if key in held]
            block[sub] = {'number': int(number), connection: {
                'nodes': nodes, 'pageInfo': {'hasNextPage': False, 'endCursor': None}}}
        data[alias] = block
    print(json.dumps({'data': data}))
'''

ISSUE, PULL, KEPT = 'o/r#924', 'o/r#950', 'o/s#951'


def tracker(root: Path, links: dict[str, list[str]], fail: list[dict] = (), duplicates: bool = False) -> tuple[dict, Path]:
    """The environment a write runs in, and the file holding the stand-in's relation."""
    gh = root / 'bin' / 'gh'
    gh.parent.mkdir()
    gh.write_text(f'#!{sys.executable}\n' + TRACKER)
    gh.chmod(0o755)
    state = Path(str(gh) + '.json')
    state.write_text(json.dumps({'links': links, 'fail': list(fail), 'duplicates': duplicates}))
    return {**os.environ, 'PATH': f'{gh.parent}{os.pathsep}{os.environ["PATH"]}', 'PYTHONDONTWRITEBYTECODE': '1'}, state


def write(env: dict, operation: str, issue: str = ISSUE, pull: str = PULL) -> subprocess.CompletedProcess:
    return subprocess.run([sys.executable, str(SCRIPTS / 'development-link.py'), operation, '--issue', issue,
                           '--pull', pull], capture_output=True, text=True, env=env)


def held(state: Path) -> dict[str, list[str]]:
    return json.loads(state.read_text())['links']


class Add(unittest.TestCase):
    def test_adding_once_or_twice_leaves_one_relation(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, state = tracker(Path(tmp), {ISSUE: [KEPT]})
            for _ in range(2):
                done = write(env, 'add')
                self.assertEqual(done.returncode, 0, done.stdout + done.stderr)
                self.assertIn(f'issue {ISSUE}: {KEPT}, {PULL}', done.stdout)
                self.assertIn(f'pull request {PULL}: {ISSUE}', done.stdout)
                self.assertIn(f'verified: add {PULL} -> {ISSUE}', done.stdout)
            self.assertEqual(held(state), {ISSUE: [KEPT, PULL]})

    def test_a_differently_cased_repository_is_the_same_repository(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, state = tracker(Path(tmp), {ISSUE: [KEPT]})
            for _ in range(2):
                done = write(env, 'add', issue='O/r#924', pull='o/R#950')
                self.assertEqual(done.returncode, 0, done.stdout + done.stderr)
                self.assertIn(f'issue O/r#924: {KEPT}, {PULL}', done.stdout)
                self.assertIn('verified: add o/R#950 -> O/r#924', done.stdout)
            self.assertEqual(held(state), {ISSUE: [KEPT, PULL]})

    def test_a_duplicated_relation_is_a_discrepancy(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, _ = tracker(Path(tmp), {ISSUE: [PULL]}, duplicates=True)
            done = write(env, 'add')
            self.assertEqual(done.returncode, 1)
            self.assertIn(f'discrepancy: add {PULL} -> {ISSUE}: issue {ISSUE} holds {PULL}, {PULL}', done.stdout)


class Remove(unittest.TestCase):
    def test_removal_leaves_the_other_links(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, state = tracker(Path(tmp), {ISSUE: [KEPT, PULL], 'o/r#925': [PULL]})
            done = write(env, 'remove')
            self.assertEqual(done.returncode, 0, done.stdout + done.stderr)
            self.assertIn(f'issue {ISSUE}: {KEPT}', done.stdout)
            self.assertIn(f'pull request {PULL}: o/r#925', done.stdout)
            self.assertEqual(held(state), {ISSUE: [KEPT], 'o/r#925': [PULL]})


    def test_removal_with_a_differently_cased_repository(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, state = tracker(Path(tmp), {ISSUE: [KEPT, PULL]})
            done = write(env, 'remove', issue='O/R#924', pull='O/R#950')
            self.assertEqual(done.returncode, 0, done.stdout + done.stderr)
            self.assertEqual(held(state), {ISSUE: [KEPT]})


class Failure(unittest.TestCase):
    """Each failed write names its operation and the tracker's error, and leaves the relation as it was."""
    CASES = {
        'authentication': ('addCloseIssueReferences', '{"message":"Bad credentials","status":"401"}',
                           'gh: Bad credentials (HTTP 401)\n', 'Bad credentials'),
        'permission': ('addCloseIssueReferences',
                       '{"data":{"addCloseIssueReferences":null},"errors":[{"type":"FORBIDDEN","message":'
                       '"Resource not accessible by integration"}]}',
                       'gh: Resource not accessible by integration\n', 'Resource not accessible by integration'),
        'unsupported schema': ('removeCloseIssueReferences',
                               '{"errors":[{"extensions":{"code":"undefinedField"},"message":'
                               '"Field \'removeCloseIssueReferences\' doesn\'t exist on type \'Mutation\'"}]}',
                               'gh: Field ...\n', "Field 'removeCloseIssueReferences' doesn't exist on type 'Mutation'"),
        'transport': ('addCloseIssueReferences', '',
                      'Post "https://api.github.com/graphql": dial tcp: lookup api.github.com: no such host\n',
                      'dial tcp: lookup api.github.com: no such host'),
    }

    def test_a_failed_write_names_its_operation_and_error(self):
        for kind, (mutation, stdout, stderr, observed) in self.CASES.items():
            operation = 'add' if mutation.startswith('add') else 'remove'
            with self.subTest(kind), tempfile.TemporaryDirectory() as tmp:
                env, state = tracker(Path(tmp), {ISSUE: [KEPT, PULL]},
                                     fail=[{'call': mutation, 'stdout': stdout, 'stderr': stderr, 'code': 1}])
                done = write(env, operation)
                self.assertEqual(done.returncode, 1)
                self.assertIn(f'failed: {operation} {PULL} -> {ISSUE}: {mutation}: ', done.stdout)
                self.assertIn(observed, done.stdout)
                self.assertNotIn('unavailable', done.stdout + done.stderr)
                self.assertEqual(held(state), {ISSUE: [KEPT, PULL]})

    def test_a_failed_lookup_or_readback_names_its_step(self):
        for call, step in (('node:repos/o/r/pulls/950', f'node id of pull request {PULL}'), ('read', 'readback')):
            with self.subTest(call), tempfile.TemporaryDirectory() as tmp:
                env, _ = tracker(Path(tmp), {ISSUE: []},
                                 fail=[{'call': call, 'stderr': 'gh: Bad credentials (HTTP 401)\n', 'code': 1}])
                done = write(env, 'add')
                self.assertEqual(done.returncode, 1)
                self.assertIn(f'failed: add {PULL} -> {ISSUE}: {step}: gh: Bad credentials (HTTP 401)', done.stdout)

    def test_the_mutation_carries_no_variable(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            env, _ = tracker(root, {})
            log = root / 'bin' / 'gh'
            log.write_text(log.read_text().replace(
                "    call = re.search", "    open(sys.argv[0] + '.log', 'a').write(text)\n    call = re.search", 1))
            self.assertEqual(write(env, 'add').returncode, 0)
            sent = Path(str(log) + '.log').read_text()
        self.assertIn('addCloseIssueReferences(input: {issueId: "I:o/r#924", pullRequestIds: ["P:o/r#950"]})', sent)
        self.assertNotIn('$', sent)



@unittest.skipUnless(os.environ.get('WORK_PLANNER_LIVE_LINK'), 'names no live issue and draft pull request')
class Live(unittest.TestCase):
    """The add command against GitHub for a draft pull request whose base is not the default branch."""

    def gh(self, path: str) -> dict:
        out = subprocess.run(['gh', 'api', path], capture_output=True, text=True)
        self.assertEqual(out.returncode, 0, out.stderr)
        return json.loads(out.stdout)

    def test_adding_twice_to_a_draft_on_another_branch_holds_it_once(self):
        issue, pull = os.environ['WORK_PLANNER_LIVE_LINK'].split()
        repo, number = pull.split('#')
        record = self.gh(f'repos/{repo}/pulls/{number}')
        self.assertTrue(record['draft'])
        self.assertNotEqual(record['base']['ref'], self.gh(f'repos/{repo}')['default_branch'])
        for _ in range(2):
            done = write(os.environ, 'add', issue, pull)
            self.assertEqual(done.returncode, 0, done.stdout + done.stderr)
            self.assertIn(f'verified: add {pull} -> {issue}', done.stdout)
            held_by_issue = done.stdout.split(f'issue {issue}: ', 1)[1].splitlines()[0].split(', ')
            self.assertEqual(held_by_issue.count(pull), 1)
            self.assertIn(issue, done.stdout.split(f'pull request {pull}: ', 1)[1].splitlines()[0].split(', '))

if __name__ == '__main__':
    unittest.main()
