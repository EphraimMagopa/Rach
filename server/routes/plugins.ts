/**
 * Plugin hosting routes for browser mode.
 * Wraps PluginHostService with HTTP endpoints.
 */

import { Router } from 'express'
import { PluginHostService } from '../../electron/services/plugin-host-service'

const router = Router()
const pluginHost = new PluginHostService()

// Initialize on first import
pluginHost.initialize()

// GET /rach-api/plugins/scan
router.get('/scan', (_req, res) => {
  const plugins = pluginHost.scanPlugins()
  res.json(plugins)
})

// POST /rach-api/plugins/load
router.post('/load', (req, res) => {
  const { path } = req.body as { path: string }
  if (!path) {
    res.status(400).json({ error: 'path is required' })
    return
  }
  const instanceId = pluginHost.loadPlugin(path)
  if (instanceId) {
    res.json({ instanceId })
  } else {
    res.status(500).json({ error: 'Failed to load plugin' })
  }
})

// GET /rach-api/plugins/:id/params
router.get('/:id/params', (req, res) => {
  const params = pluginHost.getParameters(req.params.id)
  res.json(params)
})

// PUT /rach-api/plugins/:id/params
router.put('/:id/params', (req, res) => {
  const { paramId, value } = req.body as { paramId: number; value: number }
  pluginHost.setParameter(req.params.id, paramId, value)
  res.json({ ok: true })
})

// DELETE /rach-api/plugins/:id
router.delete('/:id', (req, res) => {
  pluginHost.unloadPlugin(req.params.id)
  res.json({ ok: true })
})

export default router
