# fmt-fix

Apply rustfmt formatting in place.

## Inputs

- **scope** — `'--all'` for the full workspace, or omit for the local crate

## Procedure

- `nice -n 19 cargo fmt {scope}`

## Tools

- **shell:** cargo
