import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import FormHelperText from '@mui/material/FormHelperText'

import React, {useState} from "react"
import {useStateContext} from "../context"
import {formHelperTextFontSize, inputLabelMiddleFontSize, textFieldMiddleWidth} from "../style"
import Button from "@mui/material/Button"
import Autocomplete from "@mui/material/Autocomplete"
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

const {api} = window

const Build = () => {
    const {state, setState} = useStateContext()
    const [keyboardEmptyError, setKeyboardEmptyError] = useState(false)
    const [keymapEmptyError, setKeymapEmptyError] = useState(false)
    const [keymapStrError, setKeymapStrError] = useState(false)
    const [disabledBuildButton, setDisabledBuildButton] = useState(true)
    const [disabledBuildText, setDisabledBuildText] = useState(false)
    const [disabledUseRepoButtonButton, setDisabledUseRepoButtonButton] = useState(false)
    const [init, setInit] = useState(true)
    const [keyboardList, setKeyboardList] = useState([])

    const handleSelectFW = (e) => {
        state.build.fw = e.target.value
        setState(state)
    }

    const validBuildButton = () => {
        const validKeymapStr = (/:|flash/).test(state.build.km)
        setKeymapStrError(validKeymapStr)
        const validDisableButton = state.build.kb && state.build.km && !validKeymapStr
        setDisabledBuildButton(!validDisableButton)
        setDisabledUseRepoButtonButton(validKeymapStr)
    }

    const initDisabledBuildButton = () => {
        validBuildButton()
        setInit(false)
        return disabledBuildButton
    }
    const handleTextChange = (inputName) => (e, v) => {
        if (inputName === 'kb') state.build.kb = v ? v.label : ''
        if (inputName === 'km') state.build.km = v ? v.label : ''
        if (inputName === 'commit') state.build.commit = e.target.value

        setKeyboardEmptyError(!state.build.kb)
        setKeymapEmptyError(!state.build.km)
        validBuildButton()
        setState(state)
    }

    const handleKbFocus = async () => {
        const c = state.build.useRepo ? await api.listRemoteKeyboards(state.build.fw) : await api.listLocalKeyboards()
        state.keyboardList.kb = c?.length > 0 ? c.map(v => {
            return {label: v.kb}
        }) : []
        setKeyboardList(c)
        setState(state)
    }

    const handleKmFocus = async () => {
        const obj = keyboardList.find(v => v.kb === state.build.kb)
        state.keyboardList.km = obj ? obj.km.map(v => {
            return {label: v}
        }) : []
        setState(state)
    }

    const handleSelectTags = (e) => {
        state.build.tag = e.target.value
        setState(state)
    }

    const handleUseRepoChange = (e) => {
        state.build.useRepo = e.target.checked
        setState(state)
    }
    const waiting = async (start, end, log) => {
        setDisabledBuildButton(true)
        setDisabledBuildText(true)
        state.logs = log
        state.tabDisabled = true
        setState(state)
        await start()
        let id
        const checkFn = async () => {
            const buildCompleted = await end()
            if (buildCompleted) {
                setDisabledBuildButton(false)
                setDisabledBuildText(false)
                state.tabDisabled = false
                setState(state)
                clearInterval(id)
            }
        }
        id = setInterval(checkFn, 1000)
    }

    const handleCheckout = async () => {
        const start = async () => await api.checkout({
            fw: state.build.fw.toLowerCase(),
            commit: state.build.commit,
            tag: state.build.tag
        })
        const end = async () => await api.buildCompleted()
        await waiting(start, end, "Checkout....")
    }

    const handleCopyKeyboardFile = async () => {
        await api.copyKeyboardFile({
            fw: state.build.fw.toLowerCase(),
            kb: state.build.kb
        })
    }

    const handleBuild = async () => {
        const start = async () => await api.build(state.build)
        const end = async () => await api.buildCompleted()
        await waiting(start, end,
            "Building....\n\nIt will take some time if the first build or tag has changed.\n\n")
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
        }}>
            {state.build.tags.length > 0 ? (
                <Box
                    sx={{
                        pt: 2,
                        display: 'flex',
                        alignContent: 'center',
                        justifyContent: 'center'
                    }}>
                    <Box>
                        <InputLabel sx={{fontSize: inputLabelMiddleFontSize}}>Firmware</InputLabel>
                        <Select
                            id="build-fw-select"
                            label="Firmware"
                            value={state.build.fw}
                            onChange={handleSelectFW}
                            required>
                            {state.repository.firmwares.map((fw, i) =>
                                (<MenuItem
                                    key={`fw-${fw.id}`}
                                    value={fw.id}
                                    selected={i === 0}
                                >{fw.id}</MenuItem>)
                            )}
                        </Select>
                    </Box>
                    {state.build.fw === "QMK" ? (
                        <Box sx={{pl: 4}}>
                            <InputLabel sx={{fontSize: inputLabelMiddleFontSize}}>Tag</InputLabel>
                            <Select
                                id="build-tags-select"
                                label="Tag"
                                value={state.build.tag}
                                onChange={handleSelectTags}
                                required>
                                {state.build.tags.map((tag, i) => (
                                    <MenuItem key={`tags-${i}`} value={tag}>{tag}</MenuItem>))}
                            </Select>
                        </Box>
                    ) : (
                        <Box sx={{pt: 2}}>
                            <TextField
                                id="build-commit"
                                label="commit(optional)"
                                disabled={disabledBuildText}
                                onChange={handleTextChange("commit")}
                                variant="standard"
                                value={state.build.commit}
                            />
                        </Box>
                    )}
                    <Box sx={{pt: 2}}>
                        <Autocomplete
                            fullWidth
                            options={state.keyboardList.kb}
                            renderInput={(params) =>
                                <TextField
                                    id="build-kb"
                                    label="keyboard"
                                    required
                                    error={keyboardEmptyError}
                                    onFocus={handleKbFocus}
                                    variant="standard"
                                    style={{width: textFieldMiddleWidth}}
                                    {...params}
                                />
                            }
                            value={state.build.kb}
                            disabled={disabledBuildText}
                            onChange={handleTextChange("kb")}
                        />

                    </Box>
                    <Box sx={{pt: 2}}>
                        <Autocomplete
                            fullWidth
                            options={state.keyboardList.km}
                            renderInput={(params) =>
                                <TextField
                                    id="build-km"
                                    label="keymap"
                                    required
                                    error={keymapEmptyError}
                                    onFocus={handleKmFocus}
                                    variant="standard"
                                    style={{width: textFieldMiddleWidth}}
                                    {...params}
                                />
                            }
                            value={state.build.km}
                            disabled={disabledBuildText}
                            onChange={handleTextChange("km")}
                        />
                        {
                            keymapStrError &&
                            <FormHelperText error sx={{pl: 4, fontSize: formHelperTextFontSize}}>":" "flash" cannot be
                                used</FormHelperText>
                        }
                    </Box>
                </Box>) : (<div/>)
            }
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                <FormGroup>
                    <FormControlLabel
                        control={<Checkbox checked={state.build.useRepo ? state.build.useRepo : false}
                                           onChange={handleUseRepoChange}/>}
                        label="Use Repository Keyboards File"/>
                </FormGroup>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                {state.build.useRepo && (
                    <>
                        <Button variant="contained"
                                onClick={handleCheckout}
                                disabled={disabledUseRepoButtonButton}
                                sx={{
                                    ml: '4px',
                                    mr: '4px'
                                }}
                        >Refresh Keyboard List</Button>
                        <Button variant="contained"
                                onClick={handleCopyKeyboardFile}
                                disabled={disabledUseRepoButtonButton}
                                sx={{
                                    ml: '4px',
                                    mr: '4px'
                                }}
                        >Copy Keyboard File</Button>
                    </>)
                }
                <Button variant="contained"
                        onClick={handleBuild}
                        disabled={init ? initDisabledBuildButton() : disabledBuildButton}
                        sx={{
                            ml: '4px',
                            mr: '4px'
                        }}
                >Build</Button>
            </Box>
        </Box>
    )
}
export default Build