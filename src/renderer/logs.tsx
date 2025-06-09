import React, {useRef, useEffect, useState, useCallback} from 'react'
import {useStateContext} from "../context"
import { TextInput, Button } from 'flowbite-react'
import { cleanLogText, parseLogColors, isOperationComplete } from '../utils/logParser'

const Logs = ({pageKey}) => {
    const {state, getPageLog} = useStateContext()
    const textareaRef = useRef(null)
    const divRef = useRef(null)
    const [isTextareaMode, setIsTextareaMode] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredLogs, setFilteredLogs] = useState('')
    const [searchHistory, setSearchHistory] = useState([])
    const [showSearchHistory, setShowSearchHistory] = useState(false)
    const [showSearchPanel, setShowSearchPanel] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)
    const searchInputRef = useRef(null)

    // Get the appropriate log data based on pageKey
    const getCurrentLogs = useCallback(() => {
        if (pageKey && getPageLog) {
            return getPageLog(pageKey) || state.logs || ''
        }
        return state.logs || ''
    }, [pageKey, getPageLog, state.logs])

    // Initialize filteredLogs when component mounts or logs change
    useEffect(() => {
        if (!searchQuery) {
            setFilteredLogs(cleanLogText(getCurrentLogs()) || '')
        }
    }, [getCurrentLogs, searchQuery])


    // Check if processing is complete
    useEffect(() => {
        const currentLogs = getCurrentLogs()
        if (currentLogs) {
            const isFinished = isOperationComplete(currentLogs)
            setIsProcessing(!isFinished && state.tabDisabled)
        }
    }, [getCurrentLogs, state.tabDisabled])

    // Auto-scroll to bottom when logs update
    useEffect(() => {
        if (isTextareaMode && textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight
        } else if (!isTextareaMode && divRef.current) {
            divRef.current.scrollTop = divRef.current.scrollHeight
        }
    }, [state.logs, isTextareaMode])

    // Load search history from localStorage on component mount
    useEffect(() => {
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
    useEffect(() => {
        if (searchHistory.length > 0) {
            localStorage.setItem('logSearchHistory', JSON.stringify(searchHistory))
        }
    }, [searchHistory])

    // Filter logs based on search query
    useEffect(() => {
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
            const filteredLines = lines.filter(line => line.trim() && regex.test(line))
            setFilteredLogs(filteredLines.join('\n'))
        } catch (e) {
            // If regex is invalid, fall back to simple string search
            const lines = logContent.split('\n')
            const filteredLines = lines.filter(line => 
                line.trim() && line.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredLogs(filteredLines.join('\n'))
        }
    }, [searchQuery, getCurrentLogs])

    // Handle search query change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    // Handle search history selection
    const handleHistorySelect = (query) => {
        setSearchQuery(query)
        setShowSearchHistory(false)
        searchInputRef.current?.focus()
    }

    // Toggle search panel
    const toggleSearchPanel = () => {
        const currentLogs = getCurrentLogs()
        const hasLogs = currentLogs && cleanLogText(currentLogs).trim()
        if (!hasLogs) return
        
        setShowSearchPanel(prev => !prev)
        if (!showSearchPanel) {
            // Focus search input when opening panel
            setTimeout(() => searchInputRef.current?.focus(), 100)
        }
    }

    // Check if search is available
    const isSearchAvailable = () => {
        const currentLogs = getCurrentLogs()
        return currentLogs && cleanLogText(currentLogs).trim()
    }

    // Copy filtered logs to clipboard
    const copyFilteredLogs = async () => {
        const textToCopy = searchQuery ? filteredLogs : logContent
        if (!textToCopy) return
        
        try {
            await navigator.clipboard.writeText(textToCopy)
            setCopySuccess(true)
            // Hide success message after 1 seconds
            setTimeout(() => setCopySuccess(false), 1000)
        } catch (err) {
            console.error('Failed to copy logs:', err)
        }
    }

    // Add search query to history
    const addToSearchHistory = (query) => {
        if (!query.trim()) return

        const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 20)
        setSearchHistory(newHistory)
    }

    // Handle Enter key in search input
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            addToSearchHistory(searchQuery)
            setShowSearchHistory(false)
        } else if (e.key === 'Escape') {
            setShowSearchHistory(false)
        }
    }

    // Clear search
    const clearSearch = () => {
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
                    onClick={() => !isProcessing && setIsTextareaMode(true)}
                    className={`logs-div border-0 
                    w-full font-mono text-sm bg-gray-900 text-white 
                    transition-colors ${
                        isProcessing 
                            ? 'cursor-not-allowed opacity-75' 
                            : 'cursor-pointer hover:bg-gray-800'
                    }`}
                    style={{ 
                        height: 'calc(90dvh - 200px)',
                        minHeight: 'calc(90dvh - 200px)',
                        maxHeight: 'calc(90dvh - 200px)',
                        overflow: 'auto',
                        padding: '16px',
                        whiteSpace: 'pre',
                        overflowWrap: 'normal',
                        wordBreak: 'normal'
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
                                disabled={!isSearchAvailable()}
                            >
                                Search
                            </Button>
                            <Button
                                color="light"
                                size="sm"
                                onClick={copyFilteredLogs}
                                className={`cursor-pointer transition-opacity ${!isSearchAvailable() ? 'cursor-not-allowed' : ''}`}
                                style={!isSearchAvailable() ? { opacity: 0.5 } : {}}
                                disabled={!isSearchAvailable()}
                            >
                                {copySuccess ? 'Copied!' : 'Copy All'}
                            </Button>
                        </div>
                        <button
                            onClick={() => setIsTextareaMode(false)}
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
                                        onFocus={() => setShowSearchHistory(true)}
                                        onBlur={() => setTimeout(() => setShowSearchHistory(false), 150)}
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
                                            {searchHistory.map((historyItem, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleHistorySelect(historyItem)}
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
                                        `Showing lines matching "${searchQuery}" (${filteredLogs.split('\n').filter(line => line.trim()).length} lines)` : 
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
                        w-full font-mono text-sm bg-gray-900 resize-none p-4 text-white"
                        style={{ 
                            height: showSearchPanel ? 'calc(90dvh - 380px)' : 'calc(90dvh - 244px)',
                            minHeight: showSearchPanel ? 'calc(90dvh - 380px)' : 'calc(90dvh - 244px)',
                            maxHeight: showSearchPanel ? 'calc(90dvh - 380px)' : 'calc(90dvh - 244px)',
                            whiteSpace: 'pre',
                            overflowWrap: 'normal',
                            wordBreak: 'normal',
                            fontFamily: 'ui-monospace, monospace',
                            padding: '16px',
                            letterSpacing: '0',
                            transition: 'height 0.2s ease-in-out'
                        }}
                        placeholder="Logs will appear here..."
                    />
                </div>
            )}
        </div>
    )
}
export default Logs