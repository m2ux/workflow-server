# NEGATIVE: the activity declares a second exit, skipped, and the graph binds
# only dispatched. Today the loader fails the load (docs/workflow.md: "An
# unbound exit ... fail[s] the load"). Here the match is not total.
import Base

type Activity is Data:
  Dispatch{}

type DispatchExit is Data:
  Dispatched{}
  Skipped{}

def ExitOf(a: Activity) -> Data:
  match a:
    case Dispatch{}:
      DispatchExit

type Destination is Data:
  Terminal{}
  Enter{activity: Activity}

def graph(a: Activity, e: ExitOf(a)) -> Destination:
  match a:
    case Dispatch{}:
      match e:
        case Dispatched{}:
          Terminal{}

def main() -> Destination:
  graph(Dispatch{}, Dispatched{})
