"""Unit Dispatch creates a new unit's checkouts once, reuses a retained preparation only once each checkout verifies, and resumes a capacity wait into one checked start.

The bounded executor reads the two checkout routes of Unit Dispatch, selects
the capabilities a route calls for its entry, and runs each one's documented
Delivery Branches command against real local Git repositories; start
validation runs through dispatch.py. It does not interpret unrestricted prose
or establish live agent behavior.
"""
import html
import re
import shlex
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import GIT, git, repository

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker  # noqa: E402
from dispatch import batch, check_start  # noqa: E402

DISPATCH = ROOT / 'protocols' / 'unit-dispatch.md'
BRANCHES = ROOT / 'artifacts' / 'delivery-branches.md'
CALL = re.compile(r'(?:Apply|Run|Follow) \[([^]]+)\]\(([^)]+) "ƒ"\)')
BOARD = 'users/o/projectsV2/7'
AUTH = {'board': BOARD, 'scope': ['o/r#I07'], 'lane': None}
UNIT = {'id': 'o/r#I07:E00:W01', 'record': '2026-11-11-943-i07-e00-w01-work', 'report': 'unit W01'}
CREATION = ['Fetch Remote Branch', 'Add Task Worktree', 'Read Checkout Revision']
VALIDATION = ['Check Task Worktree']
STEPS = ['Check Execution Prerequisites', 'Publish the Record', 'Hold the Unit',
         'Prepare the Session', 'Start the Worker']


def section(source, title):
    match = re.search(r'^(#{1,6}) ' + re.escape(title) + r'\n', source, re.M)
    if not match:
        raise ValueError(f'missing section: {title}')
    rest = source[match.end():]
    end = re.search(r'^#{1,' + str(len(match[1])) + r'} ', rest, re.M)
    return rest[:end.start()] if end else rest


def route(entry):
    """The capabilities Unit Dispatch selects to prepare checkouts for a new or retained entry."""
    title = {'new': 'New Unit Checkouts', 'retained': 'Retained Unit Checkouts'}[entry]
    return CALL.findall(section(DISPATCH.read_text(), title))


def command(name, values):
    """The documented command for one Delivery Branches capability, rendered as argv."""
    spec = section(BRANCHES.read_text(), name)
    raw = re.search(r'<big><pre>\n(.*?)\n</pre></big>', spec, re.S)[1]
    rendered = html.unescape(re.sub(r'\[\*\*(.*?)\*\*\]\([^)]*\)', r'\1', raw))
    rendered = re.sub(r'<([^>]+)>', lambda match: values[match[1]], rendered.replace('\\\n', ' '))
    words = shlex.split(rendered)
    if '&&' in words:
        # cd <workspace> && <workspace>/scripts/sbx python3 <script> ...: the suite already runs
        # sandboxed, so the interpreter runs the script directly in the workspace.
        cwd = Path(words[words.index('&&') - 1])
        words = words[words.index('&&') + 1:]
        return cwd, [sys.executable, *words[words.index('python3') + 1:]]
    return None, [*GIT, *words[1:]] if words[0] == 'git' else words


class Blocked(Exception):
    """A unit blocker: the capability that failed and its observed error."""


class Session:
    """One unit's dispatch, recording each event in order."""

    def __init__(self, project):
        self.project = project
        self.events = []

    def execute(self, name, values):
        cwd, argv = command(name, {'workspace': str(WORKSPACE), **values})
        self.events.append(name)
        return subprocess.run(argv, cwd=cwd or self.project, capture_output=True, text=True)

    def prepare(self, entry, checkouts):
        """Each checkout the selected route creates or verifies; any failure blocks the unit."""
        names = [name for name, _ in route(entry)]
        prepared, failures = [], []
        for checkout in checkouts:
            values = {'project-checkout': str(self.project), 'worktree-path': checkout['path'],
                      'unit-worktree': checkout['path'], 'task-branch': checkout['branch'],
                      'base': checkout['base'], 'source-branch': checkout['base'],
                      'checkout': checkout['path'], 'revision': 'HEAD',
                      'preparation-head': checkout.get('head', '')}
            for name in names:
                done = self.execute(name, values)
                if done.returncode:
                    failures.append((name, done.stderr.strip()))
                    break
                if name == 'Read Checkout Revision':
                    checkout = {**checkout, 'head': done.stdout.strip()}
            prepared.append(checkout)
            if failures and entry == 'new':
                break
        if failures:
            raise Blocked(failures)
        return prepared

    def publish(self, record):
        self.events.append('publish')
        return record

    def hold(self, record, reserved):
        self.events.append('hold')
        if reserved != record:
            raise Blocked([('hold', 'a competing hold names another record')])
        return {'unit': UNIT['id'], 'published_record': record,
                'reserved_record': reserved, 'reservation_verified': True}

    def start(self, selected, evidence, sessions, capacity):
        """The worker starts only once the start check passes; a capacity-only failure waits."""
        self.events.append('check start')
        try:
            unit = check_start(selected, UNIT['id'], evidence, sessions, capacity)
        except ValueError as error:
            if 'free harness slot' in str(error):
                self.events.append('wait')
                return None
            raise Blocked([('start', str(error))]) from error
        self.events.append('start')
        return unit


def snapshot(project, *paths):
    """The repository registration, refs and each checkout's branch, head, status and files."""
    state = [git(project, 'worktree', 'list', '--porcelain'),
             git(project, 'for-each-ref', '--format=%(refname) %(objectname)')]
    for path in paths:
        checkout = project / path
        if not checkout.exists():
            state.append(('absent', path))
            continue
        state.append(sorted((str(file.relative_to(checkout)), file.read_bytes())
                            for file in checkout.rglob('*')
                            if file.is_file() and file.name != '.git'))
        state += [git(checkout, 'rev-parse', 'HEAD'), git(checkout, 'branch', '--show-current'),
                  git(checkout, 'status', '--porcelain', '--untracked-files=all')]
    return state


class Repositories(unittest.TestCase):
    """A project cloned from an origin holding two epic bases."""

    BASES = ('i07/e00/workspace', 'i07/e00/main')

    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        origin = self.root / 'origin'
        repository(origin, 'workspace', 'main')
        for base in self.BASES:
            git(origin, 'branch', base)
        self.project = self.root / 'project'
        git(self.root, 'clone', '-q', str(origin), str(self.project))
        self.base_head = git(origin, 'rev-parse', 'HEAD')

    def checkouts(self, *bases):
        return [{'path': f'.worktrees/i07/e00/w01 {base.rsplit("/", 1)[1]}',
                 'branch': f'i07/e00/w01-work-{base.rsplit("/", 1)[1]}', 'base': base}
                for base in bases]

    def created(self, *bases):
        session = Session(self.project)
        return session.prepare('new', self.checkouts(*bases or self.BASES[:1]))


class Route(unittest.TestCase):
    """AC14: the protocol owns one new/retained selection over the Delivery Branches capabilities."""

    def test_a_new_unit_selects_creation_and_records_its_full_head(self):
        text = section(DISPATCH.read_text(), 'New Unit Checkouts')
        self.assertEqual([name for name, _ in route('new')], CREATION)
        self.assertTrue(text.lstrip().startswith('- For a new unit'))
        self.assertIn('for `HEAD` and retain its full preparation head with the worktree path, branch and base',
                      text)
        for name, target in route('new'):
            with self.subTest(capability=name):
                self.assertTrue(target.startswith('../artifacts/delivery-branches.md#'))
                section(BRANCHES.read_text(), name)

    def test_a_retained_preparation_selects_only_validation(self):
        text = section(DISPATCH.read_text(), 'Retained Unit Checkouts')
        self.assertEqual([name for name, _ in route('retained')], VALIDATION)
        self.assertTrue(text.lstrip().startswith('- For a retained preparation'))
        self.assertIn('for each recorded checkout with the project checkout, retained path, branch '
                      'and full preparation head', text)
        self.assertIn('retain its checkout and hold', text)
        self.assertIsNone(re.search(r'Add Task Worktree|Fetch Remote|reset|remove|prune|clean', text))

    def test_one_validation_implementation_serves_the_route(self):
        self.assertNotIn('<pre>', DISPATCH.read_text())
        homes = [path for folder in ('artifacts', 'protocols', 'modes')
                 for path in sorted((ROOT / folder).glob('*.md'))
                 if '### Check Task Worktree\n' in path.read_text()]
        self.assertEqual(homes, [BRANCHES])
        readers = [path.name for path in sorted((ROOT / 'scripts').glob('*.py'))
                   if "'worktree', 'list'" in path.read_text()]
        self.assertEqual(readers, ['delivery-branches.py'])
        self.assertIn('scripts/delivery-branches.py', ' '.join(command('Check Task Worktree', {
            'workspace': '/w', 'project-checkout': 'p', 'unit-worktree': 'u', 'task-branch': 'b',
            'preparation-head': 'h'})[1]))

    def test_only_a_capacity_wait_retains_a_start_for_resumption(self):
        text = section(DISPATCH.read_text(), '5. Start the Worker')
        self.assertIn("Provide a capacity-only wait with the unit's preparation", text)
        self.assertIn('only after validation succeeds', text)
        self.assertIn('On another failed start, provide a unit blocker', text)


class Creation(Repositories):
    """AC14: a new unit is created once; its preparation is reused without change."""

    def test_a_new_unit_is_created_once_and_reused_without_change(self):
        before = git(self.project, 'worktree', 'list', '--porcelain').count('worktree ')
        prepared = self.created(*self.BASES)
        self.assertEqual(git(self.project, 'worktree', 'list', '--porcelain').count('worktree '),
                         before + 2)
        for checkout in prepared:
            with self.subTest(checkout=checkout['path']):
                self.assertRegex(checkout['head'], r'^[0-9a-f]{40}$')
                self.assertEqual(checkout['head'], self.base_head)
                self.assertEqual(git(self.project / checkout['path'], 'branch', '--show-current'),
                                 checkout['branch'])
        held = snapshot(self.project, *(checkout['path'] for checkout in prepared))
        for _ in range(2):
            session = Session(self.project)
            self.assertEqual(session.prepare('retained', prepared), prepared)
            self.assertEqual(session.events, VALIDATION * 2)
            self.assertEqual(snapshot(self.project, *(checkout['path'] for checkout in prepared)), held)

    def test_one_mismatched_base_blocks_the_whole_unit(self):
        prepared = self.created(*self.BASES)
        (self.project / prepared[0]['path'] / 'held.txt').write_text('held work\n')
        held = snapshot(self.project, *(checkout['path'] for checkout in prepared))
        session = Session(self.project)
        with self.assertRaises(Blocked) as blocked:
            session.prepare('retained', prepared)
        self.assertEqual(session.events, VALIDATION * 2)
        self.assertEqual(len(blocked.exception.args[0]), 1)
        self.assertNotIn('start', session.events)
        self.assertEqual(snapshot(self.project, *(checkout['path'] for checkout in prepared)), held)


class Mismatch(Repositories):
    """AC15: each mismatch blocks reuse, leaves the repository unchanged and starts no worker."""

    def foreign(self, checkout):
        other = self.root / 'other'
        head = repository(other, 'workspace')
        path = self.root / 'foreign checkout'
        git(other, 'worktree', 'add', str(path), '-b', checkout['branch'], head)
        return {**checkout, 'path': str(path), 'head': head}

    def test_each_mismatch_blocks_reuse_without_change(self):
        cases = {
            'absent registration': (lambda c, u: {**c, 'path': '.worktrees/absent'}, 'not registered'),
            'foreign repository': (lambda c, u: self.foreign(c), 'not registered'),
            'wrong branch': (lambda c, u: (git(u, 'switch', '-q', '-c', 'another-task'), c)[1],
                             'recorded branch'),
            'detached head': (lambda c, u: (git(u, 'checkout', '-q', '--detach'), c)[1], 'recorded branch'),
            'later head': (lambda c, u: (git(u, 'commit', '-q', '--allow-empty', '-m', 'task'), c)[1],
                           'preparation head'),
            'missing head': (lambda c, u: {**c, 'head': '0' * 40}, 'preparation head'),
            'abbreviated head': (lambda c, u: {**c, 'head': c['head'][:12]}, 'full commit SHA'),
            'tracked change': (lambda c, u: ((u / 'config' / 'branches').write_text('main\n'), c)[1],
                               'tracked or untracked changes'),
            'staged change': (lambda c, u: ((u / 'config' / 'branches').write_text('main\n'),
                                            git(u, 'add', 'config/branches'), c)[2],
                              'tracked or untracked changes'),
            'untracked file': (lambda c, u: ((u / 'held.txt').write_text('held\n'), c)[1],
                               'tracked or untracked changes'),
        }
        for case, (mutate, reason) in cases.items():
            with self.subTest(case=case):
                self.setUp()
                [prepared] = self.created()
                checkout = mutate(prepared, self.project / prepared['path'])
                paths = list(dict.fromkeys([prepared['path'], checkout['path']]))
                held = snapshot(self.project, *paths)
                selected = batch(AUTH, [UNIT], [], 1, BOARD)
                session = Session(self.project)
                with self.assertRaises(Blocked) as blocked:
                    session.prepare('retained', [checkout])
                    session.start(selected, session.hold(UNIT['record'], UNIT['record']), [], 1)
                [(name, error)] = blocked.exception.args[0]
                self.assertEqual(name, 'Check Task Worktree')
                self.assertIn(reason, error)
                self.assertEqual(session.events, VALIDATION)
                self.assertEqual(snapshot(self.project, *paths), held)


class CapacityWait(Repositories):
    """AC16: a capacity-only wait resumes with its record, context and hold into one checked start."""

    def waiting(self):
        """A new unit published, held and prepared, then waiting on a free slot."""
        session = Session(self.project)
        selected = batch(AUTH, [UNIT], [], 1, BOARD)
        record = session.publish(UNIT['record'])
        evidence = session.hold(record, UNIT['record'])
        checkouts = session.prepare('new', self.checkouts(*self.BASES))
        self.assertIsNone(session.start(selected, evidence, [], 0))
        preparation = {'unit': UNIT, 'batch': selected, 'record': record, 'checkouts': checkouts}
        return session, preparation

    def resume(self, session, preparation, sessions, capacity, reserved=None):
        record = session.publish(preparation['record'])
        evidence = session.hold(record, reserved or preparation['record'])
        session.prepare('retained', preparation['checkouts'])
        return session.start(preparation['batch'], evidence, sessions, capacity)

    def test_the_protocol_orders_record_hold_checkouts_and_start(self):
        headings = re.findall(r'^### \d+\. (.+)$', DISPATCH.read_text(), re.M)
        self.assertEqual(headings, STEPS)

    def test_a_capacity_wait_resumes_into_exactly_one_start(self):
        session, preparation = self.waiting()
        self.assertEqual(batch(AUTH, [], [], 0, BOARD, preparations=[UNIT])['action'], 'wait')
        self.assertEqual(batch(AUTH, [UNIT], [], 1, BOARD, preparations=[UNIT])['units'], [])
        paths = [checkout['path'] for checkout in preparation['checkouts']]
        held = snapshot(self.project, *paths)
        started = self.resume(session, preparation, [], 1)
        self.assertEqual(started, UNIT)
        self.assertEqual(session.events, [
            'publish', 'hold', *CREATION, *CREATION, 'check start', 'wait',
            'publish', 'hold', *VALIDATION * 2, 'check start', 'start'])
        self.assertEqual(session.events.count('start'), 1)
        self.assertEqual(snapshot(self.project, *paths), held)
        running = [{'unit': UNIT['id'], 'session': 'worker-1', 'state': 'running'}]
        self.assertEqual(batch(AUTH, [UNIT], running, 1, BOARD)['units'], [])

    def test_a_competing_session_or_changed_hold_rejects_the_resume(self):
        for case in ('competing session', 'changed hold'):
            with self.subTest(case=case):
                self.setUp()
                session, preparation = self.waiting()
                paths = [checkout['path'] for checkout in preparation['checkouts']]
                held = snapshot(self.project, *paths)
                sessions = ([{'unit': UNIT['id'], 'session': 'worker-2', 'state': 'running'}]
                            if case == 'competing session' else [])
                with self.assertRaises(Blocked):
                    self.resume(session, preparation, sessions, 1,
                                'another-record' if case == 'changed hold' else None)
                self.assertNotIn('start', session.events)
                self.assertEqual(snapshot(self.project, *paths), held)


class Prerequisites(unittest.TestCase):
    """AC16: the separated route reaches its common context before use, with no cycle."""

    def test_unit_dispatch_reaches_rules_and_conventions_without_a_cycle(self):
        common = {ROOT / 'rules.md', ROOT / 'conventions.md'}
        graph = checker.before_use_graph([DISPATCH, *sorted(common)], {})
        self.assertEqual(checker.before_use_cycles(graph), [])
        seen, pending = {(DISPATCH, '')}, [(DISPATCH, '')]
        while pending:
            for edge in graph.get(pending.pop(), ()):
                if (edge.target, edge.anchor) not in seen:
                    seen.add((edge.target, edge.anchor))
                    pending.append((edge.target, edge.anchor))
        self.assertLessEqual(common, {node[0] for node in seen})

    def test_start_context_is_produced_before_its_use(self):
        text = DISPATCH.read_text()
        produced = [text.index("Retain its confirmed remote publication as the unit's [Start Evidence]"),
                    text.index('Retain the confirmed hold for this record'),
                    text.index('retain its full preparation head'),
                    text.index('Require every verified result before preparing the brief')]
        used = text.index('Run [Check Dispatch Start]')
        self.assertEqual(produced, sorted(produced))
        self.assertLess(produced[-1], used)
        self.assertLess(text.index('For a retained preparation, use its captured declared files and selected record'),
                        text.index('For a retained preparation, require every current row to hold its selected record'))


if __name__ == '__main__':
    unittest.main()
