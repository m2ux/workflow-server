# NEGATIVE: the graph sends the exit to an activity the workflow does not
# declare. Today the loader fails the load ("an unknown destination").
import Base

type Activity is Data:
  Dispatch{}

type DispatchExit is Data:
  Dispatched{}

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
          Enter{Review{}}

def main() -> Destination:
  graph(Dispatch{}, Dispatched{})
