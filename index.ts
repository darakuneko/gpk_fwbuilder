import { app, BrowserWindow, ipcMain, Event, Menu, clipboard } from "electron"
import Store from 'electron-store'
import command from './command.ts'
import { fileURLToPath } from "url"
import path from "path"
import { StoreSchema, NotificationPayload, NotificationQueryPayload } from './types/index.ts'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const store = new Store<StoreSchema>({
    defaults: {
        notificationApiEndpoint: 'https://getnotifications-svtx62766a-uc.a.run.app'
    }
})
let mainWindow: BrowserWindow | null = null


const createWindow = (): void => {
    const win = store.get('window')
    const state = store.get('state')
    const isRestored = win && state?.version === app.getVersion()

    mainWindow = new BrowserWindow({
        x: isRestored ? win.x : undefined,
        y: isRestored ? win.y : undefined,
        width: isRestored ? win.w : 1024,
        height: isRestored ? win.h : 1024,
        icon: `${__dirname}/icons/256x256.png`,
        webPreferences: {
            preload: __dirname + '/preload.js',
            backgroundThrottling: false,
        },
    })

    mainWindow.loadURL(`file://${path.join(__dirname, '../dist/public/index.html')}`)
    mainWindow.setMenu(null)
    mainWindow.on('close', async (event: Event) => {
        if (!app.isQuiting && mainWindow) await closing(event, mainWindow)
        return false
    })
}

app.setName("GPK FWBuilder")

app.on('ready', async () => {
    createWindow()
    if (mainWindow) {
        await command.upImage(mainWindow)
        
        // Open DevTools only in development environment
        if (process.env.NODE_ENV === 'development') {
            mainWindow.webContents.openDevTools()
        }
        
        // Setup context menu for logs textarea only
        mainWindow.webContents.on('context-menu', (_e, params) => {
            // Only show context menu if right-clicking in logs textarea
            mainWindow.webContents.executeJavaScript(`
                (function() {
                    const element = document.elementFromPoint(${params.x}, ${params.y});
                    return element && element.classList.contains('logs-textarea');
                })()
            `).then((isLogsTextarea) => {
                if (isLogsTextarea) {
                    const menuTemplate = [
                        {
                            label: 'Copy',
                            enabled: !!(params.selectionText && params.selectionText.trim().length > 0),
                            click: () => {
                                if (params.selectionText) {
                                    clipboard.writeText(params.selectionText)
                                }
                            }
                        }
                    ]
                    const contextMenu = Menu.buildFromTemplate(menuTemplate)
                    contextMenu.popup({
                        window: mainWindow!,
                        x: params.x,
                        y: params.y
                    })
                }
            }).catch(console.error)
        })
    }
})

const closing = async (e: Event, mainWindow: BrowserWindow): Promise<void> => {
    e.preventDefault()
    const win = mainWindow.getBounds()
    store.set('window', {x: win.x, y: win.y, w: win.width, h: win.height})
    mainWindow.webContents.send("close", false)
    await command.stopImage()
    app.isQuiting = true
    app.quit()
}

ipcMain.handle('setSkipCheckDocker', async (_e, skip: boolean) => await command.setSkipCheckDocker(skip))
ipcMain.handle('existSever', async () => await command.existSever())
ipcMain.handle('tags', async () => await command.tags())
ipcMain.handle('checkout', async (_e, obj: any) => await command.checkout(obj, mainWindow!))
ipcMain.handle('copyKeyboardFile', async (_e, obj: any) => await command.copyKeyboardFile(obj, mainWindow!))
ipcMain.handle('build', async (_e, dat: any) => await command.build(dat, mainWindow!))
ipcMain.handle('buildCompleted', () => command.buildCompleted())
ipcMain.handle('listLocalKeyboards', () => command.listLocalKeyboards(process.platform === 'win32'))
ipcMain.handle('listRemoteKeyboards', async (_e, fw: string) => await command.listRemoteKeyboards(fw))
ipcMain.handle('generateQMKFile', async (_e, dat: any) => await command.generateQMKFile(dat))
ipcMain.handle('generateVialId', async () => await command.generateVialId())
ipcMain.handle('updateRepository', async (_e, fw: string) => await command.updateRepository(fw, mainWindow!))
ipcMain.handle('updateRepositoryCustom', async (_e, obj: any) => await command.updateRepositoryCustom(obj, mainWindow!))
ipcMain.handle('getState', async () => store.get('state'))
ipcMain.handle('setState', async (_e, obj: AppState) => {
    store.set('state', obj)
})
ipcMain.handle('getSettings', async () => store.get('settings') || {})
ipcMain.handle('setSettings', async (_e, settings: any) => {
    const currentSettings = store.get('settings') || {}
    const newSettings = { ...currentSettings, ...settings }
    store.set('settings', newSettings)
    return true
})
ipcMain.handle('rebuildImage', async () => await command.rebuildImage(mainWindow!))
ipcMain.handle('convertVilJson', async (_e, file: any) => await command.convertVilJson(file))
ipcMain.handle('convertViaJson', async (_e, file: any) => await command.convertViaJson(file))
ipcMain.handle('convertKleJson', async (_e, obj: any) => await command.convertKleJson(obj))
ipcMain.handle('readJson', async (_e, path: string) => await command.readJson(path))
ipcMain.handle('appVersion', () => app.getVersion())
ipcMain.handle('getLocalFWdir', () => command.getLocalFWdir())
ipcMain.handle('getStorePath', async (_event) => store.path)

// Notification handlers
ipcMain.handle('getNotifications', async () => {
    try {
        const now = Date.now()
        const queryPayload: NotificationQueryPayload = {
            deviceId: 'all',
            type: 'notification',
            collection: 'buildNotify',
            filters: [
                { field: "publishedAt", op: "<=", value: now }
            ],
            orderBy: { field: "publishedAt", direction: "desc" },
            limit: 10,
        }

        const endpoint = store.get('notificationApiEndpoint')
        if (!endpoint) {
            throw new Error('Notification API endpoint not configured')
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(queryPayload)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.json()
    } catch (error) {
        console.error('Failed to fetch notifications:', error)
        return { notifications: [] }
    }
})

ipcMain.handle('getCachedNotifications', async () => {
    const state = store.get('state')
    return state?.savedNotifications || []
})