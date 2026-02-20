/**
 * RavelClient — WebSocket + REST client for connecting to Ravel's
 * music production agents. Replaces the old BrowserAgentService (Gemini).
 */

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type RavelEventType =
  | 'assistant_message'
  | 'thinking_start'
  | 'thinking_delta'
  | 'tool_use'
  | 'agent_context'
  | 'result'
  | 'error'
  | 'keepalive';

export interface RavelEvent {
  type: RavelEventType;
  content?: string;
  toolName?: string;
  toolInput?: unknown;
  toolResult?: string;
  agentId?: string;
  agentName?: string;
  error?: string;
}

type EventHandler = (event: RavelEvent) => void;

// In Electron, we call Ravel directly (no CORS issues).
// In browser dev mode, Vite proxies /api and /ws to localhost:3061.
const isElectron = typeof window !== 'undefined' && !!window.electron;
const RAVEL_BASE_URL = isElectron ? 'http://localhost:3061' : '';
const RAVEL_WS_URL = isElectron
  ? 'ws://localhost:3061/ws'
  : `ws://${location.host}/ws`;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];

export class RavelClient {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private sessionId: string | null = null;
  private listeners = new Map<RavelEventType, Set<EventHandler>>();
  private statusListeners = new Set<(status: ConnectionStatus) => void>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  async createSession(title: string): Promise<string> {
    const res = await fetch(`${RAVEL_BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        workingDirectory: '',
        mode: 'orchestrated-music',
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to create session: ${res.status} ${res.statusText}`);
    }

    const data = await res.json() as { id: string };
    this.sessionId = data.id;
    return data.id;
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.setStatus('connecting');

    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(RAVEL_WS_URL);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        resolve();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data as string);
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.setStatus('error');
        reject(new Error('WebSocket connection failed'));
      };
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // prevent auto-reconnect
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  sendMessage(content: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.emit('error', { type: 'error', error: 'Not connected to Ravel' });
      return;
    }
    if (!this.sessionId) {
      this.emit('error', { type: 'error', error: 'No active session' });
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'chat',
      content,
      sessionId: this.sessionId,
    }));
  }

  on(event: RavelEventType, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(handler);
    return () => {
      this.statusListeners.delete(handler);
    };
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    for (const handler of this.statusListeners) {
      handler(status);
    }
  }

  private emit(type: RavelEventType, event: RavelEvent): void {
    const handlers = this.listeners.get(type);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  private handleMessage(raw: string): void {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    const type = data.type as string;

    switch (type) {
      case 'assistant_message':
        this.emit('assistant_message', {
          type: 'assistant_message',
          content: data.content as string,
        });
        break;

      case 'thinking_start':
        this.emit('thinking_start', { type: 'thinking_start' });
        break;

      case 'thinking_delta':
        this.emit('thinking_delta', {
          type: 'thinking_delta',
          content: data.content as string,
        });
        break;

      case 'tool_use':
        this.emit('tool_use', {
          type: 'tool_use',
          toolName: data.toolName as string,
          toolInput: data.toolInput,
          toolResult: data.toolResult as string | undefined,
        });
        break;

      case 'agent_context':
        this.emit('agent_context', {
          type: 'agent_context',
          agentId: data.agentId as string,
          agentName: data.agentName as string,
        });
        break;

      case 'result':
        this.emit('result', { type: 'result' });
        break;

      case 'error':
        this.emit('error', {
          type: 'error',
          error: data.error as string,
        });
        break;

      case 'keepalive':
        break;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;

    const delay = RECONNECT_DELAYS[this.reconnectAttempts] || 16000;
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Will retry via onclose → scheduleReconnect
      });
    }, delay);
  }
}

export const ravelClient = new RavelClient();
