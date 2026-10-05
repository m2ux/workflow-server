import Base

type Session is Type:
  Session{n: U32}

def advance(s: Session) -> Session:
  match s:
    case Session{n}:
      Session{(n + 1 : U32)}

def main() -> U32:
  s = {Session{0} : Session}
  a = advance(s)
  b = advance(s)
  7
