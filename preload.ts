import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { ElectronAPI } from './types/index.ts'

contextBridge.exposeInMainWorld(
    "api", {
        setSkipCheckDocker: async (skip: boolean) => await ipcRenderer.invoke('setSkipCheckDocker', skip),
        existSever: async () => await ipcRenderer.invoke('existSever'),
        tags: async () => await ipcRenderer.invoke('tags'),
        checkout: async (obj: unknown) => await ipcRenderer.invoke('checkout', obj),
        copyKeyboardFile: async (obj: unknown) => await ipcRenderer.invoke('copyKeyboardFile', obj),
        build: async (dat: unknown) => await ipcRenderer.invoke('build', dat),
        buildCompleted: async () => await ipcRenderer.invoke('buildCompleted'),
        listLocalKeyboards: async () => await ipcRenderer.invoke('listLocalKeyboards'),
        listRemoteKeyboards: async (fw: string) => await ipcRenderer.invoke('listRemoteKeyboards', fw),
        updateRepository: async (fw: string) => await ipcRenderer.invoke('updateRepository', fw),
        updateRepositoryCustom: async (obj: unknown) => await ipcRenderer.invoke('updateRepositoryCustom', obj),
        generateQMKFile: async (dat: unknown) => await ipcRenderer.invoke('generateQMKFile', dat),
        generateVialId: async () => await ipcRenderer.invoke('generateVialId'),
        getState: async () => await ipcRenderer.invoke('getState'),
        setState: async (obj: unknown) => await ipcRenderer.invoke('setState', obj),
        getSettings: async () => await ipcRenderer.invoke('getSettings'),
        setSettings: async (settings: unknown) => await ipcRenderer.invoke('setSettings', settings),
        rebuildImage: async () => await ipcRenderer.invoke('rebuildImage'),
        convertVilJson: async (file: unknown) => await ipcRenderer.invoke('convertVilJson', file),
        convertViaJson: async (file: unknown) => await ipcRenderer.invoke('convertViaJson', file),
        convertKleJson: async (obj: unknown) => await ipcRenderer.invoke('convertKleJson', obj),
        readJson: async (path: string) => await ipcRenderer.invoke('readJson', path),
        appVersion: async () => await ipcRenderer.invoke('appVersion'),
        getRemoteFWdir: async () => await ipcRenderer.invoke('getRemoteFWdir'),
        getLocalFWdir: async () => await ipcRenderer.invoke('getLocalFWdir'),
        getStorePath: async () => await ipcRenderer.invoke('getStorePath'),
        getNotifications: async () => await ipcRenderer.invoke('getNotifications'),
        getCachedNotifications: async () => await ipcRenderer.invoke('getCachedNotifications'),
        on: (channel: string, func: (...args: unknown[]) => void) => {
            const listener = (event: unknown, ...args: unknown[]) => func(...args)
            ipcRenderer.on(channel, listener)
            return listener
        },
        off: (channel: string, listener: unknown) => ipcRenderer.off(channel, listener),
        removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel)
    } as ElectronAPI)
    
contextBridge.exposeInMainWorld('webUtils', webUtils)

// Check for updates on startup
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const state = await ipcRenderer.invoke('getState')
        const result = await ipcRenderer.invoke('getNotifications')
        const latestNotification = result?.notifications?.[0]
        const savedNotifications = state?.savedNotifications

        if (latestNotification?.id) {
            const isDifferent = !savedNotifications || 
                !savedNotifications.some((n: any) => n.id === latestNotification.id)
                
            if (isDifferent) {
                // Save the new notifications
                const newState = {
                    ...state,
                    savedNotifications: result.notifications
                }
                await ipcRenderer.invoke('setState', newState)
                                        
                // Dispatch event to show the modal
                window.dispatchEvent(new CustomEvent('showUpdatesNotificationModal', {
                    detail: { notifications: [latestNotification] }
                }))
            }
        }
    } catch (error) {
        console.error('Failed to check for updates:', error)
    }
})