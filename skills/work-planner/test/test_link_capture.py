"""The Development relation read from each end by links-by-pull-request.py and links-by-issue.py,
and the linked pull requests linked-pull-requests.py adds to a collection.

Each capture runs against a stand-in `gh` that answers the query file from a held relation, two
linked nodes to a page, so a relation longer than a page is read across pages, and answers a REST
read of one pull request from the records it holds.
The shared reader is also run over
hand-written tracker responses, one for each way a relation fails to arrive whole.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import SCRIPTS, epic_body, issue, item, pr, run, url

TRACKER = r'''import json, re, sys
relation = json.load(open(sys.argv[0] + '.json'))
if '-F' not in sys.argv:
    held = relation['rest'].get(sys.argv[2])
    print(json.dumps(held or {'message': 'Not Found', 'status': '404'}))
    sys.exit(0 if held else 1)
text =open(sys.argv[sys.argv.index('-F') + 1].split('@', 1)[1]).read()
data, errors = {}, []
for alias, owner, name, body in re.findall(r'(r\d+): repository\(owner: "([^"]+)", name: "([^"]+)"\) \{\n(.*?)\n  \}', text, re.S):
    repo, block = owner + '/' + name, {}
    for line in body.splitlines():
        sub, field, number, connection, after = re.search(
            r'(\w+): (\w+)\(number: (\d+)\) \{ number (\w+)\([^)]*?(?:after: "(\d+)")?\)', line).groups()
        held = relation.get(field, {}).get(repo + '#' + number, [] if field == 'issue' else None)
        if held is None:
            block[sub] = None
            errors.append({'path': [alias, sub], 'message': 'Could not resolve ' + field + ' ' + number + '.'})
            continue
        start = int(after or 0)
        block[sub] = {'number': int(number), connection: {
            'nodes': held[start:start + 2],
            'pageInfo': {'hasNextPage': start + 2 < len(held), 'endCursor': str(start + 2)}}}
    data[alias] = block
print(json.dumps({'data': data, **({'errors': errors} if errors else {})}))
'''


def tracker(root: Path, links: dict[tuple[str, int], list[tuple[str, int]]], states: dict[int, str] = {},
            missing: tuple[int, ...] = (), unread: tuple[int, ...] = (),
            records: tuple[dict, ...] = ()) -> dict[str, str]:
    """The environment a capture runs in: a stand-in gh holding each pull request's linked issues,
    and the same relation read from each issue, short of each pull request named missing and each
    issue named unread, which the tracker answers with a null node and an error naming it. A REST
    read of one pull request answers with its record among records, or Not Found."""
    rest = {'repos/' + p['html_url'].split('github.com/', 1)[1].replace('/pull/', '/pulls/'): p for p in records}
    pulls, issues = {}, {}
    for (repo, number), linked in links.items():
        if number not in missing:
            pulls[f'{repo}#{number}'] = [{'number': n, 'repository': {'nameWithOwner': r}} for r, n in linked]
        for issue_repo, n in linked:
            issues.setdefault(f'{issue_repo}#{n}', []).append(
                {'number': number, 'state': states.get(number, 'MERGED'), 'repository': {'nameWithOwner': repo}})
    for n in unread:
        issues[f'o/r#{n}'] = None
    gh = root / 'bin' / 'gh'
    gh.parent.mkdir()
    gh.write_text(f'#!{sys.executable}\n' + TRACKER)
    gh.chmod(0o755)
    Path(str(gh) + '.json').write_text(json.dumps({'pullRequest': pulls, 'issue': issues, 'rest': rest}))
    return {**os.environ, 'PATH': f'{gh.parent}{os.pathsep}{os.environ["PATH"]}', 'PYTHONDONTWRITEBYTECODE': '1'}


def capture(script: str, env: dict[str, str], *args: str) -> subprocess.CompletedProcess:
    return subprocess.run([sys.executable, str(SCRIPTS / script), *args], capture_output=True, text=True, env=env)


def pull_end(root: Path, env: dict[str, str], pulls: list[dict]) -> tuple[subprocess.CompletedProcess, Path]:
    records, out = root / 'prs.json', root / 'links.json'
    records.write_text('\n'.join(json.dumps(p) for p in pulls))
    return capture('links-by-pull-request.py', env, '--prs', str(records), '--out', str(out)), out


def issue_end(root: Path, env: dict[str, str], issues: list[dict]) -> tuple[subprocess.CompletedProcess, Path]:
    records, out = root / 'issues.json', root / 'issue-links.json'
    half = len(issues) // 2
    records.write_text(json.dumps(issues[:half]) + '\n' + json.dumps(issues[half:]))
    return capture('links-by-issue.py', env, '--issues', str(records), '--out', str(out)), out


RELATION = {('o/r', 950): [('o/r', 3), ('o/r', 4), ('o/s', 5), ('o/r', 6), ('o/r', 7)],
            ('o/r', 951): [], ('o/s', 952): [('o/r', 3)]}
PULLS = [pr(950, '[I01:E00] Work'), pr(951, '[I01:E00] More'), pr(952, '[I01:E00] Elsewhere', repo='o/s')]


class PullRequestEnd(unittest.TestCase):
    def test_every_pull_request_appears_with_its_issues_or_an_empty_array(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            done, out = pull_end(root, tracker(root, RELATION), PULLS)
            self.assertEqual(done.returncode, 0, done.stderr)
            snapshot = json.loads(out.read_text())
        self.assertEqual([(e['repo'], e['number']) for e in snapshot], [('o/r', 950), ('o/r', 951), ('o/s', 952)])
        held = {(e['repo'], e['number']): [(r['repo'], r['number']) for r in e['closingIssuesReferences']]
                for e in snapshot}
        self.assertEqual(held, RELATION)

    def test_a_pull_request_collected_twice_appears_once(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            done, out = pull_end(root, tracker(root, RELATION), PULLS + PULLS[:1])
            self.assertEqual(done.returncode, 0, done.stderr)
            self.assertEqual(len(json.loads(out.read_text())), 3)

    def test_an_unread_relation_writes_no_snapshot(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            done, out = pull_end(root, tracker(root, RELATION, missing=(951,)), PULLS)
            self.assertEqual(done.returncode, 1)
            self.assertIn('unreadable: pull request o/r#951: Could not resolve pullRequest 951.', done.stdout)
            self.assertFalse(out.exists())

    def test_the_sync_reads_the_snapshot(self):
        task = issue(3, '[I01:E00:W01] Task: One')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        for relation, uncited in ((RELATION, False), ({('o/r', 950): [('o/r', 4)]}, True)):
            with tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp)
                captured, links = pull_end(root, tracker(root, relation), PULLS[:1])
                self.assertEqual(captured.returncode, 0, captured.stderr)
                (root / 'epic.json').write_text(json.dumps(epic))
                (root / 'task.json').write_text(json.dumps(task))
                done = run('sync.py', str(root / 'epic.json'), '--prs', str(root / 'prs.json'),
                           '--links', str(links), '--tasks', str(root / 'task.json'), '--link', 'W01=950',
                           '--fix', str(root / 'fixed.md'))
                self.assertEqual(done.returncode, 0, done.stderr)
                self.assertIn(f"[W01]({url('pull', 950)})", (root / 'fixed.md').read_text())
                self.assertEqual('uncited: #950 does not link W01 #3' in done.stdout, uncited, done.stdout)


class IssueEnd(unittest.TestCase):
    ISSUES = [issue(n, f'Issue {n}') for n in (3, 4, 6, 7, 8)] + [{**pr(951, 'Skipped'), 'pull_request': {},
                                                                    'repository_url': 'https://api.github.com/repos/o/r'}]

    def test_each_issue_is_keyed_by_number_with_its_pull_requests(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            done, out = issue_end(root, tracker(root, RELATION, states={952: 'OPEN'}), self.ISSUES)
            self.assertEqual(done.returncode, 0, done.stderr)
            snapshot = json.loads(out.read_text())
        self.assertEqual(sorted(snapshot), ['issues', 'repository'])
        self.assertEqual(snapshot['repository'], 'o/r')
        development = snapshot['issues']
        self.assertEqual(sorted(development), ['3', '4', '6', '7', '8'])
        self.assertEqual(development['3'], [{'repo': 'o/r', 'number': 950, 'state': 'MERGED'},
                                            {'repo': 'o/s', 'number': 952, 'state': 'OPEN'}])
        self.assertEqual(development['8'], [])

    def test_the_issue_end_agrees_with_the_pull_request_end(self):
        relation = {('o/r', 900 + n): [('o/r', 1 + (n * k) % 7) for k in range(n % 4)] for n in range(120)}
        issues = [issue(n, f'Issue {n}') for n in range(1, 8)]
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            env = tracker(root, relation)
            by_pull, links = pull_end(root, env, [pr(number, 'Work') for _, number in relation])
            by_issue, development = issue_end(root, env, issues)
            self.assertEqual((by_pull.returncode, by_issue.returncode), (0, 0), by_pull.stderr + by_issue.stderr)
            from_pulls = {(e['number'], r['number']) for e in json.loads(links.read_text())
                          for r in e['closingIssuesReferences']}
            from_issues = {(p['number'], int(n)) for n, held in json.loads(development.read_text())['issues'].items()
                           for p in held}
        self.assertEqual(from_issues, from_pulls)
        self.assertGreater(max(sum(1 for pair in from_pulls if pair[1] == n) for n in range(1, 8)), 2)

    def test_an_unread_relation_writes_nothing(self):
        for unread in ((4,), (8,)):
            with tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp)
                done, out = issue_end(root, tracker(root, RELATION, unread=unread), self.ISSUES)
                self.assertEqual(done.returncode, 1, done.stdout + done.stderr)
                self.assertEqual(done.stdout.strip(), f'unreadable: issue o/r#{unread[0]}: '
                                 f'Could not resolve issue {unread[0]}.')
                self.assertFalse(out.exists())

    def test_issues_from_two_repositories_are_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            done, _ = issue_end(root, tracker(root, RELATION), [issue(3, 'One'), issue(5, 'Two', repo='o/s')])
            self.assertNotEqual(done.returncode, 0)
            self.assertIn('supply one repository', done.stderr)


def linked(root: Path, env: dict[str, str], held: list[dict], *files: tuple[str, object]) -> subprocess.CompletedProcess:
    """linked-pull-requests.py over a collection of the held pull requests and the named issue files."""
    (root / 'prs.json').write_text(''.join(json.dumps(p) + '\n' for p in held))
    for name, content in files:
        (root / name).write_text(json.dumps(content))
    return capture('linked-pull-requests.py', env, '--prs', str(root / 'prs.json'),
                   '--issues', *(str(root / name) for name, _ in files))


def collected(root: Path) -> list[tuple[str, int, str]]:
    """The collection's pull requests as repository name, number and title."""
    return [(p['html_url'].split('/')[4], p['number'], p['title'])
            for p in map(json.loads, (root / 'prs.json').read_text().splitlines())]


class LinkedPullRequests(unittest.TestCase):
    """A row-linked pull request titled without the initiative prefix, and one a task issue's
    Development field names in another repository, join the title-matched collection."""

    TITLED = pr(950, '[I01:E00] Work', merged='2026-11-01T00:00:00Z', base='main')
    EARLY = pr(961, 'Early work', merged='2026-10-01T00:00:00Z', base='main')
    ELSEWHERE = pr(962, 'Older work', merged='2026-10-02T00:00:00Z', repo='o/s', base='main')
    EPIC = issue(2, '[I01:E00] First: Epic', body=epic_body(
        (f"[W01]({url('pull', 961)})", 'Early', ''), (f"[W02]({url('issues', 3)})", 'Older', ''),
        (f"[W03]({url('pull', 950)})", 'Titled', '')))
    TASK = issue(3, '[I01:E00:W02] Task: Older')
    RELATION = {('o/s', 962): [('o/r', 3)], ('o/r', 950): [], ('o/r', 961): []}
    PLAN = (('epic.json', EPIC), ('task.json', TASK))

    def env(self, root: Path, *records: dict, unread: tuple[int, ...] = ()) -> dict[str, str]:
        return tracker(root, self.RELATION, unread=unread,
                       records=records or (self.TITLED, self.EARLY, self.ELSEWHERE))

    def test_each_linked_pull_request_joins_whatever_its_title(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            done = linked(root, self.env(root), [self.TITLED], *self.PLAN)
            self.assertEqual(done.returncode, 0, done.stdout + done.stderr)
            self.assertEqual(collected(root), [('r', 950, '[I01:E00] Work'), ('r', 961, 'Early work'),
                                               ('s', 962, 'Older work')])

    def test_the_sync_settles_the_row_by_its_linked_pull_request(self):
        snapshot = [{'repo': 'o/r', 'number': 950, 'closingIssuesReferences': []},
                    {'repo': 'o/r', 'number': 961, 'closingIssuesReferences': []},
                    {'repo': 'o/s', 'number': 962, 'closingIssuesReferences': [{'repo': 'o/r', 'number': 3}]}]
        for fetched in (False, True):
            with tempfile.TemporaryDirectory() as tmp, self.subTest(fetched=fetched):
                root = Path(tmp)
                done = linked(root, self.env(root), [self.TITLED], *self.PLAN)
                self.assertEqual(done.returncode, 0, done.stdout + done.stderr)
                if not fetched:
                    (root / 'prs.json').write_text(json.dumps(self.TITLED) + '\n')
                (root / 'links.json').write_text(json.dumps(snapshot))
                sync = run('sync.py', str(root / 'epic.json'), '--prs', str(root / 'prs.json'),
                           '--links', str(root / 'links.json'), '--tasks', str(root / 'task.json'))
                self.assertEqual(sync.returncode, 0, sync.stderr)
                closable = next(line for line in sync.stdout.splitlines() if 'closable:' in line)
                absent = 'note: W01 links #961, which is not among the pull requests given'
                self.assertEqual(absent in sync.stdout, not fetched, sync.stdout)
                self.assertEqual('W01' in closable, not fetched, closable)
                self.assertEqual('retitle: #961 → [I01:E00] Early work' in sync.stdout, fetched, sync.stdout)

    def test_board_items_name_the_plan(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            items = [item(self.EPIC, 'In Progress'), item(self.TASK, 'Ready'),
                     {'content_type': 'DraftIssue', 'content': {'title': 'Note'}}]
            done = linked(root, self.env(root), [self.TITLED], ('items.json', items))
            self.assertEqual(done.returncode, 0, done.stdout + done.stderr)
            self.assertEqual([number for _, number, _ in collected(root)], [950, 961, 962])

    def test_a_held_pull_request_is_not_added_again(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            done = linked(root, self.env(root), [self.TITLED, self.EARLY, self.ELSEWHERE], *self.PLAN)
            self.assertEqual(done.returncode, 0, done.stdout + done.stderr)
            self.assertIn('0 linked pull request(s) added', done.stdout)
            self.assertEqual(len(collected(root)), 3)

    def test_an_unreadable_pull_request_adds_nothing(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            done = linked(root, self.env(root, self.TITLED, self.ELSEWHERE), [self.TITLED], *self.PLAN)
            self.assertEqual(done.returncode, 1, done.stdout + done.stderr)
            self.assertEqual(done.stdout.strip(), 'unreadable: pull request o/r#961: Not Found')
            self.assertEqual(collected(root), [('r', 950, '[I01:E00] Work')])

    def test_an_unreadable_relation_adds_nothing(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            done = linked(root, self.env(root, unread=(3,)), [self.TITLED], *self.PLAN)
            self.assertEqual(done.returncode, 1, done.stdout + done.stderr)
            self.assertIn('unreadable: issue o/r#3', done.stdout)
            self.assertEqual(len(collected(root)), 1)


def page(nodes: list | None, more: bool = False, cursor: str | None = 'c') -> dict:
    """One page of a pull request's closing-issue relation."""
    return {'closingIssuesReferences': {'nodes': nodes, 'pageInfo': {'hasNextPage': more, 'endCursor': cursor}}}


LINKED = {'number': 3, 'repository': {'nameWithOwner': 'o/r'}}


class Reader(unittest.TestCase):
    """development.read over tracker responses, one per page, for pull requests o/r#1 and o/r#2."""

    def read(self, *responses: dict) -> tuple[dict, dict]:
        sys.path.insert(0, str(SCRIPTS))
        from development import PULL_REQUEST, read
        answers = iter(responses)
        return read(PULL_REQUEST, [('o/r', 1), ('o/r', 2)], lambda _: next(answers))

    def answer(self, first, second, errors=()) -> dict:
        return {'data': {'r0': {'p1': first, 'p2': second}}, **({'errors': list(errors)} if errors else {})}

    def test_an_empty_relation_read_whole_is_an_empty_link_set(self):
        held, unreadable = self.read(self.answer(page([]), page([LINKED])))
        self.assertEqual((held, unreadable), ({('o/r', 1): [], ('o/r', 2): [LINKED]}, {}))

    def test_each_relation_not_read_whole_is_named_and_holds_no_links(self):
        cases = {
            'a null node': (self.answer(None, page([LINKED])), 'not returned'),
            'an error naming the node': (
                self.answer(None, page([LINKED]), [{'path': ['r0', 'p1'], 'message': 'Could not resolve'}]),
                'Could not resolve'),
            'an error beneath a returned node': (
                self.answer(page([LINKED]), page([LINKED]),
                            [{'path': ['r0', 'p1', 'closingIssuesReferences', 'nodes', 0], 'message': 'Forbidden'}]),
                'Forbidden'),
            'a null relation': (self.answer({'closingIssuesReferences': None}, page([LINKED])),
                                'closingIssuesReferences not returned'),
            'null nodes': (self.answer(page(None), page([LINKED])), 'closingIssuesReferences nodes not returned'),
            'a null linked node': (self.answer(page([LINKED, None]), page([LINKED])),
                                   'a linked node in closingIssuesReferences not returned'),
            'no page information': (self.answer({'closingIssuesReferences': {'nodes': []}}, page([LINKED])),
                                    'closingIssuesReferences page information not returned'),
            'a further page with no cursor': (self.answer(page([LINKED], more=True, cursor=None), page([LINKED])),
                                              'closingIssuesReferences reports a further page with no cursor'),
        }
        for case, (response, reason) in cases.items():
            with self.subTest(case):
                held, unreadable = self.read(response)
                self.assertEqual(unreadable, {('o/r', 1): reason})
                self.assertEqual(held, {('o/r', 2): [LINKED]})

    def test_a_later_page_that_fails_drops_the_pages_read(self):
        held, unreadable = self.read(
            self.answer(page([LINKED], more=True), page([LINKED])),
            {'data': {'r0': {'p1': None}},
             'errors': [{'path': ['r0', 'p1'], 'message': 'Something went wrong'}]})
        self.assertEqual((held, unreadable), ({('o/r', 2): [LINKED]}, {('o/r', 1): 'Something went wrong'}))

    def test_an_error_reaching_every_subject_names_each(self):
        for path in (None, ['r0']):
            with self.subTest(path=path):
                held, unreadable = self.read(self.answer(page([]), page([LINKED]),
                                                         [{'path': path, 'message': 'API rate limit exceeded'}]))
                self.assertEqual(held, {})
                self.assertEqual(unreadable, dict.fromkeys([('o/r', 1), ('o/r', 2)], 'API rate limit exceeded'))


class FailedCall(unittest.TestCase):
    """development.gh over a gh call that fails before any subject is read."""

    def call(self, code: int, stdout: str, stderr: str = '') -> str:
        sys.path.insert(0, str(SCRIPTS))
        import development
        done = subprocess.CompletedProcess([], code, stdout, stderr)
        original = development.subprocess.run
        development.subprocess.run = lambda *a, **k: done
        try:
            with self.assertRaises(SystemExit) as raised:
                development.gh(Path('query.graphql'))
        finally:
            development.subprocess.run = original
        return str(raised.exception.code)

    def test_a_rejected_call_names_what_gh_reported(self):
        self.assertIn('Bad credentials',
                      self.call(1, '{"message": "Bad credentials", "status": "401"}', 'gh: Bad credentials (HTTP 401)'))

    def test_output_that_is_not_json_names_gh_stderr(self):
        self.assertIn('connection reset', self.call(1, '', 'connection reset by peer'))

    def test_graphql_errors_return_for_each_subject(self):
        sys.path.insert(0, str(SCRIPTS))
        import development
        body = {'data': {'r0': {'p1': None}}, 'errors': [{'path': ['r0', 'p1'], 'message': 'Could not resolve'}]}
        done = subprocess.CompletedProcess([], 1, json.dumps(body), '')
        original = development.subprocess.run
        development.subprocess.run = lambda *a, **k: done
        try:
            self.assertEqual(development.gh(Path('query.graphql')), body)
        finally:
            development.subprocess.run = original


class Query(unittest.TestCase):
    def test_the_query_carries_no_variable(self):
        sys.path.insert(0, str(SCRIPTS))
        from development import ISSUE, query
        text = query(ISSUE, {('o/r', 3): None, ('o/s', 5): 'Y3Vyc29y'})
        self.assertNotIn('$', text)
        self.assertIn('after: "Y3Vyc29y"', text)
        self.assertEqual(len(re.findall(r'repository\(', text)), 2)


if __name__ == '__main__':
    unittest.main()
