import React, {useState} from "react"
import {useStateContext} from "../context"
import { Button, Label, TextInput, Select, HelperText } from 'flowbite-react'
import { cleanLogText } from '../utils/logParser'

const {api} = window

interface GenerateKeyboardFileProps {
    onOperationComplete?: () => void;
}

const GenerateKeyboardFile: React.FC<GenerateKeyboardFileProps> = ({onOperationComplete}) => {
    const {state, setState, setPageLog, getPageLog} = useStateContext()
    
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

    const validBuildButton = () => {
        const qmkFile = state.generate?.qmkFile || {}
        const reg = /^[A-Za-z0-9_/-]+$/
        let validKeyboardStrError = false
        let validUsernameStrError = false

        if(qmkFile.kb.length > 0){
            validKeyboardStrError = (reg).test(qmkFile.kb)
            setKeyboardStrError(!validKeyboardStrError)
        }
        if(qmkFile.user.length > 0){
            validUsernameStrError = (reg).test(qmkFile.user)
            setUsernameStrError(!validUsernameStrError)
        }

        const validDisableButton = qmkFile.kb && qmkFile.user && validKeyboardStrError && validUsernameStrError
        setDisabledBuildButton(!validDisableButton)
    }

    const qmkFileDisabledBuildButton = () => {
        validBuildButton()
        setQmkFile(false)
        return disabledBuildButton
    }

    const handleTextChange = (inputName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!state.generate?.qmkFile) return
        inputName === 'kb' ? state.generate.qmkFile.kb = e.target.value : state.generate.qmkFile.user = e.target.value
        setKeyboardError(!state.generate.qmkFile.kb)
        setUsernameEmptyError(!state.generate.qmkFile.user)
        validBuildButton()
        setState(state)
    }

    const handleSelectMCU = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!state.generate?.qmkFile) return
        state.generate.qmkFile.mcu = e.target.value
        setState(state)
    }

    const generateMsg: string = "Generating...."
    const handleQmkFileSubmit = () => async () => {
        setDisabledBuildButton(true)
        setDisabledBuildText(true)
        setPageLog('generateKeyboardFile', generateMsg)
        state.tabDisabled = true
        setState(state)

        const logs = await api.generateQMKFile(state.generate?.qmkFile || {})

        setDisabledBuildButton(false)
        setDisabledBuildText(false)
        setPageLog('generateKeyboardFile', logs)
        state.tabDisabled = false
        setState(state)
        
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
                            <Label className="mb-2 block" htmlFor="generate-qmkFile-mcu-select">MCU</Label>
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
                                Keyboard *
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
                                    A-Za-z0-9_/- can be used
                                </HelperText>
                            )}
                        </div>
                        
                        <div>
                            <Label
                                className={`mb-2 block ${usernameEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                htmlFor="km"
                            >
                                Username *
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
                                    A-Za-z0-9_/- can be used
                                </HelperText>
                            )}
                        </div>
                    </div>
                    
                    <Button
                        color="blue"
                        className={`w-full ${(qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        style={(qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton) ? { opacity: 0.5 } : {}}
                        onClick={(qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton) ? () => {} : handleQmkFileSubmit()}
                        disabled={false}
                    >
                        Generate
                    </Button>
                </div>
                
                {/* Inline Log Display */}
                {getPageLog('generateKeyboardFile') && (
                    <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                        <div className="mb-3">
                            <Label className="block text-sm font-medium text-gray-900 dark:text-white">
                                Generation Log
                            </Label>
                        </div>
                        <textarea
                            value={cleanLogText(getPageLog('generateKeyboardFile')) || ''}
                            readOnly
                            className="w-full font-mono text-sm bg-gray-900 text-white rounded p-4 resize-none border-0 focus:outline-none focus:ring-0"
                            style={{ 
                                minHeight: '200px',
                                maxHeight: '400px',
                                whiteSpace: 'pre',
                                overflowWrap: 'normal',
                                wordBreak: 'normal'
                            }}
                            placeholder="Logs will appear here..."
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
export default GenerateKeyboardFile