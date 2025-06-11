import React, {useEffect, useState, useMemo, useCallback} from 'react'
import { Sidebar, SidebarItems, SidebarItemGroup, SidebarItem, Spinner, Button } from 'flowbite-react'
import { HiCube, HiCollection, HiRefresh, HiCog, HiChevronRight, HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi'
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
    pageKey: string;
}

interface MenuItem {
    label: string;
    icon: IconType;
    component?: () => React.ReactNode;
    hasSubmenu: boolean;
    title?: string;
    pageKey?: string;
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
    const [showLogSidePeek, setShowLogSidePeek] = useState(false)
    const [operationInProgress, setOperationInProgress] = useState(false)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const SIDEBAR_WIDTH = 240

    // ウィンドウサイズ変更の監視
    useEffect((): (() => void) => {
        const handleResize = (): void => {
            setWindowWidth(window.innerWidth)
        }

        window.addEventListener('resize', handleResize)
        return (): void => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect((): void => {
        const fn = async (): Promise<void> => {
            let id: ReturnType<typeof setInterval> | undefined
            const checkFn = async (): Promise<void> => {
                const exist = await api.existSever()
                if (exist === 200 || exist === 503) {
                    if (!state) return
                    
                    // Only restore state during initial setup
                    if (initServer) {
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
                        
                        // Only load tags if QMK firmware is selected
                        if (state.build.fw === "QMK") {
                            const tags = await api.tags()
                            state.build.tags = tags
                            state.build.tag = state.build.tag || (tags.length > 0 ? tags[0]! : '')
                        } else {
                            // For non-QMK firmwares, ensure tags are empty
                            state.build.tags = []
                            state.build.tag = ''
                        }
                        state.logs = exist === 503 ? `Skipped docker check` : ""
                        void setState(state)
                    }
                    
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
    }, [setState, state, initServer])

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

    const handleShowLogSidePeek = useCallback((): void => {
        setShowLogSidePeek(true)
        setOperationInProgress(true)
    }, [])

    const handleOperationComplete = useCallback((): void => {
        setOperationInProgress(false)
    }, [])



    const menuStructure = useMemo<MenuItem[]>((): MenuItem[] => [
        { 
            label: "Build", 
            icon: HiCube,
            component: (): React.ReactElement => <Build onShowLogModal={handleShowLogSidePeek} onOperationComplete={handleOperationComplete}/>,
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
                    component: (): React.ReactElement => <GenerateKeyboardFile onShowLogModal={handleShowLogSidePeek} onOperationComplete={handleOperationComplete}/>,
                    title: "QMK Keyboard File Generation",
                    pageKey: "generateKeyboardFile"
                },
                { 
                    label: "Vial Unique ID", 
                    component: (): React.ReactElement => <GenerateVialId onShowLogModal={handleShowLogSidePeek} onOperationComplete={handleOperationComplete}/>,
                    title: "Vial Unique ID Generation",
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
                    component: (): React.ReactElement => <ConvertVialToKeymap onShowLogModal={handleShowLogSidePeek} onOperationComplete={handleOperationComplete}/>,
                    title: "Convert Vial File to Keymap.c",
                    pageKey: "convertVialToKeymap"
                },
                { 
                    label: "KLE to Keyboard File", 
                    component: (): React.ReactElement => <ConvertKleToKeyboard onShowLogModal={handleShowLogSidePeek} onOperationComplete={handleOperationComplete}/>,
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
                    component: (): React.ReactElement => <Repository onShowLogModal={handleShowLogSidePeek} onOperationComplete={handleOperationComplete}/>,
                    title: "Repository Management",
                    pageKey: "repository"
                },
                { 
                    label: "Image", 
                    component: (): React.ReactElement => <Image onShowLogModal={handleShowLogSidePeek} onOperationComplete={handleOperationComplete}/>,
                    title: "Docker Image Management",
                    pageKey: "image"
                },
                { 
                    label: "External Server", 
                    component: (): React.ReactElement => <ExternalServer/>,
                    title: "External Server Settings",
                    pageKey: "externalServer"
                }
            ]
        }
    ], [handleShowLogSidePeek, handleOperationComplete])

    const showContent = (title: string, component: React.ReactNode, pageKey = ''): void => {
        setCurrentTitle(title)
        setCurrentContent(component)
        setCurrentPageKey(pageKey)
        
        // Close logs when switching pages (only if operation is complete)
        if (!operationInProgress) {
            setShowLogSidePeek(false)
        }
    }

    const handleMenuClick = (menuItem: MenuItem, index: number): void => {
        if (!state?.tabDisabled && !operationInProgress && state) {
            if (menuItem.hasSubmenu && menuItem.subItems) {
                if (menuItem.subItems.length === 1) {
                    // Single submenu - show content directly
                    const subItem = menuItem.subItems[0]
                    if (subItem) {
                        showContent(subItem.title, subItem.component(), subItem.pageKey)
                    }
                } else {
                    // Multiple submenus - expand/collapse
                    if (expandedMenu === index.toString()) {
                        setExpandedMenu(null)
                    } else {
                        setExpandedMenu(index.toString())
                    }
                    // Close logs when clicking menu items (only if operation is complete)
                    if (!operationInProgress) {
                        setShowLogSidePeek(false)
                    }
                }
            } else {
                // No submenu - show content directly
                showContent(menuItem.title || '', menuItem.component?.() || null, menuItem.pageKey || '')
            }
        }
    }

    const handleSubMenuClick = (_: number, subItem: SubMenuItem): void => {
        if (!state?.tabDisabled && !operationInProgress && state) {
            showContent(subItem.title, subItem.component(), subItem.pageKey)
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
                            <Sidebar 
                                className="h-screen bg-gray-50 dark:bg-gray-800" 
                                style={{ width: '240px' }}
                                onClick={(): void => {
                                    // Close logs when clicking anywhere in sidebar (only if operation is complete)
                                    if (!operationInProgress) {
                                        setShowLogSidePeek(false)
                                    }
                                }}
                            >
                                <SidebarItems>
                                    <SidebarItemGroup>
                                        {menuStructure.map((menu, index): React.ReactElement => (
                                            <div key={menu.label}>
                                                <div className="relative">
                                                    <SidebarItem
                                                        icon={menu.icon as React.FC<React.SVGProps<SVGSVGElement>>}
                                                        active={false}
                                                        onClick={(): void => handleMenuClick(menu, index)}
                                                        className={`${state?.tabDisabled || operationInProgress ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} !h-12 !flex !items-center`}
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
                                                                className={`${state?.tabDisabled || operationInProgress ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-sm flex items-center h-10`}
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
                            <div 
                                className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 transition-all duration-300"
                                style={showLogSidePeek ? { width: `${(windowWidth - SIDEBAR_WIDTH)}px` } : {}}
                            >
                                {currentContent ? (
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {currentTitle}
                                            </h2>
                                            {currentPageKey !== 'externalServer' && (
                                                <Button
                                                    color="light"
                                                    className="cursor-pointer p-2"
                                                    onClick={(): void => setShowLogSidePeek(!showLogSidePeek)}
                                                    title={showLogSidePeek ? 'Hide Logs' : 'Show Logs'}
                                                >
                                                    {showLogSidePeek ? <HiChevronDoubleRight className="w-4 h-4" /> : <HiChevronDoubleLeft className="w-4 h-4" />}
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
                            
                            {/* Log Side Peek Panel */}
                            {showLogSidePeek && (
                                <div 
                                    className="fixed right-0 top-0 h-full bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 overflow-hidden z-40"
                                    style={{ width: `${(windowWidth - SIDEBAR_WIDTH - 10)}px` }}
                                >
                                    <div className="h-full flex flex-col">
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Logs</h3>
                                            <Button
                                                color="light"
                                                size="sm"
                                                className={operationInProgress ? 'cursor-not-allowed p-2' : 'cursor-pointer p-2'}
                                                style={operationInProgress ? { opacity: 0.5 } : {}}
                                                onClick={operationInProgress ? (): void => {} : (): void => setShowLogSidePeek(false)}
                                                disabled={false}
                                                title={operationInProgress ? "Cannot close during operation" : "Close Logs"}
                                            >
                                                <HiChevronDoubleRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <Logs pageKey={currentPageKey}/>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }
            })()}
        </div>
    )
}
export default Content