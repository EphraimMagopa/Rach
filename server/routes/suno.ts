/**
 * Suno import routes for browser mode.
 * Wraps SunoImporter with HTTP endpoints and WebSocket progress.
 */

import { Router } from 'express'
import { SunoImporter } from '../../electron/services/suno-importer'
import { broadcast } from '../ws'

const router = Router()
const sunoImporter = new SunoImporter()

// POST /rach-api/suno/import
router.post('/import', async (req, res) => {
  const { url } = req.body as { url: string }

  if (!url) {
    res.status(400).json({ error: 'url is required' })
    return
  }

  const jobId = crypto.randomUUID()

  // Return jobId immediately, process in background
  res.json({ jobId })

  try {
    const result = await sunoImporter.importFromUrl(url, (progress) => {
      broadcast({ type: 'progress', jobId, data: progress })
    })
    broadcast({ type: 'complete', jobId, data: result })
  } catch (err) {
    broadcast({ type: 'error', jobId, data: { error: (err as Error).message } })
  }
})

export default router
