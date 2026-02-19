import { app, BrowserWindow, Menu, ipcMain, dialog, protocol } from 'electron'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { AuthService } from './services/auth-service'
import { ClaudeAgentService } from './services/claude-agent-service'

let mainWindow: BrowserWindow | null = null
const authService = new AuthService()
const agentService = new ClaudeAgentService(authService)

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

  // Agent IPC
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
        return { success: true, ...result }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
  )
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
