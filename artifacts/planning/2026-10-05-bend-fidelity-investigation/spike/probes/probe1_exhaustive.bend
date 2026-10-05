import Base

type Exit is Data:
  ExDone{}
  ExRetry{}
  ExAbort{}

def target(e: Exit) -> U32:
  match e:
    case ExDone{}:
      1
    case ExRetry{}:
      2

def main() -> U32:
  target(ExAbort{})
