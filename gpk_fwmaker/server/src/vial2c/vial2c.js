const KC_ALIASES = {
//  "KC_TRNS": "KC_TRANSPARENT",
    "KC_NUMLOCK": "KC_NLCK",
    "KC_KP_SLASH": "KC_PSLS",
    "KC_KP_ASTERISK": "KC_PAST",
    "KC_KP_MINUS": "KC_PMNS",
    "KC_KP_PLUS": "KC_PPLS",
    "KC_KP_ENTER": "KC_PENT",
    "KC_KP_1": "KC_P1",
    "KC_KP_2": "KC_P2",
    "KC_KP_3": "KC_P3",
    "KC_KP_4": "KC_P4",
    "KC_KP_5": "KC_P5",
    "KC_KP_6": "KC_P6",
    "KC_KP_7": "KC_P7",
    "KC_KP_8": "KC_P8",
    "KC_KP_9": "KC_P9",
    "KC_KP_0": "KC_P0",
    "KC_KP_DOT": "KC_PDOT",
    "KC_KP_EQUAL": "KC_PEQL",
    "KC_KP_COMMA": "KC_PCMM",
    "KC_PSCREEN": "KC_PSCR",
    "KC_SCROLLLOCK": "KC_SLCK", // "KC_BRMD",
    "KC_PAUSE": "KC_PAUS", // "KC_BRK", "KC_BRMU",
    "KC_INSERT": "KC_INS",
    "KC_DELETE": "KC_DEL",
    "KC_PGDOWN": "KC_PGDN",
    "KC_RIGHT": "KC_RGHT",
    "KC_ENTER": "KC_ENT",
    "KC_ESCAPE": "KC_ESC",
    "KC_BSPACE": "KC_BSPC",
    "KC_SPACE": "KC_SPC",
    "KC_MINUS": "KC_MINS",
    "KC_EQUAL": "KC_EQL",
    "KC_LBRACKET": "KC_LBRC",
    "KC_RBRACKET": "KC_RBRC",
    "KC_BSLASH": "KC_BSLS",
    "KC_SCOLON": "KC_SCLN",
    "KC_QUOTE": "KC_QUOT",
    "KC_GRAVE": "KC_GRV", // "KC_ZKHK",
    "KC_COMMA": "KC_COMM",
    "KC_SLASH": "KC_SLSH",
    "KC_CAPSLOCK": /*"KC_CLCK",*/ "KC_CAPS",
    "KC_APPLICATION": "KC_APP",
    "KC_LCTRL": "KC_LCTL",
    "KC_LSHIFT": "KC_LSFT",
    "KC_LALT": "KC_LOPT",
//  "KC_LGUI": "KC_LCMD", "KC_LWIN",
    "KC_RCTRL": "KC_RCTL",
    "KC_RSHIFT": "KC_RSFT",
//  "KC_RALT": "KC_ALGR", "KC_ROPT",
//  "KC_RGUI": "KC_RCMD", "KC_RWIN",
    "KC_NONUS_HASH": "KC_NUHS",
    "KC_NONUS_BSLASH": "KC_NUBS",
    "KC_RO": "KC_INT1",
    "KC_KANA": "KC_INT2",
    "KC_JYEN": "KC_INT3",
    "KC_HENK": "KC_INT4",
    "KC_MHEN": "KC_INT5",
    "KC_LANG1": "KC_LNG1", // "KC_HAEN",
    "KC_LANG2": "KC_LNG2", // "KC_HANJ",
    "KC_LANG3": "KC_LNG3",
    "KC_LANG4": "KC_LNG4",
    "KC_LANG5": "KC_LNG5",
    "KC_LANG6": "KC_LNG6",
    "KC_LANG7": "KC_LNG7",
    "KC_LANG8": "KC_LNG8",
    "KC_LANG9": "KC_LNG9",
    "KC_PWR": "KC_SYSTEM_POWER",
    "KC_SLEP": "KC_SYSTEM_SLEEP",
    "KC_WAKE": "KC_SYSTEM_WAKE",
    "KC_EXEC": "KC_EXECUTE",
    "KC_SLCT": "KC_SELECT",
    "KC_AGIN": "KC_AGAIN",
    "KC_PSTE": "KC_PASTE",
    "KC_CALC": "KC_CALCULATOR",
    "KC_MSEL": "KC_MEDIA_SELECT",
    "KC_MYCM": "KC_MY_COMPUTER",
    "KC_WSCH": "KC_WWW_SEARCH",
    "KC_WHOM": "KC_WWW_HOME",
    "KC_WBAK": "KC_WWW_BACK",
    "KC_WFWD": "KC_WWW_FORWARD",
    "KC_WSTP": "KC_WWW_STOP",
    "KC_WREF": "KC_WWW_REFRESH",
    "KC_WFAV": "KC_WWW_FAVORITES",
    "KC_BRIU": "KC_BRIGHTNESS_UP",
    "KC_BRID": "KC_BRIGHTNESS_DOWN",
    "KC_MPRV": "KC_MEDIA_PREV_TRACK",
    "KC_MNXT": "KC_MEDIA_NEXT_TRACK",
    "KC_MUTE": "KC_AUDIO_MUTE",
    "KC_VOLD": "KC_AUDIO_VOL_DOWN",
    "KC_VOLU": "KC_AUDIO_VOL_UP",
    "KC_MSTP": "KC_MEDIA_STOP",
    "KC_MPLY": "KC_MEDIA_PLAY_PAUSE",
    "KC_MRWD": "KC_MEDIA_REWIND",
    "KC_MFFD": "KC_MEDIA_FAST_FORWARD",
    "KC_EJCT": "KC_MEDIA_EJECT",
    "KC_MS_U": "KC_MS_UP",
    "KC_MS_D": "KC_MS_DOWN",
    "KC_MS_L": "KC_MS_LEFT",
    "KC_MS_R": "KC_MS_RIGHT",
    "KC_BTN1": "KC_MS_BTN1",
    "KC_BTN2": "KC_MS_BTN2",
    "KC_BTN3": "KC_MS_BTN3",
    "KC_BTN4": "KC_MS_BTN4",
    "KC_BTN5": "KC_MS_BTN5",
    "KC_WH_U": "KC_MS_WH_UP",
    "KC_WH_D": "KC_MS_WH_DOWN",
    "KC_WH_L": "KC_MS_WH_LEFT",
    "KC_WH_R": "KC_MS_WH_RIGHT",
    "KC_ACL0": "KC_MS_ACCEL0",
    "KC_ACL1": "KC_MS_ACCEL1",
    "KC_ACL2": "KC_MS_ACCEL2",
    "KC_LCAP": "KC_LOCKING_CAPS",
    "KC_LNUM": "KC_LOCKING_NUM",
    "KC_LSCR": "KC_LOCKING_SCROLL"
};

const KC_PATTERN = '(KC_[A-Z0-9_]+)';

const keyCodePattern = [
    { pattern: new RegExp(KC_PATTERN), result: (p1) => resolveAlias(p1) },
    { pattern: new RegExp(`^C_S\\(${KC_PATTERN}\\)`), result: (p1) => `LCTL(LSFT(${p1}))`},
    { pattern: new RegExp(`^HYPR\\(${KC_PATTERN}\\)`), result: (p1) => `LCTL(LSFT(LALT(LGUI(${p1}))))`},
    { pattern: new RegExp(`^MEH\\(${KC_PATTERN}\\)`), result: (p1) => `LCTL(LSFT(LALT(${p1})))`},
    { pattern: new RegExp(`^LCAG\\(${KC_PATTERN}\\)`), result: (p1) => `LCTL(LALT(LGUI(${p1})))`},
    { pattern: new RegExp(`^SGUI\\(${KC_PATTERN}\\)`), result: (p1) => `LGUI(LSFT(${p1}))`},
    { pattern: new RegExp(`^LCA\\(${KC_PATTERN}\\)`), result: (p1) => `LCTL(LALT(${p1}))`},
    { pattern: new RegExp(`^LSA\\(${KC_PATTERN}\\)`), result: (p1) => `LSFT(LALT(${p1}))`},
    { pattern: new RegExp(`^RSA\\(${KC_PATTERN}\\)`), result: (p1) => `RSFT(RALT(${p1}))`},
    { pattern: new RegExp(`^RCS\\(${KC_PATTERN}\\)`), result: (p1) => `RCTL(RSFT(${p1}))`},
    { pattern: new RegExp(`^LCG\\(${KC_PATTERN}\\)`), result: (p1) => `LCTL(LGUI(${p1}))`},
    { pattern: new RegExp(`^RCG\\(${KC_PATTERN}\\)`), result: (p1) => `RCTL(RGUI(${p1}))`},
    { pattern: new RegExp(`^LT([0-9]+)\\(${KC_PATTERN}\\)`), result: (p1, p2) => `LT(${p1}, ${p2})`},
];

const resolveAlias = (key) => KC_ALIASES[key] || key

const translateKeycode = (keycode) => keyCodePattern
        .reduce((acc, { pattern, result }) => acc.replace(pattern, (_, p1, p2) => result(p1, p2)), keycode)

const template = (keymap) => `/* SPDX-License-Identifier: GPL-2.0-or-later */
#include QMK_KEYBOARD_H

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
${keymap}
};
`

const vial2c = (json) => {
    if (!json.layout || !Array.isArray(json.layout)) {
        console.warn("Layout is not found or not in the correct format.");
        return "";
    }

    const keymap = json.layout
        .map((layout, layoutIndex) => {
            if (!Array.isArray(layout)) return null;

            const rows = layout
                .map((row) => {
                    const codes =
                        Array.isArray(row) ?
                            row.filter((col) => col !== -1).map(translateKeycode).join(", ") : ""
                    return `\t\t${codes}`
                })
                .join(",\n");

            return `\t[${layoutIndex}] = LAYOUT(\n${rows}\n\t)`;
        })
        .filter(Boolean)
        .join(",\n");

    return template(keymap)
}

module.exports.vial2c = vial2c
