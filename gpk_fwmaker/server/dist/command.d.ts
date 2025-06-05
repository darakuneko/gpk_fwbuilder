export namespace cmd {
    export { dirClient };
    export { dirQMK };
    export { dirVial };
    export function dirCustom(fw: any): Promise<string>;
    export function tags(): Promise<any[]>;
    export function currentTag(): Promise<string>;
    export function checkoutQmk(res: any, tag: any): Promise<void>;
    export function checkoutVial(res: any, repo: any, commit: any): Promise<any>;
    export function checkoutCustom(res: any, fw: any, commit: any): Promise<{
        branch: any;
        dir: string;
    }>;
    export function copyKeyboard(fwDir: any, kbDir: any): Promise<void>;
    export function buildQmkFirmware(res: any, kb: any, km: any): Promise<void>;
    export function buildVialFirmware(res: any, kb: any, km: any): Promise<void>;
    export function buildCustomFirmware(res: any, obj: any, kb: any, km: any): Promise<void>;
    export function updateRepositoryQmk(res: any): Promise<void>;
    export function updateRepositoryVial(res: any): Promise<void>;
    export function updateRepositoryCustom(res: any, customDir: any, url: any): Promise<void>;
    export function deleteRepositoryCustom(res: any, customDir: any): Promise<void>;
    export function generateQmkFile(kb: any, kbDir: any, mcu: any, layout: any, user: any): Promise<{
        stdout: string;
        stderr: string;
    }>;
    export function generateVialId(): Promise<string>;
    export function generateFirmFiles(jsonPath: any): Promise<void>;
    export function readFirmFiles(filePath: any): Promise<string>;
    export function readQmkFile(kb: any, filePath: any): Promise<string>;
    export function write(filePath: any, obj: any): Promise<void>;
    export function writeFirmFiles(filePath: any, obj: any): Promise<void>;
    export function writeQmkFile(kb: any, filePath: any, obj: any): Promise<void>;
    export function cpConfigsToQmk(kbDir: any): Promise<void>;
    export function cpConfigsToVial(kbDir: any): Promise<void>;
    export function cpConfigsToCustom(dir: any, kbDir: any): Promise<void>;
    export function cpDefaultToVail(kbDir: any): Promise<void>;
    export function mvQmkConfigsToVolume(kbDir: any): Promise<void>;
}
export function streamResponse(res: any, fn: any): Promise<void>;
export function streamError(res: any, e: any): void;
export function streamEnd(res: any, msg: any): void;
declare const dirClient: "/root/keyboards";
declare const dirQMK: "/root/qmk_firmware";
declare const dirVial: "/root/vial-qmk";
export {};
