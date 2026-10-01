"""edit_guard.py driven as Claude Code's PostToolUse hook over seeded corpus edits.

The stub guard runner reports a finding per PROTO-DEFECT line (a protocol guard), fails on any
TEXT-DEFECT line (a text guard), and cannot measure a tree holding UNMEASURABLE.

Run from the skill directory: python3 -m unittest discover -s test
"""
import tempfile
import unittest
from pathlib import Path

from fixtures import Repo, Workspace, git, hook_input

HEADER = '──── marker-protocol ────'
EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'


class IntroducedFailure(Workspace):
    def test_failure_the_branch_introduced_blocks_and_names_the_guard_and_finding(self):
        self.from_workflows()
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nPROTO-DEFECT fresh\n')
        run = self.edit('activities/start.yaml')
        self.assertEqual(run.returncode, 2)
        self.assertIn(HEADER, run.stderr)
        self.assertIn('PROTO-DEFECT fresh', run.stderr)
        self.assertIn('origin/workflows', run.stderr)
        self.assertIn('start.yaml', run.stderr)
        self.assertEqual(self.calls(), ['tree', 'base'])

    def test_committed_failure_on_the_branch_blocks(self):
        self.from_workflows()
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nPROTO-DEFECT fresh\n')
        self.corpus.commit('Defect')
        run = self.edit('activities/start.yaml')
        self.assertEqual(run.returncode, 2)
        self.assertIn('PROTO-DEFECT fresh', run.stderr)

    def test_new_finding_in_a_guard_failing_at_the_branch_point_blocks(self):
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nPROTO-DEFECT old\n')
        self.from_workflows()
        self.corpus.write('corpus/demo/activities/start.yaml',
                          'id: start\nPROTO-DEFECT old\nPROTO-DEFECT new\n')
        run = self.edit('activities/start.yaml')
        self.assertEqual(run.returncode, 2)
        self.assertIn('PROTO-DEFECT new', run.stderr)
        self.assertNotIn('PROTO-DEFECT old', run.stderr)

    def test_text_guard_failing_only_on_the_branch_blocks_with_its_output(self):
        self.from_workflows()
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nTEXT-DEFECT fresh\n')
        run = self.edit('activities/start.yaml')
        self.assertEqual(run.returncode, 2)
        self.assertIn('──── marker-text ────', run.stderr)
        self.assertIn('TEXT-DEFECT fresh', run.stderr)


class PreExistingFailure(Workspace):
    def test_failure_present_at_the_branch_point_passes(self):
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nPROTO-DEFECT old\n')
        self.from_workflows()
        self.corpus.write('corpus/demo/workflow.yaml', 'id: demo\nversion: 2\n')
        run = self.edit('workflow.yaml')
        self.assertEqual(run.returncode, 0, run.stderr)
        self.assertEqual(run.stderr, '')
        self.assertEqual(self.calls(), ['tree', 'base'])

    def test_failure_whose_line_moves_still_passes(self):
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nPROTO-DEFECT old\n')
        self.from_workflows()
        self.corpus.write('corpus/demo/activities/start.yaml',
                          'id: start\nsteps:\n  - one\n  - two\nPROTO-DEFECT old\n')
        run = self.edit('activities/start.yaml')
        self.assertEqual(run.returncode, 0, run.stderr)

    def test_text_guard_failing_at_the_branch_point_passes_whatever_it_adds(self):
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nTEXT-DEFECT old\n')
        self.from_workflows()
        self.corpus.write('corpus/demo/activities/start.yaml',
                          'id: start\nTEXT-DEFECT old\nTEXT-DEFECT new\n')
        run = self.edit('activities/start.yaml')
        self.assertEqual(run.returncode, 0, run.stderr)


class NearestBranchPoint(Workspace):
    """origin/i09/workflows is one commit ahead of origin/workflows, and that commit holds a defect."""

    def setUp(self):
        super().setUp()
        self.workflows = self.corpus.commit('Base')
        self.corpus.ref('workflows', self.workflows)
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nPROTO-DEFECT epic\n')
        self.i09 = self.corpus.commit('Earlier epic')
        self.corpus.ref('i09/workflows', self.i09)

    def test_failure_on_the_integration_branch_passes_a_branch_cut_from_it(self):
        self.corpus.branch('feature', self.i09)
        self.corpus.write('corpus/demo/workflow.yaml', 'id: demo\nversion: 2\n')
        self.corpus.commit('Feature')
        self.corpus.write('corpus/demo/workflow.yaml', 'id: demo\nversion: 3\n')
        run = self.edit('workflow.yaml')
        self.assertEqual(run.returncode, 0, run.stderr)

    def test_same_defect_blocks_a_branch_cut_from_workflows(self):
        self.corpus.branch('feature', self.workflows)
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nPROTO-DEFECT epic\n')
        run = self.edit('activities/start.yaml')
        self.assertEqual(run.returncode, 2)
        self.assertIn('PROTO-DEFECT epic', run.stderr)
        self.assertIn('origin/', run.stderr)

    def test_same_defect_blocks_when_only_workflows_is_known(self):
        git(self.corpus.path, 'update-ref', '-d', 'refs/remotes/origin/i09/workflows')
        self.corpus.branch('feature', self.workflows)
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nPROTO-DEFECT epic\n')
        run = self.edit('activities/start.yaml')
        self.assertEqual(run.returncode, 2)
        self.assertIn('origin/workflows', run.stderr)


class Unmeasured(Workspace):
    """A run that cannot measure blocks with its reason, never passes."""

    def failing_edit(self):
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nPROTO-DEFECT fresh\n')

    def assertUnmeasured(self, run, reason: str):
        self.assertEqual(run.returncode, 2)
        self.assertIn('cannot measure', run.stderr)
        self.assertIn(reason, run.stderr)

    def test_no_server_checkout(self):
        self.from_workflows()
        self.failing_edit()
        run = self.edit('activities/start.yaml', server=self.tmp / 'absent')
        self.assertUnmeasured(run, 'no server checkout')

    def test_server_without_the_guard_suite(self):
        empty = Repo(self.tmp / 'empty-server')
        empty.commit('Empty')
        self.from_workflows()
        self.failing_edit()
        run = self.hook(hook_input(self.corpus.file('activities/start.yaml')),
                        raw_args=('--server', str(empty.path), '--cache', str(self.cache)))
        self.assertUnmeasured(run, 'no server checkout')

    def test_no_tsx(self):
        self.from_workflows()
        self.failing_edit()
        run = self.hook(hook_input(self.corpus.file('activities/start.yaml')),
                        raw_args=('--server', str(self.server.path), '--cache', str(self.cache)))
        self.assertUnmeasured(run, 'tsx')

    def test_guard_runner_that_cannot_start(self):
        self.from_workflows()
        self.failing_edit()
        run = self.edit('activities/start.yaml', guards=str(self.tmp / 'no-such-runner'))
        self.assertUnmeasured(run, 'could not start the guards')

    def test_no_integration_ref(self):
        self.corpus.commit('Base')
        self.failing_edit()
        run = self.edit('activities/start.yaml')
        self.assertUnmeasured(run, 'no origin/workflows')
        self.assertIn('PROTO-DEFECT fresh', run.stderr)

    def test_no_merge_base(self):
        self.corpus.commit('Base')
        unrelated = git(self.corpus.path, 'commit-tree', EMPTY_TREE, '-m', 'Unrelated')
        self.corpus.ref('workflows', unrelated)
        self.failing_edit()
        run = self.edit('activities/start.yaml')
        self.assertUnmeasured(run, 'no merge-base')

    def test_server_without_a_head(self):
        bare = Repo(self.tmp / 'headless-server')
        bare.write('guards/check-all.ts', '// stand-in\n')
        self.from_workflows()
        self.failing_edit()
        run = self.edit('activities/start.yaml', server=bare.path)
        self.assertUnmeasured(run, 'git HEAD')

    def test_guard_unmeasured_on_the_edited_tree(self):
        self.from_workflows()
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nUNMEASURABLE\n')
        run = self.edit('activities/start.yaml')
        self.assertUnmeasured(run, 'measure')
        self.assertIn('──── measure ────', run.stderr)

    def test_guard_unmeasured_at_the_branch_point_too(self):
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nUNMEASURABLE\n')
        self.from_workflows()
        self.corpus.write('corpus/demo/workflow.yaml', 'id: demo\nversion: 2\n')
        run = self.edit('workflow.yaml')
        self.assertUnmeasured(run, '──── measure ────')

    def test_runner_that_exits_2_with_no_report(self):
        self.from_workflows()
        run = self.edit('activities/start.yaml', stub=('--silent',))
        self.assertUnmeasured(run, 'exit 2')

    def test_runner_that_cannot_measure_the_branch_point(self):
        self.from_workflows()
        self.failing_edit()
        run = self.edit('activities/start.yaml', stub=('--broken-base',))
        self.assertUnmeasured(run, 'reported no run')
        self.assertEqual(self.calls(), ['tree', 'base'])

    def test_runner_that_exits_2_over_a_report_of_passes(self):
        """DEFECT: check() reads the runner's exit code only to recognise a clean run. A runner that
        exits 2 (unmeasured) while every table row reads PASS falls through to the branch point,
        finds no delta, and exits 0: a silent pass, against AC8."""
        self.from_workflows()
        run = self.edit('activities/start.yaml', stub=('--exit', '2'))
        self.assertUnmeasured(run, 'exit 2')

    def test_malformed_input(self):
        for stdin in ('not json', '', '[]'):
            with self.subTest(stdin=stdin):
                run = self.hook(stdin)
                self.assertEqual(run.returncode, 2)
                self.assertIn('cannot measure', run.stderr)
        self.assertEqual(self.calls(), [])


class Paths(Workspace):
    def test_each_definition_kind_runs_the_guards(self):
        self.from_workflows()
        for rel in ('workflow.yaml', 'README.md', 'activities/start.yaml', 'routines/review.yaml',
                    'techniques/draft.md', 'resources/notes.md', 'activities/nested/deep.yaml'):
            with self.subTest(rel=rel):
                self.log.unlink(missing_ok=True)
                self.corpus.write(f'corpus/demo/{rel}', 'content\n')
                run = self.edit(rel)
                self.assertEqual(run.returncode, 0, run.stderr)
                self.assertEqual(self.calls(), ['tree'], 'a clean tree runs no branch point')

    def test_corpus_root_readme_runs_the_guards(self):
        self.from_workflows()
        path = self.corpus.write('corpus/README.md', 'Corpus\n')
        self.assertEqual(self.hook(hook_input(path)).returncode, 0)
        self.assertEqual(self.calls(), ['tree'])

    def test_each_editing_tool_runs_the_guards(self):
        self.from_workflows()
        for tool in ('Edit', 'Write', 'MultiEdit'):
            with self.subTest(tool=tool):
                self.log.unlink(missing_ok=True)
                self.hook(hook_input(self.corpus.file('workflow.yaml'), tool=tool))
                self.assertEqual(self.calls(), ['tree'])

    def test_relative_path_resolves_against_cwd(self):
        self.from_workflows()
        self.failing_edit_in('activities/start.yaml')
        run = self.hook(hook_input('corpus/demo/activities/start.yaml', cwd=self.corpus.path))
        self.assertEqual(run.returncode, 2)
        self.assertEqual(self.calls(), ['tree', 'base'])

    def failing_edit_in(self, rel: str):
        self.corpus.write(f'corpus/demo/{rel}', 'PROTO-DEFECT fresh\n')

    def test_non_definition_paths_run_no_guard(self):
        self.from_workflows()
        outside = Path(tempfile.mkdtemp(dir=self.tmp)) / 'corpus' / 'demo' / 'activities' / 'a.yaml'
        outside.parent.mkdir(parents=True)
        outside.write_text('PROTO-DEFECT\n')
        loose_tree = Repo(self.tmp / 'no-corpus')
        loose = loose_tree.write('elsewhere/activities/a.yaml', 'PROTO-DEFECT\n')
        cases = {
            'outside corpus/': self.corpus.path / 'scripts' / 'tool.yaml',
            'top-level README': self.corpus.write('README.md', 'PROTO-DEFECT\n'),
            'corpus/ file of another kind': self.corpus.write('corpus/demo/schemas/s.json', '{}\n'),
            'corpus/ file beside the definitions': self.corpus.write('corpus/demo/notes.md', 'x\n'),
            'path outside any git repository': outside,
            'repository without corpus/': loose,
        }
        for name, path in cases.items():
            with self.subTest(name=name):
                run = self.hook(hook_input(path))
                self.assertEqual(run.returncode, 0, run.stderr)
                self.assertEqual(run.stderr, '')
        self.assertEqual(self.calls(), [], 'the guards ran for a non-definition path')

    def test_input_without_a_file_path_runs_no_guard(self):
        run = self.hook('{"tool_name": "Edit", "tool_input": {}}')
        self.assertEqual(run.returncode, 0)
        self.assertEqual(self.calls(), [])

    def test_clean_edited_tree_runs_no_branch_point(self):
        self.corpus.commit('Base')
        self.corpus.write('corpus/demo/workflow.yaml', 'id: demo\nversion: 2\n')
        run = self.edit('workflow.yaml')
        self.assertEqual(run.returncode, 0, run.stderr)
        self.assertEqual(self.calls(), ['tree'])


class BranchPointCache(Workspace):
    def setUp(self):
        super().setUp()
        self.corpus.write('corpus/demo/activities/start.yaml', 'id: start\nPROTO-DEFECT old\n')
        self.base = self.from_workflows()
        self.corpus.write('corpus/demo/workflow.yaml', 'id: demo\nversion: 2\n')

    def test_second_run_reuses_the_cached_branch_point(self):
        self.assertEqual(self.edit('workflow.yaml').returncode, 0)
        self.assertEqual(self.edit('workflow.yaml').returncode, 0)
        self.assertEqual(self.calls(), ['tree', 'base', 'tree'])
        cached = self.cache / f'edit-guard-{self.base}-{self.server.head()}.json'
        self.assertEqual([p.name for p in self.cache.iterdir()], [cached.name])

    def test_cached_branch_point_still_attributes_a_new_failure(self):
        self.edit('workflow.yaml')
        self.corpus.write('corpus/demo/workflow.yaml', 'id: demo\nPROTO-DEFECT new\n')
        run = self.edit('workflow.yaml')
        self.assertEqual(run.returncode, 2)
        self.assertIn('PROTO-DEFECT new', run.stderr)
        self.assertNotIn('PROTO-DEFECT old', run.stderr)
        self.assertEqual(self.calls(), ['tree', 'base', 'tree'])

    def test_server_commit_measures_the_branch_point_again(self):
        self.edit('workflow.yaml')
        self.server.write('guards/check-all.ts', '// changed\n')
        self.server.commit('Guards change')
        self.edit('workflow.yaml')
        self.assertEqual(self.calls(), ['tree', 'base', 'tree', 'base'])
        self.assertEqual(len(list(self.cache.iterdir())), 2)

    def test_dirty_server_measures_the_branch_point_every_run_and_caches_none(self):
        for dirt in ('untracked', 'modified'):
            with self.subTest(dirt=dirt):
                self.log.unlink(missing_ok=True)
                if dirt == 'untracked':
                    self.server.write('guards/new-guard.ts', '// new\n')
                else:
                    git(self.server.path, 'clean', '-fdq')
                    self.server.write('guards/check-all.ts', '// edited\n')
                self.assertEqual(self.edit('workflow.yaml').returncode, 0)
                self.assertEqual(self.edit('workflow.yaml').returncode, 0)
                self.assertEqual(self.calls(), ['tree', 'base', 'tree', 'base'])
                self.assertFalse(self.cache.exists() and any(self.cache.iterdir()))

    def test_dirty_server_ignores_an_existing_cache(self):
        self.edit('workflow.yaml')
        self.server.write('guards/new-guard.ts', '// new\n')
        self.edit('workflow.yaml')
        self.assertEqual(self.calls(), ['tree', 'base', 'tree', 'base'])

    def test_unreadable_cache_is_measured_again(self):
        self.edit('workflow.yaml')
        for entry in self.cache.iterdir():
            entry.write_text('not json')
        self.assertEqual(self.edit('workflow.yaml').returncode, 0)
        self.assertEqual(self.calls(), ['tree', 'base', 'tree', 'base'])


if __name__ == '__main__':
    unittest.main()
