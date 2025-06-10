import React, {useEffect, useState, useMemo, useCallback} from 'react'
import { Sidebar, SidebarItems, SidebarItemGroup, SidebarItem, Spinner, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'flowbite-react'
import { HiCube, HiCollection, HiRefresh, HiCog, HiChevronRight } from 'react-icons/hi'
import type { IconType } from 'react-icons'
import parse from 'html-react-parser'

import {getState, useStateContext} from "./context"
import type { AppState } from "./context"
import Build from "./renderer/build"
import Logs from "./renderer/logs"
import Repository from "./renderer/repository"
import Image from "./renderer/image"
import GenerateKeyboardFile from "./renderer/generateKeyboardFile"
import GenerateVialId from "./renderer/generateVialId"
import ConvertVialToKeymap from "./renderer/convertVialToKeymap"
import ConvertKleToKeyboard from "./renderer/convertKleToKeyboard"
import ExternalServer from "./renderer/externalServer"
import { isOperationComplete } from './utils/logParser'

interface SubMenuItem {
    label: string;
    component: () => React.ReactNode;
    title: string;
    hideShowLogsButton?: boolean;
    pageKey: string;
}

interface MenuItem {
    label: string;
    icon: IconType;
    component?: () => React.ReactNode;
    hasSubmenu: boolean;
    title?: string;
    pageKey?: string;
    hideShowLogsButton?: boolean;
    subItems?: SubMenuItem[];
}

const {api} = window

const Content = (): React.JSX.Element => {
    const {state, setState} = useStateContext()
    const [initServer, setInitServer] = useState(true)
    const [closeServer, setCloseServer] = useState(false)
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
    const [currentContent, setCurrentContent] = useState<React.ReactNode>(null)
    const [currentTitle, setCurrentTitle] = useState('')
    const [currentPageKey, setCurrentPageKey] = useState('')
    const [currentHideShowLogsButton, setCurrentHideShowLogsButton] = useState(false)
    const [showLogModal, setShowLogModal] = useState(false)
    const [operationInProgress, setOperationInProgress] = useState(false)

    useEffect((): void => {
        const fn = async (): Promise<void> => {
            let id: ReturnType<typeof setInterval> | undefined
            const checkFn = async (): Promise<void> => {
                const exist = await api.existSever()
                if (exist === 200 || exist === 503) {
                    if (!state) return
                    const reStoreState = await api.getState() as unknown
                    state.version = await api.appVersion()
                    state.storePath = await api.getStorePath()
                    if (reStoreState && typeof reStoreState === 'object') {
                        const typedState = reStoreState as Partial<AppState>
                        if (typedState.build) state.build = typedState.build
                        if (typedState.generate) state.generate = typedState.generate
                        if (typedState.convert) state.convert = typedState.convert
                        if (typedState.repository) state.repository = typedState.repository
                        if (typedState.setting) state.setting = typedState.setting
                    }
                    const fwDir = await api.getLocalFWdir()
                    state.setting.fwDir = state.setting.fwDir || fwDir
                    const tags = await api.tags()
                    state.build.tags = tags
                    state.build.tag = state.build.tag || (tags.length > 0 ? tags[0]! : '')
                    state.logs = exist === 503 ? `Skipped docker check` : ""
                    void setState(state)
                    if (id) clearInterval(id)
                    setInitServer(false)
                } else if (exist === 404) {
                    if (!state) return
                    state.logs = 'If the connection does not work for a long time, please start up again or delete the docker image once.'
                    void setState(state)
                }
            }
            id = setInterval(checkFn, 1000)
        }
        void fn()
    }, [setState, state])

    useEffect((): (() => void) => {
        const closeHandler = async (): Promise<void> => {
            setCloseServer(true)
            const currentState = await getState()
            if (currentState) {
                await api.setState(currentState)
            }
        }
        
        const listener = api.on("close", closeHandler)
        return (): void => {
            api.off("close", listener)
        }
    }, [])

    useEffect((): (() => void) => {
        const streamLogHandler = async (log: string, init: boolean): Promise<void> => {
            const s = init ? state : await getState()
            if (s) {
                s.logs = log
                void setState(s)
                
                // Check if operation is in progress
                const isFinished = isOperationComplete(log)
                setOperationInProgress(s.tabDisabled && !isFinished)
            }
        }
        
        const listener = api.on("streamLog", streamLogHandler)
        return (): void => {
            api.off("streamLog", listener)
        }
    }, [setState, state])

    useEffect((): (() => void) => {
        const streamBuildLogHandler = async (log: string): Promise<void> => {
            const currentState = await getState()
            if (currentState) {
                const processedLog = log.match(/@@@@init@@@@/m) ? '' : currentState.logs + log
                currentState.logs = processedLog
                void setState(currentState)
                
                // Check if operation is in progress
                const isFinished = isOperationComplete(log)
                setOperationInProgress(currentState.tabDisabled && !isFinished)
            }
        }
        
        const listener = api.on("streamBuildLog", streamBuildLogHandler)
        return (): void => {
            api.off("streamBuildLog", listener)
        }
    }, [setState])

    // Monitor tabDisabled state changes
    useEffect((): void => {
        if (state?.logs) {
            const isFinished = isOperationComplete(state.logs)
            setOperationInProgress(state.tabDisabled && !isFinished)
        } else {
            setOperationInProgress(false)
        }
    }, [state?.tabDisabled, state?.logs])

    const handleSkipDockerCheck = async (): Promise<void> => {
        await api.setSkipCheckDocker(true)
    }

    const handleShowLogModal = useCallback((): void => {
        setShowLogModal(true)
        setOperationInProgress(true)
    }, [])

    const handleCloseLogModal = (): void => {
        if (!operationInProgress) {
            setShowLogModal(false)
        }
    }

    const handleOperationComplete = useCallback((): void => {
        setOperationInProgress(false)
    }, [])



    const menuStructure = useMemo<MenuItem[]>((): MenuItem[] => [
        { 
            label: "Build", 
            icon: HiCube,
            component: (): React.ReactElement => <Build onShowLogModal={handleShowLogModal} onOperationComplete={handleOperationComplete}/>,
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
                    component: (): React.ReactElement => <GenerateKeyboardFile onOperationComplete={handleOperationComplete}/>,
                    title: "QMK Keyboard File Generation",
                    hideShowLogsButton: true,
                    pageKey: "generateKeyboardFile"
                },
                { 
                    label: "Vial Unique ID", 
                    component: (): React.ReactElement => <GenerateVialId onOperationComplete={handleOperationComplete}/>,
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
                    component: (): React.ReactElement => <ConvertVialToKeymap onOperationComplete={handleOperationComplete}/>,
                    title: "Convert Vial File to Keymap.c",
                    hideShowLogsButton: true,
                    pageKey: "convertVialToKeymap"
                },
                { 
                    label: "KLE to Keyboard File", 
                    component: (): React.ReactElement => <ConvertKleToKeyboard onShowLogModal={handleShowLogModal} onOperationComplete={handleOperationComplete}/>,
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
                    component: (): React.ReactElement => <Repository onShowLogModal={handleShowLogModal} onOperationComplete={handleOperationComplete}/>,
                    title: "Repository Management",
                    pageKey: "repository"
                },
                { 
                    label: "Image", 
                    component: (): React.ReactElement => <Image onShowLogModal={handleShowLogModal} onOperationComplete={handleOperationComplete}/>,
                    title: "Docker Image Management",
                    pageKey: "image"
                },
                { 
                    label: "External Server", 
                    component: (): React.ReactElement => <ExternalServer/>,
                    title: "External Server Settings",
                    hideShowLogsButton: true,
                    pageKey: "externalServer"
                }
            ]
        }
    ], [handleShowLogModal, handleOperationComplete])

    const showContent = (title: string, component: React.ReactNode, hideShowLogsButton = false, pageKey = ''): void => {
        setCurrentTitle(title)
        setCurrentContent(component)
        setCurrentHideShowLogsButton(hideShowLogsButton)
        setCurrentPageKey(pageKey)
    }

    const handleMenuClick = (menuItem: MenuItem, index: number): void => {
        if (!state?.tabDisabled && state) {
            if (menuItem.hasSubmenu && menuItem.subItems) {
                if (menuItem.subItems.length === 1) {
                    // Single submenu - show content directly
                    const subItem = menuItem.subItems[0]
                    if (subItem) {
                        showContent(subItem.title, subItem.component(), subItem.hideShowLogsButton, subItem.pageKey)
                    }
                } else {
                    // Multiple submenus - expand/collapse
                    if (expandedMenu === index.toString()) {
                        setExpandedMenu(null)
                    } else {
                        setExpandedMenu(index.toString())
                    }
                }
            } else {
                // No submenu - show content directly
                showContent(menuItem.title || '', menuItem.component?.() || null, menuItem.hideShowLogsButton, menuItem.pageKey || '')
            }
        }
    }

    const handleSubMenuClick = (_: number, subItem: SubMenuItem): void => {
        if (!state?.tabDisabled && state) {
            showContent(subItem.title, subItem.component(), subItem.hideShowLogsButton, subItem.pageKey)
        }
    }

    const handleContextMenu = (): void => {
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
            {((): React.ReactElement => {
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
                                <div className="text-left text-sm max-h-40 overflow-y-auto">{parse((state?.logs || '').replace(/\n/g, "<br>"))}</div>
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
                                        {menuStructure.map((menu, index): React.ReactElement => (
                                            <div key={menu.label}>
                                                <div className="relative">
                                                    <SidebarItem
                                                        icon={menu.icon as React.FC<React.SVGProps<SVGSVGElement>>}
                                                        active={false}
                                                        onClick={(): void => handleMenuClick(menu, index)}
                                                        className={`${state?.tabDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} !h-12 !flex !items-center`}
                                                    >
                                                        <span className="flex-1">{menu.label}</span>
                                                    </SidebarItem>
                                                    {menu.hasSubmenu && menu.subItems && menu.subItems.length > 1 && (
                                                        <HiChevronRight 
                                                            className={`absolute right-6 top-1/2 transform -translate-y-1/2 transition-transform ${expandedMenu === index.toString() ? 'rotate-90' : ''} pointer-events-none text-gray-400`}
                                                        />
                                                    )}
                                                </div>
                                                {menu.hasSubmenu && menu.subItems && menu.subItems.length > 1 && expandedMenu === index.toString() && (
                                                    <div className="ml-6">
                                                        {menu.subItems.map((subItem): React.ReactElement => (
                                                            <SidebarItem
                                                                key={subItem.label}
                                                                active={false}
                                                                onClick={(): void => handleSubMenuClick(index, subItem)}
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
                                                    onClick={(): void => setShowLogModal(true)}
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
                                onClose={operationInProgress ? (): void => {} : handleCloseLogModal}
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
                                            onClick={operationInProgress ? (): void => {} : handleCloseLogModal}
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