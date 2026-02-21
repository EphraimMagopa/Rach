/**
 * Backend client abstraction layer.
 * Routes calls through Electron IPC in desktop mode,
 * or through HTTP/WebSocket in browser mode.
 */

import type { Project } from '../core/models/project'

const isElectron = !!(window as Window & { electron?: unknown }).electron
const ipc = (window as Window & {
  electron?: {
    ipcRenderer: {
      invoke(channel: string, ...args: unknown[]): Promise<unknown>
      send(channel: string, ...args: unknown[]): void
      on(channel: string, listener: (...args: unknown[]) => void): void
      removeListener(channel: string, listener: (...args: unknown[]) => void): void
    }
  }
}).electron?.ipcRenderer

// --- WebSocket singleton for browser mode ---

let ws: WebSocket | null = null
const wsListeners = new Map<string, Set<(data: unknown) => void>>()

function getWs(): WebSocket {
  if (ws && ws.readyState === WebSocket.OPEN) return ws

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  ws = new WebSocket(`${protocol}//${window.location.host}/rach-ws`)

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as { type: string; jobId: string; data?: unknown }
      const key = `${msg.jobId}:${msg.type}`
      const listeners = wsListeners.get(key)
      if (listeners) {
        for (const fn of listeners) fn(msg.data)
      }
      // Also fire wildcard listeners for the jobId
      const wildcard = wsListeners.get(msg.jobId)
      if (wildcard) {
        for (const fn of wildcard) fn(msg)
      }
    } catch { /* ignore non-JSON messages */ }
  }

  ws.onclose = () => { ws = null }

  return ws
}

function onWsEvent(jobId: string, type: string, handler: (data: unknown) => void): () => void {
  const key = `${jobId}:${type}`
  if (!wsListeners.has(key)) wsListeners.set(key, new Set())
  wsListeners.get(key)!.add(handler)
  return () => {
    wsListeners.get(key)?.delete(handler)
    if (wsListeners.get(key)?.size === 0) wsListeners.delete(key)
  }
}

// Ensure WS is connected in browser mode
function ensureWs(): void {
  if (!isElectron) getWs()
}

// --- File Operations ---

async function openProject(): Promise<{ project: Project; path: string } | null> {
  if (isElectron && ipc) {
    const result = await ipc.invoke('file:open') as { path: string; content: string } | null
    if (!result) return null
    return { project: JSON.parse(result.content) as Project, path: result.path }
  }

  // Browser: use File System Access API
  if ('showOpenFilePicker' in window) {
    try {
      const [handle] = await (window as unknown as {
        showOpenFilePicker: (opts: unknown) => Promise<FileSystemFileHandle[]>
      }).showOpenFilePicker({
        types: [{ description: 'Rach Project', accept: { 'application/json': ['.rach'] } }],
      })
      const file = await handle.getFile()
      const content = await file.text()
      return { project: JSON.parse(content) as Project, path: file.name }
    } catch {
      return null // user cancelled
    }
  }

  // Fallback: file input
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.rach'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      const content = await file.text()
      resolve({ project: JSON.parse(content) as Project, path: file.name })
    }
    input.click()
  })
}

async function saveProject(project: Project, filePath: string): Promise<void> {
  if (isElectron && ipc) {
    const json = JSON.stringify(project, null, 2)
    await ipc.invoke('file:save', filePath, json)
    return
  }

  // Browser: save via backend
  await fetch('/rach-api/files/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: filePath, content: JSON.stringify(project, null, 2) }),
  })
}

async function saveProjectAs(project: Project): Promise<string | null> {
  if (isElectron && ipc) {
    const filePath = await ipc.invoke('file:saveAs') as string | null
    if (filePath) {
      await ipc.invoke('file:save', filePath, JSON.stringify(project, null, 2))
      return filePath
    }
    return null
  }

  // Browser: File System Access API
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as unknown as {
        showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle>
      }).showSaveFilePicker({
        suggestedName: `${project.metadata.title || 'project'}.rach`,
        types: [{ description: 'Rach Project', accept: { 'application/json': ['.rach'] } }],
      })
      const writable = await (handle as FileSystemFileHandle & {
        createWritable: () => Promise<WritableStream & { write: (data: string) => Promise<void>; close: () => Promise<void> }>
      }).createWritable()
      await writable.write(JSON.stringify(project, null, 2))
      await writable.close()
      return handle.name
    } catch {
      return null // user cancelled
    }
  }

  // Fallback: download
  const json = JSON.stringify(project, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.metadata.title || 'project'}.rach`
  a.click()
  URL.revokeObjectURL(url)
  return a.download
}

async function openAudioFile(): Promise<{ path: string } | null> {
  if (isElectron && ipc) {
    return await ipc.invoke('file:openAudio') as { path: string } | null
  }

  // Browser: upload audio file to backend
  if ('showOpenFilePicker' in window) {
    try {
      const [handle] = await (window as unknown as {
        showOpenFilePicker: (opts: unknown) => Promise<FileSystemFileHandle[]>
      }).showOpenFilePicker({
        types: [{ description: 'Audio Files', accept: { 'audio/*': ['.wav', '.mp3', '.flac', '.ogg', '.aac', '.m4a'] } }],
      })
      const file = await handle.getFile()
      const formData = new FormData()
      formData.append('file', file)
      const resp = await fetch('/rach-api/files/upload', { method: 'POST', body: formData })
      const data = await resp.json() as { path: string }
      return { path: data.path }
    } catch {
      return null
    }
  }

  // Fallback: file input
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      const formData = new FormData()
      formData.append('file', file)
      const resp = await fetch('/rach-api/files/upload', { method: 'POST', body: formData })
      const data = await resp.json() as { path: string }
      resolve({ path: data.path })
    }
    input.click()
  })
}

// --- Stem Separation ---

interface StemProgress {
  stage: string
  percent: number
}

interface StemResult {
  name: string
  path: string
}

async function separateStems(
  audioPath: string,
  options: { quality: 'fast' | 'balanced' | 'high'; stems: 4 | 2 },
  onProgress?: (progress: StemProgress) => void,
): Promise<{ success: boolean; stems?: StemResult[]; error?: string }> {
  if (isElectron && ipc) {
    // Subscribe to IPC progress
    const handler = (...args: unknown[]) => {
      const data = args[1] as StemProgress
      if (data) onProgress?.(data)
    }
    ipc.on('stems:progress', handler)
    try {
      return await ipc.invoke('stems:separate', audioPath, options) as {
        success: boolean; stems?: StemResult[]; error?: string
      }
    } finally {
      ipc.removeListener('stems:progress', handler)
    }
  }

  // Browser: HTTP + WS
  ensureWs()
  const resp = await fetch('/rach-api/stems/separate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioPath, ...options }),
  })
  const { jobId } = await resp.json() as { jobId: string }

  return new Promise((resolve) => {
    const cleanups: Array<() => void> = []

    cleanups.push(onWsEvent(jobId, 'progress', (data) => {
      onProgress?.(data as StemProgress)
    }))

    cleanups.push(onWsEvent(jobId, 'complete', (data) => {
      cleanups.forEach(fn => fn())
      resolve({ success: true, stems: (data as { stems: StemResult[] }).stems })
    }))

    cleanups.push(onWsEvent(jobId, 'error', (data) => {
      cleanups.forEach(fn => fn())
      resolve({ success: false, error: (data as { error: string }).error })
    }))
  })
}

async function checkStemModel(): Promise<boolean> {
  if (isElectron && ipc) {
    const result = await ipc.invoke('stems:checkModel') as { available: boolean }
    return result.available
  }
  const resp = await fetch('/rach-api/stems/check-model')
  const data = await resp.json() as { available: boolean }
  return data.available
}

function cancelStemSeparation(jobId?: string): void {
  if (isElectron && ipc) {
    ipc.invoke('stems:cancel').catch(() => {})
    return
  }
  if (jobId) {
    fetch('/rach-api/stems/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    }).catch(() => {})
  }
}

// --- Suno Import ---

interface SunoImportResult {
  audioPath: string
  metadata: { title: string; duration: number | null; sourceUrl: string }
}

async function importSuno(
  url: string,
  onProgress?: (progress: StemProgress) => void,
): Promise<{ success: boolean } & Partial<SunoImportResult> & { error?: string }> {
  if (isElectron && ipc) {
    return await ipc.invoke('suno:import', url) as { success: boolean } & Partial<SunoImportResult> & { error?: string }
  }

  // Browser: HTTP + WS
  ensureWs()
  const resp = await fetch('/rach-api/suno/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const { jobId } = await resp.json() as { jobId: string }

  return new Promise((resolve) => {
    const cleanups: Array<() => void> = []

    cleanups.push(onWsEvent(jobId, 'progress', (data) => {
      onProgress?.(data as StemProgress)
    }))

    cleanups.push(onWsEvent(jobId, 'complete', (data) => {
      cleanups.forEach(fn => fn())
      const result = data as SunoImportResult
      resolve({ success: true, ...result })
    }))

    cleanups.push(onWsEvent(jobId, 'error', (data) => {
      cleanups.forEach(fn => fn())
      resolve({ success: false, error: (data as { error: string }).error })
    }))
  })
}

// --- Plugins ---

interface PluginInfo {
  path: string
  name: string
  vendor: string
  uid: string
  isInstrument: boolean
  isEffect: boolean
}

async function scanPlugins(): Promise<PluginInfo[]> {
  if (isElectron && ipc) {
    return await ipc.invoke('plugin:scan') as PluginInfo[]
  }
  const resp = await fetch('/rach-api/plugins/scan')
  return await resp.json() as PluginInfo[]
}

async function loadPlugin(path: string): Promise<string | null> {
  if (isElectron && ipc) {
    return await ipc.invoke('plugin:load', path) as string | null
  }
  const resp = await fetch('/rach-api/plugins/load', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  })
  if (!resp.ok) return null
  const data = await resp.json() as { instanceId: string }
  return data.instanceId
}

function setPluginParam(instanceId: string, paramId: number, value: number): void {
  if (isElectron && ipc) {
    ipc.send('plugin:setParam', instanceId, paramId, value)
    return
  }
  fetch(`/rach-api/plugins/${instanceId}/params`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paramId, value }),
  }).catch(() => {})
}

function unloadPlugin(instanceId: string): void {
  if (isElectron && ipc) {
    ipc.send('plugin:unload', instanceId)
    return
  }
  fetch(`/rach-api/plugins/${instanceId}`, { method: 'DELETE' }).catch(() => {})
}

// --- Exported API ---

export const backendClient = {
  // File ops
  openProject,
  saveProject,
  saveProjectAs,
  openAudioFile,

  // Stems
  separateStems,
  checkStemModel,
  cancelStemSeparation,

  // Suno
  importSuno,

  // Plugins
  scanPlugins,
  loadPlugin,
  setPluginParam,
  unloadPlugin,

  // Utility
  isElectron,
}
