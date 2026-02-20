import { create } from 'zustand';
import type { ToolExecution } from '../core/models/mutations';

export type MessageRole = 'user' | 'assistant';

export interface AgentMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  agentId?: string;
  agentName?: string;
  isStreaming?: boolean;
  toolExecutions?: ToolExecution[];
}

interface AgentState {
  activeAgentId: string | null;
  activeAgentName: string | null;
  messages: AgentMessage[];
  isLoading: boolean;
  isThinking: boolean;
  thinkingContent: string;

  addMessage: (msg: AgentMessage) => void;
  updateLastMessage: (updates: Partial<AgentMessage>) => void;
  setActiveAgent: (id: string | null, name: string | null) => void;
  setLoading: (v: boolean) => void;
  setThinking: (v: boolean) => void;
  appendThinking: (text: string) => void;
  clearMessages: () => void;
  clearThinking: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  activeAgentId: null,
  activeAgentName: null,
  messages: [],
  isLoading: false,
  isThinking: false,
  thinkingContent: '',

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  updateLastMessage: (updates) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length === 0) return state;
      const last = messages[messages.length - 1];
      messages[messages.length - 1] = { ...last, ...updates };
      return { messages };
    }),

  setActiveAgent: (id, name) =>
    set({ activeAgentId: id, activeAgentName: name }),

  setLoading: (isLoading) => set({ isLoading }),

  setThinking: (isThinking) => set({ isThinking }),

  appendThinking: (text) =>
    set((state) => ({ thinkingContent: state.thinkingContent + text })),

  clearMessages: () => set({ messages: [] }),

  clearThinking: () => set({ thinkingContent: '', isThinking: false }),
}));
