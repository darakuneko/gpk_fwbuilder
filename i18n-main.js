import ElectronStore from 'electron-store'

import { en } from './src/locales/en.js'
import { ja } from './src/locales/ja.js'

const store = new ElectronStore()

const translations = {
    en,
    ja
}

export const getTranslation = (key) => {
    const state = store.get('state')
    const language = state?.setting?.language || 'en'
    
    const keys = key.split('.')
    let translation = translations[language]
    
    for (const k of keys) {
        translation = translation?.[k]
        if (!translation) break
    }
    
    return translation || key
}