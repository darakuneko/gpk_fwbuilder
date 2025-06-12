import React, { useState, useEffect, ReactNode } from 'react'

import { I18nContext, Language } from '../hooks/useI18n'
import { translations, getNestedValue, interpolate } from '../locales'

interface I18nProviderProps {
    children: ReactNode
    initialLanguage?: Language
}

const {api} = window

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
    children, 
    initialLanguage = 'en' 
}): React.ReactElement => {
    const [language, setLanguage] = useState<Language>(initialLanguage)

    // Load language from settings on mount
    useEffect((): void => {
        const loadLanguage = async (): Promise<void> => {
            try {
                const settings = await api.getSettings() as { language?: Language }
                if (settings?.language && (settings.language === 'en' || settings.language === 'ja')) {
                    setLanguage(settings.language)
                }
            } catch (error) {
                console.warn('Failed to load language setting:', error)
            }
        }
        void loadLanguage()
    }, [])

    const changeLanguage = async (newLanguage: Language): Promise<void> => {
        setLanguage(newLanguage)
        try {
            await api.setSettings({ language: newLanguage })
        } catch (error) {
            console.error('Failed to save language setting:', error)
        }
    }

    const t = (key: string, params?: Record<string, string>): string => {
        const translation = getNestedValue(translations[language], key)
        return params ? interpolate(translation, params) : translation
    }

    const value = {
        language,
        setLanguage: changeLanguage,
        t
    }

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    )
}