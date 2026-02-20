import { Send, Bot, X, BarChart3, Undo2, Scissors, Download, Brain } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAgentStore } from '../../stores/agent-store';
import type { AgentMessage } from '../../stores/agent-store';
import { useAuthStore } from '../../stores/auth-store';
import { useProjectStore } from '../../stores/project-store';
import { useTransportStore } from '../../stores/transport-store';
import { useUIStore } from '../../stores/ui-store';
import { AuthButton } from './AuthButton';
import { ToolExecutionCard } from './ToolExecutionCard';
import { StemSeparationPanel } from './StemSeparationPanel';
import { SunoImportDialog } from './SunoImportDialog';
import { ravelClient } from '../../services/ravel-client';
import type { ToolExecution } from '../../core/models/mutations';
import type { Project } from '../../core/models';

/** Path to the shared active.json file — resolved at runtime in Electron */
function getActiveJsonPath(): string {
  const home = typeof process !== 'undefined' ? process.env.HOME || process.env.USERPROFILE || '' : '';
  return `${home}/.rach/projects/active.json`;
}

/** Export the current project to active.json */
async function exportProjectToFile(project: Project): Promise<void> {
  const ipc = window.electron?.ipcRenderer;
  if (ipc) {
    // Electron mode — use IPC
    await ipc.invoke('file:save', getActiveJsonPath(), JSON.stringify(project, null, 2));
  } else {
    // Browser mode — use Vite dev server plugin
    await fetch('/rach-api/project', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project, null, 2),
    });
  }
}

/** Read active.json after an agent turn and sync to Zustand */
async function readActiveProject(): Promise<Project | null> {
  const ipc = window.electron?.ipcRenderer;
  try {
    if (ipc) {
      // Electron mode — use IPC
      const content = await ipc.invoke('file:read', getActiveJsonPath()) as string;
      return JSON.parse(content) as Project;
    } else {
      // Browser mode — use Vite dev server plugin
      const res = await fetch('/rach-api/project');
      if (!res.ok) return null;
      return await res.json() as Project;
    }
  } catch {
    return null;
  }
}

export function AIPanel(): React.JSX.Element {
  const {
    messages, addMessage, updateLastMessage, isLoading, setLoading,
    isThinking, thinkingContent, setThinking, appendThinking, clearThinking,
    activeAgentName, setActiveAgent,
  } = useAgentStore();
  const { status: connectionStatus } = useAuthStore();
  const projectStore = useProjectStore();
  const { project, setProject } = projectStore;
  const { togglePanel } = useUIStore();
  const [input, setInput] = useState('');
  const [showStemPanel, setShowStemPanel] = useState(false);
  const [showSunoDialog, setShowSunoDialog] = useState(false);
  const [undoSnapshots, setUndoSnapshots] = useState<Map<string, Project>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isThinking]);

  // Connect to Ravel on mount
  useEffect(() => {
    const authStore = useAuthStore.getState();

    async function init() {
      try {
        await ravelClient.connect();
        const sessionId = await ravelClient.createSession(project.metadata.title || 'Rach Session');
        authStore.setSessionId(sessionId);
        await exportProjectToFile(project);
      } catch {
        // Status updates handled by ravelClient's onStatusChange
      }
    }

    // Sync connection status to auth store
    const unsubStatus = ravelClient.onStatusChange((newStatus) => {
      authStore.setStatus(newStatus);
    });

    init();

    return () => {
      unsubStatus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to Ravel streaming events
  useEffect(() => {
    const unsubs: Array<() => void> = [];

    // Streaming text from assistant
    unsubs.push(ravelClient.on('assistant_message', (event) => {
      const lastMsg = useAgentStore.getState().messages.at(-1);
      if (lastMsg?.role === 'assistant' && lastMsg.isStreaming) {
        updateLastMessage({ content: lastMsg.content + (event.content || '') });
      } else {
        addMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: event.content || '',
          timestamp: new Date().toISOString(),
          agentName: useAgentStore.getState().activeAgentName || undefined,
          isStreaming: true,
        });
      }
    }));

    // Thinking indicator
    unsubs.push(ravelClient.on('thinking_start', () => {
      clearThinking();
      setThinking(true);
    }));

    unsubs.push(ravelClient.on('thinking_delta', (event) => {
      appendThinking(event.content || '');
    }));

    // Tool use — add to current streaming message's toolExecutions
    unsubs.push(ravelClient.on('tool_use', (event) => {
      const exec: ToolExecution = {
        name: event.toolName || 'unknown',
        input: event.toolInput,
        result: event.toolResult || '',
      };
      const lastMsg = useAgentStore.getState().messages.at(-1);
      if (lastMsg?.role === 'assistant') {
        const existing = lastMsg.toolExecutions || [];
        updateLastMessage({ toolExecutions: [...existing, exec] });
      }
    }));

    // Agent context — which Ravel agent is active
    unsubs.push(ravelClient.on('agent_context', (event) => {
      setActiveAgent(event.agentId || null, event.agentName || null);
    }));

    // Turn complete — sync project state from active.json
    unsubs.push(ravelClient.on('result', async () => {
      // Mark last message as done streaming
      const lastMsg = useAgentStore.getState().messages.at(-1);
      if (lastMsg?.isStreaming) {
        updateLastMessage({ isStreaming: false });
      }
      clearThinking();
      setLoading(false);

      // Read updated project from active.json
      const updatedProject = await readActiveProject();
      if (updatedProject) {
        setProject(updatedProject);
        // Sync transport store (separate from project store)
        const transport = useTransportStore.getState();
        transport.setTempo(updatedProject.tempo);
        const ts = updatedProject.timeSignature;
        transport.setTimeSignature([ts.numerator, ts.denominator]);
      }
    }));

    // Error
    unsubs.push(ravelClient.on('error', (event) => {
      setLoading(false);
      clearThinking();
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${event.error || 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      });
    }));

    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [addMessage, updateLastMessage, setLoading, setThinking, appendThinking, clearThinking, setActiveAgent, setProject]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const message = text || input.trim();
      if (!message || isLoading) return;
      if (!text) setInput('');

      if (connectionStatus !== 'connected') {
        addMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Not connected to Ravel. Please check that Ravel is running on localhost:3061.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Save undo snapshot before this turn
      const snapshotId = crypto.randomUUID();
      setUndoSnapshots((prev) => new Map(prev).set(snapshotId, structuredClone(project)));

      const userMsg: AgentMessage = {
        id: snapshotId, // use same ID for undo tracking
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMsg);

      // Export current project state before sending
      await exportProjectToFile(project);

      setLoading(true);
      clearThinking();
      ravelClient.sendMessage(message);
    },
    [input, isLoading, connectionStatus, project, addMessage, setLoading, clearThinking]
  );

  const handleAnalyzeMix = useCallback(() => {
    sendMessage('Analyze the current mix and provide recommendations for improvement.');
  }, [sendMessage]);

  const handleUndo = useCallback(
    (msg: AgentMessage) => {
      // Find the user message that triggered this response (the message before it)
      const msgIdx = messages.indexOf(msg);
      if (msgIdx <= 0) return;
      const userMsg = messages[msgIdx - 1];
      const snapshot = undoSnapshots.get(userMsg.id);
      if (snapshot) {
        setProject(snapshot);
        const transport = useTransportStore.getState();
        transport.setTempo(snapshot.tempo);
        transport.setTimeSignature([snapshot.timeSignature.numerator, snapshot.timeSignature.denominator]);
        exportProjectToFile(snapshot);
      }
    },
    [messages, undoSnapshots, setProject]
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
          {activeAgentName && (
            <span className="text-[10px] text-rach-text-muted/70 ml-1">
              ({activeAgentName})
            </span>
          )}
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
        {messages.length === 0 ? (
          <div className="text-center mt-8">
            <Bot size={32} className="mx-auto text-rach-text-muted/30 mb-3" />
            <p className="text-xs text-rach-text-muted">
              Chat with Ravel's music agents
            </p>
            <p className="text-[10px] text-rach-text-muted/60 mt-1">
              Powered by Ravel
            </p>
            {connectionStatus !== 'connected' && (
              <p className="text-[10px] text-yellow-500/80 mt-2">
                Connecting to Ravel...
              </p>
            )}
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`mb-3 text-xs ${
                msg.role === 'user' ? 'text-rach-text' : 'text-rach-accent'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="font-medium text-[10px] text-rach-text-muted">
                  {msg.role === 'user' ? 'You' : (msg.agentName || 'Rach')}
                </div>
                {msg.role === 'assistant' && !msg.isStreaming && idx > 0 && (
                  <button
                    onClick={() => handleUndo(msg)}
                    className="flex items-center gap-0.5 text-[9px] text-rach-text-muted/60 hover:text-rach-accent transition-colors"
                    title="Undo changes from this response"
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
            </div>
          ))
        )}
        {isThinking && (
          <div className="mb-3 text-xs">
            <div className="flex items-center gap-1 text-rach-accent/60 animate-pulse">
              <Brain size={12} />
              Thinking...
            </div>
            {thinkingContent && (
              <div className="text-[10px] text-rach-text-muted/50 mt-1 whitespace-pre-wrap max-h-20 overflow-y-auto">
                {thinkingContent}
              </div>
            )}
          </div>
        )}
        {isLoading && !isThinking && (
          <div className="text-xs text-rach-accent/60 animate-pulse">Processing...</div>
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
