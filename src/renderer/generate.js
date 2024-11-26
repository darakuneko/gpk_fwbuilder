import React, {useState} from "react"
import {useStateContext} from "../context.js"
import {formHelperTextFontSize, inputLabelMiddleFontSize, textFieldMiddleWidth} from "../style.js"
import {Box, TextField, InputLabel, MenuItem, Select, Button, FormHelperText}from "@mui/material"

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

    const ValidTextField = (<FormHelperText error sx={{ pl: 4, fontSize: formHelperTextFontSize}}>A-Za-z0-9_/- can used</FormHelperText>)
    return (
        <Box sx={{
            pl: 4,
            pr: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            <Box
                sx={{
                    pt: 2,
                    display: 'flex',
                    alignContent: 'center',
                    justifyContent: 'space-between'}} >
                <Box sx={{ pt: 3, textAlign: "center", width: "150px"}} >QMK<br />Keyboard File</Box>
                <Box>
                    <InputLabel sx={{ fontSize: inputLabelMiddleFontSize }} >MCU</InputLabel>
                    <Select
                        id="generate-qmkFile-mcu-select"
                        label="MCU"
                        value={state.generate.qmkFile.mcu}
                        onChange={handleSelectMCU}
                        required>
                        <MenuItem key="generate-qmkFile-mcu-rp2040" value="RP2040">RP2040</MenuItem>
                        <MenuItem key="generate-qmkFile-mcu-promicro" value="promicro">Pro Micro</MenuItem>
                    </Select>
                </Box>
                <Box sx={{ pt: 2}}>
                    <TextField
                        id="generate-qmkFile-kb"
                        label="keyboard"
                        required
                        error={keyboardError}
                        disabled={disabledBuildText}
                        onChange={handleTextChange("kb")}
                        variant="standard"
                        style = {{width: textFieldMiddleWidth}}
                        value={state.generate.qmkFile.kb}
                    />
                    {keyboardStrError && ValidTextField}
                </Box>
                <Box sx={{ pt: 2}}>
                    <TextField
                        id="km"
                        label="username"
                        required
                        error={usernameEmptyError}
                        disabled={disabledBuildText}
                        onChange={handleTextChange("user")}
                        variant="standard"
                        style = {{width: textFieldMiddleWidth}}
                        value={state.generate.qmkFile.user}
                    />
                    {usernameStrError && ValidTextField}
                </Box>
                <Box
                    sx={{
                        pl: 4,
                        pt: 4,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                }} >
                    <Button variant="contained"
                            onClick={handleQmkFileSubmit()}
                            disabled={qmkFile ? qmkFileDisabledBuildButton() : disabledBuildButton }
                    >Generate</Button>
            </Box>
            </Box>
            <Box
                sx={{
                    pt: 2,
                    display: 'flex',
                    alignContent: 'center',
                    justifyContent: 'space-between'}} >
                <Box sx={{ textAlign: "center", width: "150px"}} >Vial<br />Unique ID</Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }} >
                    <Button variant="contained"
                            onClick={handleVailIdSubmit("VialId")}
                            disabled={ disabledVialID }
                    >Generate</Button>
                </Box>
            </Box>
        </Box>
    )
}
export default Generate