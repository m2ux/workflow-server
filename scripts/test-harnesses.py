#!/usr/bin/env python3
"""Run shared and harness-owned unittest suites in separate interpreters."""

from pathlib import Path
import subprocess
import sys


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    directories = [root / area for area in ("hooks", "config", "scripts")]
    directories.extend(sorted(root.glob(".*/hooks")))
    directories.extend(sorted(root.glob(".*/config")))
    for directory in directories:
        if any(directory.glob("test_*.py")):
            subprocess.run([sys.executable, "-m", "unittest", "discover", "-s", str(directory),
                            "-p", "test_*.py", "-v"], cwd=root, check=True)


if __name__ == "__main__":
    main()
