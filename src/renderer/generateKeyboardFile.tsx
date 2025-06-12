import React, {useState} from 'react'
import { Button, Label, TextInput, Select, HelperText } from 'flowbite-react'

import {useStateContext} from "../context"
import { useI18n } from '../hooks/useI18n'

const {api} = window

interface GenerateKeyboardFileProps {
    onShowLogModal?: () => void;
    onOperationComplete?: () => void;
}

const GenerateKeyboardFile: React.FC<GenerateKeyboardFileProps> = ({onShowLogModal, onOperationComplete}): React.ReactElement => {
    const {state, setState, setPageLog} = useStateContext()
    const { t } = useI18n()
    
    const [keyboardError, setKeyboardError] = useState(false)
    const [usernameEmptyError, setUsernameEmptyError] = useState(false)
    const [keyboardStrError, setKeyboardStrError] = useState(false)
    const [usernameStrError, setUsernameStrError] = useState(false)

    const [disabledBuildButton, setDisabledBuildButton] = useState(true)
    const [disabledBuildText, setDisabledBuildText] = useState(false)

    const [qmkFile, setQmkFile] = useState(true)

    // Guard against uninitialized state
    if (!state || !state.generate) {
        return <div>Loading...</div>
    }

    const validBuildButton = (): void => {
        const qmkFile = state.generate?.qmkFile || {}
        const reg = /^[A-Za-z0-9_/-]+$/
        let validKeyboardStrError = false
        let validUsernameStrError = false

        if(qmkFile.kb && qmkFile.kb.length > 0){
            validKeyboardStrError = (reg).test(qmkFile.kb)
            setKeyboardStrError(!validKeyboardStrError)
        }
        if(qmkFile.user && qmkFile.user.length > 0){
            validUsernameStrError = (reg).test(qmkFile.user)
            setUsernameStrError(!validUsernameStrError)
        }

        const validDisableButton = Boolean(qmkFile.kb && qmkFile.user && validKeyboardStrError && validUsernameStrError)
        setDisabledBuildButton(!validDisableButton)
    }

    const qmkFileDisabledBuildButton = (): boolean => {
        validBuildButton()
        setQmkFile(false)
        return disabledBuildButton
    }

    const handleTextChange = (inputName: string): ((e: React.ChangeEvent<HTMLInputElement>) => void) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (!state || !state.generate?.qmkFile) return
        if (inputName === 'kb') {
            state.generate.qmkFile.kb = e.target.value
        } else {
            state.generate.qmkFile.user = e.target.value
        }
        setKeyboardError(!state.generate.qmkFile.kb)
        setUsernameEmptyError(!state.generate.qmkFile.user)
        validBuildButton()
        void setState(state)
    }

    const handleSelectMCU = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        if (!state || !state.generate?.qmkFile) return
        state.generate.qmkFile.mcu = e.target.value
        void setState(state)
    }

    const generateMsg: string = "Generating...."
    const handleQmkFileSubmit = (): (() => Promise<void>) => async (): Promise<void> => {
        setDisabledBuildButton(true)
        setDisabledBuildText(true)
        if (!state) return
        
        // Show log modal when generate starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        setPageLog('generateKeyboardFile', generateMsg)
        state.tabDisabled = true
        void setState(state)

        const logs = await api.generateQMKFile(state.generate?.qmkFile || {})

        setDisabledBuildButton(false)
        setDisabledBuildText(false)
        setPageLog('generateKeyboardFile', logs as string)
        state.tabDisabled = false
        void setState(state)
        
        if (onOperationComplete) {
            onOperationComplete()
        }
    }

    
    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    
                    <div className="grid grid-cols-1 gap-4 mb-6">
                        <div>
                            <Label className="mb-2 block" htmlFor="generate-qmkFile-mcu-select">{t('common.mcu')}</Label>
                            <Select
                                id="generate-qmkFile-mcu-select"
                                value={state.generate?.qmkFile?.mcu || 'RP2040'}
                                onChange={handleSelectMCU}
                                required
                            >
                                <option value="RP2040">RP2040</option>
                                <option value="promicro">Pro Micro</option>
                            </Select>
                        </div>
                        
                        <div>
                            <Label
                                className={`mb-2 block ${keyboardError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                htmlFor="generate-qmkFile-kb"
                            >
{t('common.keyboardName')} *
                            </Label>
                            <TextInput
                                type="text"
                                id="generate-qmkFile-kb"
                                required
                                color={keyboardError ? "failure" : "gray"}
                                disabled={disabledBuildText}
                                onChange={handleTextChange("kb")}
                                value={state.generate?.qmkFile?.kb || ''}
                            />
                            {keyboardStrError && (
                                <HelperText className="mt-2 text-sm text-red-600 dark:text-red-500">
                                    {t('validation.alphanumericOnly')}
                                </HelperText>
                            )}
                        </div>
                        
                        <div>
                            <Label
                                className={`mb-2 block ${usernameEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                htmlFor="km"
                            >
{t('common.username')} *
                            </Label>
                            <TextInput
                                type="text"
                                id="km"
                                required
                                color={usernameEmptyError ? "failure" : "gray"}
                                disabled={disabledBuildText}
                                onChange={handleTextChange("user")}
                                value={state.generate?.qmkFile?.user || ''}
                            />
                            {usernameStrError && (
                                <HelperText className="mt-2 text-sm text-red-600 dark:text-red-500">
                                    {t('validation.alphanumericOnly')}
                                </HelperText>
                            )}
                        </div>
                    </div>
                    
                    <Button
                        color="blue"
                        className={`w-full ${(qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        style={(qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton) ? { opacity: 0.5 } : {}}
                        onClick={(qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton) ? (): void => {} : handleQmkFileSubmit()}
                        disabled={false}
                    >
{t('generate.generateButton')}
                    </Button>
                </div>
                
            </div>
        </div>
    )
}
export default GenerateKeyboardFile