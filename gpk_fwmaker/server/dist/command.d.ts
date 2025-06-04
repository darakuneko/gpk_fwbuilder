import { Response } from 'express';
interface ExecResult {
    stdout: string;
    stderr: string;
}
interface CustomCheckoutResult {
    branch: string;
    dir: string;
}
declare const streamResponse: (res: Response, fn: () => Promise<void>) => Promise<void>;
declare const streamEnd: (res: Response, msg: string) => void;
declare const streamError: (res: Response, e: any) => void;
declare const cmd: {
    dirClient: string;
    dirQMK: string;
    dirVial: string;
    dirCustom: (fw: string) => Promise<string>;
    tags: () => Promise<string[]>;
    currentTag: () => Promise<string>;
    checkoutQmk: (res: Response, tag: string) => Promise<void>;
    checkoutVial: (res: Response, repo: string, commit: string) => Promise<string>;
    checkoutCustom: (res: Response, fw: string, commit: string) => Promise<CustomCheckoutResult>;
    copyKeyboard: (fwDir: string, kbDir: string) => Promise<void>;
    buildQmkFirmware: (res: Response, kb: string, km: string) => Promise<void>;
    buildVialFirmware: (res: Response, kb: string, km: string) => Promise<void>;
    buildCustomFirmware: (res: Response, obj: CustomCheckoutResult, kb: string, km: string) => Promise<void>;
    updateRepositoryQmk: (res: Response) => Promise<void>;
    updateRepositoryVial: (res: Response) => Promise<void>;
    updateRepositoryCustom: (res: Response, customDir: string, url: string) => Promise<void>;
    deleteRepositoryCustom: (res: Response, customDir: string) => Promise<void>;
    generateQmkFile: (kb: string, kbDir: string, mcu: string, layout: string, user: string) => Promise<ExecResult>;
    generateVialId: () => Promise<string>;
    generateFirmFiles: (jsonPath: string) => Promise<void>;
    readFirmFiles: (filePath: string) => Promise<string>;
    readQmkFile: (kb: string, filePath: string) => Promise<string>;
    write: (filePath: string, obj: string) => Promise<void>;
    writeFirmFiles: (filePath: string, obj: string) => Promise<void>;
    writeQmkFile: (kb: string, filePath: string, obj: string) => Promise<void>;
    cpConfigsToQmk: (kbDir: string) => Promise<void>;
    cpConfigsToVial: (kbDir: string) => Promise<void>;
    cpConfigsToCustom: (dir: string, kbDir: string) => Promise<void>;
    cpDefaultToVail: (kbDir: string) => Promise<void>;
    mvQmkConfigsToVolume: (kbDir: string) => Promise<void>;
    buildQmk: (res: Response, kb: string, km: string, tag: string) => Promise<void>;
    buildVial: (res: Response, kb: string, km: string, tag: string) => Promise<void>;
    buildCustom: (res: Response, id: string, kb: string, km: string, tag: string) => Promise<void>;
    generateQmk: (res: Response, keyboard: string, info: any, keymap: any) => Promise<void>;
    convertKleQmk: (res: Response, layout: any, keyboard: string, mcu: string, bootloader: string) => Promise<void>;
    convertKleVial: (res: Response, layout: any, keyboard: string, mcu: string, bootloader: string) => Promise<void>;
    convertViaJson: (res: Response, info: any, layout: any) => Promise<void>;
};
export { cmd, streamResponse, streamError, streamEnd };
