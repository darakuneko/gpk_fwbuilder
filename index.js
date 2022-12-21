const {app, BrowserWindow, ipcMain, Tray, Menu} = require("electron")
const {command} = require('./command')

let mainWindow
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 1000,
        icon: `${__dirname}/icons/256x256.png`,
        webPreferences: {
            preload: __dirname + '/preload.js',
            backgroundThrottling: false,
        },
    })

    mainWindow.loadURL(`file://${__dirname}/public/index.html`)
    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            closing(event, mainWindow)
        }
        return false
    })
}

app.on('ready', () => {
    command.upImage()
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
