"""Re-apply the consolidating recommendations onto the rebased catalog.

The renumbering in the original commit is derived, not merged: it is regenerated
by renumber.py once these semantic edits land. This carries only the edits —
AS-11, AS-17, AE-22 and AE-09 — against upstream's current text.
"""

import sys
from pathlib import Path

CATALOG = Path(sys.argv[1]) / 'corpus/canon/resources/anti-patterns.md'
text = CATALOG.read_text()
TICK = chr(96)


def replace(old: str, new: str) -> None:
    global text
    assert text.count(old) == 1, f'expected one occurrence of: {old[:70]}'
    text = text.replace(old, new)


def retire(heading: str, next_heading: str) -> None:
    """Remove an entry. Already absent is the intended end state, so it passes."""
    global text
    if heading not in text:
        return
    start, end = text.index(heading), text.index(next_heading)
    text = text[:start] + text[end:]


c = TICK

# AS-11 — constraint-as-blockquote drops the retired sibling.
replace(
    f'A one-step rule filed as global ({c}local-rule-as-note{c}, {c}no-one-step-rules{c}).',
    f'A one-step rule filed as global ({c}no-one-step-rules{c}).')

# AS-17 — canonical-artifact-ids owns a Protocol artifact reference; io-id-shape owns id shape.
replace(
    f'**Detect:** Protocol references data via literal artifact filename/path, or I/O ids are path-flavored proxies ({c}assumptions-log-path{c} vs {c}assumptions-log{c}).',
    f'**Detect:** A Protocol artifact reference uses a concrete filename or path rather than the declared I/O designator — a literal or an ad-hoc path where {c}{{canonical_id}}{c} belongs. A name selected by a mode is one literal per technique ({c}artifact-name-is-filename{c}). A path-flavoured proxy id is {c}io-id-shape{c}.')
replace(
    f'**Do not flag:** Filename literals correctly placed on {c}#### artifact{c} declarations ({c}artifact-name-in-io{c}); hyperlinked template nouns to resource sections.',
    f'**Do not flag:** Filename literals correctly placed on {c}#### artifact{c} declarations; Protocol references that already use {c}{{canonical_id}}{c}; opaque multi-file path arrays ({c}no-opaque-artifact-path-array{c}); hyperlinked template nouns to resource sections.')
replace(
    f'**Fix:** Rename to canonical ids; cite {c}{{id}}{c} in Protocol; hyperlink artifact nouns to template sections without tool recipes ({c}no-tool-usage-prescription{c}).',
    f'**Fix:** Move the filename, literal or token-template, into the I/O declaration and cite {c}{{id}}{c} in Protocol; hyperlink artifact nouns to template sections without tool recipes ({c}no-tool-usage-prescription{c}).')
retire('### AP-44. artifact-name-in-io', '### AP-45. no-opaque-artifact-path-array')
replace(
    f'A single artifact with a literal or token-template name on one Input ({c}artifact-name-in-io{c}).',
    f'A single artifact with a literal or token-template name on one Input ({c}canonical-artifact-ids{c}).')

# AS-11 — retire the duplicate step-local-rule entry.
retire('### AP-60. local-rule-as-note', '### AP-61. factor-repeated-paths')

CATALOG.write_text(text)
print('artifact-name-in-io:', text.count('artifact-name-in-io'))
print('local-rule-as-note:', text.count('local-rule-as-note'))
print('entries:', text.count('\n### AP-'))
