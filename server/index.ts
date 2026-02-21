/**
 * Backend server for Rach browser mode.
 * Provides HTTP + WebSocket endpoints that mirror Electron IPC handlers.
 * Runs on port 3062 alongside Vite dev server (5175) and Ravel (3061).
 */

import express from 'express'
import { createServer } from 'http'
import { setupWebSocket } from './ws'
import filesRouter from './routes/files'
import stemsRouter from './routes/stems'
import sunoRouter from './routes/suno'
import pluginsRouter from './routes/plugins'

const PORT = process.env.RACH_SERVER_PORT || 3062

const app = express()

// CORS for Vite dev server
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (_req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

// Body parsing
app.use(express.json({ limit: '50mb' }))
app.use(express.text({ limit: '50mb' }))

// Mount routes
app.use('/rach-api', filesRouter)
app.use('/rach-api/stems', stemsRouter)
app.use('/rach-api/suno', sunoRouter)
app.use('/rach-api/plugins', pluginsRouter)

// Health check
app.get('/rach-api/health', (_req, res) => {
  res.json({ status: 'ok', mode: 'browser' })
})

const server = createServer(app)
setupWebSocket(server)

async function main(): Promise<void> {
  server.listen(PORT, () => {
    console.log(`Rach backend server running on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
