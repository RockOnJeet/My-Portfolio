# Repository Agent Instructions

These instructions capture the established workflow for agents modifying this repository.

## Approval and Planning

Before code modifications, present a concrete plan containing:

- confidence level from 1-10 and reasoning;
- tools that will be used and why;
- files expected to change and whether edits are small or structural;
- verification steps.

Do not run code-modification tools until the user explicitly approves that change batch. Treat separately proposed changes as separate approval boundaries.

Do not add tests unless the user explicitly requests them. If tests would materially improve confidence, explain why and ask first.

## LOQ_Control Workflow

Use the `LOQ_Control` plugin for workspace/code operations.

At the start of every exploration or resumed implementation batch:

1. Discover/load the `LOQ_Control` tool interface if required by the host.
2. Call `list_files_code` on path `.` with `recursive=false` before other code exploration.
3. Never recursively list the workspace root.
4. Recursively list only targeted subdirectories when necessary.

Prefer symbol-oriented exploration to reduce context use:

- `get_document_symbols_code` for a file outline;
- `search_symbols_code` to locate named symbols across the workspace;
- `get_symbol_definition_code` for focused type/definition information;
- `read_file_code` only for implementation content that actually needs inspection.

Always read a target file before editing it.

## Editing Rules

For small edits of 10 lines or fewer, use `replace_lines_code` with exact original content.

If exact replacement fails, read the relevant lines again and retry with the actual current content.

For new files, structural changes, changes larger than 10 lines, or uncertain existing content, use `create_file_code`; use `overwrite=true` for deliberate complete rewrites.

Do not make unrelated cleanup changes while implementing an approved batch.

## Mandatory Verification

Run `get_diagnostics_code` after every series of code changes. This is mandatory even for documentation/configuration-oriented batches.

For TypeScript implementation work, also run the repository typecheck before declaring the batch complete:

```text
npm run typecheck -- --pretty false
```

Report diagnostics and typecheck results separately.

## Terminal Safety

All terminal commands must be non-interactive and bounded so they cannot leave the integrated terminal waiting for input or trapped in a pager.

- Use `git --no-pager` for Git output that might invoke a pager.
- Prefer one self-contained command per terminal invocation.
- Avoid interactive npm, Git, shell, editor, or authentication flows.
- Supply explicit timeouts to terminal calls.
- Never invoke commands such as `less`, `more`, interactive editors, or anything requiring a quit key.
- Avoid complex PowerShell quoting/pipelines when a malformed expression could enter the `>>` continuation prompt. Prefer simpler independent commands or purpose-built workspace tools.
- A previous compound PowerShell search entered continuation mode and required manual `Ctrl+C`; do not repeat this failure mode.

Let command failures surface naturally. Do not add shell workarounds that hide errors.

## Dependency and SDK Work

Before integrating an unfamiliar or materially changed SDK:

1. inspect the installed/published version and workspace compatibility;
2. inspect official documentation and representative official examples;
3. inspect the actual installed type declarations when API shape matters;
4. adapt the architecture to the SDK rather than recreating protocol behavior manually;
5. verify dependency changes with diagnostics and the full repository typecheck.

For the MCP server specifically, use `@modelcontextprotocol/server` v2. Do not reintroduce the removed `@modelcontextprotocol/sdk` v1 dependency unless the user explicitly changes this architectural decision.

## MCP Project Conventions

Read `MCP_IMPLEMENTATION_LOG.md` before resuming MCP implementation and update it after every completed MCP implementation batch.

Current MCP configuration is intentionally file-backed. Do not introduce Wrangler/KV/D1-backed configuration until that migration is requested.

Mark code that is intentionally a future runtime-storage migration seam with:

```text
TODO(wrangler)
```

Keep MCP concerns separated:

- configuration describes server behavior;
- the capability registry selects implemented capabilities;
- individual capability modules own schemas and handlers;
- the server factory assembles the MCP server;
- HTTP transport and authentication live at the request boundary;
- OAuth mechanics do not belong inside capability implementations.

## Repository State

Do not assume the remote branch is the desired source of truth. The current MCP implementation intentionally began from the local `test/mcp` baseline rather than the discarded upstream MCP implementation. Never pull/reset/rebase merely because Git reports that the branch is behind without explicit user approval.
