// Vial conversion related types

export interface VialJson {
    layout?: VialLayout;
}

export type VialLayout = VialRow[][];

export type VialRow = VialKeycode[];

export type VialKeycode = string | number;

export interface KeyCodePattern {
    pattern: RegExp;
    result: (p1: string, p2?: string) => string;
}

export interface VialConversionResult {
    keymap: string;
    success: boolean;
    error?: string;
}