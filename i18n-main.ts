import ElectronStore from 'electron-store'

import { en } from './src/locales/en.js'
import { ja } from './src/locales/ja.js'

const store = new ElectronStore()

type Language = 'en' | 'ja'

interface State {
    setting?: {
        language?: Language
    }
}

interface Translations {
    en: typeof en
    ja: typeof ja
}

const translations: Translations = {
    en,
    ja
}

export const getTranslation = (key: string): string => {
    const state = store.get('state') as State | undefined
    const language = state?.setting?.language || 'en'
    
    const keys = key.split('.')
    let translation: any = translations[language]
    
    for (const k of keys) {
        translation = translation?.[k]
        if (!translation) break
    }
    
    return translation || key
}