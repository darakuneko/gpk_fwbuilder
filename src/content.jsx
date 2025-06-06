import React, {useEffect, useState} from 'react'
import {getState, useStateContext} from "./context.jsx"
import { Sidebar, Spinner, Button, Modal } from 'flowbite-react'
import { HiCube, HiCollection, HiRefresh, HiServer, HiPhotograph, HiCog, HiChevronRight, HiX } from 'react-icons/hi'
import Build from "./renderer/build.jsx"
import Logs from "./renderer/logs.jsx"
import parse from 'html-react-parser'
import Repository from "./renderer/repository.jsx"
import Image from "./renderer/image.jsx"
import Generate from "./renderer/generate.jsx"
import GenerateKeyboardFile from "./renderer/generateKeyboardFile.jsx"
import GenerateVialId from "./renderer/generateVialId.jsx"
import Convert from "./renderer/convert.jsx"
import ConvertVialToKeymap from "./renderer/convertVialToKeymap.jsx"
import ConvertKleToKeyboard from "./renderer/convertKleToKeyboard.jsx"
import Setting from "./renderer/setting.jsx"
import ExternalServer from "./renderer/externalServer.jsx"

const {api} = window

const Content = () => {
    const {state, setState} = useStateContext()
    const [initServer, setInitServer] = useState(true)
    const [closeServer, setCloseServer] = useState(false)
    const [expandedMenu, setExpandedMenu] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [modalContent, setModalContent] = useState(null)
    const [modalTitle, setModalTitle] = useState('')

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

    const handleCloseModal = () => {
        setShowModal(false)
        setModalContent(null)
        setModalTitle('')
    }



    const menuStructure = [
        { 
            label: "Build", 
            icon: HiCube,
            component: (onClose) => <Build onClose={onClose}/>,
            hasSubmenu: false,
            title: "Build Firmware"
        },
        { 
            label: "Generate", 
            icon: HiCollection,
            hasSubmenu: true,
            subItems: [
                { 
                    label: "Keyboard File", 
                    component: (onClose) => <GenerateKeyboardFile onClose={onClose}/>,
                    title: "QMK Keyboard File Generation"
                },
                { 
                    label: "Vial Unique ID", 
                    component: (onClose) => <GenerateVialId onClose={onClose}/>,
                    title: "Vial Unique ID Generation"
                }
            ]
        },
        { 
            label: "Convert", 
            icon: HiRefresh,
            hasSubmenu: true,
            subItems: [
                { 
                    label: "Vial to Keymap.c", 
                    component: (onClose) => <ConvertVialToKeymap onClose={onClose}/>,
                    title: "Convert Vial File to Keymap.c"
                },
                { 
                    label: "KLE to Keyboard File", 
                    component: (onClose) => <ConvertKleToKeyboard onClose={onClose}/>,
                    title: "Convert KLE Json to QMK/Vial Files"
                }
            ]
        },
        { 
            label: "Setting",
            icon: HiCog,
            hasSubmenu: true,
            subItems: [
                { 
                    label: "Repository", 
                    component: (onClose) => <Repository onClose={onClose}/>,
                    title: "Repository Management"
                },
                { 
                    label: "Image", 
                    component: (onClose) => <Image onClose={onClose}/>,
                    title: "Docker Image Management"
                },
                { 
                    label: "External Server", 
                    component: (onClose) => <ExternalServer onClose={onClose}/>,
                    title: "External Server Settings"
                }
            ]
        }
    ]

    const openModal = (title, component) => {
        setModalTitle(title)
        setModalContent(component)
        setShowModal(true)
    }

    const handleMenuClick = (menuItem, index) => {
        if (!state.tabDisabled) {
            if (menuItem.hasSubmenu) {
                if (menuItem.subItems.length === 1) {
                    // Single submenu - open modal directly
                    openModal(menuItem.subItems[0].title, menuItem.subItems[0].component(handleCloseModal))
                } else {
                    // Multiple submenus - expand/collapse
                    if (expandedMenu === index) {
                        setExpandedMenu(null)
                    } else {
                        setExpandedMenu(index)
                    }
                }
            } else {
                // No submenu - open modal directly
                openModal(menuItem.title, menuItem.component(handleCloseModal))
            }
        }
    }

    const handleSubMenuClick = (parentIndex, subItem) => {
        if (!state.tabDisabled) {
            openModal(subItem.title, subItem.component(handleCloseModal))
        }
    }

    const handleContextMenu = (e) => {
        // Allow default context menu for all elements now that Electron handles it
        // No need to prevent default anymore
    }

    return (
        <div 
            className="min-h-screen" 
            style={{ 
                backgroundColor: 'var(--color-background)', 
                color: 'var(--color-text-primary)',
                userSelect: 'none'
            }}
            onContextMenu={handleContextMenu}
        >
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
                                        {menuStructure.map((menu, index) => (
                                            <div key={menu.label}>
                                                <Sidebar.Item
                                                    icon={menu.icon}
                                                    active={false}
                                                    onClick={() => handleMenuClick(menu, index)}
                                                    className={`${state.tabDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${menu.hasSubmenu ? 'flex items-center justify-between' : ''}`}
                                                >
                                                    <span>{menu.label}</span>
                                                    {menu.hasSubmenu && menu.subItems.length > 1 && (
                                                        <HiChevronRight 
                                                            className={`ml-auto transition-transform ${expandedMenu === index ? 'rotate-90' : ''}`}
                                                        />
                                                    )}
                                                </Sidebar.Item>
                                                {menu.hasSubmenu && menu.subItems.length > 1 && expandedMenu === index && (
                                                    <div className="ml-6">
                                                        {menu.subItems.map((subItem, subIndex) => (
                                                            <Sidebar.Item
                                                                key={subItem.label}
                                                                active={false}
                                                                onClick={() => handleSubMenuClick(index, subItem)}
                                                                className={`${state.tabDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-sm`}
                                                            >
                                                                {subItem.label}
                                                            </Sidebar.Item>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </Sidebar.ItemGroup>
                                </Sidebar.Items>
                            </Sidebar>
                            
                            {/* Main Content Area - Logs Only */}
                            <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
                                <Logs/>
                            </div>
                            
                            {/* Modal for Settings */}
                            <Modal
                                show={showModal}
                                onClose={handleCloseModal}
                                size="5xl"
                                position="center"
                            >
                                <Modal.Header>
                                    {modalTitle}
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="max-h-[70vh] overflow-y-auto">
                                        {modalContent}
                                    </div>
                                </Modal.Body>
                            </Modal>
                        </div>
                    )
                }
            })()}
        </div>
    )
}
export default Content