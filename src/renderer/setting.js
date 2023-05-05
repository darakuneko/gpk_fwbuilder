import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"

import React, {useState} from "react"
import {useStateContext} from "../context"
import {inputLabelSmallFontSize} from "../style"
import Button from "@mui/material/Button"
import {textFieldLongWidth} from "../style"

const {api} = window

const Setting = () => {
    const {state, setState} = useStateContext()

    const handleDockeUrlChange = async (e) => {
        state.setting.fwMakerUrl = e.target.value
        if(state.setting.fwMakerUrl.length === 0) {
            state.setting.fwDir = await api.getLocalFWdir()
        }
        setState(state)
    }

    const handleFwDirChange = (e) => {
        state.setting.fwDir =e.target.value
        setState(state)
    }

    return (
        <Box sx={{
            pl: 4,
            pr: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
        }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignContent: 'center',
                    }} >
                <Box sx={{ pt: 2}}>
                    <TextField
                        id="fwMakerUrl"
                        label="GPK FWMaker's URL"
                        onChange={handleDockeUrlChange}
                        variant="standard"
                        sx={{ mr: 4 }}
                        style = {{width: textFieldLongWidth}}
                        value={state.setting.fwMakerUrl ? state.setting.fwMakerUrl : ""}
                    />
                </Box>
                <Box sx={{ pt: 2 }}>
                    <TextField
                        id="fwDir"
                        label="GPK FWMaker's GPKFW Path"
                        onChange={handleFwDirChange}
                        variant="standard"
                        sx={{ mr: 4 }}
                        style = {{width: textFieldLongWidth }}
                        value={state.setting.fwDir ? state.setting.fwDir : ""}
                    />
                </Box>
            </Box>
            <Box
                sx={{
                    pt: 4,
                    height: '40px',
                    textAlign: "center"
                }}
            >
                Use local docker if URL is empty<br />
                Settings are saved when you exit, so you will need to restart the application.
            </Box>
        </Box>
    )
}
export default Setting