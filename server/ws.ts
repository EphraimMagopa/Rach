/**
 * WebSocket broadcast helper for the backend server.
 * Tracks subscribers per jobId and broadcasts progress/completion/error events.
 */

import { WebSocketServer, WebSocket } from 'ws'
import type { Server } from 'http'

interface WsMessage {
  type: 'progress' | 'complete' | 'error'
  jobId: string
  data?: unknown
}

const clients = new Set<WebSocket>()

let wss: WebSocketServer | null = null

export function setupWebSocket(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/rach-ws' })

  wss.on('connection', (ws) => {
    clients.add(ws)
    ws.on('close', () => clients.delete(ws))
    ws.on('error', () => clients.delete(ws))
  })

  return wss
}

export function broadcast(message: WsMessage): void {
  const data = JSON.stringify(message)
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  }
}
