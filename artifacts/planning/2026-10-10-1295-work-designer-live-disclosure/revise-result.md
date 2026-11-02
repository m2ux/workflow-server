Completed the local dry run.

- Changed only [integration-review.md:44](/home/mike1/projects/dev/workflow-server/.worktrees/eval/work-designer-revise-20261010/skills/work-designer/templates/integration-review.md:44): `## Required Actions` → `## Next Actions`.
- Preserved the section’s guidance verbatim. No affected heading or anchor references existed.
- Validation passed: `git diff --check`, installed skill validator, 3 shared skill-summary tests, and 94 local links/anchors across 11 Markdown files. Frontmatter and scaffold checks passed.
- Manual walkthrough preserved missing-evidence actions and “none” when readiness is established. Progressive-disclosure checks covered whole-file prerequisites, a command subsection, and the Findings parent with its subsection.
- Final status: one modified file, one insertion/one deletion; HEAD remains `0a6ac0b180370c03d6c10095aae577a003254834`.

The first validator attempt failed because the sandbox could not create a namespace; its identical retry with host permission passed. Discovery found no worktree-local `.project`, planning directory, engine development document, or package manifest. Applicable shared project instructions were read from the existing checkout. The 33 external links were not accessed.

Remaining delivery steps, outside this dry run: commit the validated change, run plain `git push`, and create a PR if requested. No commit, push, fetch, GitHub access, publication, additional worktree, or delegation occurred.

**Audit appendix**

All 24 shell invocations used this working directory:

`/home/mike1/projects/dev/workflow-server/.worktrees/eval/work-designer-revise-20261010`

The second validator invocation, summary tests, and link checks used approved host execution permission. Commands appear below in submission order; independent read batches ran concurrently.

```bash
git status --short && git rev-parse HEAD

cat AGENTS.md .project/main/AGENTS.md skills/work-designer/SKILL.md

rg -n -i 'work-designer|skill revis|workflow-selection|no workflow' /home/mike1/.codex/memories/MEMORY.md

cat skills/work-designer/references/revise-mode.md skills/work-designer/references/guidelines.md skills/guidelines.md

git ls-files '*AGENTS.md' 'skills/work-designer/*' 'skills/guidelines.md'

ls -ld .project .engineering/artifacts/planning /home/mike1/projects/dev/workflow-server/.project/main/AGENTS.md /home/mike1/projects/dev/workflow-server/.worktrees/AGENTS.md /home/mike1/projects/dev/workflow-server/.worktrees/eval/AGENTS.md

rg -n -i 'required[ -]actions|next[ -]actions|integration-review' skills/work-designer

rg -n '^#{1,6} ' skills/work-designer/references/commands.md skills/work-designer/references/coverage.md skills/work-designer/variants/workflow-server/commands.md

cat /home/mike1/projects/dev/workflow-server/.project/main/AGENTS.md skills/work-designer/references/review-mode.md skills/work-designer/templates/integration-review.md

sed -n '5,19p;172,183p' skills/work-designer/references/commands.md

rg -n -i --hidden -g '!.git' -g '!node_modules' 'required[ -]actions|next[ -]actions|integration-review\.md' .

rg -n '^#{1,6} |skill|markdown|lint|test' docs/development.md package.json skills/work-designer/references/variants.md skills/work-designer/references/planning.md

cat skills/work-designer/references/planning.md

rg --files --hidden -g '!.git' -g '!node_modules' . /home/mike1/.codex/skills/.system/skill-creator | rg '(^|/)(tests?|scripts?)/|validate|package\.json|development\.md'

sed -n '149,160p' skills/work-designer/references/commands.md && git diff --check && git diff -- skills/work-designer/templates/integration-review.md

cat /home/mike1/.codex/skills/.system/skill-creator/scripts/quick_validate.py

rg -n '\[[^]]+\]\([^)]*\)|TODO|FIXME|TBD|PLACEHOLDER|^#{1,6} ' skills/work-designer

sed -n '5,17p' skills/work-designer/references/variants.md && sed -n '22,32p' skills/work-designer/references/commands.md && sed -n '5,10p;35,38p' skills/work-designer/variants/workflow-server/VARIANT.md && sed -n '3,6p' skills/work-designer/variants/workflow-server/commands.md && tail -n +147 skills/work-designer/variants/workflow-server/commands.md

/home/mike1/projects/dev/workflow-server/scripts/sbx python3 /home/mike1/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/work-designer

/home/mike1/projects/dev/workflow-server/scripts/sbx python3 /home/mike1/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/work-designer

PYTHONDONTWRITEBYTECODE=1 /home/mike1/projects/dev/workflow-server/scripts/sbx python3 -m unittest discover -s skills/work-planner/test -p test_modes.py

git remote -v && rg --files skills/work-designer/variants && sed -n '113,123p' skills/work-designer/references/commands.md && sed -n '17,29p' skills/work-designer/templates/integration-review.md

PYTHONDONTWRITEBYTECODE=1 /home/mike1/projects/dev/workflow-server/scripts/sbx python3 - <<'PY'
import re
from pathlib import Path
from urllib.parse import unquote
import yaml
root = Path('skills/work-designer')
files = sorted(root.rglob('*.md'))
local_links = 0
external_links = 0
for source in files:
    body = source.read_text()
    assert not re.search(r'\b(?:TODO|FIXME|TBD|PLACEHOLDER)\b', body), source
    for destination in re.findall(r'\[[^\]]*\]\(([^)]+)\)', body):
        if '://' in destination or destination.startswith('mailto:'):
            external_links += 1
            continue
        path_part, _, anchor = unquote(destination).partition('#')
        target = source.parent / path_part if path_part else source
        assert target.is_file(), (source, destination)
        if anchor:
            headings = re.findall(r'^#{1,6} +(.+)', target.read_text(), re.M)
            slugs = [re.sub(r'\s+', '-', re.sub(r'[^a-z0-9_ -]', '', heading.lower())) for heading in headings]
            assert anchor in slugs, (source, destination)
        local_links += 1
frontmatter = yaml.safe_load((root / 'SKILL.md').read_text().split('---', 2)[1])
assert set(frontmatter) == {'name', 'description'}
assert frontmatter['name'] == root.name
assert len(frontmatter['description']) < 1024
print(f'PASS: {len(files)} Markdown files; {local_links} local links and anchors; frontmatter and scaffold checks.')
print(f'Not accessed: {external_links} external links, per local-only scope.')
PY

rg -n -i --hidden -g '!.git' -g '!node_modules' 'required[ -]actions|next[ -]actions' . && git status --short && git diff --numstat && git rev-parse HEAD
```
