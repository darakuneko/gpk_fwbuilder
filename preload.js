const { contextBridge, ipcRenderer } = require('electron')

process.once('loaded', async () => {
    global.ipcRenderer = ipcRenderer

    contextBridge.exposeInMainWorld(
        "api", {
            existSever: async () => await ipcRenderer.invoke('existSever'),
            tags: async () => await ipcRenderer.invoke('tags'),
            build: async (dat) => await ipcRenderer.invoke('build', dat),
            update: async (fw) => await ipcRenderer.invoke('update', fw),
            getState: async() => await ipcRenderer.invoke('getState'),
            setState: async(obj) => await ipcRenderer.invoke('setState', obj),
            on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
        })
})
