import { create } from 'zustand';
import type { ProjectMutation, ToolExecution } from '../core/models/mutations';

export type AgentType = 'mixing' | 'composition' | 'arrangement' | 'analysis';
export type MessageRole = 'user' | 'assistant';

export interface AgentMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  agentType: AgentType;
  toolExecutions?: ToolExecution[];
  mutations?: ProjectMutation[];
}

export interface Conversation {
  id: string;
  agentType: AgentType;
  messages: AgentMessage[];
  createdAt: string;
}

interface AgentState {
  activeAgent: AgentType;
  conversations: Conversation[];
  isLoading: boolean;

  setActiveAgent: (agent: AgentType) => void;
  addMessage: (conversationId: string, message: AgentMessage) => void;
  createConversation: (agentType: AgentType) => string;
  setLoading: (loading: boolean) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  activeAgent: 'mixing',
  conversations: [],
  isLoading: false,

  setActiveAgent: (activeAgent) => set({ activeAgent }),

  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message] }
          : c
      ),
    })),

  createConversation: (agentType) => {
    const id = crypto.randomUUID();
    set((state) => ({
      conversations: [
        ...state.conversations,
        { id, agentType, messages: [], createdAt: new Date().toISOString() },
      ],
    }));
    return id;
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
