"""Inspect hook discovery, trust, and instructions in a fresh local Codex runtime.

This read-only check does not execute hooks, approve trust, or start a model turn.
It cannot establish enforcement inside an already-running conversation.
"""

import argparse
import json
from pathlib import Path
import selectors
import shlex
import subprocess
import tempfile
import time
import tomllib


def inspect(workspace: Path, executable: str) -> dict:
    with tempfile.TemporaryFile() as errors:
        process = subprocess.Popen([executable, 'app-server', '--strict-config'], cwd=workspace,
                                   stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=errors, bufsize=0)
        try:
            with selectors.DefaultSelector() as selector:
                selector.register(process.stdout, selectors.EVENT_READ)

                def request(number, method, params):
                    process.stdin.write((json.dumps({'id': number, 'method': method, 'params': params}) + '\n').encode())
                    process.stdin.flush()
                    deadline = time.monotonic() + 15
                    while time.monotonic() < deadline:
                        if not selector.select(max(0, deadline - time.monotonic())):
                            break
                        line = process.stdout.readline()
                        if not line:
                            raise RuntimeError('Codex app-server exited before responding')
                        message = json.loads(line)
                        if message.get('id') == number:
                            if 'error' in message:
                                raise RuntimeError(f'{method}: {message["error"]["message"]}')
                            return message['result']
                    raise TimeoutError(f'Codex did not answer {method} within 15 seconds')

                initialized = request(1, 'initialize', {
                    'clientInfo': {'name': 'workspace-harness-check', 'version': '1'},
                    'capabilities': {'experimentalApi': True},
                })
                process.stdin.write(b'{"method":"initialized"}\n')
                process.stdin.flush()
                hooks = request(2, 'hooks/list', {'cwds': [str(workspace)]})['data'][0]
                config = request(3, 'config/read', {'cwd': str(workspace), 'includeLayers': True})['config']
                adapter = str(workspace / '.codex/hooks/adapter.py')
                registered = [hook for hook in hooks['hooks'] if adapter in shlex.split(hook.get('command', ''))]
                events = {hook['eventName'] for hook in registered}
                trusted = bool(registered) and all(hook['enabled'] and hook['trustStatus'] in ('trusted', 'managed') for hook in registered)
                expected = json.loads((workspace / '.codex/hooks.json').read_text())
                rendered = tomllib.loads((workspace / '.codex/config.toml').read_text())
                instructions_match = config.get('developer_instructions') == rendered.get('developer_instructions')
                skills_resolve = (workspace / '.agents/skills').is_dir() and (workspace / '.agents/skills').resolve() == workspace / 'skills'
                return {
                    'runtime': initialized['userAgent'], 'workspace': str(workspace),
                    'generated_events': sorted(expected['hooks']),
                    'discovered_hooks': [{'event': hook['eventName'], 'enabled': hook['enabled'],
                                          'trust': hook['trustStatus']} for hook in registered],
                    'instructions_match': instructions_match,
                    'skill_link_resolves': skills_resolve,
                    'warnings': hooks['warnings'], 'errors': hooks['errors'],
                    'ready': events == {'preToolUse', 'permissionRequest'} and trusted and instructions_match and skills_resolve and not hooks['errors'],
                    'live_enforcement_verified': False,
                }
        finally:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
            process.stdin.close()
            process.stdout.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--workspace', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument('--codex', default='codex')
    args = parser.parse_args()
    try:
        report = inspect(args.workspace.resolve(), args.codex)
    except (OSError, ValueError, RuntimeError, TimeoutError) as error:
        parser.exit(1, f'Codex runtime check failed: {error}\n')
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if report['ready'] else 1)


if __name__ == '__main__':
    main()
