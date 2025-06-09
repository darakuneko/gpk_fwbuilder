import React, {useState} from "react"
import {useStateContext} from "../context.jsx"
import { Button, Label, TextInput, Select } from 'flowbite-react'

const {api} = window

const Generate = () => {
    const {state, setState} = useStateContext()
    const [keyboardError, setKeyboardError] = useState(false)
    const [usernameEmptyError, setUsernameEmptyError] = useState(false)
    const [keyboardStrError, setKeyboardStrError] = useState(false)
    const [usernameStrError, setUsernameStrError] = useState(false)

    const [disabledBuildButton, setDisabledBuildButton] = useState(true)
    const [disabledBuildText, setDisabledBuildText] = useState(false)
    const [disabledVialID, setDisabledVialID] = useState(false)

    const [qmkFile, setQmkFile] = useState(true)

    const validBuildButton = () => {
        const qmkFile = state.generate.qmkFile
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
        inputName === 'kb' ? state.generate.qmkFile.kb = e.target.value : state.generate.qmkFile.user = e.target.value
        setKeyboardError(!state.generate.qmkFile.kb)
        setUsernameEmptyError(!state.generate.qmkFile.user)
        validBuildButton()
        setState(state)
    }

    const handleSelectMCU = (e) => {
        state.generate.qmkFile.mcu = e.target.value
        setState(state)
    }

    const generateMsg =  "Generating...."
    const handleQmkFileSubmit =  () => async () => {
        setDisabledBuildButton(true)
        setDisabledBuildText(true)
        setDisabledVialID(true)
        state.logs = generateMsg
        state.tabDisabled = true
        setState(state)

        const logs = await api.generateQMKFile(state.generate.qmkFile)

        setDisabledBuildButton(false)
        setDisabledBuildText(false)
        setDisabledVialID(false)
        state.logs = logs
        state.tabDisabled = false
        setState(state)
    }

    const handleVailIdSubmit =  () => async () => {
        state.logs = generateMsg
        state.tabDisabled = true
        setState(state)
        const logs = await api.generateVialId()
        state.logs = logs
        state.tabDisabled = false
        setState(state)
    }

    
    return (
        <div className="px-4 flex flex-col justify-center">
            <div className="pt-2 flex content-center justify-between">
                <div className="pt-3 text-center w-[150px]">
                    QMK<br />Keyboard File
                </div>
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="generate-qmkFile-mcu-select" value="MCU" />
                    </div>
                    <Select
                        id="generate-qmkFile-mcu-select"
                        value={state.generate.qmkFile.mcu}
                        onChange={handleSelectMCU}
                        required
                    >
                        <option value="RP2040">RP2040</option>
                        <option value="promicro">Pro Micro</option>
                    </Select>
                </div>
                <div className="pt-2">
                    <div className="mb-2 block">
                        <Label
                            htmlFor="generate-qmkFile-kb"
                            value="keyboard *"
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
                        value={state.generate.qmkFile.kb}
                        className="w-60"
                    />
                    {keyboardStrError && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                            A-Za-z0-9_/- can used
                        </p>
                    )}
                </div>
                <div className="pt-2">
                    <div className="mb-2 block">
                        <Label
                            htmlFor="km"
                            value="username *"
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
                        value={state.generate.qmkFile.user}
                        className="w-60"
                    />
                    {usernameStrError && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                            A-Za-z0-9_/- can used
                        </p>
                    )}
                </div>
                <div className="pl-4 pt-4 flex justify-center items-center">
                    <Button
                        color="blue"
                        className={(qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton) ? 'cursor-not-allowed' : 'cursor-pointer'}
                        style={(qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton) ? { opacity: 0.5 } : {}}
                        onClick={(qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton) ? () => {} : handleQmkFileSubmit()}
                        disabled={false}
                    >
                        Generate
                    </Button>
                </div>
            </div>
            <div className="pt-2 flex content-center justify-between">
                <div className="text-center w-[150px]">
                    Vial<br />Unique ID
                </div>
                <div className="flex justify-center items-center">
                    <Button
                        color="blue"
                        className={disabledVialID ? 'cursor-not-allowed' : 'cursor-pointer'}
                        style={disabledVialID ? { opacity: 0.5 } : {}}
                        onClick={disabledVialID ? () => {} : handleVailIdSubmit("VialId")}
                        disabled={false}
                    >
                        Generate
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default Generate