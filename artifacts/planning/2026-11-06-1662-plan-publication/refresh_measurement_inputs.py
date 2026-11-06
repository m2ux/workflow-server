from pathlib import Path
out=Path('/tmp/deliver17-20261106/e05-overview')
p=out/'measure_contexts.py'
p.write_text(p.read_text().replace("'/tmp/deliver17-20261106/gitnexus-e05'", "'/tmp/deliver17-20261106/gitnexus-e05-final'"))
p=out/'check_artifacts.py'
p.write_text(p.read_text().replace('/.worktrees/pr/1662\'','/.worktrees/pr/1662-581c525137d0\'').replace('6d1ff1453bc40256c9c4803df762e8d665d62624','581c525137d0779649ad97e89370bafbde927d34'))
