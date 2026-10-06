#!/usr/bin/env python3
"""Checks the walk-protocol definitions on this corpus tree.

Each check reads a definition and exits 0 only when that definition holds.
A missing opening clear fails the self-test.

    python3 walks/check-walk-protocol.py
    python3 walks/check-walk-protocol.py --self-test
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def read(rel: str) -> str:
    path = ROOT / rel
    if not path.is_file():
        raise FileNotFoundError(rel)
    return path.read_text()


def between(text: str, start: str, end: str) -> str:
    i = text.find(start)
    if i < 0:
        return ""
    j = text.find(end, i + len(start))
    return text[i:j if j >= 0 else None]


def block_after(text: str, marker: str, until: str) -> str:
    i = text.find(marker)
    if i < 0:
        return ""
    j = text.find(until, i + len(marker))
    return text[i:j if j >= 0 else None]


def activity_loop_steps(text: str) -> str:
    i = text.find("\nsteps:\n")
    return text[i:] if i >= 0 else ""


def call_site_bindings(text: str) -> list[list[str]]:
    """Keys under each `with:` that follows `routine: activity-loop`, and no further."""
    sites = []
    for match in re.finditer(r"routine:\s+activity-loop\n(\s+)with:\n", text):
        indent = len(match.group(1))
        keys = []
        for line in text[match.end():].splitlines():
            if not line.strip():
                continue
            lead = len(line) - len(line.lstrip(" "))
            if lead <= indent:
                break
            found = re.match(r"\s+([A-Za-z0-9_]+):", line)
            if found:
                keys.append(found.group(1))
        sites.append(keys)
    return sites


def _indent(line: str) -> int:
    return len(line) - len(line.lstrip(" "))


def _in_checkpoint(lines: list[str], options_at: int, options_indent: int) -> bool:
    for k in range(options_at - 1, -1, -1):
        line = lines[k]
        if not line.strip():
            continue
        if _indent(line) >= options_indent:
            continue
        if re.match(r"\s*(?:- )?kind:\s+checkpoint\s*$", line):
            return True
        if re.match(r"\s*(?:- )?kind:\s+", line):
            return False
    return False


def options_missing_description(text: str) -> list[str]:
    """Option ids under a checkpoint whose description is missing or empty."""
    lines = text.splitlines()
    missing: list[str] = []
    i = 0
    n = len(lines)
    while i < n:
        match = re.match(r"^(\s*)options:\s*$", lines[i])
        if not match or not _in_checkpoint(lines, i, len(match.group(1))):
            i += 1
            continue
        options_indent = len(match.group(1))
        i += 1
        while i < n:
            line = lines[i]
            if not line.strip():
                i += 1
                continue
            indent = _indent(line)
            if indent <= options_indent:
                break
            id_match = re.match(r"^\s*- id:\s*(\S+)\s*$", line)
            if not id_match:
                i += 1
                continue
            option_id = id_match.group(1)
            item_indent = indent
            i += 1
            description = ""
            while i < n:
                inner = lines[i]
                if not inner.strip():
                    i += 1
                    continue
                inner_indent = _indent(inner)
                if inner_indent <= item_indent:
                    break
                desc_match = re.match(r"^\s*description:\s*(.*)$", inner)
                if not desc_match:
                    i += 1
                    continue
                rest = desc_match.group(1).strip().strip("\"'")
                if rest in ("", ">", ">-", "|", "|-", ">"):
                    desc_indent = inner_indent
                    i += 1
                    chunks: list[str] = []
                    while i < n:
                        nxt = lines[i]
                        if not nxt.strip():
                            i += 1
                            continue
                        if _indent(nxt) <= desc_indent:
                            break
                        chunks.append(nxt.strip())
                        i += 1
                    description = " ".join(chunks).strip()
                else:
                    description = rest
                    i += 1
            if not description:
                missing.append(option_id)
    return missing


def check() -> list[str]:
    problems: list[str] = []

    def fail(ac: str, detail: str) -> None:
        problems.append(f"{ac}: {detail}")

    loop = read("corpus/meta/routines/activity-loop.yaml")
    steps = activity_loop_steps(loop)
    prime = block_after(loop, "id: prime-initial-activity", "id: resume-standing-activity")
    if "when: \"!standing_activity\"" not in prime or "target: from_activity" not in prime or "value: null" not in prime:
        fail("opening", "opening a walk does not clear from_activity")
    if prime.find("target: from_activity") > prime.find("target: worker_result") or "target: worker_result" not in prime:
        fail("opening", "opening a walk does not clear worker_result")
    if prime.count("value: null") < 2:
        fail("opening", "opening does not null both the retired activity and the worker result")

    standing = block_after(loop, "id: resume-standing-activity", "id: activity-cycle")
    if "target: stands_on_activity" not in standing or "value: true" not in standing:
        fail("standing", "a walk opened on a standing activity does not record that it already stands there")
    enter = block_after(steps, "id: enter-activity", "id: spend-entered-activity")
    if "stands_on_activity: stands_on_activity" not in enter:
        fail("standing", "the entry does not tell take-activity that the session already stands on the activity")
    take = read("corpus/meta/techniques/workflow-engine/take-activity.md")
    if "When `{stands_on_activity}` is true, or `{checkpoint_reply}` is bound, skip this phase." not in take:
        fail("standing", "take-activity does not skip the advance when the session already stands on the activity")
    spend = block_after(steps, "id: spend-entered-activity", "id: end-walk")
    if "target: stands_on_activity" not in spend or "value: false" not in spend:
        fail("standing", "the walk does not clear the standing flag after the one entry that carried it")

    enter_fan = read("corpus/meta/techniques/fan/enter-fan.md")
    if "### advance_trace_tokens" not in enter_fan or "_meta.trace_token" not in enter_fan:
        fail("trace-tokens", "enter-fan does not declare the trace token the fan-opening call captures")
    if "### advance_trace_tokens" not in take or "_meta.trace_token" not in take:
        fail("trace-tokens", "take-activity does not declare the trace tokens it captures")
    if steps.count('value: "{advance_trace_tokens}"') < 1:
        fail("trace-tokens", "the walk does not append the tokens an advancing operation returns")

    def step_reads(input_id: str) -> bool:
        if input_id == "kind":
            return bool(re.search(r"\{kind\}|kind: kind|target: kind", steps))
        return bool(re.search(rf"\b{input_id}\b", steps))

    unread = [input_id for input_id in (
        "planning_folder_path", "component_path", "host_repo_path", "kind", "target_status",
    ) if step_reads(input_id)]
    # Those five are declared and no step reads them. A call site must not bind one.
    sites = {
        "corpus/meta/activities/03-dispatch-client-workflow.yaml": read("corpus/meta/activities/03-dispatch-client-workflow.yaml"),
        "corpus/prism-audit/activities/02-execute-analysis.yaml": read("corpus/prism-audit/activities/02-execute-analysis.yaml"),
        "corpus/prism-evaluate/activities/02-execute-analysis.yaml": read("corpus/prism-evaluate/activities/02-execute-analysis.yaml"),
        "corpus/work-package/activities/10-post-impl-review.yaml": read("corpus/work-package/activities/10-post-impl-review.yaml"),
    }
    bound_any = False
    for rel, text in sites.items():
        for keys in call_site_bindings(text):
            bound_any = True
            for key in keys:
                if key in ("planning_folder_path", "component_path", "host_repo_path", "kind", "target_status"):
                    fail("call-site", f"{rel} binds activity-loop input {key}, which no step reads")
                elif not re.search(rf"\b{key}\b", steps):
                    fail("call-site", f"{rel} binds {key}, which no step of activity-loop reads")
    if not bound_any:
        fail("call-site", "no activity-loop call site was read")
    if unread:
        fail("call-site", "a step reads an input this check treats as unread: " + ", ".join(unread))

    if "id: resume-entered-activity" not in steps or "checkpoint_reply: checkpoint_reply" not in steps:
        fail("resume", "the loop does not resume a yielded checkpoint through resume-entered-activity")
    if "{checkpoint_reply}" not in take:
        fail("resume", "take-activity does not resume when the reply is set")

    corpus = ROOT / "corpus"
    for path in sorted(corpus.rglob("*")):
        if path.suffix not in {".yaml", ".yml"}:
            continue
        rel = str(path.relative_to(ROOT))
        for option_id in options_missing_description(path.read_text()):
            fail("option-description", f"{rel} option '{option_id}' has no description")

    fan_dir = ROOT / "corpus/meta/techniques/fan"
    use_clause = re.compile(r"^\*?\*?Use[d]? (this|when|to|for)\b", re.I)
    for path in sorted(fan_dir.glob("*.md")):
        text = path.read_text()
        region = between(text, "## Inputs", "## Protocol") + between(text, "## Outputs", "## Protocol")
        for line in region.splitlines():
            if use_clause.search(line.strip()):
                fail("use-clause", f"{path.name} input or output carries a use clause: {line.strip()}")

    finalize = read("corpus/meta/techniques/workflow-engine/finalize-activity.md")
    outputs = between(finalize, "## Outputs", "## Protocol")
    headings = re.findall(r"^### .+$", outputs, re.M)
    if len(headings) < 1:
        fail("finalize-output", "finalize-activity declares no output")
    for heading in headings:
        after = outputs.split(heading, 1)[1]
        body = after.split("###", 1)[0].strip()
        if not body:
            fail("finalize-output", f"finalize-activity output {heading} does not describe its value")

    capability = between(read("corpus/meta/techniques/workflow-engine/TECHNIQUE.md"), "## Capability", "## Inputs")
    if re.search(r"\bplacement\b", capability, re.I):
        fail("capability", "the workflow-engine Capability states a placement")

    home = []
    for path in (ROOT / "corpus/specimens").rglob("*"):
        if path.is_file() and path.suffix in {".md", ".yaml", ".yml"} and "/home/" in path.read_text():
            home.append(str(path.relative_to(ROOT)))
    if home:
        fail("specimen-path", "a gitnexus specimen defaults a home path: " + ", ".join(home[:8]))

    readme = read("corpus/workflow-design/activities/README.md")
    if "Leads to [Retrospective](#11-retrospective) in create and review modes" not in readme:
        fail("design-route", "the workflow-design activities README does not route 09 to retrospective in create and review modes")

    retire = read("corpus/meta/techniques/fan/retire-branch.md")
    if "barrier.met" not in retire or "reports that activity's `name`" not in retire:
        fail("last-retirement", "retire-branch does not state that the last retirement returns the name and whether the barrier is met")

    close = read("corpus/meta/activities/04-end-workflow.yaml")
    terminal = close.find("id: complete-client-session")
    persist = close.find("id: persist-client-completion")
    if terminal < 0 or "activity_id: __terminal__" not in close[terminal:persist if persist > terminal else None]:
        fail("terminal-commit", "close-out does not advance the client session onto __terminal__")
    if persist < terminal or "workflow-engine::commit-and-persist" not in close[persist:]:
        fail("terminal-commit", "the terminal advance does not commit the session's completed state")

    # The bootstrap reaches a context holding nothing, so every activity it could name would be a
    # second home for a bind it cannot read. The session stands on its opening activity before the
    # text is read, and the fetch names none.
    bootstrap = read("corpus/meta/resources/bootstrap-protocol.md")
    if "next_activity" in bootstrap:
        fail("opening-activity", "the bootstrap advances the session it was served for")
    if "activity_id" in bootstrap:
        fail("opening-activity", "the bootstrap names an activity, which it cannot read a bind for")

    return problems


def self_test() -> list[str]:
    """A definition that drops the opening clear must fail the opening check."""
    problems = []
    original = read
    text = original("corpus/meta/routines/activity-loop.yaml").replace(
        "id: prime-initial-activity", "id: open-walk", 1
    )

    def patched(rel: str) -> str:
        if rel == "corpus/meta/routines/activity-loop.yaml":
            return text
        return original(rel)

    globals()["read"] = patched
    try:
        found = check()
    finally:
        globals()["read"] = original
    if not any(item.startswith("opening:") for item in found):
        problems.append("self-test: dropping the opening clear did not fail the opening check")
    return problems


def main() -> int:
    if "--self-test" in sys.argv:
        problems = self_test()
    else:
        problems = check()
    if problems:
        print(f"{len(problems)} walk-protocol check(s) failed:")
        for item in problems:
            print(f"  {item}")
        return 1
    if "--self-test" in sys.argv:
        print("self-test: a missing opening clear fails the opening check")
    else:
        print("walk-protocol definitions hold")
    return 0


if __name__ == "__main__":
    sys.exit(main())
