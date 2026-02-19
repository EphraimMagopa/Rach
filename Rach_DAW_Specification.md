# Rach - World-Class Beginner-Friendly DAW

**Project Name:** Rach (Inspired by Rachmaninoff)  
**Tagline:** *Your AI Co-Producer for Emotional, Technically Brilliant Music*  
**Target Platform:** Windows, macOS, Linux  
**Core Technology:** Electron + Vite + React + TypeScript  
**AI Provider:** Anthropic Claude (Agent SDK + OAuth)  
**Version:** 1.0.0  
**Last Updated:** February 17, 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Anthropic Integration Architecture](#anthropic-integration-architecture)
4. [Core Features](#core-features)
5. [AI-Powered Stem Separation](#ai-powered-stem-separation)
6. [Claude Agent Implementation](#claude-agent-implementation)
7. [Architecture Overview](#architecture-overview)
8. [Development Setup](#development-setup)
9. [Feature Roadmap](#feature-roadmap)
10. [Competitive Analysis](#competitive-analysis)
11. [User Experience Design](#user-experience-design)
12. [Technical Specifications](#technical-specifications)

---

## Executive Summary

**Rach** is a next-generation Digital Audio Workstation (DAW) named after the legendary composer Sergei Rachmaninoff—known for creating deeply emotional, technically brilliant music. Like its namesake, Rach combines artistic sensitivity with technical mastery, making professional music production accessible to everyone, regardless of musical education.

Built on Electron with Vite for optimal performance, Rach features breakthrough AI-powered capabilities through Anthropic's Claude models via their Agent SDK and OAuth authentication.

### Why "Rach"?

Sergei Rachmaninoff (1873-1943) was:
- A virtuoso pianist with extraordinary technical skill
- A composer of profoundly emotional, romantic music
- Known for making complex music feel accessible and human
- A perfectionist who balanced artistry with precision

**Rach the DAW embodies these same principles:**
- Technical excellence made simple
- AI that understands musical emotion
- Professional results for everyone
- Human-centered design

### Key Differentiators

- **AI-First Architecture**: Claude agents for creative assistance, stem separation, mixing, and musical understanding
- **OAuth Security**: Secure user authentication via Anthropic OAuth (no API keys stored in app)
- **Zero Learning Curve**: Production-ready in under 1 hour with Claude as your AI co-producer
- **Cross-Platform**: Native experience on Windows, macOS, and Linux
- **Modern Architecture**: Vite + React for instant hot-reload development
- **Professional Quality**: Compete directly with $500+ DAWs

---

## Technology Stack

### Frontend Framework

```json
{
  "framework": "React 18.3+",
  "language": "TypeScript 5.4+",
  "buildTool": "Vite 5.1+",
  "styling": "Tailwind CSS 3.4+",
  "uiComponents": "Radix UI + shadcn/ui",
  "stateManagement": "Zustand 4.5+",
  "routing": "React Router 6.22+"
}
```

### Electron Configuration

```json
{
  "electron": "29.0+",
  "electronBuilder": "24.13+",
  "electronVite": "2.0+",
  "nodeVersion": "20 LTS",
  "architecture": ["x64", "arm64"]
}
```

### Audio Engine

```javascript
{
  "webAudio": "Web Audio API (AudioContext, AudioWorklet)",
  "midiEngine": "Web MIDI API + @tonejs/midi",
  "audioProcessing": "Tone.js 14.8+ (enhanced)",
  "wasmModules": "AssemblyScript for DSP",
  "nativeModules": "node-addon-api for VST3 hosting",
  "sampleRate": [44100, 48000, 96000],
  "bitDepth": [16, 24, 32]
}
```

### AI & Machine Learning

```json
{
  "anthropicSDK": "@anthropic-ai/sdk 0.27+",
  "anthropicAgentSDK": "@anthropic-ai/agent-sdk 1.0+",
  "authentication": "Anthropic OAuth 2.0",
  "models": {
    "primary": "claude-opus-4-20250514",
    "fast": "claude-sonnet-4-20250514",
    "budget": "claude-haiku-4-20250507"
  },
  "stemSeparation": "Demucs v4 (Meta AI) via ONNX Runtime",
  "alternativeModel": "Spleeter (Deezer) as fallback",
  "inferenceEngine": "ONNX Runtime Web + Native",
  "chordDetection": "Essentia.js + Chord-ai models",
  "drumGeneration": "Claude + Magenta.js"
}
```

### Database & Storage

```json
{
  "localDatabase": "better-sqlite3 (embedded)",
  "projectFormat": "JSON + SQLite hybrid",
  "cloudSync": "Supabase (optional)",
  "userAuth": "Anthropic OAuth tokens (encrypted storage)",
  "sampleLibrary": "IndexedDB for metadata",
  "caching": "LRU cache for waveforms/spectrograms"
}
```

---

## Anthropic Integration Architecture

### OAuth 2.0 Authentication Flow

```typescript
// electron/services/AnthropicAuthService.ts
import { BrowserWindow, shell } from 'electron';
import { randomBytes } from 'crypto';

interface AnthropicOAuthConfig {
  clientId: string;              // From Anthropic Console
  redirectUri: string;           // e.g., 'rach://oauth/callback'
  authEndpoint: string;          // Anthropic OAuth endpoint
  tokenEndpoint: string;         // Token exchange endpoint
  scopes: string[];              // ['model.opus', 'model.sonnet', 'agent.execute']
}

class AnthropicAuthService {
  private config: AnthropicOAuthConfig;
  private authWindow: BrowserWindow | null = null;

  constructor(config: AnthropicOAuthConfig) {
    this.config = config;
  }

  /**
   * Initiate OAuth flow
   * Opens browser window for user authentication
   */
  async authenticate(): Promise<OAuthTokens> {
    // Generate PKCE challenge
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateState();

    // Build authorization URL
    const authUrl = new URL(this.config.authEndpoint);
    authUrl.searchParams.set('client_id', this.config.clientId);
    authUrl.searchParams.set('redirect_uri', this.config.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', this.config.scopes.join(' '));
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    // Open OAuth window
    return new Promise((resolve, reject) => {
      this.authWindow = new BrowserWindow({
        width: 600,
        height: 800,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      // Handle redirect callback
      this.authWindow.webContents.on('will-redirect', async (event, url) => {
        if (url.startsWith(this.config.redirectUri)) {
          event.preventDefault();

          const callbackUrl = new URL(url);
          const code = callbackUrl.searchParams.get('code');
          const returnedState = callbackUrl.searchParams.get('state');

          // Verify state to prevent CSRF
          if (returnedState !== state) {
            reject(new Error('State mismatch - potential CSRF attack'));
            this.authWindow?.close();
            return;
          }

          if (code) {
            try {
              // Exchange code for tokens
              const tokens = await this.exchangeCodeForTokens(code, codeVerifier);

              // Store tokens securely
              await this.securelyStoreTokens(tokens);

              this.authWindow?.close();
              resolve(tokens);
            } catch (error) {
              reject(error);
              this.authWindow?.close();
            }
          } else {
            reject(new Error('No authorization code received'));
            this.authWindow?.close();
          }
        }
      });

      this.authWindow.on('ready-to-show', () => {
        this.authWindow?.show();
      });

      this.authWindow.loadURL(authUrl.toString());
    });
  }

  /**
   * Exchange authorization code for access/refresh tokens
   */
  private async exchangeCodeForTokens(
    code: string, 
    codeVerifier: string
  ): Promise<OAuthTokens> {
    const response = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        code,
        code_verifier: codeVerifier,
        redirect_uri: this.config.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
      obtainedAt: Date.now()
    };
  }

  /**
   * Refresh expired access token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const response = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
      obtainedAt: Date.now()
    };
  }

  /**
   * Check if token is expired or about to expire
   */
  isTokenExpired(tokens: OAuthTokens): boolean {
    const now = Date.now();
    const expiresAt = tokens.obtainedAt + (tokens.expiresIn * 1000);
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    return now >= (expiresAt - bufferTime);
  }

  /**
   * Securely store tokens using system keychain
   */
  private async securelyStoreTokens(tokens: OAuthTokens): Promise<void> {
    const safeStorage = await import('electron').then(m => m.safeStorage);

    const encryptedTokens = safeStorage.encryptString(JSON.stringify(tokens));

    // Store in user data directory
    const { app } = await import('electron');
    const fs = await import('fs/promises');
    const path = await import('path');

    const tokenPath = path.join(app.getPath('userData'), 'anthropic_tokens.enc');
    await fs.writeFile(tokenPath, encryptedTokens);
  }

  /**
   * Retrieve stored tokens
   */
  async getStoredTokens(): Promise<OAuthTokens | null> {
    try {
      const { app, safeStorage } = await import('electron');
      const fs = await import('fs/promises');
      const path = await import('path');

      const tokenPath = path.join(app.getPath('userData'), 'anthropic_tokens.enc');
      const encryptedTokens = await fs.readFile(tokenPath);

      const decryptedString = safeStorage.decryptString(encryptedTokens);
      const tokens = JSON.parse(decryptedString) as OAuthTokens;

      // Auto-refresh if expired
      if (this.isTokenExpired(tokens)) {
        const newTokens = await this.refreshAccessToken(tokens.refreshToken);
        await this.securelyStoreTokens(newTokens);
        return newTokens;
      }

      return tokens;
    } catch (error) {
      return null;
    }
  }

  /**
   * PKCE helper methods
   */
  private generateCodeVerifier(): string {
    return randomBytes(32).toString('base64url');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(verifier).digest();
    return Buffer.from(hash).toString('base64url');
  }

  private generateState(): string {
    return randomBytes(16).toString('base64url');
  }

  /**
   * Logout - clear stored tokens
   */
  async logout(): Promise<void> {
    const { app } = await import('electron');
    const fs = await import('fs/promises');
    const path = await import('path');

    const tokenPath = path.join(app.getPath('userData'), 'anthropic_tokens.enc');

    try {
      await fs.unlink(tokenPath);
    } catch (error) {
      // Token file doesn't exist, already logged out
    }
  }
}

interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;        // Seconds until expiry
  tokenType: string;        // 'Bearer'
  scope: string;
  obtainedAt: number;       // Timestamp when token was obtained
}

export default AnthropicAuthService;
```

### Claude Agent SDK Integration

```typescript
// electron/services/ClaudeAgentService.ts
import Anthropic from '@anthropic-ai/sdk';
import { Agent, Tool } from '@anthropic-ai/agent-sdk';
import AnthropicAuthService from './AnthropicAuthService';

/**
 * Claude Agent Service for Rach DAW
 * Manages AI agents for mixing, composition, arrangement, and analysis
 */
class ClaudeAgentService {
  private authService: AnthropicAuthService;
  private client: Anthropic | null = null;

  // Specialized agents for different tasks
  private mixingAgent: Agent | null = null;
  private compositionAgent: Agent | null = null;
  private arrangementAgent: Agent | null = null;
  private analysisAgent: Agent | null = null;

  constructor(authService: AnthropicAuthService) {
    this.authService = authService;
  }

  /**
   * Initialize Anthropic client with OAuth token
   */
  async initialize(): Promise<void> {
    const tokens = await this.authService.getStoredTokens();

    if (!tokens) {
      throw new Error('User not authenticated. Please login first.');
    }

    // Initialize Anthropic client with OAuth access token
    this.client = new Anthropic({
      apiKey: tokens.accessToken,  // OAuth token instead of API key
      authType: 'oauth'             // Specify OAuth authentication
    });

    // Initialize specialized agents
    await this.initializeAgents();
  }

  /**
   * Initialize specialized Claude agents with tools
   */
  private async initializeAgents(): Promise<void> {
    if (!this.client) throw new Error('Client not initialized');

    // Mixing Agent - helps with EQ, compression, levels, panning
    this.mixingAgent = new Agent({
      client: this.client,
      model: 'claude-opus-4-20250514',
      systemPrompt: `You are an expert audio mixing engineer with 20+ years of experience,
                     working in Rach DAW (named after Rachmaninoff - emotional + technical brilliance).

                     You help users mix their music by analyzing tracks and suggesting:
                     - EQ settings (frequency cuts/boosts)
                     - Compression ratios, thresholds, and attack/release times
                     - Level balancing and gain staging
                     - Panning positions for stereo width
                     - Reverb/delay send levels

                     Like Rachmaninoff's music, your mixes should be:
                     - Emotionally impactful
                     - Technically precise
                     - Balanced yet dynamic

                     You provide specific numeric values, not vague suggestions.`,
      tools: this.getMixingTools(),
      maxIterations: 10
    });

    // Composition Agent - helps with chords, melodies, harmonies
    this.compositionAgent = new Agent({
      client: this.client,
      model: 'claude-opus-4-20250514',
      systemPrompt: `You are a professional music composer and music theory expert in Rach DAW.

                     Like Sergei Rachmaninoff, you create:
                     - Deeply emotional chord progressions
                     - Memorable melodies with clear structure
                     - Rich harmonies and counter-melodies
                     - Powerful basslines that drive the music

                     You help users create musical content by:
                     - Suggesting chord progressions in any key/scale
                     - Generating melodies that fit over chord changes
                     - Creating counter-melodies and harmonies
                     - Proposing basslines that complement the harmony
                     - Recommending song structures (verse, chorus, bridge, etc.)

                     You understand all musical genres and adapt suggestions accordingly.`,
      tools: this.getCompositionTools(),
      maxIterations: 10
    });

    // Arrangement Agent - helps with song structure and production
    this.arrangementAgent = new Agent({
      client: this.client,
      model: 'claude-sonnet-4-20250514',  // Faster model for arrangement
      systemPrompt: `You are a music producer specializing in arrangement and song structure in Rach DAW.

                     You help users build compelling arrangements by:
                     - Suggesting which instruments should play in each section
                     - Recommending transitions between sections
                     - Advising on dynamics (builds, drops, breakdowns)
                     - Proposing automation ideas (filter sweeps, volume fades)
                     - Identifying what's missing in the arrangement

                     You think about energy, tension, and listener engagement.
                     Like Rachmaninoff's compositions, you create:
                     - Clear structure with emotional arc
                     - Dramatic builds and releases
                     - Perfect balance of repetition and variation`,
      tools: this.getArrangementTools(),
      maxIterations: 8
    });

    // Analysis Agent - analyzes existing tracks/projects
    this.analysisAgent = new Agent({
      client: this.client,
      model: 'claude-sonnet-4-20250514',
      systemPrompt: `You are a music analyst and producer who provides detailed feedback in Rach DAW.

                     You analyze audio projects and provide insights on:
                     - Overall frequency balance (too much bass, lacking highs, etc.)
                     - Dynamic range and loudness
                     - Stereo width and spatial characteristics
                     - Potential masking issues between instruments
                     - Genre-specific production standards

                     You give constructive, actionable feedback that helps users improve.`,
      tools: this.getAnalysisTools(),
      maxIterations: 5
    });
  }

  /**
   * Define tools for mixing agent
   */
  private getMixingTools(): Tool[] {
    return [
      {
        name: 'apply_eq',
        description: 'Apply EQ to a track with specific frequency adjustments',
        input_schema: {
          type: 'object',
          properties: {
            track_id: { type: 'string', description: 'Track identifier' },
            bands: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  frequency: { type: 'number', description: 'Frequency in Hz' },
                  gain: { type: 'number', description: 'Gain in dB' },
                  q: { type: 'number', description: 'Q factor (bandwidth)' },
                  type: { 
                    type: 'string', 
                    enum: ['bell', 'low_shelf', 'high_shelf', 'low_pass', 'high_pass'] 
                  }
                }
              }
            }
          },
          required: ['track_id', 'bands']
        },
        function: async (input) => {
          // Implementation handled by Rach DAW engine
          return { success: true, applied_bands: input.bands };
        }
      },
      {
        name: 'apply_compression',
        description: 'Apply compression to a track',
        input_schema: {
          type: 'object',
          properties: {
            track_id: { type: 'string' },
            threshold: { type: 'number', description: 'Threshold in dB' },
            ratio: { type: 'number', description: 'Compression ratio (e.g., 4 for 4:1)' },
            attack: { type: 'number', description: 'Attack time in milliseconds' },
            release: { type: 'number', description: 'Release time in milliseconds' },
            knee: { type: 'number', description: 'Knee width in dB' },
            makeup_gain: { type: 'number', description: 'Makeup gain in dB' }
          },
          required: ['track_id', 'threshold', 'ratio', 'attack', 'release']
        },
        function: async (input) => {
          return { success: true, settings: input };
        }
      },
      {
        name: 'set_track_level',
        description: 'Set the volume level of a track',
        input_schema: {
          type: 'object',
          properties: {
            track_id: { type: 'string' },
            level_db: { type: 'number', description: 'Level in dB (-inf to +12)' }
          },
          required: ['track_id', 'level_db']
        },
        function: async (input) => {
          return { success: true, new_level: input.level_db };
        }
      },
      {
        name: 'set_track_pan',
        description: 'Set the pan position of a track',
        input_schema: {
          type: 'object',
          properties: {
            track_id: { type: 'string' },
            pan: { type: 'number', description: 'Pan position (-1.0 left to +1.0 right)' }
          },
          required: ['track_id', 'pan']
        },
        function: async (input) => {
          return { success: true, new_pan: input.pan };
        }
      },
      {
        name: 'analyze_frequency_spectrum',
        description: 'Analyze the frequency spectrum of a track or master bus',
        input_schema: {
          type: 'object',
          properties: {
            track_id: { type: 'string', description: 'Track ID or "master" for master bus' }
          },
          required: ['track_id']
        },
        function: async (input) => {
          // Return frequency analysis from Rach engine
          return {
            spectrum: {
              sub_bass: { energy: 0.65, peak_freq: 60 },
              bass: { energy: 0.75, peak_freq: 120 },
              low_mids: { energy: 0.55, peak_freq: 400 },
              mids: { energy: 0.60, peak_freq: 1200 },
              high_mids: { energy: 0.50, peak_freq: 3500 },
              presence: { energy: 0.45, peak_freq: 7000 },
              brilliance: { energy: 0.35, peak_freq: 12000 }
            }
          };
        }
      }
    ];
  }

  /**
   * Define tools for composition agent
   */
  private getCompositionTools(): Tool[] {
    return [
      {
        name: 'generate_chord_progression',
        description: 'Generate a chord progression in a specific key and style',
        input_schema: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Musical key (e.g., "C", "Dm", "F#")' },
            scale: { 
              type: 'string', 
              enum: ['major', 'minor', 'dorian', 'mixolydian', 'phrygian'],
              description: 'Scale/mode'
            },
            bars: { type: 'number', description: 'Number of bars (typically 4, 8, or 16)' },
            style: { 
              type: 'string',
              description: 'Musical style (e.g., "romantic", "jazz", "edm", "classical")'
            }
          },
          required: ['key', 'scale', 'bars']
        },
        function: async (input) => {
          // Return chord progression
          return {
            progression: ['Cmaj7', 'Am7', 'Fmaj7', 'G7'],
            midi_notes: [
              { bar: 0, notes: [60, 64, 67, 71] },  // Cmaj7
              { bar: 1, notes: [57, 60, 64, 69] },  // Am7
              { bar: 2, notes: [53, 57, 60, 64] },  // Fmaj7
              { bar: 3, notes: [55, 59, 62, 65] }   // G7
            ]
          };
        }
      },
      {
        name: 'create_midi_track',
        description: 'Create a new MIDI track with notes',
        input_schema: {
          type: 'object',
          properties: {
            track_name: { type: 'string' },
            instrument: { type: 'string', description: 'Instrument to use' },
            notes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pitch: { type: 'number', description: 'MIDI pitch (0-127)' },
                  start: { type: 'number', description: 'Start time in beats' },
                  duration: { type: 'number', description: 'Duration in beats' },
                  velocity: { type: 'number', description: 'Velocity (0-127)' }
                }
              }
            }
          },
          required: ['track_name', 'notes']
        },
        function: async (input) => {
          return { success: true, track_id: 'track_' + Date.now() };
        }
      },
      {
        name: 'detect_key_and_scale',
        description: 'Detect the musical key and scale of existing MIDI or audio',
        input_schema: {
          type: 'object',
          properties: {
            track_id: { type: 'string' }
          },
          required: ['track_id']
        },
        function: async (input) => {
          return {
            key: 'C',
            scale: 'major',
            confidence: 0.92
          };
        }
      }
    ];
  }

  /**
   * Define tools for arrangement agent
   */
  private getArrangementTools(): Tool[] {
    return [
      {
        name: 'create_song_section',
        description: 'Create or modify a song section (verse, chorus, etc.)',
        input_schema: {
          type: 'object',
          properties: {
            section_type: {
              type: 'string',
              enum: ['intro', 'verse', 'pre_chorus', 'chorus', 'bridge', 'outro', 'breakdown']
            },
            start_bar: { type: 'number' },
            length_bars: { type: 'number' },
            active_tracks: {
              type: 'array',
              items: { type: 'string' },
              description: 'Track IDs that should play in this section'
            }
          },
          required: ['section_type', 'start_bar', 'length_bars']
        },
        function: async (input) => {
          return { success: true, section_id: 'section_' + Date.now() };
        }
      }
    ];
  }

  /**
   * Define tools for analysis agent
   */
  private getAnalysisTools(): Tool[] {
    return [
      {
        name: 'analyze_project_mix',
        description: 'Analyze overall mix balance of the project',
        input_schema: {
          type: 'object',
          properties: {
            analyze_masking: { type: 'boolean', description: 'Check for frequency masking' },
            analyze_dynamics: { type: 'boolean', description: 'Analyze dynamic range' },
            analyze_stereo: { type: 'boolean', description: 'Analyze stereo width' }
          }
        },
        function: async (input) => {
          return {
            frequency_balance: {
              bass_heavy: true,
              midrange_clarity: 'poor',
              high_end: 'adequate'
            },
            dynamics: {
              peak_db: -3.2,
              rms_db: -12.5,
              dynamic_range_db: 9.3,
              assessment: 'moderately compressed'
            },
            stereo: {
              width_score: 0.72,
              mono_compatibility: 'good',
              phase_issues: false
            },
            masking_issues: [
              {
                track1: 'Bass',
                track2: 'Kick',
                frequency_range: '60-120 Hz',
                severity: 'moderate'
              }
            ]
          };
        }
      }
    ];
  }

  /**
   * Chat with mixing assistant
   */
  async chatWithMixingAgent(message: string, context?: ProjectContext): Promise<string> {
    if (!this.mixingAgent) {
      await this.initialize();
    }

    const response = await this.mixingAgent!.chat(message, {
      context: context ? JSON.stringify(context) : undefined
    });

    return response.content;
  }

  /**
   * Chat with composition assistant
   */
  async chatWithCompositionAgent(message: string, context?: ProjectContext): Promise<string> {
    if (!this.compositionAgent) {
      await this.initialize();
    }

    const response = await this.compositionAgent!.chat(message, {
      context: context ? JSON.stringify(context) : undefined
    });

    return response.content;
  }

  /**
   * Get mixing suggestions for entire project
   */
  async analyzeMix(projectData: ProjectContext): Promise<MixAnalysis> {
    if (!this.mixingAgent) {
      await this.initialize();
    }

    const prompt = `Analyze this Rach project and provide detailed mixing suggestions:

Project Info:
- Tracks: ${projectData.tracks.length}
- Genre: ${projectData.genre || 'unknown'}
- Tempo: ${projectData.tempo} BPM

Track List:
${projectData.tracks.map((t, i) => `${i + 1}. ${t.name} (${t.type})`).join('\n')}

Please analyze and suggest:
1. EQ adjustments for each track
2. Compression settings where needed
3. Level balancing recommendations
4. Panning suggestions for stereo width
5. Any masking issues between tracks`;

    const response = await this.mixingAgent!.chat(prompt);

    return {
      overall_assessment: response.content,
      track_suggestions: []
    };
  }

  /**
   * Generate chord progression
   */
  async generateChordProgression(
    key: string, 
    scale: string, 
    bars: number, 
    style?: string
  ): Promise<ChordProgression> {
    if (!this.compositionAgent) {
      await this.initialize();
    }

    const prompt = `Generate a ${bars}-bar chord progression in ${key} ${scale}.
    ${style ? `Style: ${style}` : 'Romantic style like Rachmaninoff'}

Provide:
1. Chord names (with extensions like 7th, 9th if appropriate)
2. Roman numeral analysis
3. MIDI note numbers for each chord
4. Brief explanation of why this progression works emotionally`;

    const response = await this.compositionAgent!.chat(prompt);

    return {
      chords: ['Cmaj7', 'Am7', 'Fmaj7', 'G7'],
      explanation: response.content
    };
  }
}

// Type definitions
interface ProjectContext {
  tempo: number;
  time_signature: [number, number];
  key?: string;
  genre?: string;
  tracks: Array<{
    id: string;
    name: string;
    type: 'audio' | 'midi';
    volume_db: number;
    pan: number;
    muted: boolean;
    soloed: boolean;
  }>;
}

interface MixAnalysis {
  overall_assessment: string;
  track_suggestions: Array<{
    track_id: string;
    eq_suggestions?: any;
    compression_suggestions?: any;
    level_adjustment?: number;
    pan_suggestion?: number;
  }>;
}

interface ChordProgression {
  chords: string[];
  explanation: string;
}

export default ClaudeAgentService;
```

---

## Core Features

### 1. Multi-Track Audio/MIDI Editor

- **Unlimited tracks** (hardware-limited)
- **Non-destructive editing** with unlimited undo
- **Elastic audio** (time-stretch without pitch change)
- **Pitch correction** (formant-preserving)
- **Audio comping** for perfect takes
- **Piano roll editor** with velocity lanes
- **Step sequencer** (FL Studio-style)
- **Waveform zoom** to sample level

### 2. Claude-Powered Creative Tools

#### Mixing Assistant
Natural language mixing:
- **"Make my vocals clearer"** → Claude applies de-esser + EQ boost at 3kHz
- **"This mix sounds muddy"** → Claude identifies frequency masking and fixes it
- **"How should I compress my drums?"** → Claude suggests and applies settings

#### Composition Assistant
Creative generation:
- **"Generate a sad chord progression in Dm"** → Creates emotional progression
- **"Add a melody over these chords"** → Generates fitting melody
- **"What bass notes work here?"** → Suggests bassline
- **"Create a Rachmaninoff-style progression"** → Romantic, lush chords

#### Arrangement Assistant
Structure guidance:
- **"Which instruments for the chorus?"** → Suggests arrangement
- **"How do I build tension?"** → Recommends automation and dynamics
- **"Create an emotional arc"** → Structures song like Rachmaninoff's works

#### Mix Analysis
One-click analysis:
- Frequency balance assessment
- Dynamic range evaluation
- Stereo width check
- Masking detection
- Genre-specific feedback

### 3. Built-In Instruments (10+ Virtual Instruments)

#### Synthesizers
1. **RachSynth** - Lush pad synthesizer (Rachmaninoff-inspired warmth)
2. **SubtractiveSynth** - Classic analog-style
3. **WavetableSynth** - Modern wavetable (Serum-inspired)
4. **FM Synth** - 4-operator FM synthesis
5. **GranularSynth** - Textural granular synthesis

#### Samplers & Pianos
6. **Concert Grand** - Sampled grand piano (emotional, like Rachmaninoff played)
7. **DrumSampler** - 16-pad drum machine
8. **Multisample Keyboard** - Chromatic sampler
9. **Electric Piano** - Rhodes/Wurlitzer emulation
10. **Hammond Organ** - B3 organ

### 4. Effects Suite (20+ Professional Effects)

#### Dynamics
- Compressor (VCA, FET, Optical)
- Limiter
- Gate/Expander
- Multiband Compressor
- Transient Shaper

#### EQ & Filters
- Parametric EQ (8-band)
- Graphic EQ (31-band)
- High/Low Pass Filters
- Formant Filter

#### Time-Based
- Reverb (Algorithmic + Convolution)
- Delay (Ping-Pong, Tape, Analog)
- Chorus/Flanger/Phaser

#### Creative
- Vocoder
- Pitch Shifter
- Auto-Pan
- Spectral Processing

### 5. VST3/AU Plugin Hosting

- Full VST3 support (Windows/macOS/Linux)
- Audio Unit support (macOS)
- Plugin sandboxing (crash protection)
- Automatic latency compensation
- Preset management

---

## AI-Powered Stem Separation

### Integration with Suno & Other Sources

Rach can import songs from:
- **Suno AI** (paste URL or drag audio file)
- **YouTube downloads**
- **Spotify local files**
- **Any audio file** (MP3, WAV, FLAC, OGG)

### Stem Separation Workflow

1. **Import Audio**
   - Drag & drop or paste Suno link
   - Select quality (Fast/Balanced/High)
   - Choose 4-stem or 6-stem separation

2. **Processing**
   - Demucs v4 separates audio
   - Real-time progress bar
   - 2-4x realtime processing speed

3. **Auto-Track Creation**
   - **Vocals** track (with de-esser + reverb)
   - **Drums** track (with transient shaper)
   - **Bass** track (with sub-harmonic generator)
   - **Other** track (keys, guitars, synths)

4. **Claude Analysis**
   - Ask Claude: "How can I remix this?"
   - Claude suggests creative ideas:
     - Pitch vocals up 3 semitones
     - Add trap drums under original
     - Create breakdown with just vocals
     - Apply sidechain to bass

### Stem Quality

- **SDR**: 8.5+ dB (state-of-the-art)
- **Formats**: WAV, FLAC output
- **GPU Acceleration**: CUDA/Metal support
- **Batch Processing**: Separate multiple songs

---

## Architecture Overview

### Project Structure

```
rach-daw/
├── electron/
│   ├── main.ts                          # Electron main process
│   ├── preload.ts                       # IPC bridge
│   ├── services/
│   │   ├── AnthropicAuthService.ts      # OAuth implementation
│   │   ├── ClaudeAgentService.ts        # Agent SDK integration
│   │   ├── AudioEngine.ts               # Core audio
│   │   ├── MIDIEngine.ts                # MIDI sequencing
│   │   ├── PluginHost.ts                # VST3/AU hosting
│   │   └── StemSeparator.ts             # Demucs integration
│   └── native/
│       ├── vst3-host.cc                 # C++ VST3 wrapper
│       └── asio-driver.cc               # Low-latency I/O
├── src/
│   ├── main.tsx                         # React entry
│   ├── App.tsx                          # Root component
│   ├── components/
│   │   ├── AI/
│   │   │   ├── ClaudeAssistant.tsx      # Chat interface
│   │   │   ├── MixAnalyzer.tsx          # Mix analysis UI
│   │   │   ├── ChordGenerator.tsx       # Chord UI
│   │   │   └── LoginScreen.tsx          # OAuth login
│   │   ├── Timeline/
│   │   ├── PianoRoll/
│   │   ├── Mixer/
│   │   └── SessionView/
│   ├── hooks/
│   │   ├── useClaudeAgent.ts            # Claude hook
│   │   ├── useAudioEngine.ts
│   │   └── useMIDI.ts
│   └── stores/
│       ├── projectStore.ts
│       ├── authStore.ts                 # Anthropic auth
│       └── agentStore.ts                # Agent conversations
├── resources/
│   ├── models/
│   │   ├── demucs_v4_hq.onnx
│   │   └── spleeter_4stems.onnx
│   ├── instruments/
│   │   └── RachGrandPiano/            # Sampled grand piano
│   └── templates/
│       └── Romantic_Piano_Ballad.rach
├── package.json
├── vite.config.ts
├── electron.vite.config.ts
└── README.md
```

---

## Development Setup

### Prerequisites

```bash
Node.js: 20.11+ LTS
pnpm: 8.15+
Python: 3.10+ (for ONNX Runtime)
C++ Compiler: MSVC 2022+ (Win), Xcode 15+ (Mac), GCC 11+ (Linux)
```

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/rach-daw.git
cd rach-daw

# Install dependencies
pnpm install

# Download AI models
pnpm run download-models

# Build native modules
pnpm run build:native

# Start development
pnpm dev
```

### Register OAuth App with Anthropic

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Create OAuth Application:
   - **Name**: Rach DAW
   - **Redirect URI**: `rach://oauth/callback`
   - **Scopes**: `model.opus`, `model.sonnet`, `agent.execute`
3. Copy Client ID to `.env.local`

### Environment Variables

```bash
# .env.local (NOT committed to git)
ANTHROPIC_CLIENT_ID=your_client_id
ANTHROPIC_REDIRECT_URI=rach://oauth/callback
ANTHROPIC_AUTH_ENDPOINT=https://auth.anthropic.com/oauth/authorize
ANTHROPIC_TOKEN_ENDPOINT=https://auth.anthropic.com/oauth/token
```

---

## Feature Roadmap

### Phase 1: Foundation (Months 1-4)
- ✅ Vite + Electron + React setup
- ✅ Anthropic OAuth integration
- ✅ Claude Agent SDK integration
- ✅ Audio engine (Web Audio API)
- ✅ MIDI engine + piano roll
- ✅ Timeline & track management
- ✅ 5 built-in synths + RachSynth

### Phase 2: Professional Features (Months 5-8)
- ✅ VST3/AU plugin hosting (C++ N-API module, IPC bridge, plugin browser UI)
- ✅ Advanced automation with curves (linear/exponential/step interpolation, automation lanes, recording)
- ✅ Session view (Ableton-style clip launcher with quantized triggering, scene launching)
- ✅ 24 professional effects (dynamics, EQ/filters, time-based, creative) with effect chain engine
- ✅ Mixer with routing (aux sends/returns, bus tracks, routing matrix, pre/post-fader sends)

### Phase 3: AI Features (Months 9-10)
- [ ] Demucs stem separation
- [ ] Suno import integration
- [ ] Claude mixing agent operational
- [ ] Claude composition agent
- [ ] One-click mix analysis

### Phase 4: Polish & Beta (Months 11-12)
- [ ] Interactive tutorial with Claude
- [ ] 50+ project templates (including Romantic Piano Ballad)
- [ ] Beta testing with 500+ users
- [ ] Performance optimization
- [ ] Video tutorials

### Phase 5: Launch (Month 13)
- [ ] Public release
- [ ] Marketing campaign
- [ ] Community Discord
- [ ] First expansion pack

---

## Competitive Analysis

| Feature | Rach | Ableton Live 12 | FL Studio 2025 | Logic Pro 11 |
|---------|------|-----------------|----------------|--------------|
| **AI Assistant** | ✅ Claude Agents | ❌ | ❌ | ❌ |
| **Natural Language Control** | ✅ "Make vocals clearer" | ❌ | ❌ | ❌ |
| **Emotional + Technical** | ✅ Rachmaninoff philosophy | ❌ | ❌ | ❌ |
| **Stem Separation** | ✅ Built-in (Demucs) | ❌ | ❌ | ❌ |
| **Suno Import** | ✅ Direct integration | ❌ | ❌ | ❌ |
| **OAuth Security** | ✅ Anthropic | N/A | N/A | N/A |
| **Cross-Platform** | ✅ Win/Mac/Linux | ✅ Win/Mac | ✅ Win/Mac | ❌ Mac only |
| **Price** | $0-399 | $599-849 | $199 | $199 |
| **Beginner-Friendly** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### Unique Selling Points

1. **Named After Rachmaninoff** - Emotional + technical brilliance
2. **Claude Co-Producer** - Only DAW with conversational AI
3. **Natural Language Mixing** - "Make it punchier" instead of manual tweaking
4. **Built-In Stem Separation** - Import Suno songs, separate instantly
5. **Beginner to Pro** - Zero learning curve to professional results

---

## User Experience Design

### Brand Identity

**Logo**: Stylized "R" with piano keys morphing into waveform
**Colors**: 
- Primary: Deep romantic red (#8B0000)
- Secondary: Elegant gold (#FFD700)
- Accent: Modern electric blue (#00A8E8)

**Typography**:
- Headings: Playfair Display (elegant, classical)
- Body: Inter (modern, readable)

### First-Time Experience

```
┌─────────────────────────────────────────┐
│                                         │
│             🎹 Welcome to Rach          │
│                                         │
│   Your AI Co-Producer for Emotional,   │
│    Technically Brilliant Music         │
│                                         │
│   Inspired by Sergei Rachmaninoff:     │
│   • Deeply emotional compositions      │
│   • Technical virtuosity               │
│   • Accessible to all                  │
│                                         │
│   [Sign in with Anthropic] [Try Free]  │
│                                         │
└─────────────────────────────────────────┘
```

### Claude Assistant Interface

```
┌─────────────────────────────────────────────┐
│  🎹 Claude AI Co-Producer           [⚙️][−] │
├─────────────────────────────────────────────┤
│  [Mixing] [Composition] [Arrangement]      │
├─────────────────────────────────────────────┤
│                                             │
│  You: Create a sad chord progression       │
│                                             │
│  Claude: I'll create a Rachmaninoff-style  │
│  progression in D minor with rich          │
│  harmonies that evoke melancholy:          │
│                                             │
│  Dm → Bb → Gm → A7                        │
│                                             │
│  This progression uses:                    │
│  • Minor tonic for sadness                 │
│  • bVI chord for unexpected color          │
│  • Subdominant for gentle pull            │
│  • Dominant 7th for tension               │
│                                             │
│  [Create MIDI Track] [Hear Preview]        │
│                                             │
├─────────────────────────────────────────────┤
│ Ask Claude anything...          [Send ➤]   │
└─────────────────────────────────────────────┘
```

---

## Technical Specifications

### System Requirements

#### Minimum
- **OS**: Windows 10, macOS 11, Ubuntu 20.04
- **CPU**: 4-core Intel i5 / Ryzen 5
- **RAM**: 8 GB
- **Storage**: 4 GB
- **Internet**: Required for Claude

#### Recommended
- **OS**: Windows 11, macOS 14, Ubuntu 22.04
- **CPU**: 8-core Intel i7 / Ryzen 7
- **RAM**: 16 GB
- **GPU**: 4GB VRAM (for stem separation)
- **Internet**: 10+ Mbps

### Performance Targets

```typescript
const performance = {
  claude_response: '< 2 seconds',
  audio_latency: '< 10ms',
  ui_framerate: '60 FPS',
  stem_separation: '2-4x realtime',
  oauth_flow: '< 30 seconds'
};
```

---

## Monetization Strategy

### Pricing Tiers

#### Free Tier - "Beginner"
- 8 tracks
- 10 Claude queries/day
- Basic effects
- Watermarked exports
- **$0**

#### Pro Tier - "Virtuoso"
- Unlimited tracks
- Unlimited Claude conversations
- All instruments & effects
- 10 stem separations/month
- VST3 support
- **$199 one-time**

#### Studio Tier - "Maestro"
- Everything in Pro
- Unlimited stem separations
- Priority Claude responses
- Cloud collaboration
- Lifetime updates
- **$399 one-time**

#### Subscription - "Composer"
- All Maestro features
- Early access to new Claude models
- Monthly expansion packs
- 100GB cloud storage
- **$14.99/month**

---

## Marketing Strategy

### Key Messages

1. **"Emotional + Technical Brilliance"** - Like Rachmaninoff
2. **"Your AI Co-Producer"** - Claude understands music
3. **"Make Pro Music Without Music School"**
4. **"Just Ask Claude"** - Natural language control

### Target Audience

- **Primary**: Aspiring producers (18-35) intimidated by traditional DAWs
- **Secondary**: Content creators needing music
- **Tertiary**: Classical music fans wanting to compose digitally

### Launch Campaign

**Tagline**: *"Create Like Rachmaninoff. Produce Like a Pro. Learn Like a Beginner."*

- **Pre-Launch**: Build waitlist with "AI + Rachmaninoff" story
- **Launch**: Product Hunt - "First DAW Named After a Composer"
- **Content**: YouTube series "Making Rachmaninoff-Style Music with AI"
- **Partnerships**: Classical music influencers, music schools

---

## Security & Privacy

### OAuth Token Security
- Tokens encrypted with OS keychain (Electron safeStorage)
- PKCE flow (CSRF protection)
- Automatic refresh before expiry
- No API keys in code

### Data Privacy
- Local-first (projects stored locally)
- Optional cloud sync
- No telemetry (unless opted in)
- Claude conversations ephemeral

---

## Conclusion

**Rach** represents the future of music production: combining the emotional depth and technical brilliance of Rachmaninoff with cutting-edge AI from Anthropic Claude.

Like Sergei Rachmaninoff made complex classical music feel human and accessible, Rach makes professional music production available to everyone—from absolute beginners to seasoned pros.

With Vite's fast development, Electron's cross-platform reach, and Claude's musical intelligence, we're creating the DAW that Rachmaninoff himself would have used.

---

**Project**: Rach DAW  
**Philosophy**: Emotional + Technical Brilliance  
**Inspiration**: Sergei Rachmaninoff  
**Version**: 1.0.0  
**Last Updated**: February 17, 2026  
**License**: Proprietary - Internal Use Only

---

*"Music is enough for a lifetime, but a lifetime is not enough for music."*  
— Sergei Rachmaninoff
