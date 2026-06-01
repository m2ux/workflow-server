Apply rustfmt formatting in place.

## Inputs

### scope

`'--all'` for the full workspace, or omit for the local crate

## Protocol

1. `nice -n 19 cargo fmt {scope}`
