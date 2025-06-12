import { en } from './en'
import { ja } from './ja'

export type Language = 'en' | 'ja'
export type TranslationKey = keyof typeof en

export const translations = {
  en,
  ja
}

export const languages = [
  { code: 'en' as const, name: 'English' },
  { code: 'ja' as const, name: '日本語' }
]

export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split('.').reduce((current: unknown, key: string): unknown => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj) as string || path
}

export function interpolate(template: string, params: Record<string, string> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key): string => params[key] || match)
}