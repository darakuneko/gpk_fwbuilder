// Test data for API testing

export const mockVialLayout = {
  layout: [
    [
      ["KC_ESC", "KC_1", "KC_2", "KC_3", "KC_4", "KC_5"],
      ["KC_TAB", "KC_Q", "KC_W", "KC_E", "KC_R", "KC_T"],
      ["KC_CAPS", "KC_A", "KC_S", "KC_D", "KC_F", "KC_G"],
      ["KC_LSFT", "KC_Z", "KC_X", "KC_C", "KC_V", "KC_B"]
    ]
  ]
}

export const mockQMKBuildRequest = {
  kb: 'planck',
  km: 'default', 
  tag: '0.19.3'
}

export const mockVialBuildRequest = {
  kb: 'reviung/reviung41',
  km: 'default',
  tag: 'vial'
}

export const mockCustomBuildRequest = {
  id: 'custom-fw',
  kb: 'planck', 
  km: 'default',
  tag: 'main'
}

export const mockKLELayout = [
  [{"w": 1.5}, "Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", {"w": 1.5}, "\\"],
  [{"w": 1.75}, "Caps Lock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", {"w": 2.25}, "Enter"],
  [{"w": 2.25}, "Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", {"w": 2.75}, "Shift"],
  [{"w": 1.25}, "Ctrl", {"w": 1.25}, "Win", {"w": 1.25}, "Alt", {"w": 6.25}, "", {"w": 1.25}, "Alt", {"w": 1.25}, "Win", {"w": 1.25}, "Menu", {"w": 1.25}, "Ctrl"]
]

export const mockKeyboardInfo = {
  keyboard_name: "test_keyboard",
  maintainer: "test_user", 
  processor: "atmega32u4",
  bootloader: "atmel-dfu",
  diode_direction: "COL2ROW",
  matrix_pins: {
    cols: ["F4", "F5", "F6", "F7"],
    rows: ["D4", "D6", "D7", "B4"]
  },
  layouts: {
    LAYOUT: {
      layout: [
        {"x": 0, "y": 0, "matrix": [0, 0]},
        {"x": 1, "y": 0, "matrix": [0, 1]},
        {"x": 2, "y": 0, "matrix": [0, 2]},
        {"x": 3, "y": 0, "matrix": [0, 3]}
      ]
    }
  }
}