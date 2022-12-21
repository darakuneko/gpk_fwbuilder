const {app, BrowserWindow, ipcMain, Tray, Menu} = require("electron")
const Store = require("electron-store")
const {command} = require('./command')

let store
let mainWindow
let isStopImage = false
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 1000,
        icon: `${__dirname}/icons/icon256.png`,
        webPreferences: {
            preload: __dirname + '/preload.js',
            backgroundThrottling: false,
        },
    })

    mainWindow.loadURL(`file://${__dirname}/public/index.html`)
    mainWindow.setMenu(null)

    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            closing(event, mainWindow)
        }
        return false
    })
}

app.on('ready', () => {
    if (process.platform === 'darwin') app.dock.hide()
    command.upImage()
    store = new Store()
    createWindow()
    //mainWindow.webContents.openDevTools()
})

const closing = async(e, mainWindow) => {
    e.preventDefault()
    mainWindow.webContents.send("close", false)
    await command.stopImage()
    app.isQuiting = true
    app.quit()
}

ipcMain.handle('existSever', async () => await command.existSever())
ipcMain.handle('tags', async () => await command.tags())
ipcMain.handle('build', async (e, dat) => await command.build(dat))
ipcMain.handle('update', async (e, fw) => await command.update(fw))
