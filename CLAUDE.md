# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rach** is an AI-powered Digital Audio Workstation (DAW) named after Sergei Rachmaninoff. It's currently in the **specification phase** — the full spec lives in `Rach_DAW_Specification.md`. No implementation code exists yet.

## Tech Stack

- **Desktop**: Electron 29+ with electron-vite 2.0+
- **Frontend**: React 18.3+, TypeScript 5.4+, Vite 5.1+
- **Styling**: Tailwind CSS 3.4+ with Radix UI + shadcn/ui
- **State**: Zustand 4.5+
- **Routing**: React Router 6.22+
- **Audio**: Web Audio API + Tone.js 14.8+, AssemblyScript for WASM DSP
- **AI**: Anthropic Agent SDK 1.0+ with OAuth 2.0 (PKCE), models: Opus 4 (mixing/composition), Sonnet 4 (arrangement/analysis)
- **ML**: ONNX Runtime for Demucs v4 stem separation, Spleeter fallback
- **Native**: node-addon-api for VST3/AU hosting, C++ for vst3-host and asio-driver
- **DB**: better-sqlite3 (local), Supabase (optional cloud sync)
- **Package Manager**: pnpm 8.15+
- **Node**: 20 LTS

## Planned Commands

```bash
pnpm install                # Install dependencies
pnpm run download-models    # Download Demucs/Spleeter ONNX models
pnpm run build:native       # Compile C++ native modules (VST3, ASIO)
pnpm dev                    # Start dev server with hot reload
```

## Architecture

### Process Model (Electron)

- **Main process** (`electron/main.ts`): OS integration, OAuth flow, plugin hosting, audio engine
- **Preload** (`electron/preload.ts`): Secure IPC bridge between main and renderer
- **Renderer** (`src/`): React UI

### Key Services (Main Process — `electron/services/`)

| Service | Purpose |
|---------|---------|
| `AnthropicAuthService` | OAuth 2.0 + PKCE, token encryption via Electron safeStorage, auto-refresh |
| `ClaudeAgentService` | Four specialized Claude agents with tool-use (see below) |
| `AudioEngine` | Web Audio API core |
| `MIDIEngine` | MIDI sequencing via Web MIDI API + @tonejs/midi |
| `PluginHost` | VST3/AU plugin hosting via native C++ addon |
| `StemSeparator` | Demucs v4 inference via ONNX Runtime, CUDA/Metal acceleration |

### Claude Agent System

Four agents, each with specific tools:

1. **Mixing Agent** (Opus 4) — `apply_eq`, `apply_compression`, `set_track_level`, `set_track_pan`, `analyze_frequency_spectrum`
2. **Composition Agent** (Opus 4) — `generate_chord_progression`, `create_midi_track`, `detect_key_and_scale`
3. **Arrangement Agent** (Sonnet 4) — `create_song_section`
4. **Analysis Agent** (Sonnet 4) — `analyze_project_mix`

### Frontend (`src/`)

- `components/AI/` — Claude chat interface, mix analyzer, chord generator, OAuth login
- `components/Timeline/` — DAW timeline
- `components/PianoRoll/` — MIDI editor
- `components/Mixer/` — Mixer UI
- `components/SessionView/` — Ableton-style session view
- `hooks/` — `useClaudeAgent`, `useAudioEngine`, `useMIDI`
- `stores/` — Zustand stores: `projectStore`, `authStore`, `agentStore`

### Native Modules (`electron/native/`)

- `vst3-host.cc` — C++ VST3 wrapper (node-addon-api)
- `asio-driver.cc` — Low-latency audio I/O

## Auth Flow

OAuth 2.0 with PKCE — no API keys stored in the app. Tokens encrypted via Electron `safeStorage`. Custom protocol `rach://oauth/callback` as redirect URI. Requires registering an OAuth app in Anthropic Console with scopes: `model.opus`, `model.sonnet`, `agent.execute`.

## Environment Variables

```bash
# .env.local (never committed)
ANTHROPIC_CLIENT_ID=your_client_id
ANTHROPIC_REDIRECT_URI=rach://oauth/callback
ANTHROPIC_AUTH_ENDPOINT=https://auth.anthropic.com/oauth/authorize
ANTHROPIC_TOKEN_ENDPOINT=https://auth.anthropic.com/oauth/token
```

## Performance Targets

- Claude response: < 2s
- Audio latency: < 10ms
- UI framerate: 60 FPS
- Stem separation: 2-4x realtime

## Build Prerequisites

- Node.js 20.11+ LTS
- pnpm 8.15+
- Python 3.10+ (for ONNX Runtime)
- C++ compiler: MSVC 2022+ (Win), Xcode 15+ (Mac), GCC 11+ (Linux)

## Development Phases

The spec defines a 5-phase roadmap. Phase 1 (Foundation) covers: Vite+Electron+React setup, Anthropic OAuth, Claude Agent SDK, audio engine, MIDI engine, piano roll, timeline, and 5 built-in synths. Refer to `Rach_DAW_Specification.md` § Feature Roadmap for full details.

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #8B0000 | Deep romantic red |
| Secondary | #FFD700 | Elegant gold |
| Accent | #00A8E8 | Modern electric blue |

Typography: Playfair Display (headings), Inter (body).
