import React, {useEffect, useState, useMemo} from 'react'
import {getState, useStateContext} from "./context"
import { Sidebar, SidebarItems, SidebarItemGroup, SidebarItem, Spinner, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'flowbite-react'
import { HiCube, HiCollection, HiRefresh, HiServer, HiPhotograph, HiCog, HiChevronRight, HiX } from 'react-icons/hi'
import Build from "./renderer/build"
import Logs from "./renderer/logs"
import parse from 'html-react-parser'
import Repository from "./renderer/repository"
import Image from "./renderer/image"
import Generate from "./renderer/generate"
import GenerateKeyboardFile from "./renderer/generateKeyboardFile"
import GenerateVialId from "./renderer/generateVialId"
import Convert from "./renderer/convert"
import ConvertVialToKeymap from "./renderer/convertVialToKeymap"
import ConvertKleToKeyboard from "./renderer/convertKleToKeyboard"
import Setting from "./renderer/setting"
import ExternalServer from "./renderer/externalServer"
import { isOperationComplete } from './utils/logParser'

const {api} = window

const Content = () => {
    const {state, setState} = useStateContext()
    const [initServer, setInitServer] = useState(true)
    const [closeServer, setCloseServer] = useState(false)
    const [expandedMenu, setExpandedMenu] = useState(null)
    const [currentContent, setCurrentContent] = useState(null)
    const [currentTitle, setCurrentTitle] = useState('')
    const [currentPageKey, setCurrentPageKey] = useState('')
    const [currentHideShowLogsButton, setCurrentHideShowLogsButton] = useState(false)
    const [showLogModal, setShowLogModal] = useState(false)
    const [operationInProgress, setOperationInProgress] = useState(false)

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
                    state.logs = 'If the connection does not work for a long time, please start up again or delete the docker image once.'
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
            if (s) {
                s.logs = log
                setState(s)
                
                // Check if operation is in progress
                const isFinished = isOperationComplete(log)
                setOperationInProgress(s.tabDisabled && !isFinished)
            }
        })
        return () => {
        }
    }, [])

    useEffect(() => {
        api.on("streamBuildLog", async (log) => {
            const currentState = await getState()
            if (currentState) {
                log.match(/@@@@init@@@@/m) ? currentState.logs = '' : currentState.logs = currentState.logs + log
                setState(currentState)
                
                // Check if operation is in progress
                const isFinished = isOperationComplete(log)
                setOperationInProgress(currentState.tabDisabled && !isFinished)
            }
        })
        return () => {
        }
    }, [])

    // Monitor tabDisabled state changes
    useEffect(() => {
        if (state.logs) {
            const isFinished = isOperationComplete(state.logs)
            setOperationInProgress(state.tabDisabled && !isFinished)
        } else {
            setOperationInProgress(false)
        }
    }, [state.tabDisabled, state.logs])

    const handleSkipDockerCheck = async () => {
        await api.setSkipCheckDocker(true)
    }

    const handleShowLogModal = () => {
        setShowLogModal(true)
        setOperationInProgress(true)
    }

    const handleCloseLogModal = () => {
        if (!operationInProgress) {
            setShowLogModal(false)
        }
    }

    const handleOperationComplete = () => {
        setOperationInProgress(false)
    }



    const menuStructure = useMemo(() => [
        { 
            label: "Build", 
            icon: HiCube,
            component: () => <Build onShowLogModal={handleShowLogModal} onOperationComplete={handleOperationComplete}/>,
            hasSubmenu: false,
            title: "Build Firmware",
            pageKey: "build"
        },
        { 
            label: "Generate", 
            icon: HiCollection,
            hasSubmenu: true,
            subItems: [
                { 
                    label: "Keyboard File", 
                    component: () => <GenerateKeyboardFile onOperationComplete={handleOperationComplete}/>,
                    title: "QMK Keyboard File Generation",
                    hideShowLogsButton: true,
                    pageKey: "generateKeyboardFile"
                },
                { 
                    label: "Vial Unique ID", 
                    component: () => <GenerateVialId onOperationComplete={handleOperationComplete}/>,
                    title: "Vial Unique ID Generation",
                    hideShowLogsButton: true,
                    pageKey: "generateVialId"
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
                    component: () => <ConvertVialToKeymap onOperationComplete={handleOperationComplete}/>,
                    title: "Convert Vial File to Keymap.c",
                    hideShowLogsButton: true,
                    pageKey: "convertVialToKeymap"
                },
                { 
                    label: "KLE to Keyboard File", 
                    component: () => <ConvertKleToKeyboard onShowLogModal={handleShowLogModal} onOperationComplete={handleOperationComplete}/>,
                    title: "Convert KLE Json to QMK/Vial Files",
                    pageKey: "convertKleToKeyboard"
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
                    component: () => <Repository onShowLogModal={handleShowLogModal} onOperationComplete={handleOperationComplete}/>,
                    title: "Repository Management",
                    pageKey: "repository"
                },
                { 
                    label: "Image", 
                    component: () => <Image onShowLogModal={handleShowLogModal} onOperationComplete={handleOperationComplete}/>,
                    title: "Docker Image Management",
                    pageKey: "image"
                },
                { 
                    label: "External Server", 
                    component: () => <ExternalServer/>,
                    title: "External Server Settings",
                    hideShowLogsButton: true,
                    pageKey: "externalServer"
                }
            ]
        }
    ], [handleShowLogModal, handleOperationComplete])

    const showContent = (title, component, hideShowLogsButton = false, pageKey = '') => {
        setCurrentTitle(title)
        setCurrentContent(component)
        setCurrentHideShowLogsButton(hideShowLogsButton)
        setCurrentPageKey(pageKey)
    }

    const handleMenuClick = (menuItem, index) => {
        if (!state?.tabDisabled && state) {
            if (menuItem.hasSubmenu) {
                if (menuItem.subItems.length === 1) {
                    // Single submenu - show content directly
                    showContent(menuItem.subItems[0].title, menuItem.subItems[0].component(), menuItem.subItems[0].hideShowLogsButton, menuItem.subItems[0].pageKey)
                } else {
                    // Multiple submenus - expand/collapse
                    if (expandedMenu === index) {
                        setExpandedMenu(null)
                    } else {
                        setExpandedMenu(index)
                    }
                }
            } else {
                // No submenu - show content directly
                showContent(menuItem.title, menuItem.component(), menuItem.hideShowLogsButton, menuItem.pageKey)
            }
        }
    }

    const handleSubMenuClick = (_, subItem) => {
        if (!state?.tabDisabled && state) {
            showContent(subItem.title, subItem.component(), subItem.hideShowLogsButton, subItem.pageKey)
        }
    }

    const handleContextMenu = () => {
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
                        <div className="flex justify-center items-center h-screen">
                            <div className="text-center">
                                <div className="text-blue-400 animate-pulse text-lg font-medium">Terminating.....</div>
                            </div>
                        </div>
                    )
                } else if (initServer) {
                    return (
                        <div className="flex justify-center items-center h-screen">
                            <div className="text-center max-w-md w-full px-4">
                                <div className="mb-6">
                                    <Spinner size="lg" className="mb-4" />
                                    <div className="text-blue-400 animate-pulse text-lg font-medium mb-2">Initializing.....</div>
                                    <div className="text-blue-400 animate-pulse text-sm mb-4">May take more than 10 minutes</div>
                                </div>
                                <div className="flex justify-center mb-6">
                                    <Button 
                                        color="light"
                                        className="cursor-pointer"
                                        onClick={handleSkipDockerCheck}
                                    >
                                        Skip Docker Check
                                    </Button>
                                </div>
                                <div className="text-left text-sm max-h-40 overflow-y-auto">{parse(state.logs.replace(/\n/g, "<br>"))}</div>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div className="flex h-screen">
                            {/* Sidebar Navigation */}
                            <Sidebar className="w-64 h-screen bg-gray-50 dark:bg-gray-800">
                                <SidebarItems>
                                    <SidebarItemGroup>
                                        {menuStructure.map((menu, index) => (
                                            <div key={menu.label}>
                                                <div className="relative">
                                                    <SidebarItem
                                                        icon={menu.icon}
                                                        active={false}
                                                        onClick={() => handleMenuClick(menu, index)}
                                                        className={`${state?.tabDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} !h-12 !flex !items-center`}
                                                    >
                                                        <span className="flex-1">{menu.label}</span>
                                                    </SidebarItem>
                                                    {menu.hasSubmenu && menu.subItems.length > 1 && (
                                                        <HiChevronRight 
                                                            className={`absolute right-6 top-1/2 transform -translate-y-1/2 transition-transform ${expandedMenu === index ? 'rotate-90' : ''} pointer-events-none text-gray-400`}
                                                        />
                                                    )}
                                                </div>
                                                {menu.hasSubmenu && menu.subItems.length > 1 && expandedMenu === index && (
                                                    <div className="ml-6">
                                                        {menu.subItems.map((subItem) => (
                                                            <SidebarItem
                                                                key={subItem.label}
                                                                active={false}
                                                                onClick={() => handleSubMenuClick(index, subItem)}
                                                                className={`${state?.tabDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-sm flex items-center h-10`}
                                                            >
                                                                <span className="ml-3">{subItem.label}</span>
                                                            </SidebarItem>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </SidebarItemGroup>
                                </SidebarItems>
                            </Sidebar>
                            
                            {/* Main Content Area */}
                            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                                {currentContent ? (
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {currentTitle}
                                            </h2>
                                            {!currentHideShowLogsButton && (
                                                <Button
                                                    color="light"
                                                    className="cursor-pointer"
                                                    onClick={() => setShowLogModal(true)}
                                                >
                                                    Show Logs
                                                </Button>
                                            )}
                                        </div>
                                        {currentContent}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a menu item to get started
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Log Modal for Operations */}
                            <Modal
                                show={showLogModal}
                                size="7xl"
                                onClose={operationInProgress ? () => {} : handleCloseLogModal}
                                dismissible={!operationInProgress}
                                className={operationInProgress ? 'modal-disabled-close' : ''}
                            >
                                <ModalHeader>
                                    <div className="flex items-center justify-between w-full">
                                        <span>Operation Log</span>
                                    </div>
                                </ModalHeader>
                                <ModalBody className="p-1">
                                    <div className="h-[75vh] overflow-hidden p-1">
                                        <Logs pageKey={currentPageKey}/>
                                    </div>
                                </ModalBody>
                                
                                    <ModalFooter>
                                        <Button 
                                            color="light" 
                                            onClick={operationInProgress ? () => {} : handleCloseLogModal}
                                            disabled={false}
                                            className={operationInProgress ? 'cursor-not-allowed' : 'cursor-pointer'}
                                            style={operationInProgress ? { opacity: 0.5 } : {}}
                                        >
                                            Close
                                        </Button>
                                    </ModalFooter>
                                
                            </Modal>
                        </div>
                    )
                }
            })()}
        </div>
    )
}
export default Content