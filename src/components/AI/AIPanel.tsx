import { Send, Bot, X } from 'lucide-react'
import { useState } from 'react'
import { useAgentStore } from '@/stores/agent-store'
import type { AgentType } from '@/stores/agent-store'
import { useUIStore } from '@/stores/ui-store'

const AGENTS: { type: AgentType; label: string; description: string }[] = [
  { type: 'mixing', label: 'Mixing', description: 'EQ, compression, levels' },
  { type: 'composition', label: 'Compose', description: 'Chords, melodies, keys' },
  { type: 'arrangement', label: 'Arrange', description: 'Song structure' },
  { type: 'analysis', label: 'Analyze', description: 'Mix analysis' },
]

export function AIPanel(): React.JSX.Element {
  const { activeAgent, setActiveAgent, conversations } = useAgentStore()
  const { togglePanel } = useUIStore()
  const [input, setInput] = useState('')

  const activeConversation = conversations.find((c) => c.agentType === activeAgent)

  return (
    <div className="w-72 border-l border-rach-border flex flex-col bg-rach-surface shrink-0">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-rach-border">
        <div className="flex items-center gap-1.5">
          <Bot size={14} className="text-rach-accent" />
          <span className="text-xs font-medium text-rach-text">Claude AI</span>
        </div>
        <button
          onClick={() => togglePanel('ai')}
          className="p-1 rounded hover:bg-rach-surface-light text-rach-text-muted hover:text-rach-text transition-colors"
        >
          <X size={14} />
        </button>
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
          </div>
        ) : (
          activeConversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 text-xs ${
                msg.role === 'user' ? 'text-rach-text' : 'text-rach-accent'
              }`}
            >
              <div className="font-medium text-[10px] text-rach-text-muted mb-0.5">
                {msg.role === 'user' ? 'You' : 'Claude'}
              </div>
              {msg.content}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-rach-border">
        <div className="flex items-center gap-1 bg-rach-bg rounded border border-rach-border focus-within:border-rach-accent">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Claude..."
            className="flex-1 bg-transparent px-2 py-1.5 text-xs text-rach-text placeholder:text-rach-text-muted/50 focus:outline-none"
          />
          <button
            disabled={!input.trim()}
            className="p-1.5 text-rach-text-muted hover:text-rach-accent disabled:opacity-30 transition-colors"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
