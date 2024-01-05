const {contextBridge, ipcRenderer} = require('electron')

process.once('loaded', async () => {
    global.ipcRenderer = ipcRenderer
    contextBridge.exposeInMainWorld(
        "api", {
            setSkipCheckDocker: async (skip) => await ipcRenderer.invoke('setSkipCheckDocker', skip),
            existSever: async () => await ipcRenderer.invoke('existSever'),
            tags: async () => await ipcRenderer.invoke('tags'),
            checkout: async (obj) => await ipcRenderer.invoke('checkout', obj),
            copyKeyboardFile: async (obj) => await ipcRenderer.invoke('copyKeyboardFile', obj),
            build: async (dat) => await ipcRenderer.invoke('build', dat),
            buildCompleted: async () => await ipcRenderer.invoke('buildCompleted'),
            listLocalKeyboards: async () => await ipcRenderer.invoke('listLocalKeyboards'),
            listRemoteKeyboards: async (fw) => await ipcRenderer.invoke('listRemoteKeyboards', fw),
            updateRepository: async (fw) => await ipcRenderer.invoke('updateRepository', fw),
            updateRepositoryCustom: async (obj) => await ipcRenderer.invoke('updateRepositoryCustom', obj),
            generateQMKFile: async (dat) => await ipcRenderer.invoke('generateQMKFile', dat),
            generateVialId: async () => await ipcRenderer.invoke('generateVialId'),
            getState: async () => await ipcRenderer.invoke('getState'),
            setState: async (obj) => await ipcRenderer.invoke('setState', obj),
            rebuildImage: async () => await ipcRenderer.invoke('rebuildImage'),
            convertViaJson: async (file) => await ipcRenderer.invoke('convertViaJson', file),
            convertKleJson: async (obj) => await ipcRenderer.invoke('convertKleJson', obj),
            readJson: async (path) => await ipcRenderer.invoke('readJson', path),
            appVersion: async () => await ipcRenderer.invoke('appVersion'),
            getRemoteFWdir: async () => await ipcRenderer.invoke('getRemoteFWdir'),
            getLocalFWdir: async () => await ipcRenderer.invoke('getLocalFWdir'),
            getStorePath: async () => await ipcRenderer.invoke('getStorePath'),
            on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
        })
})
