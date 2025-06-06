// Command module types
import { Response } from 'express';

export interface GitCheckoutResult {
    branch: string;
    dir: string;
}

export interface CommandModule {
    dirQMK: string;
    dirVial: string;
    dirClient: string;
    dirCustom: (fw: string) => Promise<string>;
    
    // Git operations
    tags: () => Promise<string[]>;
    currentTag: () => Promise<string>;
    checkoutQmk: (res: Response, tag: string) => Promise<void>;
    checkoutVial: (res: Response, repo: string, commit: string) => Promise<void>;
    checkoutCustom: (res: Response, fw: string, commit: string) => Promise<GitCheckoutResult>;
    
    // Repository operations
    updateRepositoryQmk: (res: Response) => Promise<void>;
    updateRepositoryVial: (res: Response) => Promise<void>;
    updateRepositoryCustom: (res: Response, id: string, url: string) => Promise<void>;
    deleteRepositoryCustom: (res: Response, id: string) => Promise<void>;
    
    // Build operations
    buildQmkFirmware: (res: Response, kb: string, km: string) => Promise<void>;
    buildVialFirmware: (res: Response, kb: string, km: string) => Promise<void>;
    buildCustomFirmware: (res: Response, obj: GitCheckoutResult, kb: string, km: string) => Promise<void>;
    
    // File operations
    cpConfigsToQmk: (kbDir: string) => Promise<void>;
    cpConfigsToVial: (kbDir: string) => Promise<void>;
    cpConfigsToCustom: (dir: string, kbDir: string) => Promise<void>;
    copyKeyboard: (fwDir: string, kbDir: string) => Promise<void>;
    
    // QMK file operations
    generateQmkFile: (kbL: string, kbDir: string, mcu: string, layout: string, user: string) => Promise<string>;
    readQmkFile: (kb: string, file: string) => Promise<Buffer>;
    writeQmkFile: (kb: string, file: string, content: string) => Promise<void>;
    mvQmkConfigsToVolume: (kbDir: string) => Promise<void>;
    cpDefaultToVail: (kb: string) => Promise<void>;
    
    // Vial operations
    generateVialId: () => Promise<string>;
    
    // Firmware file operations
    writeFirmFiles: (file: string, content: string) => Promise<void>;
    readFirmFiles: (file: string) => Promise<Buffer>;
    generateFirmFiles: (kleFileName: string) => Promise<void>;
    
    // General file operations
    write: (path: string, content: string) => Promise<void>;
}

export interface StreamFunctions {
    streamResponse: (res: Response, fn: () => Promise<void>) => Promise<void>;
    streamError: (res: Response, error: unknown) => void;
}