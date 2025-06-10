// Common type definitions for GPK FWBuilder

export interface WindowBounds {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface AppState {
    version?: string;
    setting?: {
        fwMakerUrl?: string;
        fwDir?: string;
    };
}

export interface FileObject {
    path: string;
    name: string;
}

export interface BuildData {
    fw: string;
    kb: string;
    km: string;
    tag?: string;
    commit?: string;
    useRepo?: string;
}

export interface GenerateQMKData {
    kb: string;
    user: string;
    mcu: string;
    layout: string;
}

export interface ConvertKleData {
    file: FileObject;
    params: any;
}

export interface ConvertViaData {
    info: FileObject;
    kle: FileObject;
}

export interface ConvertVilData {
    vilObj: FileObject;
}

export interface UpdateRepositoryCustomData {
    id: string;
    url: string;
}

export interface CheckoutData {
    [key: string]: any;
}

export interface KeyboardInfo {
    kb: string;
    km: string[];
}

export interface ElectronAPI {
    setSkipCheckDocker: (skip: boolean) => Promise<void>;
    existSever: () => Promise<number>;
    tags: () => Promise<string[]>;
    checkout: (obj: any) => Promise<void>;
    copyKeyboardFile: (obj: any) => Promise<void>;
    build: (dat: any) => Promise<void>;
    buildCompleted: () => Promise<boolean>;
    listLocalKeyboards: () => Promise<any[]>;
    listRemoteKeyboards: (fw: string) => Promise<any[]>;
    updateRepository: (fw: string) => Promise<void>;
    updateRepositoryCustom: (obj: any) => Promise<void>;
    generateQMKFile: (dat: any) => Promise<string>;
    generateVialId: () => Promise<any>;
    getState: () => Promise<any>;
    setState: (obj: any) => Promise<void>;
    rebuildImage: () => Promise<void>;
    convertVilJson: (file: any) => Promise<string>;
    convertViaJson: (file: any) => Promise<string>;
    convertKleJson: (obj: any) => Promise<string>;
    readJson: (path: string) => Promise<any>;
    appVersion: () => Promise<string>;
    getRemoteFWdir: () => Promise<string>;
    getLocalFWdir: () => Promise<string>;
    getStorePath: () => Promise<string>;
    on: (channel: string, func: (...args: unknown[]) => void) => unknown;
    off: (channel: string, listener: unknown) => void;
    removeAllListeners: (channel: string) => void;
}

declare global {
    interface Window {
        api: ElectronAPI;
        webUtils: any;
    }
    
    namespace Electron {
        interface App {
            isQuiting?: boolean;
        }
    }
}