- Renamed `Required Actions` to `Next Actions` in [integration-review.md](/home/mike1/projects/dev/workflow-server/.worktrees/eval/work-designer-guidelines-a-20261010/skills/work-designer/templates/integration-review.md:44). Its instructions remain intact; no affected references remained.
- Validation passed: `git diff --check`, installed skill validator, 3 shared skill tests, and 96 local links/anchors across 11 files. All four pre-existing modified files retain their original SHA-256 hashes.
- Manual walkthrough preserves actions for findings, missing evidence, owning branches, and established readiness. No reading paths changed.
- Limitations: local structural validation only; no live integration or independent-agent run. Some discovery paths were absent. The initial sandbox namespace failure was resolved by running validation with host permissions. No commits, remote operations, or additional worktrees.

Audit appendix: all commands ran with working directory `/home/mike1/projects/dev/workflow-server/.worktrees/eval/work-designer-guidelines-a-20261010`. Commands are listed in tool-call order; independent batches ran concurrently. The edit used `apply_patch`, not a shell command. Repeated commands are retained.

```bash
git status --short
cat AGENTS.md .project/main/AGENTS.md skills/work-designer/SKILL.md
rg -n 'work-designer|guidelines|revise-mode' /home/mike1/.codex/memories/MEMORY.md
cat skills/work-designer/references/revise-mode.md skills/guidelines.md skills/work-designer/references/guidelines.md
rg --files -g AGENTS.md -g '*integration*' -g '*report*' -g 'commands.md' -g 'planning.md' skills .project .engineering
rg -n -i 'required actions|required-actions|next actions|next-actions' . --glob '!.git/**'
cat skills/work-designer/templates/integration-review.md skills/work-designer/references/review-mode.md
rg -n '^#{1,6} ' skills/work-designer/references/commands.md skills/work-designer/references/coverage.md skills/work-designer/references/evidence.md skills/work-designer/references/planning.md
rg --files skills/work-designer
sha256sum skills/guidelines.md skills/work-designer/SKILL.md skills/work-designer/references/guidelines.md skills/work-designer/references/revise-mode.md
sed -n '5,19p;172,183p' skills/work-designer/references/commands.md
rg -n 'work-designer|integration-review|markdown.*link|check.*link|skill.*check' package.json tests scripts .github skills/work-designer --glob '!package-lock.json'
rg --files -g AGENTS.md -g 'package.json' -g '*skill*' -g '*link*' -g '*markdown*' -g '*guideline*' .
rg --files scripts
rg -n '^#{1,6} ' skills/work-designer/references/variants.md skills/work-designer/variants/workflow-server/VARIANT.md skills/work-designer/variants/workflow-server/commands.md
ls /home/mike1/.codex/skills/.system/skill-creator/scripts
sed -n '5,17p' skills/work-designer/references/variants.md
sed -n '5,10p;35,38p' skills/work-designer/variants/workflow-server/VARIANT.md
sed -n '3,6p;147,180p' skills/work-designer/variants/workflow-server/commands.md
cat /home/mike1/.codex/skills/.system/skill-creator/scripts/quick_validate.py
sed -n '22,32p' skills/work-designer/references/commands.md
cat skills/work-planner/test/test_modes.py
git diff --check
/home/mike1/projects/dev/workflow-server/scripts/sbx python3 -B /home/mike1/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/work-designer
git remote -v
/home/mike1/projects/dev/workflow-server/scripts/sbx python3 -B /home/mike1/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/work-designer
/home/mike1/projects/dev/workflow-server/scripts/sbx python3 -B -m unittest discover -s skills/work-planner/test -p test_modes.py
/home/mike1/projects/dev/workflow-server/scripts/sbx python3 -B - <<'PY'
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

root = Path('skills/work-designer')
files = sorted(root.rglob('*.md'))
errors = []
count = 0
for path in files:
    content = path.read_text()
    for target in re.findall(r'(?<!!)\[[^\]]+\]\(([^)\s]+)\)', content):
        parts = urlsplit(target)
        if parts.scheme or parts.netloc:
            continue
        count += 1
        dest = (path.parent / unquote(parts.path)).resolve() if parts.path else path.resolve()
        if not dest.is_file():
            errors.append(f'{path}: missing file {target}')
            continue
        if parts.fragment:
            headings = re.findall(r'^#{1,6}\s+(.+?)\s*#*$', dest.read_text(), re.M)
            anchors = {re.sub(r'[^\w\- ]', '', heading.lower()).replace(' ', '-') for heading in headings}
            if unquote(parts.fragment) not in anchors:
                errors.append(f'{path}: missing anchor {target}')
    if re.search(r'TODO|FIXME|TBD', content):
        errors.append(f'{path}: unfinished scaffold marker')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'{count} local Markdown links and anchors pass across {len(files)} files; no unfinished scaffold markers.')
PY
sha256sum skills/guidelines.md skills/work-designer/SKILL.md skills/work-designer/references/guidelines.md skills/work-designer/references/revise-mode.md
git diff -- skills/work-designer/templates/integration-review.md
rg -n -i --hidden 'required actions|required-actions|next actions|next-actions' . --glob '!.git' --glob '!.git/**'
git status --short
```
