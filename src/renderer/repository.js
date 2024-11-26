import React, {useState} from "react"
import {useStateContext} from "../context.js"
import {textFieldLongWidth} from "../style.js"
import {Button, TextField, MenuItem, Select, Box} from "@mui/material";

const {api} = window

const Repository = () => {
    const {state, setState} = useStateContext()
    const [disabledBuildButton, setDisabledBuildButton] = useState(false)

    const isStaticFirmware = (firmware) => firmware === "QMK" || firmware === "Vial"
    const handleSelectFW = (e) => {
        state.repository.firmware = e.target.value
        setState(state)
    }

    const handleTextChange = (e) => {
        state.repository.firmwares = state.repository.firmwares
            .map(v => v.id === state.repository.firmware ? { ...v, url: e.target.value } : v);
        setState(state)
    }

    const handleUpdate = (msg1, msg2) => async () => {
        state.logs = msg1
        state.tabDisabled = true
        setState(state)
        if(isStaticFirmware(state.repository.firmware)) {
            await api.updateRepository(state.repository.firmware)
        } else {
            const obj = state.repository.firmwares.find(v => v.id === state.repository.firmware)
            await api.updateRepositoryCustom(obj)
        }

        let id
        const checkFn = async () => {
            const buildCompleted = await api.buildCompleted()
            const exist = await api.existSever()
            if (buildCompleted && exist) {
                state.build.tags = await api.tags()
                state.build.tag = state.build.tags[0]
                state.logs = msg2
                state.tabDisabled = false
                setState(state)
                clearInterval(id)
            }
        }
        id = setInterval(await checkFn, 1000)
    }

    return (
        <>
            <Box
                sx={{
                    pt: 2,
                    display: 'flex',
                    alignContent: 'center',
                    justifyContent: 'center'
                }}>
                <Box>
                    <Select
                        id="repository-fw-select"
                        label="Firmware"
                        value={state.repository.firmware}
                        onChange={handleSelectFW}
                        required>
                        {state.repository.firmwares.map((fw, i) =>
                            (<MenuItem
                                key={`repository-fw-select${fw.id}`}
                                value={fw.id}
                                selected={i === 0}
                            >{fw.id}</MenuItem>)
                        )}
                    </Select>
                </Box>
                <Box>
                    <TextField
                        id={`repository-custom-url`}
                        label="git clone url"
                        variant="standard"
                        onChange={handleTextChange}
                        style={{width: textFieldLongWidth}}
                        value={state.repository.firmwares.find(v => v.id === state.repository.firmware).url}
                        disabled={isStaticFirmware(state.repository.firmware)}
                        required
                    />
                </Box>
                <Box
                    sx={{
                        pl: 4,
                        pt: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    <Button variant="contained"
                            onClick={
                                handleUpdate("Updating.....\n\nIt will take a few minutes.\n\n",
                                    "Updated!!")
                            }
                            disabled={state.tabDisabled}
                    >Update</Button>
                </Box>
            </Box>
            <Box
                sx={{
                    pt: 2,
                    height: '40px',
                    textAlign: "center"
                }}
            >
                If it stops due to a network error or other problem, please press the button again.
            </Box>
        </>

    )
}
export default Repository