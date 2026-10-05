import Base

type Gate is Data:
  Open{}
  Clear{}

type OpenSession is Type:
  OpenS{n: U32}

type ClearSession is Type:
  ClearS{n: U32}

def Session(g: Gate) -> Type:
  match g:
    case Open{}:
      OpenSession
    case Clear{}:
      ClearSession

def advance(s: Session(Clear{})) -> Session(Clear{}):
  match s:
    case ClearS{n}:
      ClearS{(n + 1 : U32)}

def main() -> Session(Clear{}):
  s : Session(Open{}) = OpenS{0}
  advance(s)
