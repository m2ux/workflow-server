"""Read check-all's report into per-guard runs, and find the failures one run adds to another.

check-all runs as  check-all.ts --corpus-only --json --verbose --root <tree>  and prints:

  - A table row per guard:  [PASS] <id> ...,  [FAIL] <id> ...  or  [UNMEASURED] <id> ...
  - A section per guard, opening  ──── <id> (<script>) ────, holding the guard's own output: the
    finding protocol's JSON document for a guard that speaks it, its text otherwise, and its stderr
    when it could not measure.

A run's findings are keyed as guard-protocol.ts's findingKey keys them: check, site without a
trailing :<line>, and detail. The corpus tree's path, absolute or relative to the server checkout,
reads as <tree> in a key, so runs over two trees compare by defect.
"""
from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from pathlib import Path

ROW = re.compile(r'^\s+\[(PASS|FAIL|UNMEASURED)\] (\S+)\s')
SECTION = re.compile(r'^──── (\S+) \(.+\) ────$')
LINE = re.compile(r':\d+$')
CODES = {'PASS': 0, 'FAIL': 1, 'UNMEASURED': 2}


@dataclass
class GuardRun:
    """One guard's result: exit code, its output, and its finding keys when it speaks the protocol."""
    id: str
    code: int
    body: str = ''
    findings: list[dict] | None = None
    keys: list[str] | None = None


def finding_key(finding: dict, tree_names: tuple[str, ...]) -> str:
    def plain(text: str) -> str:
        for name in tree_names:
            text = text.replace(name, '<tree>')
        return text
    site = LINE.sub('', plain(finding.get('site', '')))
    return '\0'.join((finding.get('check', ''), site, plain(finding.get('detail', ''))))


def parse(report: str, tree: Path, server: Path) -> dict[str, GuardRun]:
    """Each guard's run, by id, from a check-all report over tree run in server."""
    runs: dict[str, GuardRun] = {}
    sections: dict[str, list[str]] = {}
    current: list[str] | None = None
    for line in report.splitlines():
        row = ROW.match(line)
        header = SECTION.match(line)
        if header:
            current = sections.setdefault(header.group(1), [])
        elif current is not None:
            current.append(line)
        elif row:
            runs[row.group(2)] = GuardRun(row.group(2), CODES[row.group(1)])
    names = (str(tree), os.path.relpath(tree, server))
    for gid, lines in sections.items():
        if gid not in runs:
            continue
        run = runs[gid]
        run.body = '\n'.join(lines).strip()
        try:
            document = json.loads(run.body)
        except ValueError:
            continue
        if isinstance(document, dict) and isinstance(document.get('findings'), list):
            run.findings = document['findings']
            run.keys = [finding_key(f, names) for f in run.findings]
    return runs


@dataclass
class Delta:
    """What the head run adds to the base run: each guard's added failures, and the guards neither
    run can attribute."""
    added: dict[str, str]
    unmeasured: dict[str, str]


def render(findings: list[dict]) -> str:
    return '\n'.join(f"  [{f.get('check', '')}] {f.get('site', '')}\n     {f.get('detail', '')}"
                     for f in findings)


def delta(base: dict[str, GuardRun], head: dict[str, GuardRun]) -> Delta:
    """The failures head adds to base.

    A guard failing in head and clean in base adds all it reports. One failing in both adds the
    findings whose keys base lacks when both speak the finding protocol, and adds nothing when
    either does not. A guard head could not measure, or that fails in head and base could not
    measure, is unmeasured.
    """
    added: dict[str, str] = {}
    unmeasured: dict[str, str] = {}
    for gid, h in head.items():
        b = base.get(gid)
        if h.code == 0:
            continue
        if h.code != 1:
            unmeasured[gid] = h.body or f'exit {h.code}'
        elif b is None or b.code not in (0, 1):
            unmeasured[gid] = 'the branch point could not be measured for this guard'
        elif b.code == 0:
            added[gid] = h.body if h.findings is None else render(h.findings)
        elif h.keys is not None and b.keys is not None:
            known = set(b.keys)
            fresh = [f for f, k in zip(h.findings or [], h.keys) if k not in known]
            if fresh:
                added[gid] = render(fresh)
    return Delta(added, unmeasured)
