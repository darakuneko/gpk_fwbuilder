// API request/response types for GPK FWMaker

export interface BuildRequest {
    kb: string;
    km: string;
    tag?: string;
    commit?: string;
    useRepo?: boolean;
}

export interface QMKBuildRequest extends BuildRequest {
    tag: string;
}

export interface VialBuildRequest extends BuildRequest {
    commit?: string;
}

export interface CustomBuildRequest extends BuildRequest {
    fw: string;
    commit: string;
}

export interface UpdateRepositoryRequest {
    id: string;
    url: string;
}

export interface DeleteRepositoryRequest {
    id: string;
}

export interface CheckoutRequest {
    fw: string;
    tag?: string;
    commit?: string;
}

export interface ListKeyboardsRequest {
    fw: string;
}

export interface CopyKeyboardRequest {
    fw: string;
    kb: string;
}

export interface GenerateQMKFileRequest {
    kb: string;
    mcu: string;
    layout: string;
    user: string;
}

export interface ConvertViaJsonRequest {
    info: {
        keyboard_name?: string;
        usb?: {
            vid?: string;
            pid?: string;
        };
        matrix_size?: {
            rows?: number;
            cols?: number;
        };
    };
    kle: unknown[];
}

export interface ConvertKleQmkParams {
    kb: string;
    mcu: string;
    user: string;
    vid: string;
    pid: string;
    option: number;
    rows: string;
    cols: string;
}

export interface KeyboardInfo {
    kb: string;
    km: string[];
}

export interface ConvertVilKeymapRequest {
    vil: unknown;
}