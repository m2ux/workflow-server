import Base

type Activity is Data:
  Dispatch{}
  Review{}

type DispatchExit is Data:
  Dispatched{}

type ReviewExit is Data:
  Approved{}
  Rejected{}

def ExitOf(a: Activity) -> Data:
  match a:
    case Dispatch{}:
      DispatchExit
    case Review{}:
      ReviewExit

type Destination is Data:
  Terminal{}
  Enter{activity: Activity}

def graph(a: Activity, e: ExitOf(a)) -> Destination:
  match a:
    case Dispatch{}:
      match e:
        case Dispatched{}:
          Enter{Review{}}
    case Review{}:
      match e:
        case Approved{}:
          Terminal{}
        case Rejected{}:
          Enter{Dispatch{}}

def main() -> Destination:
  graph(Review{}, Rejected{})
