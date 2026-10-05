# Task pairs that do not share a pull request

Each pair below can start without waiting on the other, and the two tasks do not name each other. They stay separate pull requests for the reason given.

## E02

| Pair | Why |
| --- | --- |
| W01, W05 | Group refresh landed in #893. Symbol reach with the declared dependency landed in #906. |

## E03

| Pair | Why |
| --- | --- |
| W02, W03 | Output-file relocation landed in #926. The grain corrections landed in #928. |
| W02, W04 | Output-file relocation landed in #926. The README switch landed in #927. |
| W02, W05 | Output-file relocation landed in #926. The prism run record landed in #928. |
| W02, W06 | The output-file check and the probe bindings edit different callers. |
| W02, W07 | The output-file relocation is one operation. The shared-operation guard is a corpus check over every direct bind. |
| W02, W09 | Output-file relocation landed in #926. The grain follow-up adopts the grain criteria. |
| W02, W10 | Output-file relocation landed in #926. The links follow-up adopts the README criterion. |
| W02, W11 | Output-file relocation landed in #926. The prism follow-up adopts the run-record criterion. |
| W03, W04 | Grain corrections landed in #928. The README switch landed in #927. |
| W03, W06 | Grain corrections and probe bindings edit different call sites. |
| W03, W08 | Grain corrections landed in #928. The output-file follow-up adopts the worker-file criterion. |
| W03, W10 | Grain corrections landed in #928. The links follow-up adopts the README criterion. |
| W03, W11 | Grain corrections landed in #928. The prism follow-up adopts the run-record criterion. |
| W04, W05 | The README switch landed in #927. The prism run record landed in #928. |
| W04, W06 | The README switch and the probe bindings edit different callers. |
| W04, W07 | The README switch is one operation. The shared-operation guard is a corpus check. |
| W04, W08 | The README switch landed in #927. The output-file follow-up adopts the worker-file criterion. |
| W04, W09 | The README switch landed in #927. The grain follow-up adopts the grain criteria. |
| W04, W11 | The README switch landed in #927. The prism follow-up adopts the run-record criterion. |
| W05, W06 | The prism run record and the probe bindings edit different callers. |
| W05, W07 | The prism run record is one operation. The shared-operation guard is a corpus check. |
| W05, W08 | The prism run record landed in #928. The output-file follow-up adopts the worker-file criterion. |
| W05, W09 | The prism run record landed in #928. The grain follow-up adopts the grain criteria. |
| W05, W10 | The prism run record landed in #928. The links follow-up adopts the README criterion. |
| W06, W07 | Probe bindings are caller edits. The guard is the check that fails when a repeated direct bind sits outside a shared library. |
| W06, W08 | Probe bindings and the worker-file follow-up edit different callers. |
| W06, W09 | Probe bindings and the grain follow-up edit different call sites. |
| W06, W10 | Probe bindings and the links follow-up edit different callers. |
| W06, W11 | Probe bindings and the prism follow-up edit different callers. |
| W07, W08 | The shared-operation guard is a corpus check. The worker-file follow-up is one operation. |
| W07, W09 | The shared-operation guard is a corpus check. The grain follow-up is the grain criteria. |
| W07, W10 | The shared-operation guard is a corpus check. The links follow-up is the README criterion. |
| W07, W11 | The shared-operation guard is a corpus check. The prism follow-up is the run-record criterion. |
| W08, W09 | The worker-file criterion and the grain criteria are different outcomes. |
| W08, W10 | The worker-file criterion and the README criterion are different outcomes. |
| W08, W11 | The worker-file criterion and the run-record criterion are different outcomes. |
| W09, W10 | The grain criteria and the README criterion are different outcomes. |
| W09, W11 | The grain criteria and the run-record criterion are different outcomes. |
| W10, W11 | The README criterion and the run-record criterion are different outcomes. |

## E04

| Pair | Why |
| --- | --- |
| W02, W03 | The conformance specimen is a workflow walked on the sidecar. The scratch check is a live read of a draft advisory, recorded on the epic. |

## E05

The infrastructure tasks change different parts of the smoke runner. A recorded specimen run is a walk, not that infrastructure change. Two specimen runs exercise different workflows.

| Pair | Why |
| --- | --- |
| W01, W02 | Seeding the target with a branch, a tag, and commits is the git history. Passing session inputs is the orchestrator's `start_session` call. |
| W01, W03 | The seed is git history. Extra MCP servers are the worker config. |
| W01, W04 | The seed is one repository. The indexed group is a fixture set of repositories. |
| W01, W05 | The seed is the target history. Report assertions are the orchestrator failing a broken conformance report. |
| W01, W07 | The seed is infrastructure. The radius run is a recorded walk. |
| W01, W08 | The seed is infrastructure. The advisory run is a recorded walk. |
| W02, W03 | Session inputs and extra MCP servers are different orchestrator settings. |
| W02, W04 | Session inputs are one call. The indexed group is fixture data. |
| W02, W05 | Session inputs and report assertions are different checks in the orchestrator. |
| W03, W04 | The worker config and the indexed fixture group are different files. |
| W03, W05 | Extra MCP servers and report assertions are different checks. |
| W03, W06 | The worker config is infrastructure. The git-pin run is a recorded walk. |
| W03, W08 | The worker config is infrastructure. The advisory run is a recorded walk. |
| W04, W05 | The indexed group is fixture data. Report assertions read a conformance report. |
| W04, W06 | The indexed group serves the radius run. The git-pin run does not measure a group. |
| W04, W08 | The indexed group serves the radius run. The advisory run does not measure a group. |
| W06, W07 | The git-pin run and the radius run exercise different specimens. |
| W06, W08 | The git-pin run and the advisory run exercise different specimens. |
| W07, W08 | The radius run and the advisory run exercise different specimens. |
