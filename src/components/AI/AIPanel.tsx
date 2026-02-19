import { Send, Bot, X } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAgentStore } from '@/stores/agent-store';
import type { AgentType } from '@/stores/agent-store';
import { useAuthStore } from '@/stores/auth-store';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';
import { AuthButton } from './AuthButton';

const AGENTS: { type: AgentType; label: string; description: string }[] = [
  { type: 'mixing', label: 'Mixing', description: 'EQ, compression, levels' },
  { type: 'composition', label: 'Compose', description: 'Chords, melodies, keys' },
  { type: 'arrangement', label: 'Arrange', description: 'Song structure' },
  { type: 'analysis', label: 'Analyze', description: 'Mix analysis' },
];

export function AIPanel(): React.JSX.Element {
  const { activeAgent, setActiveAgent, conversations, addMessage, createConversation, isLoading, setLoading } =
    useAgentStore();
  const { status: authStatus } = useAuthStore();
  const { project } = useProjectStore();
  const { togglePanel } = useUIStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.agentType === activeAgent);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages.length]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');

    // Get or create conversation
    let convId = activeConversation?.id;
    if (!convId) {
      convId = createConversation(activeAgent);
    }

    // Add user message to store
    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: text,
      timestamp: new Date().toISOString(),
      agentType: activeAgent,
    };
    addMessage(convId, userMsg);

    // Send to Claude via IPC
    const ipc = window.electron?.ipcRenderer;
    if (!ipc) {
      // Fallback: no Electron IPC (dev mode in browser)
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: 'Claude agent requires Anthropic authentication. Please sign in to use AI features.',
        timestamp: new Date().toISOString(),
        agentType: activeAgent,
      };
      addMessage(convId, assistantMsg);
      return;
    }

    setLoading(true);

    // Build project context summary
    const projectContext = JSON.stringify({
      title: project.metadata.title,
      tempo: project.tempo,
      timeSignature: project.timeSignature,
      tracks: project.tracks.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        volume: t.volume,
        pan: t.pan,
        muted: t.muted,
        clipCount: t.clips.length,
      })),
    });

    const result = (await ipc.invoke(
      'agent:sendMessage',
      activeAgent,
      convId,
      text,
      projectContext
    )) as { success: boolean; text?: string; toolCalls?: Array<{ name: string; input: unknown }>; error?: string };

    setLoading(false);

    if (result.success && result.text) {
      let content = result.text;
      // Append tool call info if any
      if (result.toolCalls && result.toolCalls.length > 0) {
        content +=
          '\n\n' +
          result.toolCalls
            .map((tc) => `🔧 ${tc.name}(${JSON.stringify(tc.input)})`)
            .join('\n');
      }

      const assistantMsg = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content,
        timestamp: new Date().toISOString(),
        agentType: activeAgent,
      };
      addMessage(convId, assistantMsg);
    } else {
      const errorMsg = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: `Error: ${result.error || 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        agentType: activeAgent,
      };
      addMessage(convId, errorMsg);
    }
  }, [
    input,
    isLoading,
    activeAgent,
    activeConversation,
    project,
    addMessage,
    createConversation,
    setLoading,
  ]);

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
    <div className="w-72 border-l border-rach-border flex flex-col bg-rach-surface shrink-0">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-rach-border">
        <div className="flex items-center gap-1.5">
          <Bot size={14} className="text-rach-accent" />
          <span className="text-xs font-medium text-rach-text">Claude AI</span>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {!activeConversation || activeConversation.messages.length === 0 ? (
          <div className="text-center mt-8">
            <Bot size={32} className="mx-auto text-rach-text-muted/30 mb-3" />
            <p className="text-xs text-rach-text-muted">
              Ask the {AGENTS.find((a) => a.type === activeAgent)?.label} agent for help
            </p>
            <p className="text-[10px] text-rach-text-muted/60 mt-1">
              Powered by Claude (Anthropic)
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
              <div className="font-medium text-[10px] text-rach-text-muted mb-0.5">
                {msg.role === 'user' ? 'You' : 'Claude'}
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-xs text-rach-accent/60 animate-pulse">Claude is thinking...</div>
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
            placeholder="Ask Claude..."
            className="flex-1 bg-transparent px-2 py-1.5 text-xs text-rach-text placeholder:text-rach-text-muted/50 focus:outline-none"
          />
          <button
            onClick={sendMessage}
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
