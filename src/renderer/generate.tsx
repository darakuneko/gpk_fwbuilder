import React, {useState} from 'react'
import { Button, Label, TextInput, Select, HelperText } from 'flowbite-react'

import {useStateContext} from "../context"

const {api} = window

const Generate = (): React.ReactElement => {
    const {state, setState} = useStateContext()
    const [keyboardError, setKeyboardError] = useState(false)
    const [usernameEmptyError, setUsernameEmptyError] = useState(false)
    const [keyboardStrError, setKeyboardStrError] = useState(false)
    const [usernameStrError, setUsernameStrError] = useState(false)

    const [disabledBuildButton, setDisabledBuildButton] = useState(true)
    const [disabledBuildText, setDisabledBuildText] = useState(false)
    const [disabledVialID, setDisabledVialID] = useState(false)

    const [qmkFile, setQmkFile] = useState(true)

    const validBuildButton = (): void => {
        if (!state) return
        const qmkFile = state.generate.qmkFile
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
        if (!state) return
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
        if (!state) return
        state.generate.qmkFile.mcu = e.target.value
        void setState(state)
    }

    const generateMsg =  "Generating...."
    const handleQmkFileSubmit = (): (() => Promise<void>) => async (): Promise<void> => {
        setDisabledBuildButton(true)
        setDisabledBuildText(true)
        setDisabledVialID(true)
        if (!state) return
        state.logs = generateMsg
        state.tabDisabled = true
        void setState(state)

        const logs = await api.generateQMKFile(state.generate.qmkFile)

        setDisabledBuildButton(false)
        setDisabledBuildText(false)
        setDisabledVialID(false)
        state.logs = logs as string
        state.tabDisabled = false
        void setState(state)
    }

    const handleVailIdSubmit = (): (() => Promise<void>) => async (): Promise<void> => {
        if (!state) return
        state.logs = generateMsg
        state.tabDisabled = true
        void setState(state)
        const logs = await api.generateVialId()
        state.logs = logs as string
        state.tabDisabled = false
        void setState(state)
    }

    
    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* QMK Keyboard File Generation */}
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Generate template QMK keyboard configuration files for your custom keyboard project.
                    </p>
                    
                    {/* Configuration Parameters */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded p-4 mb-4">
                        <h5 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Configuration Parameters</h5>
                        <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label className="mb-1 block" htmlFor="generate-qmkFile-mcu-select">MCU</Label>
                            <Select
                                id="generate-qmkFile-mcu-select"
                                value={state?.generate.qmkFile.mcu || 'RP2040'}
                                onChange={handleSelectMCU}
                                required
                                sizing="sm"
                            >
                                <option value="RP2040">RP2040</option>
                                <option value="promicro">Pro Micro</option>
                            </Select>
                        </div>
                        <div>
                            <Label
                                className={`mb-1 block ${keyboardError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                htmlFor="generate-qmkFile-kb"
                            >
                                Keyboard Name *
                            </Label>
                            <TextInput
                                type="text"
                                id="generate-qmkFile-kb"
                                required
                                color={keyboardError ? "failure" : "gray"}
                                disabled={disabledBuildText}
                                onChange={handleTextChange("kb")}
                                value={state?.generate.qmkFile.kb || ''}
                                sizing="sm"
                            />
                            {keyboardStrError && (
                                <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    A-Za-z0-9_/- can be used
                                </HelperText>
                            )}
                        </div>
                        <div>
                            <Label
                                className={`mb-1 block ${usernameEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
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
                                value={state?.generate.qmkFile.user || ''}
                                sizing="sm"
                            />
                            {usernameStrError && (
                                <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    A-Za-z0-9_/- can be used
                                </HelperText>
                            )}
                        </div>
                    </div>
                    </div>
                    
                    {/* Generate Action */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                        <h5 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Generate Files</h5>
                        <Button
                            color="blue"
                            className={`w-full ${(qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            style={(qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton) ? { opacity: 0.5 } : {}}
                            onClick={(qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton) ? (): void => {} : handleQmkFileSubmit()}
                            disabled={false}
                        >
                            Generate
                        </Button>
                    </div>
                </div>
                
                {/* Vial Unique ID Generation */}
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Generate a unique identifier for Vial keyboard configuration. Each keyboard needs a unique ID.
                    </p>
                    
                    {/* ID Generation Action */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                        <h5 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Generate ID</h5>
                        <Button
                            color="blue"
                            className={`w-full ${disabledVialID ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            style={disabledVialID ? { opacity: 0.5 } : {}}
                            onClick={disabledVialID ? (): void => {} : handleVailIdSubmit()}
                            disabled={false}
                        >
                            Generate Unique ID
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Generate