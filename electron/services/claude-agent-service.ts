import Anthropic from '@anthropic-ai/sdk'
import type { AuthService } from './auth-service'
import { ToolExecutor } from './tool-executor'

export type AgentType = 'mixing' | 'composition' | 'arrangement' | 'analysis'

interface AgentConfig {
  model: string
  systemPrompt: string
  tools: Anthropic.Tool[]
}

interface ProjectContext {
  tracks: Array<{
    id: string
    name: string
    type: string
    volume: number
    pan: number
    muted: boolean
    effects: Array<{ type: string; name: string; params: Record<string, number> }>
    sends: Array<{ targetBusId: string; gain: number }>
    clips: Array<{
      id: string
      name: string
      type: string
      startBeat: number
      durationBeats: number
      midiNotes?: Array<{
        pitch: number
        velocity: number
        startBeat: number
        durationBeats: number
      }>
    }>
    frequencyData?: number[]
    peakLevel?: number
    rmsLevel?: number
  }>
  tempo: number
  timeSignature: { numerator: number; denominator: number }
  sections: Array<{ name: string; startBeat: number; durationBeats: number; color: string }>
}

interface Mutation {
  type: string
  [key: string]: unknown
}

interface ToolExecution {
  name: string
  input: unknown
  result: string
}

export interface AgentResponse {
  text: string
  mutations: Mutation[]
  toolExecutions: ToolExecution[]
}

const MAX_LOOP_ITERATIONS = 10

const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  mixing: {
    model: 'claude-opus-4-6',
    systemPrompt: `You are the Rach DAW Mixing Agent. You help users mix their audio projects.
You can adjust EQ, compression, track levels, panning, and analyze frequency spectrums.
Be concise and technical. When the user asks you to make changes, use the available tools.
When referring to tracks, use their exact track ID from the project context.`,
    tools: [
      {
        name: 'apply_eq',
        description: 'Apply EQ to a track with specified frequency bands',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Target track ID' },
            bands: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  frequency: { type: 'number', description: 'Center frequency in Hz' },
                  gain: { type: 'number', description: 'Gain in dB (-12 to +12)' },
                  q: { type: 'number', description: 'Q factor (0.1 to 10)' }
                },
                required: ['frequency', 'gain', 'q']
              }
            }
          },
          required: ['trackId', 'bands']
        }
      },
      {
        name: 'apply_compression',
        description: 'Apply compression to a track',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Target track ID' },
            threshold: { type: 'number', description: 'Threshold in dB' },
            ratio: { type: 'number', description: 'Compression ratio' },
            attack: { type: 'number', description: 'Attack time in ms' },
            release: { type: 'number', description: 'Release time in ms' }
          },
          required: ['trackId', 'threshold', 'ratio']
        }
      },
      {
        name: 'set_track_level',
        description: 'Set the volume level of a track',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Target track ID' },
            level: { type: 'number', description: 'Volume level in dB (-60 to +6)' }
          },
          required: ['trackId', 'level']
        }
      },
      {
        name: 'set_track_pan',
        description: 'Set the pan position of a track',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Target track ID' },
            pan: { type: 'number', description: 'Pan position (-1 left to +1 right)' }
          },
          required: ['trackId', 'pan']
        }
      },
      {
        name: 'analyze_frequency_spectrum',
        description: 'Analyze the frequency spectrum of a track',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Target track ID' }
          },
          required: ['trackId']
        }
      }
    ]
  },
  composition: {
    model: 'claude-opus-4-6',
    systemPrompt: `You are the Rach DAW Composition Agent. You help users compose music.
You can generate chord progressions, create MIDI tracks, and detect musical keys/scales.
Be creative yet technically grounded. Output MIDI note data when creating musical content.
When referring to tracks, use their exact track ID from the project context.`,
    tools: [
      {
        name: 'generate_chord_progression',
        description: 'Generate a chord progression in a given key. Returns chord analysis — use create_midi_track to write the notes to a track.',
        input_schema: {
          type: 'object' as const,
          properties: {
            key: { type: 'string', description: 'Musical key (e.g., "C major", "A minor")' },
            numBars: { type: 'number', description: 'Number of bars' },
            style: { type: 'string', description: 'Style (e.g., "pop", "jazz", "classical", "blues", "rock")' }
          },
          required: ['key', 'numBars']
        }
      },
      {
        name: 'create_midi_track',
        description: 'Create MIDI notes on a track. Creates a clip if none exists at beat 0.',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Target track ID' },
            notes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pitch: { type: 'number', description: 'MIDI pitch (0-127)' },
                  velocity: { type: 'number', description: 'Velocity (0-127)' },
                  startBeat: { type: 'number', description: 'Start position in beats' },
                  durationBeats: { type: 'number', description: 'Duration in beats' }
                },
                required: ['pitch', 'velocity', 'startBeat', 'durationBeats']
              }
            }
          },
          required: ['trackId', 'notes']
        }
      },
      {
        name: 'detect_key_and_scale',
        description: 'Detect the key and scale of existing MIDI content on a track',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Track ID to analyze' }
          },
          required: ['trackId']
        }
      }
    ]
  },
  arrangement: {
    model: 'claude-sonnet-4-6',
    systemPrompt: `You are the Rach DAW Arrangement Agent. You help users arrange songs.
You can create song sections (intro, verse, chorus, bridge, outro) and suggest arrangements.
Be practical and focused on song structure.`,
    tools: [
      {
        name: 'create_song_section',
        description: 'Create a song section marker with name, position, and duration',
        input_schema: {
          type: 'object' as const,
          properties: {
            name: { type: 'string', description: 'Section name (e.g., "Verse 1", "Chorus")' },
            startBeat: { type: 'number', description: 'Start position in beats' },
            durationBeats: { type: 'number', description: 'Duration in beats' },
            color: { type: 'string', description: 'Section color hex code' }
          },
          required: ['name', 'startBeat', 'durationBeats']
        }
      }
    ]
  },
  analysis: {
    model: 'claude-sonnet-4-6',
    systemPrompt: `You are the Rach DAW Analysis Agent. You analyze mixes and projects.
You provide detailed feedback on levels, frequency balance, dynamics, stereo image, and effects.
Be analytical and provide actionable suggestions. Structure your response with clear sections.`,
    tools: [
      {
        name: 'analyze_project_mix',
        description: 'Analyze the overall mix of the project including levels, panning, effects, and frequency balance',
        input_schema: {
          type: 'object' as const,
          properties: {
            includeRecommendations: {
              type: 'boolean',
              description: 'Whether to include mixing recommendations'
            }
          },
          required: []
        }
      }
    ]
  }
}

export class ClaudeAgentService {
  private authService: AuthService
  private conversationHistories = new Map<string, Anthropic.MessageParam[]>()
  private toolExecutor = new ToolExecutor()

  constructor(authService: AuthService) {
    this.authService = authService
  }

  async sendMessage(
    agentType: AgentType,
    conversationId: string,
    userMessage: string,
    projectContext?: string
  ): Promise<AgentResponse> {
    const token = this.authService.getAccessToken()
    if (!token) throw new Error('Not authenticated')

    const config = AGENT_CONFIGS[agentType]
    const client = new Anthropic({ apiKey: token })

    // Parse project context
    let parsedContext: ProjectContext = {
      tracks: [],
      tempo: 120,
      timeSignature: { numerator: 4, denominator: 4 },
      sections: [],
    }
    if (projectContext) {
      try {
        parsedContext = JSON.parse(projectContext) as ProjectContext
      } catch {
        // Use defaults if parsing fails
      }
    }

    // Get or create conversation history
    const history = this.conversationHistories.get(conversationId) || []
    history.push({ role: 'user', content: userMessage })

    const systemPrompt = projectContext
      ? `${config.systemPrompt}\n\nCurrent project context:\n${projectContext}`
      : config.systemPrompt

    // Agentic loop: call API → execute tools → send results → repeat
    let accumulatedText = ''
    const allMutations: Mutation[] = []
    const allToolExecutions: ToolExecution[] = []

    for (let iteration = 0; iteration < MAX_LOOP_ITERATIONS; iteration++) {
      const response = await client.messages.create({
        model: config.model,
        max_tokens: 4096,
        system: systemPrompt,
        tools: config.tools,
        messages: history,
      })

      // Process response content blocks
      const toolUseBlocks: Anthropic.ToolUseBlock[] = []
      for (const block of response.content) {
        if (block.type === 'text') {
          accumulatedText += block.text
        } else if (block.type === 'tool_use') {
          toolUseBlocks.push(block)
        }
      }

      // Add assistant message to history
      history.push({ role: 'assistant', content: response.content })

      // If no tool calls or stop reason is end_turn, we're done
      if (response.stop_reason !== 'tool_use' || toolUseBlocks.length === 0) {
        break
      }

      // Execute each tool and collect results
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const toolBlock of toolUseBlocks) {
        const toolResult = this.toolExecutor.execute(
          toolBlock.name,
          toolBlock.input as Record<string, unknown>,
          parsedContext
        )

        allMutations.push(...toolResult.mutations)
        allToolExecutions.push({
          name: toolBlock.name,
          input: toolBlock.input,
          result: toolResult.result,
        })

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolBlock.id,
          content: toolResult.result,
        })
      }

      // Push tool results as user message for next iteration
      history.push({ role: 'user', content: toolResults })
    }

    // Save conversation history
    this.conversationHistories.set(conversationId, history)

    return {
      text: accumulatedText,
      mutations: allMutations,
      toolExecutions: allToolExecutions,
    }
  }

  clearConversation(conversationId: string): void {
    this.conversationHistories.delete(conversationId)
  }
}
