import Box from "@mui/material/Box"

import React from "react"
import {useStateContext} from "../context"
import Button from "@mui/material/Button"

const {api} = window

const Image = () => {
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
            <Box sx={{
                display: 'flex',
                flexFlow: 'wrap',
                alignContent: 'center',
                justifyContent: 'center',
                height: '140px'
            }}>
                <Button variant="contained"
                        disabled={state.tabDisabled}
                        onClick={handleUpdate("Building.....\n\n", "Rebuild!!", async () => await api.rebuildImage())}
                >Image Rebuild</Button>
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
export default Image