from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

revision = '756aaf9f53f884b1da120e990ec9524a936aa4b2'
current = Path('skills/work-planner').resolve()
sys.path.insert(0, str(current/'test'))
import test_command_contracts as tests

with tempfile.TemporaryDirectory(prefix='reviewed command docs ') as directory:
    frozen = Path(directory)/'skills/work-planner'
    for document in ('board-delivery.md', 'task-body.md', 'hotfix.md',
                     'initiative-issue-body.md', 'issue-body.md', 'delivery-plan.md'):
        relative = Path('skills/work-planner/artifacts')/document
        target = frozen/'artifacts'/document
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(subprocess.check_output(['git', 'show', f'{revision}:{relative}']))
    tests.ROOT = frozen
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromModule(tests))
    print(f'Frozen reviewed source: {revision}; failures={len(result.failures)}; errors={len(result.errors)}')
    sys.exit(0 if result.wasSuccessful() else 1)
