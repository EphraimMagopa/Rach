import { app, BrowserWindow, Menu, ipcMain, dialog, protocol } from 'electron'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { AuthService } from './services/auth-service'
import { ClaudeAgentService } from './services/claude-agent-service'
import { PluginHostService } from './services/plugin-host-service'
import { StemSeparator } from './services/stem-separator'
import { SunoImporter } from './services/suno-importer'

let mainWindow: BrowserWindow | null = null
const authService = new AuthService()
const agentService = new ClaudeAgentService(authService)
const pluginHost = new PluginHostService()
const stemSeparator = new StemSeparator()
const sunoImporter = new SunoImporter()

function createMenu(window: BrowserWindow): Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => window.webContents.send('menu:new-project')
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => window.webContents.send('menu:open')
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => window.webContents.send('menu:save')
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => window.webContents.send('menu:save-as')
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: () => window.webContents.send('menu:undo')
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => window.webContents.send('menu:redo')
        },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'Transport',
      submenu: [
        {
          label: 'Play / Pause',
          accelerator: 'Space',
          click: () => window.webContents.send('menu:play-pause')
        },
        {
          label: 'Stop',
          accelerator: 'Enter',
          click: () => window.webContents.send('menu:stop')
        },
        {
          label: 'Record',
          accelerator: 'R',
          click: () => window.webContents.send('menu:record')
        },
        { type: 'separator' },
        {
          label: 'Toggle Metronome',
          accelerator: 'CmdOrCtrl+M',
          click: () => window.webContents.send('menu:toggle-metronome')
        },
        {
          label: 'Toggle Loop',
          accelerator: 'L',
          click: () => window.webContents.send('menu:toggle-loop')
        }
      ]
    },
    {
      label: 'Track',
      submenu: [
        {
          label: 'Add Audio Track',
          accelerator: 'CmdOrCtrl+T',
          click: () => window.webContents.send('menu:add-audio-track')
        },
        {
          label: 'Add MIDI Track',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => window.webContents.send('menu:add-midi-track')
        },
        { type: 'separator' },
        {
          label: 'Delete Selected Track',
          accelerator: 'Backspace',
          click: () => window.webContents.send('menu:delete-track')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Mixer',
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => window.webContents.send('menu:toggle-mixer')
        },
        {
          label: 'Toggle Piano Roll',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => window.webContents.send('menu:toggle-piano-roll')
        },
        {
          label: 'Toggle AI Panel',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => window.webContents.send('menu:toggle-ai')
        },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Rach',
          click: () => {
            dialog.showMessageBox(window, {
              type: 'info',
              title: 'About Rach',
              message: 'Rach — AI-Powered DAW',
              detail: 'Named after Sergei Rachmaninoff.\nVersion 0.1.0'
            })
          }
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(template)
}

function setupIPC(): void {
  // File operations
  ipcMain.handle('file:open', async () => {
    const result = await dialog.showOpenDialog({
      filters: [{ name: 'Rach Project', extensions: ['rach'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const content = await readFile(result.filePaths[0], 'utf-8')
    return { path: result.filePaths[0], content }
  })

  ipcMain.handle('file:save', async (_event, filePath: string, content: string) => {
    await writeFile(filePath, content, 'utf-8')
    return true
  })

  ipcMain.handle('file:saveAs', async () => {
    const result = await dialog.showSaveDialog({
      filters: [{ name: 'Rach Project', extensions: ['rach'] }]
    })
    return result.canceled ? null : result.filePath
  })

  // App info
  ipcMain.handle('app:getVersion', () => app.getVersion())
  ipcMain.handle('app:getPlatform', () => process.platform)

  // Auth IPC
  ipcMain.handle('auth:startLogin', async () => {
    try {
      await authService.startAuthFlow()
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('auth:getStatus', () => {
    return {
      isAuthenticated: authService.isAuthenticated(),
      accessToken: authService.getAccessToken()
    }
  })

  ipcMain.handle('auth:logout', () => {
    authService.logout()
    return { success: true }
  })

  // Plugin IPC
  ipcMain.handle('plugin:scan', () => {
    return pluginHost.scanPlugins()
  })

  ipcMain.handle('plugin:load', (_event, pluginPath: string) => {
    return pluginHost.loadPlugin(pluginPath)
  })

  ipcMain.handle('plugin:getParams', (_event, instanceId: string) => {
    return pluginHost.getParameters(instanceId)
  })

  ipcMain.on('plugin:setParam', (_event, instanceId: string, paramId: number, value: number) => {
    pluginHost.setParameter(instanceId, paramId, value)
  })

  ipcMain.handle('plugin:process', (_event, instanceId: string, buffer: Float32Array) => {
    return pluginHost.processAudio(instanceId, buffer)
  })

  ipcMain.handle('plugin:getState', (_event, instanceId: string) => {
    return pluginHost.getState(instanceId)
  })

  ipcMain.handle('plugin:setState', (_event, instanceId: string, state: string) => {
    pluginHost.setState(instanceId, state)
  })

  ipcMain.on('plugin:unload', (_event, instanceId: string) => {
    pluginHost.unloadPlugin(instanceId)
  })

  // Agent IPC — returns { success, text, mutations, toolExecutions } or { success: false, error }
  ipcMain.handle(
    'agent:sendMessage',
    async (
      _event,
      agentType: string,
      conversationId: string,
      message: string,
      projectContext?: string
    ) => {
      try {
        const result = await agentService.sendMessage(
          agentType as 'mixing' | 'composition' | 'arrangement' | 'analysis',
          conversationId,
          message,
          projectContext
        )
        return {
          success: true,
          text: result.text,
          mutations: result.mutations,
          toolExecutions: result.toolExecutions,
        }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
  )

  // Audio file open dialog
  ipcMain.handle('file:openAudio', async () => {
    const result = await dialog.showOpenDialog({
      filters: [
        { name: 'Audio Files', extensions: ['wav', 'mp3', 'flac', 'ogg', 'aac', 'm4a'] }
      ],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return { path: result.filePaths[0] }
  })

  // Stem separation IPC
  ipcMain.handle('stems:separate', async (_event, audioPath: string, options: { quality: 'fast' | 'balanced' | 'high'; stems: 4 | 2 }) => {
    try {
      const result = await stemSeparator.separate(audioPath, options, undefined, mainWindow)
      return { success: true, stems: result.stems }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('stems:checkModel', () => {
    return { available: stemSeparator.isModelAvailable() }
  })

  ipcMain.handle('stems:cancel', () => {
    stemSeparator.cancel()
  })

  // Suno import IPC
  ipcMain.handle('suno:import', async (_event, url: string) => {
    try {
      const result = await sunoImporter.importFromUrl(url, mainWindow)
      return { success: true, ...result }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Rach',
    show: false,
    autoHideMenuBar: false,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  Menu.setApplicationMenu(createMenu(mainWindow))

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.rach.daw')

  // Register custom protocol for OAuth callback
  protocol.registerHttpProtocol('rach', (request) => {
    // Handle OAuth callback
    if (request.url.includes('oauth/callback')) {
      authService
        .handleCallback(request.url)
        .then((tokens) => {
          if (mainWindow) {
            mainWindow.webContents.send('auth:callback', {
              success: true,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              expiresAt: tokens.expiresAt
            })
          }
        })
        .catch((error) => {
          if (mainWindow) {
            mainWindow.webContents.send('auth:callback', {
              success: false,
              error: (error as Error).message
            })
          }
        })
    }
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIPC()
  pluginHost.initialize()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
