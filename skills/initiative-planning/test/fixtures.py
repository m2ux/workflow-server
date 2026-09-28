"""Board items, issues and pull requests as the REST API returns them, reduced to the fields the
scripts read, and a runner for the scripts on them."""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent.parent / 'scripts'
REPO = 'o/r'


def url(kind: str, number: int, repo: str = REPO) -> str:
    return f'https://github.com/{repo}/{kind}/{number}'


def issue(number: int, title: str, state: str = 'open', closed: str | None = None, body: str = '',
          labels: tuple[str, ...] = (), repo: str = REPO) -> dict:
    return {'number': number, 'title': title, 'state': state, 'closed_at': closed,
            'state_reason': 'completed' if state == 'closed' else None,
            'repository_url': f'https://api.github.com/repos/{repo}', 'html_url': url('issues', number, repo),
            'body': body, 'labels': [{'name': l} for l in labels]}


BOARD = 'https://api.github.com/orgs/o/projectsV2/7'


def item(content: dict | None, status: str | None) -> dict:
    fields = [{'id': 1, 'name': 'Status', 'value': {'name': {'raw': status, 'html': status}}}] if status else []
    return {'content_type': 'Issue', 'fields': fields, 'content': content, 'project_url': BOARD}


def epic_body(*rows: tuple[str, str, str]) -> str:
    """An epic body whose Work Breakdown holds rows of (task id, description, depends on)."""
    lines = ['## Work Breakdown', '', '| Task | Description | Depends on | Join |', '| --- | --- | --- | --- |']
    lines += [f'| {task} | {description} → AC1 | {depends} | |' for task, description, depends in rows]
    return '\n'.join(lines + ['', '## Acceptance Criteria', '', '- [ ] **AC1.** Holds.', ''])


def initiative_body(*rows: tuple[str, str]) -> str:
    """An initiative body whose Work Breakdown holds rows of (epic id, depends on)."""
    lines = ['## Work Breakdown', '', '| Epic | Description | Depends on |', '| --- | --- | --- |']
    lines += [f'| {epic} | Work → AC1 | {depends} |' for epic, depends in rows]
    return '\n'.join(lines + ['', '## Acceptance Criteria', '', '- [ ] **AC1.** Holds.', ''])


def pr(number: int, title: str, merged: str | None = None, state: str | None = None, draft: bool = False,
       body: str = '', repo: str = REPO) -> dict:
    return {'number': number, 'title': title, 'body': body, 'html_url': url('pull', number, repo),
            'state': state or ('closed' if merged else 'open'), 'draft': draft, 'merged_at': merged}


def run(script: str, *args: str, tz: str = 'UTC') -> subprocess.CompletedProcess:
    return subprocess.run([sys.executable, str(SCRIPTS / script), *args], capture_output=True, text=True,
                          env={**os.environ, 'TZ': tz, 'PYTHONDONTWRITEBYTECODE': '1'})


def progress(items: list[dict], prs: list[dict], *args: str, tz: str = 'UTC') -> subprocess.CompletedProcess:
    """progress.py on the items, as two pages, and the pull requests as JSON lines."""
    with tempfile.TemporaryDirectory() as tmp:
        items_path, prs_path = Path(tmp, 'items.json'), Path(tmp, 'prs.json')
        half = len(items) // 2
        items_path.write_text(json.dumps(items[:half]) + '\n' + json.dumps(items[half:]))
        prs_path.write_text('\n'.join(json.dumps(p) for p in prs))
        return run('progress.py', '--items', str(items_path), '--prs', str(prs_path), *args, tz=tz)


def section(output: str, name: str) -> list[str]:
    """The lines of one section of a summary, between its heading and the next blank line."""
    lines = output.splitlines()
    start = lines.index(f'*{name}*') + 1
    end = next((i for i in range(start, len(lines)) if not lines[i]), len(lines))
    return lines[start:end]
