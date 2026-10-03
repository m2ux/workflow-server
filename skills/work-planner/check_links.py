import re
from pathlib import Path

root = Path("/home/mike1/projects/dev/workflow-server/.worktrees/skill/work-planner-adhoc/skills/work-planner")
link_re = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
heading_re = re.compile(r"^(#{1,6})\s+(.+?)\s*$", re.M)

def slug(text):
    text = text.strip().lower()
    text = text.replace(".", "")
    out = []
    prev = ""
    for ch in text:
        if ch.isalnum():
            out.append(ch)
            prev = ch
        elif ch in " -_":
            if prev != "-":
                out.append("-")
                prev = "-"
    return "".join(out).strip("-")

def headings(path):
    counts = {}
    found = set()
    for m in heading_re.finditer(path.read_text()):
        s = slug(m.group(2))
        n = counts.get(s, 0)
        counts[s] = n + 1
        found.add(s if n == 0 else f"{s}-{n}")
    return found

broken = []
for md in root.rglob("*.md"):
    text = md.read_text()
    for raw in link_re.findall(text):
        if raw.startswith(("http://", "https://", "mailto:")):
            continue
        if "{{" in raw or raw.startswith("#E"):
            continue
        if raw.startswith("…"):
            continue
        path_part, _, anchor = raw.partition("#")
        if path_part == "":
            target = md
        else:
            target = (md.parent / path_part).resolve()
        if not target.exists():
            broken.append((str(md.relative_to(root)), raw, "missing file"))
            continue
        if anchor and target.suffix == ".md":
            hs = headings(target)
            if anchor not in hs:
                broken.append((str(md.relative_to(root)), raw, "missing anchor " + anchor))

print("BROKEN", len(broken))
for item in broken:
    print(" | ".join(item))
