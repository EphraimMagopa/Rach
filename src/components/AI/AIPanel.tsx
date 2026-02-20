import { Send, Bot, X, BarChart3, Undo2, Scissors, Download } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAgentStore } from '../../stores/agent-store';
import type { AgentType, AgentMessage } from '../../stores/agent-store';
import { useAuthStore } from '../../stores/auth-store';
import { useProjectStore } from '../../stores/project-store';
import { useUIStore } from '../../stores/ui-store';
import { AuthButton } from './AuthButton';
import { ToolExecutionCard } from './ToolExecutionCard';
import { StemSeparationPanel } from './StemSeparationPanel';
import { SunoImportDialog } from './SunoImportDialog';
import { applyMutations } from '../../utils/apply-mutations';
import type { ProjectMutation, ToolExecution } from '../../core/models/mutations';
import type { Project } from '../../core/models';
import { BrowserAgentService } from '../../services/browser-agent-service';

const browserAgentService = new BrowserAgentService();

const AGENTS: { type: AgentType; label: string; description: string }[] = [
  { type: 'mixing', label: 'Mixing', description: 'EQ, compression, levels' },
  { type: 'composition', label: 'Compose', description: 'Chords, melodies, keys' },
  { type: 'arrangement', label: 'Arrange', description: 'Song structure' },
  { type: 'analysis', label: 'Analyze', description: 'Mix analysis' },
];

function buildProjectContext(project: Project): string {
  return JSON.stringify({
    title: project.metadata.title,
    tempo: project.tempo,
    timeSignature: project.timeSignature,
    sections: project.sections || [],
    tracks: project.tracks.map((t) => ({
      id: t.id,
      name: t.name,
      type: t.type,
      volume: t.volume,
      pan: t.pan,
      muted: t.muted,
      effects: t.effects.map((e) => ({
        type: e.type,
        name: e.name,
        params: Object.fromEntries(e.parameters.map((p) => [p.name, p.value])),
      })),
      sends: (t.sends || []).map((s) => ({
        targetBusId: s.targetBusId,
        gain: s.gain,
      })),
      clips: t.clips.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        startBeat: c.startBeat,
        durationBeats: c.durationBeats,
        ...(c.type === 'midi' && c.midiData
          ? {
              midiNotes: c.midiData.notes.map((n) => ({
                pitch: n.pitch,
                velocity: n.velocity,
                startBeat: n.startBeat,
                durationBeats: n.durationBeats,
              })),
            }
          : {}),
      })),
    })),
  });
}

interface UndoableStore {
  project: Project;
  updateTrack: (trackId: string, updates: Partial<import('../../core/models').Track>) => void;
  removeEffect: (trackId: string, effectId: string) => void;
  removeClip: (trackId: string, clipId: string) => void;
  removeMidiNote: (trackId: string, clipId: string, noteId: string) => void;
  removeSection: (sectionId: string) => void;
}

/** Reverse mutations to undo agent changes */
function undoMutations(
  store: UndoableStore,
  mutations: ProjectMutation[]
): void {
  for (let i = mutations.length - 1; i >= 0; i--) {
    const m = mutations[i];
    switch (m.type) {
      case 'setTrackVolume': {
        store.updateTrack(m.trackId, { volume: 0 });
        break;
      }
      case 'setTrackPan': {
        store.updateTrack(m.trackId, { pan: 0 });
        break;
      }
      case 'addEffect': {
        const track = store.project.tracks.find((t) => t.id === m.trackId);
        if (track && track.effects.length > 0) {
          const lastEffect = [...track.effects].reverse().find((e) => e.type === m.effectType);
          if (lastEffect) store.removeEffect(m.trackId, lastEffect.id);
        }
        break;
      }
      case 'createClip': {
        store.removeClip(m.trackId, m.clip.id);
        break;
      }
      case 'addMidiNotes': {
        for (const note of m.notes) {
          store.removeMidiNote(m.trackId, m.clipId, note.id);
        }
        break;
      }
      case 'createSection': {
        const section = store.project.sections.find(
          (s) => s.name === m.name && s.startBeat === m.startBeat
        );
        if (section) store.removeSection(section.id);
        break;
      }
    }
  }
}

export function AIPanel(): React.JSX.Element {
  const agentStore = useAgentStore();
  const { activeAgent, setActiveAgent, conversations, addMessage, createConversation, isLoading, setLoading } =
    agentStore;
  const { status: authStatus } = useAuthStore();
  const projectStore = useProjectStore();
  const { project } = projectStore;
  const { togglePanel } = useUIStore();
  const [input, setInput] = useState('');
  const [showStemPanel, setShowStemPanel] = useState(false);
  const [showSunoDialog, setShowSunoDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.agentType === activeAgent);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages.length]);

  const handleAgentResponse = useCallback(
    (
      convId: string,
      result: {
        success: boolean;
        text?: string;
        mutations?: ProjectMutation[];
        toolExecutions?: ToolExecution[];
        error?: string;
      }
    ) => {
      if (result.success && result.text !== undefined) {
        const mutations = result.mutations || [];
        const toolExecutions = result.toolExecutions || [];

        // Apply mutations to project store
        if (mutations.length > 0) {
          applyMutations(projectStore, mutations);
        }

        const assistantMsg: AgentMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.text,
          timestamp: new Date().toISOString(),
          agentType: activeAgent,
          toolExecutions: toolExecutions.length > 0 ? toolExecutions : undefined,
          mutations: mutations.length > 0 ? mutations : undefined,
        };
        addMessage(convId, assistantMsg);
      } else {
        const errorMsg: AgentMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Error: ${result.error || 'Unknown error'}`,
          timestamp: new Date().toISOString(),
          agentType: activeAgent,
        };
        addMessage(convId, errorMsg);
      }
    },
    [activeAgent, addMessage, projectStore]
  );

  const sendMessage = useCallback(
    async (text?: string) => {
      const message = text || input.trim();
      if (!message || isLoading) return;

      if (!text) setInput('');

      let convId = activeConversation?.id;
      if (!convId) {
        convId = createConversation(activeAgent);
      }

      const userMsg: AgentMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        agentType: activeAgent,
      };
      addMessage(convId, userMsg);

      setLoading(true);
      const projectContext = buildProjectContext(project);

      const ipc = window.electron?.ipcRenderer;

      let result: {
        success: boolean;
        text?: string;
        mutations?: ProjectMutation[];
        toolExecutions?: ToolExecution[];
        error?: string;
      };

      if (ipc) {
        // Electron IPC path
        result = (await ipc.invoke(
          'agent:sendMessage',
          activeAgent,
          convId,
          message,
          projectContext
        )) as typeof result;
      } else {
        // Browser path — use BrowserAgentService with OAuth token
        const token = await useAuthStore.getState().getValidToken();
        if (!token) {
          setLoading(false);
          const assistantMsg: AgentMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Please sign in with Google to use AI features.',
            timestamp: new Date().toISOString(),
            agentType: activeAgent,
          };
          addMessage(convId, assistantMsg);
          return;
        }
        result = await browserAgentService.sendMessage(
          token,
          activeAgent,
          convId,
          message,
          projectContext
        );
      }

      setLoading(false);
      handleAgentResponse(convId, result);
    },
    [
      input,
      isLoading,
      activeAgent,
      activeConversation,
      project,
      addMessage,
      createConversation,
      setLoading,
      handleAgentResponse,
    ]
  );

  const handleAnalyzeMix = useCallback(() => {
    sendMessage('Analyze the current mix and provide recommendations for improvement.');
  }, [sendMessage]);

  const handleUndo = useCallback(
    (msg: AgentMessage) => {
      if (msg.mutations && msg.mutations.length > 0) {
        undoMutations(projectStore, msg.mutations);
      }
    },
    [projectStore]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <div className="w-72 border-l border-rach-border flex flex-col bg-rach-surface shrink-0" data-tutorial="ai-panel">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-rach-border">
        <div className="flex items-center gap-1.5">
          <Bot size={14} className="text-rach-accent" />
          <span className="text-xs font-medium text-rach-text">Rach AI</span>
        </div>
        <div className="flex items-center gap-1">
          <AuthButton />
          <button
            onClick={() => togglePanel('ai')}
            className="p-1 rounded hover:bg-rach-surface-light text-rach-text-muted hover:text-rach-text transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Agent tabs */}
      <div className="flex border-b border-rach-border">
        {AGENTS.map((agent) => (
          <button
            key={agent.type}
            onClick={() => setActiveAgent(agent.type)}
            className={`flex-1 py-1.5 text-[10px] transition-colors ${
              activeAgent === agent.type
                ? 'text-rach-accent border-b-2 border-rach-accent bg-rach-accent/5'
                : 'text-rach-text-muted hover:text-rach-text'
            }`}
            title={agent.description}
          >
            {agent.label}
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="px-2 py-1.5 border-b border-rach-border flex gap-1 flex-wrap">
        <button
          onClick={handleAnalyzeMix}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-rach-accent/10 text-rach-accent hover:bg-rach-accent/20 disabled:opacity-40 transition-colors"
          title="One-click mix analysis"
        >
          <BarChart3 size={10} />
          Analyze Mix
        </button>
        <button
          onClick={() => setShowStemPanel(!showStemPanel)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
            showStemPanel
              ? 'bg-rach-accent text-white'
              : 'bg-rach-accent/10 text-rach-accent hover:bg-rach-accent/20'
          }`}
          title="Stem separation"
        >
          <Scissors size={10} />
          Stems
        </button>
        <button
          onClick={() => setShowSunoDialog(!showSunoDialog)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
            showSunoDialog
              ? 'bg-rach-accent text-white'
              : 'bg-rach-accent/10 text-rach-accent hover:bg-rach-accent/20'
          }`}
          title="Import from Suno"
        >
          <Download size={10} />
          Suno
        </button>
      </div>

      {/* Stem separation panel */}
      {showStemPanel && (
        <div className="px-2 py-1.5 border-b border-rach-border">
          <StemSeparationPanel onClose={() => setShowStemPanel(false)} />
        </div>
      )}

      {/* Suno import dialog */}
      {showSunoDialog && (
        <div className="px-2 py-1.5 border-b border-rach-border">
          <SunoImportDialog
            onClose={() => setShowSunoDialog(false)}
            onStemSeparate={() => {
              setShowSunoDialog(false);
              setShowStemPanel(true);
            }}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {!activeConversation || activeConversation.messages.length === 0 ? (
          <div className="text-center mt-8">
            <Bot size={32} className="mx-auto text-rach-text-muted/30 mb-3" />
            <p className="text-xs text-rach-text-muted">
              Ask the {AGENTS.find((a) => a.type === activeAgent)?.label} agent for help
            </p>
            <p className="text-[10px] text-rach-text-muted/60 mt-1">
              Powered by Gemini (Google)
            </p>
            {authStatus !== 'authenticated' && (
              <p className="text-[10px] text-yellow-500/80 mt-2">
                Sign in to use AI features
              </p>
            )}
          </div>
        ) : (
          activeConversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-3 text-xs ${
                msg.role === 'user' ? 'text-rach-text' : 'text-rach-accent'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="font-medium text-[10px] text-rach-text-muted">
                  {msg.role === 'user' ? 'You' : 'Rach'}
                </div>
                {msg.role === 'assistant' && msg.mutations && msg.mutations.length > 0 && (
                  <button
                    onClick={() => handleUndo(msg)}
                    className="flex items-center gap-0.5 text-[9px] text-rach-text-muted/60 hover:text-rach-accent transition-colors"
                    title="Undo these changes"
                  >
                    <Undo2 size={9} />
                    Undo
                  </button>
                )}
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Tool executions */}
              {msg.toolExecutions && msg.toolExecutions.length > 0 && (
                <div className="mt-1.5">
                  {msg.toolExecutions.map((exec, i) => (
                    <ToolExecutionCard key={i} execution={exec} />
                  ))}
                </div>
              )}

              {/* Mutation summary */}
              {msg.mutations && msg.mutations.length > 0 && (
                <div className="mt-1 text-[10px] text-green-400/80 bg-green-500/5 rounded px-2 py-1">
                  Applied {msg.mutations.length} change{msg.mutations.length > 1 ? 's' : ''} to project
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-xs text-rach-accent/60 animate-pulse">Thinking...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-rach-border">
        <div className="flex items-center gap-1 bg-rach-bg rounded border border-rach-border focus-within:border-rach-accent">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Rach..."
            className="flex-1 bg-transparent px-2 py-1.5 text-xs text-rach-text placeholder:text-rach-text-muted/50 focus:outline-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="p-1.5 text-rach-text-muted hover:text-rach-accent disabled:opacity-30 transition-colors"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
