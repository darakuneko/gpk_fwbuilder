import React from 'react'
import { Label, Select } from 'flowbite-react'

import { useI18n } from '../hooks/useI18n'
import { languages } from '../locales'

const LanguageSettings = (): React.ReactElement => {
    const { t, language, setLanguage } = useI18n()

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const newLanguage = e.target.value as 'en' | 'ja'
        void setLanguage(newLanguage)
    }

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block" htmlFor="language">{t('settings.language')}</Label>
                            <Select
                                id="language"
                                value={language}
                                onChange={handleLanguageChange}
                            >
                                {languages.map((lang): React.ReactElement => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        
                        <div className="text-center space-y-2 pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('settings.restartRequired')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default LanguageSettings