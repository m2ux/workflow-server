import Base

type Step is Data:
  Step{id: String, gated: Bool}

def Report(s: Step) -> Type:
  match s:
    case Step{id, gated}:
      match gated:
        case False{}:
          Bool
        case True{}:
          Maybe<&2, Bool>

def Manifest(steps: List<&2, Step>) -> Type:
  match steps:
    case Nil{}:
      Unit
    case s <> rest:
      Report(s) & Manifest(rest)

def steps() -> List<&2, Step>:
  [Step{"recording", False{}}, Step{"optional", True{}}]

def ok() -> Manifest(steps()):
  (True{}, (None{}, Unit{}))

def main() -> Manifest(steps()):
  ok()
