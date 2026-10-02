#!/usr/bin/env python3
"""Evidence for epic I00:E06 criteria AC14–AC26 on this corpus tree.

Each check reads the definition the criterion names and exits 0 only when that
definition holds. AC27 is the engine refusal, covered by tests/fan-unbound-refusal.test.ts
on the engine branch. AC1–AC13 are other tasks and are not checked here.

    python3 walks/check-walk-protocol-acs.py
    python3 walks/check-walk-protocol-acs.py --self-test
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


def option_descriptions(text: str) -> list[str]:
    descriptions = []
    for match in re.finditer(
        r"- id: .+\n(?:        .+\n)*?        description: (.+)",
        text,
    ):
        descriptions.append(match.group(1).strip())
    return descriptions


def check() -> list[str]:
    problems: list[str] = []

    def fail(ac: str, detail: str) -> None:
        problems.append(f"{ac}: {detail}")

    loop = read("corpus/meta/routines/activity-loop.yaml")
    steps = activity_loop_steps(loop)
    prime = block_after(loop, "id: prime-initial-activity", "id: resume-standing-activity")
    if "when: \"!standing_activity\"" not in prime or "target: from_activity" not in prime or "value: null" not in prime:
        fail("AC14", "opening a walk does not clear from_activity")
    if prime.find("target: from_activity") > prime.find("target: worker_result") or "target: worker_result" not in prime:
        fail("AC14", "opening a walk does not clear worker_result")
    if prime.count("value: null") < 2:
        fail("AC14", "opening does not null both the retired activity and the worker result")

    standing = block_after(loop, "id: resume-standing-activity", "id: activity-cycle")
    if "target: stands_on_activity" not in standing or "value: true" not in standing:
        fail("AC15", "a walk opened on a standing activity does not record that it already stands there")
    enter = block_after(steps, "id: enter-activity", "id: spend-entered-activity")
    if "stands_on_activity: stands_on_activity" not in enter:
        fail("AC15", "the entry does not tell take-activity that the session already stands on the activity")
    take = read("corpus/meta/techniques/workflow-engine/take-activity.md")
    if "When `{stands_on_activity}` is true, or `{checkpoint_reply}` is bound, skip this phase." not in take:
        fail("AC15", "take-activity does not skip the advance when the session already stands on the activity")
    spend = block_after(steps, "id: spend-entered-activity", "id: end-walk")
    if "target: stands_on_activity" not in spend or "value: false" not in spend:
        fail("AC15", "the walk does not clear the standing flag after the one entry that carried it")

    enter_fan = read("corpus/meta/techniques/fan/enter-fan.md")
    if "### advance_trace_tokens" not in enter_fan or "_meta.trace_token" not in enter_fan:
        fail("AC16", "enter-fan does not declare the trace token the fan-opening call captures")
    if "### advance_trace_tokens" not in take or "_meta.trace_token" not in take:
        fail("AC16", "take-activity does not declare the trace tokens it captures")
    if steps.count('value: "{advance_trace_tokens}"') < 1:
        fail("AC16", "the walk does not append the tokens an advancing operation returns")

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
                    fail("AC17", f"{rel} binds activity-loop input {key}, which no step reads")
                elif not re.search(rf"\b{key}\b", steps):
                    fail("AC17", f"{rel} binds {key}, which no step of activity-loop reads")
    if not bound_any:
        fail("AC17", "no activity-loop call site was read")
    if unread:
        fail("AC17", "a step reads an input this check treats as unread: " + ", ".join(unread))

    if "id: resume-entered-activity" not in steps or "checkpoint_reply: checkpoint_reply" not in steps:
        fail("AC18", "the loop does not resume a yielded checkpoint through resume-entered-activity")
    if "{checkpoint_reply}" not in take:
        fail("AC18", "take-activity does not resume when the reply is set")

    routing = re.compile(r"leads to|routes to|goes to", re.I)
    for rel in (
        "corpus/meta/activities/04-end-workflow.yaml",
        "corpus/workflow-design/activities/06-scope-and-draft.yaml",
    ):
        descriptions = option_descriptions(read(rel))
        if not descriptions:
            fail("AC19", f"{rel} has no option description")
        for description in descriptions:
            if routing.search(description):
                fail("AC19", f"{rel} option says where the run goes: {description}")

    fan_dir = ROOT / "corpus/meta/techniques/fan"
    use_clause = re.compile(r"^\*?\*?Use[d]? (this|when|to|for)\b", re.I)
    for path in sorted(fan_dir.glob("*.md")):
        text = path.read_text()
        region = between(text, "## Inputs", "## Protocol") + between(text, "## Outputs", "## Protocol")
        for line in region.splitlines():
            if use_clause.search(line.strip()):
                fail("AC20", f"{path.name} input or output carries a use clause: {line.strip()}")

    finalize = read("corpus/meta/techniques/workflow-engine/finalize-activity.md")
    outputs = between(finalize, "## Outputs", "## Protocol")
    headings = re.findall(r"^### .+$", outputs, re.M)
    if len(headings) < 1:
        fail("AC21", "finalize-activity declares no output")
    for heading in headings:
        after = outputs.split(heading, 1)[1]
        body = after.split("###", 1)[0].strip()
        if not body:
            fail("AC21", f"finalize-activity output {heading} does not describe its value")

    capability = between(read("corpus/meta/techniques/workflow-engine/TECHNIQUE.md"), "## Capability", "## Inputs")
    if re.search(r"\bplacement\b", capability, re.I):
        fail("AC22", "the workflow-engine Capability states a placement")

    home = []
    for path in (ROOT / "corpus/specimens").rglob("*"):
        if path.is_file() and path.suffix in {".md", ".yaml", ".yml"} and "/home/" in path.read_text():
            home.append(str(path.relative_to(ROOT)))
    if home:
        fail("AC23", "a gitnexus specimen defaults a home path: " + ", ".join(home[:8]))

    readme = read("corpus/workflow-design/activities/README.md")
    if "Leads to [Retrospective](#11-retrospective) in create and review modes" not in readme:
        fail("AC24", "the workflow-design activities README does not route 09 to retrospective in create and review modes")

    retire = read("corpus/meta/techniques/fan/retire-branch.md")
    if "barrier.met" not in retire or "reports that activity's `name`" not in retire:
        fail("AC25", "retire-branch does not state that the last retirement returns the name and whether the barrier is met")

    close = read("corpus/meta/activities/04-end-workflow.yaml")
    terminal = close.find("id: complete-client-session")
    persist = close.find("id: persist-client-completion")
    if terminal < 0 or "activity_id: __terminal__" not in close[terminal:persist if persist > terminal else None]:
        fail("AC26", "close-out does not advance the client session onto __terminal__")
    if persist < terminal or "workflow-engine::commit-and-persist" not in close[persist:]:
        fail("AC26", "the terminal advance does not commit the session's completed state")

    return problems


def self_test() -> list[str]:
    """A definition that drops the opening clear must fail AC14."""
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
    if not any(item.startswith("AC14:") for item in found):
        problems.append("self-test: dropping the opening clear did not fail AC14")
    return problems


def main() -> int:
    if "--self-test" in sys.argv:
        problems = self_test()
    else:
        problems = check()
    if problems:
        print(f"{len(problems)} walk-protocol criterion check(s) failed:")
        for item in problems:
            print(f"  {item}")
        return 1
    if "--self-test" in sys.argv:
        print("self-test: a missing opening clear fails AC14")
    else:
        print("AC14–AC26 hold on this corpus tree")
    return 0


if __name__ == "__main__":
    sys.exit(main())
