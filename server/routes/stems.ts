/**
 * Stem separation routes for browser mode.
 * Wraps StemSeparator with HTTP endpoints and WebSocket progress.
 */

import { Router } from 'express'
import { StemSeparator } from '../../electron/services/stem-separator'
import { broadcast } from '../ws'

const router = Router()
const stemSeparator = new StemSeparator()

const activeJobs = new Map<string, { cancel: () => void }>()

// GET /rach-api/stems/check-model
router.get('/check-model', (_req, res) => {
  res.json({ available: stemSeparator.isModelAvailable() })
})

// POST /rach-api/stems/separate
router.post('/separate', async (req, res) => {
  const { audioPath, quality = 'balanced', stems = 4 } = req.body as {
    audioPath: string
    quality?: 'fast' | 'balanced' | 'high'
    stems?: 4 | 2
  }

  if (!audioPath) {
    res.status(400).json({ error: 'audioPath is required' })
    return
  }

  const jobId = crypto.randomUUID()

  // Return the jobId immediately, process in background
  res.json({ jobId })

  activeJobs.set(jobId, { cancel: () => stemSeparator.cancel() })

  try {
    const result = await stemSeparator.separate(
      audioPath,
      { quality, stems },
      (progress) => {
        broadcast({ type: 'progress', jobId, data: progress })
      }
    )
    broadcast({ type: 'complete', jobId, data: { stems: result.stems } })
  } catch (err) {
    broadcast({ type: 'error', jobId, data: { error: (err as Error).message } })
  } finally {
    activeJobs.delete(jobId)
  }
})

// POST /rach-api/stems/cancel
router.post('/cancel', (req, res) => {
  const { jobId } = req.body as { jobId: string }
  const job = activeJobs.get(jobId)
  if (job) {
    job.cancel()
    activeJobs.delete(jobId)
  }
  res.json({ ok: true })
})

export default router
