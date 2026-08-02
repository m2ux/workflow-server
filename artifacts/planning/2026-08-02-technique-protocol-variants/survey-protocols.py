#!/usr/bin/env python3
"""Survey every technique markdown file: classify the structure of its ## Protocol section.

Produced for the 2026-08-02 protocol-variants investigation. Run from anywhere:
    python3 survey-protocols.py [workflows-root]
Default root: the workflows/ directory two levels above this folder's repo root fails to
generalise, so pass the path explicitly when the checkout moves.
"""
import os, re, sys, json

ROOT = sys.argv[1] if len(sys.argv) > 1 else "/home/mike1/projects/dev/workflow-server/workflows"

NUM_RE = re.compile(r"^\s*(\d+)[.)]\s+")
H2_RE = re.compile(r"^##\s+(.*)$")
H3_RE = re.compile(r"^###\s+(.*)$")
LIST_NUM_RE = re.compile(r"^\s{0,3}\d+[.)]\s+")

def find_technique_files():
    out = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        parts = dirpath.split(os.sep)
        if "techniques" in parts:
            for f in filenames:
                if f.endswith(".md"):
                    out.append(os.path.join(dirpath, f))
    return sorted(out)

def h2_sections(lines):
    """Return list of (title, start_idx, end_idx) for ## sections, skipping fenced code."""
    secs = []
    fence = False
    cur = None
    for i, ln in enumerate(lines):
        if ln.lstrip().startswith("```"):
            fence = not fence
            continue
        if fence:
            continue
        m = H2_RE.match(ln)
        if m:
            if cur:
                secs.append((cur[0], cur[1], i))
            cur = (m.group(1).strip(), i)
    if cur:
        secs.append((cur[0], cur[1], len(lines)))
    return secs

def classify(path):
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    lines = text.splitlines()
    secs = h2_sections(lines)
    proto = None
    other = {}
    for title, s, e in secs:
        key = title.lower().strip()
        if key == "protocol":
            proto = (s, e)
        other[key] = True
    info = {
        "path": os.path.relpath(path, ROOT),
        "container": os.path.basename(path) == "TECHNIQUE.md",
        "has_inputs": "inputs" in other,
        "has_outputs": "outputs" in other,
        "has_rules": "rules" in other,
    }
    if proto is None:
        info["class"] = "no-protocol"
        info["h3"] = []
        return info
    s, e = proto
    h3s = []
    fence = False
    body_list_items = 0
    for ln in lines[s + 1 : e]:
        if ln.lstrip().startswith("```"):
            fence = not fence
            continue
        if fence:
            continue
        m = H3_RE.match(ln)
        if m:
            h3s.append(m.group(1).strip())
        elif LIST_NUM_RE.match(ln) and not h3s:
            body_list_items += 1
    kinds = []
    for t in h3s:
        if NUM_RE.match(t):
            kinds.append("N")
        elif t.strip().lower() in ("initial", "final"):
            kinds.append("IF")
        else:
            kinds.append("U")
    info["h3"] = h3s
    info["kinds"] = kinds
    if not h3s:
        info["class"] = "list-only" if body_list_items else "prose-only"
    else:
        has_n = "N" in kinds
        has_u = "U" in kinds
        has_if = "IF" in kinds
        if has_n and not has_u:
            info["class"] = "numbered" + ("+wrap" if has_if else "")
        elif has_u and not has_n:
            info["class"] = "unnumbered" + ("+wrap" if has_if else "")
        elif has_u and has_n:
            info["class"] = "mixed"
        else:
            info["class"] = "wrap-only"
    return info

def main():
    files = find_technique_files()
    results = [classify(p) for p in files]
    counts = {}
    for r in results:
        counts[r["class"]] = counts.get(r["class"], 0) + 1
    print("TOTAL technique md files:", len(results))
    print("CLASS COUNTS:", json.dumps(counts, indent=1, sort_keys=True))
    print()
    print("=== UNNUMBERED / MIXED / WRAP-ONLY FILES ===")
    for r in results:
        if r["class"].startswith(("unnumbered", "mixed", "wrap-only")):
            io = "".join([
                "I" if r["has_inputs"] else "-",
                "O" if r["has_outputs"] else "-",
                "R" if r["has_rules"] else "-",
            ])
            kind = "CONTAINER" if r["container"] else "leaf"
            print(f"[{r['class']:>12}] [{io}] [{kind}] {r['path']}")
            for t, k in zip(r["h3"], r["kinds"]):
                print(f"      ({k}) ### {t}")
    print()
    print("=== LIST-ONLY / PROSE-ONLY (no ### blocks) ===")
    for r in results:
        if r["class"] in ("list-only", "prose-only"):
            kind = "CONTAINER" if r["container"] else "leaf"
            print(f"[{r['class']:>10}] [{kind}] {r['path']}")

if __name__ == "__main__":
    main()
