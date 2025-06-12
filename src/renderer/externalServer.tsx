import React from 'react'
import { Label, TextInput } from 'flowbite-react'

import {useStateContext} from "../context"
import { useI18n } from '../hooks/useI18n'

const {api} = window

const ExternalServer = (): React.ReactElement => {
    const {state, setState} = useStateContext()
    const { t } = useI18n()

    const handleDockeUrlChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        if (!state) return
        state.setting.fwMakerUrl = e.target.value
        if(state.setting.fwMakerUrl.length === 0) {
            state.setting.fwDir = await api.getLocalFWdir()
        }
        void setState(state)
    }

    const handleFwDirChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (!state) return
        state.setting.fwDir =e.target.value
        void setState(state)
    }


    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block" htmlFor="fwMakerUrl">{t('settings.fwMakerUrl')}</Label>
                            <TextInput
                                type="text"
                                id="fwMakerUrl"
                                onChange={handleDockeUrlChange}
                                value={state?.setting.fwMakerUrl || ""}
                                placeholder={t('settings.urlPlaceholder')}
                            />
                        </div>
                        
                        <div>
                            <Label className="mb-2 block" htmlFor="fwDir">{t('settings.fwDir')}</Label>
                            <TextInput
                                type="text"
                                id="fwDir"
                                onChange={handleFwDirChange}
                                value={state?.setting.fwDir || ""}
                            />
                        </div>
                        
                        <div className="text-center space-y-2 pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('settings.useLocalDocker')}
                            </p>
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
export default ExternalServer