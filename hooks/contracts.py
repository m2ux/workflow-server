"""Harness-independent inputs and decisions for workspace policy."""

from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class Request:
    kind: str
    value: str
    cwd: str


@dataclass(frozen=True)
class Decision:
    action: Literal["allow", "deny", "ask", "abstain"]
    reason: str = ""


ABSTAIN = Decision("abstain")
