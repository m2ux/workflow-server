"""The test folder's README names every module and every script, and its rows
match what the folder holds.

A catalogue a reader trusts is one a change cannot quietly outdate. The check
reads the two tables the README carries against the files beside it: each
module gets a row in the table its subject belongs to, the coverage table names
what exercises each script and document, and each module's test count sits
beside its name there.
"""
import ast
import functools
import re
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker  # noqa: E402

README = HERE / 'README.md'
SCRIPT_TESTS = '### Script Tests'
PROSE_TESTS = '### Prose Tests'
SCRIPT_COVERAGE = '### Scripts'
DOCUMENT_COVERAGE = '### Documents'
# The sentence the README took over, held as a pattern so this module carries
# no copy of it.
STALE = r'^Run from the skill directory: python3 -m unittest discover -s test$'
# The catalogue this folder carries, which the check reads rather than a skill
# document. Held in a constant so the check does not read its own search for it.
CATALOGUE = 'README.md'
READ_EVERY_FILE = 'rglob(' + "'*.md'" + ')'
COUNT = re.compile(r'\((\d+)\)')
THIS = Path(__file__).name


@functools.lru_cache(maxsize=None)
def scripts_named(name: str) -> frozenset[str]:
    """Every script stem the module names in an import or a run."""
    text = (HERE / name).read_text()
    stems = {path.stem for path in (ROOT / 'scripts').glob('*.py')}
    found = set()
    for node in ast.walk(ast.parse(text)):
        if isinstance(node, ast.Import):
            found |= {alias.name.split('.')[0] for alias in node.names}
        elif isinstance(node, ast.ImportFrom) and node.module:
            found.add(node.module.split('.')[0])
    found |= {match.group(1) for match in re.finditer(r"['\"]([\w-]+)\.py['\"]", text)}
    return frozenset(found & stems)


def modules() -> list[str]:
    return sorted(path.name for path in HERE.glob('test_*.py') if path.name != THIS)


def scripts() -> list[str]:
    return sorted(path.stem for path in (ROOT / 'scripts').glob('*.py'))


def summary(name: str) -> str:
    """The module docstring's first sentence, without its full stop."""
    doc = ' '.join((ast.get_docstring(ast.parse((HERE / name).read_text())) or '').split())
    return re.split(r'(?<=[.!?]) ', doc)[0].rstrip('.')


def test_count(name: str) -> str:
    return str(len(re.findall(r'^\s*def test_', (HERE / name).read_text(), re.M)))


def without_extension(text: str) -> str:
    """The text with each .py and .md suffix dropped, as the README writes a
    name it links to."""
    return re.sub(r'\.(?:py|md)\b', '', text)


FOLDERS = ('modes', 'artifacts', 'protocols', 'references')
WHOLE_SKILL = frozenset([f'{folder}/' for folder in FOLDERS] + [path.name for path in ROOT.glob('*.md')])


@functools.lru_cache(maxsize=None)
def documents(name: str) -> frozenset[str]:
    """The skill documents the module reads, as the paths its source names.

    A module reading every markdown file covers each document. Otherwise each
    file it names is one entry and each folder it globs is another, except
    where it names a file within that folder.
    """
    if name == THIS:
        return frozenset([CATALOGUE])
    text = (HERE / name).read_text()
    if READ_EVERY_FILE in text:
        return WHOLE_SKILL
    files = {f'{folder}/{filename}'
             for folder, filename in re.findall(r"ROOT / '(\w+)' / '([\w-]+\.md)'", text)}
    folders = {f'{folder}/' for folder in re.findall(r"ROOT / '(\w+)'", text) if folder in FOLDERS}
    folders = {folder for folder in folders if not any(file.startswith(folder) for file in files)}
    found = files | folders
    found |= {filename for filename in (path.name for path in ROOT.glob('*.md')) if f"'{filename}'" in text}
    if "SKILLS.glob('*/SKILL.md')" in text:
        found.add('*/SKILL.md')
    return frozenset(found)


def section(title: str) -> list[str]:
    """The lines under one heading, up to the next heading of the same or a
    higher level."""
    level = len(title) - len(title.lstrip('#'))
    body = README.read_text().split(f'\n{title}\n', 1)[1]
    end = re.search(rf'^#{{1,{level}}} ', body, re.MULTILINE)
    return (body[:end.start()] if end else body).splitlines()


def rows(title: str) -> list[list[str]]:
    """The body rows of the first table under a heading, cells stripped."""
    found, started = [], False
    for line in section(title):
        if line.startswith('|'):
            started = True
            found.append([cell.strip() for cell in line.strip().strip('|').split('|')])
        elif started:
            break
    return found[2:]


def catalogue() -> list[list[str]]:
    """Every catalogue row from both tables."""
    return rows(SCRIPT_TESTS) + rows(PROSE_TESTS)


def linked(cell: str) -> list[str]:
    """The path of each link in a cell, as the README writes it."""
    return re.findall(r'\]\(([^)]+)\)', cell)


def named(cell: str) -> list[str]:
    """The bare name of each link in a cell, path and extension removed."""
    return [Path(target).stem if Path(target).suffix else Path(target).name
            for target in linked(cell)]


def subject(cell: str) -> str:
    """A row's subject as its path in the README: a link's target without its
    relative prefix, or a code span's text.

    A folder stays code text because a link to a directory resolves to nothing
    a reader can open."""
    link = linked(cell)
    return (link[0].removeprefix('../') if link else cell.strip('`'))


class Catalogue(unittest.TestCase):
    def test_every_module_has_one_row(self):
        rows_named = [named(row[0])[0] for row in catalogue()]
        self.assertEqual(sorted({Path(name).stem for name in modules()} - set(rows_named)), [],
                         'modules with no catalogue row')
        self.assertEqual(len(rows_named), len(set(rows_named)), 'modules with two catalogue rows')

    def test_every_module_links_to_its_own_file(self):
        for row in catalogue():
            target = linked(row[0])[0]
            with self.subTest(module=target):
                self.assertTrue((HERE / target).is_file(), f'{target} does not resolve')

    def test_a_module_sits_under_the_table_its_scripts_put_it_in(self):
        """A module that reaches a script is a script test, and one that
        reaches none is a prose test. The split is what the rows state."""
        for title, expected in ((SCRIPT_TESTS, True), (PROSE_TESTS, False)):
            for row in rows(title):
                name = linked(row[0])[0]
                with self.subTest(module=name, table=title):
                    self.assertEqual(bool(scripts_named(name)), expected)

    def test_the_description_is_the_docstring(self):
        """The row states what the docstring states. A link marks a name in one
        and not the other, so link text is not part of the comparison, and the
        README drops a filename's extension where the docstring keeps it."""
        for row in catalogue():
            name = linked(row[0])[0]
            written = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', row[1]).replace('`', '')
            with self.subTest(module=name):
                self.assertEqual(without_extension(written), without_extension(summary(name)))


class Coverage(unittest.TestCase):
    def test_every_script_has_one_row_and_links_to_it(self):
        cells = rows(SCRIPT_COVERAGE)
        self.assertEqual(sorted(set(scripts()) - {Path(linked(row[0])[0]).stem for row in cells}),
                         [], 'scripts with no coverage row')
        for row in cells:
            target = linked(row[0])[0]
            with self.subTest(script=target):
                self.assertTrue((HERE / target).is_file(), f'{target} does not resolve')
                self.assertEqual(Path(target).suffix, '.py')

    def test_every_document_the_prose_tests_read_has_a_row(self):
        held = {doc for name in modules() for doc in documents(name)}
        written = {subject(row[0]) for row in rows(DOCUMENT_COVERAGE)}
        self.assertEqual(sorted(held - written), [], 'documents with no coverage row')

    def test_a_script_row_names_the_modules_that_reach_it(self):
        for row in rows(SCRIPT_COVERAGE):
            script = Path(linked(row[0])[0]).stem
            holders = {Path(name).stem for name in modules() if script in scripts_named(name)}
            with self.subTest(script=script):
                self.assertEqual(set(Path(target).stem for target in linked(row[1])), holders)

    def test_a_document_row_names_the_prose_modules_that_read_it(self):
        for row in rows(DOCUMENT_COVERAGE):
            document = subject(row[0])
            readers = {Path(name).stem for name in modules() + [THIS]
                       if not scripts_named(name) and document in documents(name)}
            with self.subTest(document=document):
                self.assertTrue(readers, f'{document} is read by no prose module')
                self.assertEqual(set(Path(target).stem for target in linked(row[1])), readers)

    def test_each_count_is_the_modules_test_methods(self):
        """A count sits beside the module it measures, in every row naming it."""
        for row in rows(SCRIPT_COVERAGE) + rows(DOCUMENT_COVERAGE):
            for target, count in zip(linked(row[1]), COUNT.findall(row[1])):
                with self.subTest(module=target):
                    self.assertEqual(count, test_count(Path(target).name))

    def test_each_named_module_carries_its_count(self):
        for row in rows(SCRIPT_COVERAGE) + rows(DOCUMENT_COVERAGE):
            self.assertEqual(len(linked(row[1])), len(COUNT.findall(row[1])),
                             f'a module in {row[0]} carries no count')

    def test_every_prose_module_is_named_somewhere(self):
        named_modules = {Path(target).stem for row in rows(DOCUMENT_COVERAGE) for target in linked(row[1])}
        silent = {Path(name).stem for name in modules() + [THIS] if not scripts_named(name)} - named_modules
        self.assertEqual(sorted(silent), [], 'prose modules named by no coverage row')


class RunCommand(unittest.TestCase):
    def test_only_the_readme_carries_the_run_command(self):
        """A module restating the command once the README states it is a second
        home that a change to the command has to find."""
        holders = [path.name for path in HERE.glob('*.py')
                   if path.name != THIS and re.search(STALE, path.read_text(), re.MULTILINE)]
        self.assertEqual(holders, [], 'modules repeating the README run command')


class ReadmeShape(unittest.TestCase):
    def test_the_readme_resolves_every_link(self):
        lines, fenced, headings = checker.scan(README)
        self.assertTrue(headings)
        for _, target in checker.targets(README, lines, fenced):
            name = target.partition('#')[0]
            if name:
                with self.subTest(link=target):
                    self.assertTrue((HERE / name).exists() or (ROOT / name).exists(), target)
