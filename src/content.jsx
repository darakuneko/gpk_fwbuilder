import React, {useEffect, useState} from 'react'
import {getState, useStateContext} from "./context.jsx"
import { Sidebar, Spinner, Button } from 'flowbite-react'
import { HiCube, HiCollection, HiRefresh, HiServer, HiPhotograph, HiCog } from 'react-icons/hi'
import Build from "./renderer/build.jsx"
import Logs from "./renderer/logs.jsx"
import parse from 'html-react-parser'
import Repository from "./renderer/repository.jsx"
import Image from "./renderer/image.jsx"
import Generate from "./renderer/generate.jsx"
import Convert from "./renderer/convert.jsx"
import Setting from "./renderer/setting.jsx"

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
                if (exist === 200 || exist === 503) {
                    const reStoreState = await api.getState()
                    state.version = await api.appVersion()
                    state.storePath = await api.getStorePath()
                    if (reStoreState?.build) state.build = reStoreState.build
                    if (reStoreState?.generate) state.generate = reStoreState.generate
                    if (reStoreState?.convert) state.convert = reStoreState.convert
                    if (reStoreState?.repository) state.repository = reStoreState.repository
                    if (reStoreState?.setting) state.setting = reStoreState.setting
                    state.setting.fwDir = state.setting.fwDir ? state.setting.fwDir : await api.getLocalFWdir()
                    state.build.tags = await api.tags()
                    state.build.tag = state.build.tag ? state.build.tag : state.build.tags[0]
                    state.logs = exist === 503 ? `Skipped docker check` : ""
                    setState(state)
                    clearInterval(id)
                    setInitServer(false)
                } else if (exist === 404) {
                    state.logs = 'connecting....\nIf the connection does not work for a long time, please start up again or delete the docker image once.'
                    setState(state)
                }
            }
            id = setInterval(await checkFn, 1000)
        }
        fn()
        return () => {
        }
    }, [])

    useEffect(() => {
        api.on("close", async () => {
            setCloseServer(true)
            const state = await getState()
            await api.setState(state)
        })
        return () => {
        }
    }, [])

    useEffect(() => {
        api.on("streamLog", async (log, init) => {
            const s = init ? state : await getState()
            s.logs = log
            setState(s)
        })
        return () => {
        }
    }, [])

    useEffect(() => {
        api.on("streamBuildLog", async (log) => {
            const state = await getState()
            log.match(/@@@@init@@@@/m) ? state.logs = '' : state.logs = state.logs + log
            setState(state)
        })
        return () => {
        }
    }, [])

    const handleSkipDockerCheck = async () => {
        await api.setSkipCheckDocker(true)
    }

    const handleChange = (tabIndex) => {
        setTab(tabIndex)
        state.logs = ''
        setState(state)
    }

    const tabHeight = (tab) => {
        if (tab === 2) return '300px'
        return '400px'
    }

    const tabs = [
        { label: "Build", component: <Build/> },
        { label: "Generate", component: <Generate/> },
        { label: "Convert", component: <Convert/> },
        { label: "Repository", component: <Repository/> },
        { label: "Image", component: <Image/> },
        { label: "Setting", component: <Setting/> }
    ]

    return (
        <div className="min-h-screen" style={{ 
            backgroundColor: 'var(--color-background)', 
            color: 'var(--color-text-primary)' 
        }}>
            {(() => {
                if (closeServer) {
                    return (
                        <div className="flex justify-center items-center min-h-screen">
                            <div className="w-[300px] h-[200px] text-center">
                                <div className="pt-4 text-blue-400 animate-pulse text-lg font-medium">Terminating.....</div>
                            </div>
                        </div>
                    )
                } else if (initServer) {
                    return (
                        <div className="flex justify-center p-4">
                            <div className="min-w-full text-center">
                                <div className="p-4 text-center">
                                    <Spinner size="lg" className="mb-4" />
                                    <div className="text-blue-400 animate-pulse text-lg font-medium mb-2">Initializing.....</div>
                                    <div className="text-blue-400 animate-pulse text-sm">May take more than 10 minutes</div>
                                </div>
                                <Button 
                                    color="blue"
                                    className="mt-4"
                                    onClick={handleSkipDockerCheck}
                                >
                                    Skip Docker Check
                                </Button>
                                <div className="pt-8 text-left">{parse(state.logs.replace(/\n/g, "<br>"))}</div>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div className="flex h-screen">
                            {/* Sidebar Navigation */}
                            <Sidebar className="w-64 h-screen bg-gray-50 dark:bg-gray-800">
                                <Sidebar.Items>
                                    <Sidebar.ItemGroup>
                                        <Sidebar.Item
                                            icon={HiCube}
                                            active={tab === 0}
                                            onClick={() => !state.tabDisabled && handleChange(0)}
                                            className={state.tabDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        >
                                            Build
                                        </Sidebar.Item>
                                        <Sidebar.Item
                                            icon={HiCollection}
                                            active={tab === 1}
                                            onClick={() => !state.tabDisabled && handleChange(1)}
                                            className={state.tabDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        >
                                            Generate
                                        </Sidebar.Item>
                                        <Sidebar.Item
                                            icon={HiRefresh}
                                            active={tab === 2}
                                            onClick={() => !state.tabDisabled && handleChange(2)}
                                            className={state.tabDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        >
                                            Convert
                                        </Sidebar.Item>
                                        <Sidebar.Item
                                            icon={HiServer}
                                            active={tab === 3}
                                            onClick={() => !state.tabDisabled && handleChange(3)}
                                            className={state.tabDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        >
                                            Repository
                                        </Sidebar.Item>
                                        <Sidebar.Item
                                            icon={HiPhotograph}
                                            active={tab === 4}
                                            onClick={() => !state.tabDisabled && handleChange(4)}
                                            className={state.tabDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        >
                                            Image
                                        </Sidebar.Item>
                                        <Sidebar.Item
                                            icon={HiCog}
                                            active={tab === 5}
                                            onClick={() => !state.tabDisabled && handleChange(5)}
                                            className={state.tabDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        >
                                            Setting
                                        </Sidebar.Item>
                                    </Sidebar.ItemGroup>
                                </Sidebar.Items>
                            </Sidebar>
                            
                            {/* Main Content Area */}
                            <div className="flex-1 flex flex-col">
                                {/* Main Content */}
                                <div className="overflow-y-auto p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700" style={{ height: tabHeight(tab) }}>
                                    {tabs[tab].component}
                                </div>
                                
                                {/* Logs Area */}
                                <div 
                                    className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900"
                                    style={{ height: `calc(100vh - ${tabHeight(tab)})` }}
                                >
                                    <Logs/>
                                </div>
                            </div>
                        </div>
                    )
                }
            })()}
        </div>
    )
}
export default Content