import React, {useEffect, useState} from 'react'
import Box from "@mui/material/Box"
import {useStateContext} from "./context"
import Form from "./renderer/form"
import Logs from "./renderer/logs"
import {neon, neonKeyFrame} from "./style";

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
                    state.tags = await api.tags()
                    state.selectedTag = state.tags[0]
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
        api.on("close", async() => {
            setCloseServer(true)
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
                                <Box sx={{ p: 4, animation: neon }}>Initializing.....</Box>
                                <Box sx={{ animation: neon }}>May take more than 10 minutes</Box>
                            </Box>
                        </Box>
                    )
                } else {
                    return (
                        <>
                        <Box
                            sx={{
                                maxHeight: "200px",
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTextField-root': { ml: 4, mt: 1, width: '25ch' }
                            }} >
                            <Form />
                        </Box>
                        <Box
                            sx={{
                                overflow: "auto",
                                height: "calc(100vh - 200px)"
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