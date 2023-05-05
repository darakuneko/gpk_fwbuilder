import InputLabel from "@mui/material/InputLabel"
import Box from "@mui/material/Box"

import React, {useState} from "react"
import {useStateContext} from "../context"
import {inputLabelSmallFontSize} from "../style"
import Button from "@mui/material/Button"

const {api} = window

const Tool = () => {
    const {state, setState} = useStateContext()

    const handleUpdate = (msg1, msg2, fn) => async () => {
        state.logs = msg1
        state.tabDisabled = true
        setState(state)
        await fn()
        let id
        const checkFn = async () => {
            const buildCompleted = await api.buildCompleted()
            const exist = await api.existSever()
            if(buildCompleted && exist){
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
            <Box sx={{
                display: 'flex',
                flexFlow: 'wrap',
                alignContent: 'center',
                justifyContent: 'center',
                height: '140px'
            }}>
                <Box sx={{
                    p: 2,
                }}>
                    <InputLabel sx={{ fontSize: inputLabelSmallFontSize }} >QMK Repository</InputLabel>
                    <Button variant="contained"
                            onClick={
                                handleUpdate("Updating.....\n\nIt will take a few minutes.\n\n",
                                    "Updated!!",
                                    async () => await api.updateRepository("qmk")
                                )
                            }
                    >Update</Button>
                </Box>
                <Box sx={{
                    p: 2,
                }}>
                    <InputLabel sx={{ fontSize: inputLabelSmallFontSize }} >Vial Repository</InputLabel>
                    <Button variant="contained"
                            onClick={
                                handleUpdate("Updating.....\n\nIt will take a few minutes.\n\n",
                                    "Updated!!",
                                    async () => await api.updateRepository("vial")
                                )
                            }
                    >Update</Button>
                </Box>
                <Box sx={{
                    p: 2,
                }}>
                    <InputLabel sx={{ fontSize: inputLabelSmallFontSize }} >Image</InputLabel>
                    <Button variant="contained"
                            disabled={state.setting.fwMakerUrl.length > 0}
                            onClick={handleUpdate("Building.....\n\n", "Rebuild!!", async () => await api.rebuildImage())}
                    >Rebuild</Button>
                </Box>
            </Box>
            <Box
                sx={{
                    height: '40px',
                    textAlign: "center"
                }}
            >
                If it stops due to a network error or other problem, please press the button again.
            </Box>
        </>

    )
}
export default Tool