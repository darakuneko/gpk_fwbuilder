import { createContext, useContext } from 'react'

export type Language = 'en' | 'ja'

export interface I18nContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string, params?: Record<string, string>) => string
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function useI18n(): I18nContextType {
    const context = useContext(I18nContext)
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider')
    }
    return context
}