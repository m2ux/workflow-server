"""The script registry: each kind of work the Registration in artifacts/work-kind.md lists, mapped to the module that supplies it.

A kind of work is an issue whose title opens with the kind's tag, as its body artifact states. Each
registered module supplies every operation of the Kind interface with the inputs and results stated
there. A general script selects an issue's or pull request's kind with kind_of and reaches the kind's
logic through interface; it imports no kind module and keeps no list of kinds of its own.
"""
from collections.abc import Callable
from importlib import import_module
from typing import NamedTuple, Protocol

# The status board_status gives an item that leaves its theme board.
OFF_BOARD = 'off the board'
# An issue's repository, as owner/name, and its number.
Key = tuple[str, int]


class Review(NamedTuple):
    """The agent review rule for one pull request."""

    # Each review record field, and the value it holds while the record is current for the pull request.
    current: dict[str, object]
    # The fault in a finding that the general finding rule passes, or '' when none.
    finding_fault: Callable[[dict], str]


class Tips(NamedTuple):
    """A pull request's validated tips: its head and base SHAs and its base branch."""

    head: str
    base: str
    base_ref: str

# Each kind of work, by the name a report gives it, mapped to the module in this folder that supplies it.
KINDS = {'hot-fix': 'hotfix'}


class Kind(Protocol):
    """The operations every kind module supplies, each accepting the inputs and returning the results
    stated here. A kind constrains only its own fields."""

    def tag(self, item: dict) -> str | None:
        """The kind's tag an issue's or pull request's title opens with, or None when it opens with none."""

    def labels(self, issue: dict) -> list[str]:
        """The labels the issue carries beside type:<kind> and its theme:* label. Each excludes any other
        label of its scope, the text up to its first colon."""

    def faults(self, issue: dict) -> list[str]:
        """Each condition of the kind's body the issue fails that no other kind carries; empty when none."""

    def target(self, issue: dict) -> str:
        """The long-lived branch the issue's work lands on, or '' when its body names none."""

    def board_status(self, issue: dict, held: str | None, delivering: list[dict]) -> str | None:
        """The theme board Status the issue holds, given the Status it holds now (None off the board) and
        its delivering pull requests: a Status name, OFF_BOARD when it leaves the board, or None when the
        kind sets none."""

    def linking_pulls(self, prs: list[dict], key: Key) -> list[dict]:
        """The pull requests whose Development field links the issue at key, by number."""

    def delivery_fault(self, pull: dict, key: Key, issue: dict) -> str:
        """Why the pull request does not deliver the issue at key, or '' when it does."""

    def delivering_pulls(self, prs: list[dict], key: Key, issue: dict) -> list[dict]:
        """The pull requests that deliver the issue at key, as delivery_fault tests each, by number."""

    def unit_state(self, issue: dict, held: str | None, linking: list[dict], delivering: list[dict]) -> str | None:
        """Where the issue's delivery unit stands, given its held Status and its linking and delivering pull
        requests: unrecorded, running, hold or unit, or None when the issue is no delivery unit."""

    def issue_fields(self, body: str) -> list[str]:
        """The heading of each section of a pull request body holding a line of a field only the kind's issue
        carries, in body order, each once; empty when none does."""

    def review(self, tips: Tips) -> Review:
        """The agent review rule for a pull request of the kind, given the tips agent_review validated: the
        record fields that hold a record current, and the fault the kind finds in a finding."""


def interface(kind: str) -> Kind:
    """The module that supplies the named kind; a name KINDS does not hold raises KeyError."""
    return import_module(KINDS[kind])


def kind_of(item: dict) -> str | None:
    """The name of the kind whose tag the issue's or pull request's title opens with, or None when the
    title opens with no registered kind's tag."""
    return next((kind for kind in KINDS if interface(kind).tag(item)), None)
