import React, {useCallback, useEffect, useRef, useState} from 'react'
import Box from "@mui/material/Box"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import {getState, useStateContext} from "./context"
import Build from "./renderer/build"
import Logs from "./renderer/logs"
import {buildBoxHeight, convertBoxHeight, neon, neonKeyFrame} from "./style"
import parse from 'html-react-parser'
import Tool from "./renderer/tool"
import Generate from "./renderer/generate";
import Convert from "./renderer/convert";

const {api} = window

const Content = () => {
    const {state, setState} = useStateContext()
    const [initServer, setInitServer] = useState(true)
    const [closeServer, setCloseServer] = useState(false)
    const [tab, setTab] = useState(0)

    useEffect(() => {
        const fn = async () => {
            let id
            const checkFn = async () => {
                const exist = await api.existSever()
                if(exist === 200){
                    const reStoreState = await api.getState()
                    state.version = await api.appVersion()
                    if(reStoreState && reStoreState.version === state.version) {
                        state.build = reStoreState.build
                        state.generate = reStoreState.generate
                        state.convert = reStoreState.convert
                    }
                    state.build.tags = await api.tags()
                    state.build.tag = state.build.tag ? state.build.tag : state.build.tags[0]
                    state.logs = ''
                    setState(state)
                    clearInterval(id)
                    setInitServer(false)
                } else if(exist === 404) {
                    state.logs = 'connecting....\nIf the connection does not work for a long time, please start up again or delete the docker image once.'
                    setState(state)
                }
            }
            id = setInterval(await checkFn, 1000)
        }
        fn()
        return () => {}
    }, [])

    useEffect(() => {
        api.on("close", async () => {
            setCloseServer(true)
            const state = await getState()
            await api.setState(state)
        })
        return () => {}
    }, [])

    useEffect(() => {
        api.on("streamLog", async (log, init) => {
            const s = init ? state : await getState()
            s.logs = log
            setState(s)
        })
        return () => {}
    }, [])

    useEffect(() => {
        api.on("streamBuildLog", async (log) => {
            const state = await getState()
            log.match(/@@@@init@@@@/m) ? state.logs = '' : state.logs = state.logs + log
            setState(state)
        })
        return () => {}
    }, [])

    const handleChange = (_, v) => {
        setTab(v)
        state.logs = ''
        setState(state)
    }

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
                                <Box sx={{ pt: 2, textAlign: "left"}}>{parse(state.logs.replace(/\n/g, "<br>"))}</Box>
                            </Box>
                        </Box>
                    )
                } else {
                    return (
                        <>
                        <Box
                            sx={{
                                height: tab === 2 ? convertBoxHeight : buildBoxHeight,
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTextField-root': { ml: 4, mt: 1, width: '25ch' }
                            }} >
                            <Tabs value={tab} onChange={handleChange} aria-label="basic tabs" sx={{ pl: 2}}>
                                <Tab label="Build" disabled={state.tabDisabled}/>
                                <Tab label="Generate" disabled={state.tabDisabled}/>
                                <Tab label="Convert" disabled={state.tabDisabled}/>
                                <Tab label="Tool" disabled={state.tabDisabled}/>
                            </Tabs>
                            {tab === 0 && <Build />}
                            {tab === 1 && <Generate />}
                            {tab === 2 && <Convert />}
                            {tab === 3 && <Tool />}
                        </Box>
                        <Box
                            sx={{
                                overflow: "auto",
                                height: `calc(100vh - ${tab === 2 ? convertBoxHeight : buildBoxHeight})`,
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