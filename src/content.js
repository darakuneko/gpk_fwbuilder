import React, {useEffect, useState} from 'react'
import Box from "@mui/material/Box"
import {getState, useStateContext} from "./context"
import Form from "./renderer/form"
import Logs from "./renderer/logs"
import {buildBoxHeight, neon, neonKeyFrame} from "./style";
import parse from 'html-react-parser';

const {api} = window

const Content = () => {
    const {state, setState} = useStateContext()
    const [initServer, setInitServer] = useState(true);
    const [closeServer, setCloseServer] = useState(false);

    useEffect(  () => {
        const fn = async () => {
            let id
            const checkFn = async () => {
                const exist = await api.existSever()
                if(exist){
                    const reStoreState = await api.getState()
                    if(reStoreState) {
                        state.fw = reStoreState.fw
                        state.kb = reStoreState.kb
                        state.km = reStoreState.km
                        state.selectedFW = reStoreState.selectedFW
                        state.selectedTag = reStoreState.selectedTag
                    }
                    state.tags = await api.tags()
                    state.selectedTag = state.selectedTag ? state.selectedTag : state.tags[0]
                    setState(state)
                    clearInterval(id)
                    setInitServer(false)
                }
            }
            id = setInterval(await checkFn, 1000)
        }
        fn()
        return () => {}
    }, [])

    useEffect(() => {
        api.on("close", async () => {
            const state = await getState()
            await api.setState(state)
            setCloseServer(true)
        })
        return () => {}
    }, [])

    useEffect(() => {
        api.on("upImage", async (log) => {
            state.logs.stdout = log
            setState(state)
        })
        return () => {}
    }, [])

    return (
        <div>
            <style>
                {neonKeyFrame}
            </style>
            {(() => {
                if (closeServer) {
                    return (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: "100vh"
                            }} >
                            <Box
                                sx={{
                                    width: "300px",
                                    height: "200px",
                                    textAlign: "center"
                                }}
                            >
                                <Box sx={{ pt: 4, animation: neon }}>Terminating.....</Box>
                            </Box>
                        </Box>
                    )
                } else if (initServer) {
                    return (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                p: 4,
                            }} >
                            <Box sx={{ minWidth: "100%" }}>
                                <Box sx={{ p: 4, animation: neon, textAlign: "center"}}>Initializing.....</Box>
                                <Box sx={{ animation: neon, textAlign: "center" }}>May take more than 10 minutes</Box>
                                <Box sx={{ p: 4, textAlign: "left", width: "90%"}}>{parse(state.logs.stdout.replace(/\n/g, "<br>"))}</Box>
                            </Box>
                        </Box>
                    )
                } else {
                    return (
                        <>
                        <Box
                            sx={{
                                height: buildBoxHeight,
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTextField-root': { ml: 4, mt: 1, width: '25ch' }
                            }} >
                            <Form />
                        </Box>
                        <Box
                            sx={{
                                overflow: "auto",
                                height: `calc(100vh - ${buildBoxHeight})`
                            }}>
                            <Logs />
                        </Box>
                    </>
                    )
                }
            })()}
        </div>
    )
}
export default Content