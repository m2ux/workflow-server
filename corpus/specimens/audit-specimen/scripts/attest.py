"""Attest the audit specimen's three claims.

inventory prints every canon unit, one id per line.
check reads the walk's files and exits 0 only when all three claims hold.
self-test builds a valid walk from inventory, then checks that the known misses fail.
"""
import re
import sys
import tempfile
from pathlib import Path

PLANTED = "It does not use inline content."
SKIP_FAMILY = "Creation Rules"


def inventory(corpus: Path, engine: Path) -> list[str]:
    rows = []
    anti = (corpus / "corpus/canon/resources/anti-patterns.md").read_text().splitlines()
    for line in anti:
        family = re.match(r"^## (.+)$", line)
        entry = re.match(r"^### (AP-\d+\. .+)$", line)
        if family and family.group(1) != SKIP_FAMILY:
            rows.append(f"family {family.group(1)}")
        elif entry:
            rows.append(f"entry {entry.group(1)}")
    principles = (corpus / "corpus/canon/resources/design-principles.md").read_text().splitlines()
    for line in principles:
        found = re.match(r"^## (\d+\. .+)$", line)
        if found:
            rows.append(f"principle {found.group(1)}")
    conventions = (corpus / "corpus/canon/resources/convention-conformance.md").read_text().splitlines()
    for line in conventions:
        found = re.match(r"^## (.+)$", line)
        if found:
            rows.append(f"convention {found.group(1)}")
    guards = (engine / "guards/guards.ts").read_text()
    for found in re.finditer(r"^\s+id: '([^']+)',", guards, re.M):
        rows.append(f"guard {found.group(1)}")
    return rows


def heading(listing_line: str) -> str:
    path, _, name = listing_line.strip().partition(" ")
    if not path or not name:
        raise ValueError(f"listing line has no heading: {listing_line}")
    return name


def load_lines(path: Path) -> list[str]:
    if not path.exists():
        raise ValueError(f"missing {path.name}")
    return [line for line in path.read_text().splitlines() if line.strip()]


def parse_row(line: str, name: str) -> tuple[str, str, str]:
    parts = line.split("\t")
    if len(parts) < 3 or not all(part.strip() for part in parts[:2]):
        raise ValueError(f"{name} row needs an id, a status, and a result: {line}")
    return parts[0], parts[1], "\t".join(parts[2:])


def result_ok(status: str, result: str) -> bool:
    if status == "not-applicable":
        return bool(result.strip())
    if status == "walked":
        return result == "applied" or result.startswith("finding: ")
    return False


def ids_of(rows: list[tuple[str, str, str]]) -> list[str]:
    return [row[0] for row in rows]


def check(corpus: Path, engine: Path, baseline_file: Path, out: Path) -> list[str]:
    problems = []
    try:
        units = inventory(corpus, engine)
    except OSError as error:
        return [str(error)]
    if len(units) != len(set(units)):
        problems.append("inventory repeats a unit id")

    try:
        listed = load_lines(out / "units-listed.txt")
        used = load_lines(out / "units-used.tsv")
        ledger = [parse_row(line, "ledger") for line in load_lines(out / "unit-ledger.tsv")]
        findings = load_lines(out / "audit-findings.tsv")
        reaudit = [parse_row(line, "reaudit ledger") for line in load_lines(out / "reaudit-ledger.tsv")]
        refindings = load_lines(out / "reaudit-findings.tsv")
        specimen_rounds = (out / "specimen-rounds.txt").read_text().strip()
        baseline_rounds = baseline_file.read_text().strip()
    except (OSError, ValueError) as error:
        return [str(error)]

    listed_headings = []
    for line in listed:
        try:
            listed_headings.append(heading(line))
        except ValueError as error:
            problems.append(str(error))
    used_headings = []
    for line in used:
        ident, sep, result = line.partition("\t")
        if not sep or not ident:
            problems.append(f"units-used row has no application result: {line}")
            continue
        if result != "applied" and not result.startswith("finding: "):
            problems.append(f"units-used result is not applied or a finding: {line}")
        used_headings.append(ident)
    if set(listed_headings) != set(used_headings) or len(listed_headings) != len(set(listed_headings)):
        problems.append("author headings differ from the listing")
    if (out / "units-used.tsv").read_text() == (out / "units-listed.txt").read_text():
        problems.append("units-used copies the listing")

    def covers(name: str, rows: list[tuple[str, str, str]]) -> None:
        idents = ids_of(rows)
        if idents != units and set(idents) != set(units):
            missing = [unit for unit in units if unit not in set(idents)]
            extra = [ident for ident in idents if ident not in set(units)]
            problems.append(f"{name} is missing {len(missing)} inventory ids and has {len(extra)} unknown ids")
        if len(idents) != len(set(idents)):
            problems.append(f"{name} repeats an id")
        for ident, status, result in rows:
            if not result_ok(status, result):
                problems.append(f"{name} row {ident} is {status} without a usable result")

    covers("ledger", ledger)
    covers("reaudit ledger", reaudit)
    walked = {ident for ident, status, _ in ledger if status == "walked"}
    rewalked = {ident for ident, status, _ in reaudit if status == "walked"}
    if not walked <= rewalked:
        problems.append("reaudit leaves a walked unit unwalked")
    if any(result.startswith("finding:") for _, _, result in reaudit):
        problems.append("reaudit ledger still records a finding")
    if refindings:
        problems.append("reaudit findings are not empty")
    if not any(PLANTED in line for line in findings):
        problems.append("first audit does not record the planted sentence")
    if not specimen_rounds.isdigit() or not baseline_rounds.isdigit():
        problems.append("round counts are not whole numbers")
    elif int(specimen_rounds) != 1 or not (int(specimen_rounds) < int(baseline_rounds)):
        problems.append(f"specimen rounds {specimen_rounds} are not one round below baseline {baseline_rounds}")
    return problems


def write_valid(corpus: Path, engine: Path, out: Path) -> None:
    units = inventory(corpus, engine)
    listed = "corpus/canon/resources/anti-patterns.md:653 AP-41. avoidance-voice-in-definitions\n"
    used = "AP-41. avoidance-voice-in-definitions\tapplied\n"
    ledger = "".join(f"{unit}\twalked\tapplied\n" for unit in units)
    # One planted finding on the real entry id, then a clean re-audit.
    planted_id = "entry AP-41. avoidance-voice-in-definitions"
    ledger = ledger.replace(
        f"{planted_id}\twalked\tapplied\n",
        f"{planted_id}\twalked\tfinding: {PLANTED}\n",
        1,
    )
    findings = f"{planted_id}\ttechniques/subject.md\t{PLANTED}\n"
    reaudit = "".join(f"{unit}\twalked\tapplied\n" for unit in units)
    (out / "units-listed.txt").write_text(listed)
    (out / "units-used.tsv").write_text(used)
    (out / "unit-ledger.tsv").write_text(ledger)
    (out / "audit-findings.tsv").write_text(findings)
    (out / "reaudit-ledger.tsv").write_text(reaudit)
    (out / "reaudit-findings.tsv").write_text("")
    (out / "specimen-rounds.txt").write_text("1\n")


def self_test(corpus: Path, engine: Path, baseline: Path) -> list[str]:
    failures = []
    with tempfile.TemporaryDirectory() as directory:
        out = Path(directory)
        write_valid(corpus, engine, out)
        if check(corpus, engine, baseline, out):
            failures.append("valid walk did not pass")
        copied = out / "units-used.tsv"
        copied.write_text((out / "units-listed.txt").read_text())
        if not check(corpus, engine, baseline, out):
            failures.append("copied listing passed")
        write_valid(corpus, engine, out)
        ledger = (out / "unit-ledger.tsv").read_text().splitlines()
        (out / "unit-ledger.tsv").write_text("\n".join(ledger[:-1]) + "\n")
        if not check(corpus, engine, baseline, out):
            failures.append("short ledger passed")
        write_valid(corpus, engine, out)
        (out / "reaudit-findings.tsv").write_text(f"entry AP-41. avoidance-voice-in-definitions\ttechniques/subject.md\t{PLANTED}\n")
        if not check(corpus, engine, baseline, out):
            failures.append("reaudit finding passed")
        write_valid(corpus, engine, out)
        (out / "specimen-rounds.txt").write_text("2\n")
        if not check(corpus, engine, baseline, out):
            failures.append("two specimen rounds passed")
    return failures


def main(argv: list[str]) -> int:
    if len(argv) < 2 or argv[1] not in {"inventory", "check", "self-test"}:
        print("usage: attest.py inventory|check|self-test --corpus DIR --engine DIR [--baseline FILE --out DIR]", file=sys.stderr)
        return 2
    args = argv[2:]
    values = {}
    key = None
    for arg in args:
        if arg.startswith("--"):
            key = arg[2:]
            values[key] = ""
        elif key:
            values[key] = arg
            key = None
    if "corpus" not in values or "engine" not in values:
        print("corpus and engine are required", file=sys.stderr)
        return 2
    corpus = Path(values["corpus"])
    engine = Path(values["engine"])
    command = argv[1]
    if command == "inventory":
        for row in inventory(corpus, engine):
            print(row)
        return 0
    baseline = Path(values.get("baseline") or "")
    if command == "self-test":
        failures = self_test(corpus, engine, baseline)
        if failures:
            print("\n".join(failures))
            return 1
        print("pass")
        return 0
    out = Path(values.get("out") or "")
    problems = check(corpus, engine, baseline, out)
    if problems:
        print("\n".join(problems))
        return 1
    print("pass")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
