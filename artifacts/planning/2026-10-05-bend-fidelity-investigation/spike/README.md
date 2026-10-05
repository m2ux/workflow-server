# Spike: Bend as the Fidelity System

This folder holds the Bend sources, the negative cases, the captured compiler output, and the steps that reproduce them. Everything here runs from the Bend repository at one commit, built from source under `/tmp`. Nothing here touches the server or the corpus.

## The Bend studied

| Item | Value |
|------|-------|
| Repository | https://github.com/bendlang/bend |
| Commit | `565d7fdec289b1f2f5f5037bb58b5afb6738ff1d` |
| Commit date | 2026-10-04 05:26:01 -0700 |
| Commit subject | simplify pending links in io_str (#1303) |
| Version string | Bend 2.0.35 (`bend --help`) |
| Implementation | TypeScript under Bun: `bend2/bend.ts` (checker), `bend2/comp.ts` (compiler), `bend2/main.ts` (CLI), `bend2/safe.ts` (elaborator to BendTT), `bend2/bendtt.lean` (the kernel behind `--verdict`) |

This is Bend 2. Bend 1 (HVM2, untyped) is a different system and is not what the repository ships at this commit: `README.md` Limitations states "Bend 2 is a new language. Bend 1 programs and HVM do not carry over."

## Build from source

There is no compile step for the checker: `bend2/main.ts` runs directly under Bun. The CLI refuses to run under Node (`bend2/main.ts:896-899`). The `--verdict` path needs the BendTT kernel, which is Lean source compiled to a native binary with Lean v4.34.0 (`bend2/safe.ts:1471-1500`).

Host toolchain found: Node 20.19.4, gcc, clang 21 (`/usr/lib/llvm-21/bin`), python3. Not found: Bun, Lean, elan, cargo. Nothing was installed outside `/tmp`.

```bash
# 1. Clone Bend
mkdir -p /tmp/bend-fidelity && cd /tmp/bend-fidelity && git clone https://github.com/bendlang/bend bend
cd bend && git checkout 565d7fdec289b1f2f5f5037bb58b5afb6738ff1d

# 2. Bun 1.4.0, the version Bend's own CI pins (.github/workflows/repo-gate.yml), from the release archive, checksum verified
mkdir -p /tmp/bend-fidelity/bun && cd /tmp/bend-fidelity/bun
curl -fsSL -o bun-linux-x64.zip https://github.com/oven-sh/bun/releases/download/bun-v1.4.0/bun-linux-x64.zip
curl -fsSL -o SHASUMS256.txt https://github.com/oven-sh/bun/releases/download/bun-v1.4.0/SHASUMS256.txt
grep ' bun-linux-x64.zip' SHASUMS256.txt | sha256sum --check   # bun-linux-x64.zip: OK
unzip -q bun-linux-x64.zip                                      # ./bun-linux-x64/bun --version -> 1.4.0

# 3. Lean 4.34.0, the version safe.ts names, from the release archive (no elan, no writes to HOME)
mkdir -p /tmp/bend-fidelity/lean && cd /tmp/bend-fidelity/lean
curl -fsSL -o lean-4.34.0-linux.tar.zst https://github.com/leanprover/lean4/releases/download/v4.34.0/lean-4.34.0-linux.tar.zst
tar --zstd -xf lean-4.34.0-linux.tar.zst                        # bin/lean --version -> Lean (version 4.34.0, ...)

# 4. The BendTT kernel binary, the two commands safe.ts runs (bend2/safe.ts:1498-1499)
mkdir -p /tmp/bend-fidelity/kernel && cp /tmp/bend-fidelity/bend/bend2/bendtt.lean /tmp/bend-fidelity/kernel/
cd /tmp/bend-fidelity/kernel
/tmp/bend-fidelity/lean/lean-4.34.0-linux/bin/lean -c bendtt.c bendtt.lean   # 16 s wall
/tmp/bend-fidelity/lean/lean-4.34.0-linux/bin/leanc -O3 -DNDEBUG bendtt.c -o bendtt   # 4 s wall, 5.5 MB binary
```

The CLI writes a version-check record to `~/.bend/check.json` and Bun writes an install cache under `~/.bun`, so every run sets `HOME` to `/tmp/bend-fidelity/home`. `BENDTT` names the kernel binary, which keeps `safe.ts` from building and caching one under the real home (`bend2/safe.ts:1476-1486`).

## Run commands

`/tmp/bend-fidelity/bendc` is the wrapper used throughout:

```sh
#!/bin/sh
HOME=/tmp/bend-fidelity/home BENDTT=/tmp/bend-fidelity/kernel/bendtt exec /tmp/bend-fidelity/bun/bun-linux-x64/bun /tmp/bend-fidelity/bend/bend2/main.ts $1 $2 $3 $4
```

```bash
/tmp/bend-fidelity/bendc <file.bend> --check-only   # the AI-written checker (bend2/bend.ts)
/tmp/bend-fidelity/bendc <file.bend> --verdict      # the checker, then the Lean-proven kernel
/tmp/bend-fidelity/bendc <file.bend>                # check, then normalise or run main
```

## Toolchain verification

Shipped demos, checked with the commands above:

| File | `--check-only` | `--verdict` |
|------|----------------|-------------|
| `demos/proof_insertion_sort/PROOF.bend` | ALL PROOFS CHECK, 0.13 s | ALL PROOFS CHECK, 0.12 s |
| `demos/app_win_is_bug_2d/PROOF.bend` | ALL PROOFS CHECK, 0.53 s | ALL PROOFS CHECK, 1.56 s |

Wall times are from the `time` builtin on a 16-core host and include Bun start-up.
