/**
 * File operations routes for browser mode.
 * Replaces Electron IPC file handlers.
 */

import { Router } from 'express'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { homedir } from 'os'
import multer from 'multer'

const PROJECT_DIR = join(homedir(), '.rach', 'projects')
const ACTIVE_PATH = join(PROJECT_DIR, 'active.json')
const UPLOAD_DIR = join(homedir(), '.rach', 'uploads')

const upload = multer({ dest: UPLOAD_DIR })

const router = Router()

// GET /rach-api/project — read active.json
router.get('/project', async (_req, res) => {
  try {
    if (!existsSync(ACTIVE_PATH)) {
      res.status(404).json({ error: 'active.json not found' })
      return
    }
    const content = await readFile(ACTIVE_PATH, 'utf-8')
    res.type('json').send(content)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// PUT /rach-api/project — write active.json
router.put('/project', async (req, res) => {
  try {
    await mkdir(PROJECT_DIR, { recursive: true })
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    await writeFile(ACTIVE_PATH, body, 'utf-8')
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /rach-api/files/save — write to disk
router.post('/files/save', async (req, res) => {
  try {
    const { path: filePath, content } = req.body as { path: string; content: string }
    if (!filePath) {
      res.status(400).json({ error: 'path is required' })
      return
    }
    await mkdir(dirname(filePath), { recursive: true })
    await writeFile(filePath, content, 'utf-8')
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /rach-api/files/read — read from disk
router.post('/files/read', async (req, res) => {
  try {
    const { path: filePath } = req.body as { path: string }
    if (!filePath) {
      res.status(400).json({ error: 'path is required' })
      return
    }
    const content = await readFile(filePath, 'utf-8')
    res.json({ content })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /rach-api/files/upload — multipart upload for audio files
router.post('/files/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }
    res.json({ path: req.file.path, originalName: req.file.originalname })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// GET /rach-api/files/download — serve a file from disk
router.get('/files/download', async (req, res) => {
  try {
    const filePath = req.query.path as string
    if (!filePath) {
      res.status(400).json({ error: 'path query param is required' })
      return
    }
    if (!existsSync(filePath)) {
      res.status(404).json({ error: 'File not found' })
      return
    }
    res.sendFile(filePath)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
