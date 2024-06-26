const {app, BrowserWindow, ipcMain} = require("electron")
const Store = require("electron-store")
const {command} = require('./command')

const store = new Store()
let mainWindow

const createWindow = () => {
    const win  = store.get('window')
    const state  = store.get('state')
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

    mainWindow.loadURL(`file://${__dirname}/public/index.html`)
    mainWindow.setMenu(null)
    mainWindow.on('close', async (event) => {
        if (!app.isQuiting) await closing(event, mainWindow)
        return false
    })
}

app.setName("GPK FWBuilder")

app.on('ready', () => {
    createWindow()
    command.upImage(mainWindow)
    // mainWindow.webContents.openDevTools()
})

const closing = async(e, mainWindow) => {
    e.preventDefault()
    const win = mainWindow.getBounds()
    store.set('window', {x: win.x, y: win.y, w: win.width, h: win.height})
    mainWindow.webContents.send("close", false)
    await command.stopImage()
    app.isQuiting = true
    app.quit()
}

ipcMain.handle('setSkipCheckDocker', async (e, skip) => await command.setSkipCheckDocker(skip))
ipcMain.handle('existSever', async () => await command.existSever())
ipcMain.handle('tags', async () => await command.tags())
ipcMain.handle('checkout',  async (e, obj) => await command.checkout(obj, mainWindow))
ipcMain.handle('copyKeyboardFile',  async (e, obj) => await command.copyKeyboardFile(obj, mainWindow))
ipcMain.handle('build', async (e, dat) => await command.build(dat, mainWindow))
ipcMain.handle('buildCompleted',  () => command.buildCompleted())
ipcMain.handle('listLocalKeyboards',  () => command.listLocalKeyboards(process.platform==='win32'))
ipcMain.handle('listRemoteKeyboards',  async (e, fw) => await command.listRemoteKeyboards(fw))
ipcMain.handle('generateQMKFile', async (e, dat) => await command.generateQMKFile(dat))
ipcMain.handle('generateVialId', async () => await command.generateVialId())
ipcMain.handle('updateRepository', async (e, fw) => await command.updateRepository(fw, mainWindow))
ipcMain.handle('updateRepositoryCustom', async (e, obj) => await command.updateRepositoryCustom(obj, mainWindow))
ipcMain.handle('getState',  async () => await store.get('state'))
ipcMain.handle('setState',  async (e, obj) => {
    await store.set('state', obj)
})
ipcMain.handle('rebuildImage', async () => await command.rebuildImage(mainWindow))
ipcMain.handle('convertViaJson',  async (e, file) => await command.convertViaJson(file))
ipcMain.handle('convertKleJson',  async (e, obj) => await command.convertKleJson(obj))
ipcMain.handle('readJson',  async (e, path) => await command.readJson(path))
ipcMain.handle('appVersion',  () => app.getVersion())
ipcMain.handle('getLocalFWdir',  () => command.getLocalFWdir())
ipcMain.handle('getStorePath',  async (event) => store.path)
