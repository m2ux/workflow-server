"""Verify the launcher enforces filesystem and network boundaries."""

import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent


class SandboxTests(unittest.TestCase):
    def test_kernel_boundaries_and_explicit_extra_root(self):
        with tempfile.TemporaryDirectory(prefix='.sandbox-test-', dir=ROOT) as directory:
            base = Path(directory)
            project = base / 'project'
            sibling = base / 'sibling'
            project.mkdir()
            sibling.mkdir()
            subprocess.run(['git', 'init', '-q', str(project)], check=True)
            (project / 'escape').symlink_to(sibling, target_is_directory=True)
            probe = project / 'probe.py'
            probe.write_text('''import errno, json, pathlib, socket, sys
root, other, port = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), int(sys.argv[3])
(root / 'allowed').write_text('probe')
result = {'project_write': True}
for name, path in [('sibling_blocked', other / 'blocked'), ('symlink_blocked', root / 'escape/blocked')]:
    try:
        path.write_text('probe')
        result[name] = False
    except OSError as error:
        result[name] = error.errno in (errno.EROFS, errno.EACCES, errno.EPERM)
try:
    with socket.create_connection(('127.0.0.1', port), timeout=1):
        result['network_blocked'] = False
except OSError:
    result['network_blocked'] = True
print(json.dumps(result))
''')
            env = dict(os.environ, SBX_PROJECTS_BASE=str(base), SBX_EXTRA_ROOTS='')
            with socket.socket() as listener:
                listener.bind(('127.0.0.1', 0))
                listener.listen()
                result = subprocess.run([str(ROOT / 'scripts/sbx'), sys.executable, str(probe),
                                         str(project), str(sibling), str(listener.getsockname()[1])],
                                        cwd=project, env=env, text=True, capture_output=True, timeout=10)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout), {'project_write': True, 'sibling_blocked': True,
                                                        'symlink_blocked': True, 'network_blocked': True})
            env['SBX_EXTRA_ROOTS'] = str(sibling)
            result = subprocess.run([str(ROOT / 'scripts/sbx'), 'touch', str(sibling / 'allowed')],
                                    cwd=project, env=env, text=True, capture_output=True, timeout=10)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue((sibling / 'allowed').exists())


if __name__ == '__main__':
    unittest.main()
