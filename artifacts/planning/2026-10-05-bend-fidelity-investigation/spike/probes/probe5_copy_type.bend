import Base

type Session is Type:
  Session{n: U32}

def twice(+s: Session) -> Session & Session:
  (s, s)

def main() -> U32:
  7
