import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { ElectronAPI } from './types/index.ts'

contextBridge.exposeInMainWorld(
    "api", {
        setSkipCheckDocker: async (skip: boolean) => await ipcRenderer.invoke('setSkipCheckDocker', skip),
        existSever: async () => await ipcRenderer.invoke('existSever'),
        tags: async () => await ipcRenderer.invoke('tags'),
        checkout: async (obj: any) => await ipcRenderer.invoke('checkout', obj),
        copyKeyboardFile: async (obj: any) => await ipcRenderer.invoke('copyKeyboardFile', obj),
        build: async (dat: any) => await ipcRenderer.invoke('build', dat),
        buildCompleted: async () => await ipcRenderer.invoke('buildCompleted'),
        listLocalKeyboards: async () => await ipcRenderer.invoke('listLocalKeyboards'),
        listRemoteKeyboards: async (fw: string) => await ipcRenderer.invoke('listRemoteKeyboards', fw),
        updateRepository: async (fw: string) => await ipcRenderer.invoke('updateRepository', fw),
        updateRepositoryCustom: async (obj: any) => await ipcRenderer.invoke('updateRepositoryCustom', obj),
        generateQMKFile: async (dat: any) => await ipcRenderer.invoke('generateQMKFile', dat),
        generateVialId: async () => await ipcRenderer.invoke('generateVialId'),
        getState: async () => await ipcRenderer.invoke('getState'),
        setState: async (obj: any) => await ipcRenderer.invoke('setState', obj),
        rebuildImage: async () => await ipcRenderer.invoke('rebuildImage'),
        convertVilJson: async (file: any) => await ipcRenderer.invoke('convertVilJson', file),
        convertViaJson: async (file: any) => await ipcRenderer.invoke('convertViaJson', file),
        convertKleJson: async (obj: any) => await ipcRenderer.invoke('convertKleJson', obj),
        readJson: async (path: string) => await ipcRenderer.invoke('readJson', path),
        appVersion: async () => await ipcRenderer.invoke('appVersion'),
        getRemoteFWdir: async () => await ipcRenderer.invoke('getRemoteFWdir'),
        getLocalFWdir: async () => await ipcRenderer.invoke('getLocalFWdir'),
        getStorePath: async () => await ipcRenderer.invoke('getStorePath'),
        on: (channel: string, func: (...args: any[]) => void) => ipcRenderer.on(channel, (event, ...args) => func(...args))
    } as ElectronAPI)
    
contextBridge.exposeInMainWorld('webUtils', webUtils)