import React, {useState} from "react"
import {useStateContext} from "../context.jsx"
import { Button, Label, TextInput, Select } from 'flowbite-react'

const {api} = window

const GenerateKeyboardFile = ({onShowLogModal, onOperationComplete}) => {
    const {state, setState} = useStateContext()
    
    // Guard against uninitialized state
    if (!state || !state.generate) {
        return <div>Loading...</div>
    }
    const [keyboardError, setKeyboardError] = useState(false)
    const [usernameEmptyError, setUsernameEmptyError] = useState(false)
    const [keyboardStrError, setKeyboardStrError] = useState(false)
    const [usernameStrError, setUsernameStrError] = useState(false)

    const [disabledBuildButton, setDisabledBuildButton] = useState(true)
    const [disabledBuildText, setDisabledBuildText] = useState(false)

    const [qmkFile, setQmkFile] = useState(true)

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

    const handleTextChange = (inputName) => (e) => {
        if (!state.generate?.qmkFile) return
        inputName === 'kb' ? state.generate.qmkFile.kb = e.target.value : state.generate.qmkFile.user = e.target.value
        setKeyboardError(!state.generate.qmkFile.kb)
        setUsernameEmptyError(!state.generate.qmkFile.user)
        validBuildButton()
        setState(state)
    }

    const handleSelectMCU = (e) => {
        if (!state.generate?.qmkFile) return
        state.generate.qmkFile.mcu = e.target.value
        setState(state)
    }

    const generateMsg =  "Generating...."
    const handleQmkFileSubmit =  () => async () => {
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        setDisabledBuildButton(true)
        setDisabledBuildText(true)
        state.logs = generateMsg
        state.tabDisabled = true
        setState(state)

        const logs = await api.generateQMKFile(state.generate?.qmkFile || {})

        setDisabledBuildButton(false)
        setDisabledBuildText(false)
        state.logs = logs
        state.tabDisabled = false
        setState(state)
        
        if (onOperationComplete) {
            onOperationComplete()
        }
    }

    
    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="generate-qmkFile-mcu-select" value="MCU" />
                        </div>
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
                        <div className="mb-2 block">
                            <Label
                                htmlFor="generate-qmkFile-kb"
                                value="Keyboard *"
                                color={keyboardError ? "failure" : "gray"}
                            />
                        </div>
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
                            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                A-Za-z0-9_/- can used
                            </p>
                        )}
                    </div>
                    
                    <div>
                        <div className="mb-2 block">
                            <Label
                                htmlFor="km"
                                value="Username *"
                                color={usernameEmptyError ? "failure" : "gray"}
                            />
                        </div>
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
                            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                A-Za-z0-9_/- can used
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="flex justify-center">
                    <Button
                        color="blue"
                        onClick={handleQmkFileSubmit()}
                        disabled={qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton}
                    >
                        Generate
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default GenerateKeyboardFile