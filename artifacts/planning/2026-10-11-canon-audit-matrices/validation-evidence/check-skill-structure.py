import json
import re
from pathlib import Path
import yaml

root = Path('/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon')
errors = []
checked = 0
for path in root.rglob('*.md'):
    content = path.read_text()
    for target in re.findall(r'\[[^\]]*\]\(([^)\s]+)\)', content):
        if '://' in target or target.startswith('mailto:'):
            continue
        name, _, anchor = target.partition('#')
        destination = (path.parent / name).resolve() if name else path
        checked += 1
        if not destination.is_file():
            errors.append(f'{path.relative_to(root)}: missing {target}')
        elif anchor and destination.suffix == '.md':
            headings = re.findall(r'^#+\s+(.+)', destination.read_text(), re.M)
            anchors = [re.sub(r'[^\w\- ]', '', heading.lower()).replace(' ', '-') for heading in headings]
            if anchor not in anchors:
                errors.append(f'{path.relative_to(root)}: missing anchor {target}')
text = (root / 'SKILL.md').read_text()
assert text.startswith('---\n')
frontmatter = yaml.safe_load(text.split('---', 2)[1])
assert set(frontmatter) == {'name', 'description', 'hooks'}
assert frontmatter['name'] == root.name and len(frontmatter['description']) < 1024
print(json.dumps({'local_links_checked': checked, 'frontmatter': 'valid under repository fields', 'errors': errors}, indent=2))
raise SystemExit(bool(errors))
