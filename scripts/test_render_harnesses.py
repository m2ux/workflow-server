"""Generic rendering orchestration and shared-source links."""

import importlib.util
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("renderer", ROOT / "scripts/render-harnesses.py")
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)


class RendererTests(unittest.TestCase):
    def test_shared_links_resolve_from_real_harness_directories(self):
        for area in ("config", "hooks"):
            for directory in ROOT.glob(f".*/{area}"):
                shared = directory / "shared"
                with self.subTest(directory=directory):
                    self.assertFalse(directory.is_symlink())
                    self.assertTrue(shared.is_symlink())
                    self.assertEqual(shared.resolve(), ROOT / area)

    def test_renderer_detects_output_drift(self):
        with tempfile.TemporaryDirectory(prefix="harness-render-") as directory:
            root = Path(directory)
            for area in ("config", "rules"):
                shutil.copytree(ROOT / area, root / area, ignore=shutil.ignore_patterns("__pycache__"))
            for template in ROOT.glob(".*/*.template.json"):
                target = root / template.relative_to(ROOT)
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(template, target)
            (root / ".mcp.json").write_text('{"mcpServers":{}}')
            command = [sys.executable, str(ROOT / "scripts/render-harnesses.py"), "--workspace", str(root)]
            subprocess.run(command, check=True, capture_output=True)
            subprocess.run(command + ["--check"], check=True, capture_output=True)
            output = next(path for path in renderer.render(root, Path.home()) if path.endswith(".json"))
            (root / output).write_text("{}")
            result = subprocess.run(command + ["--check"], capture_output=True, text=True)
            self.assertEqual(result.returncode, 1)
            self.assertIn(output, result.stderr)


if __name__ == "__main__":
    unittest.main()
