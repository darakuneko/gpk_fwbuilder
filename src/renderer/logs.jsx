import React, {useRef, useEffect, useState} from 'react'
import {useStateContext} from "../context.jsx"
import Convert from "ansi-to-html"
import parse from 'html-react-parser'
import { TextInput, Button } from 'flowbite-react'

const convert = new Convert({ newline: true })

const Logs = () => {
    const {state} = useStateContext()
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

    // Initialize filteredLogs when component mounts or logs change
    useEffect(() => {
        if (!searchQuery) {
            setFilteredLogs(cleanLogText(state.logs) || '')
        }
    }, [state.logs, searchQuery])

    // Clean up log text for plain text display (textarea mode)
    const cleanLogText = (str) => {
        if (!str) return ''
        
        // First clean the text step by step
        let cleaned = str
            .replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI color codes
            .replace(/@@@@init@@@@/g, '')    // Remove init markers
            .replace(/@@@@finish@@@@/g, '')  // Remove finish markers
            .replace(/<span[^>]*>/g, '')     // Remove span tags
            .replace(/<\/span>/g, '')        // Remove closing span tags
            .replace(/<div[^>]*>/g, '')      // Remove div tags
            .replace(/<\/div>/g, '')         // Remove closing div tags
            .replace(/<br\s*\/?>/gi, '\n')   // Convert br tags to newlines
            .replace(/<[^>]*>/g, '')         // Remove any remaining HTML tags
            .replace(/&lt;/g, '<')           // Decode HTML entities
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')         // Convert non-breaking spaces to regular spaces
            .replace(/\n\n+/g, '\n')         // Replace multiple newlines with single
            .replace(/^\n+/g, '')            // Remove leading newlines
            .trim()
        
        // Only apply complex cleaning for build logs
        if (isBuildLog(str)) {
            cleaned = cleaned
                .replace(/,/g, '\n')             // Convert commas to newlines (from original parsing)
                .replace(/.*Compiling keymap with.*\n/g, '') // Remove compilation lines
                .replace(/\n\n+/g, '\n')         // Replace multiple newlines with single again
                .trim()
            
            // Align status indicators in columns for build logs
            return alignStatusIndicators(cleaned)
        } else {
            // For non-build logs, return cleaned text without complex formatting
            return cleaned
        }
    }

    const preQmkParse = (str) => str.replace(/\n\n/g, "\n")
        .replace(/^\n/g, "")
        .replace(/.*Compiling keymap with.*\n/, "")

    // Check if the log is a build log (contains build-specific patterns)
    const isBuildLog = (str) => {
        if (!str) return false
        
        // Build logs typically contain these patterns
        const buildPatterns = [
            /Compiling keymap/,
            /Linking:/,
            /avr-gcc/,
            /make\[/,
            /\.elf/,
            /\.hex/,
            /Size after:/,
            /bytes used/,
            /Compiling .* for .* with .* keymap/,
            /arm-none-eabi-gcc/,
            /qmk compile/,
            /QMK/
        ]
        
        return buildPatterns.some(pattern => pattern.test(str))
    }

    // Parse ANSI color codes and convert to HTML for div display
    const parseLogColors = (str) => {        
        if (!str) return { __html: 'Logs will appear here...' }

        // Only apply complex parsing for build logs
        if (isBuildLog(str)) {
            const html = convert.toHtml(
                preQmkParse(str)
                .replace(/,/g, "\n")
                .replace(/\n\n/g, "\n")
                .replace(/^\n/g, "")
                .replace(/.*Compiling keymap with.*\n/, "")
                .replace(/\n/g, "<br />"))
                .replace(/\<span style=\"color:/g, "<div style=\"float: right; color:") 
                .replace(/\<p|\<span/g, "<div")
                .replace(/\<\/p|<\/span/g, "</div")
                
            return { __html: html }
        } else {
            // For non-build logs, just convert ANSI colors and basic formatting
            const html = convert.toHtml(str)
                .replace(/\n/g, "<br />")
                
            return { __html: html }
        }
    }

    
    // Align status indicators like [OK], [WARNINGS], [ERRORS] to consistent columns
    const alignStatusIndicators = (text) => {
        if (!text) return ''
        
        const lines = text.split('\n')
        
        // First pass: find the longest line before status indicator
        let maxContentLength = 0
        lines.forEach(line => {
            const statusPattern = /^(.+?)(\s*)(\[[A-Z][A-Z0-9\s]*\])\s*$/
            const match = line.match(statusPattern)
            if (match) {
                const [, content] = match
                maxContentLength = Math.max(maxContentLength, content.length)
            }
        })
        
        // Calculate target column based on longest content, with minimum and maximum limits
        // Ensure status indicators are readable but not too far to the right
        const targetColumn = Math.min(Math.max(maxContentLength + 2, 85), 100)
        
        const alignedLines = lines.map(line => {
            // Match lines with status indicators at the end
            // Support various formats: [OK], [WARNINGS], [ERRORS], [FAILED], etc.
            const statusPattern = /^(.+?)(\s*)(\[[A-Z][A-Z0-9\s]*\])\s*$/
            const match = line.match(statusPattern)
            
            if (match) {
                const [, content, , status] = match
                const contentLength = content.length
                const paddingNeeded = Math.max(1, targetColumn - contentLength - status.length)
                return content + ' '.repeat(paddingNeeded) + status
            }
            
            return line
        })
        
        return alignedLines.join('\n')
    }

    // Check if processing is complete
    useEffect(() => {
        if (state.logs) {
            const isFinished = state.logs.includes('finish!!') || 
                              state.logs.includes('Converted!!') ||
                              state.logs.includes('Generate!!')
            setIsProcessing(!isFinished && state.tabDisabled)
        }
    }, [state.logs, state.tabDisabled])

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
        const logContent = cleanLogText(state.logs)
        
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
    }, [searchQuery, state.logs])

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
        const hasLogs = state.logs && cleanLogText(state.logs).trim()
        if (!hasLogs) return
        
        setShowSearchPanel(prev => !prev)
        if (!showSearchPanel) {
            // Focus search input when opening panel
            setTimeout(() => searchInputRef.current?.focus(), 100)
        }
    }

    // Check if search is available
    const isSearchAvailable = () => {
        return state.logs && cleanLogText(state.logs).trim()
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
    const logContent = cleanLogText(state.logs)
    const coloredLogContent = parseLogColors(state.logs)

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
                    {state.logs ? (
                        <div dangerouslySetInnerHTML={coloredLogContent} />
                    ) : (
                        <div className="text-gray-400">Logs will appear here...</div>
                    )}
                    {state.logs && !isProcessing && (
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