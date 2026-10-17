# General Software Engineering Principles

These rules are mandatory for every code change, regardless of language, framework, or project. Do not treat them as optional suggestions.

Before writing code, understand the requirement and the relevant existing code. Do not proceed with the first plausible idea without checking whether an existing, simpler, or more direct solution would work better. Choose the smallest solution that fully meets the need. If a rule cannot be followed, explain why before proceeding.

## Choose the Smallest Correct Solution

You MUST implement the simplest solution that fully meets the requirement.

You MUST NOT add abstractions, layers, helpers, configuration, indirection, or generalized infrastructure for hypothetical future needs. Add them only when they provide a concrete benefit to the current work, such as correctness, security, necessary reuse, testability, or meaningfully reduced duplication.

## Preserve Responsibility and Domain Boundaries

Each class and module MUST have a clear, cohesive responsibility and belong to the domain that owns that behavior.

Keep domain-specific rules with their owning domain. A workflow may coordinate multiple domains when that is its purpose, but the coordination MUST be explicit and live at the appropriate application boundary. Do not move domain logic into unrelated domains or create unnecessary cross-domain dependencies.

## Keep Functions Focused and Compact

You MUST keep functions focused on a clear purpose and compact enough to understand in one pass.

Split a function when doing so clarifies distinct responsibilities or makes the main workflow easier to follow. Do not split mechanically by line count, or create tiny helpers that only move code around and make the flow harder to trace.

## Keep Files Manageable

When a file becomes excessively large or difficult to navigate, you MUST split it into cohesive, clearly named files while preserving responsibility and domain boundaries.

Split by responsibility and domain, not by arbitrary line counts. Do not fragment cohesive code or introduce extra indirection merely to make files shorter.

## Write for Human Understanding

You MUST use clear names, straightforward control flow, and familiar patterns. Do not use cleverness or excessive compression at the expense of readability.

Make the intent easy to understand for someone reviewing or maintaining the code. Remove duplication and unnecessary structure, but keep boundaries that make the code clearer.

## Quality Rules (from DwarfStar)

- Keep the implementation small, sharp, easy to understand. Don't settle for the first thing that comes to mind: look for the most minimal design that works better. No slop: no fragile code that patches specific cases, no dead code, no code more complicated than it should be.
- Prefer compact comments beside the implementation over separate design documents. Explain why an ordering, boundary or choice exists, not what the line does.
- Keep interfaces narrow: the content script does not know Whisper, the native host does not know WhatsApp.
- Do not add permanent behavior variants behind flags or options.
- Preserve correctness before speed.

## wa-transcribe constraints

Unofficial, local-only transcription of WhatsApp Web voice messages: a Manifest V3 browser extension plus a Chrome Native Messaging host that runs MLX Whisper on Apple Silicon. Not affiliated with WhatsApp or Meta.

- Transcription runs only on an explicit click, one voice message at a time. No automatic transcription, background monitoring or polling.
- Audio and transcripts never leave the machine: no cloud services, analytics, telemetry or network calls besides WhatsApp Web itself. The host runs with the Hugging Face hub offline; only `install.sh` may download the model.
- The extension never sends, edits, reacts to, forwards or marks as played any message. It only reads media through `WPP.chat.downloadMedia`.
- The host is started by the browser per request and exits after replying. No daemons, LaunchAgents, open ports or HTTP servers.
- Treat every message, contact name and audio file as untrusted input. Insert transcripts with `textContent`, never as HTML.
- Never log, commit or put in test fixtures message contents, transcripts, audio, phone numbers, message ids or other personal data. Use fictional identifiers in tests.
- Plain JavaScript with no build step, bundler, framework or npm dependency. The only vendored code is `extension/wppconnect-wa.js` (Apache-2.0, keep its license file). The host is Python standard library plus `mlx-whisper`, compatible with Python 3.9.
- The native host writes only Native Messaging frames to stdout; anything else goes to stderr.
- Never report a test or check as passing unless it was run and its output checked. Live tests on a real WhatsApp account only use chats the maintainer explicitly approved.
- Work on a dedicated feature branch with logically scoped, one-line conventional commits, without Co-Authored-By trailers. Never commit planning documents or reference them from tracked files.
- Never push, create public repositories or publish releases without the maintainer's explicit authorization.
- Before committing, run `python3 -m unittest discover -s host` and `node --check` on every file in `extension/` except the vendored one.

Sources of mandatory principles: https://github.com/Gybra/software-engineering-principles and https://github.com/antirez/ds4/blob/main/AGENT.md.
