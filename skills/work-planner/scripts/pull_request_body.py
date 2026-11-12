"""Validate Pull Request Body, as artifacts/pull-request-body.md states it: one pull request body file
checked against the Template, or against Review Body for an epic review.

Usage: pull_request_body.py body.md [--review]

The body holds the template's sections, each once and in template order, every section the template
does not mark optional among them, and no other: no text before the first section and no section the
template does not carry. A task body's Test Plan is readable as testplan.py reads it. An epic review
holds Overview, Changes and References, each required. No section holds a line of a field only a
registered kind's issue carries, as that kind's interface reads it. Each finding prints on its own
line, naming its section; any finding exits 1.
"""
import argparse
from pathlib import Path

from format import Template, split_sections
from kinds import KINDS, interface
from testplan import rows

ARTIFACT = 'pull-request-body.md'
TEST_PLAN = 'Test Plan'
# The sections Review Body names, in Template order.
REVIEW = ('Overview', 'Changes', 'References')


def findings(body: str, review: bool = False) -> list[str]:
    """Each way the body departs from its template, naming the section; empty when it departs in none."""
    body = (body or '').replace('\r\n', '\n')
    template = Template(artifact=ARTIFACT)
    headings = [h for h in template.headings if h in REVIEW] if review else template.headings
    optional = set() if review else template.optional
    preamble, sections = split_sections(body)
    names = [heading for heading, _ in sections]
    found = ['text before the first section'] if '\n'.join(preamble).strip() else []
    found += [f'required section missing: {h}' for h in headings if h not in names and h not in optional]
    found += [f'extra section: {h}' for h in dict.fromkeys(names) if h not in headings]
    found += [f'repeated section: {h}' for h in dict.fromkeys(names) if names.count(h) > 1]
    placed = [h for h in dict.fromkeys(names) if h in headings]
    found += [f'section out of order: {h}' for h, expected in zip(placed, [h for h in headings if h in placed])
              if h != expected][:1]
    if not review and TEST_PLAN in names and rows(body) is None:
        found.append(f'{TEST_PLAN}: unreadable test plan')
    found += [f'{heading}: {kind} issue field the template does not carry'
              for kind in KINDS for heading in interface(kind).issue_fields(body)]
    return found


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('body', type=Path)
    parser.add_argument('--review', action='store_true', help='check an epic review body')
    options = parser.parse_args()
    found = findings(options.body.read_text(), options.review)
    for line in found:
        print(f'{options.body}: {line}')
    return 1 if found else 0


if __name__ == '__main__':
    raise SystemExit(main())
