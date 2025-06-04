import { describe, it, expect } from 'vitest'
import { vial2c } from '../../src/vial2c/vial2c'
import { mockVialLayout } from '../helpers/mock-data'

describe('vial2c converter', () => {
  it('should convert valid Vial layout to C code', () => {
    const result = vial2c(mockVialLayout)
    
    expect(result).toContain('#include QMK_KEYBOARD_H')
    expect(result).toContain('const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS]')
    expect(result).toContain('LAYOUT(')
    expect(result).toContain('KC_ESC')
  })

  it('should handle empty layout gracefully', () => {
    const emptyLayout = { layout: [] }
    const result = vial2c(emptyLayout)
    
    expect(result).toContain('#include QMK_KEYBOARD_H')
    expect(result).toContain('const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS]')
  })

  it('should handle invalid input gracefully', () => {
    const invalidLayout = { invalid: 'data' }
    const result = vial2c(invalidLayout as any)
    
    expect(result).toBe('')
  })

  it('should filter out -1 values from layout', () => {
    const layoutWithFillers = {
      layout: [
        [
          ["KC_ESC", -1, "KC_1", "KC_2"],
          ["KC_TAB", "KC_Q", -1, "KC_W"]
        ]
      ]
    }
    
    const result = vial2c(layoutWithFillers)
    
    expect(result).not.toContain('-1')
    expect(result).toContain('KC_ESC')
    expect(result).toContain('KC_Q')
  })

  it('should handle keycode aliases correctly', () => {
    const layoutWithAliases = {
      layout: [
        [
          ["KC_NUMLOCK", "KC_KP_SLASH", "KC_ESCAPE"],
          ["KC_BSPACE", "KC_ENTER", "KC_SPACE"]
        ]
      ]
    }
    
    const result = vial2c(layoutWithAliases)
    
    // Check that aliases are resolved
    expect(result).toContain('KC_NLCK') // KC_NUMLOCK -> KC_NLCK
    expect(result).toContain('KC_PSLS') // KC_KP_SLASH -> KC_PSLS
    expect(result).toContain('KC_ESC')  // KC_ESCAPE -> KC_ESC
    expect(result).toContain('KC_BSPC') // KC_BSPACE -> KC_BSPC
    expect(result).toContain('KC_ENT')  // KC_ENTER -> KC_ENT
    expect(result).toContain('KC_SPC')  // KC_SPACE -> KC_SPC
  })

  it('should handle multiple layers', () => {
    const multiLayerLayout = {
      layout: [
        [["KC_ESC", "KC_1"], ["KC_TAB", "KC_Q"]],
        [["KC_F1", "KC_F2"], ["KC_F3", "KC_F4"]]
      ]
    }
    
    const result = vial2c(multiLayerLayout)
    
    expect(result).toContain('[0] = LAYOUT(')
    expect(result).toContain('[1] = LAYOUT(')
  })
})