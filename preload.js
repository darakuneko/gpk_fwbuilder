const { contextBridge, ipcRenderer } = require('electron')

process.once('loaded', async () => {
    global.ipcRenderer = ipcRenderer

    contextBridge.exposeInMainWorld(
        "api", {
            existSever: async () => await ipcRenderer.invoke('existSever'),
            tags: async () => await ipcRenderer.invoke('tags'),
            build: async (dat) => await ipcRenderer.invoke('build', dat),
            buildCompleted: async () =>  await ipcRenderer.invoke('buildCompleted'),
            updateRepository: async (fw) => await ipcRenderer.invoke('updateRepository', fw),
            generateQMKFile: async (dat) => await ipcRenderer.invoke('generateQMKFile', dat),
            generateVialId: async () => await ipcRenderer.invoke('generateVialId'),
            getState: async() => await ipcRenderer.invoke('getState'),
            setState: async(obj) => await ipcRenderer.invoke('setState', obj),
            rebuildImage: async () => await ipcRenderer.invoke('rebuildImage'),
            convertViaJson: async (file) => await ipcRenderer.invoke('convertViaJson', file),
            appVersion: async () => await ipcRenderer.invoke('appVersion'),
            on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
        })
})
