import React, {useRef, useEffect, useState, useCallback} from 'react'
import { TextInput, Button } from 'flowbite-react'

import {useStateContext} from "../context"
import { cleanLogText, parseLogColors, isOperationComplete } from '../utils/logParser'

interface LogsProps {
    pageKey?: string;
}

const Logs: React.FC<LogsProps> = ({pageKey}): React.ReactElement => {
    const {state, getPageLog} = useStateContext()
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const divRef = useRef<HTMLDivElement>(null)
    const [isTextareaMode, setIsTextareaMode] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredLogs, setFilteredLogs] = useState('')
    const [searchHistory, setSearchHistory] = useState<string[]>([])
    const [showSearchHistory, setShowSearchHistory] = useState(false)
    const [showSearchPanel, setShowSearchPanel] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Get the appropriate log data based on pageKey
    const getCurrentLogs = useCallback((): string => {
        if (pageKey && getPageLog) {
            const pageLog = getPageLog(pageKey)
            const globalLog = state?.logs
            console.log('[DEBUG] getCurrentLogs - pageKey:', pageKey, 'pageLog length:', pageLog?.length || 0, 'globalLog length:', globalLog?.length || 0)
            
            // For build page, prioritize globalLog (real-time build logs) over pageLog (initial message)
            if (pageKey === 'build') {
                return globalLog || pageLog || ''
            }
            
            return pageLog || globalLog || ''
        }
        console.log('[DEBUG] getCurrentLogs - no pageKey, using global logs length:', state?.logs?.length || 0)
        return state?.logs || ''
    }, [pageKey, getPageLog, state?.logs])

    // Initialize filteredLogs when component mounts or logs change
    useEffect((): void => {
        if (!searchQuery) {
            setFilteredLogs(cleanLogText(getCurrentLogs()) || '')
        }
    }, [getCurrentLogs, searchQuery])


    // Check if processing is complete
    useEffect((): void => {
        const currentLogs = getCurrentLogs()
        if (currentLogs) {
            const isFinished = isOperationComplete(currentLogs)
            setIsProcessing(!isFinished && (state?.tabDisabled || false))
        }
    }, [getCurrentLogs, state?.tabDisabled])

    // Auto-scroll to bottom when logs update
    useEffect((): void => {
        if (isTextareaMode && textareaRef.current) {
            const textarea = textareaRef.current
            // Only auto-scroll if user is already at or near the bottom
            const isAtBottom = textarea.scrollHeight - textarea.scrollTop <= textarea.clientHeight + 50
            if (isAtBottom) {
                setTimeout((): void => {
                    textarea.scrollTop = textarea.scrollHeight
                }, 0)
            }
        } else if (!isTextareaMode && divRef.current) {
            const div = divRef.current
            // Only auto-scroll if user is already at or near the bottom
            const isAtBottom = div.scrollHeight - div.scrollTop <= div.clientHeight + 50
            if (isAtBottom) {
                setTimeout((): void => {
                    div.scrollTop = div.scrollHeight
                }, 0)
            }
        }
    }, [state?.logs, isTextareaMode, getCurrentLogs])

    // Load search history from localStorage on component mount
    useEffect((): void => {
        const savedHistory = localStorage.getItem('logSearchHistory')
        if (savedHistory) {
            try {
                setSearchHistory(JSON.parse(savedHistory))
            } catch (e) {
                console.warn('Failed to parse search history:', e)
            }
        }
    }, [])

    // Save search history to localStorage whenever it changes
    useEffect((): void => {
        if (searchHistory.length > 0) {
            localStorage.setItem('logSearchHistory', JSON.stringify(searchHistory))
        }
    }, [searchHistory])

    // Filter logs based on search query
    useEffect((): void => {
        const logContent = cleanLogText(getCurrentLogs())
        
        if (!searchQuery) {
            setFilteredLogs(logContent || '')
            return
        }

        if (!logContent) {
            setFilteredLogs('')
            return
        }

        try {
            const regex = new RegExp(searchQuery, 'gi')
            const lines = logContent.split('\n')
            const filteredLines = lines.filter((line): boolean => Boolean(line.trim() && regex.test(line)))
            setFilteredLogs(filteredLines.join('\n'))
        } catch {
            // If regex is invalid, fall back to simple string search
            const lines = logContent.split('\n')
            const filteredLines = lines.filter((line): boolean => 
                Boolean(line.trim() && line.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            setFilteredLogs(filteredLines.join('\n'))
        }
    }, [searchQuery, getCurrentLogs])

    // Handle search query change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchQuery(e.target.value)
    }

    // Handle search history selection
    const handleHistorySelect = (query: string): void => {
        setSearchQuery(query)
        setShowSearchHistory(false)
        searchInputRef.current?.focus()
    }

    // Toggle search panel
    const toggleSearchPanel = (): void => {
        const currentLogs = getCurrentLogs()
        const hasLogs = Boolean(currentLogs && cleanLogText(currentLogs).trim())
        if (!hasLogs) return
        
        setShowSearchPanel((prev): boolean => !prev)
        if (!showSearchPanel) {
            // Focus search input when opening panel
            setTimeout((): void => { searchInputRef.current?.focus() }, 100)
        }
    }

    // Check if search is available
    const isSearchAvailable = (): boolean => {
        const currentLogs = getCurrentLogs()
        return Boolean(currentLogs && cleanLogText(currentLogs).trim())
    }

    // Copy filtered logs to clipboard
    const copyFilteredLogs = async (): Promise<void> => {
        const textToCopy = searchQuery ? filteredLogs : logContent
        if (!textToCopy) return
        
        try {
            await navigator.clipboard.writeText(textToCopy)
            setCopySuccess(true)
            // Hide success message after 1 seconds
            setTimeout((): void => { setCopySuccess(false) }, 1000)
        } catch (err) {
            console.error('Failed to copy logs:', err)
        }
    }

    // Add search query to history
    const addToSearchHistory = (query: string): void => {
        if (!query.trim()) return

        const newHistory = [query, ...searchHistory.filter((item): boolean => item !== query)].slice(0, 20)
        setSearchHistory(newHistory)
    }

    // Handle Enter key in search input
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            addToSearchHistory(searchQuery)
            setShowSearchHistory(false)
        } else if (e.key === 'Escape') {
            setShowSearchHistory(false)
        }
    }

    // Clear search
    const clearSearch = (): void => {
        setSearchQuery('')
        setShowSearchHistory(false)
        searchInputRef.current?.focus()
    }

    // No need for custom context menu handler - Electron handles it
    const logContent = cleanLogText(getCurrentLogs())
    const coloredLogContent = parseLogColors(getCurrentLogs())

    return (
        <div className="w-full h-full flex flex-col">
            {!isTextareaMode ? (
                <div
                    ref={divRef}
                    onClick={(): void => { if (!isProcessing) setIsTextareaMode(true) }}
                    className={`logs-div border-0 flex-1
                    w-full font-mono text-sm bg-gray-900 text-white 
                    transition-colors overflow-y-auto overflow-x-hidden ${
                        isProcessing 
                            ? 'cursor-not-allowed opacity-75' 
                            : 'cursor-pointer hover:bg-gray-800'
                    }`}
                    style={{ 
                        padding: '16px',
                        whiteSpace: 'pre',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        maxHeight: '100%'
                    }}
                    title={isProcessing ? "Processing... Text selection will be available when complete" : "Click to enable text selection"}
                >
                    {getCurrentLogs() ? (
                        <div dangerouslySetInnerHTML={coloredLogContent} />
                    ) : (
                        <div className="text-gray-400">Logs will appear here...</div>
                    )}
                    {getCurrentLogs() && !isProcessing && (
                        <div className="text-xs text-gray-500 mt-4 text-center">
                            Click anywhere to enable text selection
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center p-2 bg-gray-800 text-gray-300">
                        <div className="flex items-center gap-3">
                            <span className="text-sm">Text selection mode</span>
                            <Button
                                color="light"
                                size="sm"
                                onClick={toggleSearchPanel}
                                className={`cursor-pointer transition-opacity ${!isSearchAvailable() ? 'cursor-not-allowed' : ''}`}
                                style={!isSearchAvailable() ? { opacity: 0.5 } : {}}
                                disabled={false}
                            >
                                Search
                            </Button>
                            <Button
                                color="light"
                                size="sm"
                                onClick={copyFilteredLogs}
                                className={`cursor-pointer transition-opacity ${!isSearchAvailable() ? 'cursor-not-allowed' : ''}`}
                                style={!isSearchAvailable() ? { opacity: 0.5 } : {}}
                                disabled={false}
                            >
                                {copySuccess ? 'Copied!' : 'Copy All'}
                            </Button>
                        </div>
                        <button
                            onClick={(): void => setIsTextareaMode(false)}
                            className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors cursor-pointer"
                        >
                            Back to view mode
                        </button>
                    </div>
                    
                    {/* Collapsible Search section */}
                    {showSearchPanel && (
                        <div className="p-3 bg-gray-700 border-b border-gray-600 relative transition-all duration-200 ease-in-out">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <TextInput
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search logs... (supports regex)"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onKeyDown={handleSearchKeyDown}
                                        onFocus={(): void => setShowSearchHistory(true)}
                                        onBlur={(): void => { setTimeout((): void => { setShowSearchHistory(false) }, 150) }}
                                        className="w-full font-mono text-sm"
                                    />
                                    
                                    {/* Search history dropdown */}
                                    {showSearchHistory && searchHistory.length > 0 && (
                                        <div 
                                            className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto"
                                        >
                                            <div className="px-3 py-1 text-xs text-gray-500 border-b border-gray-600">
                                                Recent searches
                                            </div>
                                            {searchHistory.map((historyItem, index): React.ReactElement => (
                                                <button
                                                    key={index}
                                                    onClick={(): void => handleHistorySelect(historyItem)}
                                                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 font-mono cursor-pointer border-b border-gray-700 last:border-b-0"
                                                >
                                                    {historyItem}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {searchQuery && (
                                    <Button
                                        color="light"
                                        size="sm"
                                        onClick={clearSearch}
                                        className="cursor-pointer"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                            
                            {/* Search results info */}
                            {searchQuery && (
                                <div className="mt-2 text-xs text-gray-400">
                                    {filteredLogs && filteredLogs.trim() ? 
                                        `Showing lines matching "${searchQuery}" (${filteredLogs.split('\n').filter((line): boolean => Boolean(line.trim())).length} lines)` : 
                                        'No matches found'
                                    }
                                </div>
                            )}
                        </div>
                    )}
                    
                    <textarea
                        ref={textareaRef}
                        value={searchQuery ? filteredLogs : logContent}
                        readOnly
                        className="logs-textarea border-0 focus:outline-none focus:ring-0 
                        w-full font-mono text-sm bg-gray-900 resize-none text-white flex-1"
                        style={{ 
                            whiteSpace: 'pre',
                            overflowWrap: 'normal',
                            wordBreak: 'normal',
                            fontFamily: 'ui-monospace, monospace',
                            padding: '16px',
                            letterSpacing: '0'
                        }}
                        placeholder="Logs will appear here..."
                    />
                </div>
            )}
        </div>
    )
}
export default Logs